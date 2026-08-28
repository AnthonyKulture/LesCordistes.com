import { requireAdmin } from '@/lib/ops/guard'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import {
    JOBS_LIST_COLUMNS,
    isAdminJobStatus,
    sanitizeSearch,
} from '@/app/admin/missions/jobsQuery'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    const url = new URL(req.url)
    const status = url.searchParams.get('status')
    const search = sanitizeSearch(url.searchParams.get('q') ?? '')
    const limit = Math.min(Number(url.searchParams.get('limit') ?? 50), 200)

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const admin = createSupabaseAdminClient() as any
    let query = admin
        .from('jobs')
        .select(JOBS_LIST_COLUMNS)
        .order('created_at', { ascending: false })
        .limit(limit)

    if (isAdminJobStatus(status)) {
        query = query.eq('status', status)
    }
    if (search) {
        query = query.or(`title.ilike.%${search}%,location_city.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data, error } = await query
    if (error) return Response.json({ error: error.message }, { status: 500 })
    // Données admin authentifiées : jamais de cache partagé (edge/CDN)
    return Response.json({ jobs: data ?? [] }, { headers: { 'Cache-Control': 'private, no-store' } })
}
