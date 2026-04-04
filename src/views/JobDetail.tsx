'use client'

import React from 'react';
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowLeft, Clock, XCircle, CheckCircle, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useCredits } from '../hooks/useCredits';
import { useMessaging } from '../hooks/useMessaging';
import type { Job } from '../types';

// Extracted Components
import { JobHeader } from '../components/job-detail/JobHeader';
import { JobDescription } from '../components/job-detail/JobDescription';
import { JobPhotos } from '../components/job-detail/JobPhotos';
import { TechnicalSpecs } from '../components/job-detail/TechnicalSpecs';
import { JobSidebar } from '../components/job-detail/JobSidebar';

const categoryLabels: Record<string, string> = {
    cleaning: '🧹 Nettoyage de façade',
    construction: '🏗️ Construction',
    masonry: '🧱 Maçonnerie',
    painting: '🎨 Peinture',
    industry: '⚙️ Industrie',
    event: '🎪 Événementiel',
    other: 'Autre',
};

const contractTypeLabels: Record<string, string> = {
    subcontracting: '🏢 Sous-traitance (B2B)',
    freelance: '👤 Freelance / Vacation',
};

const levelLabels: Record<string, string> = {
    cqp1: 'CQP 1',
    cqp2: 'CQP 2',
    irata1: 'IRATA 1',
    irata2: 'IRATA 2',
    irata3: 'IRATA 3',
};

const habilitationLabels: Record<string, string> = {
    electric: '⚡ Électrique',
    nuclear: '☢️ Nucléaire',
    asbestos: '😷 Amiante',
    chemical: '🧪 Risques Chimiques',
    sst: '⛑️ SST',
};

const structureTypeLabels: Record<string, string> = {
    habitat_residentiel: '🏠 Habitat & Résidentiel',
    tertiaire_bureaux: '🏢 Tertiaire & Bureaux',
    industrie_energie: '⚙️ Industrie & Énergie',
    genie_civil_ouvrages: '🏗️ Génie Civil & Ouvrages',
    milieu_naturel_parois: '🧗 Milieu Naturel & Parois',
    evenementiel_spectacle: '🎪 Événementiel & Spectacle',
};

const clientTypeLabels: Record<string, string> = {
    particulier: '🏡 Particulier',
    copropriete_syndic: '🏢 Copropriété & Syndic',
    entreprise_tertiaire: '💼 Entreprise & Tertiaire',
    industrie_energie: '⚙️ Industrie & Énergie',
    collectivite_public: '🏛️ Collectivité & Public',
    association_evenementiel: '🎪 Association & Événementiel',
    entreprise_travaux_hauteur: '🏗️ Société de travaux en hauteur',
    entreprise_btp: '👷 Entreprise du BTP / Génie Civil',
    agence_interim: '🏢 Agence d\'intérim spécialisée',
    autre_pro: '🤝 Autre professionnel',
};

const tradeLabels: Record<string, string> = {
    masonry: '🧱 Maçonnerie',
    painting: '🎨 Peinture',
    cleaning: '🧹 Nettoyage haute pression',
    welding: '🔥 Soudure',
    nets: '🥅 Pose de filets',
    lifelines: '🧗 Pose de lignes de vie',
};

export const JobDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useRouter();
    const { user, profile } = useAuth();
    const { isJobUnlocked } = useCredits();
    const { startConversation } = useMessaging();

    const { data: job, isLoading, error } = useQuery({
        queryKey: ['job', slug],
        queryFn: async () => {
            if (!slug) throw new Error('No slug');
            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .eq('slug', slug)
                .single();
            if (error) throw error;
            return data as Job;
        },
        enabled: !!slug,
    });

    const { data: unlockCount, refetch: refetchUnlockCount } = useQuery({
        queryKey: ['job-unlock-count', job?.id],
        queryFn: async () => {
            if (!job?.id) return 0;
            const { count, error } = await supabase
                .from('unlocked_leads')
                .select('*', { count: 'exact', head: true })
                .eq('job_id', job.id);
            if (error) throw error;
            return count || 0;
        },
        enabled: !!job?.id,
    });

    // Determine if the job should be visible to the current user
    const isAdmin = profile?.role === 'admin';
    const isOwner = user && job && user.id === job.created_by;
    const isLive = job?.status === 'live';
    const isVisible = isLive || isOwner || isAdmin;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue" />
            </div>
        );
    }

    if (error || !job || !isVisible) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <AlertTriangle className="mx-auto text-yellow-500 mb-4" size={48} />
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Mission introuvable</h1>
                    <p className="text-slate-600 mb-6">Cette mission n'existe pas ou n'est plus disponible.</p>
                    <Button variant="primary" onClick={() => router.push('/jobs')}>Voir toutes les missions</Button>
                </div>
            </div>
        );
    }

    const category = categoryLabels[job.category] || job.category;
    const clientType = job.client_type ? clientTypeLabels[job.client_type] : null;

    // Pro with sub OR credit-unlocked lead
    const isUnlocked = job.id ? isJobUnlocked(job.id) : false;
    const canViewContact = user && (isOwner || isUnlocked || isAdmin);
    const isFull = !isUnlocked && (unlockCount ?? 0) >= 5;

    return (
        <>
            

            <div className="min-h-screen bg-slate-50">
                <div className="container max-w-5xl py-6">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-400 mb-5">
                        <Link href="/" className="hover:text-brand-blue">Accueil</Link>
                        <ChevronRight size={14} />
                        <Link 
                            href={isOwner || profile?.role === 'client' ? "/dashboard" : "/jobs"}
                            className="hover:text-brand-blue"
                        >
                            {isOwner || profile?.role === 'client' ? "Tableau de bord" : "Missions"}
                        </Link>
                        <ChevronRight size={14} />
                        <span className="text-slate-700 font-medium truncate max-w-[150px] sm:max-w-xs">{job.title}</span>
                    </nav>

                    <button
                        onClick={() => router.push(isOwner || profile?.role === 'client' ? '/dashboard' : '/jobs')}
                        className="flex items-center gap-2 text-slate-500 hover:text-brand-blue mb-5 transition-colors text-sm"
                    >
                        <ArrowLeft size={16} /> {isOwner || profile?.role === 'client' ? 'Retour au tableau de bord' : 'Retour aux missions'}
                    </button>

                    {/* Owner Status Banner */}
                    {isOwner && !isLive && (
                        <div className={`mb-6 p-4 rounded-2xl border flex items-center gap-4 ${
                            job.status === 'pending' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                            job.status === 'rejected' ? 'bg-red-50 border-red-200 text-red-800' :
                            'bg-slate-100 border-slate-200 text-slate-700'
                        }`}>
                            <div className={`p-2 rounded-full ${
                                job.status === 'pending' ? 'bg-yellow-200/50' :
                                job.status === 'rejected' ? 'bg-red-200/50' :
                                'bg-slate-200/50'
                            }`}>
                                {job.status === 'pending' ? <Clock size={20} /> :
                                 job.status === 'rejected' ? <XCircle size={20} /> :
                                 <CheckCircle size={20} />}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-sm uppercase tracking-wide">
                                    {job.status === 'pending' ? 'Mission en attente de validation' :
                                     job.status === 'rejected' ? 'Mission refusée' :
                                     'Mission terminée'}
                                </h4>
                                <p className="text-sm opacity-90">
                                    {job.status === 'pending' ? 'Votre annonce est en cours de relecture par notre équipe. Elle sera publiée sous 24h.' :
                                     job.status === 'rejected' ? `Cette annonce n'a pas été acceptée. ${job.rejection_reason ? `Motif : ${job.rejection_reason}` : ''}` :
                                     'Cette mission est désormais close et n\'est plus visible par les cordistes.'}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* LEFT — Main content */}
                        <div className="lg:col-span-2 space-y-5">
                            <JobHeader 
                                job={job} 
                                category={category} 
                                clientType={clientType} 
                            />
                            <JobDescription description={job.description} />
                            <JobPhotos photos={job.photos_url || []} isLocked={!canViewContact} />
                            <TechnicalSpecs 
                                job={job} 
                                levelLabels={levelLabels} 
                                habilitationLabels={habilitationLabels} 
                                tradeLabels={tradeLabels} 
                            />
                        </div>

                        {/* RIGHT — Sidebar */}
                        <JobSidebar 
                            job={job}
                            category={category}
                            contractTypeLabels={contractTypeLabels}
                            levelLabels={levelLabels}
                            structureTypeLabels={structureTypeLabels}
                            user={user}
                            profile={profile}
                            isOwner={!!isOwner}
                            canViewContact={!!canViewContact}
                            isFull={isFull}
                            unlockCount={unlockCount || 0}
                            refetchUnlockCount={refetchUnlockCount}
                            startConversation={startConversation}
                            navigate={navigate}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};
