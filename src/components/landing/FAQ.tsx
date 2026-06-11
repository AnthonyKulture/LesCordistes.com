import React from 'react';
import { Shield, TrendingUp, ChevronDown } from 'lucide-react';
import { Reveal } from '../ui/Reveal';

const faqData = {
    clients: [
        {
            q: "Est-ce gratuit de déposer une demande de travaux ?",
            a: "Oui, totalement. Le dépôt de mission est gratuit pour tous les porteurs de projet (particuliers, copropriétés ou industriels). Vous ne payez que la prestation directement au professionnel."
        },
        {
            q: "Comment garantissez-vous que ma demande recevra des réponses ?",
            a: "Chaque mission est relue et validée par notre équipe interne avant publication. Nous vous contactons pour l'affiner si besoin."
        },
        {
            q: "Quels types de travaux puis-je confier via la plateforme ?",
            a: "Tout le spectre des accès difficiles : nettoyage, maintenance, inspection, filets de sécurité, pylônes ou industrie."
        },
        {
            q: "Les professionnels sur la plateforme sont-ils qualifiés ?",
            a: "La sécurité est notre priorité. Les pros doivent avoir un compte validé. Nous encourageons la mise en avant des certifications (CQP, IRATA) et assurances."
        }
    ],
    pros: [
        {
            q: "Pourquoi payer pour accéder à une mission ?",
            a: "Modèle au contact via crédits. Vous ne dépensez que pour les missions qui vous correspondent réellement, sans abonnement ni commission sur le chantier."
        },
        {
            q: "Suis-je engagé par un abonnement mensuel ?",
            a: "Non, modèle flexible basé sur des packs de crédits sans engagement et sans expiration."
        },
        {
            q: "Combien coûte un contact débloqué ?",
            a: "Entre 14 et 20 € HT par contact selon le pack : Starter 3 crédits/60 € (20 €/contact), Pro 10 crédits/150 € (15 €/contact, le plus populaire), Business 20 crédits/280 € (14 €/contact). Coût en crédits par chantier : 1 (standard), 3 (potentiel important) ou 5 (gros chantier)."
        },
        {
            q: "Comment puis-je me démarquer des autres cordistes ?",
            a: "Soignez votre profil ! Spécialités, zones d'intervention et justificatifs d'assurance à jour."
        }
    ]
};

export const FAQ: React.FC = () => {
    return (
        <section className="py-24 bg-slate-50 border-t border-slate-100">
            <div className="container max-w-6xl">
                <Reveal className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 uppercase tracking-tight">Questions fréquentes</h2>
                    <p className="text-xl text-slate-600 font-medium">Tout savoir sur LesCordistes.com</p>
                </Reveal>

                <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
                    <Reveal>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-brand-blue shadow-sm">
                                <Shield size={28} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Espace Clients</h3>
                        </div>
                        <div className="space-y-4">
                            {faqData.clients.map((faq, idx) => (
                                <details key={idx} className="group bg-white p-6 rounded-2xl border border-slate-100 cursor-pointer hover:shadow-md transition-all open:ring-2 open:ring-brand-blue/10">
                                    <summary className="flex justify-between items-center font-bold text-lg text-slate-900 list-none [&::-webkit-details-marker]:hidden">
                                        {faq.q}
                                        <ChevronDown className="text-brand-blue transition-transform group-open:rotate-180" size={24} />
                                    </summary>
                                    <p className="text-slate-600 mt-4 leading-relaxed font-medium text-sm">
                                        {faq.a}
                                    </p>
                                </details>
                            ))}
                        </div>
                    </Reveal>

                    <Reveal delay={100}>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shadow-sm">
                                <TrendingUp size={28} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Espace Pros</h3>
                        </div>
                        <div className="space-y-4">
                            {faqData.pros.map((faq, idx) => (
                                <details key={idx} className="group bg-white p-6 rounded-2xl border border-slate-100 cursor-pointer hover:shadow-md transition-all open:ring-2 open:ring-orange-500/10">
                                    <summary className="flex justify-between items-center font-bold text-lg text-slate-900 list-none [&::-webkit-details-marker]:hidden">
                                        {faq.q}
                                        <ChevronDown className="text-orange-500 transition-transform group-open:rotate-180" size={24} />
                                    </summary>
                                    <p className="text-slate-600 mt-4 leading-relaxed font-medium text-sm">
                                        {faq.a}
                                    </p>
                                </details>
                            ))}
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
};
