import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/ops/guard'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { logAdminAction } from '@/lib/ops/audit'
import { buildUnsubscribeUrl } from '@/lib/marketing/unsubscribeToken'
import { FRENCH_DEPARTMENTS } from '@/constants/departments'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 300 // 5 min — budget pour envois batch séquentiels

/* eslint-disable @typescript-eslint/no-explicit-any */

const SEO_BASE_URL =
    process.env.NEXT_PUBLIC_SEO_BASE_URL ||
    process.env.SEO_BASE_URL ||
    'https://www.lescordistes.com'

// Resend rate-limit : 2 req/s. On reste séquentiel comme les crons (250ms).
const SEND_DELAY_MS = 250
// Plafond dur : 1000 emails × 250ms ≈ 250s, sous maxDuration. Au-delà, on tronque.
const MAX_SEND = 1000

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const VALID_DEPT = new Set(FRENCH_DEPARTMENTS.map(d => d.code))

interface Recipient {
    email: string
    name: string | null
    sources: Set<'pro' | 'alert'>
}

function sleep(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms))
}

function firstName(fullName: string | null): string | null {
    if (!fullName) return null
    const t = fullName.trim().split(/\s+/)[0]
    return t && t.length > 1 ? t : null
}

/**
 * Résout l'audience d'une zone : union dédupliquée par email de
 *   - pros inscrits dont `intervention_zones` recoupe les départements
 *   - abonnés alertes (`pro_alert_subscriptions`) actifs sur ces départements
 * moins les emails présents dans `marketing_unsubscribes` (opt-out RGPD).
 */
async function resolveRecipients(
    admin: any,
    departments: string[]
): Promise<{ recipients: Recipient[]; prosCount: number; alertsCount: number; suppressedCount: number }> {
    const [{ data: pros }, { data: alerts }] = await Promise.all([
        admin
            .from('profiles')
            .select('email, full_name, intervention_zones')
            .eq('role', 'pro')
            .overlaps('intervention_zones', departments)
            .limit(5000),
        admin
            .from('pro_alert_subscriptions')
            .select('email, departments')
            .is('unsubscribed_at', null)
            .overlaps('departments', departments)
            .limit(5000),
    ])

    const map = new Map<string, Recipient>()

    let prosCount = 0
    for (const p of (pros ?? []) as Array<{ email: string | null; full_name: string | null }>) {
        const email = (p.email ?? '').trim().toLowerCase()
        if (!EMAIL_RE.test(email)) continue
        prosCount++
        const existing = map.get(email)
        if (existing) {
            existing.sources.add('pro')
            if (!existing.name) existing.name = firstName(p.full_name)
        } else {
            map.set(email, { email, name: firstName(p.full_name), sources: new Set(['pro']) })
        }
    }

    let alertsCount = 0
    for (const a of (alerts ?? []) as Array<{ email: string | null }>) {
        const email = (a.email ?? '').trim().toLowerCase()
        if (!EMAIL_RE.test(email)) continue
        alertsCount++
        const existing = map.get(email)
        if (existing) existing.sources.add('alert')
        else map.set(email, { email, name: null, sources: new Set(['alert']) })
    }

    // Suppression RGPD — désinscrits marketing. On lit la liste (petite) et
    // on filtre en mémoire pour éviter les soucis de casse sur `.in()`.
    const { data: unsubs } = await admin
        .from('marketing_unsubscribes')
        .select('email')
        .limit(20000)
    const suppressed = new Set(
        ((unsubs ?? []) as Array<{ email: string | null }>)
            .map(u => (u.email ?? '').trim().toLowerCase())
            .filter(Boolean)
    )

    let suppressedCount = 0
    for (const email of Array.from(map.keys())) {
        if (suppressed.has(email)) {
            map.delete(email)
            suppressedCount++
        }
    }

    return {
        recipients: Array.from(map.values()),
        prosCount,
        alertsCount,
        suppressedCount,
    }
}

export async function POST(req: NextRequest) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    let body: any = {}
    try {
        body = await req.json()
    } catch {
        return Response.json({ error: 'invalid_body' }, { status: 400 })
    }

    const departments: string[] = Array.from(
        new Set(
            (Array.isArray(body?.departments) ? body.departments : [])
                .filter((d: unknown): d is string => typeof d === 'string')
                .map((d: string) => d.trim().toUpperCase())
                .filter((d: string) => VALID_DEPT.has(d))
        )
    )
    if (departments.length === 0) {
        return Response.json({ error: 'no_departments' }, { status: 400 })
    }
    if (departments.length > 30) {
        return Response.json({ error: 'too_many_departments' }, { status: 400 })
    }

    const admin = createSupabaseAdminClient() as any
    const { recipients, prosCount, alertsCount, suppressedCount } =
        await resolveRecipients(admin, departments)

    // ── Aperçu ────────────────────────────────────────────────────────────────
    const dryRun = body?.dry_run === true
    const confirm = String(body?.confirm ?? '').toLowerCase() === 'send'
    if (dryRun || !confirm) {
        return Response.json({
            preview: true,
            departments,
            total: recipients.length,
            pros_matched: prosCount,
            alerts_matched: alertsCount,
            suppressed: suppressedCount,
            both_sources: recipients.filter(r => r.sources.size > 1).length,
            capped: recipients.length > MAX_SEND,
            max_send: MAX_SEND,
            sample: recipients.slice(0, 20).map(r => r.email),
        })
    }

    // ── Envoi ─────────────────────────────────────────────────────────────────
    const subject = typeof body?.subject === 'string' ? body.subject.trim() : ''
    const message = typeof body?.body === 'string' ? body.body.trim() : ''
    if (!subject || subject.length > 200) {
        return Response.json({ error: 'invalid_subject' }, { status: 400 })
    }
    if (!message || message.length > 8000) {
        return Response.json({ error: 'invalid_message' }, { status: 400 })
    }
    const rawLink = typeof body?.link === 'string' ? body.link.trim() : ''
    const link = /^https?:\/\/[^\s"'<>]+$/i.test(rawLink) ? rawLink : ''
    const linkText =
        typeof body?.link_text === 'string' && body.link_text.trim()
            ? body.link_text.trim().slice(0, 80)
            : link
                ? 'Voir la mission'
                : ''
    const jobId = typeof body?.job_id === 'string' ? body.job_id.slice(0, 64) : null
    const campaignSlug = jobId ? `zone-mail-${jobId}` : 'zone-mail'

    if (recipients.length === 0) {
        return Response.json({ ok: true, sent: 0, failed: 0, total: 0 })
    }

    const toSend = recipients.slice(0, MAX_SEND)
    let sent = 0
    let failed = 0

    for (const rec of toSend) {
        const unsubscribeUrl = buildUnsubscribeUrl(SEO_BASE_URL, rec.email, campaignSlug)
        try {
            const { error } = await admin.functions.invoke('send-email', {
                body: {
                    to: rec.email,
                    subject,
                    templateId: 'admin-custom',
                    data: {
                        name: rec.name ?? '',
                        subject,
                        body: message,
                        ...(link ? { link, linkText } : {}),
                        unsubscribeUrl,
                        unsubscribe_url: unsubscribeUrl,
                    },
                },
            })
            if (error) {
                failed++
                console.error('[zone-mail] send failed', rec.email, error.message ?? error)
            } else {
                sent++
            }
        } catch (err) {
            failed++
            console.error('[zone-mail] send threw', rec.email, err)
        }
        await sleep(SEND_DELAY_MS)
    }

    await logAdminAction({
        action: 'zone_mail_sent',
        target_table: 'jobs',
        target_id: jobId,
        payload: {
            departments,
            subject,
            total_recipients: recipients.length,
            sent,
            failed,
            truncated: recipients.length > MAX_SEND,
            pros_matched: prosCount,
            alerts_matched: alertsCount,
        },
        performed_by: guard.user.id,
    })

    return Response.json({
        ok: true,
        sent,
        failed,
        total: recipients.length,
        truncated: recipients.length > MAX_SEND,
    })
}
