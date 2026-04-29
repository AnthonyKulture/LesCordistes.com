import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/ops/guard'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { logAdminAction } from '@/lib/ops/audit'
import type { AudienceTypeWritable } from '@/lib/marketing/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/* eslint-disable @typescript-eslint/no-explicit-any */

const ALLOWED_AUDIENCES: AudienceTypeWritable[] = ['client', 'pro', 'mixed']

export async function GET(req: NextRequest) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    const url = new URL(req.url)
    const status = url.searchParams.get('status')
    const limit = Math.min(Number(url.searchParams.get('limit') ?? 50), 200)

    const admin = createSupabaseAdminClient() as any

    let q = admin
        .from('marketing_campaigns')
        .select(
            'id, name, subject, audience_type, segment_id, template_key, status, scheduled_at, sent_at, stats, created_at, updated_at'
        )
        .order('created_at', { ascending: false })
        .limit(limit)

    if (status) q = q.eq('status', status)

    const { data, error } = await q
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ campaigns: data ?? [] })
}

export async function POST(req: NextRequest) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    let body: any
    try {
        body = await req.json()
    } catch {
        return Response.json({ error: 'invalid_json' }, { status: 400 })
    }

    const name = String(body?.name ?? '').trim()
    const subject = String(body?.subject ?? '').trim()
    const previewText = body?.preview_text
        ? String(body.preview_text).trim()
        : null
    const templateKey = String(body?.template_key ?? '').trim()
    const audienceType = String(body?.audience_type ?? '').trim() as AudienceTypeWritable
    const segmentId = body?.segment_id ? String(body.segment_id) : null
    const templateData =
        body?.template_data && typeof body.template_data === 'object'
            ? body.template_data
            : {}

    if (!name) return Response.json({ error: 'name_required' }, { status: 400 })
    if (!subject) return Response.json({ error: 'subject_required' }, { status: 400 })
    if (!templateKey) return Response.json({ error: 'template_required' }, { status: 400 })
    if (!ALLOWED_AUDIENCES.includes(audienceType)) {
        return Response.json({ error: 'invalid_audience' }, { status: 400 })
    }

    const admin = createSupabaseAdminClient() as any

    // Vérifier que le template existe et est actif.
    const { data: tpl } = await admin
        .from('marketing_email_templates')
        .select('template_key, audience_type, is_active')
        .eq('template_key', templateKey)
        .single()
    if (!tpl || !tpl.is_active) {
        return Response.json({ error: 'template_not_found' }, { status: 400 })
    }

    // Vérifier le segment si fourni.
    if (segmentId) {
        const { data: seg } = await admin
            .from('marketing_segments')
            .select('id, audience_type')
            .eq('id', segmentId)
            .single()
        if (!seg) return Response.json({ error: 'segment_not_found' }, { status: 400 })
    }

    const { data: created, error } = await admin
        .from('marketing_campaigns')
        .insert({
            name,
            subject,
            preview_text: previewText,
            template_key: templateKey,
            template_data: templateData,
            audience_type: audienceType,
            segment_id: segmentId,
            status: 'draft',
            created_by: guard.user.id,
        })
        .select()
        .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })

    await logAdminAction({
        action: 'marketing_campaign_created',
        target_table: 'marketing_campaigns',
        target_id: created.id,
        payload: { name, audience_type: audienceType, template_key: templateKey, segment_id: segmentId },
        performed_by: guard.user.id,
    })

    return Response.json({ campaign: created }, { status: 201 })
}
