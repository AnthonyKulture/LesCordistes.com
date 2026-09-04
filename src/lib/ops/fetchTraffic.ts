/**
 * fetchTraffic — lecture du trafic PostHog côté serveur (HogQL via l'API Query).
 *
 * Sept lectures, six requêtes : vue d'ensemble (jouée deux fois, période courante
 * puis période précédente de même durée), canaux, pages d'entrée, appareils,
 * régions, série hebdomadaire.
 *
 * ÉCHEC PAR BLOC, PAS PAR PAGE. fetchTraffic ne rend null que si la configuration
 * PostHog est absente. Chaque requête vit dans son propre try/catch : un échec met
 * SON champ à null et laisse les autres servis. Les noms de colonnes de la table
 * sessions ne sont pas testables ici (aucune variable POSTHOG_* en local) : une
 * seule requête fausse ne doit pas vider l'écran entier.
 *
 * Colonnes de la table sessions (docs PostHog, /docs/data/sessions) : session_id,
 * $start_timestamp, $entry_pathname, $channel_type, $session_duration (secondes),
 * $pageview_count, $is_bounce. $device_type et $geoip_subdivision_1_name ne sont
 * PAS des colonnes de sessions : ce sont des propriétés d'événement, d'où le
 * regroupement par session côté events pour ces deux blocs.
 *
 * converting_sessions = sessions au cours desquelles un événement job_posted a eu
 * lieu — pas « missions attribuées à cette page ».
 *
 * Cache 1 h (unstable_cache) : la page admin est force-dynamic, PostHog ne doit
 * pas être interrogé à chaque rendu. Un échec TOTAL n'est pas mis en cache (la
 * fonction interne lève) ; un échec partiel l'est, comme le reste du résultat.
 *
 * ⚠️ Import serveur uniquement (ne pas importer dans 'use client').
 */

import { unstable_cache } from 'next/cache'
import type {
  AnalyticsRange,
  TrafficChannelRow,
  TrafficData,
  TrafficDeviceRow,
  TrafficEntryPageRow,
  TrafficGeoRow,
  TrafficOverview,
  TrafficWeekPoint,
} from '@/lib/types/ops'
import {
  isPageType,
  num,
  pageTypeExpr,
  readPostHogConfig,
  runHogQL,
  type PostHogConfig,
  type Row,
} from '@/lib/ops/posthogQuery'

const RANGE_DAYS: Record<AnalyticsRange, number> = {
  '30d': 30,
  '90d': 90,
  '12m': 365,
}

const CACHE_SECONDS = 3600
export const ENTRY_PAGES_LIMIT = 30
export const GEO_LIMIT = 15
const DAY_MS = 86_400_000

// Un écran de trafic qui compte la navigation de l'équipe sur /admin se ment à
// lui-même. On filtre côté sessions (page d'entrée) et côté pages vues ; pas dans
// l'agrégat de conversions, où un job_posted sans $pathname serait perdu.
const NOT_ADMIN_SESSION = "coalesce(s.$entry_pathname, '') NOT LIKE '/admin%'"
const NOT_ADMIN_PAGEVIEW = "coalesce(properties.$pathname, '') NOT LIKE '/admin%'"

function bound(daysAgo: number): string {
  return daysAgo === 0 ? 'now()' : `now() - INTERVAL ${daysAgo} DAY`
}

// Agrégat par session côté events : une ligne par session, jamais deux, pour que
// la jointure avec sessions reste 1:1 et n'altère ni les count ni les médianes.
function sessionEventsSubquery(fromDays: number, toDays: number, extra: readonly string[] = []): string {
  const columns = [
    'properties.$session_id AS session_id',
    "countIf(event = 'job_posted') AS conversions",
    ...extra,
  ]
  return `SELECT
      ${columns.join(',\n      ')}
    FROM events
    WHERE timestamp >= ${bound(fromDays)}
      AND timestamp < ${bound(toDays)}
      AND event IN ('$pageview', 'job_posted')
      AND notEmpty(properties.$session_id)
    GROUP BY session_id`
}

// La table sessions ne porte pas de person_id (seulement distinct_id, qui ignore
// la réconciliation d'identités) : les visiteurs et les pages vues viennent donc
// des events, agrégés à part puis recollés. Deux agrégats d'une ligne chacun :
// la jointure ne peut pas fausser la médiane.
function overviewQuery(fromDays: number, toDays: number): string {
  return `
SELECT
  s.sessions AS sessions,
  e.visitors AS visitors,
  e.pageviews AS pageviews,
  s.bounce_sessions AS bounce_sessions,
  s.bounce_eligible_sessions AS bounce_eligible_sessions,
  s.median_duration_s AS median_duration_s,
  s.pages_per_session AS pages_per_session
FROM
  (
    SELECT
      uniq(session_id) AS sessions,
      uniqIf(session_id, $is_bounce = 1) AS bounce_sessions,
      uniqIf(session_id, isNotNull($is_bounce)) AS bounce_eligible_sessions,
      median($session_duration) AS median_duration_s,
      avg($pageview_count) AS pages_per_session
    FROM sessions
    WHERE $start_timestamp >= ${bound(fromDays)}
      AND $start_timestamp < ${bound(toDays)}
      AND coalesce($entry_pathname, '') NOT LIKE '/admin%'
  ) AS s
  CROSS JOIN
  (
    SELECT
      uniq(person_id) AS visitors,
      count() AS pageviews
    FROM events
    WHERE event = '$pageview'
      AND timestamp >= ${bound(fromDays)}
      AND timestamp < ${bound(toDays)}
      AND ${NOT_ADMIN_PAGEVIEW}
  ) AS e`.trim()
}

function channelsQuery(fromDays: number, toDays: number): string {
  return `
SELECT
  coalesce(nullIf(s.$channel_type, ''), 'Non attribué') AS label,
  uniq(s.session_id) AS sessions,
  uniqIf(e.person_id, notEmpty(e.session_id)) AS visitors,
  uniqIf(s.session_id, e.conversions > 0) AS converting_sessions
FROM sessions AS s
LEFT JOIN (
    ${sessionEventsSubquery(fromDays, toDays, ['any(person_id) AS person_id'])}
  ) AS e ON e.session_id = s.session_id
WHERE s.$start_timestamp >= ${bound(fromDays)}
  AND s.$start_timestamp < ${bound(toDays)}
  AND ${NOT_ADMIN_SESSION}
GROUP BY label
ORDER BY sessions DESC`.trim()
}

function entryPagesQuery(fromDays: number, toDays: number): string {
  return `
SELECT
  coalesce(nullIf(s.$entry_pathname, ''), '(inconnue)') AS pathname,
  ${pageTypeExpr("coalesce(s.$entry_pathname, '')")} AS page_type,
  uniq(s.session_id) AS sessions,
  uniqIf(s.session_id, s.$is_bounce = 1) AS bounce_sessions,
  uniqIf(s.session_id, e.conversions > 0) AS converting_sessions
FROM sessions AS s
LEFT JOIN (
    ${sessionEventsSubquery(fromDays, toDays)}
  ) AS e ON e.session_id = s.session_id
WHERE s.$start_timestamp >= ${bound(fromDays)}
  AND s.$start_timestamp < ${bound(toDays)}
  AND ${NOT_ADMIN_SESSION}
GROUP BY pathname, page_type
ORDER BY sessions DESC
LIMIT ${ENTRY_PAGES_LIMIT}`.trim()
}

function devicesQuery(fromDays: number, toDays: number): string {
  return `
SELECT
  coalesce(nullIf(e.device_type, ''), 'Inconnu') AS label,
  uniq(s.session_id) AS sessions,
  uniqIf(s.session_id, e.conversions > 0) AS converting_sessions
FROM sessions AS s
LEFT JOIN (
    ${sessionEventsSubquery(fromDays, toDays, ['any(properties.$device_type) AS device_type'])}
  ) AS e ON e.session_id = s.session_id
WHERE s.$start_timestamp >= ${bound(fromDays)}
  AND s.$start_timestamp < ${bound(toDays)}
  AND ${NOT_ADMIN_SESSION}
GROUP BY label
ORDER BY sessions DESC`.trim()
}

function geoQuery(fromDays: number, toDays: number): string {
  return `
SELECT
  coalesce(nullIf(e.region, ''), 'Inconnue') AS label,
  uniq(s.session_id) AS sessions,
  uniqIf(s.session_id, e.conversions > 0) AS converting_sessions
FROM sessions AS s
LEFT JOIN (
    ${sessionEventsSubquery(fromDays, toDays, ['any(properties.$geoip_subdivision_1_name) AS region'])}
  ) AS e ON e.session_id = s.session_id
WHERE s.$start_timestamp >= ${bound(fromDays)}
  AND s.$start_timestamp < ${bound(toDays)}
  AND ${NOT_ADMIN_SESSION}
GROUP BY label
ORDER BY sessions DESC
LIMIT ${GEO_LIMIT}`.trim()
}

// toStartOfWeek(…, 1) : mode 1 = semaine commençant le lundi (ISO).
function seriesQuery(fromDays: number, toDays: number): string {
  return `
SELECT
  toStartOfWeek(toTimeZone(s.$start_timestamp, 'UTC'), 1) AS week,
  uniq(s.session_id) AS sessions,
  uniqIf(s.session_id, e.conversions > 0) AS converting_sessions
FROM sessions AS s
LEFT JOIN (
    ${sessionEventsSubquery(fromDays, toDays)}
  ) AS e ON e.session_id = s.session_id
WHERE s.$start_timestamp >= ${bound(fromDays)}
  AND s.$start_timestamp < ${bound(toDays)}
  AND ${NOT_ADMIN_SESSION}
GROUP BY week
ORDER BY week ASC`.trim()
}

// null ≠ 0 : une médiane sans session n'est pas « zéro seconde ».
function numOrNull(value: unknown, decimals: number): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return null
  const factor = 10 ** decimals
  return Math.round(n * factor) / factor
}

function parseOverview(rows: Row[]): TrafficOverview {
  const r: Row = rows[0] ?? {}
  return {
    sessions: num(r.sessions),
    visitors: num(r.visitors),
    pageviews: num(r.pageviews),
    bounce_sessions: num(r.bounce_sessions),
    bounce_eligible_sessions: num(r.bounce_eligible_sessions),
    median_duration_s: numOrNull(r.median_duration_s, 0),
    pages_per_session: numOrNull(r.pages_per_session, 2),
  }
}

function parseChannels(rows: Row[]): TrafficChannelRow[] {
  return rows.map(r => ({
    label: String(r.label ?? 'Non attribué'),
    sessions: num(r.sessions),
    visitors: num(r.visitors),
    converting_sessions: num(r.converting_sessions),
  }))
}

function parseEntryPages(rows: Row[]): TrafficEntryPageRow[] {
  return rows.map(r => ({
    pathname: String(r.pathname ?? '(inconnue)'),
    page_type: isPageType(r.page_type) ? r.page_type : 'autre',
    sessions: num(r.sessions),
    bounce_sessions: num(r.bounce_sessions),
    converting_sessions: num(r.converting_sessions),
  }))
}

function parseDevices(rows: Row[]): TrafficDeviceRow[] {
  return rows.map(r => ({
    label: String(r.label ?? 'Inconnu'),
    sessions: num(r.sessions),
    converting_sessions: num(r.converting_sessions),
  }))
}

function parseGeo(rows: Row[]): TrafficGeoRow[] {
  return rows.map(r => ({
    label: String(r.label ?? 'Inconnue'),
    sessions: num(r.sessions),
    converting_sessions: num(r.converting_sessions),
  }))
}

function mondayUTC(date: Date): Date {
  const shift = (date.getUTCDay() + 6) % 7
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - shift))
}

// Les semaines sans session sont absentes du résultat : on les rétablit à 0 pour
// livrer une série continue, sinon la courbe recolle deux dates éloignées.
function parseSeries(rows: Row[], days: number): TrafficWeekPoint[] {
  const byWeek = new Map<string, TrafficWeekPoint>()
  for (const r of rows) {
    const week = String(r.week ?? '').slice(0, 10)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(week)) continue
    byWeek.set(week, {
      week,
      sessions: num(r.sessions),
      converting_sessions: num(r.converting_sessions),
    })
  }
  // Les deux extrémités sont des semaines coupées par la fenêtre glissante : la
  // semaine d'entrée et la semaine en cours. Les tracer dessine une chute finale
  // qui n'est qu'un seau incomplet — et LineChart met justement le dernier point
  // en gras. On ne garde que les semaines pleines.
  const now = new Date()
  const WEEK_MS = 7 * DAY_MS
  const first = mondayUTC(new Date(now.getTime() - days * DAY_MS)).getTime() + WEEK_MS
  const last = mondayUTC(now).getTime() - WEEK_MS
  const out: TrafficWeekPoint[] = []
  for (let t = first; t <= last; t += WEEK_MS) {
    const week = new Date(t).toISOString().slice(0, 10)
    out.push(byWeek.get(week) ?? { week, sessions: 0, converting_sessions: 0 })
  }
  return out
}

async function block<T>(label: string, run: () => Promise<T>): Promise<T | null> {
  try {
    return await run()
  } catch (e) {
    console.warn(`[trafic] ${label} :`, e instanceof Error ? e.message : String(e))
    return null
  }
}

function emptyTraffic(range: AnalyticsRange): TrafficData {
  return {
    range,
    overview: null,
    previous: null,
    channels: null,
    entry_pages: null,
    devices: null,
    geo: null,
    series: null,
  }
}

async function loadTraffic(cfg: PostHogConfig, range: AnalyticsRange): Promise<TrafficData> {
  const days = RANGE_DAYS[range]
  // L'API Query PostHog limite à 3 requêtes simultanées par projet.
  const [overview, previous, channels] = await Promise.all([
    block('vue d’ensemble', async () =>
      parseOverview(await runHogQL(cfg, 'trafic/vue', overviewQuery(days, 0)))
    ),
    block('période précédente', async () =>
      parseOverview(await runHogQL(cfg, 'trafic/précédent', overviewQuery(days * 2, days)))
    ),
    block('canaux', async () =>
      parseChannels(await runHogQL(cfg, 'trafic/canaux', channelsQuery(days, 0)))
    ),
  ])
  const [entryPages, devices, geo] = await Promise.all([
    block('pages d’entrée', async () =>
      parseEntryPages(await runHogQL(cfg, 'trafic/entrées', entryPagesQuery(days, 0)))
    ),
    block('appareils', async () =>
      parseDevices(await runHogQL(cfg, 'trafic/appareils', devicesQuery(days, 0)))
    ),
    block('régions', async () => parseGeo(await runHogQL(cfg, 'trafic/régions', geoQuery(days, 0)))),
  ])
  const series = await block('série hebdomadaire', async () =>
    parseSeries(await runHogQL(cfg, 'trafic/série', seriesQuery(days, 0)), days)
  )
  const data: TrafficData = {
    range,
    overview,
    previous,
    channels,
    entry_pages: entryPages,
    devices,
    geo,
    series,
  }
  // Panne totale (clé révoquée, PostHog injoignable) : on lève pour que le cache
  // ne fige pas un écran vide pendant une heure. Un échec partiel, lui, est mis
  // en cache avec le reste — c'est un bloc, pas une panne.
  const blocks = [overview, previous, channels, entryPages, devices, geo, series]
  if (blocks.every(b => b === null)) throw new Error('les sept lectures ont échoué')
  return data
}

export async function fetchTraffic(range: AnalyticsRange): Promise<TrafficData | null> {
  const cfg = readPostHogConfig()
  if (!cfg) {
    console.warn('[trafic] PostHog non configuré')
    return null
  }
  // cfg est capturé par fermeture, pas passé en argument : les arguments entrent
  // dans la clé de cache, la clé API n'a rien à y faire.
  const cached = unstable_cache(() => loadTraffic(cfg, range), ['trafic', range], {
    revalidate: CACHE_SECONDS,
  })
  try {
    return await cached()
  } catch (e) {
    console.warn('[trafic] lecture PostHog en échec :', e instanceof Error ? e.message : String(e))
    return emptyTraffic(range)
  }
}
