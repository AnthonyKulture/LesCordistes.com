// Déclenche manuellement l'edge function marketing-nurture-cron pour un
// playbook donné. Authentifié admin uniquement. L'edge function vérifie
// CRON_SECRET ; côté Next.js on l'attache au header Authorization.

import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/ops/guard'
import { logAdminAction } from '@/lib/ops/audit'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 300

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function POST(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    const { id } = await params
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const cronSecret = process.env.CRON_SECRET
    if (!cronSecret) {
        return Response.json({ error: 'cron_secret_missing' }, { status: 500 })
    }

    // Vérifie l'existence du playbook avant l'invocation distante.
    const admin = createSupabaseAdminClient() as any
    const { data: pb, error: pbErr } = await admin
        .from('marketing_playbooks')
        .select('id, name, is_active')
        .eq('id', id)
        .single()
    if (pbErr || !pb) return Response.json({ error: 'not_found' }, { status: 404 })

    const url = new URL(`${supabaseUrl}/functions/v1/marketing-nurture-cron`)
    url.searchParams.set('playbook_id', id)

    let response: Response
    try {
        response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${cronSecret}`,
            },
        })
    } catch (err) {
        return Response.json(
            { error: err instanceof Error ? err.message : 'fetch_failed' },
            { status: 502 }
        )
    }

    const body = await response.json().catch(() => ({}))

    await logAdminAction({
        action: 'marketing_playbook_run_now',
        target_table: 'marketing_playbooks',
        target_id: id,
        payload: {
            name: pb.name,
            http_status: response.status,
            ran: (body as { ran?: number })?.ran ?? null,
            results: (body as { results?: unknown })?.results ?? null,
        },
        performed_by: guard.user.id,
    })

    if (!response.ok) {
        return Response.json(
            { error: (body as { error?: string })?.error ?? `HTTP ${response.status}` },
            { status: response.status }
        )
    }
    return Response.json({ ok: true, ...body })
}
