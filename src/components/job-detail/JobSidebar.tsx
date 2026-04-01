import React from 'react';
import { CalendarDays, Zap, Lock, XCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { UnlockLeadButton } from '../credits/UnlockLeadButton';
import type { Job, Profile } from '../../types';

interface JobSidebarProps {
    job: Job;
    category: string;
    contractTypeLabels: Record<string, string>;
    levelLabels: Record<string, string>;
    structureTypeLabels: Record<string, string>;
    user: any;
    profile: Profile | null;
    isOwner: boolean;
    canViewContact: boolean;
    isFull: boolean;
    unlockCount: number;
    refetchUnlockCount: () => void;
    startConversation: any;
    navigate: (path: string) => void;
}

export const JobSidebar: React.FC<JobSidebarProps> = ({ 
    job, category, contractTypeLabels, levelLabels, structureTypeLabels, 
    user, profile, isOwner, canViewContact, isFull, 
    unlockCount, refetchUnlockCount, startConversation, navigate 
}) => {
    const isPro = profile?.role === 'pro';

    return (
        <div className="space-y-4">
            {/* Mission summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide">
                    Résumé
                </h3>
                <div className="space-y-3 text-sm divide-y divide-slate-50">
                    <div className="flex justify-between pt-0">
                        <span className="text-slate-500">Type</span>
                        <span className="font-bold text-slate-900">
                            {job.type === 'renfort_pro' ? '🚀 Renfort PRO' : '📝 Standard'}
                        </span>
                    </div>
                    <div className="flex justify-between pt-3">
                        <span className="text-slate-500">Catégorie</span>
                        <span className="font-medium text-slate-800 text-right max-w-[60%]">{category}</span>
                    </div>
                    <div className="flex justify-between pt-3">
                        <span className="text-slate-500">Ville</span>
                        <span className="font-medium text-slate-800">{job.location_city}</span>
                    </div>
                    {job.required_level && job.required_level.length > 0 && (
                        <div className="flex justify-between pt-3">
                            <span className="text-slate-500">Niveaux</span>
                            <div className="flex flex-wrap justify-end gap-1 max-w-[60%]">
                                {job.required_level.map(lvl => (
                                    <span key={lvl} className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded font-bold text-slate-600">
                                        {levelLabels[lvl] || lvl}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    {job.type === 'renfort_pro' && job.structure_type && (
                        <div className="flex justify-between pt-3">
                            <span className="text-slate-500">Structure</span>
                            <span className="font-medium text-slate-800">{structureTypeLabels[job.structure_type] || job.structure_type}</span>
                        </div>
                    )}
                    {job.height_meters && (
                        <div className="flex justify-between pt-3">
                            <span className="text-slate-500">Hauteur</span>
                            <span className="font-medium text-slate-800">{job.height_meters}m</span>
                        </div>
                    )}
                    {job.type === 'renfort_pro' && job.duration_days && (
                        <div className="flex justify-between pt-3">
                            <span className="text-slate-500">Durée</span>
                            <span className="font-medium text-slate-800">{job.duration_days} jours</span>
                        </div>
                    )}
                    {(job.budget_min || job.budget_max) && (
                        <div className="flex justify-between pt-3">
                            <span className="text-slate-500">Budget</span>
                            <span className="font-medium text-green-700">
                                {job.budget_min && `${job.budget_min}€`}
                                {job.budget_min && job.budget_max && ' – '}
                                {job.budget_max && `${job.budget_max}€`}
                            </span>
                        </div>
                    )}
                    {job.type === 'renfort_pro' && job.daily_rate && (
                        <div className="flex justify-between pt-3">
                            <span className="text-slate-500">Tarif / jr</span>
                            <span className="font-bold text-brand-blue">{job.daily_rate}€ HT</span>
                        </div>
                    )}
                    {job.type === 'renfort_pro' && job.contract_type && (
                        <div className="flex justify-between pt-3">
                            <span className="text-slate-500">Contrat</span>
                            <span className="font-medium text-slate-800 text-right">{contractTypeLabels[job.contract_type]}</span>
                        </div>
                    )}
                    {job.deadline && (
                        <div className="flex justify-between pt-3">
                            <span className="text-slate-500">Délai</span>
                            <span className="font-medium text-orange-600">
                                {new Date(job.deadline).toLocaleDateString('fr-FR')}
                            </span>
                        </div>
                    )}
                    {job.type === 'renfort_pro' && job.start_date && (
                        <div className="flex justify-between pt-3">
                            <span className="text-slate-500">Début</span>
                            <span className="font-medium text-brand-blue flex items-center gap-1">
                                <CalendarDays size={14} />
                                {new Date(job.start_date).toLocaleDateString('fr-FR')}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Contact CTA */}
            {!(user && (isOwner || profile?.role === 'client')) && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                    <h3 className="font-bold text-slate-900 mb-3">Contacter le client</h3>

                    {canViewContact ? (
                        <div className="space-y-2.5 text-sm">
                            <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg">
                                <span className="font-medium text-slate-700 w-16 shrink-0">Nom</span>
                                <span className="text-slate-900">{job.client_contact_info.name}</span>
                            </div>
                            <a
                                href={`mailto:${job.client_contact_info.email}`}
                                className="flex items-center gap-2 p-2.5 bg-brand-blue/5 text-brand-blue rounded-lg hover:bg-brand-blue/10 transition-colors"
                            >
                                ✉️ {job.client_contact_info.email}
                            </a>
                            <a
                                href={`tel:${job.client_contact_info.phone}`}
                                className="flex items-center justify-center gap-2 w-full p-2.5 bg-brand-blue text-white rounded-lg font-medium hover:bg-brand-blue/90 transition-colors"
                            >
                                📞 {job.client_contact_info.phone}
                            </a>
                            {user?.id !== job.created_by && (
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={async () => {
                                        try {
                                            const conversationId = await startConversation.mutateAsync({
                                                clientId: job.created_by,
                                                jobId: job.id,
                                            });
                                            navigate(`/messages?id=${conversationId}`);
                                        } catch (err) {
                                            console.error('Erreur démarrage conv', err);
                                        }
                                    }}
                                    isLoading={startConversation.isPending}
                                >
                                    💬 Envoyer un message
                                </Button>
                            )}
                        </div>
                    ) : isFull ? (
                        <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
                            <XCircle className="mx-auto text-slate-400 mb-2" size={32} />
                            <h4 className="font-bold text-slate-900 mb-1">Mission saturée</h4>
                            <p className="text-xs text-slate-500">
                                Le quota maximum de 5 professionnels a été atteint pour cette mission.
                            </p>
                        </div>
                    ) : !user ? (
                        <div className="text-center">
                            <Lock className="mx-auto text-slate-300 mb-2" size={28} />
                            <p className="text-xs text-slate-500 mb-3">Créez un compte pour accéder aux coordonnées</p>
                            <div className="space-y-2">
                                <Button variant="primary" className="w-full text-sm" onClick={() => navigate('/register')}>
                                    S'inscrire gratuitement
                                </Button>
                                <Button variant="outline" className="w-full text-sm" onClick={() => navigate('/login')}>
                                    Se connecter
                                </Button>
                            </div>
                        </div>
                    ) : isPro ? (
                        <div>
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-3">
                                <p className="text-xs text-amber-700 font-medium mb-1">🔒 Coordonnées verrouillées</p>
                                <p className="text-xs text-amber-600">
                                    {unlockCount ?? 0}/5 pros ont déjà débloqué ce lead.
                                </p>
                            </div>
                            <UnlockLeadButton 
                                job={job} 
                                onSuccess={() => refetchUnlockCount()}
                            />
                            <div className="mt-3 pt-3 border-t border-slate-100 text-center">
                                <p className="text-xs text-slate-400 mb-2">Besoin de plus de crédits ?</p>
                                <Button variant="outline" className="w-full text-xs" onClick={() => navigate('/credits')}>
                                    <Zap size={13} /> Packs de crédits
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <Lock className="mx-auto text-slate-300 mb-2" size={28} />
                            <p className="text-xs text-slate-500 mb-3">Inscrivez-vous en tant que pro pour débloquer</p>
                            <Button variant="primary" className="w-full text-sm" onClick={() => navigate('/register')}>
                                S'inscrire
                              </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Trust badges — only for pros */}
            {!(user && (isOwner || profile?.role === 'client')) && (
                <div className="bg-green-50 rounded-2xl border border-green-100 p-4">
                    <div className="space-y-2 text-xs text-green-700">
                        <div className="flex items-center gap-2">
                            <CheckCircle size={14} className="shrink-0" />
                            Mission vérifiée par notre équipe
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle size={14} className="shrink-0" />
                            Coordonnées client authentiques
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle size={14} className="shrink-0" />
                            Réponse directe par tél. ou email
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
