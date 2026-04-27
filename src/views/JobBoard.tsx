'use client'

import React, { useState, Suspense, lazy } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Map, LayoutGrid, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { JobCard } from '../components/JobCard';
import { Button } from '../components/ui/Button';
import { PromoActivation } from '../components/promo/PromoActivation';
import type { Job } from '../types';

const JobMap = lazy(() => import('../components/map/JobMap').then(m => ({ default: m.JobMap })));

const PAGE_SIZE = 50;

export const JobBoard: React.FC = () => {
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [limit, setLimit] = useState(PAGE_SIZE);

    const { data: jobs, isLoading, error } = useQuery({
        queryKey: ['jobs', 'visible', limit],
        queryFn: async () => {
            // 'live' = active, 'expired' = "Déjà effectuée" (J+15 sans revalidation),
            // toujours visible mais désactivée pour preuve sociale.
            const { data, error } = await supabase
                .from('jobs')
                .select('*, creator:profiles!created_by(role)')
                .in('status', ['live', 'expired'])
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data as Job[];
        },
    });

    const filteredJobs = jobs || [];
    const activeCount = filteredJobs.filter(j => j.status === 'live').length;

    return (
        <>
        <PromoActivation />

        <div className="min-h-screen bg-slate-50 py-10">
            <div className="container max-w-7xl">
                {/* Header */}
                <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">Missions disponibles</h2>
                        <p className="text-slate-500 mt-1">
                            {isLoading ? 'Chargement…' : `${activeCount} mission${activeCount !== 1 ? 's' : ''} active${activeCount !== 1 ? 's' : ''}${filteredJobs.length > activeCount ? ` · ${filteredJobs.length - activeCount} déjà effectuée${filteredJobs.length - activeCount !== 1 ? 's' : ''}` : ''}`}
                        </p>
                    </div>

                    {/* View toggle */}
                    <div className="flex bg-white border border-slate-200 rounded-lg p-1 gap-1">
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
                            <JobMap jobs={filteredJobs} height="560px" />
                        </div>
                    </Suspense>
                ) : filteredJobs.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {filteredJobs.map((job) => (
                            <JobCard key={job.id} job={job} />
                        ))}
                    </div>
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
