import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';

export const ProfessionalsNetwork: React.FC = () => {
    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="container">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="order-2 md:order-1 relative">
                        <div className="absolute -inset-4 bg-blue-50/50 rounded-3xl transform -rotate-3 z-0"></div>
                        <img
                            src="/lescordistes.com-new-01.webp"
                            alt="Cordiste professionnel en pleine intervention"
                            loading="lazy"
                            decoding="async"
                            width={600}
                            height={600}
                            className="relative z-10 w-full h-[600px] object-cover rounded-2xl shadow-2xl"
                        />
                        <div className="absolute -bottom-8 -right-8 z-20 bg-white rounded-xl p-6 shadow-xl border border-slate-100 hidden sm:block animate-bounce-slow">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="text-brand-blue-light" size={24} />
                                </div>
                                <div>
                                    <div className="text-sm text-slate-500 font-medium">Statut Pro</div>
                                    <div className="text-xl font-bold text-slate-900">Profil Vérifié</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="order-1 md:order-2">
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                            Rejoignez le réseau d'experts en <span className="text-gradient">travaux acrobatiques</span>
                        </h2>
                        <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                            Accédez à des dizaines d'offres de chantiers qualifiés chaque mois. Développez votre entreprise de travaux sur corde en toute indépendance.
                        </p>

                        <div className="space-y-6 mb-10">
                            {[
                                { title: 'Missions vérifiées', desc: 'Toutes les missions sont validées par notre équipe avant publication' },
                                { title: 'Contact direct', desc: 'Accédez aux coordonnées complètes des clients sans intermédiaire' },
                                { title: 'Sans abonnement', desc: 'Débloquez les chantiers qui vous intéressent avec vos crédits, sans engagement' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                                    <div className="mt-1 bg-blue-50 p-2 rounded-lg">
                                        <CheckCircle className="text-brand-blue-light" size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900 mb-1">{item.title}</h4>
                                        <p className="text-slate-600 text-sm">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Link href="/inscription-cordiste">
                            <Button variant="primary" className="text-lg w-full sm:w-auto shadow-lg hover:shadow-slate-500/30">
                                S'inscrire comme Pro
                                <ArrowRight size={20} className="ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};
