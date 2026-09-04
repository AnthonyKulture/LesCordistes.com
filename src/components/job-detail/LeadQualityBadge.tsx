'use client'

import React from 'react';
import { Sparkles, Info } from 'lucide-react';
import type { LeadQuality } from '../../lib/missionEnrichment';

interface LeadQualityBadgeProps {
    quality: LeadQuality;
    variant?: 'compact' | 'detailed';
}

export const LeadQualityBadge: React.FC<LeadQualityBadgeProps> = ({ quality, variant = 'compact' }) => {
    // Garde-fou : sous le palier « Qualifié », le chiffre est tu. On n'invente rien
    // à la place — le palier et les signaux réels suffisent.
    const tooltip = quality.showScore
        ? `Complétude du brief : ${quality.score}/100. Mesurée sur ce que le client a renseigné — budget, description, photos, planning, adresse, type de client.`
        : 'Palier fondé sur les seuls éléments réellement renseignés par le client.';

    if (variant === 'compact') {
        return (
            <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${quality.color} ${quality.bg} ${quality.border}`}
                title={tooltip}
            >
                <Sparkles size={10} />
                {quality.label}{quality.showScore ? ` · ${quality.score}/100` : ''}
            </span>
        );
    }

    return (
        <div className={`rounded-2xl border p-4 ${quality.bg} ${quality.border}`}>
            <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                    <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${quality.color}`}>
                        <Sparkles size={13} />
                        Complétude du brief
                    </div>
                    {quality.showScore ? (
                        <>
                            <div className={`mt-1 text-2xl font-black ${quality.color}`}>
                                {quality.score}<span className="text-sm font-medium opacity-60">/100</span>
                            </div>
                            <div className={`text-xs font-bold ${quality.color}`}>{quality.label}</div>
                        </>
                    ) : (
                        <>
                            <div className={`mt-1 text-lg font-black ${quality.color}`}>{quality.label}</div>
                            <div className={`text-[11px] ${quality.color} opacity-80`}>
                                {quality.signals.length > 0
                                    ? 'Éléments fournis par le client, listés ci-dessous.'
                                    : 'Peu d’éléments renseignés à ce stade.'}
                            </div>
                        </>
                    )}
                </div>
                <div className="relative group">
                    <Info size={14} className={`${quality.color} opacity-50 cursor-help`} />
                    <div className="absolute right-0 top-full mt-1 w-60 p-2.5 bg-slate-800 text-white text-[11px] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none leading-relaxed">
                        Ce score mesure uniquement ce que le client a renseigné : budget, longueur du brief, photos, planning, adresse, type de client. Rien n&apos;est accordé d&apos;office, et chaque critère listé ci-dessous est vérifiable sur la fiche.
                        {quality.teamSourced && ' Cette mission a été saisie par notre équipe après un échange direct avec le client.'}
                    </div>
                </div>
            </div>

            {/* Progress bar — masquée sous le palier « Qualifié », comme le chiffre */}
            {quality.showScore && (
                <div className="h-1.5 bg-white/60 rounded-full overflow-hidden mb-3">
                    <div
                        className={`h-full rounded-full transition-all ${
                            quality.tier === 'premium' ? 'bg-emerald-500' :
                            quality.tier === 'qualifie' ? 'bg-green-500' :
                            'bg-blue-500'
                        }`}
                        style={{ width: `${quality.score}%` }}
                    />
                </div>
            )}

            {quality.signals.length > 0 && (
                <ul className={`text-xs space-y-1 ${quality.color}`}>
                    {quality.signals.map((s, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-current opacity-60" />
                            {s}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
