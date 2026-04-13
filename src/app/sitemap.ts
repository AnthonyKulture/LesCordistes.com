import type { MetadataRoute } from 'next'
import { PRIORITY_CITIES, SEO_SERVICES } from '@/constants/seoData'
import { SEO_GLOSSARY } from '@/constants/seoGlossary'
import { SEO_BLOG } from '@/constants/seoBlog'
import { SEO_BASE_URL as BASE_URL } from '@/constants/seoConfig'

// Pages statiques avec leur priorité et fréquence
const STATIC_PAGES: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`,                   lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE_URL}/jobs`,               lastModified: new Date(), changeFrequency: 'daily',   priority: 0.6 },
    { url: `${BASE_URL}/post-job`,           lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/inscription`,        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/inscription-cordiste`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/inscription-client`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/blog`,               lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/lexique`,            lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE_URL}/prix-cordiste`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/cordiste-vs-echafaudage`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
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

    // Pages blog : /blog/{slug}
    const blogPages: MetadataRoute.Sitemap = SEO_BLOG.map((article) => ({
        url: `${BASE_URL}/blog/${article.slug}`,
        lastModified: new Date(article.dateModified),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }))

    return [
        ...STATIC_PAGES,
        ...cityPages,
        ...cityServicePages,
        ...glossaryPages,
        ...blogPages,
    ]
}
