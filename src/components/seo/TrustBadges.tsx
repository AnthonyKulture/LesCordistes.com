import React from 'react';
import { ShieldCheck, Award, FileText } from 'lucide-react';

export const TrustBadges: React.FC = () => {
    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mt-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4 text-center">Engagement & Sécurité Garantis</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-blue-100 text-brand-blue rounded-full flex items-center justify-center mb-3">
                        <Award size={24} />
                    </div>
                    <div className="font-semibold text-slate-900">Certifications CQP / IRATA</div>
                    <p className="text-sm text-slate-600 mt-1">Cordistes diplômés d'État ou répondant aux standards internationaux.</p>
                </div>
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                        <ShieldCheck size={24} />
                    </div>
                    <div className="font-semibold text-slate-900">Assurances Valides</div>
                    <p className="text-sm text-slate-600 mt-1">RC Pro et Garantie Décennale vérifiées par nos équipes de validation.</p>
                </div>
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-3">
                        <FileText size={24} />
                    </div>
                    <div className="font-semibold text-slate-900">Validation Manuelle</div>
                    <p className="text-sm text-slate-600 mt-1">Chaque profil professionnel est rigoureusement approuvé avant diffusion.</p>
                </div>
            </div>
        </div>
    );
};
