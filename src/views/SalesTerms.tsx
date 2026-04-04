'use client'

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { CreditCard, Zap, ShieldCheck, HelpCircle, FileCheck, Euro, Scale } from 'lucide-react';

export const SalesTerms: React.FC = () => {
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Conditions Générales de Vente (CGV) - LesCordistes.com",
        "description": "Consultez les CGV de LesCordistes.com pour l'achat de packs de crédits, le barème de consommation et les garanties de modération des leads.",
        "publisher": {
            "@type": "Organization",
            "name": "LesCordistes.com"
        }
    };

    const packs = [
        { name: 'Starter', price: '60 €', credits: 3, perCredit: '20 €', usage: 'Test / Indépendant' },
        { name: 'Pro', price: '150 €', credits: 10, perCredit: '15 €', usage: 'Utilisateur régulier', popular: true },
        { name: 'Business', price: '280 €', credits: 20, perCredit: '14 €', usage: 'Agence / Volume' }
    ];

    const consumptionRules = [
        {
            title: "1 Crédit (Petit Chantier)",
            desc: "Travaux ponctuels chez des particuliers, nettoyage de vitres, interventions légères.",
            icon: <Zap size={18} className="text-blue-500" />
        },
        {
            title: "3 Crédits (Standard / B2B)",
            desc: "Chantiers de copropriété, maintenance de façade, pose de filets.",
            icon: <Zap size={18} className="text-blue-500" />
        },
        {
            title: "5 à 8 Crédits (Premium / Industrie / Monaco)",
            desc: "Missions à haute technicité, environnements industriels, éolien, ou zones à fort potentiel (ex: Monaco).",
            icon: <Zap size={18} className="text-brand-blue" />
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 py-16 px-4">
            <Helmet>
                <title>Conditions Générales de Vente (CGV) - LesCordistes.com</title>
                <meta name="description" content="Consultez les CGV de LesCordistes.com pour l'achat de packs de crédits, le barème de consommation et les garanties de modération des leads." />
                <script type="application/ld+json">
                    {JSON.stringify(schemaData)}
                </script>
            </Helmet>

            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl font-black text-slate-900 mb-4 uppercase tracking-tight">
                        Conditions Générales <span className="text-brand-blue">de Vente</span>
                    </h1>
                    <p className="text-lg text-slate-600">
                        Espace Professionnels - Mise à jour du 24 mars 2026.
                    </p>
                    <div className="w-24 h-1 bg-brand-blue mx-auto mt-6 rounded-full" />
                </motion.div>

                <div className="space-y-12">
                    {/* Article 1 */}
                    <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-blue-50 rounded-2xl text-brand-blue">
                                <FileCheck size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Article 1 : Objet et Champ d'Application</h2>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                            Les présentes CGV régissent la vente de "Packs de Crédits" sur la plateforme <strong>LesCordistes.com</strong>. 
                            Elles s'adressent exclusivement aux professionnels (Auto-entrepreneurs, Entreprises de Travaux sur Cordes, Agences) 
                            inscrits et validés par l'administration.
                        </p>
                    </section>

                    {/* Article 2 & 3: Pricing and Consumption */}
                    <section className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Euro size={120} />
                        </div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-white/10 rounded-2xl">
                                    <CreditCard size={24} />
                                </div>
                                <h2 className="text-2xl font-bold">Tarification et Barème Professionnel</h2>
                            </div>

                            <div className="overflow-x-auto mb-10">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="py-4 font-bold text-slate-400 uppercase text-xs tracking-wider">Pack</th>
                                            <th className="py-4 font-bold text-slate-400 uppercase text-xs tracking-wider">Prix HT</th>
                                            <th className="py-4 font-bold text-slate-400 uppercase text-xs tracking-wider">Crédits</th>
                                            <th className="py-4 font-bold text-slate-400 uppercase text-xs tracking-wider">Usage</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {packs.map((pack) => (
                                            <tr key={pack.name} className={pack.popular ? "text-blue-400 bg-white/5" : ""}>
                                                <td className="py-4 font-black">
                                                    <div className="flex items-center gap-2">
                                                        {pack.name}
                                                        {pack.popular && (
                                                            <span className="text-[10px] bg-blue-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                                Populaire
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 font-bold text-lg">{pack.price}</td>
                                                <td className="py-4">
                                                    <span className="bg-white/10 px-3 py-1 rounded-full font-bold text-white">
                                                        {pack.credits} crédits
                                                    </span>
                                                </td>
                                                <td className="py-4 text-sm text-slate-400">{pack.usage}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Zap size={20} className="text-brand-blue" />
                                    Barème de Consommation Variable
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {consumptionRules.map((rule, idx) => (
                                        <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-colors">
                                            <div className="mb-2">{rule.icon}</div>
                                            <h4 className="font-bold text-sm mb-1">{rule.title}</h4>
                                            <p className="text-xs text-slate-400 leading-relaxed">{rule.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Article 4, 5, 6 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="text-green-500" />
                                <h2 className="text-xl font-bold">Article 4 : Qualité des Leads</h2>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                <strong>Modération stricte</strong> : Aucune mission n'est publiée sans validation interne. 
                                <br /><br />
                                <strong>Garantie Lead Invalide</strong> : Remboursement manuel en crédits si les coordonnées sont erronées ou frauduleuses.
                            </p>
                        </section>

                        <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
                            <div className="flex items-center gap-3">
                                <CreditCard className="text-brand-blue" />
                                <h2 className="text-xl font-bold">Article 5 : Paiement et Exécution</h2>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Paiement sécurisé par carte bancaire. Crédits affectés immédiatement après confirmation. 
                                <br /><br />
                                <strong>Note sur la rétractation</strong> : En raison de l'exécution immédiate du service numérique, le droit de rétractation ne s'applique pas (Art. L221-28).
                            </p>
                        </section>

                        <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4 md:col-span-2">
                            <div className="flex items-center gap-3">
                                <Scale className="text-amber-500" />
                                <h2 className="text-xl font-bold text-slate-900">Article 6 : Responsabilité du Professionnel</h2>
                            </div>
                            <p className="text-slate-600 leading-relaxed">
                                Le Professionnel est seul responsable du traitement commercial du lead et de la réalisation des travaux. 
                                Il doit impérativement détenir les <strong>assurances (RC Pro, Décennale)</strong> et <strong>certifications (CQP, IRATA)</strong> à jour.
                            </p>
                        </section>
                    </div>

                    {/* Final Note */}
                    <section className="bg-blue-50 rounded-3xl p-8 border border-blue-100 flex gap-6 items-start">
                        <div className="p-3 bg-brand-blue rounded-2xl text-white shrink-0">
                            <HelpCircle size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-blue-900 mb-2">Une question sur nos services ?</h2>
                            <p className="text-blue-800/80 leading-relaxed text-sm">
                                Notre équipe de modération est là pour garantir que chaque lead à haute valeur (B2B, Monaco, Industrie) 
                                soit un dossier complet avec photos et détails techniques pour optimiser votre taux de transformation.
                            </p>
                        </div>
                    </section>

                    <div className="text-center text-slate-400 text-sm">
                        <p>Les présentes CGV sont soumises au droit français. Tout litige sera soumis aux tribunaux compétents du siège social de l'éditeur.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesTerms;
