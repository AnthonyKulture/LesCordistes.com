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

export type AnalyticsOverview = {
  current: AnalyticsPeriodMetrics
  previous: AnalyticsPeriodMetrics
  all_time: AnalyticsAllTime
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
