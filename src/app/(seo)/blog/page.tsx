import type { Metadata } from 'next'
import Link from 'next/link'
import { SEO_BLOG, BLOG_CATEGORIES, SEO_BLOG_BASE } from '@/constants/seoBlog'
import { SEO_BASE_URL, SEO_BRAND_NAME } from '@/constants/seoConfig'

export const metadata: Metadata = {
    title: 'Blog cordistes : guides & conseils',
    description: 'Guides pratiques travaux en hauteur : habilitations cordiste, comparatifs, conseils pour choisir et budgétiser vos travaux sur cordes.',
    alternates: { canonical: `${SEO_BASE_URL}/blog` },
    openGraph: {
        title: 'Blog cordistes : guides & conseils · LesCordistes',
        description: 'Guides pratiques sur les travaux en hauteur par les experts LesCordistes.com.',
        url: `${SEO_BASE_URL}/blog`,
        images: [{
            url: `${SEO_BASE_URL}/og?title=${encodeURIComponent('Blog cordistes')}&kicker=${encodeURIComponent('Guides & conseils')}`,
            width: 1200,
            height: 630,
        }],
    },
}

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${SEO_BASE_URL}/blog#blog`,
    name: `Blog Travaux en Hauteur — ${SEO_BRAND_NAME}`,
    url: `${SEO_BASE_URL}/blog`,
    description: 'Guides pratiques sur les travaux en hauteur, les certifications cordiste, les prix et les techniques d\'accès sur cordes.',
    publisher: {
        '@type': 'Organization',
        '@id': `${SEO_BASE_URL}/#organization`,
        name: SEO_BRAND_NAME,
    },
    blogPost: SEO_BLOG.map((a) => ({
        '@type': 'BlogPosting',
        headline: a.title,
        url: `${SEO_BLOG_BASE}/${a.slug}`,
        datePublished: a.datePublished,
        dateModified: a.dateModified,
        description: a.description,
    })),
}

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-white">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <div className="bg-slate-900 text-white pt-24 pb-16">
                <div className="container max-w-4xl text-center">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-brand-blue/20 text-brand-blue-light font-semibold text-sm mb-6 uppercase tracking-wide">
                        Guides & Ressources
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                        Blog Travaux en Hauteur
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                        Certifications, prix, techniques — tout ce qu'il faut savoir avant de confier vos travaux sur cordes.
                    </p>
                </div>
            </div>

            <div className="container max-w-4xl py-16">
                <div className="grid gap-8">
                    {SEO_BLOG.map((article) => (
                        <Link
                            key={article.slug}
                            href={`/blog/${article.slug}`}
                            className="group block bg-white border border-slate-200 rounded-2xl p-8 hover:border-brand-blue hover:shadow-md transition-all"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-medium text-xs uppercase tracking-wide">
                                    {BLOG_CATEGORIES[article.category] ?? article.category}
                                </span>
                                <span className="text-slate-400 text-sm">{article.readTime} min de lecture</span>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-brand-blue transition-colors leading-snug">
                                {article.title}
                            </h2>
                            <p className="text-slate-600 leading-relaxed mb-4">{article.description}</p>
                            <span className="text-brand-blue font-semibold text-sm group-hover:text-brand-blue-light transition-colors">
                                Lire l'article →
                            </span>
                        </Link>
                    ))}
                </div>

                <div className="mt-16 bg-brand-blue rounded-2xl p-10 text-center text-white">
                    <h2 className="text-2xl font-bold mb-3">Besoin d'un cordiste certifié ?</h2>
                    <p className="text-blue-100 mb-8 max-w-lg mx-auto">
                        Publiez votre mission et recevez des devis de techniciens qualifiés CQP et IRATA.
                    </p>
                    <Link
                        href="/post-job"
                        className="inline-block bg-white text-brand-blue px-8 py-4 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-lg"
                    >
                        Déposer une demande gratuite
                    </Link>
                </div>
            </div>
        </div>
    )
}
