import React from 'react';
import { MapPin, Calendar, Compass, ShieldCheck } from 'lucide-react';
import type { Job } from '../../types';
import {
    getDepartmentLabel,
    getProximityForPro,
    getLeadQuality,
    isClientVerified,
} from '../../lib/missionEnrichment';
import { LeadQualityBadge } from './LeadQualityBadge';

interface JobHeaderProps {
    job: Job;
    categories: string[];
    clientType: string | null;
    proInterventionZones?: string[] | null;
    showPublishDate?: boolean;
}

export const JobHeader: React.FC<JobHeaderProps> = ({ job, categories, clientType, proInterventionZones, showPublishDate = false }) => {
    const deptLabel = getDepartmentLabel(job.location_department);
    const proximity = getProximityForPro(job, proInterventionZones);
    const quality = getLeadQuality(job);
    const clientVerified = isClientVerified(job);

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
                {showPublishDate && (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar size={13} />
                        Publiée le {new Date(job.created_at).toLocaleDateString('fr-FR')}
                    </span>
                )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{job.title}</h1>

            <div className="flex flex-wrap items-center gap-1.5 mb-3">
                <LeadQualityBadge quality={quality} />
                {clientVerified && (
                    <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-blue-50 text-blue-700 border-blue-200"
                        title="Client structuré (entreprise, syndic, agence) — pré-qualifié par notre équipe"
                    >
                        <ShieldCheck size={11} />
                        Client vérifié
                    </span>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                    <MapPin size={15} className="text-brand-blue shrink-0" />
                    <strong className="text-slate-700">{job.location_city}</strong>
                    {deptLabel && <span className="text-slate-500">— {deptLabel}</span>}
                </span>
                {proximity && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold border ${
                        proximity.inZone
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                        <Compass size={12} />
                        {proximity.label}
                    </span>
                )}
            </div>
        </div>
    );
};
