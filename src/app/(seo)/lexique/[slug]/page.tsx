import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SEO_GLOSSARY, GLOSSARY_CATEGORIES } from '@/constants/seoGlossary'
import { SEO_BASE_URL } from '@/constants/seoConfig'

interface Props {
    params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
    return SEO_GLOSSARY.map((term) => ({ slug: term.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const term = SEO_GLOSSARY.find((t) => t.slug === slug)
    if (!term) return {}
    return {
        title: `${term.title} - Définition Travaux en Hauteur`,
        description: `Définition de ${term.title} : ${term.definition}. Comprendre les standards industriels du travail sur cordes.`,
        alternates: { canonical: `${SEO_BASE_URL}/lexique/${term.slug}` },
    }
}

export default async function GlossaryArticle({ params }: Props) {
    const { slug } = await params
    const term = SEO_GLOSSARY.find((t) => t.slug === slug)
    if (!term) notFound()

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'DefinedTerm',
                '@id': `${SEO_BASE_URL}/lexique/${term.slug}#term`,
                name: term.title,
                url: `${SEO_BASE_URL}/lexique/${term.slug}`,
                description: term.definition,
                inDefinedTermSet: {
                    '@type': 'DefinedTermSet',
                    '@id': `${SEO_BASE_URL}/lexique#termset`,
                    name: 'Dictionnaire du Travail sur Cordes — LesCordistes.com',
                    url: `${SEO_BASE_URL}/lexique`,
                },
            },
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Accueil', item: SEO_BASE_URL },
                    { '@type': 'ListItem', position: 2, name: 'Dictionnaire', item: `${SEO_BASE_URL}/lexique` },
                    { '@type': 'ListItem', position: 3, name: term.title, item: `${SEO_BASE_URL}/lexique/${term.slug}` },
                ],
            },
        ],
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-16">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <div className="container max-w-3xl">
                <Link href="/lexique" className="inline-flex items-center text-brand-blue hover:text-brand-blue-light font-medium mb-10 group">
                    <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Retour au dictionnaire
                </Link>

                <article className="bg-white rounded-3xl p-10 md:p-14 shadow-sm border border-slate-200">
                    <div className="mb-4 inline-block px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 font-medium text-sm">
                        {GLOSSARY_CATEGORIES[term.category]}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 leading-tight">{term.title}</h1>
                    <div className="text-xl text-brand-blue font-medium p-8 bg-brand-blue/5 rounded-2xl border border-brand-blue/20 mb-10 leading-relaxed shadow-inner">
                        {term.definition}
                    </div>
                    <div className="prose prose-lg prose-slate max-w-none">
                        <p>{term.content}</p>
                    </div>
                </article>

                <div className="mt-12 bg-white rounded-2xl border border-slate-200 p-8 text-center flex flex-col items-center justify-center">
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Besoin d'un cordiste maîtrisant ces standards ?</h3>
                    <p className="text-slate-600 mb-8 max-w-lg">Publiez votre besoin sur la plateforme leader pour obtenir des devis rapides auprès de techniciens certifiés.</p>
                    <Link href="/post-job" className="bg-brand-blue hover:bg-brand-blue-light text-white px-8 py-4 rounded-xl font-bold transition-colors shadow-lg">
                        Demander un devis en ligne
                    </Link>
                </div>
            </div>
        </div>
    )
}
