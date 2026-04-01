import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Euro, Clock, Ruler, Lock, ChevronRight, ShieldCheck, HelpCircle } from 'lucide-react';
import type { Job } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useCredits } from '../hooks/useCredits';

interface JobCardProps {
    job: Job;
}

const categoryConfig: Record<string, { label: string; emoji: string; color: string }> = {
    cleaning: { label: 'Nettoyage', emoji: '🧹', color: 'bg-sky-100 text-sky-700' },
    construction: { label: 'Construction', emoji: '🏗️', color: 'bg-orange-100 text-orange-700' },
    masonry: { label: 'Maçonnerie', emoji: '🧱', color: 'bg-amber-100 text-amber-700' },
    painting: { label: 'Peinture', emoji: '🎨', color: 'bg-pink-100 text-pink-700' },
    industry: { label: 'Industrie', emoji: '⚙️', color: 'bg-slate-100 text-slate-700' },
    event: { label: 'Événementiel', emoji: '🎪', color: 'bg-purple-100 text-purple-700' },
    other: { label: 'Autre', emoji: '📌', color: 'bg-slate-100 text-slate-600' },
};

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
    const { user, profile } = useAuth();
    const { isJobUnlocked } = useCredits();
    const navigate = useNavigate();

    const cat = categoryConfig[job.category] || categoryConfig.other;
    const isPro = profile?.role === 'pro';
    const isOwner = user && job.created_by === user.id;
    const unlocked = isJobUnlocked(job.id);
    const canViewContact = user && (isOwner || unlocked);
    const daysAgo = Math.floor((Date.now() - new Date(job.created_at).getTime()) / 86400000);

    const handleClick = () => {
        if (job.slug) navigate(`/jobs/${job.slug}`);
    };

    return (
        <div
            className="bg-white rounded-2xl border border-slate-100 hover:border-brand-blue/40 hover:shadow-md transition-all cursor-pointer group overflow-hidden"
            onClick={handleClick}
        >
            {/* Top accent bar by category */}
            <div className={`h-1 w-full ${job.category === 'cleaning' ? 'bg-sky-400' : job.category === 'construction' ? 'bg-orange-400' : job.category === 'masonry' ? 'bg-amber-400' : job.category === 'painting' ? 'bg-pink-400' : job.category === 'industry' ? 'bg-slate-400' : 'bg-purple-400'}`} />

            <div className="p-5">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-brand-blue transition-colors line-clamp-2">
                            {job.title}
                        </h3>
                        {job.creator?.role === 'pro' && (
                            <div className="flex items-center gap-1.5 mt-1.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-brand-blue/10 text-brand-blue text-[10px] font-bold border border-brand-blue/20">
                                    <ShieldCheck size={12} />
                                    CONFRÈRE PRO
                                </span>
                            </div>
                        )}
                    </div>
                    <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${cat.color}`}>
                        {cat.emoji} {cat.label}
                    </span>
                </div>

                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-3">
                    <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-brand-blue" />
                        <strong className="text-slate-700">{job.location_city}</strong>
                        {job.location_department && ` (${job.location_department})`}
                    </span>
                    {job.height_meters && (
                        <span className="flex items-center gap-1">
                            <Ruler size={12} />
                            {job.height_meters}m
                        </span>
                    )}
                    <span className="flex items-center gap-1 ml-auto">
                        <Calendar size={12} />
                        {daysAgo === 0 ? "Aujourd'hui" : daysAgo === 1 ? "Hier" : `Il y a ${daysAgo}j`}
                    </span>
                </div>

                {/* Description preview */}
                <p className="text-sm text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                    {job.description}
                </p>

                {/* Badge row */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {job.type === 'renfort_pro' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-blue text-white font-black uppercase tracking-widest flex items-center gap-1 shadow-sm">
                            🚀 Renfort PRO
                        </span>
                    ) : null}
                    
                    {job.type === 'renfort_pro' && job.daily_rate ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center gap-0.5 border border-blue-100">
                            <Euro size={10} />
                            {job.daily_rate}€ / jour HT
                        </span>
                    ) : (job.budget_min || job.budget_max) && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium flex items-center gap-0.5 border border-green-100">
                            <Euro size={10} />
                            {job.budget_min}{job.budget_max ? ` – ${job.budget_max}€` : '€'}
                        </span>
                    )}

                    {job.type === 'renfort_pro' && job.start_date && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 font-medium flex items-center gap-0.5 border border-orange-100">
                            <Calendar size={10} />
                            Dès le {new Date(job.start_date).toLocaleDateString('fr-FR')}
                            {job.duration_days && ` (${job.duration_days}j)`}
                        </span>
                    ) || job.deadline && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 font-medium flex items-center gap-0.5 border border-orange-100">
                            <Clock size={10} />
                            {new Date(job.deadline).toLocaleDateString('fr-FR')}
                        </span>
                    )}

                    {job.photos_url && job.photos_url.length > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            📷 {job.photos_url.length}
                        </span>
                    )}
                </div>

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
