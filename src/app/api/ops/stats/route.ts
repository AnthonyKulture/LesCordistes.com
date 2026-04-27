import { requireAdmin } from '@/lib/ops/guard'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import type { OpsStats, AdminAction, RecentUnlock } from '@/lib/types/ops'

export const dynamic = 'force-dynamic'

function isoWeekAgo(): string {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    return d.toISOString()
}

function isoMonthAgo(): string {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString()
}

export async function GET() {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const admin = createSupabaseAdminClient() as any
    const weekAgo = isoWeekAgo()
    const monthAgo = isoMonthAgo()

    const [
        pending,
        live,
        rejected,
        totalWeek,
        pros,
        clients,
        newPros,
        creditsRows,
        purchases,
        spends,
        leadsTotal,
        leadsStep5,
        leadsWeek,
        topCitiesQ,
        recentActions,
        recentUnlocksQ,
    ] = await Promise.all([
        admin.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        admin.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'live'),
        admin.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
        admin.from('jobs').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
        admin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'pro'),
        admin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'client'),
        admin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'pro').gte('created_at', weekAgo),
        admin.from('credits').select('balance'),
        admin.from('credit_transactions').select('amount').eq('type', 'purchase').gte('created_at', monthAgo),
        admin.from('credit_transactions').select('amount').eq('type', 'spend'),
        admin.from('leads').select('id', { count: 'exact', head: true }),
        admin.from('leads').select('id', { count: 'exact', head: true }).gte('step_reached', 5),
        admin.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
        admin.from('jobs').select('location_city').eq('status', 'live').not('location_city', 'is', null).limit(500),
        admin.from('admin_actions').select('*').order('created_at', { ascending: false }).limit(10),
        admin
            .from('unlocked_leads')
            .select('id, unlocked_at, pro:profiles!pro_id(id, full_name, company_name, avatar_url), job:jobs!job_id(id, title, location_city, status)')
            .order('unlocked_at', { ascending: false })
            .limit(15),
    ])

    const balances: number[] = (creditsRows.data ?? []).map((c: any) => Number(c.balance) || 0)
    const totalSold = (purchases.data ?? []).reduce((acc: number, t: any) => acc + Math.abs(Number(t.amount) || 0), 0)
    const totalSpent = (spends.data ?? []).reduce((acc: number, t: any) => acc + Math.abs(Number(t.amount) || 0), 0)
    const withCredits = balances.filter(b => b > 0).length
    const avgBalance = balances.length ? balances.reduce((a, b) => a + b, 0) / balances.length : 0

    const cityCounts = new Map<string, number>()
    for (const row of (topCitiesQ.data ?? []) as Array<{ location_city: string | null }>) {
        const city = (row.location_city ?? '').trim()
        if (!city) continue
        cityCounts.set(city, (cityCounts.get(city) ?? 0) + 1)
    }
    const topCities = Array.from(cityCounts.entries())
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

    const stats: OpsStats = {
        jobs: {
            pending: pending.count ?? 0,
            live: live.count ?? 0,
            rejected: rejected.count ?? 0,
            total_week: totalWeek.count ?? 0,
        },
        profiles: {
            total_pros: pros.count ?? 0,
            total_clients: clients.count ?? 0,
            new_week: newPros.count ?? 0,
            with_credits: withCredits,
        },
        credits: {
            total_sold: totalSold,
            total_spent: totalSpent,
            avg_balance: Math.round(avgBalance * 10) / 10,
        },
        leads: {
            total: leadsTotal.count ?? 0,
            step_5: leadsStep5.count ?? 0,
            last_week: leadsWeek.count ?? 0,
        },
        top_cities: topCities,
        recent_actions: (recentActions.data ?? []) as AdminAction[],
        recent_unlocks: (recentUnlocksQ.data ?? []) as unknown as RecentUnlock[],
    }

    return Response.json(stats, {
        headers: { 'Cache-Control': 'no-store' },
    })
}
