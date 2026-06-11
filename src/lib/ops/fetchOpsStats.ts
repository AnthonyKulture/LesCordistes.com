/**
 * fetchOpsStats — fonction serveur directe (sans HTTP).
 *
 * Utilisée par `admin/page.tsx` (Server Component) pour pré-charger les stats
 * avant que le client ne soit hydraté. Cela élimine le premier spinner
 * "Chargement des KPIs…" visible à chaque ouverture du dashboard.
 *
 * ⚠️ Doit rester un import serveur uniquement (ne pas importer dans 'use client').
 * Dépend des mêmes fonctions RPC que `/api/ops/stats/route.ts`.
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

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function fetchOpsStats(): Promise<OpsStats | null> {
    try {
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
        const withCredits = Number(creditsAggData?.count_with_credits) || 0
        const avgBalance = Number(creditsAggData?.avg_balance) || 0

        const topCities = ((topCitiesQ.data ?? []) as Array<{ city: string; count: number }>).map(r => ({
            city: r.city,
            count: Number(r.count),
        }))

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
    } catch (err) {
        console.error('[fetchOpsStats] error:', err)
        return null
    }
}
