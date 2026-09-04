import React from 'react';
import Link from 'next/link';
import { Button } from '../ui/Button';
import { Reveal } from '../ui/Reveal';
import type { User } from '@supabase/supabase-js';
import { showableMissions, showablePros, type PublicStats } from '@/lib/publicStats';

interface CTAProps {
    user?: User | null;
    stats?: PublicStats | null;
}

// Pas de « couvrent N départements » : les 101 départements sont cochés par les
// zones déclarées des pros, la métrique est saturée et se lit comme une promesse
// de couverture nationale qu'aucun effectif ne soutient.
function reassurance(stats?: PublicStats | null): string {
    const pros = showablePros(stats);
    const missions = showableMissions(stats);

    if (pros !== null && missions !== null) {
        return `${pros} cordistes certifiés inscrits, ${missions} missions ouvertes en ce moment. Rejoignez-les.`;
    }
    if (pros !== null) {
        return `${pros} cordistes certifiés sont déjà inscrits sur LesCordistes. Rejoignez-les.`;
    }
    return "Des cordistes certifiés CQP et IRATA partout en France. Le dépôt de mission prend 3 minutes et reste gratuit.";
}

export const CTA: React.FC<CTAProps> = ({ user, stats }) => {
    return (
        <section className="relative py-24 overflow-hidden bg-slate-950">
            {/* Decorative Premium Glows */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-blue/20 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] translate-y-1/2 translate-x-1/2" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/50" />

            <div className="container relative z-10 text-center">
                <Reveal>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                    Prêt à commencer ?
                </h2>
                <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                    {reassurance(stats)}
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    {user ? (
                        <Link href="/dashboard" className="w-full sm:w-auto">
                            <Button variant="primary" className="w-full text-lg py-4 px-8 shadow-2xl hover:scale-105 transition-transform">
                                Aller au tableau de bord
                            </Button>
                        </Link>
                    ) : (
                        <>
                            <Link href="/post-job" className="w-full sm:w-auto">
                                <Button 
                                    variant="primary" 
                                    className="w-full text-lg py-4 px-8 shadow-2xl hover:scale-105 transition-transform bg-white text-brand-blue hover:bg-slate-100 ring-4 ring-white/10"
                                >
                                    Publier un projet gratuitement
                                </Button>
                            </Link>
                            <Link href="/inscription-cordiste" className="w-full sm:w-auto">
                                <Button variant="outline" className="w-full text-lg py-4 px-8 border-2 border-white text-white hover:bg-white hover:text-slate-900 transition-all shadow-2xl">
                                    S'inscrire comme Pro
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
                </Reveal>
            </div>
        </section>
    );
};
