import React from 'react';
import { CalendarDays, Clock, Tag, Layers, Ruler, Hourglass, Euro, FileText, Moon } from 'lucide-react';
import type { Job } from '../../types';
import {
    getBudgetDisplay,
    getScheduleDisplay,
} from '../../lib/missionEnrichment';

interface JobSummaryProps {
    job: Job;
    contractTypeLabels: Record<string, string>;
    levelLabels: Record<string, string>;
    structureTypeLabels: Record<string, string>;
}

interface Field {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    label: string;
    value: React.ReactNode;
    accent?: 'green' | 'orange' | 'blue' | 'slate' | 'indigo';
}

export const JobSummary: React.FC<JobSummaryProps> = ({
    job, contractTypeLabels, levelLabels, structureTypeLabels,
}) => {
    const budget = getBudgetDisplay(job);
    const schedule = getScheduleDisplay(job);

    const accentClasses: Record<NonNullable<Field['accent']>, string> = {
        green: 'text-green-700',
        orange: 'text-orange-600',
        blue: 'text-brand-blue',
        slate: 'text-slate-500 italic',
        indigo: 'text-indigo-700',
    };

    const fields: Field[] = [
        {
            icon: Tag,
            label: 'Type',
            value: job.type === 'renfort_pro' ? '🚀 Renfort PRO' : '📝 Standard',
        },
    ];

    if (budget?.dailyRate) {
        fields.push({
            icon: Euro,
            label: 'Tarif / jour',
            value: `${budget.dailyRate} € HT`,
            accent: 'blue',
        });
    } else if (budget) {
        fields.push({
            icon: Euro,
            label: budget.isIndicative ? 'Budget (indicatif)' : 'Budget',
            value: budget.label,
            accent: budget.isIndicative ? 'slate' : 'green',
        });
    }

    fields.push({
        icon: schedule.isFlexible ? Clock : CalendarDays,
        label: job.start_date ? 'Début' : job.deadline ? 'Délai' : 'Démarrage',
        value: schedule.isFlexible
            ? 'À convenir'
            : job.start_date
                ? new Date(job.start_date).toLocaleDateString('fr-FR')
                : job.deadline
                    ? new Date(job.deadline).toLocaleDateString('fr-FR')
                    : '—',
        accent: schedule.isFlexible ? 'slate' : job.start_date ? 'blue' : 'orange',
    });

    if (job.height_meters) {
        fields.push({
            icon: Ruler,
            label: 'Hauteur',
            value: `${job.height_meters} m`,
        });
    }

    if (job.type === 'renfort_pro' && job.duration_days) {
        fields.push({
            icon: Hourglass,
            label: 'Durée',
            value: `${job.duration_days} jours`,
        });
    }

    if (job.type === 'renfort_pro' && job.structure_type) {
        fields.push({
            icon: Layers,
            label: 'Structure',
            value: structureTypeLabels[job.structure_type] || job.structure_type,
        });
    }

    if (job.type === 'renfort_pro' && job.contract_type) {
        fields.push({
            icon: FileText,
            label: 'Contrat',
            value: contractTypeLabels[job.contract_type],
        });
    }

    if (job.type === 'renfort_pro' && job.work_night_weekend) {
        fields.push({
            icon: Moon,
            label: 'Horaires',
            value: 'Nuit / Week-end',
            accent: 'indigo',
        });
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h2 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide">
                Résumé de la mission
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
                {fields.map((f, i) => {
                    const Icon = f.icon;
                    const valueClass = f.accent ? accentClasses[f.accent] : 'text-slate-900';
                    return (
                        <div key={i} className="flex items-start gap-2 min-w-0">
                            <Icon size={14} className="text-slate-400 shrink-0 mt-0.5" />
                            <div className="min-w-0">
                                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                                    {f.label}
                                </div>
                                <div className={`text-sm font-medium truncate ${valueClass}`} title={typeof f.value === 'string' ? f.value : undefined}>
                                    {f.value}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {job.required_level && job.required_level.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Niveaux</span>
                    {job.required_level.map(lvl => (
                        <span key={lvl} className="text-[11px] px-2 py-0.5 bg-slate-100 rounded-md font-bold text-slate-700">
                            {levelLabels[lvl] || lvl}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};
