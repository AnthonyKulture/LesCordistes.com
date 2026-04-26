import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import { SEO_BLOG, BLOG_CATEGORIES, SEO_BLOG_BASE, getBlogImage } from '@/constants/seoBlog'
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

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

const sortedArticles = [...SEO_BLOG].sort((a, b) =>
    b.datePublished.localeCompare(a.datePublished)
)

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
    blogPost: sortedArticles.map((a) => ({
        '@type': 'BlogPosting',
        headline: a.title,
        url: `${SEO_BLOG_BASE}/${a.slug}`,
        datePublished: a.datePublished,
        dateModified: a.dateModified,
        description: a.description,
        image: a.image ?? `${SEO_BASE_URL}/og?title=${encodeURIComponent(a.shortTitle)}&kicker=${encodeURIComponent(a.category)}`,
    })),
}

export default function BlogPage() {
    const [featured, ...rest] = sortedArticles

    return (
        <div className="min-h-screen bg-slate-50">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            {/* HERO */}
            <div className="relative bg-slate-900 text-white pt-28 pb-24 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(91,141,219,0.15),transparent_50%)]" />
                <div className="container max-w-6xl relative">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-brand-blue/20 border border-brand-blue/30 text-brand-blue-light font-semibold text-sm mb-6 uppercase tracking-wide">
                        Guides &amp; ressources métier
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 leading-[1.05] max-w-4xl">
                        Le blog des travaux en hauteur
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-300 max-w-3xl leading-relaxed">
                        Certifications, prix, techniques d&apos;accès sur cordes&nbsp;: tout ce qu&apos;il faut savoir avant de confier vos travaux à un cordiste.
                    </p>
                    <div className="mt-10 flex items-center gap-6 text-sm text-slate-400">
                        <span>{sortedArticles.length} article{sortedArticles.length > 1 ? 's' : ''}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-600" />
                        <span>Mis à jour {formatDate(sortedArticles[0]?.dateModified ?? new Date().toISOString())}</span>
                    </div>
                </div>
            </div>

            <div className="container max-w-6xl py-16 md:py-20">
                {/* FEATURED */}
                {featured && (
                    <Link
                        href={`/blog/${featured.slug}`}
                        className="group block mb-16 bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-brand-blue hover:shadow-2xl transition-all duration-300"
                    >
                        <div className="grid md:grid-cols-5 gap-0">
                            <div className="md:col-span-3 relative aspect-[1200/630] md:aspect-auto bg-slate-900 overflow-hidden">
                                <Image
                                    src={getBlogImage(featured)}
                                    alt={featured.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 60vw"
                                    className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                                    priority
                                />
                            </div>
                            <div className="md:col-span-2 p-8 md:p-10 flex flex-col justify-center">
                                <div className="flex items-center gap-2 mb-5 flex-wrap">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-brand-blue text-white font-semibold text-xs uppercase tracking-wide">
                                        À la une
                                    </span>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium text-xs uppercase tracking-wide">
                                        {BLOG_CATEGORIES[featured.category] ?? featured.category}
                                    </span>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 group-hover:text-brand-blue transition-colors leading-tight">
                                    {featured.title}
                                </h2>
                                <p className="text-slate-600 leading-relaxed mb-6">
                                    {featured.description}
                                </p>
                                <div className="flex items-center gap-5 text-sm text-slate-500 mb-6 pb-6 border-b border-slate-100">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar size={14} />
                                        {formatDate(featured.datePublished)}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Clock size={14} />
                                        {featured.readTime} min
                                    </span>
                                </div>
                                <span className="inline-flex items-center gap-2 text-brand-blue font-bold text-base group-hover:gap-3 transition-all">
                                    Lire l&apos;article <ArrowRight size={18} />
                                </span>
                            </div>
                        </div>
                    </Link>
                )}

                {/* GRID */}
                {rest.length > 0 && (
                    <>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900">
                                Tous les articles
                            </h2>
                            <span className="text-sm text-slate-500">
                                {rest.length} article{rest.length > 1 ? 's' : ''}
                            </span>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {rest.map((article) => (
                                <Link
                                    key={article.slug}
                                    href={`/blog/${article.slug}`}
                                    className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-brand-blue hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="relative aspect-[1200/630] bg-slate-900 overflow-hidden">
                                        <Image
                                            src={getBlogImage(article)}
                                            alt={article.title}
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm text-slate-800 font-semibold text-xs uppercase tracking-wide shadow-sm">
                                                {BLOG_CATEGORIES[article.category] ?? article.category}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1 flex flex-col p-6">
                                        <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-brand-blue transition-colors leading-snug">
                                            {article.title}
                                        </h3>
                                        <p className="text-slate-600 text-sm leading-relaxed mb-5 line-clamp-3 flex-1">
                                            {article.description}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-100">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={12} />
                                                {formatDate(article.datePublished)}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Clock size={12} />
                                                {article.readTime} min
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}

                {/* CTA */}
                <div className="mt-20 relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-blue via-brand-blue to-brand-blue-light p-10 md:p-14 text-center text-white">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.1),transparent_50%)]" />
                    <div className="relative">
                        <h2 className="text-3xl md:text-4xl font-black mb-4">Besoin d&apos;un cordiste certifié&nbsp;?</h2>
                        <p className="text-blue-100 mb-8 max-w-xl mx-auto text-lg">
                            Publiez votre mission et recevez des devis de techniciens qualifiés CQP TPS et IRATA sous 48 h.
                        </p>
                        <Link
                            href="/post-job"
                            className="inline-flex items-center justify-center gap-2 bg-white text-brand-blue px-6 sm:px-10 py-4 sm:py-5 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-xl text-base sm:text-lg max-w-full"
                        >
                            <span>Déposer une demande gratuite</span>
                            <ArrowRight size={20} className="shrink-0" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
