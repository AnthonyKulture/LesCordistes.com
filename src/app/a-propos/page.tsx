import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Linkedin, ShieldCheck, MapPin, Phone } from 'lucide-react'
import {
    SEO_BASE_URL,
    SEO_BRAND_NAME,
    SEO_PHONE,
    SEO_EMAIL,
    SEO_LOGO,
    SEO_POSTAL_ADDRESS,
    SEO_OPENING_HOURS,
    SEO_SAME_AS,
} from '@/constants/seoConfig'

const ABOUT_URL = `${SEO_BASE_URL}/a-propos`
const ANTHONY_ID = `${ABOUT_URL}#anthony-profit`
const BENJAMIN_ID = `${ABOUT_URL}#benjamin-de-oliveira`
const TEAM_PHOTO = `${SEO_BASE_URL}/equipe-anthony-benjamin.jpg`

export const metadata: Metadata = {
    title: 'À propos · LesCordistes',
    description:
        "Plateforme française basée à Nice, fondée en 2025 par Anthony Profit avec l'expertise métier de Benjamin De Oliveira (cordiste-formateur CQP/IRATA). 50 cordistes vérifiés, présence dans toutes les grandes villes de France.",
    alternates: { canonical: ABOUT_URL },
    openGraph: {
        title: 'À propos · LesCordistes',
        description:
            "Plateforme française basée à Nice, fondée en 2025 par Anthony Profit avec l'expertise métier de Benjamin De Oliveira.",
        url: ABOUT_URL,
        images: [{ url: TEAM_PHOTO, width: 1200, height: 630 }],
    },
}

const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'AboutPage',
            '@id': `${ABOUT_URL}#aboutpage`,
            url: ABOUT_URL,
            name: 'À propos de LesCordistes.com',
            description:
                'Histoire, équipe, vérification des cordistes et chiffres clés de la plateforme.',
            isPartOf: { '@id': `${SEO_BASE_URL}/#website` },
            mainEntity: { '@id': `${SEO_BASE_URL}/#organization` },
            primaryImageOfPage: { '@type': 'ImageObject', url: TEAM_PHOTO, width: 1200, height: 630 },
        },
        {
            '@type': 'Person',
            '@id': ANTHONY_ID,
            name: 'Anthony Profit',
            givenName: 'Anthony',
            familyName: 'Profit',
            jobTitle: 'Fondateur & développeur full-stack',
            worksFor: { '@id': `${SEO_BASE_URL}/#organization` },
            url: ABOUT_URL,
            sameAs: ['https://www.linkedin.com/in/anthonyprofit/'],
            address: {
                '@type': 'PostalAddress',
                addressLocality: 'Nice',
                addressRegion: "Provence-Alpes-Côte d'Azur",
                postalCode: '06000',
                addressCountry: 'FR',
            },
        },
        {
            '@type': 'Person',
            '@id': BENJAMIN_ID,
            name: 'Benjamin De Oliveira',
            givenName: 'Benjamin',
            familyName: 'De Oliveira',
            jobTitle: 'Conseiller expert métier — cordiste CQP/IRATA, formateur',
            url: ABOUT_URL,
            sameAs: ['https://www.linkedin.com/in/benjamin-de-oliveira-62b38695/'],
            knowsAbout: [
                'Travail sur cordes',
                'Sécurité hauteur',
                'Formation CQP cordiste',
                'IRATA International',
                'Réglementation R.4323-58 Code du travail',
            ],
        },
        {
            '@type': ['Organization', 'ProfessionalService'],
            '@id': `${SEO_BASE_URL}/#organization`,
            name: SEO_BRAND_NAME,
            url: `${SEO_BASE_URL}/`,
            logo: { '@type': 'ImageObject', url: SEO_LOGO, width: 1200, height: 630 },
            image: { '@type': 'ImageObject', url: TEAM_PHOTO, width: 1200, height: 630 },
            telephone: SEO_PHONE,
            email: SEO_EMAIL,
            address: SEO_POSTAL_ADDRESS,
            contactPoint: {
                '@type': 'ContactPoint',
                telephone: SEO_PHONE,
                email: SEO_EMAIL,
                contactType: 'customer service',
                areaServed: 'FR',
                availableLanguage: 'French',
            },
            foundingDate: '2025',
            founder: { '@id': ANTHONY_ID },
            numberOfEmployees: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 5 },
            knowsAbout: [
                'Cordiste',
                'Travail sur cordes',
                'CQP cordiste',
                'IRATA',
                'Travail en hauteur',
                'Accès difficile',
                'Marketplace BTP',
            ],
            description:
                "Marketplace française spécialisée dans les travaux en accès difficile. Mise en relation entre cordistes certifiés CQP/IRATA et clients professionnels ou particuliers dans toute la France.",
            areaServed: { '@type': 'Country', name: 'France' },
            openingHoursSpecification: SEO_OPENING_HOURS,
            ...(SEO_SAME_AS.length > 0 && { sameAs: SEO_SAME_AS }),
        },
        {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Accueil', item: SEO_BASE_URL },
                { '@type': 'ListItem', position: 2, name: 'À propos', item: ABOUT_URL },
            ],
        },
        {
            '@type': 'FAQPage',
            '@id': `${ABOUT_URL}#faq`,
            mainEntityOfPage: ABOUT_URL,
            mainEntity: [
                {
                    '@type': 'Question',
                    name: 'Qui a fondé LesCordistes.com ?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: "LesCordistes.com a été fondée en 2025 par Anthony Profit, entrepreneur et développeur full-stack basé à Nice. La plateforme bénéficie de l'expertise métier de Benjamin De Oliveira, cordiste certifié CQP et IRATA, formateur professionnel, qui agit comme conseiller expert métier pour valider toutes les décisions liées au métier.",
                    },
                },
                {
                    '@type': 'Question',
                    name: 'Où est basée LesCordistes.com ?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: "Le siège social est situé à Nice (Alpes-Maritimes, 06000), région Provence-Alpes-Côte d'Azur. La plateforme couvre toute la France via son réseau de cordistes indépendants vérifiés.",
                    },
                },
                {
                    '@type': 'Question',
                    name: 'Comment LesCordistes.com vérifie les cordistes ?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: "Avant publication, chaque cordiste passe par une vérification humaine en interne sous 1 jour ouvré. Documents exigés : CQP Cordiste (obligatoire France, code du travail art. L6314-1), certification IRATA (norme internationale), attestation RC Pro en cours de validité, et extrait Kbis ou attestation auto-entrepreneur. Aucune mise en relation n'est faite tant que le dossier n'est pas validé.",
                    },
                },
                {
                    '@type': 'Question',
                    name: 'Combien de cordistes sont actuellement inscrits ?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: "À ce jour (mai 2026), 50 cordistes certifiés vérifiés sont actifs sur la plateforme, avec une couverture dans toutes les grandes villes de France : Paris, Marseille, Lyon, Toulouse, Lille, Bordeaux, Nantes, Nice, Strasbourg, Rennes, Grenoble, Montpellier, Brest et plus de 60 villes au total.",
                    },
                },
                {
                    '@type': 'Question',
                    name: 'Quel est le modèle économique ?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: "0 % de commission sur la transaction client-cordiste. Les clients déposent leur mission gratuitement et reçoivent des devis sous 48h. Les cordistes utilisent un système de crédits (1 crédit ≈ 8-10 € HT) uniquement pour accéder aux coordonnées d'une mission ciblée correspondant à leur profil et leur zone d'intervention.",
                    },
                },
            ],
        },
    ],
}

export default function AboutPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <main className="bg-white">
                {/* Hero */}
                <section className="bg-slate-50 border-b border-slate-100">
                    <div className="container max-w-5xl py-12 md:py-16">
                        <nav aria-label="Fil d'Ariane" className="text-sm text-slate-500 mb-6">
                            <Link href="/" className="hover:text-brand-blue-light transition-colors">
                                Accueil
                            </Link>
                            <span className="mx-2">/</span>
                            <span className="text-slate-700">À propos</span>
                        </nav>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-5 leading-tight">
                            Qui sommes-nous ?
                        </h1>
                        <p className="text-xl md:text-2xl text-brand-blue font-semibold mb-6 max-w-3xl leading-snug">
                            Connecter les meilleurs cordistes certifiés de France avec ceux qui ont besoin d'eux.
                        </p>
                        <p className="text-base md:text-lg text-slate-700 max-w-3xl leading-relaxed">
                            LesCordistes.com est une plateforme française qui met en relation des cordistes certifiés
                            CQP/IRATA avec des clients particuliers, copropriétés et professionnels du BTP partout en
                            France. La société est basée à <strong>Nice (Alpes-Maritimes)</strong> et a été fondée en{' '}
                            <strong>2025</strong> par <strong>Anthony Profit</strong>, accompagné de{' '}
                            <strong>Benjamin De Oliveira</strong>, cordiste certifié et formateur professionnel,
                            qui agit comme conseiller expert métier.
                        </p>
                    </div>
                </section>

                {/* Photo équipe */}
                <section className="py-12 md:py-16">
                    <div className="container max-w-md">
                        <div className="relative rounded-3xl overflow-hidden shadow-xl bg-slate-100">
                            <Image
                                src="/equipe-anthony-benjamin.jpg"
                                alt="Anthony Profit (fondateur) et Benjamin De Oliveira (conseiller expert métier cordiste CQP/IRATA), basés à Nice"
                                width={810}
                                height={791}
                                priority={false}
                                sizes="(max-width: 768px) 90vw, 448px"
                                quality={85}
                                className="w-full h-auto"
                            />
                        </div>
                        <p className="text-center text-sm text-slate-500 mt-4">
                            Benjamin De Oliveira (gauche) et Anthony Profit (droite) — Nice, 2026
                        </p>
                    </div>
                </section>

                {/* Histoire */}
                <section className="py-12 md:py-16 bg-slate-50">
                    <div className="container max-w-3xl">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">
                            L'histoire — comment LesCordistes est né
                        </h2>
                        <div className="space-y-5 text-slate-700 leading-relaxed text-base md:text-lg">
                            <p>
                                Tout commence par une amitié. <strong>Benjamin De Oliveira</strong> est cordiste depuis plus de
                                dix ans, formateur reconnu du métier, titulaire des certifications CQP et IRATA. Comme la
                                plupart des cordistes indépendants et des petites équipes, il connaît une réalité dure du
                                secteur : entre deux gros chantiers, il faut prospecter sans relâche. Les missions se trouvent
                                par le bouche-à-oreille, les recommandations entre confrères, ou en envoyant des dizaines de
                                devis sur des plateformes BTP généralistes où le travail sur cordes est noyé dans la masse.
                            </p>
                            <p>
                                Côté clients, le tableau est tout aussi compliqué. Une copropriété qui cherche un cordiste pour
                                son ravalement, une entreprise industrielle qui doit faire inspecter une cheminée, un
                                particulier qui a une fuite de toiture inaccessible : tous tombent souvent sur des entreprises
                                qui se présentent comme « cordistes » sans posséder le <strong>CQP Cordiste</strong> (rendu
                                obligatoire en France par le Code du travail, art. L6314-1 et R.4323-58) ni la certification
                                internationale <strong>IRATA</strong>. Le risque : intervention en sécurité dégradée, sinistre
                                non couvert par l'assurance, et reprise de chantier coûteuse.
                            </p>
                            <p>
                                En 2025, <strong>Anthony Profit</strong>, ami de Benjamin et entrepreneur dans la tech,
                                s'attaque au problème : construire la première marketplace française dédiée
                                exclusivement aux cordistes certifiés, qui vérifie systématiquement les diplômes et expose une
                                fiche transparente pour chaque professionnel. Le MVP est lancé fin 2025. En{' '}
                                <strong>mars 2026</strong>, Anthony reprend pleinement les rênes du projet, refond la
                                plateforme de fond en comble (Next.js 15, sécurité, performance), investit en SEO et en
                                publicité, et structure le réseau qui couvre désormais{' '}
                                <strong>toutes les grandes villes de France</strong>.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Équipe */}
                <section className="py-12 md:py-16">
                    <div className="container max-w-5xl">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-10 text-center">
                            L'équipe
                        </h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Anthony */}
                            <article className="rounded-2xl border border-slate-200 p-6 md:p-8 bg-white shadow-sm">
                                <h3 className="text-xl font-bold text-slate-900">Anthony Profit</h3>
                                <p className="text-sm text-brand-blue font-semibold mb-3">
                                    Fondateur &amp; développeur full-stack
                                </p>
                                <p className="text-slate-700 leading-relaxed mb-4">
                                    Entrepreneur basé à Nice, Anthony pilote la plateforme, le développement produit, le SEO
                                    et la croissance. Il porte la vision long terme d'un marché français du travail sur cordes
                                    plus transparent et mieux outillé.
                                </p>
                                <a
                                    href="https://www.linkedin.com/in/anthonyprofit/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm font-medium text-brand-blue hover:underline"
                                >
                                    <Linkedin size={16} /> Profil LinkedIn
                                </a>
                            </article>

                            {/* Benjamin */}
                            <article className="rounded-2xl border border-slate-200 p-6 md:p-8 bg-white shadow-sm">
                                <h3 className="text-xl font-bold text-slate-900">Benjamin De Oliveira</h3>
                                <p className="text-sm text-brand-blue font-semibold mb-3">
                                    Conseiller expert métier — cordiste CQP/IRATA, formateur
                                </p>
                                <p className="text-slate-700 leading-relaxed mb-4">
                                    Cordiste certifié CQP et IRATA, formateur professionnel. Benjamin apporte la vision
                                    terrain : conformité réglementaire, exigences techniques, attentes réelles des cordistes
                                    indépendants et de leurs clients. Toutes les décisions produit liées au métier sont
                                    validées avec lui.
                                </p>
                                <a
                                    href="https://www.linkedin.com/in/benjamin-de-oliveira-62b38695/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm font-medium text-brand-blue hover:underline"
                                >
                                    <Linkedin size={16} /> Profil LinkedIn
                                </a>
                            </article>
                        </div>
                    </div>
                </section>

                {/* Vérification */}
                <section className="py-12 md:py-16 bg-slate-50">
                    <div className="container max-w-3xl">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">
                            Comment nous vérifions chaque cordiste
                        </h2>
                        <p className="text-base md:text-lg text-slate-700 leading-relaxed mb-6">
                            Avant qu'un professionnel ne soit publié sur LesCordistes.com, son dossier passe par une{' '}
                            <strong>vérification humaine en interne, sous 1 jour ouvré</strong>. Les documents exigés :
                        </p>
                        <ul className="space-y-3 text-slate-700 leading-relaxed">
                            <li className="flex items-start gap-3">
                                <ShieldCheck className="text-brand-blue-light mt-1 flex-shrink-0" size={20} />
                                <span>
                                    <strong>CQP Cordiste</strong> — Certificat de Qualification Professionnelle, obligatoire
                                    en France selon le Code du travail (art. L6314-1)
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <ShieldCheck className="text-brand-blue-light mt-1 flex-shrink-0" size={20} />
                                <span>
                                    <strong>Certification IRATA</strong> — Norme internationale du travail sur cordes
                                    (obligatoire pour l'industrie lourde)
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <ShieldCheck className="text-brand-blue-light mt-1 flex-shrink-0" size={20} />
                                <span>
                                    <strong>Attestation RC Pro</strong> en cours de validité
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <ShieldCheck className="text-brand-blue-light mt-1 flex-shrink-0" size={20} />
                                <span>
                                    <strong>Extrait Kbis</strong> ou attestation d'auto-entrepreneur
                                </span>
                            </li>
                        </ul>
                        <p className="mt-6 text-base text-slate-700 leading-relaxed">
                            Aucune mise en relation avec un client n'est faite tant que le dossier n'est pas validé. Nous
                            accompagnons les cordistes à compléter leur dossier dès lors que les certifications sont
                            effectivement en cours d'obtention ou de renouvellement.
                        </p>
                        <p className="mt-6">
                            <Link
                                href="/verification-pros"
                                className="inline-flex items-center gap-2 text-brand-blue font-semibold hover:underline"
                            >
                                Voir le processus complet de vérification →
                            </Link>
                        </p>
                    </div>
                </section>

                {/* Faits & chiffres clés */}
                <section className="py-12 md:py-16">
                    <div className="container max-w-3xl">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">
                            Faits &amp; chiffres clés
                        </h2>
                        <p className="text-sm text-slate-500 mb-6">Données à jour mai 2026.</p>
                        <ul className="space-y-3 text-slate-700 leading-relaxed text-base">
                            <li>
                                <MapPin className="inline text-brand-blue-light mr-2" size={16} />
                                Société basée à <strong>Nice</strong> (06000), fondée en{' '}
                                <strong>2025</strong> par Anthony Profit (CEO) avec Benjamin De Oliveira comme conseiller
                                expert métier.
                            </li>
                            <li>
                                <MapPin className="inline text-brand-blue-light mr-2" size={16} />
                                <strong>50 cordistes certifiés vérifiés</strong> actifs sur la plateforme.
                            </li>
                            <li>
                                <MapPin className="inline text-brand-blue-light mr-2" size={16} />
                                <strong>Une vingtaine de missions</strong> publiées par les clients depuis le lancement.
                            </li>
                            <li>
                                <MapPin className="inline text-brand-blue-light mr-2" size={16} />
                                <strong>Couverture</strong> : toutes les grandes villes de France (Paris, Marseille, Lyon,
                                Toulouse, Lille, Bordeaux, Nantes, Nice, Strasbourg, Rennes, Grenoble, Montpellier, Brest, et
                                plus de 60 villes au total).
                            </li>
                            <li>
                                <MapPin className="inline text-brand-blue-light mr-2" size={16} />
                                <strong>Vérification systématique</strong> avant publication : CQP cordiste + IRATA + RC Pro +
                                Kbis, lecture humaine en interne, sous 1 jour ouvré.
                            </li>
                            <li>
                                <MapPin className="inline text-brand-blue-light mr-2" size={16} />
                                <strong>Modèle économique</strong> : 0 % de commission sur la transaction client-cordiste.
                                Pay-per-lead pour les cordistes (1 crédit ≈ 8-10 € HT pour accéder à une mission ciblée).
                            </li>
                            <li>
                                <MapPin className="inline text-brand-blue-light mr-2" size={16} />
                                <strong>Site édité par</strong> : Anthony Profit · <strong>Hébergeur</strong> : Vercel Inc. ·{' '}
                                <strong>CMS</strong> : Next.js 15.
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Différenciateurs */}
                <section className="py-12 md:py-16 bg-slate-50">
                    <div className="container max-w-5xl">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-10 text-center">
                            Pourquoi nous choisir — 3 différences concrètes
                        </h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="rounded-2xl bg-white p-6 md:p-8 border border-slate-200 shadow-sm">
                                <h3 className="text-xl font-bold text-slate-900 mb-4">
                                    Pour les clients (particuliers, copropriétés, entreprises)
                                </h3>
                                <ol className="space-y-4 text-slate-700 leading-relaxed list-decimal list-inside">
                                    <li>
                                        <strong>Vérification systématique des certifications avant publication</strong> —
                                        Aucun cordiste sur la plateforme sans CQP, IRATA et RC Pro vérifiés en interne (vs 0
                                        vérification sur Pages Jaunes ou Google Maps).
                                    </li>
                                    <li>
                                        <strong>0 % de commission sur la transaction</strong> — Vous traitez en direct avec le
                                        cordiste choisi. Le prix du devis est le prix réel (vs 10 à 30 % de marge ajoutée par
                                        les marketplaces généralistes BTP).
                                    </li>
                                    <li>
                                        <strong>Devis multiples sous 48 heures</strong> — Vous postez votre besoin une fois,
                                        vous recevez plusieurs devis qualifiés. Pas de démarchage automatique : seuls les
                                        cordistes intéressés débloquent vos coordonnées.
                                    </li>
                                </ol>
                            </div>
                            <div className="rounded-2xl bg-white p-6 md:p-8 border border-slate-200 shadow-sm">
                                <h3 className="text-xl font-bold text-slate-900 mb-4">
                                    Pour les cordistes professionnels
                                </h3>
                                <ol className="space-y-4 text-slate-700 leading-relaxed list-decimal list-inside">
                                    <li>
                                        <strong>Pay-per-lead transparent</strong> — Pas d'abonnement, pas de pourcentage
                                        prélevé. 1 crédit (≈ 8-10 € HT) = accès à une mission ciblée correspondant à votre
                                        profil et votre zone géographique.
                                    </li>
                                    <li>
                                        <strong>Filtres précis</strong> — Vous ne voyez que les missions dans votre rayon
                                        d'intervention (30 km par défaut, paramétrable) et sur vos types de prestation
                                        (façade, industrie, génie civil, éolien…).
                                    </li>
                                    <li>
                                        <strong>Profil professionnel avec certifications visibles</strong> — Vos clients
                                        voient immédiatement vos diplômes vérifiés, vos avis et votre périmètre.
                                        Différenciation immédiate vs un cordiste référencé sur Pages Jaunes sans contexte.
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact + CTA */}
                <section className="py-12 md:py-16">
                    <div className="container max-w-3xl text-center">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Nous contacter</h2>
                        <address className="not-italic text-slate-700 leading-relaxed mb-6">
                            LesCordistes.com — basé à Nice (Alpes-Maritimes)
                            <br />
                            <a href={`mailto:${SEO_EMAIL}`} className="text-brand-blue hover:underline">
                                {SEO_EMAIL}
                            </a>
                            <br />
                            <a
                                href="https://www.linkedin.com/company/lescordistes/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-brand-blue hover:underline inline-flex items-center gap-1 mt-2"
                            >
                                <Linkedin size={14} /> LinkedIn LesCordistes
                            </a>
                        </address>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link
                                href="/post-job"
                                className="inline-flex items-center justify-center px-6 py-3 bg-brand-blue text-white font-semibold rounded-xl hover:bg-brand-blue/90 transition-colors"
                            >
                                Publier une mission gratuitement
                            </Link>
                            <Link
                                href="/inscription-cordiste"
                                className="inline-flex items-center justify-center px-6 py-3 bg-white border border-slate-300 text-slate-900 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                S'inscrire comme cordiste
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}
