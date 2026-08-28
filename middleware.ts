import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // OBLIGATOIRE : ne jamais écrire de logique entre createServerClient et cet appel.
    // Le rôle de cet appel n'est PAS de lire l'utilisateur (le résultat est ignoré)
    // mais de déclencher __loadSession() : rafraîchissement du JWT si nécessaire puis
    // réécriture des cookies via setAll() ci-dessus.
    // getClaims() emprunte exactement le même chemin de rafraîchissement que getUser()
    // (getClaims → getSession → _useSession → __loadSession → _callRefreshToken →
    // _saveSession), mais vérifie le JWT localement via JWKS au lieu d'un aller-retour
    // HTTP vers /auth/v1/user à chaque requête.
    try {
        await supabase.auth.getClaims()
    } catch {
        // getClaims() peut lever une Error simple (validateExp, getAlgorithm, WebCrypto)
        // que la lib ne convertit pas en AuthError : on retombe sur le chemin historique
        // plutôt que de renvoyer un 500 sur toute navigation.
        await supabase.auth.getUser()
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        // Exclusions : aucune de ces routes ne lit la session côté serveur ni n'a besoin
        // que le cookie soit rafraîchi.
        //   api/            → les Route Handlers refont leur propre auth (createSupabaseServerClient
        //                     + getUser/requireAdmin) et écrivent eux-mêmes les cookies rafraîchis.
        //   ingest/         → proxy PostHog (rewrites dans next.config.ts), trafic tiers.
        //   _next/          → build assets.
        //   og, opengraph-image, sitemap.xml, robots.txt, llms-full.txt → SEO/OG, rendus anonymes.
        // Toutes les pages applicatives (dashboard, admin, profile, messages, jobs, credits,
        // post-job, connexion, auth/*) restent couvertes : le JWT y est bien rafraîchi.
        '/((?!api/|ingest/|_next/|og$|opengraph-image|sitemap\\.xml|robots\\.txt|llms-full\\.txt|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|txt|xml|json|woff|woff2|ttf|otf|map|mp4|webm)$).*)',
    ],
}
