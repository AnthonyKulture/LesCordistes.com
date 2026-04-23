import { requireAdmin } from '@/lib/ops/guard'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

const ALLOWED_ROLES = ['client', 'pro', 'admin'] as const
type Role = typeof ALLOWED_ROLES[number]

export async function GET(req: Request) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    const url = new URL(req.url)
    const role = url.searchParams.get('role')
    const search = url.searchParams.get('q')?.trim()
    const limit = Math.min(Number(url.searchParams.get('limit') ?? 100), 300)

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const admin = createSupabaseAdminClient() as any
    let query = admin
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

    if (role && (ALLOWED_ROLES as readonly string[]).includes(role)) {
        query = query.eq('role', role as Role)
    }
    if (search) {
        query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%,company_name.ilike.%${search}%`)
    }

    const { data: profiles, error } = await query
    if (error) return Response.json({ error: error.message }, { status: 500 })

    const profilesArr = (profiles ?? []) as Array<{ id: string; [k: string]: unknown }>
    const ids = profilesArr.map(p => p.id)
    let creditsMap = new Map<string, number>()
    if (ids.length > 0) {
        const { data: credits } = await admin.from('credits').select('pro_id, balance').in('pro_id', ids)
        creditsMap = new Map(((credits ?? []) as Array<{ pro_id: string; balance: number }>).map(c => [c.pro_id, Number(c.balance) || 0]))
    }

    const enriched = profilesArr.map(p => ({
        ...p,
        credits_balance: creditsMap.get(p.id) ?? 0,
    }))

    return Response.json({ users: enriched }, { headers: { 'Cache-Control': 'no-store' } })
}
