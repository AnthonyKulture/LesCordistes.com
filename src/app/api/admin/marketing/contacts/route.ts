import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/ops/guard'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function GET(req: NextRequest) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    const url = new URL(req.url)
    const audience = url.searchParams.get('audience')

    const admin = createSupabaseAdminClient() as any

    const { count: total } = await admin
        .from('marketing_contacts')
        .select('id', { count: 'exact', head: true })

    const { count: clientsCount } = await admin
        .from('marketing_contacts')
        .select('id', { count: 'exact', head: true })
        .eq('audience_type', 'client')
        .eq('marketing_opt_in', true)
        .is('unsubscribed_at', null)

    const { count: prosCount } = await admin
        .from('marketing_contacts')
        .select('id', { count: 'exact', head: true })
        .eq('audience_type', 'pro')
        .eq('marketing_opt_in', true)
        .is('unsubscribed_at', null)

    const { count: unsubscribedCount } = await admin
        .from('marketing_contacts')
        .select('id', { count: 'exact', head: true })
        .not('unsubscribed_at', 'is', null)

    if (audience) {
        const { data, error } = await admin
            .from('marketing_contacts')
            .select('id, email, first_name, last_name, audience_type, marketing_opt_in, unsubscribed_at, created_at')
            .eq('audience_type', audience)
            .order('created_at', { ascending: false })
            .limit(200)
        if (error) return Response.json({ error: error.message }, { status: 500 })
        return Response.json({ contacts: data ?? [] })
    }

    return Response.json({
        stats: {
            total: total ?? 0,
            clients: clientsCount ?? 0,
            pros: prosCount ?? 0,
            unsubscribed: unsubscribedCount ?? 0,
        },
    })
}

// POST sans body → déclenche la RPC sync_marketing_contacts() (peuple/refresh
// la table marketing_contacts à partir de profiles).
export async function POST(req: NextRequest) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    const action = new URL(req.url).searchParams.get('action') ?? 'sync'
    const admin = createSupabaseAdminClient() as any

    if (action !== 'sync') {
        return Response.json({ error: 'unknown_action' }, { status: 400 })
    }

    const { data, error } = await admin.rpc('sync_marketing_contacts')
    if (error) {
        return Response.json({ error: error.message }, { status: 500 })
    }
    return Response.json({ ok: true, result: data })
}
