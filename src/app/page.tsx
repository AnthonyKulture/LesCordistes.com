import type { Metadata } from 'next'
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
            name: 'LesCordistes',
            url: 'https://lescordistes.com/',
        },
        {
            '@type': 'Organization',
            name: 'LesCordistes.com',
            url: 'https://lescordistes.com/',
            logo: 'https://lescordistes.com/lescordistes.com-white-logo.png',
        },
        {
            '@type': 'FAQPage',
            mainEntity: [
                { '@type': 'Question', name: "Est-ce gratuit de déposer une demande de travaux ?", acceptedAnswer: { '@type': 'Answer', text: "Oui, totalement. Le dépôt de mission est gratuit pour tous les porteurs de projet. Vous ne payez que la prestation directement au professionnel." } },
                { '@type': 'Question', name: "Quels types de travaux puis-je confier via la plateforme ?", acceptedAnswer: { '@type': 'Answer', text: "Tout le spectre des accès difficiles : nettoyage, maintenance, inspection, filets de sécurité, pylônes ou industrie." } },
                { '@type': 'Question', name: "Les professionnels sont-ils qualifiés ?", acceptedAnswer: { '@type': 'Answer', text: "Les pros doivent avoir un compte validé avec certifications (CQP, IRATA) et assurances." } },
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
