import React from 'react';
import Image from 'next/image';
import { CheckCircle } from 'lucide-react';

export const SEOContent: React.FC = () => {
    return (
        <section className="py-24 bg-slate-50">
            <div className="container">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="order-2 md:order-1 relative">
                        <div className="absolute -inset-4 bg-brand-blue/10 rounded-3xl transform rotate-3 z-0"></div>
                        <Image
                            src="/lescordistes.com-new-00.webp"
                            alt="Cordiste professionnel réalisant un ravalement de façade"
                            width={600}
                            height={500}
                            loading="lazy"
                            sizes="(max-width: 768px) 100vw, 600px"
                            quality={70}
                            className="relative z-10 w-full h-[500px] object-cover rounded-2xl shadow-xl"
                        />
                    </div>
                    <div className="order-1 md:order-2">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 leading-tight">
                            Cordistes et travaux acrobatiques : <span className="text-brand-blue-light">Tout ce que vous devez savoir</span>
                        </h2>
                        <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                            Un cordiste est un technicien spécialisé dans les interventions en <strong>milieu périlleux</strong>. Grâce aux techniques d'alpinisme, ces professionnels atteignent les zones inaccessibles.
                        </p>
                        <ul className="space-y-4 mb-6">
                            {[
                                { title: 'Polyvalence', desc: 'Maçonnerie, nettoyage de façade, maintenance industrielle ou couverture.' },
                                { title: 'Sécurité absolue', desc: 'Formation rigoureuse et équipement normé (EPI).' },
                                { title: 'Économie', desc: 'Intervention rapide sans immobilisation de la voie publique.' }
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <CheckCircle className="text-brand-blue-light mt-1 flex-shrink-0" size={20} />
                                    <span className="text-slate-700 text-base md:text-lg"><strong>{item.title} :</strong> {item.desc}</span>
                                </li>
                            ))}
                        </ul>
                        <p className="text-xl font-medium text-slate-900 border-l-4 border-brand-blue pl-6 py-2 bg-white rounded-r-xl shadow-sm">
                            Choisir un cordiste, c'est opter pour l'efficacité technique là où les machines s'arrêtent.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};
