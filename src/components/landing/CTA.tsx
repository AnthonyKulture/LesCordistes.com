import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import type { User } from '@supabase/supabase-js';

interface CTAProps {
    user: User | null;
}

export const CTA: React.FC<CTAProps> = ({ user }) => {
    return (
        <section className="relative py-24 overflow-hidden bg-slate-950">
            {/* Decorative Premium Glows */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-blue/20 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] translate-y-1/2 translate-x-1/2" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/50" />

            <div className="container relative z-10 text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                    Prêt à commencer ?
                </h2>
                <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                    Rejoignez des milliers de professionnels et clients qui font confiance à LesCordistes
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    {user ? (
                        <Link to="/dashboard" className="w-full sm:w-auto">
                            <Button variant="primary" className="w-full text-lg py-4 px-8 shadow-2xl hover:scale-105 transition-transform">
                                Aller au tableau de bord
                            </Button>
                        </Link>
                    ) : (
                        <>
                            <Link to="/post-job" className="w-full sm:w-auto">
                                <Button 
                                    variant="primary" 
                                    className="w-full text-lg py-4 px-8 shadow-2xl hover:scale-105 transition-transform bg-white text-brand-blue hover:bg-slate-100 ring-4 ring-white/10"
                                >
                                    Publier un projet gratuitement
                                </Button>
                            </Link>
                            <Link to="/register" className="w-full sm:w-auto">
                                <Button variant="outline" className="w-full text-lg py-4 px-8 border-2 border-white text-white hover:bg-white hover:text-slate-900 transition-all shadow-2xl">
                                    S'inscrire comme Pro
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};
