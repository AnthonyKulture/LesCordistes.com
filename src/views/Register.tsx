'use client'

import React from 'react';
import { useRouter } from 'next/navigation'
import Link from 'next/link';
import { Building2, HardHat } from 'lucide-react';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { useAuth } from '../contexts/AuthContext';
import { AuthLayout } from '../components/layout/AuthLayout';

export function Register() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useRouter();
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        if (!authLoading && user) {
            router.push('/dashboard');
        }
    }, [user, authLoading, navigate]);

    const handleGoogleError = (errorMessage: string) => {
        setError(errorMessage);
    };

    const jsonLd = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Inscription Client et Cordiste | LesCordistes.com",
        "description": "Rejoignez gratuitement la plateforme LesCordistes.com. Créez votre compte sécurisé pour trouver des missions en hauteur ou recruter des professionnels.",
        "url": "https://lescordistes.com/inscription",
        "potentialAction": {
            "@type": "RegisterAction",
            "target": "https://lescordistes.com/inscription"
        }
    });

    return (
        <AuthLayout
            seoTitle="Inscription Client et Cordiste | LesCordistes.com"
            seoDescription="Rejoignez gratuitement la plateforme LesCordistes.com. Créez votre compte sécurisé dans le domaine des travaux sur cordes."
            seoCanonical="https://lescordistes.com/inscription"
            jsonLd={jsonLd}
            authMode="register"
        >
            <div className="p-6 sm:p-8 pt-4">
                <div className="text-center mb-6">
                    <h1 className="sr-only">Rejoignez le réseau leader des travaux en hauteur</h1>
                    <p className="text-slate-500 text-sm sm:text-base font-medium">
                        Création d'un nouveau compte
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Accessibilité ARIA pour les erreurs */}
                    <div aria-live="polite" className="empty:hidden">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start" role="alert" id="register-error">
                                <span className="shrink-0 mr-2">⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    {/* Google Login prominent */}
                    <div className="pt-2">
                        <GoogleSignInButton mode="signup" onError={handleGoogleError} />
                    </div>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase font-medium">
                            <span className="px-3 bg-white text-slate-400">Ou s'inscrire avec Email</span>
                        </div>
                    </div>

                    {/* Choix du parcours */}
                    <div className="space-y-4">
                        <Link 
                            href="/inscription-cordiste" 
                            className="block group relative p-5 bg-white border-2 border-slate-100 hover:border-brand-orange hover:shadow-md rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
                                    <HardHat className="text-brand-orange" size={24} aria-hidden="true" />
                                </div>
                                <div className="text-left">
                                    <h2 className="text-base font-bold text-slate-900 group-hover:text-brand-orange transition-colors">
                                        Je suis Cordiste
                                    </h2>
                                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                                        Trouvez des chantiers, des missions ou du renfort.
                                    </p>
                                </div>
                            </div>
                        </Link>

                        <Link 
                            href="/inscription-client" 
                            className="block group relative p-5 bg-white border-2 border-slate-100 hover:border-brand-blue hover:shadow-md rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                                    <Building2 className="text-brand-blue" size={24} aria-hidden="true" />
                                </div>
                                <div className="text-left">
                                    <h2 className="text-base font-bold text-slate-900 group-hover:text-brand-blue transition-colors">
                                        Je recherche des cordistes
                                    </h2>
                                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                                        Publiez vos offres et trouvez des pros certifiés.
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </div>
                    
                </div>
            </div>
        </AuthLayout>
    );
}
