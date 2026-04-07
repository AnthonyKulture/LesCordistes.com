import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

type CookieToSet = { name: string; value: string; options: Record<string, unknown> }

export async function DELETE() {
    const cookieStore = await cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet: CookieToSet[]) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
                    )
                },
            },
        }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json({ error: 'Service role key manquante' }, { status: 500 })
    }

    const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // 1. Anonymiser les missions créées (FK sans CASCADE)
    await adminClient.from('jobs').update({ created_by: null }).eq('created_by', user.id)
    // 2. Retirer moderated_by si présent (FK sans CASCADE)
    await adminClient.from('jobs').update({ moderated_by: null }).eq('moderated_by', user.id)
    // 3. Supprimer le profil (les autres tables cascadent : credits, unlocked_leads, conversations…)
    const { error: profileError } = await adminClient.from('profiles').delete().eq('id', user.id)
    if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 500 })
    }
    // 4. Supprimer l'utilisateur auth
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)
    if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
