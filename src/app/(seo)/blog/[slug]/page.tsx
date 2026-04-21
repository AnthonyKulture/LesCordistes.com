import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SEO_BLOG, SEO_BLOG_BASE, getBlogArticle, type BlogSectionCta } from '@/constants/seoBlog'
import { SEO_BASE_URL, SEO_BRAND_NAME } from '@/constants/seoConfig'

interface Props {
    params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
    return SEO_BLOG.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const article = getBlogArticle(slug)
    if (!article) return {}
    return {
        title: article.title,
        description: article.description,
        alternates: { canonical: `${SEO_BLOG_BASE}/${slug}` },
        openGraph: {
            title: article.title,
            description: article.description,
            url: `${SEO_BLOG_BASE}/${slug}`,
            type: 'article',
            publishedTime: article.datePublished,
            modifiedTime: article.dateModified,
        },
    }
}

export default async function BlogArticlePage({ params }: Props) {
    const { slug } = await params
    const article = getBlogArticle(slug)
    if (!article) notFound()

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'BlogPosting',
                '@id': `${SEO_BLOG_BASE}/${article.slug}#article`,
                headline: article.title,
                description: article.description,
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
            <div className={`mt-6 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 ${
                isBlue ? 'bg-brand-blue' :
                isOutline ? 'bg-white border-2 border-brand-blue' :
                'bg-slate-50 border border-slate-200'
            }`}>
                {cta.description && (
                    <p className={`text-sm ${isBlue ? 'text-blue-100' : isOutline ? 'text-brand-blue font-medium' : 'text-slate-600'}`}>
                        {cta.description}
                    </p>
                )}
                <Link
                    href={cta.href}
                    className={`shrink-0 px-6 py-3 rounded-xl font-bold transition-colors whitespace-nowrap ${
                        isBlue ? 'bg-white text-brand-blue hover:bg-slate-100' :
                        'bg-brand-blue text-white hover:bg-brand-blue-light'
                    }`}
                >
                    {cta.text}
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-16">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <div className="container max-w-3xl">
                <Link href="/blog" className="inline-flex items-center text-brand-blue hover:text-brand-blue-light font-medium mb-10 group">
                    <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Retour au blog
                </Link>

                <article className="bg-white rounded-3xl p-10 md:p-14 shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="inline-block px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 font-medium text-sm">
                            {article.category}
                        </span>
                        <span className="text-slate-400 text-sm">{article.readTime} min de lecture</span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-8 leading-tight">
                        {article.title}
                    </h1>

                    <p className="text-xl text-slate-600 leading-relaxed mb-10 pb-10 border-b border-slate-100">
                        {article.intro}
                    </p>

                    <div className="space-y-10">
                        {article.sections.map((section, i) => (
                            <section key={i}>
                                <h2 className="text-xl font-bold text-slate-900 mb-4">{section.heading}</h2>
                                {section.body.split('\n\n').map((para, j) => {
                                    if (para.startsWith('**')) {
                                        const parts = para.split(/(\*\*[^*]+\*\*)/)
                                        return (
                                            <p key={j} className="text-slate-700 leading-relaxed mb-3">
                                                {parts.map((part, k) =>
                                                    part.startsWith('**') && part.endsWith('**')
                                                        ? <strong key={k}>{part.slice(2, -2)}</strong>
                                                        : part
                                                )}
                                            </p>
                                        )
                                    }
                                    return (
                                        <p key={j} className="text-slate-700 leading-relaxed mb-3">
                                            {para.split(/(\*\*[^*]+\*\*)/).map((part, k) =>
                                                part.startsWith('**') && part.endsWith('**')
                                                    ? <strong key={k}>{part.slice(2, -2)}</strong>
                                                    : part
                                            )}
                                        </p>
                                    )
                                })}
                                {section.list && (
                                    <>
                                        {section.listIntro && (
                                            <p className="text-slate-700 leading-relaxed mb-3">{section.listIntro}</p>
                                        )}
                                        <ul className="space-y-2 mt-3">
                                            {section.list.map((item, k) => (
                                                <li key={k} className="flex gap-3 text-slate-700">
                                                    <span className="text-brand-blue mt-1 shrink-0">→</span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                                {section.cta && <SectionCta cta={section.cta} />}
                            </section>
                        ))}
                    </div>

                    {article.faqs.length > 0 && (
                        <div className="mt-12 pt-10 border-t border-slate-100">
                            <h2 className="text-2xl font-bold text-slate-900 mb-8">Questions fréquentes</h2>
                            <div className="space-y-6">
                                {article.faqs.map((faq, i) => (
                                    <div key={i} className="bg-slate-50 rounded-2xl p-6">
                                        <h3 className="font-bold text-slate-900 mb-3">{faq.q}</h3>
                                        <p className="text-slate-700 leading-relaxed">{faq.a}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </article>

                {article.relatedLinks.length > 0 && (
                    <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-8">
                        <h3 className="font-bold text-slate-900 mb-4">À lire aussi</h3>
                        <div className="flex flex-col gap-3">
                            {article.relatedLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-brand-blue hover:text-brand-blue-light font-medium transition-colors"
                                >
                                    {link.label} →
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-8 bg-brand-blue rounded-2xl p-8 text-center flex flex-col items-center">
                    <h3 className="text-xl font-bold text-white mb-3">Prêt à lancer vos travaux ?</h3>
                    <p className="text-blue-100 mb-6 max-w-lg">
                        Publiez votre mission sur LesCordistes.com et obtenez des devis de cordistes certifiés sous 48h.
                    </p>
                    <Link
                        href={article.ctaHref}
                        className="inline-block bg-white text-brand-blue px-8 py-4 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-lg"
                    >
                        {article.ctaText}
                    </Link>
                </div>
            </div>
        </div>
    )
}
