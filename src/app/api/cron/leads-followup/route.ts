// Cron : relance auto des leads non convertis 5 min après capture.
//
// Logique :
//   1. SELECT leads créés il y a >= 5 min avec followup_sent_at IS NULL
//   2. Pour chaque lead : vérifier s'il existe un job dans `jobs` avec le même
//      email (extrait de client_contact_info JSON) créé après le lead.
//      → si oui : marquer followup_skip = 'job_created'
//      → si non : envoyer email perso "Anthony" via send-email + admin-custom
//   3. UPDATE followup_sent_at = NOW() dans les deux cas (un seul tour)
//
// Sécurité : header `x-cron-secret` ou `?secret=` = process.env.CRON_SECRET
// Schedule : Vercel cron toutes les 5 min (cf. vercel.json)

import { createSupabaseAdminClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const FOLLOWUP_DELAY_MIN = 5
const MAX_PER_RUN = 50

const FOLLOWUP_BODY = `Bonjour {{prenom}},

Vous avez commencé à déposer un projet sur LesCordistes.com mais le formulaire n'a pas été finalisé.

Je me permets de vous écrire directement : pouvez-vous me dire en quelques mots quel est votre besoin (type de travaux, lieu, échéance) ? Je vous mets en relation avec les bons cordistes certifiés rapidement.

Vous pouvez aussi me répondre à ce mail ou m'appeler, je m'occupe du reste.

Cordialement,

Anthony Profit
+33 06 60 50 16 82
Fondateur — LesCordistes.com
anthony@lescordistes.com`

// Version sans {{prenom}} si on ne le connaît pas (pas de "Bonjour ,").
const FOLLOWUP_BODY_NO_NAME = FOLLOWUP_BODY.replace('Bonjour {{prenom}},', 'Bonjour,')

interface LeadRow {
    id: string
    email: string
    category: string | null
    city: string | null
    step_reached: number
    source: string | null
    created_at: string
}

export async function GET(req: Request) {
    const cronSecretHeader =
        req.headers.get('x-cron-secret') ?? new URL(req.url).searchParams.get('secret')
    const expected = process.env.CRON_SECRET
    if (!expected || cronSecretHeader !== expected) {
        return Response.json({ error: 'unauthorized' }, { status: 401 })
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const admin = createSupabaseAdminClient() as any

    const cutoff = new Date(Date.now() - FOLLOWUP_DELAY_MIN * 60_000).toISOString()

    const { data: leads, error: selectErr } = await admin
        .from('leads')
        .select('id, email, category, city, step_reached, source, created_at')
        .lt('created_at', cutoff)
        .is('followup_sent_at', null)
        .order('created_at', { ascending: true })
        .limit(MAX_PER_RUN)

    if (selectErr) {
        console.error('[leads-followup] select error:', selectErr.message)
        return Response.json({ error: selectErr.message }, { status: 500 })
    }

    const rows: LeadRow[] = (leads ?? []) as LeadRow[]
    const stats = { processed: 0, sent: 0, skipped_job_created: 0, failed: 0 }

    for (const lead of rows) {
        stats.processed++

        // Skip si un job a été créé avec ce mail après la capture du lead
        const { data: matchingJobs } = await admin
            .from('jobs')
            .select('id')
            .filter('client_contact_info->>email', 'ilike', lead.email)
            .gte('created_at', lead.created_at)
            .limit(1)

        if (matchingJobs && matchingJobs.length > 0) {
            stats.skipped_job_created++
            await admin
                .from('leads')
                .update({
                    followup_sent_at: new Date().toISOString(),
                    followup_status: 'skipped',
                    followup_skip_reason: 'job_created',
                })
                .eq('id', lead.id)
            continue
        }

        // Envoi via send-email + admin-custom (avec from/replyTo personnalisés)
        const body = FOLLOWUP_BODY_NO_NAME // pas de prénom dans la table leads
        const subject = lead.city
            ? `Votre projet de cordiste à ${lead.city}`
            : 'Votre projet déposé sur LesCordistes.com'

        try {
            const { error: sendErr } = await admin.functions.invoke('send-email', {
                body: {
                    to: lead.email,
                    subject,
                    templateId: 'admin-custom',
                    from: 'Anthony Profit <anthony@lescordistes.com>',
                    replyTo: 'anthony@lescordistes.com',
                    data: {
                        subject,
                        body,
                    },
                },
            })

            if (sendErr) {
                stats.failed++
                await admin
                    .from('leads')
                    .update({
                        followup_sent_at: new Date().toISOString(),
                        followup_status: 'failed',
                        followup_skip_reason: String(sendErr.message ?? sendErr).slice(0, 200),
                    })
                    .eq('id', lead.id)
            } else {
                stats.sent++
                await admin
                    .from('leads')
                    .update({
                        followup_sent_at: new Date().toISOString(),
                        followup_status: 'sent',
                    })
                    .eq('id', lead.id)
            }
        } catch (err) {
            stats.failed++
            const msg = err instanceof Error ? err.message : String(err)
            console.error('[leads-followup] send threw:', msg)
            await admin
                .from('leads')
                .update({
                    followup_sent_at: new Date().toISOString(),
                    followup_status: 'failed',
                    followup_skip_reason: msg.slice(0, 200),
                })
                .eq('id', lead.id)
        }
    }

    return Response.json({ ok: true, ...stats })
}
