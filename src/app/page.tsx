import type { Metadata } from 'next'
import { SEO_PHONE, SEO_EMAIL, SEO_BRAND_NAME, SEO_BASE_URL, SEO_LOGO, SEO_OPENING_HOURS, SEO_SAME_AS, SEO_POSTAL_ADDRESS } from '@/constants/seoConfig'
import { Hero } from '@/components/landing/Hero'
import { TrustSignals } from '@/components/landing/TrustSignals'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { ProfessionalsNetwork } from '@/components/landing/ProfessionalsNetwork'
import { SEOContent } from '@/components/landing/SEOContent'
import { CityLinks } from '@/components/landing/CityLinks'
import { FAQ } from '@/components/landing/FAQ'
import { CTA } from '@/components/landing/CTA'

export const metadata: Metadata = {
    title: { absolute: 'Cordistes & travaux en hauteur · LesCordistes' },
    description: "Trouvez des chantiers ou recrutez des cordistes qualifiés. La marketplace n°1 pour les travaux d'accès difficile et les métiers de la corde.",
    alternates: { canonical: `${SEO_BASE_URL}/` },
    openGraph: {
        title: 'Cordistes & travaux en hauteur · LesCordistes',
        description: "Trouvez des chantiers ou recrutez des cordistes qualifiés. La marketplace n°1 pour les travaux d'accès difficile et les métiers de la corde.",
        url: `${SEO_BASE_URL}/`,
        images: [{ url: `${SEO_BASE_URL}/lescordistes.com-3.webp`, width: 1200, height: 630 }],
    },
}

const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'WebSite',
            '@id': `${SEO_BASE_URL}/#website`,
            name: SEO_BRAND_NAME,
            url: `${SEO_BASE_URL}/`,
            potentialAction: {
                '@type': 'SearchAction',
                target: {
                    '@type': 'EntryPoint',
                    urlTemplate: `${SEO_BASE_URL}/jobs?q={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
            },
        },
        {
            '@type': ['Organization', 'ProfessionalService'],
            '@id': `${SEO_BASE_URL}/#organization`,
            name: SEO_BRAND_NAME,
            url: `${SEO_BASE_URL}/`,
            logo: {
                '@type': 'ImageObject',
                url: SEO_LOGO,
                width: 1200,
                height: 630,
            },
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
            description: "Marketplace française spécialisée dans les travaux en accès difficile. Mise en relation entre cordistes certifiés CQP/IRATA et clients professionnels ou particuliers dans toute la France.",
            areaServed: { '@type': 'Country', name: 'France' },
            openingHoursSpecification: SEO_OPENING_HOURS,
            serviceType: [
                'Nettoyage de façades', 'Lavage de vitres', 'Ravalement de façade', 'Peinture de façade',
                'Toiture et zinguerie', 'Isolation thermique extérieure', 'Maçonnerie en hauteur',
                'Maintenance éolienne', 'Pylônes télécom', 'Contrôles non destructifs',
                'Entretien silos et cheminées', 'Inspection ponts et viaducs', 'Confortement de falaises',
                'Dépigeonnage', 'Peinture industrielle et anticorrosion',
            ],
            ...(SEO_SAME_AS.length > 0 && { sameAs: SEO_SAME_AS }),
        },
        {
            '@type': 'FAQPage',
            mainEntityOfPage: `${SEO_BASE_URL}/`,
            mainEntity: [
                {
                    '@type': 'Question',
                    name: "Est-ce gratuit de déposer une demande de travaux ?",
                    acceptedAnswer: { '@type': 'Answer', text: "Oui, totalement gratuit. Le dépôt de mission ne coûte rien au porteur de projet, particulier ou professionnel. Vous décrivez vos besoins en 3 minutes, recevez des devis sous 48h, puis contractez directement avec le cordiste choisi. Aucune commission n'est prélevée sur la transaction finale." },
                },
                {
                    '@type': 'Question',
                    name: "Quels types de travaux puis-je confier via la plateforme ?",
                    acceptedAnswer: { '@type': 'Answer', text: "Tout le spectre des accès difficiles : nettoyage de façades, lavage de vitres en hauteur, ravalement, peinture industrielle et anticorrosion, toiture et zinguerie, isolation thermique extérieure (ITE), maintenance éolienne, pylônes télécom, contrôles non destructifs (CND), inspection de ponts et viaducs, confortement de falaises et dépigeonnage. Si l'accès nécessite une corde, nos pros le font." },
                },
                {
                    '@type': 'Question',
                    name: "Les professionnels sont-ils qualifiés et assurés ?",
                    acceptedAnswer: { '@type': 'Answer', text: "Oui. Chaque professionnel doit soumettre ses certifications CQP Cordiste (obligatoire en France) ou IRATA (norme internationale) ainsi que son attestation RC Pro avant validation de son compte. Notre équipe vérifie l'authenticité de ces documents. Aucun cordiste non certifié n'est mis en relation avec un client." },
                },
                {
                    '@type': 'Question',
                    name: "Pourquoi les pros paient-ils pour accéder aux missions ?",
                    acceptedAnswer: { '@type': 'Answer', text: "La plateforme fonctionne au lead par crédits, sans commission sur le chantier. Un cordiste débourse 1 crédit (~8–10 € HT) uniquement pour les missions qui correspondent à son profil et sa zone. Ce modèle filtre les leads non pertinents et garantit au client de recevoir des devis de professionnels réellement intéressés — pas de démarchage automatique." },
                },
            ],
        },
    ],
}

export default function HomePage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="flex flex-col min-h-screen">
                <Hero />
                <HowItWorks />
                <TrustSignals />
                <ProfessionalsNetwork />
                <SEOContent />
                <CityLinks />
                <FAQ />
                <CTA />
            </div>
        </>
    )
}
