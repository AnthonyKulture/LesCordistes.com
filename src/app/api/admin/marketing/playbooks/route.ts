import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/ops/guard'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { logAdminAction } from '@/lib/ops/audit'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function GET(_req: NextRequest) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    const admin = createSupabaseAdminClient() as any

    const { data, error } = await admin
        .from('marketing_playbooks')
        .select(
            `
            id, name, description, audience_type, segment_id, template_key, subject,
            preview_text, trigger_kind, cooldown_days, max_per_run, is_active,
            last_run_at, stats, created_at, updated_at,
            marketing_segments:segment_id(name),
            marketing_email_templates:template_key(name, edge_template_id)
            `
        )
        .order('is_active', { ascending: false })
        .order('name', { ascending: true })

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ playbooks: data ?? [] })
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

    const required = ['name', 'audience_type', 'segment_id', 'template_key', 'subject']
    for (const k of required) {
        if (!body?.[k] || typeof body[k] !== 'string') {
            return Response.json({ error: `${k}_required` }, { status: 400 })
        }
    }

    const admin = createSupabaseAdminClient() as any

    const { data: created, error } = await admin
        .from('marketing_playbooks')
        .insert({
            name: body.name,
            description: body.description ?? null,
            audience_type: body.audience_type,
            segment_id: body.segment_id,
            template_key: body.template_key,
            template_data: body.template_data ?? {},
            subject: body.subject,
            preview_text: body.preview_text ?? null,
            trigger_kind: body.trigger_kind ?? 'cron_daily',
            cooldown_days: typeof body.cooldown_days === 'number' ? body.cooldown_days : 0,
            max_per_run: typeof body.max_per_run === 'number' ? body.max_per_run : 200,
            is_active: false,
            created_by: guard.user.id,
        })
        .select()
        .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })

    await logAdminAction({
        action: 'marketing_playbook_created',
        target_table: 'marketing_playbooks',
        target_id: created.id,
        payload: { name: body.name, segment_id: body.segment_id, template_key: body.template_key },
        performed_by: guard.user.id,
    })

    return Response.json({ playbook: created }, { status: 201 })
}
