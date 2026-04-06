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
import {
    Briefcase,
    Clock,
    CheckCircle,
    Plus,
    ArrowRight,
    ChevronRight,
    MessageCircle,
    Users,
    Zap,
    ShieldCheck,
} from 'lucide-react';
import type { Job } from '../../types';

export function ClientDashboard() {
    const router = useRouter();
    const { mode } = useDashboardMode();
    const { user, profile } = useAuth();
    const toast = useToast();
    const supabase = createSupabaseBrowserClient();
    const queryClient = useQueryClient();
    const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
    const [completingJob, setCompletingJob] = useState<Job | null>(null);

    const isProRecruiter = profile?.role === 'pro' && mode === 'recruiter';

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
            toast.error('Erreur lors de l\'annulation de la mission.');
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
        if (!jobs) return { live: 0, pending: 0, completed: 0 };
        return {
            live: jobs.filter(j => j.status === 'live').length,
            pending: jobs.filter(j => j.status === 'pending').length,
            completed: jobs.filter(j => j.status === 'completed').length,
        };
    }, [jobs]);

    const firstName = profile?.full_name?.split(' ')[0] || (isProRecruiter ? 'Pro' : 'Client');

    const postJobPath = isProRecruiter ? '/post-job?type=renfort_pro' : '/post-job';

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Bonjour {firstName} 👋
                        </h1>
                        <p className="text-slate-500 text-sm mt-0.5">
                            {isProRecruiter ? 'Mode Recruteur — gérez vos demandes de renfort' : 'Tableau de bord — gérez vos missions'}
                        </p>
                    </div>
                </div>

                {/* CTA Banner */}
                <div className="bg-gradient-to-r from-brand-blue to-blue-700 rounded-2xl p-5 text-white">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <Users size={24} className="text-white" />
                            </div>
                            <div>
                                <p className="font-bold">
                                    {isProRecruiter ? 'Besoin de renforts ?' : 'Trouvez vos cordistes !'}
                                </p>
                                <p className="text-sm text-blue-100">
                                    {isProRecruiter
                                        ? 'Publiez une demande de renfort et recevez des candidatures qualifiées.'
                                        : 'Publiez votre mission et recevez des devis de cordistes certifiés.'}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="secondary"
                            onClick={() => router.push(postJobPath)}
                            className="bg-white text-brand-blue hover:bg-blue-50 shrink-0 font-black"
                        >
                            <Plus size={16} />
                            {isProRecruiter ? 'Demander du renfort' : 'Poster une mission'}
                            <ArrowRight size={16} />
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <StatCard
                        label="Publiées"
                        value={stats.live}
                        icon={CheckCircle}
                        iconBg="bg-green-100"
                        iconColor="text-green-600"
                        onClick={() => {}}
                    />
                    <StatCard
                        label="En attente"
                        value={stats.pending}
                        icon={Clock}
                        iconBg="bg-yellow-100"
                        iconColor="text-yellow-600"
                        onClick={() => {}}
                    />
                    <StatCard
                        label="Terminées"
                        value={stats.completed}
                        icon={Briefcase}
                        iconBg="bg-brand-blue/10"
                        iconColor="text-brand-blue"
                        onClick={() => {}}
                    />
                </div>

                {/* Main grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left column — missions list */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                                    <Briefcase size={18} className="text-brand-blue" />
                                    {isProRecruiter ? 'Mes demandes de renfort' : 'Mes missions postées'}
                                </h2>
                                {jobs && jobs.length > 0 && (
                                    <span className="text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
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
                                                onView={() => job.slug
                                                    ? router.push(`/jobs/${job.slug}`)
                                                    : toast.info('Cette mission est en cours de publication.')
                                                }
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
                                            ? 'Publiez votre première demande pour trouver des renforts qualifiés.'
                                            : 'Publiez votre première mission et recevez des devis rapidement.'}
                                    </p>
                                    <Button
                                        variant="primary"
                                        onClick={() => router.push(postJobPath)}
                                        className="shadow-lg shadow-brand-blue/20"
                                    >
                                        <Plus size={16} />
                                        {isProRecruiter ? 'Demander du renfort' : 'Poster une mission'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right sidebar */}
                    <div className="space-y-6">
                        {/* Quick actions */}
                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Zap size={18} className="text-brand-blue" />
                                Actions rapides
                            </h3>
                            <div className="space-y-2 text-sm">
                                <button
                                    onClick={() => router.push(postJobPath)}
                                    className="w-full flex items-center justify-between p-3 rounded-lg border border-brand-blue/10 bg-brand-blue/5 hover:bg-brand-blue/10 transition-colors"
                                >
                                    <span className="flex items-center gap-3 font-bold text-brand-blue">
                                        <Plus size={16} className="text-brand-blue" />
                                        {isProRecruiter ? 'Nouvelle demande de renfort' : 'Poster une mission'}
                                    </span>
                                    <ChevronRight size={14} className="text-brand-blue" />
                                </button>
                                <button
                                    onClick={() => router.push('/messages')}
                                    className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-50 bg-slate-50/50 hover:bg-slate-100 transition-colors"
                                >
                                    <span className="flex items-center gap-3 font-medium text-slate-700">
                                        <MessageCircle size={16} className="text-slate-400" /> Messagerie
                                    </span>
                                    <ChevronRight size={14} className="text-slate-300" />
                                </button>
                                <button
                                    onClick={() => router.push('/profile')}
                                    className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-50 bg-slate-50/50 hover:bg-slate-100 transition-colors"
                                >
                                    <span className="flex items-center gap-3 font-medium text-slate-700">
                                        <ShieldCheck size={16} className="text-slate-400" />
                                        {isProRecruiter ? 'Mon profil pro' : 'Mon compte'}
                                    </span>
                                    <ChevronRight size={14} className="text-slate-300" />
                                </button>
                            </div>
                        </div>

                        {/* Info notice */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500 flex items-start gap-3">
                            <ShieldCheck size={16} className="text-slate-400 shrink-0 mt-0.5" />
                            <p className="leading-relaxed">
                                {isProRecruiter
                                    ? <>Vos demandes de renfort sont <strong>visibles par des cordistes certifiés</strong>. Les candidats vous contactent directement après avoir débloqué vos coordonnées.</>
                                    : <>Vos missions sont <strong>pré-qualifiées</strong> par notre équipe avant publication. Des cordistes certifiés pourront vous contacter pour établir un devis.</>
                                }
                            </p>
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
