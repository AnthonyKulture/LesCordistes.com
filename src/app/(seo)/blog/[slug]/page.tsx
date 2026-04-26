import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, Calendar, Clock, RefreshCw } from 'lucide-react'
import { SEO_BLOG, SEO_BLOG_BASE, getBlogArticle, getBlogImage, BLOG_CATEGORIES, type BlogSectionCta } from '@/constants/seoBlog'
import { SEO_BASE_URL, SEO_BRAND_NAME } from '@/constants/seoConfig'

interface Props {
    params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
    return SEO_BLOG.map((a) => ({ slug: a.slug }))
}

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const article = getBlogArticle(slug)
    if (!article) return {}
    const desc = article.description.length > 160 ? `${article.description.slice(0, 157)}…` : article.description
    const image = article.image
        ? (article.image.startsWith('http') ? article.image : `${SEO_BASE_URL}${article.image}`)
        : `${SEO_BASE_URL}/og?title=${encodeURIComponent(article.shortTitle)}&kicker=${encodeURIComponent(article.category)}&v=3`
    return {
        title: article.shortTitle,
        description: desc,
        alternates: { canonical: `${SEO_BLOG_BASE}/${slug}` },
        openGraph: {
            title: `${article.shortTitle} · LesCordistes`,
            description: desc,
            url: `${SEO_BLOG_BASE}/${slug}`,
            type: 'article',
            publishedTime: article.datePublished,
            modifiedTime: article.dateModified,
            images: [{ url: image, width: 1200, height: 630, alt: article.shortTitle }],
        },
    }
}

export default async function BlogArticlePage({ params }: Props) {
    const { slug } = await params
    const article = getBlogArticle(slug)
    if (!article) notFound()

    const heroImage = getBlogImage(article)
    const heroImageAbs = article.image
        ? (article.image.startsWith('http') ? article.image : `${SEO_BASE_URL}${article.image}`)
        : `${SEO_BASE_URL}/og?title=${encodeURIComponent(article.shortTitle)}&kicker=${encodeURIComponent(article.category)}&v=3`

    const otherArticles = SEO_BLOG
        .filter((a) => a.slug !== slug)
        .sort((a, b) => b.datePublished.localeCompare(a.datePublished))
        .slice(0, 3)

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'BlogPosting',
                '@id': `${SEO_BLOG_BASE}/${article.slug}#article`,
                headline: article.title,
                description: article.description,
                image: {
                    '@type': 'ImageObject',
                    url: heroImageAbs,
                    width: 1200,
                    height: 630,
                },
                url: `${SEO_BLOG_BASE}/${article.slug}`,
                inLanguage: 'fr',
                datePublished: article.datePublished,
                dateModified: article.dateModified,
                author: {
                    '@type': 'Organization',
                    '@id': `${SEO_BASE_URL}/#organization`,
                    name: SEO_BRAND_NAME,
                },
                publisher: {
                    '@type': 'Organization',
                    '@id': `${SEO_BASE_URL}/#organization`,
                    name: SEO_BRAND_NAME,
                },
                mainEntityOfPage: `${SEO_BLOG_BASE}/${article.slug}`,
                isPartOf: {
                    '@type': 'Blog',
                    '@id': `${SEO_BASE_URL}/blog#blog`,
                },
            },
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Accueil', item: SEO_BASE_URL },
                    { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SEO_BASE_URL}/blog` },
                    { '@type': 'ListItem', position: 3, name: article.shortTitle, item: `${SEO_BLOG_BASE}/${article.slug}` },
                ],
            },
            {
                '@type': 'FAQPage',
                mainEntity: article.faqs.map((faq) => ({
                    '@type': 'Question',
                    name: faq.q,
                    acceptedAnswer: { '@type': 'Answer', text: faq.a },
                })),
            },
        ],
    }

    function SectionCta({ cta }: { cta: BlogSectionCta }) {
        const isBlue = cta.variant === 'blue'
        const isOutline = cta.variant === 'outline'
        return (
            <div className={`my-8 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                isBlue ? 'bg-brand-blue text-white' :
                isOutline ? 'bg-white border-2 border-brand-blue' :
                'bg-slate-50 border border-slate-200'
            }`}>
                {cta.description && (
                    <p className={`text-sm leading-relaxed ${isBlue ? 'text-blue-100' : isOutline ? 'text-brand-blue font-medium' : 'text-slate-700'}`}>
                        {cta.description}
                    </p>
                )}
                <Link
                    href={cta.href}
                    className={`w-full sm:w-auto sm:shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold transition-colors text-sm sm:text-base text-center ${
                        isBlue ? 'bg-white text-brand-blue hover:bg-slate-100' :
                        'bg-brand-blue text-white hover:bg-brand-blue-light'
                    }`}
                >
                    <span>{cta.text}</span>
                    <ArrowRight size={16} className="shrink-0" />
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            {/* HEADER */}
            <div className="relative bg-slate-900 text-white pt-28 pb-16 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(91,141,219,0.15),transparent_55%)]" />
                <div className="container max-w-4xl relative">
                    <Link
                        href="/blog"
                        className="inline-flex items-center text-brand-blue-light hover:text-white text-sm font-semibold mb-8 group transition-colors"
                    >
                        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                        Retour au blog
                    </Link>

                    <div className="flex items-center gap-3 mb-6 flex-wrap">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-brand-blue/30 border border-brand-blue/40 text-brand-blue-light font-semibold text-xs uppercase tracking-wide">
                            {BLOG_CATEGORIES[article.category] ?? article.category}
                        </span>
                        <span className="text-slate-400 text-sm flex items-center gap-1.5">
                            <Clock size={14} /> {article.readTime} min de lecture
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black mb-6 leading-[1.1]">
                        {article.title}
                    </h1>

                    <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-3xl">
                        {article.intro}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-10 pt-8 border-t border-white/10 text-sm text-slate-400">
                        <span className="flex items-center gap-2">
                            <Calendar size={14} />
                            Publié le {formatDate(article.datePublished)}
                        </span>
                        {article.dateModified !== article.datePublished && (
                            <span className="flex items-center gap-2">
                                <RefreshCw size={14} />
                                Mis à jour le {formatDate(article.dateModified)}
                            </span>
                        )}
                        <span>
                            Par <strong className="text-white font-semibold">{SEO_BRAND_NAME}</strong>
                        </span>
                    </div>
                </div>
            </div>

            {/* HERO IMAGE */}
            <div className="container max-w-5xl -mt-8 md:-mt-10 relative z-10">
                <div className="relative aspect-[1200/630] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl bg-slate-200 ring-1 ring-slate-200">
                    <Image
                        src={heroImage}
                        alt={article.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 1024px"
                        className="object-cover"
                        priority
                    />
                </div>
            </div>

            {/* ARTICLE BODY */}
            <div className="container max-w-3xl py-16 md:py-20">
                <article className="prose-article">
                    <div className="space-y-12">
                        {article.sections.map((section, i) => (
                            <section key={i}>
                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-5 leading-tight scroll-mt-24">
                                    {section.heading}
                                </h2>
                                <div className="space-y-4 text-slate-700 text-base md:text-lg leading-[1.75]">
                                    {section.body.split('\n\n').map((para, j) => {
                                        const parts = para.split(/(\*\*[^*]+\*\*)/)
                                        return (
                                            <p key={j}>
                                                {parts.map((part, k) =>
                                                    part.startsWith('**') && part.endsWith('**')
                                                        ? <strong key={k} className="text-slate-900 font-semibold">{part.slice(2, -2)}</strong>
                                                        : part
                                                )}
                                            </p>
                                        )
                                    })}
                                </div>
                                {section.list && (
                                    <div className="mt-6">
                                        {section.listIntro && (
                                            <p className="text-slate-700 text-base md:text-lg leading-[1.75] mb-4">{section.listIntro}</p>
                                        )}
                                        <ul className="space-y-3">
                                            {section.list.map((item, k) => (
                                                <li key={k} className="flex gap-3 text-slate-700 text-base md:text-lg leading-relaxed">
                                                    <span className="flex-shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-brand-blue" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {section.cta && <SectionCta cta={section.cta} />}
                            </section>
                        ))}
                    </div>

                    {article.faqs.length > 0 && (
                        <div className="mt-16 pt-16 border-t border-slate-200">
                            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-brand-blue/10 text-brand-blue font-semibold text-sm mb-4 uppercase tracking-wide">
                                FAQ
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-10 leading-tight">
                                Questions fréquentes
                            </h2>
                            <div className="space-y-4">
                                {article.faqs.map((faq, i) => (
                                    <details
                                        key={i}
                                        className="group bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden transition-colors hover:border-brand-blue/40"
                                    >
                                        <summary className="cursor-pointer p-6 font-bold text-slate-900 flex items-start justify-between gap-4 list-none">
                                            <span className="flex-1 leading-snug">{faq.q}</span>
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white border border-slate-300 flex items-center justify-center group-open:rotate-45 transition-transform text-slate-500 text-xl leading-none">
                                                +
                                            </span>
                                        </summary>
                                        <div className="px-6 pb-6 text-slate-700 leading-relaxed">
                                            {faq.a}
                                        </div>
                                    </details>
                                ))}
                            </div>
                        </div>
                    )}
                </article>

                {/* CTA */}
                <div className="mt-16 relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-blue via-brand-blue to-brand-blue-light p-10 md:p-12 text-center text-white">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.1),transparent_50%)]" />
                    <div className="relative">
                        <h3 className="text-2xl md:text-3xl font-black mb-3">Prêt à lancer vos travaux&nbsp;?</h3>
                        <p className="text-blue-100 mb-8 max-w-xl mx-auto text-lg">
                            Publiez votre mission sur LesCordistes.com et obtenez des devis de cordistes certifiés sous 48&nbsp;h.
                        </p>
                        <Link
                            href={article.ctaHref}
                            className="inline-flex items-center justify-center gap-2 bg-white text-brand-blue px-6 sm:px-10 py-4 sm:py-5 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-xl text-base sm:text-lg max-w-full"
                        >
                            <span className="break-words">{article.ctaText}</span>
                            <ArrowRight size={20} className="shrink-0" />
                        </Link>
                    </div>
                </div>

                {/* RELATED LINKS */}
                {article.relatedLinks.length > 0 && (
                    <div className="mt-16 bg-white border border-slate-200 rounded-3xl p-8 md:p-10">
                        <h3 className="text-xl font-black text-slate-900 mb-6">À lire aussi sur LesCordistes</h3>
                        <ul className="grid sm:grid-cols-2 gap-3">
                            {article.relatedLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="group flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-brand-blue hover:text-white transition-colors"
                                    >
                                        <ArrowRight size={16} className="text-brand-blue group-hover:text-white transition-colors" />
                                        <span className="font-medium text-slate-700 group-hover:text-white transition-colors">
                                            {link.label}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* OTHER ARTICLES */}
            {otherArticles.length > 0 && (
                <div className="bg-slate-50 border-t border-slate-200 py-16 md:py-20">
                    <div className="container max-w-6xl">
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-10">
                            Continuer la lecture
                        </h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {otherArticles.map((other) => (
                                <Link
                                    key={other.slug}
                                    href={`/blog/${other.slug}`}
                                    className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-brand-blue hover:shadow-lg transition-all"
                                >
                                    <div className="relative aspect-[1200/630] bg-slate-900 overflow-hidden">
                                        <Image
                                            src={getBlogImage(other)}
                                            alt={other.title}
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm text-slate-800 font-semibold text-xs uppercase tracking-wide shadow-sm">
                                                {BLOG_CATEGORIES[other.category] ?? other.category}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1 flex flex-col p-6">
                                        <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-brand-blue transition-colors leading-snug">
                                            {other.title}
                                        </h3>
                                        <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-2 flex-1">
                                            {other.description}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-4 border-t border-slate-100">
                                            <Clock size={12} />
                                            {other.readTime} min
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
