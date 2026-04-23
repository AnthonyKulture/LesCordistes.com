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
}

// ---------- Chat (tool use multi-turn) ----------
export type ToolUseBlock = {
  type: 'tool_use'
  id: string
  name: string
  input: Record<string, unknown>
}
export type ToolResultBlock = {
  type: 'tool_result'
  tool_use_id: string
  content: string
  is_error?: boolean
}
export type TextBlock = { type: 'text'; text: string }

export type ContentBlock = TextBlock | ToolUseBlock | ToolResultBlock

// Format supporté :
// - legacy : content: string (équivalent à [{type:'text',text}])
// - tool use : content: ContentBlock[]
export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string | ContentBlock[]
}

export type ChatContextType = 'job' | 'profile' | 'stats' | 'free'

export type ChatRequest = {
  // Si présent : un nouveau message utilisateur à ajouter à l'historique
  message?: string
  // Si présent : la requête est un tool_result à ré-injecter (multi-turn)
  tool_results?: Array<{ tool_use_id: string; content: string; is_error?: boolean }>
  context?: {
    type: ChatContextType
    id?: string
    data?: Job | Profile | OpsStats | Record<string, unknown>
  }
  history: ChatMessage[]
  fast?: boolean // true => haiku, false/undef => sonnet
  enable_tools?: boolean // true (défaut) sauf raison particulière
}

// Outils read-only — auto-exécutés sans confirmation admin.
// Synchronisé avec src/lib/ops/tools.ts (source de vérité serveur).
export const READ_ONLY_TOOL_NAMES: ReadonlySet<string> = new Set([
  'search_jobs',
  'get_job',
  'search_profiles',
  'get_profile',
  'get_stats',
  'list_pending_missions',
])

// Outils destructifs — dialog confirm rouge.
export const DESTRUCTIVE_TOOL_NAMES: ReadonlySet<string> = new Set([
  'reject_mission',
  'archive_mission',
  'adjust_credits',
  'update_profile_fields', // peut changer un rôle — sensible
  'send_email', // envoi externe — confirmation obligatoire
])

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
