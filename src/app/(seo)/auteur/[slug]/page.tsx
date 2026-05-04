import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, Calendar, Clock, Linkedin } from 'lucide-react'
import { AUTHORS, getAuthor, authorPersonId, authorUrl } from '@/constants/seoAuthors'
import { SEO_BLOG, SEO_BLOG_BASE, getBlogImage, BLOG_CATEGORIES } from '@/constants/seoBlog'
import { SEO_BASE_URL, SEO_BRAND_NAME } from '@/constants/seoConfig'

interface Props {
    params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
    return Object.keys(AUTHORS).map((slug) => ({ slug }))
}

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    if (!AUTHORS[slug]) return {}
    const author = getAuthor(slug)
    return {
        title: `${author.name} · ${author.role}`,
        description: author.bio.length > 160 ? `${author.bio.slice(0, 157)}…` : author.bio,
        alternates: { canonical: authorUrl(author) },
        openGraph: {
            title: `${author.name} · ${author.role} · LesCordistes`,
            description: author.bio,
            url: authorUrl(author),
            type: 'profile',
            images: [{
                url: `${SEO_BASE_URL}/og?title=${encodeURIComponent(author.name)}&kicker=${encodeURIComponent(author.role)}&v=3`,
                width: 1200,
                height: 630,
            }],
        },
    }
}

export default async function AuthorPage({ params }: Props) {
    const { slug } = await params
    if (!AUTHORS[slug]) notFound()
    const author = getAuthor(slug)

    const articles = SEO_BLOG
        .filter((a) => (a.authorSlug ?? 'anthony-profit') === author.slug)
        .sort((a, b) => b.datePublished.localeCompare(a.datePublished))

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'ProfilePage',
                '@id': `${authorUrl(author)}#profilepage`,
                url: authorUrl(author),
                name: `${author.name} — ${author.role}`,
                description: author.bio,
                isPartOf: { '@id': `${SEO_BASE_URL}/#website` },
                mainEntity: { '@id': authorPersonId(author) },
            },
            {
                '@type': 'Person',
                '@id': authorPersonId(author),
                name: author.name,
                givenName: author.givenName,
                familyName: author.familyName,
                jobTitle: author.role,
                description: author.bio,
                url: authorUrl(author),
                sameAs: [author.linkedin],
                worksFor: { '@id': `${SEO_BASE_URL}/#organization` },
                knowsAbout: author.expertise,
            },
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Accueil', item: SEO_BASE_URL },
                    { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SEO_BASE_URL}/blog` },
                    { '@type': 'ListItem', position: 3, name: author.name, item: authorUrl(author) },
                ],
            },
            ...(articles.length > 0 ? [{
                '@type': 'CollectionPage',
                '@id': `${authorUrl(author)}#collection`,
                url: authorUrl(author),
                name: `Articles écrits par ${author.name}`,
                isPartOf: { '@id': `${SEO_BASE_URL}/#website` },
                hasPart: articles.map((a) => ({
                    '@type': 'BlogPosting',
                    '@id': `${SEO_BLOG_BASE}/${a.slug}#article`,
                    headline: a.title,
                    url: `${SEO_BLOG_BASE}/${a.slug}`,
                    datePublished: a.datePublished,
                    dateModified: a.dateModified,
                    author: { '@id': authorPersonId(author) },
                })),
            }] : []),
        ],
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

                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-brand-blue/30 border border-brand-blue/40 text-brand-blue-light font-semibold text-xs uppercase tracking-wide">
                            Auteur
                        </span>
                        <a
                            href={author.linkedin}
                            target="_blank"
                            rel="noopener noreferrer me"
                            className="inline-flex items-center gap-1.5 text-brand-blue-light hover:text-white text-sm transition-colors"
                        >
                            <Linkedin size={14} /> Profil LinkedIn
                        </a>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black mb-3 leading-[1.1]">
                        {author.name}
                    </h1>
                    <p className="text-brand-blue-light text-base md:text-lg font-semibold mb-6">
                        {author.role}
                    </p>
                    <p className="text-base md:text-lg text-slate-300 leading-relaxed max-w-3xl">
                        {author.bio}
                    </p>

                    {author.expertise.length > 0 && (
                        <div className="mt-8 pt-8 border-t border-white/10">
                            <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-3">Domaines d'expertise</p>
                            <ul className="flex flex-wrap gap-2">
                                {author.expertise.map((e) => (
                                    <li key={e} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-sm">
                                        {e}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* ARTICLES */}
            <div className="container max-w-6xl py-16 md:py-20">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-10">
                    {articles.length > 0 ? `Articles écrits par ${author.givenName} (${articles.length})` : `Aucun article publié pour le moment`}
                </h2>

                {articles.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map((article) => (
                            <Link
                                key={article.slug}
                                href={`/blog/${article.slug}`}
                                className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-brand-blue hover:shadow-lg transition-all"
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
                                    <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-2 flex-1">
                                        {article.description}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-4 border-t border-slate-100">
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
                ) : (
                    <p className="text-slate-600">Pas encore d'article publié sous cette signature.</p>
                )}

                {/* CTA contact */}
                <div className="mt-16 p-6 md:p-8 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div>
                        <p className="text-sm text-slate-500 mb-1">À propos de {SEO_BRAND_NAME}</p>
                        <p className="text-slate-900 font-bold leading-snug">
                            Plateforme française des cordistes certifiés CQP/IRATA. Devis gratuit sous 48h.
                        </p>
                    </div>
                    <Link
                        href="/a-propos"
                        className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-blue text-white font-bold hover:bg-brand-blue/90 transition-colors"
                    >
                        En savoir plus
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </div>
    )
}
