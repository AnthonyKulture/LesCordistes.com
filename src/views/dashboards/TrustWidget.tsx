'use client'

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/DashboardLayout';
import { ShieldCheck, Copy, Check, ExternalLink } from 'lucide-react';

export const TrustWidget: React.FC = () => {
    const { profile } = useAuth();
    const [copied, setCopied] = useState(false);

    const profileId = profile?.id || 'id_profil_ici';
    
    // SEO OFF-SITE: target=_blank, rel=noopener (NO nofollow!)
    const widgetHtml = `<a href="https://www.lescordistes.com/pros/${profileId}?utm_source=pro-badge&utm_medium=website" target="_blank" rel="noopener">\n  <img src="https://www.lescordistes.com/badges/verified.svg" alt="Artisan Cordiste Vérifié par LesCordistes.com" width="250" height="60" style="border-radius: 8px; border: none; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);" />\n</a>`;

    const handleCopy = () => {
        navigator.clipboard.writeText(widgetHtml);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">Badge de Confiance Officiel</h1>
                    <p className="text-slate-500 mt-2 text-lg">Boostez votre référencement et la confiance de vos clients directement depuis votre site web.</p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 p-8 md:p-10 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-10 items-center">
                        <div className="flex-1 space-y-5">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                <ShieldCheck className="text-brand-blue" size={28} />
                                Le Sceau "Artisan Vérifié"
                            </h2>
                            <p className="text-slate-600 leading-loose text-lg">
                                Intégrez gratuitement ce badge officiel sur la page d'accueil de votre site internet professionnel. 
                                Il rassure instantanément vos visiteurs en prouvant que vos qualifications (CQP / IRATA) ont été validées par le réseau de référence en France.
                            </p>
                            <div className="flex items-start gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                <div className="text-xl">💡</div>
                                <p className="text-sm font-medium text-slate-800 leading-relaxed">
                                    <strong>Double bénéfice SEO :</strong> Ce badge cliquable renvoie vos clients potentiels vers votre profil public sur notre plateforme pour consulter vos avis, et améliore notoirement votre référencement local Google (Backlink).
                                </p>
                            </div>
                        </div>
                        <div className="shrink-0 bg-slate-50 p-8 rounded-2xl border border-slate-100 flex flex-col items-center shadow-inner">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-200 pb-2">Aperçu Visuel</span>
                            <img src="/badges/verified.svg" alt="Aperçu Badge" className="shadow-xl rounded-xl hover:-translate-y-1 transition-transform cursor-pointer" />
                        </div>
                    </div>

                    <div className="mt-12 pt-10 border-t border-slate-100">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                            <label className="font-bold text-slate-900">Code HTML complet à copier-coller :</label>
                            <button 
                                onClick={handleCopy}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
                                    copied 
                                    ? 'bg-green-500 text-white shadow-green-500/20' 
                                    : 'bg-brand-blue text-white hover:bg-brand-blue-light shadow-brand-blue/20 hover:-translate-y-0.5'
                                }`}
                            >
                                {copied ? <><Check size={18} /> Code Copié !</> : <><Copy size={18} /> Copier le code HTML</>}
                            </button>
                        </div>
                        <div className="relative group">
                            <pre className="bg-[#0f172a] text-[#818cf8] p-6 rounded-2xl text-sm overflow-x-auto border border-slate-800 shadow-xl leading-relaxed">
                                <code>{widgetHtml}</code>
                            </pre>
                            <div className="absolute top-4 right-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded">HTML5 validé</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-8 flex gap-6 mt-8 shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mt-1">
                        <ExternalLink className="text-slate-400" size={20} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Comment intégrer le badge ?</h3>
                        <p className="text-slate-600 mb-4 line-height-relaxed">Sélectionnez et copiez le code ci-dessus, puis collez-le dans l'éditeur textuel de votre propre site internet. Il est recommandé de le placer dans le <strong>"Footer" (pied de page)</strong> pour garantir son affichage et ancrer l'autorité sur l'ensemble de vos pages.</p>
                        <ul className="text-sm font-medium text-slate-600 list-disc list-inside space-y-2 ml-2">
                            <li><span className="text-slate-900">WordPress :</span> Glissez un bloc "HTML Personnalisé" dans vos Widgets (Apparence &gt; Widgets).</li>
                            <li><span className="text-slate-900">Wix :</span> Cliquez sur "Ajouter des éléments &gt; Code Intégré &gt; Widget HTML", puis collez le code.</li>
                            <li><span className="text-slate-900">Shopify / Squarespace :</span> Utilisez un composant ou un bloc "Code/HTML" standard.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};
