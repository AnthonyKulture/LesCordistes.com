import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/ops/guard'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { logAdminAction } from '@/lib/ops/audit'
import { sendMarketingEmail } from '@/lib/marketing/sendMarketingEmail'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 300 // 5 min — budget pour envois batch

/* eslint-disable @typescript-eslint/no-explicit-any */

// Resend rate-limit : 2 req/s par défaut. On reste séquentiel comme les crons
// (marketing-nurture-cron, pro-alerts-cron) — un envoi parallèle de 25 a déjà
// fait sauter ~75% des emails d'une campagne (avril 2026).
const SEND_DELAY_MS = 250
const STATS_FLUSH_EVERY = 10 // persiste les stats toutes les N tentatives

interface SegmentContact {
    contact_id: string
    email: string
    first_name: string | null
    last_name: string | null
    audience_type: string
}

function sleep(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms))
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    const { id } = await params
    let body: any = {}
    try {
        body = await req.json()
    } catch {
        // body optionnel
    }
    const confirm = String(body?.confirm ?? '').toLowerCase() === 'send'
    const dryRun = body?.dry_run === true
    const excludedFromBody: string[] = Array.isArray(body?.excluded_contact_ids)
        ? body.excluded_contact_ids
              .filter((v: unknown): v is string => typeof v === 'string' && v.length > 0)
              .slice(0, 10000)
        : []

    const admin = createSupabaseAdminClient() as any

    const { data: campaign, error: campErr } = await admin
        .from('marketing_campaigns')
        .select('*')
        .eq('id', id)
        .single()

    if (campErr || !campaign) {
        return Response.json({ error: 'not_found' }, { status: 404 })
    }
    if (!campaign.subject || !campaign.template_key) {
        return Response.json({ error: 'campaign_incomplete' }, { status: 400 })
    }
    if (campaign.status !== 'draft' && campaign.status !== 'failed') {
        return Response.json(
            { error: 'campaign_already_processed', status: campaign.status },
            { status: 409 }
        )
    }
    if (!campaign.segment_id) {
        return Response.json({ error: 'segment_required' }, { status: 400 })
    }

    const { data: tpl } = await admin
        .from('marketing_email_templates')
        .select('edge_template_id, is_active')
        .eq('template_key', campaign.template_key)
        .single()
    if (!tpl || !tpl.is_active) {
        return Response.json({ error: 'template_not_found' }, { status: 400 })
    }

    // Récupérer les destinataires.
    const { data: segData, error: segErr } = await admin.rpc('resolve_segment_contacts', {
        p_segment_id: campaign.segment_id,
    })
    if (segErr) {
        return Response.json({ error: segErr.message }, { status: 500 })
    }
    const allRecipients = (segData ?? []) as SegmentContact[]

    // Exclusions : union des IDs déjà persistés sur la campagne + ceux postés dans cette requête.
    // L'UI peut soit relire `excluded_contact_ids` du draft, soit les renvoyer à chaque preview/send.
    const persistedExclusions: string[] = Array.isArray(campaign.excluded_contact_ids)
        ? campaign.excluded_contact_ids
        : []
    const excludedSet = new Set<string>([...persistedExclusions, ...excludedFromBody])
    const recipients = allRecipients.filter(r => !excludedSet.has(r.contact_id))

    // En dry-run : retourne la liste complète des destinataires (l'UI peut afficher des cases à cocher).
    if (dryRun || !confirm) {
        return Response.json({
            preview: true,
            campaign: {
                id: campaign.id,
                name: campaign.name,
                subject: campaign.subject,
                audience_type: campaign.audience_type,
                segment_id: campaign.segment_id,
                template_key: campaign.template_key,
            },
            total_in_segment: allRecipients.length,
            excluded_count: allRecipients.length - recipients.length,
            recipients_count: recipients.length,
            // Liste complète, pour cases à cocher côté UI. Cap à 1000 pour éviter les payloads géants.
            recipients: allRecipients.slice(0, 1000).map(r => ({
                contact_id: r.contact_id,
                email: r.email,
                first_name: r.first_name,
                last_name: r.last_name,
                excluded: excludedSet.has(r.contact_id),
            })),
            // Conservé pour rétrocompat (clients existants qui lisent juste `sample`).
            sample: recipients.slice(0, 5).map(r => ({ email: r.email, first_name: r.first_name })),
            requires_confirm: !confirm,
        })
    }

    // ENVOI RÉEL — on passe en sending et on persiste la liste finale d'exclusions.
    const { error: lockErr } = await admin
        .from('marketing_campaigns')
        .update({
            status: 'sending',
            sending_started_at: new Date().toISOString(),
            excluded_contact_ids: Array.from(excludedSet),
            stats: { targeted: recipients.length, sent: 0, failed: 0, skipped: 0 },
        })
        .eq('id', id)
        .eq('status', campaign.status) // garde anti-double-send

    if (lockErr) {
        return Response.json({ error: 'lock_failed', message: lockErr.message }, { status: 500 })
    }

    let sent = 0
    let failed = 0
    let skipped = 0
    let lastError: string | undefined

    for (let i = 0; i < recipients.length; i++) {
        const r = recipients[i]
        try {
            const res = await sendMarketingEmail({
                to: r.email,
                firstName: r.first_name,
                lastName: r.last_name,
                subject: campaign.subject,
                previewText: campaign.preview_text,
                edgeTemplateId: tpl.edge_template_id,
                templateData: {
                    ...(campaign.template_data ?? {}),
                    campaignName: campaign.name,
                },
                campaignId: campaign.id,
                contactId: r.contact_id,
                performedBy: guard.user.id,
            })
            if (res.status === 'sent') sent++
            else if (res.status === 'failed') {
                failed++
                if (res.error) lastError = res.error
            } else if (res.status === 'skipped') skipped++
        } catch (err) {
            failed++
            lastError = err instanceof Error ? err.message : String(err)
        }

        // Persiste les stats périodiquement (et sur le dernier).
        if ((i + 1) % STATS_FLUSH_EVERY === 0 || i === recipients.length - 1) {
            await admin
                .from('marketing_campaigns')
                .update({
                    stats: {
                        targeted: recipients.length,
                        sent,
                        failed,
                        skipped,
                        last_error: lastError ?? null,
                    },
                })
                .eq('id', id)
        }

        if (i < recipients.length - 1) {
            await sleep(SEND_DELAY_MS)
        }
    }

    const finalStatus = failed > 0 && sent === 0 ? 'failed' : 'sent'
    await admin
        .from('marketing_campaigns')
        .update({
            status: finalStatus,
            sent_at: new Date().toISOString(),
            stats: {
                targeted: recipients.length,
                sent,
                failed,
                skipped,
                last_error: lastError ?? null,
            },
        })
        .eq('id', id)

    await logAdminAction({
        action: 'marketing_campaign_sent',
        target_table: 'marketing_campaigns',
        target_id: id,
        payload: {
            name: campaign.name,
            targeted: recipients.length,
            excluded: excludedSet.size,
            sent,
            failed,
            skipped,
            template: campaign.template_key,
        },
        performed_by: guard.user.id,
    })

    return Response.json({
        ok: true,
        targeted: recipients.length,
        sent,
        failed,
        skipped,
        status: finalStatus,
    })
}
