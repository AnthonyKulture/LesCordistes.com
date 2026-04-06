'use client'

import React, { useState, useEffect } from 'react';
import { User, CheckCircle, ArrowRight, Mail, Phone, UserCircle, ChevronLeft, ShieldCheck, Check, Building2 } from 'lucide-react';
import Link from 'next/link';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { GoogleSignInButton } from '../GoogleSignInButton';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/Toast';
import { useAuth } from '../../contexts/AuthContext';
import type { JobFormData } from '../../types';

interface Step5Props {
    data: Partial<JobFormData>;
    updateData: (data: Partial<JobFormData>) => void;
    onSubmit: (isNewUser?: boolean, userId?: string) => void;
    onBack?: () => void;
    isSubmitting: boolean;
}

export const Step5Contact: React.FC<Step5Props> = ({ data, updateData, onSubmit, isSubmitting, onBack }) => {
    const { user, profile } = useAuth();
    const toast = useToast();
    const [authLoading, setAuthLoading] = useState(false);
    const [needsConfirmation, setNeedsConfirmation] = useState(false);
    const [pendingSubmit, setPendingSubmit] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [showManualLogin, setShowManualLogin] = useState(false);
    const [manualPassword, setManualPassword] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const isRenfort = data.type === 'renfort_pro';

    // Auto-submit when email confirmed in another tab
    useEffect(() => {
        if (needsConfirmation && user && !pendingSubmit) {
            setPendingSubmit(true);
            onSubmit(true, user.id);
        }
    }, [user, needsConfirmation]);

    // Auto-fill contact info from profile when logged in
    useEffect(() => {
        if (user && profile) {
            const updates: Partial<JobFormData> = {};
            if (!data.contact_first_name && profile.first_name) updates.contact_first_name = profile.first_name;
            if (!data.contact_last_name && profile.last_name) updates.contact_last_name = profile.last_name;
            if (!data.contact_first_name && !data.contact_last_name && profile.full_name) {
                const parts = profile.full_name.split(' ');
                updates.contact_first_name = parts[0] || '';
                updates.contact_last_name = parts.slice(1).join(' ') || '';
            }
            if (!data.contact_email && (profile.email || user.email)) updates.contact_email = profile.email || user.email || '';
            if (!data.contact_phone && profile.phone) updates.contact_phone = profile.phone;
            if (Object.keys(updates).length > 0) updateData(updates);
        }
    }, [user, profile]);

    const validateContact = () => {
        const newErrors: Record<string, string> = {};
        if (!data.contact_first_name?.trim()) newErrors.contact_first_name = 'Le prénom est requis';
        if (!data.contact_last_name?.trim()) newErrors.contact_last_name = 'Le nom est requis';
        if (isRenfort && !data.is_auto_entrepreneur && !data.contact_company_name?.trim()) {
            newErrors.contact_company_name = 'La dénomination commerciale est requise';
        }
        if (!data.contact_email?.trim()) {
            newErrors.contact_email = 'L\'email est requis';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact_email)) {
            newErrors.contact_email = 'Email invalide';
        }
        if (!data.contact_phone?.trim()) {
            newErrors.contact_phone = 'Le téléphone est requis';
        } else if (!/^[\d\s+()-]{10,}$/.test(data.contact_phone)) {
            newErrors.contact_phone = 'Numéro de téléphone invalide';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateContact()) return;
        if (!data.consent_sharing) {
            toast.error('Veuillez accepter la transmission de vos coordonnées');
            return;
        }

        const fullName = [data.contact_first_name, data.contact_last_name].filter(Boolean).join(' ');

        setAuthLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email: data.contact_email!,
                options: {
                    data: {
                        full_name: fullName,
                        first_name: data.contact_first_name,
                        last_name: data.contact_last_name,
                        role: isRenfort ? 'pro' : 'client',
                        phone: data.contact_phone,
                        client_type: data.client_type,
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent('/post-job?confirmed=true')}`,
                },
            });

            if (error) {
                if (error.message.includes('rate limit')) {
                    toast.error('Trop de tentatives. Veuillez patienter quelques minutes.');
                    return;
                }
                throw error;
            }

            localStorage.setItem('lescordistes_pw_notice', '1');
            setRegisteredEmail(data.contact_email!);
            setNeedsConfirmation(true);
        } catch (error: any) {
            console.error('Auth error:', error);
            toast.error(error.message || 'Erreur lors de l\'envoi du lien.');
        } finally {
            setAuthLoading(false);
        }
    };

    const handleManualLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.contact_email?.trim() || !manualPassword) {
            toast.error('Email et mot de passe requis');
            return;
        }
        setAuthLoading(true);
        try {
            const { data: authData, error } = await supabase.auth.signInWithPassword({
                email: data.contact_email!,
                password: manualPassword,
            });
            if (error) throw error;
            toast.success('Bon retour !');
            onSubmit(false, authData.user?.id);
        } catch (error: any) {
            toast.error(error.message || 'Identifiants incorrects');
        } finally {
            setAuthLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    // ─── En attente de confirmation Magic Link ───
    if (needsConfirmation) {
        return (
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="text-center space-y-6 py-4"
            >
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-brand-blue/10 rounded-full flex items-center justify-center text-brand-blue mb-2">
                        <Mail size={40} className="animate-bounce" />
                    </div>
                </div>
                <div className="max-w-md mx-auto">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                        Vérifiez votre boîte mail !
                    </h3>
                    <p className="text-slate-600 mb-6">
                        Un lien magique a été envoyé à <strong className="text-slate-900">{registeredEmail}</strong>.
                        Cliquez dessus pour activer votre compte.
                    </p>
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-800 mb-6 space-y-1">
                        <p className="font-semibold">Votre brouillon est conservé.</p>
                        <p>Laissez cette page ouverte — dès que vous aurez cliqué sur le lien, votre mission sera publiée automatiquement.</p>
                    </div>

                    <AnimatePresence>
                        {showManualLogin ? (
                            <motion.form
                                key="manual"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                onSubmit={handleManualLogin}
                                className="space-y-3 text-left"
                            >
                                <Input
                                    label="Mot de passe"
                                    type="password"
                                    placeholder="Votre mot de passe"
                                    value={manualPassword}
                                    onChange={(e) => setManualPassword(e.target.value)}
                                    className="h-12"
                                />
                                <Button
                                    variant="primary"
                                    type="submit"
                                    isLoading={authLoading}
                                    className="w-full"
                                >
                                    Se connecter et publier
                                </Button>
                            </motion.form>
                        ) : (
                            <Button
                                variant="outline"
                                onClick={() => setShowManualLogin(true)}
                                className="w-full"
                            >
                                J'ai déjà un mot de passe — me connecter
                            </Button>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        );
    }

    const handleLoggedInSubmit = () => {
        const newErrors: Record<string, string> = {};
        if (!data.contact_first_name?.trim()) newErrors.contact_first_name = 'Le prénom est requis';
        if (!data.contact_last_name?.trim()) newErrors.contact_last_name = 'Le nom est requis';
        if (isRenfort && !data.is_auto_entrepreneur && !data.contact_company_name?.trim()) {
            newErrors.contact_company_name = 'La dénomination commerciale est requise';
        }
        if (!data.contact_phone?.trim()) newErrors.contact_phone = 'Le téléphone est requis';
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            toast.error('Veuillez remplir les champs manquants.');
            return;
        }
        if (!data.consent_sharing) {
            toast.error('Veuillez accepter la transmission de vos coordonnées');
            return;
        }
        onSubmit(false, user!.id);
    };

    const displayFullName = profile?.full_name || [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || '';
    const contactFullName = [data.contact_first_name, data.contact_last_name].filter(Boolean).join(' ');

    // ─── Utilisateur connecté ───
    if (user) {
        return (
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
            >
                <div className="text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                        <div className="p-3 bg-green-50 rounded-xl">
                            <CheckCircle className="text-green-600" size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Tout est prêt !</h2>
                            <p className="text-slate-600">Vérifiez vos informations avant de publier.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {displayFullName ? (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                <UserCircle size={14} /> Nom
                            </div>
                            <span className="text-slate-900 font-semibold truncate">
                                {contactFullName || displayFullName}
                            </span>
                        </div>
                    ) : (
                        <div className="col-span-1 grid grid-cols-2 gap-2">
                            <Input
                                label="Prénom *"
                                type="text"
                                placeholder="Jean"
                                value={data.contact_first_name || ''}
                                onChange={(e) => updateData({ contact_first_name: e.target.value })}
                                error={errors.contact_first_name}
                            />
                            <Input
                                label="Nom *"
                                type="text"
                                placeholder="Dupont"
                                value={data.contact_last_name || ''}
                                onChange={(e) => updateData({ contact_last_name: e.target.value })}
                                error={errors.contact_last_name}
                            />
                        </div>
                    )}

                    {profile?.email || user.email ? (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                <Mail size={14} /> Email
                            </div>
                            <span className="text-slate-900 font-semibold truncate">
                                {data.contact_email || profile?.email || user.email}
                            </span>
                        </div>
                    ) : (
                        <div className="col-span-1">
                            <Input
                                label="Adresse Email *"
                                type="email"
                                placeholder="votre@email.com"
                                value={data.contact_email || ''}
                                onChange={(e) => updateData({ contact_email: e.target.value })}
                                error={errors.contact_email}
                            />
                        </div>
                    )}

                    {profile?.phone ? (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                <Phone size={14} /> Téléphone
                            </div>
                            <span className="text-slate-900 font-semibold truncate">
                                {data.contact_phone || profile.phone}
                            </span>
                        </div>
                    ) : (
                        <div className="col-span-1">
                            <Input
                                label="Téléphone *"
                                type="tel"
                                placeholder="+33 6 12 34 56 78"
                                value={data.contact_phone || ''}
                                onChange={(e) => updateData({ contact_phone: e.target.value })}
                                error={errors.contact_phone}
                            />
                        </div>
                    )}
                </div>

                {isRenfort && (
                    <div className="space-y-3">
                        <div
                            className="flex items-center gap-3 cursor-pointer"
                            onClick={() => updateData({ is_auto_entrepreneur: !data.is_auto_entrepreneur })}
                        >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                                data.is_auto_entrepreneur ? 'bg-brand-blue border-brand-blue' : 'border-slate-300'
                            }`}>
                                {data.is_auto_entrepreneur && <Check size={12} strokeWidth={3} className="text-white" />}
                            </div>
                            <span className="text-sm font-medium text-slate-700">Je suis auto-entrepreneur (pas de société)</span>
                        </div>
                        {!data.is_auto_entrepreneur && (
                            <Input
                                label="Dénomination commerciale *"
                                type="text"
                                placeholder="Ex: Cordistes Pro SAS"
                                value={data.contact_company_name || ''}
                                onChange={(e) => updateData({ contact_company_name: e.target.value })}
                                error={errors.contact_company_name}
                            />
                        )}
                    </div>
                )}

                <div className="bg-green-50/50 border border-green-100 rounded-2xl p-6 shadow-sm space-y-4 mb-4">
                    <div className="flex gap-4 text-left">
                        <div className="shrink-0 p-2 bg-green-100 rounded-full h-fit mt-1">
                            <ShieldCheck className="text-green-600" size={20} />
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-bold text-green-900">Confidentialité & Sécurité (RGPD)</h4>
                            <p className="text-sm text-green-800 leading-relaxed opacity-90">
                                Vos données sont protégées et ne seront <strong>jamais revendues</strong>.
                                Seuls les professionnels qualifiés ayant débloqué votre mission peuvent y accéder.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-white/50 rounded-xl border border-green-200 cursor-pointer group"
                         onClick={() => updateData({ consent_sharing: !data.consent_sharing })}>
                        <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                            data.consent_sharing ? 'bg-green-600 border-green-600 text-white' : 'border-green-300 bg-white group-hover:border-green-400'
                        }`}>
                            {data.consent_sharing && <Check size={14} strokeWidth={3} />}
                        </div>
                        <p className="text-xs text-green-900 leading-relaxed font-bold text-left">
                            J'accepte que mes coordonnées soient transmises aux professionnels sélectionnés pour répondre à ma demande *
                            <Link href="/confidentialite" className="text-green-700 underline ml-2 font-normal">En savoir plus</Link>
                        </p>
                    </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                    {onBack && (
                        <Button
                            variant="outline"
                            onClick={onBack}
                            className="h-16 px-8 text-lg font-bold flex items-center gap-2"
                        >
                            <ChevronLeft size={20} /> Précédent
                        </Button>
                    )}
                    <Button
                        variant="primary"
                        onClick={handleLoggedInSubmit}
                        isLoading={isSubmitting}
                        className="flex-grow h-16 text-xl font-bold shadow-xl shadow-brand-blue/30 group"
                    >
                        {isSubmitting ? 'Publication...' : (
                            <span className="flex items-center justify-center gap-2">
                                Publier ma mission <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </span>
                        )}
                    </Button>
                </div>
            </motion.div>
        );
    }

    // ─── Visiteur non connecté ───
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                    <div className="p-3 bg-brand-blue/10 rounded-xl">
                        <User className="text-brand-blue" size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Dernière étape</h2>
                        <p className="text-slate-600">Recevez un lien magique pour publier votre mission.</p>
                    </div>
                </div>
            </div>

            <div className="bg-green-50/40 border border-green-100 rounded-2xl p-5 space-y-4 mb-2">
                <div className="flex gap-4">
                    <div className="shrink-0 p-2 bg-green-100 rounded-full h-fit">
                        <ShieldCheck className="text-green-600" size={18} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-green-800 leading-relaxed font-semibold">
                            RGPD First : Vos données sont sécurisées. Elles ne seront <strong>jamais revendues</strong> ni divulguées à des tiers non vérifiés.
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white/50 rounded-xl border border-green-100 cursor-pointer group"
                     onClick={() => updateData({ consent_sharing: !data.consent_sharing })}>
                    <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                        data.consent_sharing ? 'bg-green-600 border-green-600 text-white' : 'border-green-300 bg-white group-hover:border-green-400'
                    }`}>
                        {data.consent_sharing && <Check size={14} strokeWidth={3} />}
                    </div>
                    <p className="text-[11px] text-green-900 leading-relaxed font-bold">
                        J'accepte que mes coordonnées soient transmises aux professionnels sélectionnés *
                        <Link href="/confidentialite" className="text-green-700 underline ml-2 font-normal">Détails</Link>
                    </p>
                </div>
            </div>

            <form onSubmit={handleMagicLink} className="space-y-6">
                <div className="mb-2">
                    <GoogleSignInButton
                        mode="signup"
                        redirectTo={`${window.location.origin}/post-job`}
                        onBeforeClick={() => {
                            if (!data.consent_sharing) {
                                toast.error('Veuillez accepter la transmission de vos coordonnées avant de continuer avec Google.');
                                return false;
                            }
                            return true;
                        }}
                    />
                </div>

                <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-slate-200"></div>
                    <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">ou par email</span>
                    <div className="flex-1 h-px bg-slate-200"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Prénom *"
                        type="text"
                        placeholder="Jean"
                        value={data.contact_first_name || ''}
                        onChange={(e) => updateData({ contact_first_name: e.target.value })}
                        error={errors.contact_first_name}
                        className="h-12"
                    />
                    <Input
                        label="Nom *"
                        type="text"
                        placeholder="Dupont"
                        value={data.contact_last_name || ''}
                        onChange={(e) => updateData({ contact_last_name: e.target.value })}
                        error={errors.contact_last_name}
                        className="h-12"
                    />
                </div>

                {isRenfort && (
                    <div className="space-y-3">
                        <div
                            className="flex items-center gap-3 cursor-pointer"
                            onClick={() => updateData({ is_auto_entrepreneur: !data.is_auto_entrepreneur })}
                        >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                                data.is_auto_entrepreneur ? 'bg-brand-blue border-brand-blue' : 'border-slate-300'
                            }`}>
                                {data.is_auto_entrepreneur && <Check size={12} strokeWidth={3} className="text-white" />}
                            </div>
                            <span className="text-sm font-medium text-slate-700">Je suis auto-entrepreneur (pas de société)</span>
                        </div>
                        {!data.is_auto_entrepreneur && (
                            <Input
                                label="Dénomination commerciale *"
                                type="text"
                                placeholder="Ex: Cordistes Pro SAS"
                                value={data.contact_company_name || ''}
                                onChange={(e) => updateData({ contact_company_name: e.target.value })}
                                error={errors.contact_company_name}
                                className="h-12"
                            />
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Votre adresse email *"
                        type="email"
                        placeholder="nom@exemple.fr"
                        value={data.contact_email || ''}
                        onChange={(e) => updateData({ contact_email: e.target.value })}
                        error={errors.contact_email}
                        className="h-12"
                    />
                    <Input
                        label="Téléphone *"
                        type="tel"
                        placeholder="+33 6 12 34 56 78"
                        value={data.contact_phone || ''}
                        onChange={(e) => updateData({ contact_phone: e.target.value })}
                        error={errors.contact_phone}
                        className="h-12"
                    />
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                    {onBack && (
                        <Button
                            variant="outline"
                            type="button"
                            onClick={onBack}
                            className="h-16 px-8 text-lg font-bold flex items-center gap-2"
                        >
                            <ChevronLeft size={20} /> Précédent
                        </Button>
                    )}
                    <Button
                        variant="primary"
                        type="submit"
                        isLoading={authLoading}
                        disabled={authLoading || !data.consent_sharing}
                        className={`flex-grow h-16 text-xl font-bold transition-all ${
                            !data.consent_sharing ? 'opacity-50 grayscale cursor-not-allowed' : 'shadow-xl shadow-brand-blue/30 group'
                        }`}
                    >
                        {authLoading ? 'Envoi en cours...' : (
                            <span className="flex items-center justify-center gap-2">
                                Recevoir mon lien magique <Mail size={20} />
                            </span>
                        )}
                    </Button>
                </div>
            </form>
        </motion.div>
    );
};
