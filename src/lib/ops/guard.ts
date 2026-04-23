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

export async function requireAdmin(): Promise<AdminGuardResult> {
    const supabase = (await createSupabaseServerClient()) as any
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return {
            ok: false,
            response: Response.json({ error: 'Unauthorized' }, { status: 401 }),
        }
    }

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (error || profile?.role !== 'admin') {
        return {
            ok: false,
            response: Response.json({ error: 'Forbidden' }, { status: 403 }),
        }
    }

    return { ok: true, user, supabase }
}
