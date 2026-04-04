'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    CheckCircle, XCircle, Clock, Users, Briefcase,
    Crown, Calendar, MapPin, BarChart2, FileText, AlertTriangle, 
    Award, Hammer, Mail, Phone, ExternalLink
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardBody } from '../../components/ui/Card';
import type { Job, Profile } from '../../types';

type Tab = 'pending' | 'live' | 'rejected' | 'cancelled' | 'users' | 'leads' | 'stats';

const REJECTION_REASONS = [
    'Informations insuffisantes (description trop vague)',
    'Localisation non précisée',
    'Mission hors périmètre (ne requiert pas de cordiste)',
    'Doublon avec une mission existante',
    'Contact invalide ou manquant',
    'Mission inappropriée ou spam',
    'Budget irréaliste',
    'Autre (voir commentaire)',
];

const categoryLabels: Record<string, string> = {
    cleaning: 'Nettoyage',
    construction: 'Construction',
    masonry: 'Maçonnerie',
    painting: 'Peinture',
    industry: 'Industrie',
    event: 'Événementiel',
    other: 'Autre',
};


interface RejectModalProps {
    job: Job;
    onConfirm: (reason: string) => void;
    onCancel: () => void;
}

const RejectModal: React.FC<RejectModalProps> = ({ job, onConfirm, onCancel }) => {
    const [selected, setSelected] = useState('');
    const [custom, setCustom] = useState('');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Rejeter la mission</h2>
                <p className="text-sm text-slate-500 mb-4">« {job.title} »</p>

                <div className="space-y-2 mb-4">
                    {REJECTION_REASONS.map(reason => (
                        <label key={reason} className="flex items-start gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="reason"
                                value={reason}
                                checked={selected === reason}
                                onChange={() => setSelected(reason)}
                                className="mt-0.5 accent-red-500"
                            />
                            <span className={`text-sm transition-colors ${selected === reason ? 'text-slate-900 font-medium' : 'text-slate-600 group-hover:text-slate-800'}`}>
                                {reason}
                            </span>
                        </label>
                    ))}
                </div>

                {selected === 'Autre (voir commentaire)' && (
                    <textarea
                        value={custom}
                        onChange={e => setCustom(e.target.value)}
                        placeholder="Précisez la raison du rejet..."
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-red-300 mb-4"
                    />
                )}

                <div className="flex gap-3 mt-2">
                    <Button variant="outline" onClick={onCancel} className="flex-1">Annuler</Button>
                    <button
                        disabled={!selected}
                        onClick={() => onConfirm(selected === 'Autre (voir commentaire)' ? custom || selected : selected)}
                        className="flex-1 px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-40 text-sm"
                    >
                        Confirmer le rejet
                    </button>
                </div>
            </div>
        </div>
    );
};

interface ApproveModalProps {
    job: Job;
    onConfirm: (cost: number) => void;
    onCancel: () => void;
}

const ApproveModal: React.FC<ApproveModalProps> = ({ job, onConfirm, onCancel }) => {
    const isMonaco = job.location_city?.toLowerCase().includes('monaco');
    const [selectedCost, setSelectedCost] = useState<number>(isMonaco ? 5 : 1);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Approuver la mission</h2>
                <p className="text-sm text-slate-500 mb-4">« {job.title} »</p>

                <div className="space-y-3 mb-6">
                    <label className="text-sm font-semibold text-slate-700">Coût en crédits pour cette mission :</label>
                    <select
                        value={selectedCost}
                        onChange={(e) => setSelectedCost(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    >
                        <option value={1}>Option 1 : Standard (1 crédit)</option>
                        <option value={3}>Option 2 : Intermédiaire (3 crédits)</option>
                        <option value={5}>Option 3 : Premium / Gros chantiers (5 crédits)</option>
                    </select>
                    {isMonaco && (
                        <p className="text-xs text-brand-blue font-medium bg-brand-blue/10 p-2 rounded-lg">Option 3 (5 crédits) suggérée pour ce gros chantier.</p>
                    )}
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" onClick={onCancel} className="flex-1">Annuler</Button>
                    <button
                        onClick={() => onConfirm(selectedCost)}
                        className="flex-1 px-4 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors text-sm"
                    >
                        Publier
                    </button>
                </div>
            </div>
        </div>
    );
};

interface EditCostModalProps {
    job: Job;
    onConfirm: (cost: number) => void;
    onCancel: () => void;
}

const EditCostModal: React.FC<EditCostModalProps> = ({ job, onConfirm, onCancel }) => {
    const isMonaco = job.location_city?.toLowerCase().includes('monaco');
    const [selectedCost, setSelectedCost] = useState<number>(job.credit_cost || (isMonaco ? 5 : 1));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Modifier le coût (crédits)</h2>
                <p className="text-sm text-slate-500 mb-4">« {job.title} »</p>

                <div className="space-y-3 mb-6">
                    <label className="text-sm font-semibold text-slate-700">Nouveau coût en crédits :</label>
                    <select
                        value={selectedCost}
                        onChange={(e) => setSelectedCost(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    >
                        <option value={1}>Option 1 : Standard (1 crédit)</option>
                        <option value={3}>Option 2 : Intermédiaire (3 crédits)</option>
                        <option value={5}>Option 3 : Premium / Gros chantiers (5 crédits)</option>
                    </select>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" onClick={onCancel} className="flex-1">Annuler</Button>
                    <button
                        onClick={() => onConfirm(selectedCost)}
                        className="flex-1 px-4 py-2 bg-brand-blue text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                        Mettre à jour
                    </button>
                </div>
            </div>
        </div>
    );
};

interface JobRowProps {
    job: Job;
    onApprove?: () => void;
    onReject?: () => void;
    onViewLeads?: () => void;
    onViewDetails?: () => void;
    onEditCost?: () => void;
    showActions?: boolean;
}

const JobRow: React.FC<JobRowProps> = ({ job, onApprove, onReject, onViewLeads, onViewDetails, onEditCost, showActions }) => (
    <div className="p-4 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors bg-white font-sans">
        <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        job.status === 'live' ? 'bg-green-100 text-green-700' :
                        job.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        job.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-600'
                    }`}>
                        {job.status}
                    </span>
                    {job.type === 'renfort_pro' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-blue text-white">
                            Renfort PRO
                        </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-medium">
                        #{job.id.substring(0, 8)}
                    </span>
                </div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-slate-900 truncate">{job.title}</h3>
                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full shrink-0">
                        {categoryLabels[job.category] || job.category}
                    </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1">
                        <MapPin size={12} /> {job.location_city}
                    </span>
                    <span className="flex items-center gap-1">
                        <Calendar size={12} /> {new Date(job.created_at).toLocaleDateString('fr-FR')}
                    </span>
                    {job.height_meters && <span>📏 {job.height_meters}m</span>}
                    {job.budget_min && <span>💶 {job.budget_min}€{job.budget_max ? `–${job.budget_max}€` : '+'}</span>}
                </div>
                <p className="text-sm text-slate-600 mt-1.5 line-clamp-2">{job.description}</p>
                {job.rejection_reason && (
                    <div className="mt-2 text-xs text-red-600 bg-red-50 rounded-lg px-2.5 py-1.5">
                        ❌ Rejet : {job.rejection_reason}
                    </div>
                )}
                
                {onViewLeads && (
                    <div className="mt-4 flex items-center justify-between gap-4 py-2 border-t border-slate-50">
                        <div className="flex items-center gap-2">
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Déblocages : {job.unlocked_leads_count || 0} / 5
                            </span>
                            <div className="flex -space-x-1.5 overflow-hidden">
                                {[...Array(Math.min(job.unlocked_leads_count || 0, 5))].map((_, i) => (
                                    <div key={i} className="inline-block h-4 w-4 rounded-full ring-2 ring-white bg-slate-200" />
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button 
                                onClick={(e) => { e.stopPropagation(); onViewDetails?.(); }} 
                                className="text-[10px] text-brand-blue font-bold hover:underline flex items-center gap-1"
                            >
                                <ExternalLink size={10} /> Voir la fiche mission
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onViewLeads(); }} 
                                className="text-[10px] text-slate-500 font-bold hover:underline"
                            >
                                Voir les déblocages ({job.unlocked_leads_count || 0}) →
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showActions && onApprove && onReject && (
                <div className="flex gap-2 shrink-0">
                    <button
                        onClick={onApprove}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors"
                    >
                        <CheckCircle size={14} /> Approuver
                    </button>
                    <button
                        onClick={onReject}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-600 text-xs font-medium rounded-lg hover:bg-red-200 transition-colors"
                    >
                        <XCircle size={14} /> Rejeter
                    </button>
                </div>
            )}

            {job.status === 'live' && onEditCost && (
                <div className="flex gap-2 shrink-0">
                    <button
                        onClick={onEditCost}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue/10 text-brand-blue text-xs font-medium rounded-lg hover:bg-brand-blue/20 transition-colors"
                    >
                        ✏️ Cout : {job.credit_cost || 1} crédits
                    </button>
                </div>
            )}
        </div>

        <div className="space-y-4 mt-4">
            {/* Contact Client Section (Admin only) */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-100">
                        <Users size={16} className="text-slate-400" />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">Client</p>
                        <p className="text-sm font-bold text-slate-900 leading-none">{job.client_contact_info.name}</p>
                    </div>
                </div>
                <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                <a 
                    href={`mailto:${job.client_contact_info.email}`}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200 hover:border-brand-blue group transition-colors"
                >
                    <Mail size={14} className="text-slate-400 group-hover:text-brand-blue" />
                    <span className="text-xs text-slate-600 group-hover:text-slate-900">{job.client_contact_info.email}</span>
                </a>
                <a 
                    href={`tel:${job.client_contact_info.phone}`}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200 hover:border-brand-blue group transition-colors"
                >
                    <Phone size={14} className="text-slate-400 group-hover:text-brand-blue" />
                    <span className="text-xs text-slate-600 group-hover:text-slate-900 font-medium">{job.client_contact_info.phone}</span>
                </a>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-4">
                    <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                            <FileText size={12} /> Description
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                            "{job.description}"
                        </p>
                    </div>

                    {job.photos_url && job.photos_url.length > 0 && (
                        <div>
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                Photos ({job.photos_url.length})
                            </h4>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {job.photos_url.map((url, idx) => (
                                    <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="shrink-0 hover:opacity-80 transition-opacity">
                                        <img src={url} alt={`Photo ${idx+1}`} className="h-16 w-16 object-cover rounded-lg border border-slate-200 shadow-sm" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {job.type === 'renfort_pro' && (
                    <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-100/50">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-bold text-brand-blue uppercase tracking-widest flex items-center gap-1.5">
                                    <Award size={12} /> Qualifications
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                    {job.required_level?.map(lvl => (
                                        <span key={lvl} className="px-1.5 py-0.5 bg-brand-blue text-white rounded text-[10px] font-bold">
                                            {lvl}
                                        </span>
                                    ))}
                                    {(!job.required_level || job.required_level.length === 0) && (
                                        <span className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                                            <AlertTriangle size={10} /> MANQUE NIVEAU
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-1 pt-1 border-t border-brand-blue/10">
                                    {job.required_habilitations?.map(habil => (
                                        <span key={habil} className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-medium">
                                            {habil}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <Hammer size={12} /> Matériel / Contrat
                                </h4>
                                <p className="text-[10px] text-slate-600 font-medium">
                                    {job.equipment_management?.replace(/_/g, ' ')}
                                </p>
                                <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold">
                                        {job.contract_type}
                                    </span>
                                    <span className="text-[10px] font-bold text-brand-blue">
                                        {job.daily_rate}€ HT
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
);

export function AdminDashboard() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<Tab>('pending');
    const [rejectingJob, setRejectingJob] = useState<Job | null>(null);
    const [approvingJob, setApprovingJob] = useState<Job | null>(null);
    const [editingCostJob, setEditingCostJob] = useState<Job | null>(null);
    const [filterJobId, setFilterJobId] = useState<string | null>(null);

    // Stats
    const { data: stats } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const [usersRes, subsRes, pendingRes, liveRes, rejectedRes, completedRes, cancelledRes, leadsRes] = await Promise.all([
                supabase.from('profiles').select('id', { count: 'exact', head: true }),
                supabase.from('credits').select('pro_id', { count: 'exact', head: true }).gt('balance', 0),
                supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'live'),
                supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
                supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
                supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'cancelled'),
                supabase.from('unlocked_leads').select('id', { count: 'exact', head: true }),
            ]);
            return {
                totalUsers: usersRes.count || 0,
                activePros: subsRes.count || 0,
                pendingJobs: pendingRes.count || 0,
                liveJobs: liveRes.count || 0,
                rejectedJobs: rejectedRes.count || 0,
                completedJobs: completedRes.count || 0,
                cancelledJobs: cancelledRes.count || 0,
                totalLeads: leadsRes.count || 0,
                totalJobs: (pendingRes.count || 0) + (liveRes.count || 0) + (rejectedRes.count || 0) + (completedRes.count || 0) + (cancelledRes.count || 0),
            };
        },
    });

    const { data: leadActivations, error: leadError } = useQuery({
        queryKey: ['admin-lead-activations'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('unlocked_leads')
                .select(`
                    id,
                    unlocked_at,
                    job:job_id (
                        id,
                        title,
                        created_by,
                        client:profiles!created_by (full_name, email)
                    ),
                    pro:pro_id (id, full_name, email)
                `)
                .order('unlocked_at', { ascending: false })
                .limit(100);

            if (error) {
                console.error('Error fetching leads:', error);
                throw error;
            }
            return data as any[];
        },
        enabled: activeTab === 'leads',
    });

    // Jobs by status
    const fetchJobs = (status: string) => ({
        queryKey: ['admin-jobs', status],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('jobs')
                .select('*, unlocked_leads_count:unlocked_leads(count)')
                .eq('status', status)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return ((data as any[]) || []).map((j: any) => ({
                ...j,
                unlocked_leads_count: j.unlocked_leads_count?.[0]?.count || 0
            })) as any[];
        },
    });

    const { data: pendingJobs, isLoading: loadingPending } = useQuery(fetchJobs('pending'));
    const { data: liveJobs, isLoading: loadingLive } = useQuery(fetchJobs('live'));
    const { data: rejectedJobs, isLoading: loadingRejected } = useQuery(fetchJobs('rejected'));
    const { data: cancelledJobs, isLoading: loadingCancelled } = useQuery(fetchJobs('cancelled'));

    // Users
    const { data: users } = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const { data, error } = await (supabase as any)
                .from('profiles')
                .select('id, email, full_name, role, created_at')
                .order('created_at', { ascending: false })
                .limit(50);
            if (error) throw error;
            return data as Profile[];
        },
    });

    const approveJob = useMutation({
        mutationFn: async ({ jobId, creditCost }: { jobId: string; creditCost: number }) => {
            const { error } = await (supabase as any).from('jobs')
                .update({ status: 'live', moderated_at: new Date().toISOString(), credit_cost: creditCost })
                .eq('id', jobId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            setApprovingJob(null);
        },
    });

    const editJobCost = useMutation({
        mutationFn: async ({ jobId, creditCost }: { jobId: string; creditCost: number }) => {
            const { error } = await (supabase as any).from('jobs')
                .update({ credit_cost: creditCost })
                .eq('id', jobId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
            setEditingCostJob(null);
        },
    });

    const rejectJob = useMutation({
        mutationFn: async ({ jobId, reason }: { jobId: string; reason: string }) => {
            const { error } = await (supabase as any).from('jobs')
                .update({ status: 'rejected', rejection_reason: reason, moderated_at: new Date().toISOString() })
                .eq('id', jobId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            setRejectingJob(null);
        },
    });

    const tabs: { id: Tab; label: string; count?: number; icon: React.FC<any> }[] = [
        { id: 'pending', label: 'En attente', count: stats?.pendingJobs, icon: Clock },
        { id: 'live', label: 'En ligne', count: stats?.liveJobs, icon: CheckCircle },
        { id: 'rejected', label: 'Refusées', count: stats?.rejectedJobs, icon: XCircle },
        { id: 'cancelled', label: 'Annulées', count: stats?.cancelledJobs, icon: XCircle },
        { id: 'users', label: 'Utilisateurs', count: stats?.totalUsers, icon: Users },
        { id: 'leads', label: 'Leads', count: stats?.totalLeads, icon: BarChart2 },
        { id: 'stats', label: 'Statistiques', icon: BarChart2 },
    ];

    const statsCards = [
        { label: 'Utilisateurs', value: stats?.totalUsers || 0, icon: Users, color: 'bg-blue-100 text-blue-600' },
        { label: 'Leads actifs', value: stats?.totalLeads || 0, icon: BarChart2, color: 'bg-amber-100 text-amber-600' },
        { label: 'Pros avec crédits', value: stats?.activePros || 0, icon: Crown, color: 'bg-purple-100 text-purple-600' },
        { label: 'En attente', value: stats?.pendingJobs || 0, icon: Clock, color: 'bg-yellow-100 text-yellow-600' },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Administration</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Gestion des missions et des utilisateurs</p>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {statsCards.map(stat => (
                        <Card key={stat.label}>
                            <CardBody className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-slate-500">{stat.label}</p>
                                        <p className="text-2xl font-bold text-slate-900 mt-0.5">{stat.value}</p>
                                    </div>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                                        <stat.icon size={20} />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 gap-1 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors -mb-px ${
                                activeTab === tab.id
                                    ? 'border-brand-blue text-brand-blue'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <tab.icon size={15} />
                            {tab.label}
                            {tab.count !== undefined && (
                                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${
                                    activeTab === tab.id ? 'bg-brand-blue text-white' : 'bg-slate-100 text-slate-600'
                                }`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                <div>
                    {/* PENDING */}
                    {activeTab === 'pending' && (
                        <div className="space-y-3">
                            {loadingPending && <div className="text-center py-10 text-slate-500">Chargement…</div>}
                            {!loadingPending && (!pendingJobs || pendingJobs.length === 0) && (
                                <div className="text-center py-12 bg-white rounded-xl border border-slate-100">
                                    <CheckCircle className="mx-auto text-green-400 mb-3" size={40} />
                                    <p className="text-slate-600 font-medium">Aucune mission en attente 🎉</p>
                                    <p className="text-slate-400 text-sm mt-1">Toutes les missions ont été traitées.</p>
                                </div>
                            )}
                            {pendingJobs?.map(job => (
                                <JobRow
                                    key={job.id}
                                    job={job}
                                    showActions
                                    onApprove={() => setApprovingJob(job)}
                                    onReject={() => setRejectingJob(job)}
                                    onViewDetails={() => router.push(`/jobs/${job.slug}`)}
                                    onViewLeads={() => {
                                        setFilterJobId(job.id);
                                        setActiveTab('leads');
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {/* LIVE */}
                    {activeTab === 'live' && (
                        <div className="space-y-3">
                            {loadingLive && <div className="text-center py-10 text-slate-500">Chargement…</div>}
                            {liveJobs?.map(job => (
                                <JobRow
                                    key={job.id}
                                    job={job}
                                    showActions={false}
                                    onEditCost={() => setEditingCostJob(job)}
                                    onViewDetails={() => router.push(`/jobs/${job.slug}`)}
                                    onViewLeads={() => {
                                        setFilterJobId(job.id);
                                        setActiveTab('leads');
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {/* REJECTED */}
                    {activeTab === 'rejected' && (
                        <div className="space-y-3">
                            {loadingRejected && <div className="text-center py-10 text-slate-500">Chargement…</div>}
                            {rejectedJobs?.map(job => (
                                <JobRow
                                    key={job.id}
                                    job={job}
                                    showActions
                                    onApprove={() => setApprovingJob(job)}
                                    onReject={() => setRejectingJob(job)}
                                    onViewDetails={() => router.push(`/jobs/${job.slug}`)}
                                    onViewLeads={() => {
                                        setFilterJobId(job.id);
                                        setActiveTab('leads');
                                    }}
                                />
                            ))}
                            {!loadingRejected && (!rejectedJobs || rejectedJobs.length === 0) && (
                                <div className="text-center py-12 bg-white rounded-xl border border-slate-100">
                                    <p className="text-slate-500">Aucune mission rejetée.</p>
                                </div>
                            )}
                        </div>
                    )}
                    {/* CANCELLED */}
                    {activeTab === 'cancelled' && (
                        <div className="space-y-3">
                            {loadingCancelled && <div className="text-center py-10 text-slate-500">Chargement…</div>}
                            {cancelledJobs?.map(job => (
                                <JobRow
                                    key={job.id}
                                    job={job}
                                    showActions={false}
                                    onViewDetails={() => router.push(`/jobs/${job.slug}`)}
                                    onViewLeads={() => {
                                        setFilterJobId(job.id);
                                        setActiveTab('leads');
                                    }}
                                />
                            ))}
                            {!loadingCancelled && (!cancelledJobs || cancelledJobs.length === 0) && (
                                <div className="text-center py-12 bg-white rounded-xl border border-slate-100">
                                    <p className="text-slate-500">Aucune mission annulée par le client.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* USERS */}
                    {activeTab === 'users' && (
                        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            {['Nom', 'Email', 'Rôle', 'Inscrit le'].map(h => (
                                                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {users?.map(user => (
                                            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3 font-medium text-slate-900">
                                                    {user.full_name || <span className="text-slate-400 italic">–</span>}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">{user.email}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                        user.role === 'admin' ? 'bg-red-100 text-red-700' :
                                                        user.role === 'pro' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-slate-100 text-slate-600'
                                                    }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-500">
                                                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* LEADS */}
                    {activeTab === 'leads' && (
                        <div className="space-y-4">
                            {leadError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                    Erreur lors du chargement des leads : {(leadError as any).message}
                                </div>
                            )}
                            {filterJobId && (
                                <div className="flex items-center justify-between bg-blue-50 border border-blue-100 px-4 py-2 rounded-lg">
                                    <div className="text-sm text-blue-800">
                                        Filtré par mission : <span className="font-bold">{leadActivations?.find(l => l.job?.id === filterJobId)?.job?.title || filterJobId}</span>
                                    </div>
                                    <button
                                        onClick={() => setFilterJobId(null)}
                                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
                                    >
                                        Effacer le filtre
                                    </button>
                                </div>
                            )}
                            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50 border-b border-slate-100">
                                            <tr>
                                                {['Mission', 'Professionnel', 'Client', 'Date'].map(h => (
                                                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {leadActivations
                                                ?.filter(lead => !filterJobId || lead.job?.id === filterJobId)
                                                .map(lead => (
                                                    <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-4 py-3">
                                                            <div className="font-medium text-slate-900">{lead.job?.title}</div>
                                                            <div className="text-[10px] text-slate-400 font-mono">{lead.job?.id}</div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="font-medium text-slate-700">{lead.pro?.full_name || lead.pro?.email}</div>
                                                            <div className="text-[10px] text-slate-400">{lead.pro?.email}</div>
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-600">
                                                            <div className="text-slate-700">{lead.job?.client?.full_name || lead.job?.client?.email}</div>
                                                            <div className="text-[10px] text-slate-400">{lead.job?.client?.email}</div>
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-500">
                                                            {new Date(lead.unlocked_at).toLocaleString('fr-FR', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STATS */}
                    {activeTab === 'stats' && (
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl border border-slate-100 p-5">
                                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Briefcase size={18} className="text-brand-blue" />
                                    Missions
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Total', value: stats?.totalJobs || 0, color: 'bg-slate-200' },
                                        { label: 'En ligne ✅', value: stats?.liveJobs || 0, color: 'bg-green-400' },
                                        { label: 'En attente ⏳', value: stats?.pendingJobs || 0, color: 'bg-yellow-400' },
                                        { label: 'Refusées ❌', value: stats?.rejectedJobs || 0, color: 'bg-red-400' },
                                        { label: 'Terminées ✓', value: stats?.completedJobs || 0, color: 'bg-blue-400' },
                                    ].map(item => (
                                        <div key={item.label}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-slate-600">{item.label}</span>
                                                <span className="font-bold text-slate-900">{item.value}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-1.5">
                                                <div
                                                    className={`h-1.5 rounded-full ${item.color}`}
                                                    style={{ width: `${stats?.totalJobs ? (item.value / stats.totalJobs) * 100 : 0}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-slate-100 p-5">
                                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Users size={18} className="text-brand-blue" />
                                    Utilisateurs
                                </h3>
                                <div className="space-y-4 text-sm">
                                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                        <span className="text-slate-600">Total inscrits</span>
                                        <span className="text-2xl font-bold text-slate-900">{stats?.totalUsers || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                        <span className="text-slate-600">Pros avec crédits</span>
                                        <span className="text-2xl font-bold text-purple-700">{stats?.activePros || 0}</span>
                                    </div>
                                    <div className="p-3 bg-green-50 rounded-lg">
                                        <p className="text-slate-600 mb-0.5">Taux de conversion</p>
                                        <p className="text-xl font-bold text-green-700">
                                            {stats?.totalUsers
                                                ? `${Math.round(((stats.activePros || 0) / stats.totalUsers) * 100)}%`
                                                : '–'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Rejection modal */}
            {rejectingJob && (
                <RejectModal
                    job={rejectingJob}
                    onConfirm={(reason) => rejectJob.mutate({ jobId: rejectingJob.id, reason })}
                    onCancel={() => setRejectingJob(null)}
                />
            )}

            {/* Approval modal */}
            {approvingJob && (
                <ApproveModal
                    job={approvingJob}
                    onConfirm={(cost) => approveJob.mutate({ jobId: approvingJob.id, creditCost: cost })}
                    onCancel={() => setApprovingJob(null)}
                />
            )}

            {/* Edit Cost modal */}
            {editingCostJob && (
                <EditCostModal
                    job={editingCostJob}
                    onConfirm={(cost) => editJobCost.mutate({ jobId: editingCostJob.id, creditCost: cost })}
                    onCancel={() => setEditingCostJob(null)}
                />
            )}
        </DashboardLayout>
    );
}
