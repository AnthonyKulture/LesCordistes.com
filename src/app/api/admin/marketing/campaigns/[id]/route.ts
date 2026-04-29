import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/ops/guard'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/* eslint-disable @typescript-eslint/no-explicit-any */

interface Ctx {
    params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: Ctx) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    const { id } = await params
    const admin = createSupabaseAdminClient() as any

    const { data: campaign, error } = await admin
        .from('marketing_campaigns')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !campaign) {
        return Response.json({ error: 'not_found' }, { status: 404 })
    }

    const [{ data: tpl }, { data: segment }, { data: recipients, count }] = await Promise.all([
        admin.from('marketing_email_templates').select('*').eq('template_key', campaign.template_key).maybeSingle(),
        campaign.segment_id
            ? admin.from('marketing_segments').select('*').eq('id', campaign.segment_id).maybeSingle()
            : Promise.resolve({ data: null }),
        admin
            .from('marketing_campaign_recipients')
            .select('id, email, status, skip_reason, sent_at, error_message, resend_email_id', { count: 'exact' })
            .eq('campaign_id', id)
            .order('created_at', { ascending: false })
            .limit(100),
    ])

    return Response.json({
        campaign,
        template: tpl ?? null,
        segment: segment ?? null,
        recipients: recipients ?? [],
        recipients_count: count ?? 0,
    })
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    const { id } = await params
    let body: any
    try {
        body = await req.json()
    } catch {
        return Response.json({ error: 'invalid_json' }, { status: 400 })
    }

    const admin = createSupabaseAdminClient() as any
    const { data: campaign } = await admin
        .from('marketing_campaigns')
        .select('id, status')
        .eq('id', id)
        .single()

    if (!campaign) return Response.json({ error: 'not_found' }, { status: 404 })
    if (campaign.status === 'sending' || campaign.status === 'sent') {
        return Response.json({ error: 'campaign_locked' }, { status: 409 })
    }

    const allowedFields = [
        'name',
        'subject',
        'preview_text',
        'template_key',
        'template_data',
        'audience_type',
        'segment_id',
    ] as const
    const patch: Record<string, unknown> = {}
    for (const k of allowedFields) {
        if (k in body) patch[k] = body[k]
    }

    if (Object.keys(patch).length === 0) {
        return Response.json({ error: 'no_changes' }, { status: 400 })
    }

    const { data: updated, error } = await admin
        .from('marketing_campaigns')
        .update(patch)
        .eq('id', id)
        .select()
        .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ campaign: updated })
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    const { id } = await params
    const admin = createSupabaseAdminClient() as any

    const { data: campaign } = await admin
        .from('marketing_campaigns')
        .select('id, status')
        .eq('id', id)
        .single()
    if (!campaign) return Response.json({ error: 'not_found' }, { status: 404 })
    if (campaign.status !== 'draft') {
        return Response.json({ error: 'campaign_locked' }, { status: 409 })
    }

    const { error } = await admin.from('marketing_campaigns').delete().eq('id', id)
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ ok: true })
}
