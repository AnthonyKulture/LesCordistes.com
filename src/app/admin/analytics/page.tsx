import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { isCurrentUserAdmin } from '@/lib/ops/guard'
import { fetchAnalytics, isAnalyticsRange } from '@/lib/ops/fetchAnalytics'
import type { AnalyticsData, AnalyticsRange } from '@/lib/types/ops'
import { LineChart } from '@/components/admin/charts/LineChart'
import { BarChart } from '@/components/admin/charts/BarChart'

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'Analytics · Admin',
}

const RANGE_OPTIONS: { value: AnalyticsRange; label: string; periodLabel: string }[] = [
    { value: '30d', label: '30 j', periodLabel: '30 derniers jours' },
    { value: '90d', label: '90 j', periodLabel: '90 derniers jours' },
    { value: '12m', label: '12 m', periodLabel: '12 derniers mois' },
]

const nf0 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 })

const fmtInt = (v: number) => nf0.format(v)
const fmtEuro = (v: number | null) => (v === null ? '—' : `${nf0.format(v)} €`)
const fmtPct = (r: number | null) => (r === null ? '—' : `${nf0.format(r * 100)} %`)
const fmtHours = (h: number | null) => (h === null ? '—' : `${nf1.format(h)} h`)
const fmtAvg = (v: number | null) => (v === null ? '—' : nf1.format(v))

function relativeDelta(cur: number | null, prev: number | null): number | null {
    if (cur === null || prev === null || prev === 0) return null
    return ((cur - prev) / Math.abs(prev)) * 100
}

function Delta({ pct }: { pct: number | null }) {
    if (pct === null) {
        return <div className="mt-1.5 text-xs text-slate-400">— vs période préc.</div>
    }
    const rounded = Math.round(pct)
    if (rounded === 0) {
        return (
            <div className="mt-1.5 flex items-center gap-1 text-xs text-slate-500">
                <Minus className="h-3 w-3" aria-hidden="true" />
                <span>stable vs période préc.</span>
            </div>
        )
    }
    const up = rounded > 0
    const Icon = up ? ArrowUpRight : ArrowDownRight
    return (
        <div className="mt-1.5 flex items-center gap-1 text-xs font-medium" style={{ color: up ? '#2E6B4A' : '#B23A26' }}>
            <Icon className="h-3 w-3" aria-hidden="true" />
            <span>
                {up ? '+' : ''}
                {nf0.format(rounded)} % vs période préc.
            </span>
        </div>
    )
}

function Tile({
    label,
    value,
    sub,
    badge,
    delta,
}: {
    label: string
    value: string
    sub?: string
    badge?: string
    delta?: number | null
}) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</span>
                {badge && (
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                        {badge}
                    </span>
                )}
            </div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">{value}</div>
            {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
            {delta !== undefined && <Delta pct={delta} />}
        </div>
    )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return <h2 className="text-sm font-semibold text-slate-900 mb-3">{children}</h2>
}

function RangeSelector({ active }: { active: AnalyticsRange }) {
    return (
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5" role="group" aria-label="Période">
            {RANGE_OPTIONS.map(opt => (
                <Link
                    key={opt.value}
                    href={`/admin/analytics?range=${opt.value}`}
                    aria-current={opt.value === active ? 'page' : undefined}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        opt.value === active ? 'bg-[#243355] text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                    {opt.label}
                </Link>
            ))}
        </div>
    )
}

function MigrationNotice() {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
            <h2 className="text-base font-semibold text-slate-900">Analytics indisponibles</h2>
            <p className="mt-2 text-sm text-slate-500 max-w-lg mx-auto">
                Les fonctions SQL de cet écran ne sont pas encore en base. Appliquer la migration{' '}
                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">
                    supabase/migrations/20260901b-analytics-overview.sql
                </code>{' '}
                dans le SQL Editor Supabase, puis recharger cette page.
            </p>
        </div>
    )
}

function AnalyticsContent({ data }: { data: AnalyticsData }) {
    const { current: cur, previous: prev, all_time: allTime } = data.overview

    const revenueSeries = data.series.map(p => ({ month: p.month, value: p.revenue_eur }))
    const missionsSeries = data.series.map(p => ({ month: p.month, value: p.missions_published }))

    return (
        <div className="space-y-8">
            <section aria-label="Revenus">
                <SectionTitle>Revenus</SectionTitle>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <Tile
                        label="Revenus"
                        value={fmtEuro(cur.revenue_eur)}
                        sub={`${fmtInt(cur.purchases)} achats · ${fmtInt(cur.buyers)} acheteurs`}
                        badge="proxy packs"
                        delta={relativeDelta(cur.revenue_eur, prev.revenue_eur)}
                    />
                    <Tile
                        label="ARPU payant"
                        value={fmtEuro(cur.arpu_eur)}
                        sub={cur.arpu_eur === null ? 'aucun acheteur sur la période' : 'revenu moyen par acheteur'}
                        badge="proxy packs"
                        delta={relativeDelta(cur.arpu_eur, prev.arpu_eur)}
                    />
                    <Tile
                        label="Taux de rachat"
                        value={fmtPct(allTime.repeat_rate)}
                        sub={
                            allTime.buyers_total === 0
                                ? 'aucun acheteur Stripe à ce jour'
                                : `${fmtInt(allTime.repeat_buyers)}/${fmtInt(allTime.buyers_total)} acheteurs à ≥ 2 achats · cumul`
                        }
                    />
                    <Tile
                        label="Revenu / mission"
                        value={fmtEuro(cur.revenue_per_mission_eur)}
                        sub={
                            cur.missions_moderated === 0
                                ? 'aucune mission modérée sur la période'
                                : `${fmtInt(cur.missions_moderated)} missions modérées`
                        }
                        badge="proxy packs"
                        delta={relativeDelta(cur.revenue_per_mission_eur, prev.revenue_per_mission_eur)}
                    />
                </div>
            </section>

            <section aria-label="Liquidité">
                <SectionTitle>Liquidité du marché</SectionTitle>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <Tile
                        label="Missions débloquées"
                        value={fmtPct(cur.liquidity.pct_unlocked)}
                        sub={
                            cur.liquidity.cohort === 0
                                ? 'aucune mission modérée sur la période'
                                : `cohorte de ${fmtInt(cur.liquidity.cohort)} missions modérées`
                        }
                    />
                    <Tile
                        label="Médiane 1er déblocage"
                        value={fmtHours(cur.liquidity.median_hours_to_first_unlock)}
                        sub={
                            cur.liquidity.median_hours_to_first_unlock === null
                                ? 'aucun déblocage sur la cohorte'
                                : 'de la modération au 1er déblocage'
                        }
                    />
                    <Tile
                        label="Déblocages / mission"
                        value={fmtAvg(cur.liquidity.avg_unlocks_per_mission)}
                        sub="moyenne sur la cohorte"
                    />
                    <Tile
                        label="Expirées sans déblocage"
                        value={fmtPct(cur.liquidity.pct_expired_no_unlock)}
                        sub="jamais débloquées avant expiration"
                    />
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section aria-label="Offre">
                    <SectionTitle>Offre (pros)</SectionTitle>
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                        <Tile label="Nouveaux pros" value={fmtInt(cur.supply.new_pros)} sub="inscrits sur la période" />
                        <Tile
                            label="Pros actifs"
                            value={fmtInt(cur.supply.active_pros)}
                            sub="≥ 1 déblocage sur la période"
                        />
                        <Tile
                            label="Profils complets"
                            value={fmtPct(allTime.pct_complete_profiles)}
                            sub={`${fmtInt(allTime.complete_profiles)}/${fmtInt(allTime.total_pros)} pros · bio ≥ 150 car. · cumul`}
                        />
                    </div>
                </section>

                <section aria-label="Demande">
                    <SectionTitle>Demande (missions)</SectionTitle>
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                        <Tile
                            label="Missions créées"
                            value={fmtInt(cur.demand.jobs_created)}
                            sub={`${fmtInt(cur.demand.mix_standard)} standard · ${fmtInt(cur.demand.mix_renfort_pro)} Renfort PRO`}
                        />
                        <Tile
                            label="Complétion wizard"
                            value={fmtPct(cur.demand.wizard_completion)}
                            sub={
                                cur.demand.wizard_leads === 0
                                    ? 'aucun lead sur la période'
                                    : `${fmtInt(cur.demand.wizard_completed)}/${fmtInt(cur.demand.wizard_leads)} leads à l'étape 5`
                            }
                        />
                        <Tile
                            label="Taux d'approbation"
                            value={fmtPct(cur.demand.pct_approved)}
                            sub={
                                cur.demand.moderated_total === 0
                                    ? 'aucune modération sur la période'
                                    : `${fmtInt(cur.demand.approved)}/${fmtInt(cur.demand.moderated_total)} missions modérées`
                            }
                        />
                        <Tile
                            label="Médiane modération"
                            value={fmtHours(cur.demand.median_hours_moderation)}
                            sub="de la création à la décision"
                        />
                    </div>
                </section>
            </div>

            <section aria-label="Tendances sur 12 mois" className="space-y-6">
                <SectionTitle>Tendances — 12 derniers mois</SectionTitle>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <div className="flex items-start justify-between gap-2 mb-4">
                        <h3 className="text-sm font-semibold text-slate-900">Revenus mensuels (€)</h3>
                        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                            proxy packs
                        </span>
                    </div>
                    <LineChart
                        data={revenueSeries}
                        unit="€"
                        ariaLabel="Courbe des revenus mensuels en euros sur 12 mois"
                        valueLabel="Revenus (€)"
                    />
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-slate-900 mb-4">Missions publiées par mois</h3>
                    <BarChart
                        data={missionsSeries}
                        ariaLabel="Barres des missions publiées par mois sur 12 mois"
                        valueLabel="Missions publiées"
                    />
                </div>
            </section>

            <section aria-label="Engagement" className="border-t border-slate-200 pt-4">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-500">
                    <span className="font-medium uppercase tracking-wider">Engagement</span>
                    <span>
                        <span className="font-semibold text-slate-700 tabular-nums">{fmtInt(cur.engagement.conversations)}</span>{' '}
                        conversations créées
                    </span>
                    <span>
                        <span className="font-semibold text-slate-700 tabular-nums">{fmtInt(cur.engagement.reviews)}</span> avis
                        déposés
                    </span>
                </div>
            </section>

            <p className="text-xs text-slate-400">
                Revenus € reconstruits depuis les packs de crédits (3 cr → 60 €, 10 cr → 150 €, 20 cr → 280 €), achats
                Stripe uniquement — les montants réels ne sont pas stockés en base. Périodes et mois calculés en UTC.
            </p>
        </div>
    )
}

export default async function AdminAnalyticsPage({
    searchParams,
}: {
    searchParams: Promise<{ range?: string }>
}) {
    if (!(await isCurrentUserAdmin())) notFound()

    const sp = await searchParams
    const range: AnalyticsRange = isAnalyticsRange(sp.range) ? sp.range : '30d'
    const data = await fetchAnalytics(range)
    const periodLabel = RANGE_OPTIONS.find(o => o.value === range)?.periodLabel ?? ''

    return (
        <div className="px-4 md:px-8 py-6 max-w-[1600px] mx-auto">
            <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
                    <p className="text-sm text-slate-500">
                        {periodLabel} — deltas vs période précédente de même durée.
                    </p>
                </div>
                <RangeSelector active={range} />
            </header>
            {data ? <AnalyticsContent data={data} /> : <MigrationNotice />}
        </div>
    )
}
