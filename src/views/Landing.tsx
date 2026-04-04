'use client'

import { useAuth } from '../contexts/AuthContext';
import { Hero } from '../components/landing/Hero';
import { TrustSignals } from '../components/landing/TrustSignals';
import { HowItWorks } from '../components/landing/HowItWorks';
import { ProfessionalsNetwork } from '../components/landing/ProfessionalsNetwork';
import { SEOContent } from '../components/landing/SEOContent';
import { FAQ } from '../components/landing/FAQ';
import { CTA } from '../components/landing/CTA';

export default function Landing() {
    const { user } = useAuth();

    return (
        <div className="flex flex-col min-h-screen">
            
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
