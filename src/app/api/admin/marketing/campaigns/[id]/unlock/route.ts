// Débloque une campagne coincée en 'sending' (timeout Vercel pendant l'envoi).
// La repasse en 'failed' pour permettre une relance via /send (qui accepte
// 'draft' et 'failed'). Refusé si le dernier update date de moins de 15 min :
// un envoi réellement en cours rafraîchit updated_at à chaque flush de stats
// (toutes les 10 tentatives), et maxDuration=300s garantit qu'une invocation
// plus vieille que 15 min est morte.

import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/ops/guard'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { logAdminAction } from '@/lib/ops/audit'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const STUCK_THRESHOLD_MS = 15 * 60 * 1000

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function POST(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    const { id } = await params
    const admin = createSupabaseAdminClient() as any

    const { data: campaign, error: campErr } = await admin
        .from('marketing_campaigns')
        .select('id, name, status, updated_at, stats')
        .eq('id', id)
        .single()

    if (campErr || !campaign) {
        return Response.json({ error: 'not_found' }, { status: 404 })
    }
    if (campaign.status !== 'sending') {
        return Response.json(
            { error: 'not_sending', status: campaign.status },
            { status: 409 }
        )
    }

    const lastUpdate = campaign.updated_at ? Date.parse(campaign.updated_at) : 0
    const staleMs = Date.now() - lastUpdate
    if (Number.isFinite(lastUpdate) && staleMs < STUCK_THRESHOLD_MS) {
        return Response.json(
            {
                error: 'still_active',
                retry_in_seconds: Math.ceil((STUCK_THRESHOLD_MS - staleMs) / 1000),
            },
            { status: 409 }
        )
    }

    const prevStats =
        campaign.stats && typeof campaign.stats === 'object' ? campaign.stats : {}
    const { data: unlockedRows, error: updErr } = await admin
        .from('marketing_campaigns')
        .update({
            status: 'failed',
            stats: {
                ...prevStats,
                last_error: 'unlocked_by_admin (stuck in sending)',
            },
        })
        .eq('id', id)
        .eq('status', 'sending')
        .select('id')

    if (updErr) {
        return Response.json({ error: updErr.message }, { status: 500 })
    }
    if (!unlockedRows || unlockedRows.length === 0) {
        return Response.json({ error: 'not_sending' }, { status: 409 })
    }

    await logAdminAction({
        action: 'marketing_campaign_unlocked',
        target_table: 'marketing_campaigns',
        target_id: id,
        payload: { name: campaign.name, stale_seconds: Math.round(staleMs / 1000) },
        performed_by: guard.user.id,
    })

    return Response.json({ ok: true, status: 'failed' })
}
