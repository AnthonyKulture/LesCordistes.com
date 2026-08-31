import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseJsClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

type CookieToSet = { name: string; value: string; options: Record<string, unknown> }

// Appeler dans chaque Server Component / Route Handler — jamais au niveau module
export async function createSupabaseServerClient() {
    const cookieStore = await cookies()

    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet: CookieToSet[]) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
                        )
                    } catch {
                        // Ignoré dans les Server Components (lecture seule)
                    }
                },
            },
        }
    )
}

let publicReadClient: ReturnType<typeof createSupabaseJsClient<Database>> | null = null

/**
 * Lectures PUBLIQUES uniquement (rôle `anon`, RLS appliquée).
 *
 * Ne lit aucun cookie et ne porte donc AUCUNE session utilisateur : c'est ce qui
 * permet aux pages qui l'utilisent de rester statiques/ISR (`cookies()` bascule
 * une page en rendu dynamique par requête). Ne jamais l'utiliser là où l'identité
 * de l'appelant compte (dashboard, déblocage de lead, écriture, admin).
 */
export function createSupabasePublicReadClient() {
    if (!publicReadClient) {
        publicReadClient = createSupabaseJsClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                    detectSessionInUrl: false,
                },
            }
        )
    }
    return publicReadClient
}

// Client admin avec service role — uniquement côté serveur.
// Singleton : chaque createClient() instancie un GoTrueClient complet (storage,
// verrous, timer de rafraîchissement) alors qu'une clé de service n'a pas de
// session à gérer. Les options auth désactivent cette machinerie inutile.
let adminClient: ReturnType<typeof createSupabaseJsClient<Database>> | null = null

export function createSupabaseAdminClient() {
    if (!adminClient) {
        adminClient = createSupabaseJsClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                    detectSessionInUrl: false,
                },
            }
        )
    }
    return adminClient
}
