/**
 * posthogQuery — transport partagé des lectures PostHog (HogQL via l'API Query).
 *
 * Extrait de fetchAcquisition pour que fetchAcquisition et fetchTraffic parlent
 * au même endpoint, avec le même timeout, la même gestion d'erreur et surtout la
 * MÊME classification des pathnames (pageTypeExpr) : deux copies de ce multiIf
 * divergeraient à la première page ajoutée.
 *
 * Erreur = throw. La décision de replier (null global ou null par bloc) revient
 * à l'appelant, elle diffère d'un écran à l'autre. Le message d'erreur porte le
 * statut HTTP et les 200 premiers caractères du corps, jamais la clé.
 *
 * ⚠️ Import serveur uniquement (ne pas importer dans 'use client').
 */

import type { AcquisitionPageType } from '@/lib/types/ops'

const TIMEOUT_MS = 15_000
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

export type PostHogConfig = { host: string; projectId: string; apiKey: string }

type HogQLResponse = { columns: string[]; results: unknown[][] }

export type Row = Record<string, unknown>

export function readPostHogConfig(): PostHogConfig | null {
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY
  const projectId = process.env.POSTHOG_PROJECT_ID
  if (!apiKey || !projectId) return null
  const host = (process.env.POSTHOG_HOST || DEFAULT_HOST).replace(/\/+$/, '')
  return { host, projectId, apiKey }
}

export function isHogQLResponse(value: unknown): value is HogQLResponse {
  if (typeof value !== 'object' || value === null) return false
  const v = value as { columns?: unknown; results?: unknown }
  return (
    Array.isArray(v.columns) &&
    v.columns.every(c => typeof c === 'string') &&
    Array.isArray(v.results) &&
    v.results.every(r => Array.isArray(r))
  )
}

export function toRows(res: HogQLResponse): Row[] {
  return res.results.map(row => Object.fromEntries(res.columns.map((col, i) => [col, row[i]])))
}

export function num(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

export function isPageType(value: unknown): value is AcquisitionPageType {
  return typeof value === 'string' && (PAGE_TYPES as readonly string[]).includes(value)
}

// La branche /cordiste-copropriete + /cordiste-vs-echafaudage passe en premier :
// ce sont des pages éditoriales, pas des pages ville, et elles matchent le LIKE.
export function pageTypeExpr(column: string): string {
  return `multiIf(
    ${column} IN ('/cordiste-copropriete', '/cordiste-vs-echafaudage'), 'autre',
    ${column} LIKE '/cordiste-%/%', 'ville_service',
    ${column} LIKE '/cordiste-%', 'ville',
    ${column} LIKE '/blog/%', 'blog',
    ${column} = '/jobs', 'board',
    ${column} LIKE '/jobs/%', 'mission',
    ${column} = '/post-job', 'post_job',
    ${column} = '/', 'home',
    ${column} LIKE '/pros/%', 'profil_pro',
    ${column} = '/credits', 'credits',
    ${column} LIKE '/admin%', 'admin',
    'autre'
  )`
}

export async function runHogQL(cfg: PostHogConfig, label: string, query: string): Promise<Row[]> {
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
