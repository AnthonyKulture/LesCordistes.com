import React from 'react';
import Link from 'next/link';

interface AuthLayoutProps {
    children: React.ReactNode;
    seoTitle: string;
    seoDescription: string;
    seoCanonical: string;
    jsonLd?: string;
    authMode?: 'login' | 'register';
}

export function AuthLayout({
    children,
    seoTitle,
    seoDescription,
    seoCanonical,
    jsonLd,
    authMode,
}: AuthLayoutProps) {
    return (
        <div className="flex flex-col items-center pt-8 sm:pt-16 pb-12 relative overflow-hidden bg-slate-50 flex-grow min-h-[calc(100vh-80px)]">
            

            {/* Éléments de design dynamique (Subtle modern aesthetics) */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500 opacity-[0.05] blur-[100px] pointer-events-none" aria-hidden="true" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-500 opacity-[0.05] blur-[100px] pointer-events-none" aria-hidden="true" />

            {/* Container du formulaire (Glassmorphism & Shadows) */}
            <main className="w-full max-w-md px-4 sm:px-6 z-10" id="main-content">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 overflow-hidden relative">
                    
                    {/* Tabs pour basculer facilement entre Connexion et Inscription */}
                    {authMode && (
                        <nav className="px-6 sm:px-8 pt-8 pb-2" aria-label="Authentification navigation">
                            <div className="flex p-1 space-x-1 bg-slate-100/80 rounded-xl border border-slate-200/50">
                                <Link 
                                    href="/connexion"
                                    className={`w-full text-center py-2 text-sm font-semibold rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue ${authMode === 'login' ? 'bg-white text-brand-blue shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    aria-current={authMode === 'login' ? 'page' : undefined}
                                >
                                    Connexion
                                </Link>
                                <Link 
                                    href="/inscription"
                                    className={`w-full text-center py-2 text-sm font-semibold rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue ${authMode === 'register' ? 'bg-white text-brand-blue shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    aria-current={authMode === 'register' ? 'page' : undefined}
                                >
                                    Inscription
                                </Link>
                            </div>
                        </nav>
                    )}

                    {children}
                </div>
            </main>
        </div>
    );
}
