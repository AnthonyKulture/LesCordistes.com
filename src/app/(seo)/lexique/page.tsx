import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { SEO_GLOSSARY, GLOSSARY_CATEGORIES } from '@/constants/seoGlossary'
import { SEO_BASE_URL, SEO_BRAND_NAME } from '@/constants/seoConfig'

export const metadata: Metadata = {
    title: 'Le Lexique du Travail en Hauteur & Accès Difficile',
    description: 'Découvrez notre dictionnaire complet du travail sur cordes : CQP, IRATA, EPI, ancrages et réglementations. Le guide de référence des travaux en hauteur.',
    alternates: { canonical: `${SEO_BASE_URL}/lexique` },
}

const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'DefinedTermSet',
            '@id': `${SEO_BASE_URL}/lexique#termset`,
            name: 'Dictionnaire du Travail sur Cordes — LesCordistes.com',
            description: 'Glossaire des certifications, techniques, équipements et réglementations du travail sur cordes et accès difficile en France.',
            url: `${SEO_BASE_URL}/lexique`,
            inLanguage: 'fr',
            publisher: {
                '@type': 'Organization',
                '@id': `${SEO_BASE_URL}/#organization`,
                name: SEO_BRAND_NAME,
            },
        },
        {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Accueil', item: SEO_BASE_URL },
                { '@type': 'ListItem', position: 2, name: 'Dictionnaire', item: `${SEO_BASE_URL}/lexique` },
            ],
        },
    ],
}

export default function GlossaryHub() {
    return (
        <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div className="min-h-screen bg-slate-50 pt-24 pb-16">
            <div className="container max-w-5xl">
                <div className="text-center mb-16">
                    <div className="w-16 h-16 bg-brand-blue/10 text-brand-blue rounded-full flex items-center justify-center mx-auto mb-6">
                        <BookOpen size={32} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Le Lexique de l'Accès Difficile</h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Glossaire technique officiel, dictionnaire des normes environnementales et certifications européennes du domaine des travaux sur cordes.
                    </p>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                    {Object.entries(GLOSSARY_CATEGORIES).map(([key, label]) => {
                        const terms = SEO_GLOSSARY.filter((t) => t.category === key)
                        if (terms.length === 0) return null
                        return (
                            <div key={key} className="mb-14 last:mb-0">
                                <h2 className="text-2xl font-bold text-slate-900 mb-8 pb-4 border-b-2 border-slate-100 flex items-center gap-3">
                                    <span className="w-2 h-8 bg-brand-blue rounded-full block" />
                                    {label}
                                </h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {terms.map((term) => (
                                        <Link
                                            key={term.slug}
                                            href={`/lexique/${term.slug}`}
                                            className="bg-slate-50 border border-slate-100 p-6 rounded-xl hover:shadow-md hover:bg-white hover:border-brand-blue/30 transition-all group block"
                                        >
                                            <h3 className="text-xl font-bold text-brand-blue mb-3 group-hover:text-brand-blue-light">{term.title}</h3>
                                            <p className="text-slate-600 line-clamp-2 leading-relaxed">{term.definition}</p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
        </>
    )
}
