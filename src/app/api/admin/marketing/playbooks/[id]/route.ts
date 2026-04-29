import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/ops/guard'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { logAdminAction } from '@/lib/ops/audit'

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

    const { data: playbook, error } = await admin
        .from('marketing_playbooks')
        .select('*')
        .eq('id', id)
        .single()
    if (error || !playbook) return Response.json({ error: 'not_found' }, { status: 404 })

    const [{ data: segment }, { data: template }, { data: recentRuns, count }] = await Promise.all([
        admin.from('marketing_segments').select('*').eq('id', playbook.segment_id).maybeSingle(),
        admin
            .from('marketing_email_templates')
            .select('*')
            .eq('template_key', playbook.template_key)
            .maybeSingle(),
        admin
            .from('marketing_playbook_runs')
            .select('id, email, status, skip_reason, error_message, sent_at, created_at', {
                count: 'exact',
            })
            .eq('playbook_id', id)
            .order('created_at', { ascending: false })
            .limit(50),
    ])

    return Response.json({
        playbook,
        segment: segment ?? null,
        template: template ?? null,
        runs: recentRuns ?? [],
        runs_count: count ?? 0,
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

    const allowed = [
        'name',
        'description',
        'audience_type',
        'segment_id',
        'template_key',
        'template_data',
        'subject',
        'preview_text',
        'trigger_kind',
        'cooldown_days',
        'max_per_run',
        'is_active',
    ] as const
    const patch: Record<string, unknown> = {}
    for (const k of allowed) {
        if (k in body) patch[k] = body[k]
    }
    if (Object.keys(patch).length === 0) {
        return Response.json({ error: 'no_changes' }, { status: 400 })
    }

    const admin = createSupabaseAdminClient() as any
    const { data: updated, error } = await admin
        .from('marketing_playbooks')
        .update(patch)
        .eq('id', id)
        .select()
        .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })

    if ('is_active' in patch) {
        await logAdminAction({
            action: patch.is_active ? 'marketing_playbook_activated' : 'marketing_playbook_paused',
            target_table: 'marketing_playbooks',
            target_id: id,
            payload: { name: updated.name },
            performed_by: guard.user.id,
        })
    }

    return Response.json({ playbook: updated })
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    const { id } = await params
    const admin = createSupabaseAdminClient() as any

    const { data: pb } = await admin
        .from('marketing_playbooks')
        .select('id, is_active, name')
        .eq('id', id)
        .single()
    if (!pb) return Response.json({ error: 'not_found' }, { status: 404 })
    if (pb.is_active) {
        return Response.json({ error: 'pause_before_delete' }, { status: 409 })
    }

    const { error } = await admin.from('marketing_playbooks').delete().eq('id', id)
    if (error) return Response.json({ error: error.message }, { status: 500 })

    await logAdminAction({
        action: 'marketing_playbook_deleted',
        target_table: 'marketing_playbooks',
        target_id: id,
        payload: { name: pb.name },
        performed_by: guard.user.id,
    })

    return Response.json({ ok: true })
}
