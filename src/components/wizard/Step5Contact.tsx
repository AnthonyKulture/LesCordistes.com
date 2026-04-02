import React, { useState, useEffect } from 'react';
import { User, CheckCircle, ArrowRight, Mail, Phone, UserCircle, ChevronLeft, ShieldCheck, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
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
    const [isLogin, setIsLogin] = useState(false);
    const [authLoading, setAuthLoading] = useState(false);
    const [needsConfirmation, setNeedsConfirmation] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Auto-fill contact info from profile when logged in
    useEffect(() => {
        if (user && profile) {
            const updates: Partial<JobFormData> = {};
            if (!data.contact_name && profile.full_name) updates.contact_name = profile.full_name;
            if (!data.contact_email && (profile.email || user.email)) updates.contact_email = profile.email || user.email || '';
            if (!data.contact_phone && profile.phone) updates.contact_phone = profile.phone;
            if (Object.keys(updates).length > 0) updateData(updates);
        }
    }, [user, profile]);

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!data.contact_name?.trim()) {
            newErrors.contact_name = 'Le nom est requis';
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

        if (!user && !password) {
            newErrors.password = 'Un mot de passe est requis pour créer votre compte';
        } else if (!user && password.length < 6) {
            newErrors.password = 'Le mot de passe doit faire au moins 6 caractères';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAuthAndSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        if (user) {
            onSubmit(false, user.id);
            return;
        }

        setAuthLoading(true);
        if (!data.consent_sharing) {
            toast.error('Veuillez accepter la transmission de vos coordonnées');
            setAuthLoading(false);
            return;
        }

        try {
            if (isLogin) {
                const { data: authData, error } = await supabase.auth.signInWithPassword({
                    email: data.contact_email!,
                    password,
                });
                if (error) throw error;
                toast.success('Bon retour !');
                onSubmit(false, authData.user?.id);
            } else {
                const { data: authData, error } = await supabase.auth.signUp({
                    email: data.contact_email!,
                    password,
                    options: {
                        data: {
                            full_name: data.contact_name,
                            role: data.type === 'renfort_pro' ? 'pro' : 'client',
                            phone: data.contact_phone,
                            client_type: data.client_type,
                        },
                        emailRedirectTo: `${window.location.origin}/post-job?confirmed=true`,
                    },
                });
                
                if (error) {
                    // Check for already registered error
                    if (error.message.includes('already registered') || error.status === 422) {
                        toast.error('Un compte existe déjà avec cet email. Connectez-vous !');
                        setIsLogin(true); // Switch to login tab
                        return;
                    }
                    if (error.message.includes('rate limit')) {
                        toast.error('Trop de tentatives. Veuillez patienter ou utiliser un autre email.');
                        return;
                    }
                    throw error;
                }
                
                if (authData.session) {
                    toast.success('Compte créé !');
                    onSubmit(true, authData.user?.id);
                } else {
                    // Email confirmation is required
                    setRegisteredEmail(data.contact_email!);
                    setNeedsConfirmation(true);
                    toast.success('Compte créé ! Veuillez confirmer votre email.');
                }
            }
        } catch (error: any) {
            console.error('Auth error detail:', error);
            const msg = error.message || 'Erreur d\'authentification';
            toast.error(msg);
        } finally {
            setAuthLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    // ─── Email Confirmation Needed ───
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
                        Un lien de confirmation a été envoyé à <strong className="text-slate-900">{registeredEmail}</strong>. 
                        Cliquez dessus pour activer votre compte et publier votre mission automatiquement.
                    </p>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-500 mb-6">
                        <p>Une fois l'email confirmé, vous serez redirigé ici pour finaliser l'envoi de votre mission en un clic.</p>
                    </div>
                    <Button 
                        variant="outline" 
                        onClick={() => {
                            setNeedsConfirmation(false);
                            setIsLogin(true);
                        }}
                        className="w-full"
                    >
                        Se connecter manuellement
                    </Button>
                </div>
            </motion.div>
        );
    }

    // ─── Logged-in user: simplified confirmation ───
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
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <UserCircle size={14} /> Nom
                        </div>
                        <span className="text-slate-900 font-semibold truncate">
                            {data.contact_name || profile?.full_name || '—'}
                        </span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <Mail size={14} /> Email
                        </div>
                        <span className="text-slate-900 font-semibold truncate">
                            {data.contact_email || user.email || '—'}
                        </span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <Phone size={14} /> Téléphone
                        </div>
                        <span className="text-slate-900 font-semibold truncate">
                            {data.contact_phone || profile?.phone || '—'}
                        </span>
                    </div>
                </div>

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
                            <Link to="/confidentialite" className="text-green-700 underline ml-2 font-normal">En savoir plus</Link>
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
                        onClick={() => onSubmit(false, user.id)}
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

    // ─── Guest user: full form with registration/login ───
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
                        <h2 className="text-2xl font-bold text-slate-900">
                            {isLogin ? 'Bon retour !' : 'Dernière étape'}
                        </h2>
                        <p className="text-slate-600">
                            {isLogin
                                ? 'Connectez-vous pour finaliser la publication.'
                                : 'Créez votre compte client pour gérer vos devis.'}
                        </p>
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
                        <Link to="/confidentialite" className="text-green-700 underline ml-2 font-normal">Détails</Link>
                    </p>
                </div>
            </div>

            <form onSubmit={handleAuthAndSubmit} className="space-y-6">
                
                <div className="mb-2">
                    <GoogleSignInButton 
                        mode={isLogin ? 'signin' : 'signup'} 
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
                    <AnimatePresence mode="popLayout">
                        {!isLogin && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <Input
                                    label="Nom complet *"
                                    type="text"
                                    placeholder="Ex: Jean Dupont"
                                    value={data.contact_name || ''}
                                    onChange={(e) => updateData({ contact_name: e.target.value })}
                                    error={errors.contact_name}
                                    className="h-12"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    <Input
                        label="Votre adresse email *"
                        type="email"
                        placeholder="nom@exemple.fr"
                        value={data.contact_email || ''}
                        onChange={(e) => updateData({ contact_email: e.target.value })}
                        error={errors.contact_email}
                        className="h-12"
                    />
                </div>

                <AnimatePresence mode="popLayout">
                    {!isLogin && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <Input
                                label="Téléphone *"
                                type="tel"
                                placeholder="+33 6 12 34 56 78"
                                value={data.contact_phone || ''}
                                onChange={(e) => updateData({ contact_phone: e.target.value })}
                                error={errors.contact_phone}
                                className="h-12"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-3">
                    <Input
                        label={isLogin ? "Mot de passe *" : "Choisissez un mot de passe *"}
                        type="password"
                        placeholder="Minimum 6 caractères"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={errors.password}
                        className="h-12"
                    />
                    <div className="flex justify-between items-center px-1">
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm text-brand-blue hover:text-blue-700 font-bold transition-colors"
                        >
                            {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
                        </button>
                    </div>
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
                        isLoading={isSubmitting || authLoading}
                        disabled={isSubmitting || authLoading || !data.consent_sharing}
                        className={`flex-grow h-16 text-xl font-bold transition-all ${
                            !data.consent_sharing ? 'opacity-50 grayscale cursor-not-allowed' : 'shadow-xl shadow-brand-blue/30 group'
                        }`}
                    >
                        {isSubmitting || authLoading
                            ? 'Traitement...'
                            : isLogin
                                ? 'Se connecter et publier'
                                : 'Créer mon compte et publier'}
                    </Button>
                </div>
            </form>
        </motion.div>
    );
};
