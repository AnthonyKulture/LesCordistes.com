// Types ops admin — dérivés du schéma Supabase et du domaine LesCordistes.
// Réutilise les types Job/Profile existants de src/types/index.ts pour rester DRY.

import type { Job, Profile, CreditTransaction } from '@/types'

export type { Job, Profile, CreditTransaction }

export type AdminAction = {
  id: string
  action: string
  target_table: string
  target_id: string | null
  payload: Record<string, unknown>
  performed_by: string | null
  created_at: string
}

export type Credits = {
  id: string
  pro_id: string
  balance: number
  updated_at: string
}

export type LeadFunnel = {
  id: string
  email: string
  phone: string | null
  category: string | null
  city: string | null
  step_reached: number
  source: string | null
  created_at: string
  updated_at: string
}

export type OpsStats = {
  jobs: {
    pending: number
    live: number
    rejected: number
    total_week: number
  }
  profiles: {
    total_pros: number
    total_clients: number
    new_week: number
    with_credits: number
  }
  credits: {
    total_sold: number
    total_spent: number
    avg_balance: number
  }
  leads: {
    total: number
    step_5: number
    last_week: number
  }
  top_cities: { city: string; count: number }[]
  recent_actions: AdminAction[]
  recent_unlocks: RecentUnlock[]
}

export type RecentUnlock = {
  id: string
  unlocked_at: string
  pro: {
    id: string
    full_name: string | null
    company_name: string | null
    avatar_url: string | null
  } | null
  job: {
    id: string
    title: string
    location_city: string | null
    status: string
  } | null
}

// Lead Quality Score — calculé côté client, jamais persisté
export type JobWithLQS = Job & { lqs: number }

export function computeLQS(job: Job): number {
  let score = 0
  if (job.description && job.description.length > 80) score += 20
  if (job.photos_url && job.photos_url.length > 0) score += 20
  if (job.location_department) score += 15
  if (job.budget_min || job.budget_max || job.daily_rate) score += 20
  if (
    job.client_type === 'copropriete_syndic' ||
    job.client_type === 'entreprise_tertiaire' ||
    job.client_type === 'entreprise_btp' ||
    job.client_type === 'industrie_energie'
  ) {
    score += 15
  }
  if (job.client_contact_info?.phone) score += 10
  return Math.min(score, 100)
}

export function lqsBadgeColor(lqs: number): 'red' | 'orange' | 'green' {
  if (lqs < 50) return 'red'
  if (lqs < 70) return 'orange'
  return 'green'
}

export type ProfileWithCredits = Profile & {
  credits_balance?: number
  unlocked_count?: number
}

// Analytics investisseur — sortie des RPC admin_analytics_overview / admin_analytics_series
// (migration 20260901b). Les ratios valent null quand le dénominateur est 0.

export type AnalyticsLiquidity = {
  cohort: number
  pct_unlocked: number | null
  median_hours_to_first_unlock: number | null
  avg_unlocks_per_mission: number | null
  pct_expired_no_unlock: number | null
}

export type AnalyticsDemand = {
  jobs_created: number
  mix_standard: number
  mix_renfort_pro: number
  wizard_leads: number
  wizard_completed: number
  wizard_completion: number | null
  moderated_total: number
  approved: number
  pct_approved: number | null
  median_hours_moderation: number | null
}

export type AnalyticsPeriodMetrics = {
  revenue_eur: number
  purchases: number
  buyers: number
  arpu_eur: number | null
  missions_moderated: number
  revenue_per_mission_eur: number | null
  liquidity: AnalyticsLiquidity
  supply: {
    new_pros: number
    active_pros: number
  }
  demand: AnalyticsDemand
  engagement: {
    conversations: number
    reviews: number
  }
}

export type AnalyticsAllTime = {
  buyers_total: number
  repeat_buyers: number
  repeat_rate: number | null
  total_pros: number
  complete_profiles: number
  pct_complete_profiles: number | null
}

// Issues des leads (migration 20260903a). Section CUMULATIVE — ni bornée par la
// période, ni assortie d'un 'previous'. Elle ne porte QUE des effectifs bruts :
// aucun pourcentage n'est calculé en base, c'est le rendu qui décide s'il a
// assez d'effectif pour en afficher un.

export type AnalyticsOutcomeBucket = {
  label: string
  solicited: number
  answered: number
  won: number
  lost: number
  no_response: number
  resolved: number
}

export type AnalyticsOutcomes = {
  delay_days: number
  funnel: {
    unlocks_total: number
    eligible: number
    solicited: number
    suppressed: number
    pending_solicitation: number
    answered: number
    awaiting_answer: number
  }
  answers: {
    won: number
    lost: number
    no_response: number
    resolved: number
  }
  acquisition: {
    won: number
    credits_answered: number
    credits_resolved: number
    credits_purchased: number
    eur_per_credit: number | null
  }
  cities_total: number
  by_city: AnalyticsOutcomeBucket[]
  by_job_type: AnalyticsOutcomeBucket[]
}

// outcomes vaut null quand la fonction en base est antérieure à 20260903a :
// la clef est alors absente du jsonb. Seule cette section se replie, le reste
// de la page reste servi (fetchAnalytics normalise undefined → null).
export type AnalyticsOverview = {
  current: AnalyticsPeriodMetrics
  previous: AnalyticsPeriodMetrics
  all_time: AnalyticsAllTime
  outcomes: AnalyticsOutcomes | null
}

export type AnalyticsMonthPoint = {
  month: string
  revenue_eur: number
  missions_published: number
  new_pros: number
  unlocks: number
}

export type AnalyticsData = {
  overview: AnalyticsOverview
  series: AnalyticsMonthPoint[]
}

export type AnalyticsRange = '30d' | '90d' | '12m'

// Acquisition — lecture PostHog (HogQL) côté serveur, cf. src/lib/ops/fetchAcquisition.ts.
// Les entonnoirs comptent des personnes distinctes par étape sur la période,
// SANS contrainte d'ordre entre les étapes : ce ne sont pas des cohortes.

export type AcquisitionPageType =
  | 'ville_service'
  | 'ville'
  | 'blog'
  | 'board'
  | 'mission'
  | 'post_job'
  | 'home'
  | 'profil_pro'
  | 'credits'
  | 'admin'
  | 'autre'

export type AcquisitionTraffic = {
  page_type: AcquisitionPageType
  pageviews: number
  sessions: number
  visitors: number
}

// Index 0 = étape 1 … index 4 = étape 5.
export type AcquisitionFunnelSteps = [number, number, number, number, number]

export type AcquisitionDemandFunnel = {
  seo_visitors: number
  post_job_visitors: number
  path_chosen: number
  path_by_kind: { project: number; quick: number; callback: number }
  wizard_entered: number
  steps: AcquisitionFunnelSteps
  job_posted: number
}

export type AcquisitionSupplyFunnel = {
  pro_signups: number
  job_detail_views: number
  unlock_blocked: number
  credits_page_views: number
  checkout_initiated: number
  credits_purchased: number
  lead_unlocked: number
}

export type AcquisitionMonthPoint = {
  month: string
  seo_sessions: number
  jobs_posted: number
  leads_unlocked: number
}

export type AcquisitionData = {
  range: AnalyticsRange
  traffic: AcquisitionTraffic[]
  demand: AcquisitionDemandFunnel
  supply: AcquisitionSupplyFunnel
  series: AcquisitionMonthPoint[]
}
