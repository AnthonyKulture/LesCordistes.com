import type { MetadataRoute } from 'next'
import { PRIORITY_CITIES, SEO_SERVICES, hasUniqueServiceCityContext } from '@/constants/seoData'
import { SEO_GLOSSARY } from '@/constants/seoGlossary'
import { SEO_BLOG } from '@/constants/seoBlog'
import { AUTHORS } from '@/constants/seoAuthors'
import { SEO_BASE_URL as BASE_URL } from '@/constants/seoConfig'

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
    { url: `${BASE_URL}/prix-cordiste`,           lastModified: SITEMAP_LASTMOD },
    { url: `${BASE_URL}/cordiste-vs-echafaudage`, lastModified: SITEMAP_LASTMOD },
    { url: `${BASE_URL}/mentions-legales`,        lastModified: SITEMAP_LASTMOD },
    { url: `${BASE_URL}/cgu`,                     lastModified: SITEMAP_LASTMOD },
    { url: `${BASE_URL}/cgv`,                     lastModified: SITEMAP_LASTMOD },
    { url: `${BASE_URL}/confidentialite`,         lastModified: SITEMAP_LASTMOD },
]

export default function sitemap(): MetadataRoute.Sitemap {
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

    return [
        ...STATIC_PAGES,
        ...cityPages,
        ...cityServicePages,
        ...glossaryPages,
        ...blogPages,
        ...authorPages,
    ]
}
