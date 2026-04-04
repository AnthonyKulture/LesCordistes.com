'use client'

import { useAuth } from '../contexts/AuthContext';
import { Hero } from '../components/landing/Hero';
import { TrustSignals } from '../components/landing/TrustSignals';
import { HowItWorks } from '../components/landing/HowItWorks';
import { ProfessionalsNetwork } from '../components/landing/ProfessionalsNetwork';
import { SEOContent } from '../components/landing/SEOContent';
import { FAQ } from '../components/landing/FAQ';
import { CTA } from '../components/landing/CTA';
import { Helmet } from 'react-helmet-async';

export default function Landing() {
    const { user } = useAuth();

    return (
        <div className="flex flex-col min-h-screen">
            <Helmet>
                <title>LesCordistes.com - Plateforme pour Professionnels du Travail sur Cordes</title>
                <meta name="description" content="Trouvez des chantiers ou recrutez des cordistes qualifiés. La marketplace n°1 pour les travaux d'accès difficile et les métiers de la corde." />
                <link rel="canonical" href="https://lescordistes.com/" />
                {/* Open Graph */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://lescordistes.com/" />
                <meta property="og:title" content="LesCordistes.com - Plateforme pour Professionnels du Travail sur Cordes" />
                <meta property="og:description" content="Trouvez des chantiers ou recrutez des cordistes qualifiés. La marketplace n°1 pour les travaux d'accès difficile et les métiers de la corde." />
                <meta property="og:image" content="https://lescordistes.com/lescordistes.com-3.webp" />
                <meta property="og:locale" content="fr_FR" />
                <meta property="og:site_name" content="LesCordistes.com" />
                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="LesCordistes.com - Plateforme pour Professionnels du Travail sur Cordes" />
                <meta name="twitter:description" content="Trouvez des chantiers ou recrutez des cordistes qualifiés. La marketplace n°1 pour les travaux d'accès difficile et les métiers de la corde." />
                <meta name="twitter:image" content="https://lescordistes.com/lescordistes.com-3.webp" />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@graph": [
                            {
                                "@type": "WebSite",
                                "name": "LesCordistes",
                                "url": "https://lescordistes.com/"
                            },
                            {
                                "@type": "Organization",
                                "name": "LesCordistes.com",
                                "url": "https://lescordistes.com/",
                                "logo": "https://lescordistes.com/lescordistes.com-white-logo.png",
                                "sameAs": []
                            },
                            {
                                "@type": "FAQPage",
                                "mainEntity": [
                                    {
                                        "@type": "Question",
                                        "name": "Est-ce gratuit de déposer une demande de travaux ?",
                                        "acceptedAnswer": { "@type": "Answer", "text": "Oui, totalement. Le dépôt de mission est gratuit pour tous les porteurs de projet (particuliers, copropriétés ou industriels). Vous ne payez que la prestation directement au professionnel." }
                                    },
                                    {
                                        "@type": "Question",
                                        "name": "Quels types de travaux puis-je confier via la plateforme ?",
                                        "acceptedAnswer": { "@type": "Answer", "text": "Tout le spectre des accès difficiles : nettoyage, maintenance, inspection, filets de sécurité, pylônes ou industrie." }
                                    },
                                    {
                                        "@type": "Question",
                                        "name": "Les professionnels sur la plateforme sont-ils qualifiés ?",
                                        "acceptedAnswer": { "@type": "Answer", "text": "La sécurité est notre priorité. Les pros doivent avoir un compte validé. Nous encourageons la mise en avant des certifications (CQP, IRATA) et assurances." }
                                    },
                                    {
                                        "@type": "Question",
                                        "name": "Pourquoi payer pour accéder à une mission ?",
                                        "acceptedAnswer": { "@type": "Answer", "text": "Modèle au lead via crédits. Vous ne dépensez que pour les missions qui vous correspondent réellement." }
                                    },
                                    {
                                        "@type": "Question",
                                        "name": "Comment sont calculés les prix des leads ?",
                                        "acceptedAnswer": { "@type": "Answer", "text": "Un lead standard coûte 1 crédit (env. 8-10€ HT). Projets à fort potentiel : 2 crédits." }
                                    }
                                ]
                            }
                        ]
                    })}
                </script>
            </Helmet>
            <Hero user={user} />
            <HowItWorks />
            <TrustSignals />
            <ProfessionalsNetwork />
            <SEOContent />
            <FAQ />
            <CTA user={user} />
        </div>
    );
}
