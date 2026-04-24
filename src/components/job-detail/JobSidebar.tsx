import React from 'react';
import { Zap, Lock, XCircle, CheckCircle, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { UnlockLeadButton } from '../credits/UnlockLeadButton';
import { LeadQualityBadge } from './LeadQualityBadge';
import type { Job, Profile } from '../../types';
import { getLeadQuality } from '../../lib/missionEnrichment';

interface JobSidebarProps {
    job: Job;
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
    job, user, profile, isOwner, canViewContact, isFull,
    unlockCount, refetchUnlockCount, startConversation, navigate
}) => {
    const isPro = profile?.role === 'pro';
    const showProSurface = !(user && (isOwner || profile?.role === 'client'));

    const quality = getLeadQuality(job);

    return (
        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            {/* Lead Quality — detailed view (only for pros, pre-unlock) */}
            {showProSurface && !canViewContact && (
                <LeadQualityBadge quality={quality} variant="detailed" />
            )}

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

            {/* 72h credit-back guarantee — strong promise for pros */}
            {showProSurface && (
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 p-4">
                    <div className="flex items-start gap-2.5 mb-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                            <ShieldCheck size={16} className="text-emerald-700" />
                        </div>
                        <div>
                            <p className="font-black text-emerald-900 text-sm leading-tight">Garantie 72h satisfait ou recrédité</p>
                            <p className="text-[11px] text-emerald-700 mt-0.5">
                                On assume le risque qualité à ta place.
                            </p>
                        </div>
                    </div>
                    <div className="space-y-1.5 text-xs text-emerald-800 pl-10">
                        <div className="flex items-start gap-1.5">
                            <CheckCircle size={12} className="shrink-0 mt-0.5 text-emerald-600" />
                            <span>Client injoignable sous 72h → crédit recrédité</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                            <CheckCircle size={12} className="shrink-0 mt-0.5 text-emerald-600" />
                            <span>Données frauduleuses → crédit recrédité</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
