import React from 'react';
import { Star, ShieldCheck, Zap, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface Props {
    cityName: string;
    serviceName?: string;
}

export const SEOLocalReviews: React.FC<Props> = ({ cityName, serviceName }) => {
    const service = serviceName ? serviceName.toLowerCase() : 'travaux sur cordes'

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm my-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-2 border-b border-slate-100 pb-4">
                Pourquoi choisir LesCordistes.com à {cityName} ?
            </h2>
            <p className="text-slate-500 text-sm mb-8">Plateforme de mise en relation vérifiée entre professionnels certifiés et clients à {cityName}.</p>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col gap-3">
                    <div className="w-10 h-10 bg-blue-100 text-brand-blue rounded-full flex items-center justify-center shrink-0">
                        <ShieldCheck size={20} />
                    </div>
                    <div className="font-semibold text-slate-900">Pros vérifiés avant publication</div>
                    <p className="text-slate-600 text-sm">Chaque cordiste intervenant à {cityName} est contrôlé : certifications CQP/IRATA, RC Pro, SIRET. Aucun profil non validé n&apos;accède aux missions.</p>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col gap-3">
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                        <Zap size={20} />
                    </div>
                    <div className="font-semibold text-slate-900">Devis sous 48h sur {cityName}</div>
                    <p className="text-slate-600 text-sm">Publiez votre besoin en {service} en 3 minutes. Nos professionnels locaux vous répondent sous 48h avec un devis détaillé, sans engagement.</p>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col gap-3">
                    <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                        <MessageSquare size={20} />
                    </div>
                    <div className="font-semibold text-slate-900">Votre avis compte</div>
                    <p className="text-slate-600 text-sm">Après votre chantier à {cityName}, laissez un avis sur votre cordiste. Vos retours renforcent la qualité de la plateforme pour toute la région.</p>
                </div>
            </div>

            <div className="mt-8 text-center">
                <Link
                    href="/post-job"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-brand-blue hover:bg-brand-blue-light px-5 py-2.5 rounded-xl transition-colors"
                >
                    <Star size={15} fill="currentColor" strokeWidth={0} className="text-amber-300" />
                    Publier mon projet à {cityName} — gratuit
                </Link>
            </div>
        </div>
    );
};
