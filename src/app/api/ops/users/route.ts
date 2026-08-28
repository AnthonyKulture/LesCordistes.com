import { requireAdmin } from '@/lib/ops/guard'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import {
    USERS_LIST_COLUMNS,
    isAdminRole,
    sanitizeSearch,
    withCreditsBalance,
} from '@/app/admin/profils/profilesQuery'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    const url = new URL(req.url)
    const role = url.searchParams.get('role')
    const search = sanitizeSearch(url.searchParams.get('q') ?? '')
    const limit = Math.min(Number(url.searchParams.get('limit') ?? 100), 300)

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const admin = createSupabaseAdminClient() as any
    let query = admin
        .from('profiles')
        .select(USERS_LIST_COLUMNS)
        .order('created_at', { ascending: false })
        .limit(limit)

    if (isAdminRole(role)) {
        query = query.eq('role', role)
    }
    if (search) {
        query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%,company_name.ilike.%${search}%`)
    }

    const { data: profiles, error } = await query
    if (error) return Response.json({ error: error.message }, { status: 500 })

    const enriched = await withCreditsBalance(
        admin,
        (profiles ?? []) as Array<{ id: string; [k: string]: unknown }>,
        role
    )

    // Données admin authentifiées : jamais de cache partagé (edge/CDN)
    return Response.json({ users: enriched }, { headers: { 'Cache-Control': 'private, no-store' } })
}
