/**
 * fetchContacts — lecture serveur directe du CRM (sans HTTP).
 *
 * Appelle les deux RPC de la migration 20260902a via createSupabaseAdminClient :
 *   · admin_contacts_list(p_q, p_stage, p_audience, p_has_account, p_source, p_limit)
 *   · admin_contact_detail(p_contact_id)
 *
 * Repli : si les fonctions n'existent pas encore en base (migration non
 * appliquée), on retourne `null` avec un warn nommant la migration — jamais
 * d'exception. Le code tourne donc AVANT et APRÈS son déploiement, et l'écran
 * affiche un état vide propre. Même doctrine que fetchAnalytics / fetchOpsStats
 * (PGRST202 = fonction absente côté PostgREST, 42883 côté Postgres).
 *
 * ⚠️ Import serveur uniquement (ne pas importer dans un 'use client').
 */

import { createSupabaseAdminClient } from '@/lib/supabase-server'
import type {
  ContactAudience,
  ContactDetail,
  ContactEvent,
  ContactFilters,
  ContactListRow,
  LifecycleStage,
} from '@/lib/types/crm'
import { isContactAudience, isLifecycleStage } from '@/lib/types/crm'

const MIGRATION = '20260902a-contact-socle'
const DEFAULT_LIMIT = 200
const MAX_LIMIT = 1000

type RpcError = { code?: string; message?: string } | null

/**
 * Vue structurelle minimale du client admin : les fonctions de 20260902a ne
 * figurent pas dans `database.types.ts` (fichier généré), `.rpc()` typé les
 * rejetterait. On restreint la surface au strict nécessaire plutôt que de
 * caster en `any`.
 */
type RpcClient = {
  rpc: (
    fn: string,
    args: Record<string, unknown>
  ) => PromiseLike<{ data: unknown; error: RpcError }>
}

function isMissingFunction(error: RpcError): boolean {
  return error?.code === 'PGRST202' || error?.code === '42883'
}

function rpcClient(): RpcClient {
  return createSupabaseAdminClient() as unknown as RpcClient
}

// ── Sérialisation stricte ───────────────────────────────────────────────────
// Les RPC renvoient du jsonb : tout ce qui en sort est `unknown` tant qu'on ne
// l'a pas vérifié. Aucune valeur n'est supposée présente.

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function strOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null
}

function num(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function bool(value: unknown): boolean {
  return value === true
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : []
}

function stage(value: unknown): LifecycleStage {
  return isLifecycleStage(value) ? value : 'nouveau'
}

function audience(value: unknown): ContactAudience {
  return isContactAudience(value) ? value : 'unknown'
}

function toListRow(raw: unknown): ContactListRow | null {
  const r = asRecord(raw)
  if (!r || typeof r.id !== 'string') return null

  return {
    id: r.id,
    email: str(r.email),
    full_name: strOrNull(r.full_name),
    phone: strOrNull(r.phone),
    audience_type: audience(r.audience_type),
    lifecycle_stage: stage(r.lifecycle_stage),
    last_activity_at: strOrNull(r.last_activity_at),
    created_at: str(r.created_at),
    has_account: bool(r.has_account),
    marketing_opt_in: bool(r.marketing_opt_in),
    sources: stringArray(r.sources),
    open_actions: num(r.open_actions),
  }
}

function toEvent(raw: unknown): ContactEvent | null {
  const r = asRecord(raw)
  if (!r || typeof r.id !== 'string') return null

  return {
    id: r.id,
    contact_id: str(r.contact_id),
    kind: str(r.kind),
    occurred_at: str(r.occurred_at),
    title: str(r.title),
    detail: strOrNull(r.detail),
    payload: asRecord(r.payload) ?? {},
    actor: strOrNull(r.actor),
  }
}

function toJob(raw: unknown): ContactDetail['jobs'][number] | null {
  const r = asRecord(raw)
  if (!r || typeof r.id !== 'string') return null

  return {
    id: r.id,
    title: str(r.title),
    status: str(r.status),
    created_at: str(r.created_at),
    slug: strOrNull(r.slug),
  }
}

function toCredits(raw: unknown): ContactDetail['credits'] {
  const r = asRecord(raw)
  if (!r) return null

  return {
    balance: num(r.balance),
    purchased_cents: num(r.purchased_cents),
    unlocks: num(r.unlocks),
  }
}

// ── API publique ────────────────────────────────────────────────────────────

export async function fetchContacts(filters: ContactFilters): Promise<ContactListRow[] | null> {
  const q = filters.q?.trim()
  const limit = Math.min(Math.max(filters.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT)

  const { data, error } = await rpcClient().rpc('admin_contacts_list', {
    p_q: q && q.length > 0 ? q : null,
    p_stage: filters.stage ?? null,
    p_audience: filters.audience ?? null,
    p_has_account: filters.hasAccount ?? null,
    p_source: filters.source ?? null,
    p_limit: limit,
  })

  if (error) {
    if (isMissingFunction(error)) {
      console.warn(
        `[fetchContacts] RPC admin_contacts_list indisponible — migration ${MIGRATION} à appliquer :`,
        error.message ?? 'fonction absente'
      )
    } else {
      console.error('[fetchContacts] erreur RPC :', error.message ?? 'réponse vide')
    }
    return null
  }

  if (!Array.isArray(data)) {
    console.warn(`[fetchContacts] réponse inattendue (migration ${MIGRATION} à appliquer ?)`)
    return null
  }

  return data
    .map(toListRow)
    .filter((row): row is ContactListRow => row !== null)
}

export async function fetchContactDetail(id: string): Promise<ContactDetail | null> {
  if (!id) return null

  const { data, error } = await rpcClient().rpc('admin_contact_detail', {
    p_contact_id: id,
  })

  if (error) {
    if (isMissingFunction(error)) {
      console.warn(
        `[fetchContactDetail] RPC admin_contact_detail indisponible — migration ${MIGRATION} à appliquer :`,
        error.message ?? 'fonction absente'
      )
    } else {
      console.error('[fetchContactDetail] erreur RPC :', error.message ?? 'réponse vide')
    }
    return null
  }

  // Contact introuvable : le RPC ne renvoie aucune ligne → data null.
  const root = asRecord(data)
  if (!root) return null

  const contact = toListRow(root.contact)
  if (!contact) {
    console.warn(`[fetchContactDetail] fiche ${id} illisible (migration ${MIGRATION} à jour ?)`)
    return null
  }

  const rawContact = asRecord(root.contact) ?? {}

  return {
    contact: {
      ...contact,
      city: strOrNull(rawContact.city),
      company_name: strOrNull(rawContact.company_name),
      user_id: strOrNull(rawContact.user_id),
      unsubscribed_at: strOrNull(rawContact.unsubscribed_at),
      consent_at: strOrNull(rawContact.consent_at),
    },
    events: Array.isArray(root.events)
      ? root.events.map(toEvent).filter((e): e is ContactEvent => e !== null)
      : [],
    jobs: Array.isArray(root.jobs)
      ? root.jobs
          .map(toJob)
          .filter((j): j is ContactDetail['jobs'][number] => j !== null)
      : [],
    credits: toCredits(root.credits),
  }
}
