import type { MetadataRoute } from 'next'
import { PRIORITY_CITIES, SEO_SERVICES, hasUniqueServiceCityContext } from '@/constants/seoData'
import { SEO_GLOSSARY } from '@/constants/seoGlossary'
import { SEO_BLOG } from '@/constants/seoBlog'
import { AUTHORS } from '@/constants/seoAuthors'
import { SEO_BASE_URL as BASE_URL } from '@/constants/seoConfig'
import { createSupabasePublicReadClient } from '@/lib/supabase-server'
import { isProfileIndexable } from '@/lib/profileSeo'
import type { Profile } from '@/types'

// Google ignore <changefreq> et <priority> depuis 2023 → on ne les émet plus.
// Seul <lastmod> est utilisé. Pour les pages au contenu stable, on bump
// SITEMAP_LASTMOD manuellement à chaque mise à jour significative du site
// (refonte design, ajout massif de contextes, etc.). Pour les pages au
// contenu réellement daté (blog), on conserve la date de l'article.
const SITEMAP_LASTMOD = new Date('2026-05-02')

const STATIC_PAGES: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`,                        lastModified: SITEMAP_LASTMOD },
    { url: `${BASE_URL}/jobs`,                    lastModified: SITEMAP_LASTMOD },
    { url: `${BASE_URL}/post-job`,                lastModified: SITEMAP_LASTMOD },
    { url: `${BASE_URL}/inscription`,             lastModified: SITEMAP_LASTMOD },
    { url: `${BASE_URL}/inscription-cordiste`,    lastModified: SITEMAP_LASTMOD },
    { url: `${BASE_URL}/inscription-client`,      lastModified: SITEMAP_LASTMOD },
    { url: `${BASE_URL}/blog`,                    lastModified: SITEMAP_LASTMOD },
    { url: `${BASE_URL}/lexique`,                 lastModified: SITEMAP_LASTMOD },
    { url: `${BASE_URL}/a-propos`,                lastModified: SITEMAP_LASTMOD },
    { url: `${BASE_URL}/verification-pros`,       lastModified: SITEMAP_LASTMOD },
    { url: `${BASE_URL}/faq`,                     lastModified: SITEMAP_LASTMOD },
    { url: `${BASE_URL}/cordiste-copropriete`,    lastModified: SITEMAP_LASTMOD },
    { url: `${BASE_URL}/prix-cordiste`,           lastModified: SITEMAP_LASTMOD },
    { url: `${BASE_URL}/cordiste-vs-echafaudage`, lastModified: SITEMAP_LASTMOD },
    { url: `${BASE_URL}/mentions-legales`,        lastModified: SITEMAP_LASTMOD },
    { url: `${BASE_URL}/cgu`,                     lastModified: SITEMAP_LASTMOD },
    { url: `${BASE_URL}/cgv`,                     lastModified: SITEMAP_LASTMOD },
    { url: `${BASE_URL}/confidentialite`,         lastModified: SITEMAP_LASTMOD },
]

// Le sitemap interroge la base pour les profils pro. 1 h est un compromis :
// assez long pour ne pas requêter Supabase à chaque passage de crawler, assez
// court pour limiter la désynchronisation avec la page profil (revalidate 60 s).
// Un pro qui vide sa bio passe en noindex en 60 s mais peut rester listé
// jusqu'à 1 h → GSC peut signaler « URL envoyée avec balise noindex » sur cette
// fenêtre. C'est attendu et sans gravité.
export const revalidate = 3600

/**
 * Profils pro indexables : /pros/{id}.
 *
 * Ces pages sont ORPHELINES pour un crawler — tous les liens internes vers
 * /pros/ sont derrière l'authentification. Le sitemap est donc leur seul chemin
 * de découverte.
 *
 * Filtrées par `isProfileIndexable` pour rester cohérent avec le `robots` posé
 * par la page : sitemap = pages indexables, rien d'autre.
 *
 * Défensif : toute erreur renvoie une liste vide. Un incident Supabase ne doit
 * jamais amputer le sitemap de ses ~398 URLs statiques.
 */
const PROFILE_SITEMAP_LIMIT = 1000

async function getProfilePages(): Promise<MetadataRoute.Sitemap> {
    try {
        const supabase = createSupabasePublicReadClient()
        // `order` obligatoire : sans lui, PostgREST ne garantit aucun ordre et le
        // sous-ensemble retenu par `limit` changerait à chaque régénération —
        // des URLs entreraient et sortiraient du sitemap sans raison.
        const BASE_COLS = 'id, role, full_name, bio, skills, certifications, intervention_zones, portfolio_photos, updated_at'

        const run = (cols: string) =>
            supabase
                .from('profiles')
                .select(cols)
                .eq('role', 'pro')
                .order('updated_at', { ascending: false, nullsFirst: false })
                .limit(PROFILE_SITEMAP_LIMIT)

        let { data, error } = await run(`${BASE_COLS}, seo_indexable`)

        // 42703 = colonne inconnue : la migration 20260828i n'est pas encore
        // appliquée. On rejoue sans l'opt-out plutôt que de vider le sitemap de
        // tous ses profils — l'ordre migration/déploiement a déjà dérapé une fois.
        if (error && (error as { code?: string }).code === '42703') {
            console.warn('[sitemap] colonne seo_indexable absente — migration 20260828i à appliquer ; repli sans opt-out.')
            ;({ data, error } = await run(BASE_COLS))
        }

        if (error || !data) {
            // Sans log, une révocation de colonne ou une panne Supabase ampute le
            // sitemap de tous ses profils pendant 24 h SANS aucun signal.
            console.error('[sitemap] lecture des profils pro échouée :', error?.message ?? 'aucune donnée')
            return []
        }

        if (data.length >= PROFILE_SITEMAP_LIMIT) {
            console.warn(`[sitemap] plafond de ${PROFILE_SITEMAP_LIMIT} profils atteint — paginer la requête, des pros indexables sont omis.`)
        }

        return (data as unknown as Profile[])
            .filter(isProfileIndexable)
            .map((p) => ({
                url: `${BASE_URL}/pros/${p.id}`,
                lastModified: p.updated_at ? new Date(p.updated_at) : SITEMAP_LASTMOD,
            }))
    } catch (e) {
        console.error('[sitemap] exception sur la lecture des profils pro :', e)
        return []
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Pages ville : /cordiste-{ville}
    const cityPages: MetadataRoute.Sitemap = PRIORITY_CITIES.map((city) => ({
        url: `${BASE_URL}/cordiste-${city.slug}`,
        lastModified: SITEMAP_LASTMOD,
    }))

    // Pages ville × service : /cordiste-{ville}/{service}
    // On ne liste que les couples ayant un contexte UNIQUE rédigé dans
    // SERVICE_CITY_CONTEXT (pas le fallback default). Les pages sans contexte
    // unique restent générées et accessibles, mais en noindex (cf generateMetadata
    // de la page) → cohérence sitemap = pages indexables uniquement.
    // Pour rajouter une page au sitemap : ajouter une entry SERVICE_CITY_CONTEXT.
    const cityServicePages: MetadataRoute.Sitemap = PRIORITY_CITIES.flatMap((city) =>
        SEO_SERVICES
            .filter((service) => hasUniqueServiceCityContext(service.slug, city.slug))
            .map((service) => ({
                url: `${BASE_URL}/cordiste-${city.slug}/${service.slug}`,
                lastModified: SITEMAP_LASTMOD,
            }))
    )

    // Pages lexique : /lexique/{slug}
    const glossaryPages: MetadataRoute.Sitemap = SEO_GLOSSARY.map((term) => ({
        url: `${BASE_URL}/lexique/${term.slug}`,
        lastModified: SITEMAP_LASTMOD,
    }))

    // Pages blog : /blog/{slug} → date réelle de l'article (signal de fraîcheur fiable)
    const blogPages: MetadataRoute.Sitemap = SEO_BLOG.map((article) => ({
        url: `${BASE_URL}/blog/${article.slug}`,
        lastModified: new Date(article.dateModified),
    }))

    // Pages auteur : /auteur/{slug} → signal d'autorité E-E-A-T (Person + ProfilePage)
    const authorPages: MetadataRoute.Sitemap = Object.keys(AUTHORS).map((slug) => ({
        url: `${BASE_URL}/auteur/${slug}`,
        lastModified: SITEMAP_LASTMOD,
    }))

    const profilePages = await getProfilePages()

    return [
        ...STATIC_PAGES,
        ...cityPages,
        ...cityServicePages,
        ...glossaryPages,
        ...blogPages,
        ...authorPages,
        ...profilePages,
    ]
}
