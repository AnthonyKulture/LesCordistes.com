/**
 * fetchAnalytics — fonction serveur directe (sans HTTP).
 *
 * Appelle les deux RPC de la migration 20260901b en parallèle :
 *   · admin_analytics_overview(p_from, p_to) — tuiles période courante + précédente
 *   · admin_analytics_series(p_months)       — série mensuelle pour les graphiques
 *
 * Repli : si les fonctions n'existent pas encore en base (migration non
 * appliquée), retourne null avec un warn explicite — la page affiche alors un
 * état vide propre. Même doctrine que fetchOpsStats : le code fonctionne avant
 * ET après la migration (PGRST202 = fonction absente côté PostgREST, 42883 =
 * fonction absente côté Postgres).
 *
 * ⚠️ Import serveur uniquement (ne pas importer dans 'use client').
 */

import { createSupabaseAdminClient } from '@/lib/supabase-server'
import type {
  AnalyticsData,
  AnalyticsOverview,
  AnalyticsMonthPoint,
  AnalyticsOutcomes,
  AnalyticsRange,
} from '@/lib/types/ops'

// La fonction en base peut précéder 20260903a : la clef 'outcomes' est alors
// absente du jsonb. On la modélise ici plutôt que de mentir dans le cast.
type AnalyticsOverviewResponse = Omit<AnalyticsOverview, 'outcomes'> & {
  outcomes?: AnalyticsOutcomes
}

const RANGE_DAYS: Record<AnalyticsRange, number> = {
  '30d': 30,
  '90d': 90,
  '12m': 365,
}

const SERIES_MONTHS = 12

type RpcError = { code?: string; message?: string } | null

function isMissingFunction(error: RpcError): boolean {
  return error?.code === 'PGRST202' || error?.code === '42883'
}

export async function fetchAnalytics(range: AnalyticsRange): Promise<AnalyticsData | null> {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const admin = createSupabaseAdminClient() as any

  const to = new Date()
  const from = new Date(to.getTime() - RANGE_DAYS[range] * 86_400_000)

  const [overviewRes, seriesRes] = await Promise.all([
    admin.rpc('admin_analytics_overview', {
      p_from: from.toISOString(),
      p_to: to.toISOString(),
    }) as Promise<{ data: AnalyticsOverviewResponse | null; error: RpcError }>,
    admin.rpc('admin_analytics_series', {
      p_months: SERIES_MONTHS,
    }) as Promise<{ data: AnalyticsMonthPoint[] | null; error: RpcError }>,
  ])

  if (overviewRes.error || seriesRes.error) {
    const err = overviewRes.error ?? seriesRes.error
    if (isMissingFunction(overviewRes.error) || isMissingFunction(seriesRes.error)) {
      console.warn(
        '[fetchAnalytics] RPC analytics indisponible — migration 20260901b à appliquer :',
        err?.message ?? 'fonction absente'
      )
    } else {
      console.error('[fetchAnalytics] erreur RPC :', err?.message ?? 'réponse vide')
    }
    return null
  }

  if (!overviewRes.data || !seriesRes.data) {
    console.warn('[fetchAnalytics] réponse vide des RPC analytics (migration 20260901b à appliquer ?)')
    return null
  }

  const { outcomes, ...overview } = overviewRes.data
  if (!outcomes) {
    console.warn(
      "[fetchAnalytics] section 'outcomes' absente — migration 20260903a à appliquer ; le reste de la page reste servi."
    )
  }

  return {
    overview: { ...overview, outcomes: outcomes ?? null },
    series: seriesRes.data,
  }
}

export function isAnalyticsRange(value: string | undefined): value is AnalyticsRange {
  return value === '30d' || value === '90d' || value === '12m'
}
