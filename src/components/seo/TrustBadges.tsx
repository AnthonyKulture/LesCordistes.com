import React from 'react';
import { ShieldCheck, Award, FileText, ExternalLink, HardHat, BadgeCheck } from 'lucide-react';

export const TrustBadges: React.FC = () => {
    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mt-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6 text-center">Engagement & Sécurité Garantis</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-blue-100 text-brand-blue rounded-full flex items-center justify-center mb-3">
                        <Award size={24} />
                    </div>
                    <div className="font-semibold text-slate-900">Certifications CQP / IRATA</div>
                    <p className="text-sm text-slate-600 mt-1">Cordistes diplômés d'État ou certifiés selon les standards internationaux de l'accès sur cordes.</p>
                    <a
                        href="https://irata.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 text-xs text-brand-blue hover:underline flex items-center gap-1"
                    >
                        <ExternalLink size={11} />
                        Vérifier irata.org
                    </a>
                </div>

                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                        <ShieldCheck size={24} />
                    </div>
                    <div className="font-semibold text-slate-900">Assurances RC Pro vérifiées</div>
                    <p className="text-sm text-slate-600 mt-1">Responsabilité Civile Professionnelle et Garantie Décennale contrôlées avant chaque mise en relation.</p>
                </div>

                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-3">
                        <FileText size={24} />
                    </div>
                    <div className="font-semibold text-slate-900">Validation manuelle des profils</div>
                    <p className="text-sm text-slate-600 mt-1">Chaque professionnel est rigoureusement approuvé par notre équipe avant diffusion sur la plateforme.</p>
                </div>

                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-3">
                        <HardHat size={24} />
                    </div>
                    <div className="font-semibold text-slate-900">Conformité INRS R408</div>
                    <p className="text-sm text-slate-600 mt-1">Procédures de travail en hauteur conformes à la recommandation INRS R408 et à la norme NF EN 363.</p>
                    <a
                        href="https://www.inrs.fr"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 text-xs text-brand-blue hover:underline flex items-center gap-1"
                    >
                        <ExternalLink size={11} />
                        inrs.fr
                    </a>
                </div>

                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3">
                        <BadgeCheck size={24} />
                    </div>
                    <div className="font-semibold text-slate-900">SIRET & KBIS vérifiés</div>
                    <p className="text-sm text-slate-600 mt-1">Chaque entreprise partenaire est enregistrée, à jour de ses obligations légales et fiscales françaises.</p>
                </div>

                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center mb-3">
                        <ShieldCheck size={24} />
                    </div>
                    <div className="font-semibold text-slate-900">Devis gratuit sous 48h</div>
                    <p className="text-sm text-slate-600 mt-1">Réponse garantie de nos professionnels locaux certifiés dans les 48 heures suivant votre demande.</p>
                </div>

            </div>
        </div>
    );
};
