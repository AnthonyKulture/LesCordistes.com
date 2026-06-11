import type { Metadata } from 'next'
import Link from 'next/link'
import {
    ArrowRight,
    Building2,
    FileCheck,
    Vote,
    Calendar,
    Euro,
    ShieldCheck,
    HelpCircle,
} from 'lucide-react'
import { SEO_BASE_URL, SEO_BRAND_NAME } from '@/constants/seoConfig'

const PAGE_URL = `${SEO_BASE_URL}/cordiste-copropriete`

export const metadata: Metadata = {
    title: 'Cordiste pour copropriété & syndic · LesCordistes',
    description:
        "Ravalement décennal, anti-pigeons, gouttières, étanchéité toit-terrasse, ITE : 3 à 5 devis comparatifs sous 48 h prêts à présenter en AG. Cordistes vérifiés CQP/IRATA + RC Pro + Kbis. Économie 30-40 % vs échafaudage.",
    alternates: { canonical: PAGE_URL },
    openGraph: {
        title: 'Cordiste pour copropriété & syndic · LesCordistes',
        description:
            "Devis comparatifs prêts à présenter en AG. Ravalement décennal, anti-pigeons, gouttières, étanchéité toit-terrasse. Économie 30-40 % vs échafaudage.",
        url: PAGE_URL,
        type: 'website',
        images: [{
            url: `${SEO_BASE_URL}/og?title=${encodeURIComponent('Cordiste pour copropriété')}&kicker=${encodeURIComponent('Syndic & AG')}&v=3`,
            width: 1200,
            height: 630,
        }],
    },
}

const SERVICES_COPRO = [
    {
        icon: Building2,
        title: 'Ravalement de façade décennal',
        desc: "Obligatoire tous les 10 ans (Code de la construction et de l'habitation, art. L132-1 et suivants). Cordiste : 20-60 €/m² selon état, 30-40 % moins cher qu'échafaudage.",
        priceFrom: 'À partir de 16 000 € HT',
        forSize: 'pour copropriété R+5 (800 m² façade)',
    },
    {
        icon: ShieldCheck,
        title: 'Sécurisation et anti-pigeons',
        desc: "Pose de pics inox, filets translucides, câbles tendus à ressorts. Conforme réglementation protection animale et arrêtés municipaux (Paris, Lyon, Marseille).",
        priceFrom: 'À partir de 500 € HT',
        forSize: 'pour traitement complet immeuble',
    },
    {
        icon: FileCheck,
        title: "Étanchéité toit-terrasse",
        desc: "Diagnostic, réparation localisée, traitement membranes EPDM/PVC, relevés acrotère. Idéal copropriétés années 60-80 où l'humidité Atlantique a dégradé les étanchéités.",
        priceFrom: 'À partir de 800 € HT',
        forSize: 'pour réparation localisée',
    },
    {
        icon: Calendar,
        title: 'Nettoyage et démoussage',
        desc: 'Façade, toiture, gouttières, vitres en hauteur. Intervention annuelle ou bisannuelle selon zone climatique. Hydrofuge inclus pour protection 3-5 ans.',
        priceFrom: 'À partir de 200 € HT',
        forSize: 'par intervention copropriété',
    },
    {
        icon: Building2,
        title: 'Isolation thermique extérieure (ITE)',
        desc: "ITE laine de roche ou PSE graphité sur pignons aveugles et façades non-ABF. Éligible MaPrimeRénov' Copropriété (jusqu'à 25 % du montant total des travaux).",
        priceFrom: 'À partir de 80 €/m² HT',
        forSize: '· aides cumulables CEE B-C',
    },
    {
        icon: FileCheck,
        title: 'Maintenance gouttières et chéneaux',
        desc: "Nettoyage annuel automnal (post-feuilles), débouchage, vérification étanchéité, réparation soudures. Évite les dégâts des eaux dans les parties communes.",
        priceFrom: 'À partir de 200 € HT',
        forSize: "pour immeuble multi-étages",
    },
]

const WORKFLOW_STEPS = [
    {
        n: 1,
        title: 'Vous publiez le besoin de la copropriété',
        body: "En 5 minutes, vous décrivez le projet (type de travaux, façade, urgence) et joignez les éléments utiles : plans, photos, diagnostic technique précédent. Précisez si la mission est en secteur ABF ou en zone UNESCO — nos cordistes filtrent en conséquence.",
    },
    {
        n: 2,
        title: 'Vous recevez 3 à 5 devis sous 48 heures',
        body: "Notre équipe alerte les cordistes vérifiés dans un rayon de 30 km autour de votre copropriété. Vous recevez plusieurs devis comparatifs, chacun accompagné des certifications (CQP, IRATA), de l'attestation RC Pro et du Kbis du prestataire — tout est prêt à présenter en AG.",
    },
    {
        n: 3,
        title: 'Vous présentez les devis en assemblée générale',
        body: "Nous fournissons un comparatif structuré (prix, délai, mobilisation espace public, certifications) à inclure dans la convocation d'AG. Pour les travaux d'entretien courant : vote à l'article 24 (majorité simple). Pour les gros travaux : vote à l'article 25 (majorité absolue, loi du 10 juillet 1965).",
    },
    {
        n: 4,
        title: "Le cordiste choisi démarre l'intervention",
        body: "Sous 1 à 4 semaines après le vote AG selon l'urgence et la disponibilité du cordiste retenu. Pour les interventions urgentes (fuite, sécurisation, dégât des eaux), un démarrage sous 24-48 heures est possible. Aucune commission n'est prélevée sur la transaction client-cordiste.",
    },
]

const FAQS = [
    {
        q: "Combien coûte le ravalement décennal d'une copropriété par cordiste ?",
        a: "Un ravalement de façade par cordiste coûte entre 20 et 60 € HT par m² selon l'état (nettoyage, enduit, peinture, traitement fissures). Pour une copropriété R+5 de 800 m² de façade, comptez 16 000 à 48 000 € HT (vs 25 000 à 70 000 € HT avec échafaudage traditionnel — économie 30 à 40 % sur le poste installation). Le ravalement est obligatoire tous les 10 ans dans les communes de plus de 5 000 habitants. À Paris, un arrêté préfectoral peut imposer des délais d'exécution.",
    },
    {
        q: "Comment faire voter en AG une intervention par cordiste plutôt qu'échafaudage ?",
        a: "Pour faire passer un vote AG copropriété en faveur d'une intervention cordiste : (1) présentez 3 devis comparatifs (cordiste vs échafaudage classique), avec économie chiffrée (30-40 % en moyenne) ; (2) joignez les certifications CQP, IRATA et RC Pro de chaque cordiste — c'est l'argument anti-objection le plus fort ; (3) précisez l'absence d'AOT (autorisation d'occupation temporaire) à demander à la mairie, donc démarrage 4-6 semaines plus tôt ; (4) mentionnez la conformité Code du travail R.4323-58 et l'arrêté du 4 août 2005 ; (5) prévoyez le vote à l'article 24 (majorité simple) si entretien courant, ou article 25 (majorité absolue) pour gros travaux.",
    },
    {
        q: "Le cordiste est-il couvert par la garantie décennale ?",
        a: "Pour les travaux relevant de la garantie construction (ravalement structurel, étanchéité, isolation par l'extérieur, travaux modifiant la nature ou l'étanchéité du gros œuvre), le cordiste doit obligatoirement présenter une assurance décennale en plus de la RC Pro (loi Spinetta de 1978). Sur LesCordistes.com, nous vérifions la décennale pour tous les cordistes intervenant sur ces types de travaux. L'attestation est jointe à chaque devis — vous pouvez la transmettre à votre assureur copropriété.",
    },
    {
        q: "Faut-il une autorisation de voirie (AOT) pour faire intervenir un cordiste sur la copropriété ?",
        a: "Dans la majorité des cas, non : l'intervention sur cordes ne nécessite pas d'autorisation d'occupation temporaire (AOT) du domaine public, contrairement à un échafaudage qui empiète sur le trottoir. C'est un avantage majeur pour la copropriété : le délai entre validation devis et démarrage chantier passe de 4-6 semaines (échafaudage + AOT mairie) à 24-48 heures (cordiste). Exceptions : si le matériel cordiste empiète sur le trottoir, une déclaration préalable peut être demandée selon les villes (Paris, Lyon, Marseille).",
    },
    {
        q: "Combien de temps dure une intervention cordiste sur copropriété R+5 ?",
        a: "Cela dépend du type d'intervention. Démoussage façade complète R+5 : 2-3 jours. Nettoyage façade : 3-7 jours. Ravalement complet (nettoyage + reprise enduit + peinture) : 2-4 semaines. Pose anti-pigeons : 1-3 jours. Étanchéité toit-terrasse : 1-2 semaines. Pour comparaison, un même chantier en échafaudage prend 3-6 semaines de plus à cause du montage/démontage et de l'AOT.",
    },
    {
        q: "Quelles aides financières pour les copropriétés ?",
        a: "Trois aides cumulables : (1) MaPrimeRénov' Copropriété (jusqu'à 25 % du montant total HT des travaux) pour les copropriétés en bouquet de travaux énergétiques (ITE, isolation toiture, fenêtres, ventilation) — gérée par l'ANAH ; (2) CEE Coup de pouce Isolation Coup de pouce B-C pour les copropriétés à étiquette DPE F ou G ; (3) aides locales Métropole/Région : Paris (Éco-rénovons), Lyon (Écoréno'v jusqu'à 4 000 €/lot), Métropole Aix-Marseille (PIG jusqu'à 30 %), Bordeaux (Action Cœur de Ville). Nos partenaires RGE accompagnent le montage du dossier.",
    },
    {
        q: "Que se passe-t-il en cas de litige avec le cordiste après le chantier ?",
        a: "Le litige se traite directement entre la copropriété et le cordiste, comme avec tout artisan classique (LesCordistes.com est intermédiation technique, sans engagement contractuel sur le chantier). En cas de défaut grave : (1) déclaration à l'assurance dommages-ouvrage si la copropriété en a souscrit une ; (2) mise en demeure recommandée AR ; (3) signalement à notre équipe — un défaut grave confirmé entraîne la suspension du profil cordiste sur la plateforme et empêche toute nouvelle mission. Notre rôle préventif : tous les cordistes publiés ont leur RC Pro et décennale vérifiées en amont.",
    },
]

const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'WebPage',
            '@id': `${PAGE_URL}#webpage`,
            url: PAGE_URL,
            name: 'Cordiste pour copropriété & syndic — devis comparatifs prêts AG',
            description: 'Ravalement décennal, anti-pigeons, gouttières, étanchéité toit-terrasse, ITE : 3 à 5 devis comparatifs sous 48 h prêts à présenter en assemblée générale. Cordistes vérifiés CQP/IRATA + RC Pro + Kbis.',
            isPartOf: { '@id': `${SEO_BASE_URL}/#website` },
            about: { '@id': `${SEO_BASE_URL}/#organization` },
            audience: {
                '@type': 'Audience',
                audienceType: 'Syndics de copropriété, conseils syndicaux, copropriétaires',
            },
        },
        {
            '@type': 'Service',
            '@id': `${PAGE_URL}#service`,
            name: 'Cordistes certifiés pour copropriétés et syndics',
            serviceType: 'Travaux sur cordes pour copropriétés',
            description: 'Mise en relation entre copropriétés/syndics et cordistes certifiés CQP/IRATA pour ravalement décennal, anti-pigeons, étanchéité toit-terrasse, ITE et entretien courant.',
            provider: { '@id': `${SEO_BASE_URL}/#organization` },
            areaServed: { '@type': 'Country', name: 'France' },
            audience: {
                '@type': 'Audience',
                audienceType: 'Syndics professionnels et bénévoles, conseils syndicaux',
            },
            offers: {
                '@type': 'Offer',
                priceCurrency: 'EUR',
                availability: 'https://schema.org/InStock',
                priceSpecification: {
                    '@type': 'UnitPriceSpecification',
                    priceCurrency: 'EUR',
                    minPrice: 20,
                    maxPrice: 60,
                    unitText: 'm² façade ravalement',
                },
            },
        },
        {
            '@type': 'HowTo',
            '@id': `${PAGE_URL}#howto`,
            name: 'Comment obtenir et faire voter des devis cordistes en assemblée générale',
            description: "Workflow complet pour un syndic ou conseil syndical, du dépôt du besoin au démarrage du chantier après vote AG.",
            totalTime: 'P14D',
            estimatedCost: { '@type': 'MonetaryAmount', currency: 'EUR', value: '0' },
            step: WORKFLOW_STEPS.map((s) => ({
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
                { '@type': 'ListItem', position: 2, name: 'Cordiste pour copropriété', item: PAGE_URL },
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

export default function CordisteCoproprietePage() {
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
                            <span className="text-slate-700">Cordiste pour copropriété</span>
                        </nav>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue/10 text-brand-blue font-semibold text-xs uppercase tracking-wide mb-6">
                            <Building2 size={14} />
                            Syndics &amp; conseils syndicaux
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-5 leading-tight">
                            Cordistes pour copropriétés &amp; syndics
                        </h1>
                        <p className="text-xl text-brand-blue font-semibold mb-6 max-w-3xl leading-snug">
                            3 à 5 devis comparatifs sous 48 h, prêts à présenter en assemblée générale.
                        </p>
                        <p className="text-base md:text-lg text-slate-700 max-w-3xl leading-relaxed">
                            Ravalement décennal, anti-pigeons, gouttières, étanchéité toit-terrasse, isolation extérieure :
                            tous les cordistes publiés sur LesCordistes.com sont vérifiés en interne (<strong>CQP cordiste,
                            IRATA, RC Pro, Kbis et décennale si applicable</strong>). Vous recevez plusieurs devis comparatifs
                            sous 48 heures, accompagnés de toutes les pièces de conformité — directement utilisables pour
                            votre prochaine AG. Aucune commission prélevée sur la transaction.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 mt-8">
                            <Link
                                href="/post-job"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-blue text-white font-bold rounded-xl hover:bg-brand-blue/90 transition-colors"
                            >
                                Publier ma demande copropriété
                                <ArrowRight size={16} />
                            </Link>
                            <Link
                                href="#workflow"
                                className="inline-flex items-center justify-center px-6 py-3 bg-white border border-slate-300 text-slate-900 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                Voir le workflow en 4 étapes
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Pourquoi le cordiste pour copropriété */}
                <section className="py-12 md:py-16">
                    <div className="container max-w-3xl">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">
                            Pourquoi de plus en plus de copropriétés choisissent le cordiste
                        </h2>
                        <div className="space-y-4 text-slate-700 leading-relaxed text-base md:text-lg">
                            <p>
                                Sur les <strong>copropriétés R+5 standards</strong>, l'intervention par cordiste est
                                <strong> 30 à 40 % moins chère qu'un échafaudage traditionnel</strong> — l'économie principale
                                vient du poste « installation » (montage, démontage, location 3 semaines, AOT mairie). Pour
                                une façade de 800 m², la différence atteint 8 000 à 22 000 € HT.
                            </p>
                            <p>
                                Le délai entre vote AG et démarrage du chantier passe également de 4-6 semaines
                                (échafaudage + AOT) à <strong>24-48 heures</strong> pour une intervention cordiste. C'est
                                particulièrement précieux en cas d'urgence (sécurisation post-tempête, fuite active, dégât
                                des eaux qui menace les parties communes).
                            </p>
                            <p>
                                Sur le plan réglementaire, le cordiste reste <strong>conforme au Code du travail R.4323-58 et
                                à l'arrêté du 4 août 2005</strong> sur la prévention des chutes en hauteur. La certification
                                CQP Cordiste (RNCP, France Compétences) est obligatoire en France et vérifiée en amont par
                                notre équipe — un argument anti-objection imparable face aux copropriétaires hésitants en AG.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Services pour copro */}
                <section className="py-12 md:py-16 bg-slate-50">
                    <div className="container max-w-5xl">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 text-center">
                            6 types d'interventions courantes en copropriété
                        </h2>
                        <p className="text-center text-slate-600 mb-10 max-w-2xl mx-auto">
                            Chaque cordiste publié sur LesCordistes.com est filtré selon le type d'intervention demandé.
                            Vous ne recevez que des devis pertinents.
                        </p>
                        <div className="grid md:grid-cols-2 gap-6">
                            {SERVICES_COPRO.map((service) => {
                                const Icon = service.icon
                                return (
                                    <article key={service.title} className="bg-white p-6 md:p-7 rounded-2xl border border-slate-200 shadow-sm">
                                        <div className="flex items-start gap-4">
                                            <Icon className="text-brand-blue-light flex-shrink-0 mt-1" size={26} strokeWidth={1.8} />
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 mb-2">{service.title}</h3>
                                                <p className="text-sm text-slate-700 leading-relaxed mb-3">{service.desc}</p>
                                                <p className="text-sm font-semibold text-brand-blue">
                                                    {service.priceFrom}
                                                    <span className="block text-xs font-normal text-slate-500 mt-0.5">{service.forSize}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </article>
                                )
                            })}
                        </div>
                    </div>
                </section>

                {/* Workflow */}
                <section id="workflow" className="py-12 md:py-16 scroll-mt-28">
                    <div className="container max-w-3xl">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
                            Comment ça se passe : du besoin à l'AG en 4 étapes
                        </h2>
                        <p className="text-slate-600 mb-10">
                            Pensé pour les syndics professionnels et bénévoles. Workflow complet, transparent, sans
                            engagement.
                        </p>
                        <ol className="space-y-6">
                            {WORKFLOW_STEPS.map((step) => (
                                <li key={step.n} className="flex gap-5 p-5 md:p-6 rounded-2xl border border-slate-200 bg-white">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-blue text-white font-black text-xl flex items-center justify-center">
                                        {step.n}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                                        <p className="text-slate-700 leading-relaxed text-sm md:text-base">{step.body}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                {/* Cadre légal copropriété */}
                <section className="py-12 md:py-16 bg-slate-50">
                    <div className="container max-w-3xl">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 flex items-start gap-3">
                            <Vote className="text-brand-blue-light flex-shrink-0 mt-2" size={32} />
                            Cadre légal copropriété : votes AG et obligations
                        </h2>
                        <div className="space-y-4 text-slate-700 leading-relaxed text-base md:text-lg">
                            <p>
                                Selon la <strong>loi du 10 juillet 1965</strong> (statut de la copropriété) et le
                                <strong> décret du 17 mars 1967</strong> (application), les votes AG pour travaux extérieurs
                                relèvent de deux articles selon la nature des travaux :
                            </p>
                            <ul className="space-y-3 ml-2">
                                <li className="flex items-start gap-3">
                                    <Vote className="text-brand-blue-light mt-1 flex-shrink-0" size={20} />
                                    <span>
                                        <strong>Article 24 — majorité simple</strong> : entretien courant, réparations
                                        ponctuelles, démoussage, anti-pigeons, nettoyage gouttières. Vote à la majorité
                                        des copropriétaires présents et représentés.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Vote className="text-brand-blue-light mt-1 flex-shrink-0" size={20} />
                                    <span>
                                        <strong>Article 25 — majorité absolue</strong> : ravalement décennal, étanchéité
                                        toit-terrasse, isolation thermique extérieure (ITE), travaux modifiant l'aspect
                                        extérieur. Vote à la majorité de tous les copropriétaires (pas seulement présents).
                                    </span>
                                </li>
                            </ul>
                            <p>
                                Le <strong>ravalement décennal</strong> est obligatoire dans toutes les communes de plus de
                                5 000 habitants (Code de la construction et de l'habitation, art. L132-1 et suivants).
                                À Paris, un arrêté préfectoral peut imposer un délai d'exécution avec injonction de la
                                mairie. Sur les bâtiments classés ABF ou en secteur sauvegardé, l'autorisation de l'Architecte
                                des Bâtiments de France est requise avant travaux.
                            </p>
                            <p>
                                Pour les copropriétés <strong>en zone climatique 1 ou 2 et avec un DPE F ou G</strong>,
                                l'isolation thermique extérieure est éligible à <strong>MaPrimeRénov' Copropriété</strong>
                                (jusqu'à 25 % du montant total HT) gérée par l'ANAH, cumulable avec les CEE Coup de pouce
                                B-C et les aides locales Métropole.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Tarifs concrets */}
                <section className="py-12 md:py-16">
                    <div className="container max-w-4xl">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 flex items-center gap-3">
                            <Euro className="text-brand-blue-light" size={32} />
                            Tarifs concrets : 3 exemples copropriété R+5
                        </h2>
                        <p className="text-slate-600 mb-8">
                            Tarifs HT 2026 indicatifs, hors TVA et hors matériaux. Source : analyse réseau LesCordistes.com.
                        </p>
                        <div className="space-y-4">
                            {[
                                {
                                    title: 'Démoussage façade copropriété R+5 (400 m²)',
                                    cordiste: '1 600 - 3 200 € HT',
                                    echafaudage: '4 500 - 8 000 € HT',
                                    save: '64-66 % d\'économie',
                                },
                                {
                                    title: 'Ravalement complet façade copropriété R+5 (800 m²)',
                                    cordiste: '16 000 - 48 000 € HT',
                                    echafaudage: '25 000 - 70 000 € HT',
                                    save: '30-40 % d\'économie',
                                },
                                {
                                    title: 'Pose anti-pigeons immeuble R+5 (corniches + balcons)',
                                    cordiste: '500 - 2 500 € HT',
                                    echafaudage: '3 500 - 6 000 € HT',
                                    save: '85-87 % d\'économie',
                                },
                            ].map((row, idx) => (
                                <article key={idx} className="p-6 rounded-2xl border border-slate-200 bg-white">
                                    <h3 className="font-bold text-slate-900 mb-3">{row.title}</h3>
                                    <div className="grid sm:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Par cordiste</p>
                                            <p className="font-bold text-brand-blue">{row.cordiste}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Par échafaudage</p>
                                            <p className="font-bold text-slate-700">{row.echafaudage}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Gain copro</p>
                                            <p className="font-bold text-green-600">{row.save}</p>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                        <p className="mt-6 text-sm text-slate-500 italic">
                            Comparatif moyenne secteur. Variations possibles selon état de la façade, accessibilité,
                            ville, période et finitions. Devis gratuit personnalisé sous 48 h sur demande.
                        </p>
                    </div>
                </section>

                {/* FAQ */}
                <section className="py-12 md:py-16 bg-slate-50">
                    <div className="container max-w-3xl">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 flex items-center gap-3">
                            <HelpCircle className="text-brand-blue-light" size={32} />
                            Questions fréquentes des syndics
                        </h2>
                        <p className="text-slate-600 mb-10">
                            Les 7 questions les plus posées par les syndics et conseils syndicaux qui découvrent l'option
                            cordiste pour leur copropriété.
                        </p>
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

                {/* CTA final */}
                <section className="py-12 md:py-16">
                    <div className="container max-w-3xl">
                        <div className="rounded-3xl bg-gradient-to-br from-brand-blue via-brand-blue to-brand-blue-light p-10 md:p-12 text-center text-white">
                            <h2 className="text-2xl md:text-3xl font-black mb-3">
                                Préparez votre prochaine AG sereinement
                            </h2>
                            <p className="text-blue-100 mb-8 max-w-xl mx-auto text-lg">
                                Recevez 3 à 5 devis comparatifs sous 48 h, avec toutes les pièces de conformité prêtes à
                                joindre à votre convocation d'AG. Sans engagement.
                            </p>
                            <Link
                                href="/post-job"
                                className="inline-flex items-center gap-2 bg-white text-brand-blue px-8 py-4 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-xl"
                            >
                                Publier ma demande copropriété
                                <ArrowRight size={18} />
                            </Link>
                            <p className="text-xs text-blue-100 mt-4">
                                Question ? <Link href="/faq" className="underline hover:no-underline">Hub FAQ centralisé</Link> ·
                                <Link href="/verification-pros" className="underline hover:no-underline ml-1">Notre processus de vérification</Link>
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}
