import { requireAdmin } from '@/lib/ops/guard'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

const ALLOWED_STATUSES = ['pending', 'live', 'rejected', 'completed', 'cancelled', 'expired'] as const
type JobStatus = typeof ALLOWED_STATUSES[number]

export async function GET(req: Request) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    const url = new URL(req.url)
    const status = url.searchParams.get('status')
    const search = url.searchParams.get('q')?.trim()
    const limit = Math.min(Number(url.searchParams.get('limit') ?? 50), 200)

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const admin = createSupabaseAdminClient() as any
    let query = admin
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

    if (status && (ALLOWED_STATUSES as readonly string[]).includes(status)) {
        query = query.eq('status', status as JobStatus)
    }
    if (search) {
        query = query.or(`title.ilike.%${search}%,location_city.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data, error } = await query
    if (error) return Response.json({ error: error.message }, { status: 500 })
    // ✅ Phase 3: cache 10s pour éviter de recharger le DB à chaque changement d'onglet
    return Response.json({ jobs: data ?? [] }, { headers: { 'Cache-Control': 's-maxage=10, stale-while-revalidate=30' } })
}
