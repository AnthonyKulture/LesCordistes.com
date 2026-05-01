'use client'

import React, { useState, Suspense, lazy } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Map, LayoutGrid, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { JobCard } from '../components/JobCard';
import { Button } from '../components/ui/Button';
import { PromoActivation } from '../components/promo/PromoActivation';
import { ProAlertCTA } from '../components/pro-alerts/ProAlertCTA';
import { useAuth } from '../contexts/AuthContext';
import type { Job } from '../types';

const JobMap = lazy(() => import('../components/map/JobMap').then(m => ({ default: m.JobMap })));

const PAGE_SIZE = 50;

export const JobBoard: React.FC = () => {
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [limit, setLimit] = useState(PAGE_SIZE);
    const { user, profile } = useAuth();

    const { data: jobs, isLoading, error } = useQuery({
        queryKey: ['jobs', 'visible', limit],
        queryFn: async () => {
            // 'live' = active, 'expired' = J+15 sans revalidation, 'completed' =
            // mission terminée explicitement. 'expired' + 'completed' affichées
            // en grisé pour preuve sociale.
            const { data, error } = await supabase
                .from('jobs')
                .select('*, creator:profiles!created_by(role)')
                .in('status', ['live', 'expired', 'completed'])
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data as Job[];
        },
    });

    const filteredJobs = jobs || [];
    const liveJobs = filteredJobs.filter(j => j.status === 'live');
    const closedJobs = filteredJobs.filter(j => j.status !== 'live');
    const activeCount = liveJobs.length;
    const closedCount = closedJobs.length;

    return (
        <>
        <PromoActivation />

        <div className="min-h-screen bg-slate-50 py-10 pb-28 md:pb-10">
            <div className="container max-w-7xl">
                {/* Header — compteurs en avant + toggle vue.
                    Le H1 est dans le header SSR au-dessus, ici on évite le doublon. */}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap">
                        {isLoading ? (
                            <span className="text-sm text-slate-500">Chargement…</span>
                        ) : (
                            <>
                                {/* Badge primaire — missions actives, mis en avant */}
                                <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg whitespace-nowrap">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                                    </span>
                                    <span className="text-base sm:text-lg font-black text-emerald-700 leading-none">{activeCount}</span>
                                    <span className="text-[11px] sm:text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                                        mission{activeCount !== 1 ? 's' : ''} active{activeCount !== 1 ? 's' : ''}
                                    </span>
                                </span>

                                {/* Badge secondaire — missions effectuées, plus discret */}
                                {closedCount > 0 && (
                                    <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 bg-slate-100 border border-slate-200 rounded-lg whitespace-nowrap">
                                        <span className="text-xs sm:text-sm font-bold text-slate-600 leading-none">{closedCount}</span>
                                        <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 tracking-wide">
                                            déjà effectuée{closedCount !== 1 ? 's' : ''}
                                        </span>
                                    </span>
                                )}
                            </>
                        )}
                    </div>

                    {/* View toggle — desktop/tablette uniquement, masqué sur mobile */}
                    <div className="hidden md:flex bg-white border border-slate-200 rounded-lg p-1 gap-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                viewMode === 'list'
                                    ? 'bg-brand-blue text-white'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <LayoutGrid size={16} />
                            Liste
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                viewMode === 'map'
                                    ? 'bg-brand-blue text-white'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <Map size={16} />
                            Carte
                        </button>
                    </div>
                </div>

                {/* Pro alert subscription — visible mais non intrusif */}
                <ProAlertCTA
                    defaultEmail={user?.email ?? undefined}
                    defaultDepartments={profile?.intervention_zones ?? undefined}
                />

                {/* Reinforcement CTA */}
                <div className="flex items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl px-5 py-3.5 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                            <Plus size={16} className="text-orange-500" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700">Besoin d'un renfort sur chantier ?</p>
                    </div>
                    <Link
                        href="/post-job?type=renfort_pro"
                        className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg text-xs font-bold text-orange-700 hover:bg-orange-100 transition-colors"
                    >
                        Publier
                    </Link>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue" />
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <p className="text-red-800">Une erreur est survenue lors du chargement des missions.</p>
                    </div>
                ) : viewMode === 'map' ? (
                    <Suspense fallback={
                        <div className="flex items-center justify-center h-96 bg-white rounded-xl shadow-sm border border-slate-100">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-blue" />
                        </div>
                    }>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                            {/* Vue carte : missions live uniquement (les missions déjà réalisées
                                n'apportent rien sur la carte). */}
                            <JobMap jobs={liveJobs} height="560px" />
                        </div>
                    </Suspense>
                ) : filteredJobs.length > 0 ? (
                    <>
                        {/* Missions actives — bloc principal */}
                        {liveJobs.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                {liveJobs.map((job) => (
                                    <JobCard key={job.id} job={job} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center">
                                <p className="text-slate-600 text-base font-semibold">Aucune mission active à l'instant.</p>
                                <p className="text-slate-400 mt-1 text-sm">De nouvelles missions arrivent chaque jour — revenez bientôt.</p>
                            </div>
                        )}

                        {/* Séparateur + bloc des missions déjà réalisées */}
                        {closedJobs.length > 0 && (
                            <>
                                <div className="flex items-center gap-4 mt-12 mb-6">
                                    <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent to-brand-blue/20 rounded-full" />
                                    <div className="text-center">
                                        <h2 className="text-sm font-bold text-brand-blue uppercase tracking-wider">
                                            Missions déjà réalisées
                                        </h2>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Aperçu de ce que les cordistes du réseau accomplissent — non débloquables.
                                        </p>
                                    </div>
                                    <div className="flex-1 h-0.5 bg-gradient-to-l from-transparent to-brand-blue/20 rounded-full" />
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                    {closedJobs.map((job) => (
                                        <JobCard key={job.id} job={job} />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
                        <p className="text-slate-600 text-lg">Aucune mission disponible pour le moment.</p>
                        <p className="text-slate-400 mt-2 text-sm">Revenez bientôt, de nouvelles missions arrivent chaque jour.</p>
                    </div>
                )}

                {/* Load more */}
                {filteredJobs.length >= limit && viewMode === 'list' && !isLoading && (
                    <div className="text-center mt-6">
                        <button
                            onClick={() => setLimit(prev => prev + PAGE_SIZE)}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-brand-blue hover:text-brand-blue transition-colors shadow-sm"
                        >
                            Charger plus de missions
                        </button>
                    </div>
                )}
            </div>
        </div>
        </>
    );
};
