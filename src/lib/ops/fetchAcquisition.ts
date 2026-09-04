/**
 * fetchAcquisition — lecture PostHog côté serveur (HogQL via l'API Query).
 *
 * Quatre requêtes sur la table events :
 *   · trafic par type de page (pageviews / sessions / visiteurs)
 *   · entonnoir demande (personnes distinctes par étape, sans ordre)
 *   · entonnoir offre (idem)
 *   · série mensuelle sur 12 mois (sessions SEO, missions, déblocages)
 *
 * Repli : clé ou projet absents, HTTP ≠ 2xx, réseau, timeout, réponse mal
 * formée → null + warn. La page affiche alors un état vide propre, jamais
 * d'erreur. Le résultat est mis en cache 1 h (unstable_cache) : la page est
 * force-dynamic et PostHog ne doit pas être interrogé à chaque rendu. Un échec
 * n'est PAS mis en cache — la fonction interne lève, l'enveloppe rattrape.
 *
 * Prérequis : clé personnelle PostHog avec le scope query:read, limitée au
 * projet. Les mois de la série sont calculés en UTC (toTimeZone) pour rester
 * alignés sur admin_analytics_series ; /cordiste-copropriete et
 * /cordiste-vs-echafaudage sont des pages éditoriales, pas des pages ville.
 *
 * ⚠️ Import serveur uniquement (ne pas importer dans 'use client').
 */

import { unstable_cache } from 'next/cache'
import type {
  AcquisitionData,
  AcquisitionDemandFunnel,
  AcquisitionMonthPoint,
  AcquisitionPageType,
  AcquisitionSupplyFunnel,
  AcquisitionTraffic,
  AnalyticsRange,
} from '@/lib/types/ops'

const RANGE_DAYS: Record<AnalyticsRange, number> = {
  '30d': 30,
  '90d': 90,
  '12m': 365,
}

const SERIES_MONTHS = 12
const TIMEOUT_MS = 15_000
const CACHE_SECONDS = 3600
const DEFAULT_HOST = 'https://eu.posthog.com'

const PAGE_TYPES: readonly AcquisitionPageType[] = [
  'ville_service',
  'ville',
  'blog',
  'board',
  'mission',
  'post_job',
  'home',
  'profil_pro',
  'credits',
  'admin',
  'autre',
]

type PostHogConfig = { host: string; projectId: string; apiKey: string }

type HogQLResponse = { columns: string[]; results: unknown[][] }

type Row = Record<string, unknown>

function readConfig(): PostHogConfig | null {
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY
  const projectId = process.env.POSTHOG_PROJECT_ID
  if (!apiKey || !projectId) return null
  const host = (process.env.POSTHOG_HOST || DEFAULT_HOST).replace(/\/+$/, '')
  return { host, projectId, apiKey }
}

function isHogQLResponse(value: unknown): value is HogQLResponse {
  if (typeof value !== 'object' || value === null) return false
  const v = value as { columns?: unknown; results?: unknown }
  return (
    Array.isArray(v.columns) &&
    v.columns.every(c => typeof c === 'string') &&
    Array.isArray(v.results) &&
    v.results.every(r => Array.isArray(r))
  )
}

function toRows(res: HogQLResponse): Row[] {
  return res.results.map(row => Object.fromEntries(res.columns.map((col, i) => [col, row[i]])))
}

function num(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

function isPageType(value: unknown): value is AcquisitionPageType {
  return typeof value === 'string' && (PAGE_TYPES as readonly string[]).includes(value)
}

function trafficQuery(days: number): string {
  return `
SELECT
  multiIf(
    properties.$pathname IN ('/cordiste-copropriete', '/cordiste-vs-echafaudage'), 'autre',
    properties.$pathname LIKE '/cordiste-%/%', 'ville_service',
    properties.$pathname LIKE '/cordiste-%', 'ville',
    properties.$pathname LIKE '/blog/%', 'blog',
    properties.$pathname = '/jobs', 'board',
    properties.$pathname LIKE '/jobs/%', 'mission',
    properties.$pathname = '/post-job', 'post_job',
    properties.$pathname = '/', 'home',
    properties.$pathname LIKE '/pros/%', 'profil_pro',
    properties.$pathname = '/credits', 'credits',
    properties.$pathname LIKE '/admin%', 'admin',
    'autre'
  ) AS page_type,
  count() AS pageviews,
  uniq(properties.$session_id) AS sessions,
  uniq(person_id) AS visitors
FROM events
WHERE event = '$pageview'
  AND timestamp >= now() - INTERVAL ${days} DAY
GROUP BY page_type
ORDER BY sessions DESC`.trim()
}

function demandQuery(days: number): string {
  return `
SELECT
  uniqIf(person_id, event = '$pageview' AND ((properties.$pathname LIKE '/cordiste-%' AND properties.$pathname NOT IN ('/cordiste-copropriete', '/cordiste-vs-echafaudage')) OR properties.$pathname LIKE '/blog/%')) AS seo_visitors,
  uniqIf(person_id, event = '$pageview' AND properties.$pathname = '/post-job') AS post_job_visitors,
  uniqIf(person_id, event = 'wizard_path_chosen') AS path_chosen,
  uniqIf(person_id, event = 'wizard_path_chosen' AND properties.path = 'project') AS path_project,
  uniqIf(person_id, event = 'wizard_path_chosen' AND properties.path = 'quick') AS path_quick,
  uniqIf(person_id, event = 'wizard_path_chosen' AND properties.path = 'callback') AS path_callback,
  uniqIf(person_id, event = 'wizard_step_view') AS wizard_entered,
  uniqIf(person_id, event = 'wizard_step_view' AND properties.job_type = 'standard' AND toInt(properties.step) = 1) AS step_1,
  uniqIf(person_id, event = 'wizard_step_view' AND properties.job_type = 'standard' AND toInt(properties.step) = 2) AS step_2,
  uniqIf(person_id, event = 'wizard_step_view' AND properties.job_type = 'standard' AND toInt(properties.step) = 3) AS step_3,
  uniqIf(person_id, event = 'wizard_step_view' AND properties.job_type = 'standard' AND toInt(properties.step) = 4) AS step_4,
  uniqIf(person_id, event = 'wizard_step_view' AND properties.job_type = 'standard' AND toInt(properties.step) = 5) AS step_5,
  uniqIf(person_id, event = 'job_posted') AS job_posted
FROM events
WHERE timestamp >= now() - INTERVAL ${days} DAY
  AND event IN ('$pageview', 'wizard_path_chosen', 'wizard_step_view', 'job_posted')`.trim()
}

function supplyQuery(days: number): string {
  return `
SELECT
  uniqIf(person_id, event = 'user_signed_up' AND properties.role = 'pro') AS pro_signups,
  uniqIf(person_id, event = 'job_detail_view' AND properties.viewer_role != 'admin') AS job_detail_views,
  uniqIf(person_id, event = 'unlock_blocked_no_credit') AS unlock_blocked,
  uniqIf(person_id, event = 'credits_page_view') AS credits_page_views,
  uniqIf(person_id, event = 'checkout_initiated') AS checkout_initiated,
  uniqIf(person_id, event = 'credits_purchased') AS credits_purchased,
  uniqIf(person_id, event = 'lead_unlocked') AS lead_unlocked
FROM events
WHERE timestamp >= now() - INTERVAL ${days} DAY
  AND event IN ('user_signed_up', 'job_detail_view', 'unlock_blocked_no_credit', 'credits_page_view', 'checkout_initiated', 'credits_purchased', 'lead_unlocked')`.trim()
}

function seriesQuery(months: number): string {
  return `
SELECT
  toStartOfMonth(toTimeZone(timestamp, 'UTC')) AS month,
  uniqIf(properties.$session_id, event = '$pageview' AND properties.$pathname LIKE '/cordiste-%' AND properties.$pathname NOT IN ('/cordiste-copropriete', '/cordiste-vs-echafaudage')) AS seo_sessions,
  countIf(event = 'job_posted') AS jobs_posted,
  countIf(event = 'lead_unlocked') AS leads_unlocked
FROM events
WHERE timestamp >= toStartOfMonth(toTimeZone(now(), 'UTC') - INTERVAL ${months - 1} MONTH)
  AND event IN ('$pageview', 'job_posted', 'lead_unlocked')
GROUP BY month
ORDER BY month ASC`.trim()
}

async function runHogQL(cfg: PostHogConfig, label: string, query: string): Promise<Row[]> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(`${cfg.host}/api/projects/${cfg.projectId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: { kind: 'HogQLQuery', query } }),
      signal: controller.signal,
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`HTTP ${res.status} (${label}) : ${body.slice(0, 200)}`)
    }
    const json: unknown = await res.json()
    if (!isHogQLResponse(json)) {
      throw new Error(`réponse inattendue (${label}) : ${JSON.stringify(json).slice(0, 200)}`)
    }
    return toRows(json)
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error(`timeout ${TIMEOUT_MS / 1000} s (${label})`)
    }
    throw e
  } finally {
    clearTimeout(timer)
  }
}

function parseTraffic(rows: Row[]): AcquisitionTraffic[] {
  return rows.map(r => ({
    page_type: isPageType(r.page_type) ? r.page_type : 'autre',
    pageviews: num(r.pageviews),
    sessions: num(r.sessions),
    visitors: num(r.visitors),
  }))
}

function parseDemand(rows: Row[]): AcquisitionDemandFunnel {
  const r: Row = rows[0] ?? {}
  return {
    seo_visitors: num(r.seo_visitors),
    post_job_visitors: num(r.post_job_visitors),
    path_chosen: num(r.path_chosen),
    wizard_entered: num(r.wizard_entered),
    path_by_kind: {
      project: num(r.path_project),
      quick: num(r.path_quick),
      callback: num(r.path_callback),
    },
    steps: [num(r.step_1), num(r.step_2), num(r.step_3), num(r.step_4), num(r.step_5)],
    job_posted: num(r.job_posted),
  }
}

function parseSupply(rows: Row[]): AcquisitionSupplyFunnel {
  const r: Row = rows[0] ?? {}
  return {
    pro_signups: num(r.pro_signups),
    job_detail_views: num(r.job_detail_views),
    unlock_blocked: num(r.unlock_blocked),
    credits_page_views: num(r.credits_page_views),
    checkout_initiated: num(r.checkout_initiated),
    credits_purchased: num(r.credits_purchased),
    lead_unlocked: num(r.lead_unlocked),
  }
}

// Les mois sans événement sont absents du résultat : on les rétablit à 0 pour
// livrer une série continue de SERIES_MONTHS points, comme admin_analytics_series.
function parseSeries(rows: Row[]): AcquisitionMonthPoint[] {
  const byMonth = new Map<string, AcquisitionMonthPoint>()
  for (const r of rows) {
    const month = String(r.month ?? '').slice(0, 7)
    if (!/^\d{4}-\d{2}$/.test(month)) continue
    byMonth.set(month, {
      month,
      seo_sessions: num(r.seo_sessions),
      jobs_posted: num(r.jobs_posted),
      leads_unlocked: num(r.leads_unlocked),
    })
  }
  const now = new Date()
  const out: AcquisitionMonthPoint[] = []
  for (let i = SERIES_MONTHS - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
    const month = d.toISOString().slice(0, 7)
    out.push(byMonth.get(month) ?? { month, seo_sessions: 0, jobs_posted: 0, leads_unlocked: 0 })
  }
  return out
}

async function loadAcquisition(cfg: PostHogConfig, range: AnalyticsRange): Promise<AcquisitionData> {
  const days = RANGE_DAYS[range]
  // L'API Query PostHog limite à 3 requêtes simultanées par projet.
  const [traffic, demand, supply] = await Promise.all([
    runHogQL(cfg, 'trafic', trafficQuery(days)),
    runHogQL(cfg, 'demande', demandQuery(days)),
    runHogQL(cfg, 'offre', supplyQuery(days)),
  ])
  const series = await runHogQL(cfg, 'série', seriesQuery(SERIES_MONTHS))
  return {
    range,
    traffic: parseTraffic(traffic),
    demand: parseDemand(demand),
    supply: parseSupply(supply),
    series: parseSeries(series),
  }
}

export async function fetchAcquisition(range: AnalyticsRange): Promise<AcquisitionData | null> {
  const cfg = readConfig()
  if (!cfg) {
    console.warn('[acquisition] PostHog non configuré')
    return null
  }
  // cfg est capturé par fermeture, pas passé en argument : les arguments entrent
  // dans la clé de cache, la clé API n'a rien à y faire.
  const cached = unstable_cache(() => loadAcquisition(cfg, range), ['acquisition', range], {
    revalidate: CACHE_SECONDS,
  })
  try {
    return await cached()
  } catch (e) {
    console.warn('[acquisition] lecture PostHog en échec :', e instanceof Error ? e.message : String(e))
    return null
  }
}
