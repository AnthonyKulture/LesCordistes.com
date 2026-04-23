'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Briefcase, Users, CreditCard, Mail, AlertTriangle, MapPin } from 'lucide-react'
import type { OpsStats } from '@/lib/types/ops'

type Props = {
    initial?: OpsStats | null
}

function MetricCard({
    label,
    value,
    sub,
    icon: Icon,
    href,
    accent,
}: {
    label: string
    value: number | string
    sub?: string
    icon: React.ComponentType<{ className?: string }>
    href?: string
    accent?: 'amber' | 'emerald' | 'blue' | 'red' | 'slate'
}) {
    const accentMap: Record<string, string> = {
        amber: 'text-amber-600 bg-amber-50',
        emerald: 'text-emerald-600 bg-emerald-50',
        blue: 'text-[#243355] bg-blue-50',
        red: 'text-red-600 bg-red-50',
        slate: 'text-slate-600 bg-slate-100',
    }
    const a = accent ?? 'slate'
    const card = (
        <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</span>
                <span className={`p-1.5 rounded-lg ${accentMap[a]}`}>
                    <Icon className="h-3.5 w-3.5" />
                </span>
            </div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">{value}</div>
            {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
        </div>
    )
    return href ? <Link href={href}>{card}</Link> : card
}

export function StatsGrid({ initial }: Props) {
    const [stats, setStats] = useState<OpsStats | null>(initial ?? null)
    const [loading, setLoading] = useState(!initial)

    useEffect(() => {
        if (initial) return
        let cancelled = false
        ;(async () => {
            try {
                const res = await fetch('/api/ops/stats', { cache: 'no-store' })
                if (!res.ok) throw new Error(String(res.status))
                const json = (await res.json()) as OpsStats
                if (!cancelled) setStats(json)
            } catch (err) {
                console.error('[stats] fetch failed', err)
            } finally {
                if (!cancelled) setLoading(false)
            }
        })()
        return () => {
            cancelled = true
        }
    }, [initial])

    if (loading) return <div className="text-sm text-slate-500">Chargement des KPIs…</div>
    if (!stats) return <div className="text-sm text-red-600">Impossible de charger les stats.</div>

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <MetricCard
                    label="Missions en attente"
                    value={stats.jobs.pending}
                    sub={`${stats.jobs.total_week} créées sur 7 j`}
                    icon={AlertTriangle}
                    accent="amber"
                    href="/admin/missions?status=pending"
                />
                <MetricCard
                    label="Missions live"
                    value={stats.jobs.live}
                    sub={`${stats.jobs.rejected} rejetées (cumul)`}
                    icon={Briefcase}
                    accent="emerald"
                    href="/admin/missions?status=live"
                />
                <MetricCard
                    label="Pros inscrits"
                    value={stats.profiles.total_pros}
                    sub={`+${stats.profiles.new_week} cette semaine`}
                    icon={Users}
                    accent="blue"
                    href="/admin/profils?role=pro"
                />
                <MetricCard
                    label="Pros avec crédits"
                    value={stats.profiles.with_credits}
                    sub={`solde moyen ${stats.credits.avg_balance}`}
                    icon={CreditCard}
                    accent="emerald"
                />
                <MetricCard
                    label="Crédits vendus 30 j"
                    value={stats.credits.total_sold}
                    icon={CreditCard}
                    accent="emerald"
                />
                <MetricCard
                    label="Crédits dépensés (cumul)"
                    value={stats.credits.total_spent}
                    icon={CreditCard}
                    accent="slate"
                />
                <MetricCard
                    label="Leads funnel total"
                    value={stats.leads.total}
                    sub={`${stats.leads.step_5} complets · ${stats.leads.last_week} cette semaine`}
                    icon={Mail}
                    accent="blue"
                />
                <MetricCard
                    label="Clients inscrits"
                    value={stats.profiles.total_clients}
                    icon={Users}
                    accent="slate"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <MapPin className="h-4 w-4 text-[#243355]" />
                        <h3 className="font-semibold text-sm">Top villes (missions live)</h3>
                    </div>
                    {stats.top_cities.length === 0 ? (
                        <p className="text-sm text-slate-500">Aucune ville encore.</p>
                    ) : (
                        <ul className="space-y-1.5">
                            {stats.top_cities.map(c => (
                                <li key={c.city} className="flex items-center justify-between text-sm">
                                    <span className="text-slate-700">{c.city}</span>
                                    <span className="font-mono tabular-nums text-slate-500">{c.count}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <h3 className="font-semibold text-sm mb-3">Dernières actions admin</h3>
                    {stats.recent_actions.length === 0 ? (
                        <p className="text-sm text-slate-500">Aucune action enregistrée.</p>
                    ) : (
                        <ul className="space-y-2">
                            {stats.recent_actions.slice(0, 8).map(a => (
                                <li key={a.id} className="text-xs flex items-center justify-between gap-2">
                                    <span className="font-mono text-slate-700 truncate">{a.action}</span>
                                    <span className="text-slate-400 whitespace-nowrap">
                                        {new Date(a.created_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    )
}
