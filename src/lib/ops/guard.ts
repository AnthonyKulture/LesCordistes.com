// Guard centralisé pour les routes /api/ops/* — vérifie session + rôle admin.
// Note: le client Supabase est volontairement typé `any` à cause d'un mismatch
// connu @supabase/ssr ↔ @supabase/supabase-js v2.87 (cf. autres routes du projet
// qui utilisent le même pattern `(client as any).from(...)`).

import { cache } from 'react'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { User } from '@supabase/supabase-js'

/* eslint-disable @typescript-eslint/no-explicit-any */
type GuardSuccess = {
    ok: true
    user: User
    supabase: any
}
type GuardFailure = { ok: false; response: Response }
export type AdminGuardResult = GuardSuccess | GuardFailure

type RoleRow = { role: string | null }
type RoleLookup = { data: RoleRow | null; error: unknown }

export async function requireAdmin(): Promise<AdminGuardResult> {
    const supabase = (await createSupabaseServerClient()) as any

    // `sub` vérifié cryptographiquement en local (JWKS ES256) — sert uniquement à
    // démarrer la lecture de `profiles.role` en parallèle de getUser(). Il n'autorise
    // rien à lui seul : l'identité retenue reste celle de getUser(), et l'id est
    // recroisé ci-dessous avant que le rôle préchargé soit accepté.
    let claimedUserId: string | undefined
    try {
        const { data: claimsData } = await supabase.auth.getClaims()
        claimedUserId = claimsData?.claims?.sub
    } catch {
        claimedUserId = undefined
    }

    const preloadRole: PromiseLike<RoleLookup> | null = claimedUserId
        ? supabase.from('profiles').select('role').eq('id', claimedUserId).single()
        : null

    const [userResult, preloadedRole] = await Promise.all([
        supabase.auth.getUser() as Promise<{ data: { user: User | null } }>,
        preloadRole,
    ])

    const user = userResult.data.user
    if (!user) {
        return {
            ok: false,
            response: Response.json({ error: 'Unauthorized' }, { status: 401 }),
        }
    }

    const roleLookup: RoleLookup =
        preloadedRole && claimedUserId === user.id
            ? preloadedRole
            : await supabase.from('profiles').select('role').eq('id', user.id).single()

    if (roleLookup.error || roleLookup.data?.role !== 'admin') {
        return {
            ok: false,
            response: Response.json({ error: 'Forbidden' }, { status: 403 }),
        }
    }

    return { ok: true, user, supabase }
}

/**
 * Variante booléenne pour les Server Components d'admin, qui n'ont pas de Response
 * à renvoyer. Le layout redirige déjà les non-admins, mais layout et page sont
 * rendus concurremment : sans ce garde, une requête service_role partirait quand
 * même. Défense en profondeur, fail-closed.
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
    const { role } = await getAdminIdentity()
    return role === 'admin'
}

type AdminIdentity = {
    userId: string | null
    role: string | null
    fullName: string | null
    email: string | null
}

/**
 * Identité admin, dédoublonnée à l'échelle d'un rendu par React.cache().
 *
 * Sans elle, un affichage de page admin relit la même identité 2 fois côté
 * serveur : le layout et le garde de la page sont rendus concurremment et
 * appellent chacun getUser() (aller-retour réseau vers GoTrue, sans raccourci
 * local) puis `profiles`. React.cache() mémoïse sur la durée du rendu : la
 * seconde lecture est gratuite.
 *
 * `getClaims()` remplace `getUser()` : le `sub` est vérifié cryptographiquement
 * en local via JWKS (clés ES256 sur ce projet), donc zéro réseau. La décision
 * d'autorisation reste portée par `profiles.role`, lu en base — c'est lui qui
 * fait foi, pas le claim.
 */
export const getAdminIdentity = cache(async (): Promise<AdminIdentity> => {
    const empty: AdminIdentity = { userId: null, role: null, fullName: null, email: null }
    try {
        const supabase = (await createSupabaseServerClient()) as any
        const { data: claimsData } = await supabase.auth.getClaims()
        const userId: string | undefined = claimsData?.claims?.sub
        if (!userId) return empty

        const { data, error } = await supabase
            .from('profiles')
            .select('role, full_name, email')
            .eq('id', userId)
            .single()
        if (error || !data) {
            // Sans ce log, une erreur transitoire (timeout PostgREST, révocation
            // de colonne) éjecte un admin légitime vers /dashboard sans trace.
            console.error('[getAdminIdentity] lecture de profiles échouée :', error?.message ?? 'aucune donnée')
            return { ...empty, userId }
        }

        return {
            userId,
            role: data.role ?? null,
            fullName: data.full_name ?? null,
            email: data.email ?? null,
        }
    } catch (e) {
        console.error('[getAdminIdentity] exception :', e)
        return empty
    }
})
