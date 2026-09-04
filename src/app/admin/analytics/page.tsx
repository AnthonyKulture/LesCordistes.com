import { notFound } from 'next/navigation'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { isCurrentUserAdmin } from '@/lib/ops/guard'
import { fetchAnalytics, isAnalyticsRange } from '@/lib/ops/fetchAnalytics'
import { fetchAcquisition } from '@/lib/ops/fetchAcquisition'
import type {
    AcquisitionData,
    AcquisitionPageType,
    AnalyticsData,
    AnalyticsOutcomeBucket,
    AnalyticsOutcomes,
    AnalyticsRange,
} from '@/lib/types/ops'
import { LineChart } from '@/components/admin/charts/LineChart'
import { BarChart } from '@/components/admin/charts/BarChart'
import { RANGE_OPTIONS, RangeSelector } from '@/components/admin/RangeSelector'

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'Analytics · Admin',
}

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

// Effectif sous-jacent d'une variation période-sur-période. Un delta calculé sur
// un euro divisé par un euro n'est pas un delta : 3 achats contre 1 affichent
// « +500 % », qui n'est qu'un effet de composition. On ne chiffre la variation
// que si la période de référence porte assez d'événements (même seuil que les
// taux, cf. MIN_SAMPLE) ; sinon on montre les deux effectifs et rien d'autre.
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

function SectionTitle({ children }: { children: React.ReactNode }) {
    return <h2 className="text-sm font-semibold text-slate-900 mb-3">{children}</h2>
}

// Seuil en deçà duquel aucun pourcentage n'est affiché — effectifs bruts seulement.
//
// 20 réponses : l'intervalle de confiance à 95 % d'une proportion vaut au pire
// ±1,96·√(0,25/n), soit ±22 points à n=20, ±31 points à n=10 et ±35 points à n=8.
// En dessous de 20, l'intervalle couvre à peu près tout l'éventail des valeurs
// plausibles : le pourcentage ne distingue plus « excellent » de « catastrophique »
// et n'est qu'une mise en forme flatteuse du hasard. Un seuil plus permissif pour
// les ventilations serait à l'envers : une tranche est plus bruitée que l'agrégat,
// pas moins. Un seul seuil, partout.
//
// « Partout » se prend au pied de la lettre : la règle s'applique à TOUS les taux
// de cet écran, pas aux seules « Issues des leads ». Un « Taux de rachat 50 % »
// bâti sur 2 acheteurs, affiché à côté d'un « Taux de transformation 1 / 2 —
// échantillon insuffisant », ferait passer le second pour le seul fragile et
// prêterait au premier une solidité qu'il n'a pas.
const MIN_SAMPLE = 20

const insufficient = (n: number) => `Échantillon insuffisant (n = ${fmtInt(n)}) — pas de pourcentage sous ${MIN_SAMPLE}.`

// Un pourcentage n'apparaît qu'au-dessus du seuil ; sinon la fraction brute.
function RatioTile({
    label,
    num,
    den,
    sub,
    emptyLabel,
    badge,
}: {
    label: string
    num: number
    den: number
    sub: string
    emptyLabel: string
    badge?: string
}) {
    if (den === 0) {
        return <Tile label={label} value="—" sub={emptyLabel} badge={badge} />
    }
    const enough = den >= MIN_SAMPLE
    return (
        <Tile
            label={label}
            value={enough ? fmtPct(num / den) : `${fmtInt(num)} / ${fmtInt(den)}`}
            sub={sub}
            badge={badge}
            note={enough ? undefined : insufficient(den)}
        />
    )
}

// Même règle, pour les deux taux dont le RPC ne remonte que le dénominateur
// (liquidity.cohort) : faute de numérateur on ne peut pas replier sur une
// fraction brute, seulement retirer le pourcentage. Le dénominateur reste
// visible dans le sous-titre — on n'invente pas le numérateur en inversant
// l'arrondi du ratio.
function GuardedPctTile({
    label,
    ratio,
    den,
    sub,
    emptyLabel,
}: {
    label: string
    ratio: number | null
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
            value={enough ? fmtPct(ratio) : '—'}
            sub={sub}
            note={enough ? undefined : insufficient(den)}
        />
    )
}

function ratioCell(num: number, den: number): string {
    if (den === 0) return '—'
    return den >= MIN_SAMPLE ? fmtPct(num / den) : `${fmtInt(num)} / ${fmtInt(den)}`
}

function OutcomeBreakdown({
    caption,
    headLabel,
    rows,
    emptyLabel,
    footnote,
}: {
    caption: string
    headLabel: string
    rows: AnalyticsOutcomeBucket[]
    emptyLabel: string
    footnote?: string
}) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">{caption}</h3>
            {rows.length === 0 ? (
                <p className="text-sm text-slate-500">{emptyLabel}</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="text-left text-slate-500 border-b border-slate-200">
                                <th className="py-1.5 pr-4 font-medium">{headLabel}</th>
                                <th className="py-1.5 px-2 text-right font-medium">Sollicités</th>
                                <th className="py-1.5 px-2 text-right font-medium">Réponses</th>
                                <th className="py-1.5 px-2 text-right font-medium">Gagnés</th>
                                <th className="py-1.5 px-2 text-right font-medium">Perdus</th>
                                <th className="py-1.5 px-2 text-right font-medium">Sans réponse</th>
                                <th className="py-1.5 pl-2 text-right font-medium">Transformation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(r => (
                                <tr key={r.label} className="border-b border-slate-100">
                                    <td className="py-1.5 pr-4 text-slate-700">{r.label}</td>
                                    <td className="py-1.5 px-2 text-right text-slate-900 tabular-nums">{fmtInt(r.solicited)}</td>
                                    <td className="py-1.5 px-2 text-right text-slate-900 tabular-nums">{fmtInt(r.answered)}</td>
                                    <td className="py-1.5 px-2 text-right text-slate-900 tabular-nums">{fmtInt(r.won)}</td>
                                    <td className="py-1.5 px-2 text-right text-slate-900 tabular-nums">{fmtInt(r.lost)}</td>
                                    <td className="py-1.5 px-2 text-right text-slate-500 tabular-nums">{fmtInt(r.no_response)}</td>
                                    <td className="py-1.5 pl-2 text-right text-slate-500 tabular-nums">
                                        {ratioCell(r.won, r.resolved)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {footnote && <p className="mt-2 text-xs text-slate-400">{footnote}</p>}
        </div>
    )
}

function OutcomesSection({ outcomes }: { outcomes: AnalyticsOutcomes | null }) {
    if (!outcomes) {
        return (
            <section aria-label="Issues des leads">
                <SectionTitle>Issues des leads</SectionTitle>
                <div className="bg-white border border-slate-200 rounded-xl p-5 text-sm text-slate-500">
                    Section indisponible : appliquer la migration{' '}
                    <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">
                        supabase/migrations/20260903a-analytics-outcomes.sql
                    </code>{' '}
                    dans le SQL Editor Supabase.
                </div>
            </section>
        )
    }

    const { funnel, answers, acquisition } = outcomes
    const wonEnough = acquisition.won >= MIN_SAMPLE
    const creditsPerWon = acquisition.won > 0 ? acquisition.credits_answered / acquisition.won : null
    const eurPerWon =
        creditsPerWon !== null && acquisition.eur_per_credit !== null
            ? creditsPerWon * acquisition.eur_per_credit
            : null

    return (
        <section aria-label="Issues des leads">
            <SectionTitle>Issues des leads</SectionTitle>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <RatioTile
                    label="Taux de réponse"
                    num={funnel.answered}
                    den={funnel.solicited}
                    sub={`${fmtInt(funnel.answered)} réponses sur ${fmtInt(funnel.solicited)} sollicitations envoyées`}
                    emptyLabel="aucune sollicitation envoyée à ce jour"
                    badge="cumul"
                />
                <RatioTile
                    label="Taux de transformation"
                    num={answers.won}
                    den={answers.resolved}
                    sub={`${fmtInt(answers.won)} gagnés · ${fmtInt(answers.lost)} perdus — les « sans réponse client » sont exclus`}
                    emptyLabel="aucune issue tranchée (gagné ou perdu)"
                    badge="cumul"
                />
                <Tile
                    label="Sans réponse client"
                    value={fmtInt(answers.no_response)}
                    sub={
                        funnel.answered === 0
                            ? 'aucune réponse reçue à ce jour'
                            : `sur ${fmtInt(funnel.answered)} réponses — hors dénominateur de transformation`
                    }
                    badge="cumul"
                />
                <Tile
                    label="Coût par chantier gagné"
                    value={
                        acquisition.won === 0
                            ? '—'
                            : wonEnough && eurPerWon !== null
                              ? fmtEuro(Math.round(eurPerWon))
                              : `${fmtInt(acquisition.credits_answered)} cr / ${fmtInt(acquisition.won)}`
                    }
                    sub={
                        acquisition.won === 0
                            ? 'aucun chantier gagné mesuré à ce jour'
                            : `${fmtInt(acquisition.credits_answered)} crédits dépensés sur les ${fmtInt(funnel.answered)} leads mesurés · ${fmtInt(acquisition.credits_resolved)} cr hors « sans réponse »${
                                  acquisition.eur_per_credit === null
                                      ? ''
                                      : ` · ${fmtAvg(acquisition.eur_per_credit)} € le crédit encaissé`
                              }`
                    }
                    badge="cumul"
                    note={
                        acquisition.won === 0 || wonEnough
                            ? undefined
                            : `Échantillon insuffisant (n = ${fmtInt(acquisition.won)} gagné${acquisition.won > 1 ? 's' : ''}) — coût brut, non extrapolable.`
                    }
                />
            </div>

            <div className="mt-3 md:mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-500">
                <span className="font-medium uppercase tracking-wider">Entonnoir</span>
                <span>
                    <span className="font-semibold text-slate-700 tabular-nums">{fmtInt(funnel.eligible)}</span> déblocages de
                    plus de {fmtInt(outcomes.delay_days)} j
                </span>
                <span>
                    <span className="font-semibold text-slate-700 tabular-nums">{fmtInt(funnel.solicited)}</span> sollicités
                </span>
                <span>
                    <span className="font-semibold text-slate-700 tabular-nums">{fmtInt(funnel.awaiting_answer)}</span> sans
                    réponse à ce jour
                </span>
                <span>
                    <span className="font-semibold text-slate-700 tabular-nums">{fmtInt(funnel.pending_solicitation)}</span> en
                    attente d&apos;envoi
                </span>
                <span>
                    <span className="font-semibold text-slate-700 tabular-nums">{fmtInt(funnel.suppressed)}</span> neutralisés
                    (jamais sollicités)
                </span>
            </div>

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <OutcomeBreakdown
                    caption="Par ville"
                    headLabel="Ville"
                    rows={outcomes.by_city}
                    emptyLabel="Aucune ville sollicitée pour l'instant."
                    footnote={
                        outcomes.cities_total > outcomes.by_city.length
                            ? `${fmtInt(outcomes.by_city.length)} villes affichées sur ${fmtInt(outcomes.cities_total)} sollicitées.`
                            : undefined
                    }
                />
                <OutcomeBreakdown
                    caption="Par type de mission"
                    headLabel="Type"
                    rows={outcomes.by_job_type}
                    emptyLabel="Aucun type de mission sollicité pour l'instant."
                />
            </div>
        </section>
    )
}

const PAGE_TYPE_LABEL: Record<AcquisitionPageType, string> = {
    ville_service: 'Ville × service',
    ville: 'Ville',
    blog: 'Blog',
    board: 'Tableau des missions',
    mission: 'Fiche mission',
    post_job: 'Dépôt de mission',
    home: 'Accueil',
    profil_pro: 'Profil pro',
    credits: 'Crédits',
    admin: 'Admin',
    autre: 'Autre',
}

const SEO_PAGE_TYPES: readonly AcquisitionPageType[] = ['ville_service', 'ville', 'blog']

type FunnelStep = { label: string; value: number }

// Chaque marche affiche son effectif brut ; le taux de passage n'apparaît que si
// la marche précédente atteint MIN_SAMPLE. Les marches ne sont pas ordonnées
// dans le temps (personnes distinctes par étape), un taux peut dépasser 100 %.
function FunnelBand({ title, steps }: { title: string; steps: FunnelStep[] }) {
    return (
        <div className="mt-3 md:mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-500">
            <span className="font-medium uppercase tracking-wider">{title}</span>
            {steps.map((step, i) => {
                const prev = i > 0 ? steps[i - 1].value : null
                const pct = prev !== null && prev >= MIN_SAMPLE ? fmtPct(step.value / prev) : null
                return (
                    <span key={step.label}>
                        <span className="font-semibold text-slate-700 tabular-nums">{fmtInt(step.value)}</span> {step.label}
                        {pct !== null && <span className="text-slate-400 tabular-nums"> · {pct}</span>}
                    </span>
                )
            })}
        </div>
    )
}

function AcquisitionSection({ acquisition }: { acquisition: AcquisitionData | null }) {
    if (!acquisition) {
        return (
            <section aria-label="Acquisition">
                <SectionTitle>Acquisition (PostHog)</SectionTitle>
                <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
                    <h3 className="text-base font-semibold text-slate-900">PostHog non connecté</h3>
                    <p className="mt-2 text-sm text-slate-500 max-w-lg mx-auto">
                        Variables{' '}
                        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">POSTHOG_PERSONAL_API_KEY</code>{' '}
                        /{' '}
                        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">POSTHOG_PROJECT_ID</code>{' '}
                        absentes ou requête en échec (voir logs serveur).
                    </p>
                </div>
            </section>
        )
    }

    const { demand, supply } = acquisition
    const rows = acquisition.traffic.filter(t => t.page_type !== 'admin')
    const totalSessions = rows.reduce((acc, t) => acc + t.sessions, 0)
    const totalVisitors = rows.reduce((acc, t) => acc + t.visitors, 0)
    const totalPageviews = rows.reduce((acc, t) => acc + t.pageviews, 0)
    const seoRows = rows.filter(t => SEO_PAGE_TYPES.includes(t.page_type))
    const seoSessions = seoRows.reduce((acc, t) => acc + t.sessions, 0)
    const seoPageviews = seoRows.reduce((acc, t) => acc + t.pageviews, 0)

    const demandSteps: FunnelStep[] = [
        { label: 'visiteurs pages SEO', value: demand.seo_visitors },
        { label: 'visiteurs /post-job', value: demand.post_job_visitors },
        {
            label: `parcours choisi (${fmtInt(demand.path_by_kind.project)} projet · ${fmtInt(demand.path_by_kind.quick)} express · ${fmtInt(demand.path_by_kind.callback)} rappel)`,
            value: demand.path_chosen,
        },
        { label: 'entrés dans le wizard (toute étape)', value: demand.wizard_entered },
        { label: 'étape 1 · standard', value: demand.steps[0] },
        { label: 'étape 2 · standard', value: demand.steps[1] },
        { label: 'étape 3 · standard', value: demand.steps[2] },
        { label: 'étape 4 · standard', value: demand.steps[3] },
        { label: 'étape 5 · standard', value: demand.steps[4] },
        { label: 'missions publiées', value: demand.job_posted },
    ]

    const supplySteps: FunnelStep[] = [
        { label: 'inscriptions pro', value: supply.pro_signups },
        { label: 'fiches mission vues', value: supply.job_detail_views },
        { label: 'bloqués sans crédit', value: supply.unlock_blocked },
        { label: 'page crédits', value: supply.credits_page_views },
        { label: 'checkouts lancés', value: supply.checkout_initiated },
        { label: 'achats de crédits', value: supply.credits_purchased },
        { label: 'leads débloqués', value: supply.lead_unlocked },
    ]

    return (
        <section aria-label="Acquisition">
            <SectionTitle>Acquisition (PostHog)</SectionTitle>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                <Tile
                    label="Sessions hors admin"
                    value={fmtInt(totalSessions)}
                    sub={`${fmtInt(totalVisitors)} visiteurs · ${fmtInt(totalPageviews)} pages vues — cumul par type de page`}
                />
                <Tile
                    label="Sessions pages SEO"
                    value={fmtInt(seoSessions)}
                    sub={`ville, ville × service, blog · ${fmtInt(seoPageviews)} pages vues`}
                />
                <RatioTile
                    label="Missions publiées / visiteurs SEO"
                    num={demand.job_posted}
                    den={demand.seo_visitors}
                    sub={`${fmtInt(demand.job_posted)} publications pour ${fmtInt(demand.seo_visitors)} visiteurs SEO — sans contrainte d'ordre`}
                    emptyLabel="aucun visiteur SEO sur la période"
                />
            </div>

            <div className="mt-4 bg-white border border-slate-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Par type de page</h3>
                {rows.length === 0 ? (
                    <p className="text-sm text-slate-500">Aucune page vue sur la période.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-left text-slate-500 border-b border-slate-200">
                                    <th className="py-1.5 pr-4 font-medium">Type</th>
                                    <th className="py-1.5 px-2 text-right font-medium">Sessions</th>
                                    <th className="py-1.5 px-2 text-right font-medium">Visiteurs</th>
                                    <th className="py-1.5 px-2 text-right font-medium">Pages vues</th>
                                    <th className="py-1.5 pl-2 text-right font-medium">Part des sessions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map(t => (
                                    <tr key={t.page_type} className="border-b border-slate-100">
                                        <td className="py-1.5 pr-4 text-slate-700">{PAGE_TYPE_LABEL[t.page_type]}</td>
                                        <td className="py-1.5 px-2 text-right text-slate-900 tabular-nums">{fmtInt(t.sessions)}</td>
                                        <td className="py-1.5 px-2 text-right text-slate-900 tabular-nums">{fmtInt(t.visitors)}</td>
                                        <td className="py-1.5 px-2 text-right text-slate-900 tabular-nums">{fmtInt(t.pageviews)}</td>
                                        <td className="py-1.5 pl-2 text-right text-slate-500 tabular-nums">
                                            {ratioCell(t.sessions, totalSessions)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <FunnelBand title="Entonnoir demande" steps={demandSteps} />
            <FunnelBand title="Entonnoir offre" steps={supplySteps} />

            <p className="mt-3 text-xs text-slate-400">
                Entonnoirs : personnes distinctes par étape sur la période, sans contrainte d&apos;ordre — le taux à
                côté d&apos;une marche rapporte son effectif à celui de la marche précédente et n&apos;apparaît que si
                cette dernière atteint {MIN_SAMPLE}. Une session est comptée une fois par type de page visité. Visiteurs
                ayant refusé le bandeau exclus ; cache 1 h.
            </p>
        </section>
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

function AnalyticsContent({ data, acquisition = null }: { data: AnalyticsData; acquisition?: AcquisitionData | null }) {
    const { current: cur, previous: prev, all_time: allTime } = data.overview

    const revenueSeries = data.series.map(p => ({ month: p.month, value: p.revenue_eur }))
    const missionsSeries = data.series.map(p => ({ month: p.month, value: p.missions_published }))
    const seoSessionsSeries = acquisition?.series.map(p => ({ month: p.month, value: p.seo_sessions })) ?? null

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
                        deltaBase={{ cur: cur.purchases, prev: prev.purchases, noun: 'achats' }}
                    />
                    <Tile
                        label="ARPU payant"
                        value={fmtEuro(cur.arpu_eur)}
                        sub={cur.arpu_eur === null ? 'aucun acheteur sur la période' : 'revenu moyen par acheteur'}
                        badge="proxy packs"
                        delta={relativeDelta(cur.arpu_eur, prev.arpu_eur)}
                        deltaBase={{ cur: cur.buyers, prev: prev.buyers, noun: 'acheteurs' }}
                    />
                    <RatioTile
                        label="Taux de rachat"
                        num={allTime.repeat_buyers}
                        den={allTime.buyers_total}
                        sub={`${fmtInt(allTime.repeat_buyers)}/${fmtInt(allTime.buyers_total)} acheteurs à ≥ 2 achats`}
                        emptyLabel="aucun acheteur Stripe à ce jour"
                        badge="cumul"
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
                        deltaBase={{
                            cur: cur.missions_moderated,
                            prev: prev.missions_moderated,
                            noun: 'missions modérées',
                        }}
                    />
                </div>
            </section>

            <section aria-label="Liquidité">
                <SectionTitle>Liquidité du marché</SectionTitle>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <GuardedPctTile
                        label="Missions débloquées"
                        ratio={cur.liquidity.pct_unlocked}
                        den={cur.liquidity.cohort}
                        sub={`cohorte de ${fmtInt(cur.liquidity.cohort)} missions modérées`}
                        emptyLabel="aucune mission modérée sur la période"
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
                    <GuardedPctTile
                        label="Expirées sans déblocage"
                        ratio={cur.liquidity.pct_expired_no_unlock}
                        den={cur.liquidity.cohort}
                        sub={`jamais débloquées avant expiration · cohorte de ${fmtInt(cur.liquidity.cohort)}`}
                        emptyLabel="aucune mission modérée sur la période"
                    />
                </div>
            </section>

            <OutcomesSection outcomes={data.overview.outcomes} />

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
                        <RatioTile
                            label="Profils complets"
                            num={allTime.complete_profiles}
                            den={allTime.total_pros}
                            sub={`${fmtInt(allTime.complete_profiles)}/${fmtInt(allTime.total_pros)} pros · bio ≥ 150 car.`}
                            emptyLabel="aucun pro inscrit à ce jour"
                            badge="cumul"
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
                        {acquisition ? (
                            <RatioTile
                                label="Complétion wizard"
                                num={acquisition.demand.job_posted}
                                den={acquisition.demand.wizard_entered}
                                sub={`${fmtInt(acquisition.demand.job_posted)}/${fmtInt(acquisition.demand.wizard_entered)} personnes entrées dans le wizard (toute étape) → publication`}
                                emptyLabel="aucune entrée dans le wizard sur la période"
                                badge="PostHog"
                            />
                        ) : (
                            <Tile
                                label="Complétion wizard"
                                value="—"
                                sub="non mesuré : leads.step_reached n'est jamais mis à jour"
                            />
                        )}
                        <RatioTile
                            label="Taux d'approbation"
                            num={cur.demand.approved}
                            den={cur.demand.moderated_total}
                            sub={`${fmtInt(cur.demand.approved)}/${fmtInt(cur.demand.moderated_total)} missions modérées`}
                            emptyLabel="aucune modération sur la période"
                        />
                        <Tile
                            label="Médiane modération"
                            value={fmtHours(cur.demand.median_hours_moderation)}
                            sub="de la création à la décision"
                        />
                    </div>
                </section>
            </div>

            <AcquisitionSection acquisition={acquisition} />

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
                {seoSessionsSeries && (
                    <div className="bg-white border border-slate-200 rounded-xl p-5">
                        <div className="flex items-start justify-between gap-2 mb-4">
                            <h3 className="text-sm font-semibold text-slate-900">Sessions SEO par mois</h3>
                            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                                PostHog
                            </span>
                        </div>
                        <LineChart
                            data={seoSessionsSeries}
                            ariaLabel="Courbe des sessions sur les pages SEO par mois sur 12 mois"
                            valueLabel="Sessions SEO"
                        />
                    </div>
                )}
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
                Stripe uniquement — les montants réels ne sont pas stockés en base. Périodes et mois calculés en UTC. Les
                tuiles marquées « cumul » couvrent tout l&apos;historique et ignorent le sélecteur de période. Aucun taux
                de cette page n&apos;est affiché en pourcentage sous {MIN_SAMPLE} observations : en dessous, la tuile
                montre la fraction brute — ou «&nbsp;—&nbsp;» pour « Missions débloquées » et « Expirées sans déblocage »,
                dont le RPC ne remonte que le dénominateur. Même règle pour les variations période-sur-période : elles ne
                sont chiffrées que si la période précédente porte au moins {MIN_SAMPLE} événements.
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
    const [data, acquisition] = await Promise.all([fetchAnalytics(range), fetchAcquisition(range)])
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
                <RangeSelector active={range} basePath="/admin/analytics" />
            </header>
            {data ? <AnalyticsContent data={data} acquisition={acquisition} /> : <MigrationNotice />}
        </div>
    )
}
