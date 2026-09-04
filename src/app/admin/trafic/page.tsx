import { notFound } from 'next/navigation'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { isCurrentUserAdmin } from '@/lib/ops/guard'
import { isAnalyticsRange } from '@/lib/ops/fetchAnalytics'
import { ENTRY_PAGES_LIMIT, GEO_LIMIT, fetchTraffic } from '@/lib/ops/fetchTraffic'
import { LineChart } from '@/components/admin/charts/LineChart'
import { RANGE_OPTIONS, RangeSelector } from '@/components/admin/RangeSelector'
import type {
    AcquisitionPageType,
    AnalyticsRange,
    TrafficChannelRow,
    TrafficData,
    TrafficEntryPageRow,
    TrafficOverview,
    TrafficWeekPoint,
} from '@/lib/types/ops'

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'Trafic · Admin',
}

const nf0 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 })

const fmtInt = (v: number) => nf0.format(v)
// Les taux de sessions convertissantes vivent entre 0 et 2 % : arrondis à
// l'entier, ils s'écrasent tous sur « 0 % » ou « 1 % » et le classement que la
// colonne existe pour donner disparaît.
const fmtPct = (r: number | null) =>
    r === null ? '—' : `${(r < 0.1 ? nf1 : nf0).format(r * 100)} %`
const fmtAvg = (v: number | null) => (v === null ? '—' : nf1.format(v))

function fmtDuration(seconds: number | null): string {
    if (seconds === null) return '—'
    const total = Math.max(0, Math.round(seconds))
    const min = Math.floor(total / 60)
    const sec = total % 60
    return min === 0 ? `${fmtInt(sec)} s` : `${fmtInt(min)} min ${fmtInt(sec)} s`
}

// Même seuil et même justification que l'écran Analytics : sous 20 observations
// l'intervalle de confiance d'une proportion couvre tout l'éventail plausible.
const MIN_SAMPLE = 20

const insufficient = (n: number) => `Échantillon insuffisant (n = ${fmtInt(n)}) — pas de pourcentage sous ${MIN_SAMPLE}.`

function relativeDelta(cur: number | null, prev: number | null): number | null {
    if (cur === null || prev === null || prev === 0) return null
    return ((cur - prev) / Math.abs(prev)) * 100
}

type DeltaBase = { cur: number; prev: number; noun: string }

function Delta({ pct, base }: { pct: number | null; base?: DeltaBase }) {
    if (base && base.prev < MIN_SAMPLE) {
        return (
            <div className="mt-1.5 text-xs text-slate-400 tabular-nums">
                {fmtInt(base.cur)} vs {fmtInt(base.prev)} {base.noun} · variation non chiffrée
            </div>
        )
    }
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
    deltaBase,
    note,
}: {
    label: string
    value: string
    sub?: string
    badge?: string
    delta?: number | null
    deltaBase?: DeltaBase
    note?: string
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
            {note && (
                <div className="mt-1.5 text-xs font-medium" style={{ color: '#8A5A16' }}>
                    {note}
                </div>
            )}
            {delta !== undefined && <Delta pct={delta} base={deltaBase} />}
        </div>
    )
}

function RatioTile({
    label,
    num,
    den,
    sub,
    emptyLabel,
}: {
    label: string
    num: number
    den: number
    sub: string
    emptyLabel: string
}) {
    if (den === 0) {
        return <Tile label={label} value="—" sub={emptyLabel} />
    }
    const enough = den >= MIN_SAMPLE
    return (
        <Tile
            label={label}
            value={enough ? fmtPct(num / den) : `${fmtInt(num)} / ${fmtInt(den)}`}
            sub={sub}
            note={enough ? undefined : insufficient(den)}
        />
    )
}

function ratioCell(num: number, den: number): string {
    if (den === 0) return '—'
    return den >= MIN_SAMPLE ? fmtPct(num / den) : `${fmtInt(num)} / ${fmtInt(den)}`
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return <h2 className="text-sm font-semibold text-slate-900 mb-3">{children}</h2>
}

// Échec par bloc : une requête PostHog en échec met SON champ à null et laisse
// les autres sections vivre. L'écran ne se vide jamais entièrement tant que la
// configuration est présente.
function BlockUnavailable() {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 text-sm text-slate-500">
            Bloc indisponible — la requête PostHog correspondante a échoué, voir les logs{' '}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">[trafic]</code>.
        </div>
    )
}

function EmptyBlock({ children }: { children: React.ReactNode }) {
    return <div className="bg-white border border-slate-200 rounded-xl p-5 text-sm text-slate-500">{children}</div>
}

function PostHogNotice() {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
            <h2 className="text-base font-semibold text-slate-900">PostHog non connecté</h2>
            <p className="mt-2 text-sm text-slate-500 max-w-lg mx-auto">
                Variables{' '}
                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">POSTHOG_PERSONAL_API_KEY</code> /{' '}
                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">POSTHOG_PROJECT_ID</code> absentes
                de l&apos;environnement serveur. Une requête en échec ne vide pas l&apos;écran : elle n&apos;affecte que
                son propre bloc, avec le détail dans les logs serveur (préfixe{' '}
                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">[trafic]</code>).
            </p>
        </div>
    )
}

const PAGE_TYPE_LABEL: Record<AcquisitionPageType, string> = {
    ville: 'Ville',
    ville_service: 'Ville × service',
    blog: 'Blog',
    board: 'Tableau des missions',
    mission: 'Fiche mission',
    post_job: 'Publier',
    home: 'Accueil',
    profil_pro: 'Profil pro',
    credits: 'Crédits',
    admin: 'Admin',
    autre: 'Autre',
}


function OverviewSection({ overview, previous }: { overview: TrafficOverview | null; previous: TrafficOverview | null }) {
    if (!overview) {
        return (
            <section aria-label="Vue d'ensemble">
                <SectionTitle>Vue d&apos;ensemble</SectionTitle>
                <BlockUnavailable />
            </section>
        )
    }

    // La variation n'est chiffrée que si la période de référence porte assez de
    // sessions : un « +300 % » bâti sur 4 sessions n'est pas une tendance.
    const base: DeltaBase | undefined = previous
        ? { cur: overview.sessions, prev: previous.sessions, noun: 'sessions' }
        : undefined
    const delta = (cur: number | null, prev: number | null) => (previous ? relativeDelta(cur, prev) : undefined)

    return (
        <section aria-label="Vue d'ensemble">
            <SectionTitle>Vue d&apos;ensemble</SectionTitle>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                <Tile
                    label="Sessions"
                    value={fmtInt(overview.sessions)}
                    sub="visites distinctes sur la période"
                    delta={delta(overview.sessions, previous?.sessions ?? null)}
                    deltaBase={base}
                />
                <Tile
                    label="Visiteurs"
                    value={fmtInt(overview.visitors)}
                    sub="personnes distinctes sur la période"
                    delta={delta(overview.visitors, previous?.visitors ?? null)}
                    deltaBase={
                        previous ? { cur: overview.visitors, prev: previous.visitors, noun: 'visiteurs' } : undefined
                    }
                />
                <Tile
                    label="Pages vues"
                    value={fmtInt(overview.pageviews)}
                    sub="toutes pages confondues"
                    delta={delta(overview.pageviews, previous?.pageviews ?? null)}
                    deltaBase={base}
                />
                <RatioTile
                    label="Taux de rebond"
                    num={overview.bounce_sessions}
                    den={overview.bounce_eligible_sessions}
                    sub={`${fmtInt(overview.bounce_sessions)} sessions rebondies sur ${fmtInt(overview.bounce_eligible_sessions)} avec au moins une page vue`}
                    emptyLabel="aucune session sur la période"
                />
                <Tile
                    label="Durée médiane"
                    value={fmtDuration(overview.median_duration_s)}
                    sub={
                        overview.median_duration_s === null
                            ? 'durée de session non mesurée'
                            : 'médiane de la durée de session'
                    }
                    delta={delta(overview.median_duration_s, previous?.median_duration_s ?? null)}
                    deltaBase={base}
                />
                <Tile
                    label="Pages / session"
                    value={fmtAvg(overview.pages_per_session)}
                    sub={
                        overview.pages_per_session === null
                            ? 'aucune session sur la période'
                            : 'moyenne par session démarrée (≠ pages vues ÷ sessions)'
                    }
                    delta={delta(overview.pages_per_session, previous?.pages_per_session ?? null)}
                    deltaBase={base}
                />
            </div>
        </section>
    )
}

function ChannelsSection({ channels }: { channels: TrafficChannelRow[] | null }) {
    if (!channels) {
        return (
            <section aria-label="Par canal">
                <SectionTitle>Par canal</SectionTitle>
                <BlockUnavailable />
            </section>
        )
    }

    const totalSessions = channels.reduce((acc, c) => acc + c.sessions, 0)

    return (
        <section aria-label="Par canal">
            <SectionTitle>Par canal</SectionTitle>
            {channels.length === 0 ? (
                <EmptyBlock>Aucune session sur la période.</EmptyBlock>
            ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-left text-slate-500 border-b border-slate-200">
                                    <th className="py-1.5 pr-4 font-medium">Canal</th>
                                    <th className="py-1.5 px-2 text-right font-medium">Sessions</th>
                                    <th className="py-1.5 px-2 text-right font-medium">Visiteurs</th>
                                    <th className="py-1.5 px-2 text-right font-medium">Sessions avec mission publiée</th>
                                    <th className="py-1.5 px-2 text-right font-medium">Taux mission publiée</th>
                                    <th className="py-1.5 pl-2 text-right font-medium">Part des sessions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {channels.map(c => (
                                    <tr key={c.label} className="border-b border-slate-100">
                                        <td className="py-1.5 pr-4 text-slate-700">{c.label}</td>
                                        <td className="py-1.5 px-2 text-right text-slate-900 tabular-nums">
                                            {fmtInt(c.sessions)}
                                        </td>
                                        <td className="py-1.5 px-2 text-right text-slate-900 tabular-nums">
                                            {fmtInt(c.visitors)}
                                        </td>
                                        <td className="py-1.5 px-2 text-right text-slate-900 tabular-nums">
                                            {fmtInt(c.converting_sessions)}
                                        </td>
                                        <td className="py-1.5 px-2 text-right text-slate-500 tabular-nums">
                                            {ratioCell(c.converting_sessions, c.sessions)}
                                        </td>
                                        <td className="py-1.5 pl-2 text-right text-slate-500 tabular-nums">
                                            {ratioCell(c.sessions, totalSessions)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </section>
    )
}

function EntryPagesSection({ entryPages }: { entryPages: TrafficEntryPageRow[] | null }) {
    if (!entryPages) {
        return (
            <section aria-label="Pages d'entrée">
                <SectionTitle>Pages d&apos;entrée</SectionTitle>
                <BlockUnavailable />
            </section>
        )
    }

    const rows = [...entryPages].sort((a, b) => b.sessions - a.sessions).slice(0, ENTRY_PAGES_LIMIT)

    return (
        <section aria-label="Pages d'entrée">
            <SectionTitle>Pages d&apos;entrée</SectionTitle>
            {rows.length === 0 ? (
                <EmptyBlock>Aucune page d&apos;entrée sur la période.</EmptyBlock>
            ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-left text-slate-500 border-b border-slate-200">
                                    <th className="py-1.5 pr-4 font-medium">Page</th>
                                    <th className="py-1.5 px-2 font-medium">Type</th>
                                    <th className="py-1.5 px-2 text-right font-medium">Sessions</th>
                                    <th className="py-1.5 px-2 text-right font-medium">Taux de rebond</th>
                                    <th className="py-1.5 px-2 text-right font-medium">Sessions avec mission publiée</th>
                                    <th className="py-1.5 pl-2 text-right font-medium">Taux mission publiée</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map(p => (
                                    <tr key={`${p.pathname}|${p.page_type}`} className="border-b border-slate-100">
                                        <td className="py-1.5 pr-4 text-slate-700">
                                            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-700">
                                                {p.pathname}
                                            </code>
                                        </td>
                                        <td className="py-1.5 px-2 text-slate-500">{PAGE_TYPE_LABEL[p.page_type]}</td>
                                        <td className="py-1.5 px-2 text-right text-slate-900 tabular-nums">
                                            {fmtInt(p.sessions)}
                                        </td>
                                        <td className="py-1.5 px-2 text-right text-slate-500 tabular-nums">
                                            {ratioCell(p.bounce_sessions, p.sessions)}
                                        </td>
                                        <td className="py-1.5 px-2 text-right text-slate-900 tabular-nums">
                                            {fmtInt(p.converting_sessions)}
                                        </td>
                                        <td className="py-1.5 pl-2 text-right text-slate-500 tabular-nums">
                                            {ratioCell(p.converting_sessions, p.sessions)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                        {fmtInt(rows.length)} page{rows.length > 1 ? 's' : ''} affichée{rows.length > 1 ? 's' : ''}
                        {rows.length >= ENTRY_PAGES_LIMIT
                            ? ` — liste tronquée aux ${ENTRY_PAGES_LIMIT} premières par sessions.`
                            : '.'}
                    </p>
                </div>
            )}
        </section>
    )
}

type SegmentRow = { label: string; sessions: number; converting_sessions: number }

function SegmentTable({
    title,
    headLabel,
    rows,
    emptyLabel,
    note,
}: {
    title: string
    headLabel: string
    rows: readonly SegmentRow[] | null
    emptyLabel: string
    note?: string
}) {
    if (!rows) {
        return (
            <section aria-label={title}>
                <SectionTitle>{title}</SectionTitle>
                <BlockUnavailable />
            </section>
        )
    }

    return (
        <section aria-label={title}>
            <SectionTitle>{title}</SectionTitle>
            {rows.length === 0 ? (
                <EmptyBlock>{emptyLabel}</EmptyBlock>
            ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-left text-slate-500 border-b border-slate-200">
                                    <th className="py-1.5 pr-4 font-medium">{headLabel}</th>
                                    <th className="py-1.5 px-2 text-right font-medium">Sessions</th>
                                    <th className="py-1.5 px-2 text-right font-medium">Sessions avec mission publiée</th>
                                    <th className="py-1.5 pl-2 text-right font-medium">Taux mission publiée</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map(r => (
                                    <tr key={r.label} className="border-b border-slate-100">
                                        <td className="py-1.5 pr-4 text-slate-700">{r.label}</td>
                                        <td className="py-1.5 px-2 text-right text-slate-900 tabular-nums">
                                            {fmtInt(r.sessions)}
                                        </td>
                                        <td className="py-1.5 px-2 text-right text-slate-900 tabular-nums">
                                            {fmtInt(r.converting_sessions)}
                                        </td>
                                        <td className="py-1.5 pl-2 text-right text-slate-500 tabular-nums">
                                            {ratioCell(r.converting_sessions, r.sessions)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {note ? <p className="mt-2 text-xs text-slate-400">{note}</p> : null}
                </div>
            )}
        </section>
    )
}

function TrendSection({ series }: { series: TrafficWeekPoint[] | null }) {
    if (!series) {
        return (
            <section aria-label="Tendance">
                <SectionTitle>Tendance</SectionTitle>
                <BlockUnavailable />
            </section>
        )
    }

    const sessionsSeries = series.map(p => ({ month: p.week, value: p.sessions }))
    // Une courbe plate à zéro ne dit rien d'autre que « rien à voir » : on ne
    // l'affiche que si au moins une semaine porte une session convertissante.
    const convertingSeries = series.some(p => p.converting_sessions > 0)
        ? series.map(p => ({ month: p.week, value: p.converting_sessions }))
        : null

    return (
        <section aria-label="Tendance" className="space-y-6">
            <SectionTitle>Tendance — sessions par semaine</SectionTitle>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Sessions par semaine</h3>
                <LineChart
                    data={sessionsSeries}
                    xFormat="week"
                    ariaLabel="Courbe des sessions par semaine sur la période"
                    valueLabel="Sessions"
                />
            </div>
            {convertingSeries && (
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-slate-900 mb-4">
                        Sessions avec mission publiée, par semaine
                    </h3>
                    <LineChart
                        data={convertingSeries}
                        xFormat="week"
                        ariaLabel="Courbe des sessions avec mission publiée par semaine sur la période"
                        valueLabel="Sessions avec mission publiée"
                    />
                </div>
            )}
        </section>
    )
}

function TrafficContent({ data }: { data: TrafficData }) {
    return (
        <div className="space-y-8">
            <OverviewSection overview={data.overview} previous={data.previous} />
            <ChannelsSection channels={data.channels} />
            <EntryPagesSection entryPages={data.entry_pages} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SegmentTable
                    title="Appareil"
                    headLabel="Appareil"
                    rows={data.devices}
                    emptyLabel="Aucune session sur la période."
                />
                <SegmentTable
                    title="Géographie"
                    headLabel="Région"
                    rows={data.geo}
                    emptyLabel="Aucune session sur la période."
                    note={
                        data.geo && data.geo.length >= GEO_LIMIT
                            ? `Liste tronquée aux ${GEO_LIMIT} premières régions par sessions.`
                            : undefined
                    }
                />
            </div>
            <TrendSection series={data.series} />

            <p className="text-xs text-slate-400">
                Sessions et rebond issus de PostHog. Les visiteurs ayant refusé le bandeau de consentement ne sont pas
                comptés. Cache 1 h. Sessions avec mission publiée compte les sessions au cours desquelles une mission a
                été publiée — une mission publiée lors d&apos;une visite ultérieure n&apos;est pas rattachée à la page
                d&apos;entrée d&apos;origine. Aucun taux de cet écran n&apos;est affiché en pourcentage sous{' '}
                {MIN_SAMPLE} sessions : en dessous, la cellule montre la fraction brute. La navigation de
                l&apos;équipe sur /admin est exclue de tous les chiffres. Le taux de rebond se calcule sur les seules
                sessions ayant au moins une page vue, comme dans PostHog. La tendance ne trace que des semaines
                pleines (du lundi, UTC) : la semaine en cours et celle d&apos;entrée dans la fenêtre sont écartées,
                sinon la courbe finirait sur une chute qui n&apos;est qu&apos;un décompte partiel.
            </p>
        </div>
    )
}

export default async function AdminTrafficPage({
    searchParams,
}: {
    searchParams: Promise<{ range?: string }>
}) {
    if (!(await isCurrentUserAdmin())) notFound()

    const sp = await searchParams
    const range: AnalyticsRange = isAnalyticsRange(sp.range) ? sp.range : '30d'
    const traffic = await fetchTraffic(range)
    const periodLabel = RANGE_OPTIONS.find(o => o.value === range)?.periodLabel ?? ''

    return (
        <div className="px-4 md:px-8 py-6 max-w-[1600px] mx-auto">
            <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Trafic</h1>
                    <p className="text-sm text-slate-500">
                        {periodLabel} — deltas vs période précédente de même durée.
                    </p>
                </div>
                <RangeSelector active={range} basePath="/admin/trafic" />
            </header>
            {traffic ? <TrafficContent data={traffic} /> : <PostHogNotice />}
        </div>
    )
}
