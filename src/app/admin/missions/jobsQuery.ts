/**
 * Source unique de la requête « liste des missions » du back-office.
 *
 * Partagée entre le Server Component `admin/missions/page.tsx` (rendu initial,
 * sans aller-retour HTTP) et la route `/api/ops/jobs` (changements d'onglet).
 * Les deux DOIVENT renvoyer exactement la même forme, sinon une carte perd des
 * champs au premier changement d'onglet.
 *
 * ⚠️ Module serveur uniquement — il importe le client service_role.
 */

import { createSupabaseAdminClient } from '@/lib/supabase-server'
import type { Job } from '@/lib/types/ops'

export const ADMIN_JOB_STATUSES = [
    'pending',
    'live',
    'rejected',
    'completed',
    'cancelled',
    'expired',
] as const
export type AdminJobStatus = typeof ADMIN_JOB_STATUSES[number]

export function isAdminJobStatus(v: string | undefined | null): v is AdminJobStatus {
    return !!v && (ADMIN_JOB_STATUSES as readonly string[]).includes(v)
}

/** Statuts exposés comme onglets dans MissionsList (`cancelled` n'en a pas). */
export const MISSION_TAB_STATUSES = ['pending', 'live', 'expired', 'rejected', 'completed'] as const
export type MissionTabStatus = typeof MISSION_TAB_STATUSES[number]

export function isMissionTabStatus(v: string | undefined | null): v is MissionTabStatus {
    return !!v && (MISSION_TAB_STATUSES as readonly string[]).includes(v)
}

/**
 * Colonnes réellement consommées par la liste admin (JobCard + recherche + computeLQS).
 * Tout le bloc B2B, les métadonnées de modération et la géoloc sont exclus : ils ne
 * sont lus que sur la fiche détail, qui a sa propre requête.
 *
 * `client_contact_info` est conservé : computeLQS() en dépend (+10 si téléphone
 * renseigné). Le retirer ferait silencieusement chuter le score de chaque carte.
 */
export const JOBS_LIST_COLUMNS = [
    'id',
    'title',
    'description',
    'category',
    'client_type',
    'location_city',
    'location_department',
    'status',
    'photos_url',
    'budget_min',
    'budget_max',
    'daily_rate',
    'client_contact_info',
    'revalidation_email_sent_at',
    'last_validated_at',
    'created_at',
].join(', ')

/**
 * PostgREST découpe `or=(…)` sur les virgules et les parenthèses : les laisser
 * passer casserait le filtre (400) au lieu de chercher.
 */
export function sanitizeSearch(raw: string): string {
    return raw.replace(/[,()\\*%]/g, ' ').trim().slice(0, 100)
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function fetchAdminJobs(
    status: AdminJobStatus,
    limit = 100
): Promise<Job[] | null> {
    try {
        const admin = createSupabaseAdminClient() as any
        const { data, error } = await admin
            .from('jobs')
            .select(JOBS_LIST_COLUMNS)
            .eq('status', status)
            .order('created_at', { ascending: false })
            .limit(limit)
        if (error) throw new Error(error.message)
        return (data ?? []) as unknown as Job[]
    } catch (err) {
        // Le client refera le fetch via /api/ops/jobs : on dégrade sans casser la page.
        console.error('[fetchAdminJobs] error:', err)
        return null
    }
}
