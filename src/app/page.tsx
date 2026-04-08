import type { Metadata } from 'next'
import { SEO_PHONE, SEO_EMAIL, SEO_BRAND_NAME, SEO_BASE_URL, SEO_LOGO, SEO_OPENING_HOURS, SEO_SAME_AS } from '@/constants/seoConfig'
import { Hero } from '@/components/landing/Hero'
import { TrustSignals } from '@/components/landing/TrustSignals'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { ProfessionalsNetwork } from '@/components/landing/ProfessionalsNetwork'
import { SEOContent } from '@/components/landing/SEOContent'
import { FAQ } from '@/components/landing/FAQ'
import { CTA } from '@/components/landing/CTA'

export const metadata: Metadata = {
    title: 'LesCordistes.com - Plateforme pour Professionnels du Travail sur Cordes',
    description: "Trouvez des chantiers ou recrutez des cordistes qualifiés. La marketplace n°1 pour les travaux d'accès difficile et les métiers de la corde.",
    alternates: { canonical: 'https://lescordistes.com/' },
    openGraph: {
        title: 'LesCordistes.com - Plateforme pour Professionnels du Travail sur Cordes',
        description: "Trouvez des chantiers ou recrutez des cordistes qualifiés. La marketplace n°1 pour les travaux d'accès difficile et les métiers de la corde.",
        url: 'https://lescordistes.com/',
        images: [{ url: '/lescordistes.com-3.webp', width: 1200, height: 630 }],
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
                target: { '@type': 'EntryPoint', urlTemplate: `${SEO_BASE_URL}/post-job` },
                'query-input': 'required name=search_term_string',
            },
        },
        {
            '@type': ['Organization', 'ProfessionalService'],
            '@id': `${SEO_BASE_URL}/#organization`,
            name: SEO_BRAND_NAME,
            url: `${SEO_BASE_URL}/`,
            logo: SEO_LOGO,
            telephone: SEO_PHONE,
            email: SEO_EMAIL,
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
            mainEntity: [
                { '@type': 'Question', name: "Est-ce gratuit de déposer une demande de travaux ?", acceptedAnswer: { '@type': 'Answer', text: "Oui, totalement. Le dépôt de mission est gratuit pour tous les porteurs de projet. Vous ne payez que la prestation directement au professionnel." } },
                { '@type': 'Question', name: "Quels types de travaux puis-je confier via la plateforme ?", acceptedAnswer: { '@type': 'Answer', text: "Tout le spectre des accès difficiles : nettoyage de façades, lavage de vitres, toiture, zinguerie, ravalement, peinture industrielle, maintenance éolienne, pylônes télécom, CND, inspection d'ouvrages d'art, confortement de falaises et plus encore." } },
                { '@type': 'Question', name: "Les professionnels sont-ils qualifiés ?", acceptedAnswer: { '@type': 'Answer', text: "Les pros doivent avoir un compte validé avec certifications CQP ou IRATA et assurances RC Pro vérifiées avant toute mise en relation." } },
                { '@type': 'Question', name: "Pourquoi payer pour accéder à une mission ?", acceptedAnswer: { '@type': 'Answer', text: "Modèle au lead via crédits. Vous ne dépensez que pour les missions qui vous correspondent réellement." } },
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
                <FAQ />
                <CTA />
            </div>
        </>
    )
}
