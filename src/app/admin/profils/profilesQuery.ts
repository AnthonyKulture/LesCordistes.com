/**
 * Source unique de la requête « liste des profils » du back-office.
 *
 * Partagée entre le Server Component `admin/profils/page.tsx` (rendu initial,
 * sans aller-retour HTTP) et la route `/api/ops/users` (changement de rôle,
 * recherche serveur). Les deux DOIVENT renvoyer exactement la même forme.
 *
 * ⚠️ Module serveur uniquement — il importe le client service_role.
 */

import { createSupabaseAdminClient } from '@/lib/supabase-server'
import type { ProfileWithCredits } from '@/lib/types/ops'

export const ADMIN_ROLES = ['client', 'pro', 'admin'] as const
export type AdminRole = typeof ADMIN_ROLES[number]

export function isAdminRole(v: string | undefined | null): v is AdminRole {
    return !!v && (ADMIN_ROLES as readonly string[]).includes(v)
}

/**
 * Colonnes consommées par la liste admin (ProfileCard + filtres zone/crédits/recherche).
 * `bio`, `equipment`, `portfolio_photos`, `skills`, `insurance_info` sont exclus :
 * volumineux et affichés uniquement sur la fiche détail.
 */
export const USERS_LIST_COLUMNS = [
    'id',
    'email',
    'role',
    'first_name',
    'last_name',
    'full_name',
    'company_name',
    'certifications',
    'intervention_zones',
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
export async function withCreditsBalance(
    admin: any,
    profiles: Array<{ id: string; [k: string]: unknown }>,
    role: string | null
): Promise<ProfileWithCredits[]> {
    const ids = profiles.map(p => p.id)
    let creditsMap = new Map<string, number>()
    // Le solde de crédits ne concerne que les pros.
    if (ids.length > 0 && role !== 'client' && role !== 'admin') {
        const { data: credits } = await admin.from('credits').select('pro_id, balance').in('pro_id', ids)
        creditsMap = new Map(
            ((credits ?? []) as Array<{ pro_id: string; balance: number }>).map(c => [
                c.pro_id,
                Number(c.balance) || 0,
            ])
        )
    }
    return profiles.map(p => ({
        ...p,
        credits_balance: creditsMap.get(p.id) ?? 0,
    })) as unknown as ProfileWithCredits[]
}

export async function fetchAdminProfiles(
    role: AdminRole,
    limit = 200
): Promise<ProfileWithCredits[] | null> {
    try {
        const admin = createSupabaseAdminClient() as any
        const { data, error } = await admin
            .from('profiles')
            .select(USERS_LIST_COLUMNS)
            .eq('role', role)
            .order('created_at', { ascending: false })
            .limit(limit)
        if (error) throw new Error(error.message)
        return await withCreditsBalance(admin, (data ?? []) as Array<{ id: string }>, role)
    } catch (err) {
        // Le client refera le fetch via /api/ops/users : on dégrade sans casser la page.
        console.error('[fetchAdminProfiles] error:', err)
        return null
    }
}
