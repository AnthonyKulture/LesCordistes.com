import React from 'react';
import { Award, CheckCircle, Tag, ShieldCheck, Hammer, Briefcase, Clock, FileCheck } from 'lucide-react';
import type { Job } from '../../types';

interface TechnicalSpecsProps {
    job: Job;
    levelLabels: Record<string, string>;
    habilitationLabels: Record<string, string>;
    tradeLabels: Record<string, string>;
}

export const TechnicalSpecs: React.FC<TechnicalSpecsProps> = ({ job, levelLabels, habilitationLabels, tradeLabels }) => {
    const hasSpecs = job.type === 'renfort_pro' || 
                     (job.required_level && job.required_level.length > 0) || 
                     (job.required_habilitations && job.required_habilitations.length > 0);

    if (!hasSpecs) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 p-5 text-white">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <Award size={20} />
                    Spécifications Techniques
                </h2>
            </div>
            <div className="p-6 space-y-8">
                {/* Row 1: Qualifications & Ref */}
                <div className="grid sm:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <CheckCircle size={14} /> Niveaux Cordiste
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {job.required_level && job.required_level.length > 0 ? (
                                job.required_level.map(lvl => (
                                    <span key={lvl} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold">
                                        {levelLabels[lvl] || lvl}
                                    </span>
                                ))
                            ) : (
                                <span className="text-slate-400 italic text-sm">Non spécifié</span>
                            )}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Tag size={14} /> Référence Interne
                        </h3>
                        <p className="text-sm font-bold text-slate-700 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg inline-block">
                            {job.internal_reference || 'Non renseignée'}
                        </p>
                    </div>
                </div>

                {/* Row 2: Habilitations & Trades */}
                <div className="grid sm:grid-cols-2 gap-8 pt-6 border-t border-slate-50">
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheck size={14} /> Habilitations
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {job.required_habilitations?.map(habil => (
                                <span key={habil} className="px-3 py-1 bg-brand-blue/5 text-brand-blue border border-brand-blue/10 rounded-lg text-sm font-medium">
                                    {habilitationLabels[habil] || habil}
                                </span>
                            )) || <span className="text-slate-400 italic text-sm">Aucune spécifique</span>}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Hammer size={14} /> Métiers Secondaires
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {job.secondary_trades?.map(trade => (
                                <span key={trade} className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-sm font-medium border border-slate-100">
                                    {tradeLabels[trade] || trade}
                                </span>
                            )) || <span className="text-slate-400 italic text-sm">Non défini</span>}
                        </div>
                    </div>
                </div>

                {/* Row 3: Equipment & Schedule */}
                <div className="grid sm:grid-cols-2 gap-8 pt-6 border-t border-slate-50">
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Briefcase size={14} /> Gestion du Matériel
                        </h3>
                        <div className="text-sm font-medium text-slate-700 leading-relaxed space-y-1">
                            {job.equipment_management === 'pro_brings_all' && <p>✅ Le pro apporte son kit complet (EPI + cordes)</p>}
                            {job.equipment_management === 'agency_provides_all' && <p>🏢 L'agence fournit tout le matériel</p>}
                            {job.equipment_management === 'agency_provides_ropes_pro_brings_personal' && <p>⚖️ Mixte : Cordes agence / EPI perso pro</p>}
                        </div>
                        {job.specific_equipment && (
                            <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-600 italic">
                                Matériel spécifique : {job.specific_equipment}
                            </div>
                        )}
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Clock size={14} /> Horaires & Disponibilité
                        </h3>
                        <div className={`p-3 rounded-xl text-sm font-medium ${job.work_night_weekend ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                            {job.work_night_weekend 
                                ? '🌙 Travail de nuit ou week-end requis' 
                                : '☀️ Horaires de jour standards (Lundi-Vendredi)'}
                        </div>
                    </div>
                </div>

                {/* Row 4: Security */}
                <div className="pt-6 border-t border-slate-50">
                    <div className={`p-4 rounded-2xl flex items-center gap-3 ${job.security_plan_confirmed ? 'bg-green-50 border border-green-100 text-green-800' : 'bg-amber-50 border border-amber-100 text-amber-800'}`}>
                        <FileCheck size={20} className={job.security_plan_confirmed ? 'text-green-600' : 'text-amber-600'} />
                        <div className="text-sm">
                            <p className="font-bold">Check-up Sécurité</p>
                            <p className="opacity-80">
                                {job.security_plan_confirmed 
                                    ? 'Plan de Prévention / PPSPS disponible ou en cours.' 
                                    : 'Plan de Prévention non renseigné.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
