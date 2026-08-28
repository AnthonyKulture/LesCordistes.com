// Guard centralisé pour les routes /api/ops/* — vérifie session + rôle admin.
// Note: le client Supabase est volontairement typé `any` à cause d'un mismatch
// connu @supabase/ssr ↔ @supabase/supabase-js v2.87 (cf. autres routes du projet
// qui utilisent le même pattern `(client as any).from(...)`).

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
    const guard = await requireAdmin()
    return guard.ok
}
