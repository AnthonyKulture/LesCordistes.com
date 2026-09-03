// Types du CONTACT UNIFIÉ (CRM admin).
//
// Source de vérité : migration 20260902a-contact-socle.sql.
//   · marketing_contacts est le PIVOT (identité = un email en minuscules) ;
//   · leads / contact_requests / pro_alert_subscriptions restent des tables de
//     capture reliées par contact_id ;
//   · contact_events est le journal unique (système + manuel).
//
// Ces types décrivent la forme JSON renvoyée par admin_contacts_list() et
// admin_contact_detail() — ne pas les diverger sans changer les deux RPC.

export type LifecycleStage =
  | 'nouveau'
  | 'engage'
  | 'converti'
  | 'actif'
  | 'dormant'
  | 'desinscrit'

export type ContactAudience = 'client' | 'pro' | 'unknown'

export type ContactListRow = {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  audience_type: ContactAudience
  lifecycle_stage: LifecycleStage
  last_activity_at: string | null
  created_at: string
  has_account: boolean
  marketing_opt_in: boolean
  sources: string[]
  /** Demandes de contact encore à traiter (contact_requests.status = 'new'). */
  open_actions: number
}

export type ContactEvent = {
  id: string
  contact_id: string
  kind: string
  occurred_at: string
  title: string
  detail: string | null
  payload: Record<string, unknown>
  /** null = système, sinon email de l'admin qui a posé l'événement. */
  actor: string | null
}

export type ContactDetail = {
  contact: ContactListRow & {
    city: string | null
    company_name: string | null
    user_id: string | null
    unsubscribed_at: string | null
    consent_at: string | null
  }
  events: ContactEvent[]
  jobs: Array<{
    id: string
    title: string
    status: string
    created_at: string
    slug: string | null
  }>
  /** null si le contact n'est pas un pro avec un compte. */
  credits: { balance: number; purchased_cents: number; unlocks: number } | null
}

export type ContactFilters = {
  q?: string
  stage?: LifecycleStage
  audience?: ContactAudience
  hasAccount?: boolean
  source?: string
  limit?: number
}

/**
 * Vocabulaire des `kind` d'événements. `ContactEvent.kind` reste un `string` :
 * la colonne SQL n'a volontairement pas de CHECK, un kind inconnu doit se
 * dégrader proprement côté UI plutôt que bloquer une écriture.
 */
export const SYSTEM_EVENT_KINDS = [
  'lead_captured',
  'wizard_progress',
  'contact_request',
  'signup',
  'job_posted',
  'job_moderated',
  'lead_unlocked',
  'credits_purchased',
  'credits_exhausted',
  'outcome_reported',
  'alert_subscribed',
  'unsubscribed',
] as const

export const MANUAL_EVENT_KINDS = ['note', 'call', 'email_sent', 'meeting'] as const

export type ManualEventKind = (typeof MANUAL_EVENT_KINDS)[number]

export const LIFECYCLE_STAGES: readonly LifecycleStage[] = [
  'nouveau',
  'engage',
  'converti',
  'actif',
  'dormant',
  'desinscrit',
]

export function isLifecycleStage(value: unknown): value is LifecycleStage {
  return typeof value === 'string' && (LIFECYCLE_STAGES as readonly string[]).includes(value)
}

export function isContactAudience(value: unknown): value is ContactAudience {
  return value === 'client' || value === 'pro' || value === 'unknown'
}

export function isManualEventKind(value: unknown): value is ManualEventKind {
  return typeof value === 'string' && (MANUAL_EVENT_KINDS as readonly string[]).includes(value)
}
