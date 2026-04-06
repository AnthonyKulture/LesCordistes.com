import React from 'react';
import { MapPin, Calendar, Ruler, Euro, Clock } from 'lucide-react';
import type { Job } from '../../types';

interface JobHeaderProps {
    job: Job;
    categories: string[];
    clientType: string | null;
}

export const JobHeader: React.FC<JobHeaderProps> = ({ job, categories, clientType }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="flex flex-wrap gap-1.5">
                    {categories.map((cat, i) => (
                        <span key={i} className="text-sm px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full font-medium">
                            {cat}
                        </span>
                    ))}
                </div>
                {clientType && (
                    <span className="text-sm px-3 py-1 bg-slate-100 text-slate-700 rounded-full font-medium border border-slate-200">
                        {clientType}
                    </span>
                )}
                <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar size={13} />
                    Publiée le {new Date(job.created_at).toLocaleDateString('fr-FR')}
                </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-3">{job.title}</h1>

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-4">
                <span className="flex items-center gap-1.5">
                    <MapPin size={15} className="text-brand-blue shrink-0" />
                    <strong className="text-slate-700">{job.location_city}</strong>
                    {job.location_department && ` – Dép. ${job.location_department}`}
                </span>
                {job.height_meters && (
                    <span className="flex items-center gap-1.5">
                        <Ruler size={15} className="text-slate-400" />
                        {job.height_meters}m de hauteur
                    </span>
                )}
            </div>

            {/* Badge row */}
            <div className="flex flex-wrap gap-2">
                {(job.budget_min || job.budget_max) && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                        <Euro size={11} />
                        {job.budget_min}{job.budget_max ? ` – ${job.budget_max}€` : '€+'}
                    </span>
                )}
                {job.deadline && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700">
                        <Clock size={11} />
                        Avant le {new Date(job.deadline).toLocaleDateString('fr-FR')}
                    </span>
                )}
                {job.type === 'renfort_pro' && job.work_night_weekend && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        🌙 Nuit / Week-end
                    </span>
                )}
            </div>
        </div>
    );
};
