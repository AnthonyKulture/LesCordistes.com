import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { FRENCH_DEPARTMENTS } from '@/constants/departments'
import { signUnsubscribeToken } from '@/lib/marketing/unsubscribeToken'

const VALID_DEPT_CODES = new Set(FRENCH_DEPARTMENTS.map(d => d.code))
const DEPT_LABEL = new Map(FRENCH_DEPARTMENTS.map(d => [d.code, d.label]))
const SEO_BASE_URL = process.env.SEO_BASE_URL || 'https://www.lescordistes.com'

// Pseudo-id partagé avec pro-alerts-cron pour le token HMAC unsub.
const ALERT_CAMPAIGN_ID = 'pro-mission-alert'

function buildUnsubscribeUrl(email: string): string {
    try {
        const token = signUnsubscribeToken(email, ALERT_CAMPAIGN_ID)
        return `${SEO_BASE_URL}/marketing/unsubscribe?token=${encodeURIComponent(token)}&source=pro-alerts`
    } catch {
        // MARKETING_UNSUBSCRIBE_SECRET manquant — on tombe sur la page générique.
        return `${SEO_BASE_URL}/marketing/unsubscribe`
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}))
        const email = typeof body?.email === 'string' ? body.email.trim() : ''
        const rawDepts = Array.isArray(body?.departments) ? body.departments : []
        const source = typeof body?.source === 'string' ? body.source.slice(0, 80) : 'jobs_page'

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
        }

        const departments = Array.from(
            new Set(
                rawDepts
                    .filter((d: unknown): d is string => typeof d === 'string')
                    .map((d: string) => d.trim().toUpperCase())
                    .filter((d: string) => VALID_DEPT_CODES.has(d))
            )
        )

        if (departments.length === 0) {
            return NextResponse.json(
                { error: 'Sélectionnez au moins un département' },
                { status: 400 }
            )
        }
        if (departments.length > 20) {
            return NextResponse.json(
                { error: 'Maximum 20 départements par alerte' },
                { status: 400 }
            )
        }

        /* eslint-disable @typescript-eslint/no-explicit-any */
        const admin = createSupabaseAdminClient() as any

        const { data, error } = await admin.rpc('subscribe_pro_alert', {
            p_email: email,
            p_departments: departments,
            p_source: source,
            p_metadata: {
                ua: req.headers.get('user-agent')?.slice(0, 200) ?? null,
                ts: new Date().toISOString(),
            },
        })

        if (error) {
            console.error('[pro-alerts/subscribe] RPC error:', error.message)
            return NextResponse.json(
                { error: 'Erreur interne. Réessayez dans un instant.' },
                { status: 500 }
            )
        }

        if (!data?.ok) {
            const code = data?.error ?? 'unknown'
            const message = code === 'invalid_email'
                ? 'Email invalide'
                : code === 'no_departments'
                    ? 'Sélectionnez au moins un département'
                    : 'Inscription impossible'
            return NextResponse.json({ error: message }, { status: 400 })
        }

        // Email de confirmation — envoyé pour created/updated, JAMAIS pour
        // 'updated_but_unsubscribed' (le user reste désinscrit, on ne lui
        // envoie rien tant qu'il n'a pas explicitement opt-in à nouveau).
        if (data.action === 'created' || data.action === 'updated') {
            const finalDepts: string[] = Array.isArray(data.departments)
                ? data.departments
                : departments
            const departmentsLabel = finalDepts
                .map(code => DEPT_LABEL.get(code) ?? code)
                .join(', ')
            const unsubscribeUrl = buildUnsubscribeUrl(email.toLowerCase().trim())

            // Fire-and-forget — on ne bloque pas la réponse à l'utilisateur si
            // l'email échoue (l'inscription en base est déjà OK).
            admin.functions
                .invoke('send-email', {
                    body: {
                        to: email.toLowerCase().trim(),
                        subject: `Vos alertes missions sont actives — ${finalDepts.length} département${finalDepts.length > 1 ? 's' : ''} suivi${finalDepts.length > 1 ? 's' : ''}`,
                        templateId: 'pro-alert-confirmation',
                        data: {
                            departments: departmentsLabel,
                            departmentCount: String(finalDepts.length),
                            unsubscribeUrl,
                            unsubscribe_url: unsubscribeUrl,
                        },
                    },
                })
                .catch((err: unknown) => {
                    console.error('[pro-alerts/subscribe] confirmation email failed:', err)
                })
        }

        return NextResponse.json({
            ok: true,
            action: data.action,
            departments: data.departments,
        })
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error('[pro-alerts/subscribe] error:', msg)
        return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
    }
}
