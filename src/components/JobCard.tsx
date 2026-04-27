'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, Euro, Ruler, Lock, ChevronRight, ShieldCheck, HelpCircle, Compass } from 'lucide-react';
import type { Job } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useCredits } from '../hooks/useCredits';
import {
    getBudgetDisplay,
    getDepartmentLabel,
    getProximityForPro,
    getScheduleDisplay,
    getLeadQuality,
    isClientVerified,
    getFreshnessBadge,
} from '../lib/missionEnrichment';
import { LeadQualityBadge } from './job-detail/LeadQualityBadge';

interface JobCardProps {
    job: Job;
}

const categoryConfig: Record<string, { label: string; emoji: string; color: string; accent: string }> = {
    cleaning: { label: 'Nettoyage', emoji: '🧹', color: 'bg-sky-100 text-sky-700', accent: 'bg-sky-400' },
    construction: { label: 'Construction', emoji: '🏗️', color: 'bg-orange-100 text-orange-700', accent: 'bg-orange-400' },
    masonry: { label: 'Maçonnerie', emoji: '🧱', color: 'bg-amber-100 text-amber-700', accent: 'bg-amber-400' },
    painting: { label: 'Peinture', emoji: '🎨', color: 'bg-pink-100 text-pink-700', accent: 'bg-pink-400' },
    industry: { label: 'Industrie', emoji: '⚙️', color: 'bg-slate-100 text-slate-700', accent: 'bg-slate-400' },
    event: { label: 'Événementiel', emoji: '🎪', color: 'bg-purple-100 text-purple-700', accent: 'bg-purple-400' },
    securing: { label: 'Sécurisation', emoji: '🛡️', color: 'bg-red-100 text-red-700', accent: 'bg-red-400' },
    telecom: { label: 'Télécoms', emoji: '📡', color: 'bg-cyan-100 text-cyan-700', accent: 'bg-cyan-400' },
    inspection: { label: 'Inspection', emoji: '🔍', color: 'bg-indigo-100 text-indigo-700', accent: 'bg-indigo-400' },
    repair: { label: 'Dépannage', emoji: '🔧', color: 'bg-yellow-100 text-yellow-700', accent: 'bg-yellow-400' },
    pruning: { label: 'Élagage', emoji: '🌳', color: 'bg-emerald-100 text-emerald-700', accent: 'bg-emerald-400' },
    other: { label: 'Autre', emoji: '📌', color: 'bg-slate-100 text-slate-600', accent: 'bg-slate-400' },
};

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
    const { user, profile } = useAuth();
    const { isJobUnlocked } = useCredits();
    const router = useRouter();

    const cat = categoryConfig[job.category] || categoryConfig.other;
    const isPro = profile?.role === 'pro';
    const isOwner = user && job.created_by === user.id;
    const unlocked = isJobUnlocked(job.id);
    const canViewContact = user && (isOwner || unlocked);
    const freshness = getFreshnessBadge(job);

    const budget = getBudgetDisplay(job);
    const deptLabel = getDepartmentLabel(job.location_department);
    const proximity = isPro ? getProximityForPro(job, profile?.intervention_zones) : null;
    const schedule = getScheduleDisplay(job);
    const quality = getLeadQuality(job);
    const clientVerified = isClientVerified(job);

    const handleClick = () => {
        if (job.slug) router.push(`/jobs/${job.slug}`);
    };

    return (
        <div
            className="bg-white rounded-2xl border border-slate-100 hover:border-brand-blue/40 hover:shadow-md transition-all cursor-pointer group overflow-hidden"
            onClick={handleClick}
        >
            {/* Top accent bar by category */}
            <div className={`h-1 w-full ${cat.accent}`} />

            <div className="p-5">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-brand-blue transition-colors line-clamp-2">
                            {job.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            {job.creator?.role === 'pro' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-brand-blue/10 text-brand-blue text-[10px] font-bold border border-brand-blue/20">
                                    <ShieldCheck size={12} />
                                    CONFRÈRE PRO
                                </span>
                            )}
                            {clientVerified && (
                                <span
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200"
                                    title="Client structuré (entreprise, syndic, agence) — pré-qualifié par notre équipe"
                                >
                                    <ShieldCheck size={12} />
                                    Client vérifié
                                </span>
                            )}
                            <LeadQualityBadge quality={quality} />
                        </div>
                    </div>
                    <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${cat.color}`}>
                        {cat.emoji} {cat.label}
                    </span>
                </div>

                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500 mb-3">
                    <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-brand-blue" />
                        <strong className="text-slate-700">{job.location_city}</strong>
                        {deptLabel && <span className="text-slate-400">· {deptLabel}</span>}
                    </span>
                    {proximity && (
                        <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md font-bold ${
                            proximity.inZone
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : 'bg-slate-50 text-slate-600 border border-slate-100'
                        }`}>
                            <Compass size={11} />
                            {proximity.label}
                        </span>
                    )}
                    {job.height_meters && (
                        <span className="flex items-center gap-1">
                            <Ruler size={12} />
                            {job.height_meters}m
                        </span>
                    )}
                    {freshness && (
                        <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold ${freshness.className}`}>
                            {freshness.label}
                        </span>
                    )}
                </div>

                {/* Description preview — élargi avant déblocage */}
                <p className="text-sm text-slate-600 line-clamp-4 mb-3 leading-relaxed">
                    {job.description}
                </p>

                {/* Badge row */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {job.type === 'renfort_pro' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-blue text-white font-black uppercase tracking-widest flex items-center gap-1 shadow-sm">
                            🚀 Renfort PRO
                        </span>
                    )}

                    {budget && (
                        <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5 border ${
                                budget.dailyRate
                                    ? 'bg-blue-50 text-blue-700 font-bold border-blue-100'
                                    : budget.isIndicative
                                        ? 'bg-slate-50 text-slate-600 border-slate-200 italic'
                                        : 'bg-green-50 text-green-700 border-green-100'
                            }`}
                            title={budget.isIndicative ? 'Fourchette indicative — le client n\'a pas précisé son budget' : undefined}
                        >
                            <Euro size={10} />
                            {budget.label}
                            {budget.isIndicative && <span className="ml-1 text-[9px] uppercase tracking-wider opacity-70">indicatif</span>}
                        </span>
                    )}

                    <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border ${
                            schedule.isFlexible
                                ? 'bg-slate-50 text-slate-600 border-slate-200'
                                : 'bg-orange-50 text-orange-700 border-orange-100'
                        }`}
                    >
                        <Calendar size={10} />
                        {schedule.isFlexible ? 'Démarrage à convenir' : schedule.label}
                        {job.type === 'renfort_pro' && job.duration_days && !schedule.isFlexible && ` · ${job.duration_days}j`}
                    </span>

                    {job.photos_url && job.photos_url.length > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            📷 {job.photos_url.length}
                        </span>
                    )}
                </div>

                {/* Crédit-back guarantee — only shown to pros pre-unlock */}
                {isPro && !canViewContact && (
                    <div className="flex items-start gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-1.5 mb-3">
                        <ShieldCheck size={12} className="shrink-0 mt-0.5" />
                        <span>
                            <strong>Garantie 72h :</strong> client injoignable ou données frauduleuses → crédit recrédité.
                        </span>
                    </div>
                )}

                {/* Footer CTA */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                    {canViewContact ? (
                        <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                            ✓ Coordonnées disponibles
                        </span>
                    ) : isPro && !canViewContact ? (
                        <div className="relative flex items-center group/tooltip">
                            <span className="text-xs text-amber-600 font-medium flex items-center gap-1 cursor-help">
                                <Lock size={11} />
                                Coût : {job.credit_cost || 1} crédit{(job.credit_cost || 1) > 1 ? 's' : ''}
                                <HelpCircle size={12} className="text-amber-500/70 ml-0.5" />
                            </span>
                            <div className="absolute bottom-full left-0 mb-2 w-64 p-2.5 bg-slate-800 text-white text-[11px] rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-10 pointer-events-none leading-relaxed">
                                Le nombre de crédits est calculé selon l'estimation de la durée et de la technicité du chantier.
                                <svg className="absolute text-slate-800 h-2 w-full left-4 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                            </div>
                        </div>
                    ) : !user ? (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Lock size={11} /> Connexion requise
                        </span>
                    ) : (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Lock size={11} /> Crédits requis
                        </span>
                    )}
                    <span className="text-sm font-medium text-brand-blue flex items-center gap-1 group-hover:gap-2 transition-all">
                        Voir la mission <ChevronRight size={14} />
                    </span>
                </div>
            </div>
        </div>
    );
};
