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
    console.log('[run-now] entered POST handler')
    const guard = await requireAdmin()
    if (!guard.ok) {
        console.log('[run-now] requireAdmin failed → returning its response')
        return guard.response
    }
    console.log('[run-now] requireAdmin OK, user:', guard.user.id)

    const { id } = await params
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const cronSecret = process.env.CRON_SECRET
    console.log('[run-now] CRON_SECRET defined:', !!cronSecret, 'len:', cronSecret?.length ?? 0)
    if (!cronSecret) {
        return Response.json(
            {
                error: 'cron_secret_missing',
                hint: 'CRON_SECRET env var manquante côté Vercel. Ajoute-la et redéploie.',
            },
            { status: 500 }
        )
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
        const edgeError = (body as { error?: string; expected_len?: number; received_len?: number })?.error
        if (response.status === 401) {
            const edgeBody = body as {
                error?: string
                expected_len?: number
                received_len?: number
                has_authorization?: boolean
            }
            return Response.json(
                {
                    error: 'edge_unauthorized',
                    hint: 'CRON_SECRET côté Vercel ≠ côté Supabase. Voir details ci-dessous.',
                    details: {
                        vercel_cron_secret_len: cronSecret.length,
                        edge_expected_len: edgeBody.expected_len ?? null,
                        edge_received_len: edgeBody.received_len ?? null,
                        edge_has_authorization_header: edgeBody.has_authorization ?? null,
                        edge_error: edgeBody.error ?? null,
                    },
                },
                { status: 502 }
            )
        }
        return Response.json(
            { error: edgeError ?? `HTTP ${response.status}`, edge_status: response.status },
            { status: 502 }
        )
    }
    return Response.json({ ok: true, ...body })
}
