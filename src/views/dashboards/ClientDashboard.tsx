'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createSupabaseBrowserClient } from '../../lib/supabase-browser';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { useDashboardMode } from '../../contexts/DashboardContext';
import { StatCard } from '../../components/dashboard/StatCard';
import { JobListItem } from '../../components/dashboard/JobListItem';
import { CompleteJobModal } from '../../components/dashboard/CompleteJobModal';
import { ConfirmDeleteModal } from '../../components/dashboard/ConfirmDeleteModal';
import { JobUnlockers } from '../../components/dashboard/JobUnlockers';
import { useSearchParams } from 'next/navigation';
import {
    Briefcase,
    Clock,
    CheckCircle,
    Plus,
    ChevronRight,
    Zap,
    User,
    ShieldCheck,
    PartyPopper,
    X,
} from 'lucide-react';
import type { Job } from '../../types';

export function ClientDashboard() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { mode } = useDashboardMode();
    const { user, profile } = useAuth();
    const [showWelcomeBanner, setShowWelcomeBanner] = React.useState(() => searchParams.get('welcome') === 'client');
    const toast = useToast();
    const supabase = createSupabaseBrowserClient();
    const queryClient = useQueryClient();
    const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
    const [completingJob, setCompletingJob] = useState<Job | null>(null);

    const isProRecruiter = profile?.role === 'pro' && mode === 'recruiter';
    const firstName = profile?.full_name?.split(' ')[0] || (isProRecruiter ? 'Pro' : 'Client');

    const { data: jobs, isLoading } = useQuery({
        queryKey: ['client-jobs', user?.id],
        queryFn: async () => {
            const { data, error } = await (supabase as any)
                .from('jobs')
                .select('*')
                .eq('created_by', user?.id)
                .neq('status', 'cancelled')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Job[];
        },
        enabled: !!user?.id,
    });

    const deleteJob = useMutation({
        mutationFn: async (jobId: string) => {
            const { error } = await (supabase as any)
                .from('jobs')
                .update({ status: 'cancelled', updated_at: new Date().toISOString() })
                .eq('id', jobId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['client-jobs'] });
            setDeletingJobId(null);
            toast.success('Mission annulée avec succès.');
        },
        onError: (err) => {
            toast.error('Erreur lors de l\u2019annulation de la mission.');
            console.error(err);
        }
    });

    const completeJob = useMutation({
        mutationFn: async ({ jobId, proId, rating, comment }: { jobId: string, proId?: string, rating?: number, comment?: string }) => {
            const { error: jobError } = await (supabase as any)
                .from('jobs')
                .update({ status: 'completed' })
                .eq('id', jobId);

            if (jobError) throw jobError;

            if (proId && rating) {
                const { error: reviewError } = await (supabase as any)
                    .from('reviews')
                    .insert({
                        client_id: user?.id,
                        pro_id: proId,
                        job_id: jobId,
                        rating,
                        comment: comment || ''
                    });

                if (reviewError) throw reviewError;
            }
        },
        onSuccess: () => {
            toast.success('Mission terminée et clôturée !');
            queryClient.invalidateQueries({ queryKey: ['client-jobs', user?.id] });
            setCompletingJob(null);
        },
        onError: (err) => {
            console.error(err);
            toast.error('Erreur lors de la clôture de la mission.');
        },
    });

    const stats = React.useMemo(() => {
        if (!jobs) return { total: 0, live: 0, completed: 0 };
        return {
            total: jobs.length,
            live: jobs.filter(j => j.status === 'live' || j.status === 'pending').length,
            completed: jobs.filter(j => j.status === 'completed').length,
        };
    }, [jobs]);

    const postJobPath = isProRecruiter ? '/post-job?type=renfort_pro' : '/post-job';
    const dashboardSubtitle = isProRecruiter ? 'Mode Recruteur — Gérez vos demandes de renfort' : 'Gérez vos missions postées';

    return (
        <DashboardLayout>
            {showWelcomeBanner && (
                <div className="-mx-4 -mt-4 lg:-mx-8 lg:-mt-8 mb-4 bg-brand-blue text-white px-4 py-3 flex items-center justify-between gap-3 shadow-lg">
                    <div className="flex items-center gap-3 min-w-0">
                        <PartyPopper size={18} className="shrink-0 text-blue-200" />
                        <div className="min-w-0">
                            <p className="font-semibold text-sm leading-tight">Compte activé !</p>
                            <p className="text-xs text-blue-200 leading-tight truncate">Publie ton premier projet et reçois des devis.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => { router.push('/post-job'); setShowWelcomeBanner(false); }}
                            className="text-xs font-bold bg-white text-brand-blue rounded-md px-3 py-1.5 whitespace-nowrap"
                        >
                            Publier →
                        </button>
                        <button onClick={() => setShowWelcomeBanner(false)} className="text-blue-300 hover:text-white p-1">
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}
            <div>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Bonjour {firstName} 👋
                        </h1>
                        <p className="text-slate-500 text-sm mt-0.5">{dashboardSubtitle}</p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => router.push(postJobPath)}
                        className="flex items-center gap-2 shrink-0"
                    >
                        <Plus size={18} />
                        {isProRecruiter ? 'Demander du renfort' : 'Nouvelle mission'}
                    </Button>
                </div>

                {/* CTA Banner */}
                <div className="bg-gradient-to-r from-brand-blue to-blue-700 rounded-2xl p-5 text-white">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <Zap size={24} className="text-white" />
                            </div>
                            <div>
                                <p className="font-bold">
                                    {isProRecruiter ? 'Besoin de cordistes qualifiés ?' : 'Trouvez le bon professionnel'}
                                </p>
                                <p className="text-sm text-blue-100">
                                    {isProRecruiter
                                        ? 'Publiez une demande de renfort et recevez des offres de pros certifiés.'
                                        : 'Publiez votre mission et recevez des offres de cordistes certifiés.'}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="secondary"
                            onClick={() => router.push(postJobPath)}
                            className="bg-white text-brand-blue hover:bg-blue-50 shrink-0 font-black"
                        >
                            {isProRecruiter ? 'Publier un projet' : 'Poster une mission'}
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <StatCard
                        label="Total missions"
                        value={stats.total}
                        icon={Briefcase}
                        iconBg="bg-brand-blue/10"
                        iconColor="text-brand-blue"
                    />
                    <StatCard
                        label="En cours"
                        value={stats.live}
                        icon={Clock}
                        iconBg="bg-green-100"
                        iconColor="text-green-600"
                    />
                    <StatCard
                        label="Terminées"
                        value={stats.completed}
                        icon={CheckCircle}
                        iconBg="bg-slate-100"
                        iconColor="text-slate-600"
                    />
                </div>

                {/* Main layout */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Mission list */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                                    <Briefcase size={18} className="text-brand-blue" />
                                    {isProRecruiter ? 'Mes demandes de renfort' : 'Mes missions'}
                                </h2>
                                {jobs && jobs.length > 0 && (
                                    <span className="text-xs font-bold px-2 py-0.5 bg-blue-100 text-brand-blue rounded-full">
                                        {jobs.length} mission{jobs.length > 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>

                            {isLoading ? (
                                <div className="flex items-center justify-center py-10">
                                    <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-brand-blue" />
                                </div>
                            ) : jobs && jobs.length > 0 ? (
                                <div className="divide-y divide-slate-50">
                                    {jobs.map((job) => (
                                        <div key={job.id} className="p-1">
                                            <JobListItem
                                                job={job as any}
                                                onView={() => job.slug ? router.push(`/jobs/${job.slug}`) : toast.info('Cette mission est en cours de publication.')}
                                                onDelete={() => setDeletingJobId(job.id)}
                                                onComplete={() => setCompletingJob(job)}
                                                showUnlockers={<JobUnlockers jobId={job.id} />}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 px-6">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Briefcase className="text-slate-200" size={32} />
                                    </div>
                                    <p className="text-slate-900 font-bold mb-1">
                                        {isProRecruiter ? 'Aucune demande de renfort' : 'Aucune mission postée'}
                                    </p>
                                    <p className="text-slate-500 text-sm mb-6">
                                        {isProRecruiter
                                            ? 'Publiez un projet pour trouver des cordistes qualifiés.'
                                            : 'Publiez votre première mission pour trouver un professionnel.'}
                                    </p>
                                    <Button variant="primary" onClick={() => router.push(postJobPath)} className="shadow-lg shadow-brand-blue/20">
                                        {isProRecruiter ? 'Demander du renfort' : 'Poster ma première mission'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Zap size={18} className="text-brand-blue" />
                                Actions rapides
                            </h3>
                            <div className="space-y-2 text-sm">
                                <button
                                    onClick={() => router.push(postJobPath)}
                                    className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-50 bg-slate-50/50 hover:bg-slate-100 transition-colors"
                                >
                                    <span className="flex items-center gap-3 font-medium text-slate-700">
                                        <Plus size={16} className="text-slate-400" />
                                        {isProRecruiter ? 'Nouvelle demande de renfort' : 'Publier une mission'}
                                    </span>
                                    <ChevronRight size={14} className="text-slate-300" />
                                </button>
                                <button
                                    onClick={() => router.push('/profile')}
                                    className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-50 bg-slate-50/50 hover:bg-slate-100 transition-colors"
                                >
                                    <span className="flex items-center gap-3 font-medium text-slate-700">
                                        <User size={16} className="text-slate-400" />
                                        {isProRecruiter ? 'Mon profil pro' : 'Mon compte'}
                                    </span>
                                    <ChevronRight size={14} className="text-slate-300" />
                                </button>
                                <button
                                    onClick={() => router.push('/jobs')}
                                    className="w-full flex items-center justify-between p-3 rounded-lg border border-brand-blue/10 bg-brand-blue/5 hover:bg-brand-blue/10 transition-colors"
                                >
                                    <span className="flex items-center gap-3 font-bold text-brand-blue">
                                        <Briefcase size={16} className="text-brand-blue" />
                                        Voir toutes les missions
                                    </span>
                                    <ChevronRight size={14} className="text-brand-blue" />
                                </button>
                            </div>
                        </div>

                        {/* Trust notice */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500 flex items-start gap-3">
                            <ShieldCheck size={16} className="text-slate-400 shrink-0 mt-0.5" />
                            <p className="leading-relaxed">
                                Chaque cordiste contactant votre mission a été{' '}
                                <strong>pré-qualifié par nos experts</strong>.
                                Pour toute anomalie ou donnée incorrecte, contactez notre support.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            </div>

            {deletingJobId && (
                <ConfirmDeleteModal
                    onConfirm={() => deleteJob.mutate(deletingJobId)}
                    onCancel={() => setDeletingJobId(null)}
                />
            )}

            {completingJob && (
                <CompleteJobModal
                    job={completingJob}
                    onCancel={() => setCompletingJob(null)}
                    onComplete={(proId, rating, comment) =>
                        completeJob.mutate({ jobId: completingJob.id, proId, rating, comment })
                    }
                />
            )}
        </DashboardLayout>
    );
}
