'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useCredits } from '../../hooks/useCredits';
import { useDashboardMode } from '../../contexts/DashboardContext';
import { DashboardLayout } from '../../components/DashboardLayout';
import { CreditWidget } from '../../components/credits/CreditWidget';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/dashboard/StatCard';
import { JobListItem } from '../../components/dashboard/JobListItem';
import { 
    Briefcase, 
    TrendingUp,
    ArrowRight, 
    User, 
    ChevronRight, 
    Zap, 
    Phone, 
    Mail, 
    ShieldCheck,
    Coins
} from 'lucide-react';
import type { Job } from '../../types';

export function ProDashboard() {
    const navigate = useRouter();
    const { user, profile } = useAuth();
    const { balance, unlockedLeads: unlockedJobIds } = useCredits();
    const { setMode } = useDashboardMode();

    // Total active missions count
    const { data: totalJobsCount } = useQuery({
        queryKey: ['jobs-count'],
        queryFn: async () => {
            const { count, error } = await (supabase as any)
                .from('jobs')
                .select('id', { count: 'exact', head: true })
                .eq('status', 'live');
            if (error) throw error;
            return count ?? 0;
        },
    });

    // Pro's posted jobs (reinforcement)
    const { data: proPostedJobs, isLoading: isLoadingPosted } = useQuery({
        queryKey: ['pro-posted-jobs', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .eq('created_by', user.id)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data as Job[];
        },
        enabled: !!user?.id,
    });

    // Unlocked leads details
    const { data: unlockedJobs, isLoading: isLoadingLeads } = useQuery({
        queryKey: ['unlocked-jobs-details', unlockedJobIds],
        queryFn: async () => {
            if (!unlockedJobIds || unlockedJobIds.length === 0) return [];
            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .in('id', unlockedJobIds)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data as Job[];
        },
        enabled: !!unlockedJobIds && unlockedJobIds.length > 0,
    });

    const profileCompletion = React.useMemo(() => {
        if (!profile) return 0;
        const fields = ['full_name', 'phone', 'bio', 'company_name', 'certifications', 'skills', 'equipment', 'insurance_info', 'intervention_zones', 'portfolio_photos'];
        const completed = fields.filter(f => {
            const v = profile[f as keyof typeof profile];
            return v && (Array.isArray(v) ? v.length > 0 : true);
        }).length;
        return Math.round((completed / fields.length) * 100);
    }, [profile]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Bonjour {profile?.full_name?.split(' ')[0] || 'Cordiste'} 👋
                        </h1>
                        <p className="text-slate-500 text-sm mt-0.5">Tableau de bord Professionnel</p>
                    </div>
                </div>

                {profileCompletion < 70 && (
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                                <User size={18} className="text-orange-500" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 text-sm">Profil incomplet ({profileCompletion}%)</p>
                                <p className="text-xs text-slate-500">Un profil complet augmente vos chances d'être contacté.</p>
                            </div>
                        </div>
                        <Button variant="outline" onClick={() => router.push('/profile')} className="shrink-0 text-xs border-orange-200 text-orange-700 hover:bg-orange-100">
                            Compléter <ArrowRight size={13} className="ml-1" />
                        </Button>
                    </div>
                )}

                <div className="bg-gradient-to-r from-brand-blue to-blue-700 rounded-2xl p-5 text-white">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <Zap size={24} className="text-white" />
                            </div>
                            <div>
                                <p className="font-bold">Besoin de missions ?</p>
                                <p className="text-sm text-blue-100">Débloquez les coordonnées des missions pour envoyer vos offres.</p>
                            </div>
                        </div>
                        <Button variant="secondary" onClick={() => router.push('/credits')} className="bg-white text-brand-blue hover:bg-blue-50 shrink-0 font-black">
                            Acheter des crédits <ArrowRight size={16} />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <StatCard label="Crédits" value={`${balance} dispo.`} icon={Coins} iconBg="bg-yellow-100" iconColor="text-yellow-600" onClick={() => router.push('/credits')} />
                    <StatCard label="Profil" value={`${profileCompletion}% complet`} icon={TrendingUp} iconBg="bg-blue-100" iconColor="text-blue-600" onClick={() => router.push('/profile')} />
                    <StatCard label="Missions active" value={totalJobsCount ?? 0} icon={Briefcase} iconBg="bg-brand-blue/10" iconColor="text-brand-blue" onClick={() => router.push('/jobs')} />
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                                    <ShieldCheck size={18} className="text-green-600" />
                                    Mes missions (Leads débloqués)
                                </h2>
                                {unlockedJobs && unlockedJobs.length > 0 && (
                                    <span className="text-xs font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                                        {unlockedJobs.length} contact{unlockedJobs.length > 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>

                            {isLoadingLeads ? (
                                <div className="flex items-center justify-center py-10">
                                    <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-brand-blue" />
                                </div>
                            ) : unlockedJobs && unlockedJobs.length > 0 ? (
                                <div className="divide-y divide-slate-50">
                                    {unlockedJobs.map((job) => (
                                        <div key={job.id} className="p-1">
                                            <JobListItem 
                                                job={job as any}
                                                onClick={() => router.push(`/jobs/${job.slug}`)}
                                                onView={() => router.push(`/jobs/${job.slug}`)}
                                                showUnlockers={
                                                    <div className="bg-slate-50 rounded-lg p-3 grid sm:grid-cols-2 gap-3 border border-slate-100 mt-3">
                                                        <div className="flex items-center gap-2 text-[11px]">
                                                            <User size={12} className="text-slate-400" />
                                                            <span className="font-medium text-slate-700">{job.client_contact_info?.name || 'Client'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[11px]">
                                                            <Phone size={12} className="text-slate-400" />
                                                            <a href={`tel:${job.client_contact_info?.phone}`} className="font-medium text-brand-blue hover:underline">
                                                                {job.client_contact_info?.phone || 'Non renseigné'}
                                                            </a>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[11px] sm:col-span-2">
                                                            <Mail size={12} className="text-slate-400" />
                                                            <a href={`mailto:${job.client_contact_info?.email}`} className="font-medium text-brand-blue hover:underline truncate">
                                                                {job.client_contact_info?.email || 'Non renseigné'}
                                                            </a>
                                                        </div>
                                                    </div>
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 px-6">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Briefcase className="text-slate-200" size={32} />
                                    </div>
                                    <p className="text-slate-900 font-bold mb-1">Aucune mission débloquée</p>
                                    <p className="text-slate-500 text-sm mb-6">Mettez vos crédits à profit pour contacter des clients.</p>
                                    <Button variant="primary" onClick={() => router.push('/jobs')} className="shadow-lg shadow-brand-blue/20">
                                        Trouver des missions
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="bg-blue-50/50 rounded-xl border border-blue-100/50 overflow-hidden shadow-sm">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-blue-100/30">
                                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                                    <Zap size={18} className="text-brand-blue" />
                                    Mes demandes de renfort
                                </h2>
                            </div>

                            {isLoadingPosted ? (
                                <div className="flex items-center justify-center py-10">
                                    <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-brand-blue" />
                                </div>
                            ) : proPostedJobs && proPostedJobs.length > 0 ? (
                                <div className="divide-y divide-blue-100/30">
                                    {proPostedJobs.map((job) => (
                                        <div key={job.id} className="p-1">
                                            <JobListItem 
                                                job={job as any} 
                                                onClick={() => setMode('recruiter')}
                                                isProDashboard
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-xs text-slate-400">Vous n'avez posté aucune demande de renfort.</p>
                                    <Button variant="outline" size="sm" onClick={() => router.push('/post-job?type=renfort_pro')} className="mt-3 text-xs">
                                        Demander du renfort
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <CreditWidget />
                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Zap size={18} className="text-brand-blue" />
                                Actions rapides
                            </h3>
                            <div className="space-y-2 text-sm">
                                <button onClick={() => router.push('/profile')} className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-50 bg-slate-50/50 hover:bg-slate-100 transition-colors">
                                    <span className="flex items-center gap-3 font-medium text-slate-700">
                                        <User size={16} className="text-slate-400" /> Gérer mes zones
                                    </span>
                                    <ChevronRight size={14} className="text-slate-300" />
                                </button>
                                <button onClick={() => router.push('/credits')} className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-50 bg-slate-50/50 hover:bg-slate-100 transition-colors">
                                    <span className="flex items-center gap-3 font-medium text-slate-700">
                                        <Coins size={16} className="text-slate-400" /> Gérer mes crédits
                                    </span>
                                    <ChevronRight size={14} className="text-slate-300" />
                                </button>
                                <button onClick={() => router.push('/pro/widget')} className="w-full flex items-center justify-between p-3 rounded-lg border border-brand-blue/10 bg-brand-blue/5 hover:bg-brand-blue/10 transition-colors">
                                    <span className="flex items-center gap-3 font-bold text-brand-blue">
                                        <ShieldCheck size={16} className="text-brand-blue" /> SEO : Obtenir le Badge de Confiance
                                    </span>
                                    <ChevronRight size={14} className="text-brand-blue" />
                                </button>
                            </div>
                        </div>

                        {/* Legal Trust Notice */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500 flex items-start gap-3">
                             <ShieldCheck size={16} className="text-slate-400 shrink-0 mt-0.5" />
                             <p className="leading-relaxed">
                                 Chaque lead fait l'objet d'une <strong>pré-qualification téléphonique</strong> par nos experts. 
                                 En cas d'impossibilité d'échanger avec le client, ou de données frauduleuses, vous pouvez demander le <span className="underline cursor-pointer hover:text-slate-700">remboursement manuel de vos crédits</span> auprès du support.
                             </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
