import React, { useState, Suspense, lazy } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, Filter, Map, LayoutGrid, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { JobCard } from '../components/JobCard';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { FRENCH_DEPARTMENTS } from '../constants/departments';
import { CATEGORY_LABELS } from '../constants/categories';
import type { Job } from '../types';
import { Helmet } from 'react-helmet-async';

const JobMap = lazy(() => import('../components/map/JobMap').then(m => ({ default: m.JobMap })));

const PAGE_SIZE = 50;

export const JobBoard: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [limit, setLimit] = useState(PAGE_SIZE);

    const { data: jobs, isLoading, error } = useQuery({
        queryKey: ['jobs', 'live', limit],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('jobs')
                .select('*, creator:profiles!created_by(role)')
                .eq('status', 'live')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data as Job[];
        },
    });

    const filteredJobs = jobs?.filter((job) => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.location_city.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = categoryFilter === 'all' || job.category === categoryFilter;
        const matchesDepartment = departmentFilter === 'all' || job.location_department === departmentFilter;

        return matchesSearch && matchesCategory && matchesDepartment;
    }) || [];

    const categoryOptions = [
        { value: 'all', label: 'Toutes les catégories' },
        ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
            value,
            label: `${getCategoryEmoji(value)} ${label}`
        }))
    ];

    function getCategoryEmoji(category: string): string {
        const emojis: Record<string, string> = {
            cleaning: '🧹',
            construction: '🏗️',
            masonry: '🧱',
            painting: '🎨',
            industry: '⚙️',
            event: '🎪',
            other: '❓'
        };
        return emojis[category] || '';
    }


    const departmentOptions = [
        { value: 'all', label: 'Tous les départements' },
        ...FRENCH_DEPARTMENTS.map(d => ({ value: d.code, label: d.label }))
    ];

    return (
        <>
        <Helmet>
            <title>Missions Cordistes et Chantiers d'Accès Difficile | LesCordistes.com</title>
            <meta name="description" content="Découvrez une large sélection d'annonces de travail en hauteur. Filtrez par spécialité : maçonnerie, peinture, nettoyage de façade sur corde." />
            <link rel="canonical" href="https://lescordistes.com/jobs" />
        </Helmet>
        <div className="min-h-screen bg-slate-50 py-10">
            <div className="container max-w-7xl">
                {/* Header */}
                <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Missions disponibles</h1>
                        <p className="text-slate-500 mt-1">
                            {isLoading ? 'Chargement…' : `${filteredJobs.length} mission${filteredJobs.length !== 1 ? 's' : ''} active${filteredJobs.length !== 1 ? 's' : ''}`}
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

                {/* Reinforcement CTA (Discreet top block) */}
                <div className="bg-orange-50/50 border border-orange-100 rounded-3xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-orange-100/30 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                    <div className="relative z-10 flex items-center gap-5">
                        <div className="hidden sm:flex h-12 w-12 bg-white rounded-2xl shadow-sm border border-orange-100 items-center justify-center flex-shrink-0 group-hover:rotate-12 transition-transform">
                            <Plus size={20} className="text-orange-600 animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-orange-900 tracking-tight leading-tight">
                                Besoin d'un renfort sur un chantier ?
                            </h3>
                            <p className="text-xs text-orange-700/80 mt-0.5 font-bold">
                                Publiez une annonce de renfort pour trouver des équipiers qualifiés immédiatement.
                            </p>
                        </div>
                    </div>
                    <Link to="/post-job?type=renfort_pro" className="relative z-10 w-full md:w-auto">
                        <Button 
                            variant="primary" 
                            size="sm"
                            className="w-full bg-orange-600 hover:bg-orange-500 font-bold uppercase tracking-widest text-[10px] px-8 py-5 rounded-2xl shadow-xl shadow-orange-200 hover:shadow-orange-300 transition-all active:scale-95"
                        >
                            Publier du renfort
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Filter className="text-brand-blue" size={18} />
                        <h2 className="font-semibold text-slate-900">Filtres</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <Input
                                type="text"
                                placeholder="Rechercher une mission…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            options={categoryOptions}
                        />
                        <Select
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                            options={departmentOptions}
                        />
                    </div>
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
                        <p className="text-slate-600 text-lg">Aucune mission ne correspond à vos critères.</p>
                        <p className="text-slate-400 mt-2 text-sm">Essayez de modifier les filtres.</p>
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
