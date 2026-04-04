import type { MetadataRoute } from 'next'
import { PRIORITY_CITIES, SEO_SERVICES } from '@/constants/seoData'
import { SEO_GLOSSARY } from '@/constants/seoGlossary'

const BASE_URL = 'https://lescordistes.com'

// Pages statiques avec leur priorité et fréquence
const STATIC_PAGES: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`,                   lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE_URL}/jobs`,               lastModified: new Date(), changeFrequency: 'always',  priority: 0.9 },
    { url: `${BASE_URL}/post-job`,           lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/inscription`,        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/inscription-cordiste`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/inscription-client`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/lexique`,            lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE_URL}/mentions-legales`,   lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${BASE_URL}/cgu`,                lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${BASE_URL}/cgv`,                lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${BASE_URL}/confidentialite`,    lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2 },
]

export default function sitemap(): MetadataRoute.Sitemap {
    // Pages ville : /cordiste-{ville}
    const cityPages: MetadataRoute.Sitemap = PRIORITY_CITIES.map((city) => ({
        url: `${BASE_URL}/cordiste-${city.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }))

    // Pages ville × service : /cordiste-{ville}/{service}
    const cityServicePages: MetadataRoute.Sitemap = PRIORITY_CITIES.flatMap((city) =>
        SEO_SERVICES.map((service) => ({
            url: `${BASE_URL}/cordiste-${city.slug}/${service.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }))
    )

    // Pages lexique : /lexique/{slug}
    const glossaryPages: MetadataRoute.Sitemap = SEO_GLOSSARY.map((term) => ({
        url: `${BASE_URL}/lexique/${term.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
    }))

    return [
        ...STATIC_PAGES,
        ...cityPages,
        ...cityServicePages,
        ...glossaryPages,
    ]
}
