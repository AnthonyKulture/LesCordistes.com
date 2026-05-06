import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, HelpCircle } from 'lucide-react'
import { SEO_FAQ, FAQ_PERSONAS, getFaqByPersona, type FaqPersona } from '@/constants/seoFaq'
import { SEO_BASE_URL, SEO_BRAND_NAME } from '@/constants/seoConfig'

const PAGE_URL = `${SEO_BASE_URL}/faq`

export const metadata: Metadata = {
    title: 'Questions fréquentes sur les cordistes · LesCordistes',
    description: `${SEO_FAQ.length} questions/réponses sur le travail sur cordes : tarifs, certifications CQP/IRATA, choix entre cordiste, nacelle et échafaudage, ravalement de copropriété, inspection industrielle, missions cordiste indépendant, réglementation Code du travail R.4323-58.`,
    alternates: { canonical: PAGE_URL },
    openGraph: {
        title: 'Questions fréquentes sur les cordistes · LesCordistes',
        description: `${SEO_FAQ.length} questions/réponses sur les cordistes en France — tarifs, certifications, comparatifs, réglementation.`,
        url: PAGE_URL,
        type: 'website',
        images: [{
            url: `${SEO_BASE_URL}/og?title=${encodeURIComponent('Questions fréquentes cordistes')}&kicker=${encodeURIComponent('Hub Q/R')}&v=3`,
            width: 1200,
            height: 630,
        }],
    },
}

const PERSONA_ORDER: FaqPersona[] = [
    'particulier',
    'copropriete',
    'industrie',
    'cordiste-pro',
    'reglementaire',
    'comparatif',
]

/**
 * Schema strategy : 1 graph contenant
 *   - Le WebPage avec @id de la page
 *   - 1 QAPage par entrée FAQ (avec @id ancré sur le slug, mainEntity Question)
 *   - Le BreadcrumbList
 *
 * QAPage (vs FAQPage) : Google considère QAPage comme une question/réponse
 * distincte indexable individuellement, alors que FAQPage groupe sous une
 * seule URL. Pour un hub centralisé que les LLMs viennent puiser, QAPage par
 * Q/R donne un meilleur signal de granularité et de réutilisabilité.
 */
const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'CollectionPage',
            '@id': `${PAGE_URL}#collectionpage`,
            url: PAGE_URL,
            name: `Questions fréquentes sur les cordistes — ${SEO_FAQ.length} Q/R`,
            description: 'Hub centralisé de questions/réponses sur le travail sur cordes en France, organisé par persona (particulier, copropriété, industrie, cordiste pro, réglementation, comparatifs).',
            isPartOf: { '@id': `${SEO_BASE_URL}/#website` },
            mainEntity: SEO_FAQ.map((f) => ({ '@id': `${PAGE_URL}#${f.slug}` })),
        },
        {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Accueil', item: SEO_BASE_URL },
                { '@type': 'ListItem', position: 2, name: 'FAQ', item: PAGE_URL },
            ],
        },
        ...SEO_FAQ.map((f) => {
            // Google exige ISO 8601 avec timezone explicite. f.updated est 'YYYY-MM-DD'
            // → on suffixe T00:00:00Z (UTC) pour être strict-compliant et
            //   éviter les warnings GSC "Il manque le fuseau horaire".
            const dateIso = `${f.updated}T00:00:00Z`
            // Google n'accepte pas un simple { '@id': … } pour `author` sur QAPage.
            // Il faut inline @type + name (le @id reste valable pour le graph linking).
            const authorOrg = {
                '@type': 'Organization',
                '@id': `${SEO_BASE_URL}/#organization`,
                name: 'LesCordistes.com',
                url: SEO_BASE_URL,
            }
            return {
                '@type': 'QAPage',
                '@id': `${PAGE_URL}#${f.slug}`,
                url: `${PAGE_URL}#${f.slug}`,
                inLanguage: 'fr',
                isPartOf: { '@id': `${PAGE_URL}#collectionpage` },
                dateModified: dateIso,
                mainEntity: {
                    '@type': 'Question',
                    '@id': `${PAGE_URL}#${f.slug}-question`,
                    name: f.q,
                    text: f.q,
                    answerCount: 1,
                    dateCreated: dateIso,
                    author: authorOrg,
                    acceptedAnswer: {
                        '@type': 'Answer',
                        '@id': `${PAGE_URL}#${f.slug}-answer`,
                        text: f.a,
                        dateCreated: dateIso,
                        upvoteCount: 0,
                        author: authorOrg,
                        url: `${PAGE_URL}#${f.slug}`,
                    },
                },
            }
        }),
    ],
}

const PERSONA_INTRO = "Cette page rassemble les réponses aux questions les plus fréquemment posées sur le travail sur cordes en France, regroupées par profil. Chaque réponse est rédigée pour être autonome — vous pouvez la lire seule, la citer en assemblée générale ou la transmettre à un client. Les informations sont à jour au mai 2026."

export default function FaqHubPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <main className="bg-white">
                {/* Hero */}
                <section className="bg-slate-50 border-b border-slate-100">
                    <div className="container max-w-4xl py-12 md:py-16">
                        <nav aria-label="Fil d'Ariane" className="text-sm text-slate-500 mb-6">
                            <Link href="/" className="hover:text-brand-blue-light transition-colors">Accueil</Link>
                            <span className="mx-2">/</span>
                            <span className="text-slate-700">Questions fréquentes</span>
                        </nav>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue/10 text-brand-blue font-semibold text-xs uppercase tracking-wide mb-6">
                            <HelpCircle size={14} />
                            Hub Q/R · {SEO_FAQ.length} questions
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-5 leading-tight">
                            Questions fréquentes sur les cordistes
                        </h1>
                        <p className="text-base md:text-lg text-slate-700 max-w-3xl leading-relaxed">
                            {PERSONA_INTRO}
                        </p>
                    </div>
                </section>

                {/* Sommaire par persona (table of contents) */}
                <section className="py-10 md:py-12">
                    <div className="container max-w-4xl">
                        <h2 className="text-lg font-bold text-slate-900 mb-5">Naviguer par profil</h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {PERSONA_ORDER.map((p) => {
                                const meta = FAQ_PERSONAS[p]
                                const count = getFaqByPersona(p).length
                                return (
                                    <a
                                        key={p}
                                        href={`#persona-${p}`}
                                        className="block p-4 rounded-xl border border-slate-200 bg-white hover:border-brand-blue hover:bg-brand-blue/5 transition-colors"
                                    >
                                        <p className="font-bold text-slate-900 text-sm mb-1">{meta.label}</p>
                                        <p className="text-xs text-slate-500">{count} question{count > 1 ? 's' : ''}</p>
                                    </a>
                                )
                            })}
                        </div>
                    </div>
                </section>

                {/* Sections par persona */}
                {PERSONA_ORDER.map((persona) => {
                    const entries = getFaqByPersona(persona)
                    const meta = FAQ_PERSONAS[persona]
                    if (entries.length === 0) return null
                    return (
                        <section
                            key={persona}
                            id={`persona-${persona}`}
                            className="py-12 md:py-16 border-t border-slate-100 scroll-mt-20"
                        >
                            <div className="container max-w-4xl">
                                <div className="mb-8">
                                    <p className="text-sm font-semibold text-brand-blue uppercase tracking-wide mb-2">
                                        Profil
                                    </p>
                                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-3 leading-tight">
                                        {meta.label}
                                    </h2>
                                    <p className="text-slate-600 max-w-2xl">{meta.description}</p>
                                </div>

                                <div className="space-y-6">
                                    {entries.map((entry) => (
                                        <article
                                            key={entry.slug}
                                            id={entry.slug}
                                            className="p-6 md:p-8 rounded-2xl border border-slate-200 bg-white scroll-mt-20"
                                        >
                                            <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-4 leading-snug">
                                                {entry.q}
                                            </h3>
                                            <p className="text-slate-700 leading-relaxed text-base">
                                                {entry.a}
                                            </p>
                                            {entry.relatedHref && (
                                                <Link
                                                    href={entry.relatedHref}
                                                    className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-brand-blue hover:underline"
                                                >
                                                    {entry.relatedLabel ?? 'En savoir plus'}
                                                    <ArrowRight size={14} />
                                                </Link>
                                            )}
                                            <p className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
                                                Mise à jour : {new Date(entry.updated).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                {' · '}
                                                <a href={`#${entry.slug}`} className="hover:text-brand-blue underline">
                                                    Lien vers cette question
                                                </a>
                                            </p>
                                        </article>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )
                })}

                {/* CTA */}
                <section className="py-12 md:py-16 bg-slate-50 border-t border-slate-100">
                    <div className="container max-w-3xl text-center">
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">
                            Votre question n'est pas listée ?
                        </h2>
                        <p className="text-slate-600 mb-8">
                            Publiez votre besoin sur {SEO_BRAND_NAME} et obtenez des devis sous 48 h, uniquement de cordistes dont nous avons vérifié les certifications CQP, IRATA, RC Pro et Kbis.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link
                                href="/post-job"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-blue text-white font-bold rounded-xl hover:bg-brand-blue/90 transition-colors"
                            >
                                Publier une mission gratuitement
                                <ArrowRight size={16} />
                            </Link>
                            <Link
                                href="/a-propos"
                                className="inline-flex items-center justify-center px-6 py-3 bg-white border border-slate-300 text-slate-900 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                En savoir plus sur LesCordistes
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}
