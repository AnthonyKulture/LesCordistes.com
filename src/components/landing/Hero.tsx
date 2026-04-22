import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Award, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import type { User } from '@supabase/supabase-js';

interface HeroProps {
    user?: User | null;
}

export const Hero: React.FC<HeroProps> = ({ user }) => {
    return (
        <section className="relative min-h-[calc(100vh-6rem)] flex items-center py-8 lg:py-0 overflow-hidden bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-from),_transparent_80%)] from-blue-50/50 via-white to-white">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>
            <div className="container relative z-10 w-full">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
                    <div className="w-full lg:w-1/2 animate-slide-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-brand-blue-light font-semibold text-sm mb-4 sm:mb-6 border border-blue-100/50 shadow-sm">
                            <span className="flex h-2 w-2 rounded-full bg-brand-blue-light animate-pulse"></span>
                            Plateforme N°1 en France
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-[4rem] font-extrabold text-slate-900 mb-4 sm:mb-6 leading-[1.1] tracking-tight">
                            Trouvez des <span className="text-brand-blue-light">cordistes professionnels</span> pour vos travaux en hauteur
                        </h1>
                        <p className="text-lg sm:text-2xl text-slate-600 mb-6 sm:mb-10 leading-relaxed max-w-2xl font-medium">
                            La plateforme experte de mise en relation entre entreprises, particuliers et techniciens en travaux acrobatiques. Obtenez vos devis rapidement.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-5">
                            {user ? (
                                <Link href="/dashboard" className="w-full sm:w-auto">
                                    <Button variant="primary" className="w-full sm:w-auto text-lg px-8 py-4 shadow-xl shadow-brand-blue/20 hover:shadow-brand-blue/30 transition-all rounded-full flex items-center justify-center">
                                        Accéder à mon tableau de bord
                                        <ArrowRight size={20} className="ml-2" />
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href="/post-job" className="w-full sm:w-auto">
                                        <Button variant="primary" className="w-full sm:w-auto text-lg px-8 py-4 shadow-xl shadow-brand-blue/20 hover:shadow-brand-blue/30 transition-all rounded-full flex items-center justify-center">
                                            Publier un projet
                                            <ArrowRight size={20} className="ml-2" />
                                        </Button>
                                    </Link>
                                    <Link href="/jobs" className="w-full sm:w-auto">
                                        <Button variant="outline" className="w-full sm:w-auto text-lg px-8 py-4 bg-brand-blue/5 border-brand-blue/20 text-brand-blue-light hover:bg-brand-blue/10 rounded-full flex items-center justify-center transition-all duration-300">
                                            Trouver des missions
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mt-12 animate-fade-in delay-700">
                            <div className="flex items-center gap-2">
                                <Award className="text-brand-blue-light" size={18} strokeWidth={1.5} />
                                <span className="text-sm font-medium text-slate-500">CQP & IRATA Certifiés</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="text-brand-blue-light" size={18} strokeWidth={1.5} />
                                <span className="text-sm font-medium text-slate-500">Décennale vérifiée</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="text-brand-blue-light" size={18} strokeWidth={1.5} />
                                <span className="text-sm font-medium text-slate-500">Missions validées</span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-1/2 relative animate-fade-in">
                        <div className="absolute -top-10 -right-10 w-64 h-64 bg-brand-blue-light/10 rounded-full blur-[60px] -z-10"></div>
                        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-brand-blue/10 rounded-full blur-[60px] -z-10"></div>

                        <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200/50 group border border-slate-100 h-[500px] lg:h-[600px] bg-slate-100">
                            <div className="grid grid-cols-2 grid-rows-2 h-full w-full gap-2 p-2">
                                <div className="row-span-2 overflow-hidden rounded-[1.5rem]">
                                    <img
                                        src="/lescordistes.com-new-03.webp"
                                        alt="Cordiste professionnel en pleine intervention"
                                        fetchPriority="high"
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                    />
                                </div>
                                <div className="overflow-hidden rounded-[1.5rem]">
                                    <img
                                        src="/lescordistes.com-new-04.webp"
                                        alt="Intervention de cordiste pour nettoyage de façade"
                                        fetchPriority="high"
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                    />
                                </div>
                                <div className="overflow-hidden rounded-[1.5rem]">
                                    <img
                                        src="/lescordistes.com-new-10.webp"
                                        alt="Cordiste en travaux de confortement de falaise"
                                        fetchPriority="high"
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                    />
                                </div>
                            </div>

                            <div className="absolute inset-0 bg-brand-blue/5 pointer-events-none group-hover:bg-transparent transition-colors duration-700"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent z-10 pointer-events-none" />


                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
