'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shield, Users } from 'lucide-react';
import { Button } from '../ui/Button';

export const HowItWorks: React.FC = () => {
    const [howItWorksTab, setHowItWorksTab] = useState<'client' | 'pro'>('client');

    return (
        <section id="how-it-works" className="py-24 bg-white">
            <div className="container">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">Comment ça marche ?</h2>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium mb-12">
                        Une solution simple et efficace pour tous vos besoins de travaux en hauteur.
                    </p>

                    <div className="flex justify-center mb-16 px-4">
                        <div className="relative p-[1.5px] rounded-full overflow-hidden shadow-2xl bg-slate-200/50 group">
                            <div className="absolute inset-[-500%] animate-[spin_8s_linear_infinite] origin-center">
                                <div 
                                    className="w-full h-full transition-all duration-1000"
                                    style={{
                                        background: `conic-gradient(from 0deg, transparent 0 70%, ${howItWorksTab === 'client' ? '#3b82f6' : '#f97316'} 90%, white 100%)`,
                                    }}
                                />
                            </div>
                            
                            <div className="relative z-10 flex p-1.5 bg-white/90 backdrop-blur-sm rounded-full w-full max-w-lg mx-auto overflow-hidden">
                                <button 
                                    onClick={() => setHowItWorksTab('client')}
                                    className={`flex-1 px-4 sm:px-8 py-3 rounded-full text-[11px] sm:text-sm font-black uppercase tracking-wider transition-all duration-300 ${
                                        howItWorksTab === 'client' 
                                        ? 'bg-brand-blue text-white shadow-lg' 
                                        : 'text-slate-500 hover:text-brand-blue'
                                    }`}
                                >
                                    Je cherche un cordiste
                                </button>
                                
                                <button 
                                    onClick={() => setHowItWorksTab('pro')}
                                    className={`flex-1 px-4 sm:px-8 py-3 rounded-full text-[11px] sm:text-sm font-black uppercase tracking-wider transition-all duration-300 ${
                                        howItWorksTab === 'pro' 
                                        ? 'bg-orange-500 text-white shadow-lg' 
                                        : 'text-slate-500 hover:text-orange-600'
                                    }`}
                                >
                                    Je suis cordiste
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="animate-fade-in">
                    {howItWorksTab === 'client' ? (
                        <div className="space-y-16">
                            <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
                                <div className="relative group rounded-3xl bg-blue-50/30 border border-blue-100/50 overflow-hidden hover:bg-blue-50/50 transition-all duration-500">
                                    <div className="h-44 overflow-hidden relative">
                                        <Image src="/maconnerie-lescordistes.com.webp" alt="Publication de chantier" fill loading="lazy" sizes="(max-width: 768px) 100vw, 33vw" quality={70} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        <div className="absolute top-4 left-4 w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand-blue shadow-sm font-black text-lg border border-blue-50">1</div>
                                    </div>
                                    <div className="p-8">
                                        <h3 className="text-xl font-black text-slate-900 mb-3">Publiez votre besoin</h3>
                                        <p className="text-slate-600 font-medium">
                                            Décrivez votre projet (façade, toiture, élagage). C'est <span className="text-brand-blue font-bold">gratuit et sans engagement</span>.
                                        </p>
                                    </div>
                                </div>

                                <div className="relative group rounded-3xl bg-blue-50/30 border border-blue-100/50 overflow-hidden hover:bg-blue-50/50 transition-all duration-500">
                                    <div className="h-44 overflow-hidden relative">
                                        <Image src="/lescordistes.com-visuel-travaux-en-hauteur8.webp" alt="Candidatures d'experts" fill loading="lazy" sizes="(max-width: 768px) 100vw, 33vw" quality={70} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        <div className="absolute top-4 left-4 w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand-blue shadow-sm font-black text-lg border border-blue-50">2</div>
                                    </div>
                                    <div className="p-8">
                                        <h3 className="text-xl font-black text-slate-900 mb-3">Recevez des candidatures</h3>
                                        <p className="text-slate-600 font-medium">
                                            Les experts de votre région vérifient la mission et candidatent en quelques heures.
                                        </p>
                                    </div>
                                </div>

                                <div className="relative group rounded-3xl bg-blue-50/30 border border-blue-100/50 overflow-hidden hover:bg-blue-50/50 transition-all duration-500">
                                    <div className="h-44 overflow-hidden relative">
                                        <Image src="/lescordistes.com-new-07.webp" alt="Sélection de l'expert" fill loading="lazy" sizes="(max-width: 768px) 100vw, 33vw" quality={70} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        <div className="absolute top-4 left-4 w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand-blue shadow-sm font-black text-lg border border-blue-50">3</div>
                                    </div>
                                    <div className="p-8">
                                        <h3 className="text-xl font-black text-slate-900 mb-3">Sélectionnez votre expert</h3>
                                        <p className="text-slate-600 font-medium">
                                            Comparez les profils et les qualifications, puis travaillez en toute confiance sans intermédiaire.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-6 pt-10 border-t border-slate-100/50">
                                <Link href="/post-job" className="w-full sm:w-auto">
                                    <Button variant="primary" className="w-full sm:w-auto text-lg px-12 py-4 shadow-xl shadow-brand-blue/20 hover:shadow-brand-blue/30 transition-all rounded-full flex items-center justify-center">
                                        Publier un projet
                                        <ArrowRight size={20} className="ml-2" />
                                    </Button>
                                </Link>
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-500 font-bold text-[10px] uppercase tracking-widest border border-slate-200">
                                    <Shield size={14} className="text-green-500" />
                                    100% GRATUIT
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-20">
                            <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
                                <div className="relative group rounded-3xl bg-orange-50/30 border border-orange-100/50 overflow-hidden hover:bg-orange-50/50 transition-all duration-500">
                                    <div className="h-44 overflow-hidden relative">
                                        <Image src="/cordiste_1.webp" alt="Validation profil" fill loading="lazy" sizes="(max-width: 768px) 100vw, 33vw" quality={70} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        <div className="absolute top-4 left-4 w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-600 shadow-sm font-black text-lg border border-orange-50">1</div>
                                    </div>
                                    <div className="p-8">
                                        <h3 className="text-xl font-black text-slate-900 mb-3">Profil vérifié</h3>
                                        <p className="text-slate-600 font-medium">
                                            Créez votre profil pro et validez vos compétences auprès de notre équipe.
                                        </p>
                                    </div>
                                </div>

                                <div className="relative group rounded-3xl bg-orange-50/30 border border-orange-100/50 overflow-hidden hover:bg-orange-50/50 transition-all duration-500">
                                    <div className="h-44 overflow-hidden relative">
                                        <Image src="/lescordistes.com-visuel-travaux-en-hauteur1.webp" alt="Parcourir missions" fill loading="lazy" sizes="(max-width: 768px) 100vw, 33vw" quality={70} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        <div className="absolute top-4 left-4 w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-600 shadow-sm font-black text-lg border border-orange-50">2</div>
                                    </div>
                                    <div className="p-8">
                                        <h3 className="text-xl font-black text-slate-900 mb-3">Accédez aux missions</h3>
                                        <p className="text-slate-600 font-medium">
                                            Accédez librement à toutes les offres de chantiers dans votre département.
                                        </p>
                                    </div>
                                </div>

                                <div className="relative group rounded-3xl bg-orange-50/30 border border-orange-100/50 overflow-hidden hover:bg-orange-50/50 transition-all duration-500">
                                    <div className="h-44 overflow-hidden relative">
                                        <Image src="/lescordistes.com-visuel-travaux-en-hauteur2.webp" alt="Débloquer le contact" fill loading="lazy" sizes="(max-width: 768px) 100vw, 33vw" quality={70} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        <div className="absolute top-4 left-4 w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-600 shadow-sm font-black text-lg border border-orange-50">3</div>
                                    </div>
                                    <div className="p-8">
                                        <h3 className="text-xl font-black text-slate-900 mb-3">Débloquez le contact</h3>
                                        <p className="text-slate-600 font-medium">
                                            Utilisez vos crédits pour accéder aux coordonnées directes du client.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="relative pt-20 border-t border-dashed border-slate-200">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-6 py-2.5 rounded-full border border-slate-200 text-orange-600 font-black text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] shadow-sm text-center leading-tight whitespace-nowrap xs:whitespace-normal">
                                    Service Renfort entre Pros
                                </div>
                                
                                <div className="max-w-4xl mx-auto">
                                    <div className="flex flex-col md:flex-row items-center gap-8 p-10 rounded-[3rem] bg-gradient-to-br from-orange-50/50 to-white border border-orange-100/50 shadow-sm hover:shadow-xl hover:shadow-orange-900/5 transition-all duration-700">
                                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-orange-600 shadow-md border border-orange-100 shrink-0">
                                            <Users size={36} />
                                        </div>
                                        <div className="flex-grow text-center md:text-left">
                                            <h4 className="text-2xl font-black text-slate-900 mb-3">Besoin de renfort sur un chantier ?</h4>
                                            <p className="text-slate-600 font-medium leading-relaxed mb-6">
                                                Un imprévu, un chantier complexe ou un pic d'activité ? Trouvez un collaborateur qualifié en quelques clics.
                                            </p>
                                            <Link href="/post-job?type=renfort_pro">
                                                <Button variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50 rounded-full px-8 py-3 font-bold transition-all">
                                                    Publier une demande de renfort
                                                    <ArrowRight size={18} className="ml-2" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};
