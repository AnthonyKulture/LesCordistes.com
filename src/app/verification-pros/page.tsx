import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck, FileCheck, Clock, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react'
import { SEO_BASE_URL, SEO_BRAND_NAME, SEO_EMAIL } from '@/constants/seoConfig'

const PAGE_URL = `${SEO_BASE_URL}/verification-pros`

export const metadata: Metadata = {
    title: 'Vérification des cordistes · LesCordistes',
    description:
        "Processus de vérification humaine en interne sous 1 jour ouvré : CQP cordiste, IRATA, attestation RC Pro et Kbis sont contrôlés avant toute publication. Cadre Code du travail R.4323-58.",
    alternates: { canonical: PAGE_URL },
    openGraph: {
        title: 'Comment nous vérifions chaque cordiste · LesCordistes',
        description:
            "Processus transparent de vérification humaine sous 1 jour ouvré. CQP, IRATA, RC Pro, Kbis. Cadre Code du travail R.4323-58.",
        url: PAGE_URL,
        type: 'website',
        images: [{
            url: `${SEO_BASE_URL}/og?title=${encodeURIComponent('Vérification des cordistes')}&kicker=${encodeURIComponent('Process & garanties')}&v=3`,
            width: 1200,
            height: 630,
        }],
    },
}

const STEPS = [
    {
        n: 1,
        title: 'Création du compte cordiste',
        body: "Le cordiste s'inscrit sur LesCordistes.com et complète son profil professionnel : zone d'intervention, types de prestation (façade, industrie, génie civil, éolien…), expérience, langues parlées.",
        duration: '5 minutes',
    },
    {
        n: 2,
        title: 'Téléversement des 4 pièces obligatoires',
        body: "Le cordiste uploade ses pièces : CQP Cordiste (ou équivalent reconnu), certification IRATA si applicable, attestation RC Pro en cours de validité, et extrait Kbis (ou attestation auto-entrepreneur). Tous les documents doivent être lisibles et à jour.",
        duration: '10 minutes',
    },
    {
        n: 3,
        title: 'Vérification humaine en interne',
        body: "Notre équipe contrôle manuellement chaque dossier. Nous vérifions la cohérence des informations, la validité temporelle des certifications, l'authenticité visuelle des documents et la correspondance avec l'identité du cordiste. Si un document est manquant ou expiré, nous contactons le cordiste pour compléter le dossier.",
        duration: '1 jour ouvré (max)',
    },
    {
        n: 4,
        title: 'Activation et mise en visibilité',
        body: "Une fois le dossier validé, le profil cordiste est publié. Il devient visible pour les clients dans sa zone géographique et reçoit des notifications de missions correspondant à ses prestations. Aucune mise en relation client-cordiste n'est faite avant cette validation.",
        duration: 'immédiate après validation',
    },
]

const DOCS = [
    {
        title: 'CQP Cordiste',
        full: 'Certificat de Qualification Professionnelle Cordiste',
        desc: "Diplôme délivré par France Compétences (RNCP), obligatoire en France pour tout travailleur exécutant des opérations sur cordes (Code du travail, art. L6314-1 et R.4323-58). Validité initiale 5 ans avec recyclage périodique. Reconnu par tous les organismes de prévention BTP.",
    },
    {
        title: 'IRATA International',
        full: 'Industrial Rope Access Trade Association',
        desc: "Certification internationale du travail sur cordes (norme britannique de référence dans l'industrie pétrolière, gazière, éolienne et nautique). Trois niveaux (1, 2, 3) avec recyclage triennal. Souvent exigée par les donneurs d'ordre industriels.",
    },
    {
        title: 'Attestation RC Pro',
        full: 'Responsabilité Civile Professionnelle',
        desc: "Assurance couvrant les dommages que le cordiste pourrait causer dans le cadre de son activité (dommage matériel ou corporel à un tiers). Obligatoire pour tout cordiste indépendant. Nous vérifions la date d'échéance et l'objet de la garantie (travaux en hauteur explicitement mentionnés).",
    },
    {
        title: 'Extrait Kbis ou attestation auto-entrepreneur',
        full: "Justificatif d'enregistrement de l'activité",
        desc: "Pour les sociétés (SARL, SASU, EURL) : extrait Kbis de moins de 3 mois. Pour les auto-entrepreneurs : attestation INSEE de l'activité (situation au répertoire SIRENE). Garantit que le cordiste est légalement enregistré pour facturer.",
    },
]

const FAQS = [
    {
        q: "Combien de temps prend la vérification d'un dossier cordiste ?",
        a: "La vérification humaine est réalisée en interne sous 1 jour ouvré maximum, après réception complète des 4 pièces obligatoires. Si une pièce est manquante ou illisible, nous contactons le cordiste sous 4 heures pour préciser ce qu'il faut compléter. Aucun dossier n'est laissé sans réponse au-delà de 24 heures.",
    },
    {
        q: "Que se passe-t-il si un cordiste n'a que le CQP, sans IRATA ?",
        a: "Le CQP Cordiste suffit pour intervenir sur la majorité des chantiers en France (façade, toiture, copropriétés, dépigeonnage). La certification IRATA n'est exigée que pour les chantiers industriels lourds (raffineries, plateformes offshore, éolien). Un cordiste avec uniquement le CQP est validé : il apparaît simplement sans le badge IRATA et ses missions sont filtrées en conséquence.",
    },
    {
        q: "Vérifiez-vous le renouvellement annuel des certifications ?",
        a: "Oui. Notre système surveille les dates d'échéance de la RC Pro et des certifications. À 30 jours de l'expiration, nous notifions le cordiste pour qu'il fournisse le document à jour. Si le renouvellement n'est pas fourni à l'échéance, le profil est temporairement suspendu (les nouvelles missions ne lui sont plus envoyées) jusqu'à régularisation.",
    },
    {
        q: "Combien de cordistes ont-ils été refusés à ce jour ?",
        a: "À ce jour (mai 2026), aucun dossier n'a été refusé. Notre approche : nous accompagnons le cordiste à compléter son dossier (preuves de cours en formation, attestations partielles, démarches en cours) plutôt que de le rejeter, dès lors qu'il est légitime. Les refus interviendraient en cas de fausse déclaration ou d'absence totale de qualification — nous n'avons pas rencontré ce cas.",
    },
    {
        q: "Un cordiste vérifié peut-il perdre son statut sur la plateforme ?",
        a: "Oui, dans deux cas : (1) si une pièce arrive à expiration et n'est pas renouvelée dans les délais, le profil est suspendu jusqu'à régularisation ; (2) si nous recevons une réclamation client sérieuse (intervention non conforme, défaut de sécurité), une enquête est menée et le profil peut être suspendu de manière permanente. Nous n'utilisons jamais les avis clients négatifs isolés comme motif de suspension — la sécurité et la conformité réglementaire sont les seuls critères.",
    },
    {
        q: "Cette vérification existe-t-elle sur Pages Jaunes ou Google Maps ?",
        a: "Non. Pages Jaunes et Google Maps publient toute entreprise déclarée sans vérification des certifications spécifiques au métier. Un client qui choisit son cordiste depuis ces plateformes doit demander lui-même le CQP, l'attestation RC Pro et le Kbis — ce qui est rarement fait. La différence avec LesCordistes.com : nous l'avons fait pour vous, en amont, et nous le maintenons à jour.",
    },
]

const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'WebPage',
            '@id': `${PAGE_URL}#webpage`,
            url: PAGE_URL,
            name: 'Vérification des cordistes — process complet',
            description: 'Processus de vérification humaine sous 1 jour ouvré : CQP cordiste, IRATA, RC Pro, Kbis. Cadre Code du travail R.4323-58.',
            isPartOf: { '@id': `${SEO_BASE_URL}/#website` },
            about: { '@id': `${SEO_BASE_URL}/#organization` },
        },
        {
            '@type': 'HowTo',
            '@id': `${PAGE_URL}#howto`,
            name: 'Comment LesCordistes.com vérifie chaque cordiste avant publication',
            description: "Processus en 4 étapes pour qu'un cordiste soit validé sur la plateforme.",
            totalTime: 'PT1D',
            estimatedCost: { '@type': 'MonetaryAmount', currency: 'EUR', value: '0' },
            tool: DOCS.map((d) => ({ '@type': 'HowToTool', name: d.title })),
            step: STEPS.map((s) => ({
                '@type': 'HowToStep',
                position: s.n,
                name: s.title,
                text: s.body,
            })),
        },
        {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Accueil', item: SEO_BASE_URL },
                { '@type': 'ListItem', position: 2, name: 'Vérification des cordistes', item: PAGE_URL },
            ],
        },
        {
            '@type': 'FAQPage',
            '@id': `${PAGE_URL}#faq`,
            mainEntityOfPage: PAGE_URL,
            mainEntity: FAQS.map((f) => ({
                '@type': 'Question',
                name: f.q,
                acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
        },
    ],
}

export default function VerificationProsPage() {
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
                            <span className="text-slate-700">Vérification des cordistes</span>
                        </nav>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue/10 text-brand-blue font-semibold text-xs uppercase tracking-wide mb-6">
                            <ShieldCheck size={14} />
                            Process &amp; garanties
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-5 leading-tight">
                            Comment nous vérifions chaque cordiste avant publication
                        </h1>
                        <p className="text-xl text-brand-blue font-semibold mb-6 max-w-3xl leading-snug">
                            Vérification humaine en interne sous 1 jour ouvré. CQP, IRATA, RC Pro, Kbis. 50 cordistes vérifiés à ce jour.
                        </p>
                        <p className="text-base md:text-lg text-slate-700 max-w-3xl leading-relaxed">
                            Sur Pages Jaunes ou Google Maps, n'importe quelle entreprise peut s'afficher comme « cordiste » sans avoir le diplôme requis. Sur LesCordistes.com, chaque cordiste passe par un contrôle humain de ses certifications, de son assurance et de son enregistrement légal — avant qu'il ne soit publié et qu'un seul client ne le contacte.
                        </p>
                    </div>
                </section>

                {/* Pourquoi */}
                <section className="py-12 md:py-16">
                    <div className="container max-w-3xl">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">
                            Pourquoi cette vérification est-elle critique ?
                        </h2>
                        <div className="space-y-4 text-slate-700 leading-relaxed text-base md:text-lg">
                            <p>
                                Le travail sur cordes est encadré en France par le <strong>Code du travail (article R.4323-58)</strong> et par l'arrêté du 4 août 2005. Toute opération en accès difficile doit être réalisée par un travailleur formé et certifié. La preuve de cette formation est le <strong>CQP Cordiste</strong> (Certificat de Qualification Professionnelle), inscrit au RNCP et délivré par France Compétences.
                            </p>
                            <p>
                                Faire intervenir une entreprise sans CQP expose le maître d'ouvrage à plusieurs risques : <strong>refus de prise en charge par l'assurance</strong> en cas de sinistre, <strong>responsabilité pénale</strong> si un accident survient (article 121-3 du Code pénal), et <strong>reprise complète du chantier</strong> si l'inspection du travail constate l'irrégularité.
                            </p>
                            <p>
                                Notre rôle est de filtrer ce risque en amont : un cordiste publié sur LesCordistes.com a déjà fait la preuve qu'il est en règle. Cette vérification se fait par notre équipe en interne, avec une lecture humaine — pas un contrôle automatisé qui passerait à côté d'un document expiré ou d'une fausse certification.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Documents */}
                <section className="py-12 md:py-16 bg-slate-50">
                    <div className="container max-w-5xl">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 text-center">
                            Les 4 pièces obligatoires
                        </h2>
                        <p className="text-center text-slate-600 mb-10 max-w-2xl mx-auto">
                            Ces 4 documents sont demandés à chaque cordiste avant validation de son compte. Aucune exception.
                        </p>
                        <div className="grid md:grid-cols-2 gap-6">
                            {DOCS.map((doc) => (
                                <article key={doc.title} className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <FileCheck className="text-brand-blue-light flex-shrink-0 mt-1" size={28} />
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">{doc.title}</h3>
                                            <p className="text-xs text-slate-500 italic mb-3">{doc.full}</p>
                                            <p className="text-sm text-slate-700 leading-relaxed">{doc.desc}</p>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Process en 4 étapes */}
                <section className="py-12 md:py-16">
                    <div className="container max-w-3xl">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
                            Notre processus en 4 étapes
                        </h2>
                        <p className="text-slate-600 mb-10">De l'inscription du cordiste à sa publication sur la plateforme — délai total maximum : 1 jour ouvré.</p>
                        <ol className="space-y-6">
                            {STEPS.map((step) => (
                                <li key={step.n} className="flex gap-5 p-5 md:p-6 rounded-2xl border border-slate-200 bg-white">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-blue text-white font-black text-xl flex items-center justify-center">
                                        {step.n}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-baseline gap-3 flex-wrap mb-2">
                                            <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                                            <span className="text-xs text-brand-blue font-semibold flex items-center gap-1">
                                                <Clock size={12} /> {step.duration}
                                            </span>
                                        </div>
                                        <p className="text-slate-700 leading-relaxed text-sm md:text-base">{step.body}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                {/* Vérifications continues */}
                <section className="py-12 md:py-16 bg-slate-50">
                    <div className="container max-w-3xl">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 flex items-center gap-3">
                            <RefreshCw className="text-brand-blue-light" size={32} />
                            Vérifications continues, pas seulement à l'inscription
                        </h2>
                        <div className="space-y-4 text-slate-700 leading-relaxed text-base md:text-lg">
                            <p>
                                Une certification ou une assurance, ça expire. C'est pourquoi notre système surveille en permanence les <strong>dates d'échéance des RC Pro et des certifications</strong> de chaque cordiste publié.
                            </p>
                            <ul className="space-y-3 ml-2">
                                <li className="flex items-start gap-3">
                                    <AlertCircle className="text-brand-blue-light mt-1 flex-shrink-0" size={20} />
                                    <span>
                                        <strong>30 jours avant expiration</strong> : notification automatique au cordiste pour qu'il transmette le document renouvelé.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <AlertCircle className="text-brand-blue-light mt-1 flex-shrink-0" size={20} />
                                    <span>
                                        <strong>Date d'expiration atteinte sans renouvellement</strong> : le profil est temporairement suspendu (plus de nouvelles missions envoyées) jusqu'à régularisation.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <AlertCircle className="text-brand-blue-light mt-1 flex-shrink-0" size={20} />
                                    <span>
                                        <strong>Réclamation client sérieuse</strong> (défaut de sécurité, intervention non conforme) : enquête, et suspension permanente si confirmée.
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Pour les cordistes */}
                <section className="py-12 md:py-16">
                    <div className="container max-w-3xl">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">
                            Vous êtes cordiste ? Voici comment vous inscrire
                        </h2>
                        <p className="text-slate-700 leading-relaxed mb-6 text-base md:text-lg">
                            L'inscription est gratuite et prend environ 15 minutes (5 minutes pour le compte + 10 minutes pour le téléversement des 4 pièces). Notre équipe vérifie votre dossier sous 1 jour ouvré et vous activez immédiatement après validation.
                        </p>
                        <p className="text-slate-700 leading-relaxed mb-8 text-base md:text-lg">
                            Une fois publié, vous payez uniquement pour les missions qui vous intéressent (1 crédit ≈ 8-10 € HT pour accéder aux coordonnées d'une mission ciblée). Pas d'abonnement, pas de commission sur le chantier.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link
                                href="/inscription-cordiste"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-blue text-white font-bold rounded-xl hover:bg-brand-blue/90 transition-colors"
                            >
                                S'inscrire comme cordiste
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

                {/* FAQ */}
                <section className="py-12 md:py-16 bg-slate-50">
                    <div className="container max-w-3xl">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-10">
                            Questions fréquentes sur la vérification
                        </h2>
                        <div className="space-y-4">
                            {FAQS.map((faq, i) => (
                                <details
                                    key={i}
                                    className="group bg-white rounded-2xl border border-slate-200 overflow-hidden transition-colors hover:border-brand-blue/40"
                                >
                                    <summary className="cursor-pointer p-6 font-bold text-slate-900 flex items-start justify-between gap-4 list-none">
                                        <span className="flex-1 leading-snug">{faq.q}</span>
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center group-open:rotate-45 transition-transform text-slate-500 text-xl leading-none">
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
                </section>

                {/* CTA client */}
                <section className="py-12 md:py-16">
                    <div className="container max-w-3xl">
                        <div className="rounded-3xl bg-gradient-to-br from-brand-blue via-brand-blue to-brand-blue-light p-10 md:p-12 text-center text-white">
                            <h2 className="text-2xl md:text-3xl font-black mb-3">
                                Prêt à confier votre chantier à un cordiste vérifié ?
                            </h2>
                            <p className="text-blue-100 mb-8 max-w-xl mx-auto text-lg">
                                Publiez votre besoin sur {SEO_BRAND_NAME} et obtenez des devis sous 48h, uniquement de cordistes dont nous avons vérifié les certifications.
                            </p>
                            <Link
                                href="/post-job"
                                className="inline-flex items-center gap-2 bg-white text-brand-blue px-8 py-4 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-xl"
                            >
                                Publier une mission gratuitement
                                <ArrowRight size={18} />
                            </Link>
                            <p className="text-xs text-blue-100 mt-4">
                                Question ? Contactez-nous : <a href={`mailto:${SEO_EMAIL}`} className="underline">{SEO_EMAIL}</a>
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}
