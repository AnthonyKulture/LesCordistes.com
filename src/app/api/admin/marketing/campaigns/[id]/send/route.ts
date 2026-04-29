import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/ops/guard'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { logAdminAction } from '@/lib/ops/audit'
import { sendMarketingEmail } from '@/lib/marketing/sendMarketingEmail'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 300 // 5 min — budget pour envois batch

/* eslint-disable @typescript-eslint/no-explicit-any */

const BATCH_SIZE = 25
const BATCH_DELAY_MS = 200 // limite douce pour éviter rate-limit Resend

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
    const recipients = (segData ?? []) as SegmentContact[]

    // En dry-run : retourne juste le diagnostic.
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
            recipients_count: recipients.length,
            sample: recipients.slice(0, 5).map(r => ({ email: r.email, first_name: r.first_name })),
            requires_confirm: !confirm,
        })
    }

    // ENVOI RÉEL — on passe en sending.
    const { error: lockErr } = await admin
        .from('marketing_campaigns')
        .update({
            status: 'sending',
            sending_started_at: new Date().toISOString(),
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

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
        const batch = recipients.slice(i, i + BATCH_SIZE)
        const results = await Promise.allSettled(
            batch.map(r =>
                sendMarketingEmail({
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
            )
        )
        for (const r of results) {
            if (r.status === 'rejected') {
                failed++
                lastError = String(r.reason)
                continue
            }
            if (r.value.status === 'sent') sent++
            else if (r.value.status === 'failed') {
                failed++
                if (r.value.error) lastError = r.value.error
            } else if (r.value.status === 'skipped') skipped++
        }

        // Persiste les stats au fur et à mesure.
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

        if (i + BATCH_SIZE < recipients.length) {
            await sleep(BATCH_DELAY_MS)
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
