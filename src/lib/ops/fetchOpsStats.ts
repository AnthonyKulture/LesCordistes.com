/**
 * fetchOpsStats — fonction serveur directe (sans HTTP).
 *
 * Utilisée par `admin/page.tsx` (Server Component) pour pré-charger les stats,
 * et par `/api/ops/stats` pour les rafraîchissements côté client.
 *
 * Chemin nominal : UN SEUL aller-retour via le RPC `admin_dashboard_stats`
 * (migration 20260828k). L'ancien fan-out de 16 requêtes parallèles payait
 * 16 connexions simultanées vers PostgREST et un TTFB égal à la plus lente.
 *
 * Repli : si le RPC n'existe pas encore en base (migration non appliquée),
 * on retombe sur le fan-out historique — déploiement sûr dans les deux ordres.
 *
 * ⚠️ Import serveur uniquement (ne pas importer dans 'use client').
 */

import { createSupabaseAdminClient } from '@/lib/supabase-server'
import type { OpsStats, AdminAction, RecentUnlock } from '@/lib/types/ops'

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

type DashboardStatsPayload = {
    jobs: { pending: number; live: number; rejected: number; total_week: number }
    profiles: { total_pros: number; total_clients: number; new_week: number }
    credits_agg: { sum_balance: number; avg_balance: number; count_with_credits: number }
    transactions: { purchases_month: number; spends_total: number }
    leads: { total: number; step_5: number; last_week: number }
    top_cities: Array<{ city: string; count: number }>
    recent_actions: AdminAction[]
    recent_unlocks: RecentUnlock[]
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function fetchOpsStats(): Promise<OpsStats | null> {
    const admin = createSupabaseAdminClient() as any
    const weekAgo = isoWeekAgo()
    const monthAgo = isoMonthAgo()

    const { data, error } = await admin.rpc('admin_dashboard_stats', {
        p_week_ago: weekAgo,
        p_month_ago: monthAgo,
    })

    if (!error && data) {
        const s = data as DashboardStatsPayload
        return {
            jobs: {
                pending: Number(s.jobs?.pending) || 0,
                live: Number(s.jobs?.live) || 0,
                rejected: Number(s.jobs?.rejected) || 0,
                total_week: Number(s.jobs?.total_week) || 0,
            },
            profiles: {
                total_pros: Number(s.profiles?.total_pros) || 0,
                total_clients: Number(s.profiles?.total_clients) || 0,
                new_week: Number(s.profiles?.new_week) || 0,
                with_credits: Number(s.credits_agg?.count_with_credits) || 0,
            },
            credits: {
                total_sold: Math.abs(Number(s.transactions?.purchases_month) || 0),
                total_spent: Math.abs(Number(s.transactions?.spends_total) || 0),
                avg_balance: Math.round((Number(s.credits_agg?.avg_balance) || 0) * 10) / 10,
            },
            leads: {
                total: Number(s.leads?.total) || 0,
                step_5: Number(s.leads?.step_5) || 0,
                last_week: Number(s.leads?.last_week) || 0,
            },
            top_cities: (s.top_cities ?? []).map(r => ({ city: r.city, count: Number(r.count) })),
            recent_actions: s.recent_actions ?? [],
            recent_unlocks: s.recent_unlocks ?? [],
        }
    }

    console.warn(
        '[fetchOpsStats] RPC admin_dashboard_stats indisponible (migration 20260828k à appliquer ?) — repli sur le fan-out :',
        error?.message ?? 'réponse vide'
    )
    return fetchOpsStatsLegacy(admin, weekAgo, monthAgo)
}

/** Fan-out historique de 16 requêtes — conservé comme repli de transition. */
async function fetchOpsStatsLegacy(admin: any, weekAgo: string, monthAgo: string): Promise<OpsStats | null> {
    try {
        const [
            pending,
            live,
            rejected,
            totalWeek,
            pros,
            clients,
            newPros,
            creditsAgg,
            purchasesAgg,
            spendsAgg,
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
            admin.rpc('admin_credits_agg'),
            admin.rpc('admin_sum_transactions', { p_type: 'purchase', p_since: monthAgo }),
            admin.rpc('admin_sum_transactions', { p_type: 'spend', p_since: null }),
            admin.from('leads').select('id', { count: 'exact', head: true }),
            admin.from('leads').select('id', { count: 'exact', head: true }).gte('step_reached', 5),
            admin.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
            admin.rpc('admin_top_live_cities', { p_limit: 5 }),
            admin.from('admin_actions').select('*').order('created_at', { ascending: false }).limit(10),
            admin
                .from('unlocked_leads')
                .select('id, unlocked_at, pro:profiles!pro_id(id, full_name, company_name, avatar_url), job:jobs!job_id(id, title, location_city, status)')
                .order('unlocked_at', { ascending: false })
                .limit(15),
        ])

        const creditsAggData = creditsAgg.data as { sum_balance: number; avg_balance: number; count_with_credits: number } | null
        const totalSold = Math.abs(Number((purchasesAgg.data as { total_amount: number } | null)?.total_amount) || 0)
        const totalSpent = Math.abs(Number((spendsAgg.data as { total_amount: number } | null)?.total_amount) || 0)

        return {
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
                with_credits: Number(creditsAggData?.count_with_credits) || 0,
            },
            credits: {
                total_sold: totalSold,
                total_spent: totalSpent,
                avg_balance: Math.round((Number(creditsAggData?.avg_balance) || 0) * 10) / 10,
            },
            leads: {
                total: leadsTotal.count ?? 0,
                step_5: leadsStep5.count ?? 0,
                last_week: leadsWeek.count ?? 0,
            },
            top_cities: ((topCitiesQ.data ?? []) as Array<{ city: string; count: number }>).map(r => ({
                city: r.city,
                count: Number(r.count),
            })),
            recent_actions: (recentActions.data ?? []) as AdminAction[],
            recent_unlocks: (recentUnlocksQ.data ?? []) as unknown as RecentUnlock[],
        }
    } catch (err) {
        console.error('[fetchOpsStats] error:', err)
        return null
    }
}
