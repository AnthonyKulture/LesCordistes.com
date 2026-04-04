'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
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
} from 'lucide-react';
import type { Job } from '../../types';

export function ClientDashboard() {
    const router = useRouter();
    const { mode } = useDashboardMode();
    const { user } = useAuth();
    const toast = useToast();
    const queryClient = useQueryClient();
    const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
    const [completingJob, setCompletingJob] = useState<Job | null>(null);

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
            queryClient.invalidateQueries({ queryKey: [ 'client-jobs'] });
            setDeletingJobId(null);
            toast.success('Mission annulée avec succès.');
        },
        onError: (err) => {
            toast.error('Erreur lors de l’annulation de la mission.');
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
        if (!jobs) return { total: 0, pending: 0, live: 0, completed: 0 };
        return {
            total: jobs.length,
            pending: jobs.filter(j => j.status === 'pending').length,
            live: jobs.filter(j => j.status === 'live').length,
            completed: jobs.filter(j => j.status === 'completed').length,
        };
    }, [jobs]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Tableau de bord Client</h1>
                        <p className="text-slate-600 mt-1">Gérez vos missions postées</p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => router.push(mode === 'recruiter' ? '/post-job?type=renfort_pro' : '/post-job')}
                        className="flex items-center gap-2"
                    >
                        <Plus size={20} />
                        {mode === 'recruiter' ? 'Publier un projet' : 'Nouvelle mission'}
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Total missions" value={stats.total} icon={Briefcase} iconBg="bg-blue-100" iconColor="text-blue-600" />
                    <StatCard label="En attente" value={stats.pending} icon={Clock} iconBg="bg-yellow-100" iconColor="text-yellow-600" />
                    <StatCard label="Publiées" value={stats.live} icon={CheckCircle} iconBg="bg-green-100" iconColor="text-green-600" />
                    <StatCard label="Terminées" value={stats.completed} icon={CheckCircle} iconBg="bg-slate-100" iconColor="text-slate-600" />
                </div>

                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-bold text-slate-900">Mes missions</h2>
                    </CardHeader>
                    <CardBody>
                        {isLoading ? (
                            <div className="text-center py-8 text-slate-600">Chargement...</div>
                        ) : jobs && jobs.length > 0 ? (
                            <div className="space-y-4">
                                {jobs.map((job) => (
                                    <JobListItem
                                        key={job.id}
                                        job={job as any}
                                        onView={() => job.slug ? router.push(`/jobs/${job.slug}`) : toast.info('Cette mission est en cours de publication.')}
                                        onDelete={() => setDeletingJobId(job.id)}
                                        onComplete={() => setCompletingJob(job)}
                                        showUnlockers={<JobUnlockers jobId={job.id} />}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Briefcase className="mx-auto text-slate-300 mb-4" size={48} />
                                <p className="text-slate-600 mb-4">Vous n'avez pas encore posté de mission</p>
                                <Button variant="primary" onClick={() => router.push('/post-job')}>
                                    Poster ma première mission
                                </Button>
                            </div>
                        )}
                    </CardBody>
                </Card>
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
