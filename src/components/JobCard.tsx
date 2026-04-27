'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, Euro, Ruler, Lock, ChevronRight, ShieldCheck, Compass } from 'lucide-react';
import type { Job } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useCredits } from '../hooks/useCredits';
import {
    getBudgetDisplay,
    getDepartmentLabel,
    getProximityForPro,
    getScheduleDisplay,
    getLeadQuality,
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

    const handleClick = () => {
        if (job.slug) router.push(`/jobs/${job.slug}`);
    };

    return (
        <div
            className="bg-white rounded-2xl border border-slate-100 hover:border-brand-blue/40 hover:shadow-md transition-all cursor-pointer group overflow-hidden flex flex-col h-full"
            onClick={handleClick}
        >
            <div className="p-5 flex flex-col flex-1">
                {/* Header row : titre + freshness badge top-right */}
                <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-brand-blue transition-colors line-clamp-2 flex-1 min-w-0">
                        {job.title}
                    </h3>
                    {freshness && (
                        <span className={`shrink-0 text-[11px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide ${freshness.className}`}>
                            {freshness.label}
                        </span>
                    )}
                </div>

                {/* Sub-title row : catégorie + Lead Quality + chips contextuels */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700">
                        <span aria-hidden="true">{cat.emoji}</span>
                        {cat.label}
                    </span>
                    <LeadQualityBadge quality={quality} />
                    {job.type === 'renfort_pro' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-blue text-white font-black uppercase tracking-widest">
                            🚀 Renfort PRO
                        </span>
                    )}
                    {job.creator?.role === 'pro' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue text-[10px] font-bold">
                            <ShieldCheck size={11} />
                            Confrère PRO
                        </span>
                    )}
                </div>

                {/* Meta info — ligne unique neutre, scannable */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 mb-3">
                    <span className="inline-flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400" />
                        <strong className="text-slate-800">{job.location_city}</strong>
                        {deptLabel && <span className="text-slate-400">· {deptLabel}</span>}
                    </span>
                    {proximity && (
                        <span className={`inline-flex items-center gap-1 ${
                            proximity.inZone ? 'text-emerald-700 font-bold' : 'text-slate-500'
                        }`}>
                            <Compass size={11} className={proximity.inZone ? 'text-emerald-600' : 'text-slate-400'} />
                            {proximity.label}
                        </span>
                    )}
                    {job.height_meters && (
                        <span className="inline-flex items-center gap-1">
                            <Ruler size={12} className="text-slate-400" />
                            {job.height_meters}m
                        </span>
                    )}
                    {budget && (
                        <span
                            className="inline-flex items-center gap-1"
                            title={budget.isIndicative ? "Fourchette indicative — le client n'a pas précisé son budget" : undefined}
                        >
                            <Euro size={12} className="text-slate-400" />
                            <strong className="text-slate-800">{budget.label}</strong>
                            {budget.isIndicative && <span className="text-[10px] text-slate-400 italic">indicatif</span>}
                        </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                        <Calendar size={12} className="text-slate-400" />
                        {schedule.isFlexible ? 'Démarrage à convenir' : schedule.label}
                        {job.type === 'renfort_pro' && job.duration_days && !schedule.isFlexible && ` · ${job.duration_days}j`}
                    </span>
                </div>

                {/* Description preview — flex-1 pour pousser le footer au bas de la card */}
                <p className="text-sm text-slate-600 line-clamp-4 mb-4 leading-relaxed flex-1">
                    {job.description}
                </p>

                {/* Footer — discret, aligné horizontalement entre cards.
                    Toujours même hauteur (h-9) pour que le bottom soit aligné en grille. */}
                <div className="flex items-center justify-between h-9 pt-3 border-t border-slate-50 text-xs">
                    {canViewContact ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                            ✓ Coordonnées disponibles
                        </span>
                    ) : isPro ? (
                        <span className="text-slate-500 flex items-center gap-1">
                            <Lock size={11} className="text-slate-400" />
                            {job.credit_cost || 1} crédit{(job.credit_cost || 1) > 1 ? 's' : ''} pour débloquer
                        </span>
                    ) : !user ? (
                        <span className="text-slate-400 flex items-center gap-1">
                            <Lock size={11} /> Connexion requise
                        </span>
                    ) : (
                        <span className="text-amber-600 flex items-center gap-1">
                            <Lock size={11} /> Crédits requis
                        </span>
                    )}
                    <span className="ml-auto text-brand-blue font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                        Voir la mission <ChevronRight size={14} />
                    </span>
                </div>
            </div>
        </div>
    );
};
