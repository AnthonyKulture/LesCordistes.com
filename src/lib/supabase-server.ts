import { createServerClient } from '@supabase/ssr'
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

// Client admin avec service role — uniquement pour les Route Handlers serveur
export function createSupabaseAdminClient() {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require('@supabase/supabase-js') as { createClient: typeof import('@supabase/supabase-js').createClient }
    return createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}
