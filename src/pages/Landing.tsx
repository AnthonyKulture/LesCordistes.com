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
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebSite",
                        "name": "LesCordistes",
                        "url": "https://lescordistes.com/"
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
