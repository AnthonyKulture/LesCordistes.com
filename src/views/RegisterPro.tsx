'use client'

import React from 'react';
import { useRouter } from 'next/navigation'
import Link from 'next/link';
import { ShieldCheck, HardHat, ArrowLeft, Mail, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { createSupabaseBrowserClient } from '../lib/supabase-browser';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { AuthLayout } from '../components/layout/AuthLayout';
import posthog from 'posthog-js';

const STORAGE_KEY = 'lescordistes_pro_reg';

export function RegisterPro() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = React.useState({
        firstName: '',
        lastName: '',
        companyName: '',
        isAutoEntrepreneur: false,
        phone: '',
        email: '',
    });
    const [loading, setLoading] = React.useState(false);
    const [magicSent, setMagicSent] = React.useState(false);
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        if (!authLoading && user) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            setError('Prénom et nom sont requis');
            return;
        }
        if (!formData.isAutoEntrepreneur && !formData.companyName.trim()) {
            setError('La dénomination commerciale est requise');
            return;
        }
        if (!formData.phone.trim()) {
            setError('Le numéro de téléphone est requis');
            return;
        }
        if (!formData.email.trim()) {
            setError("L'email est requis");
            return;
        }

        setLoading(true);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));

            const { error: otpError } = await supabase.auth.signInWithOtp({
                email: formData.email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                    data: {
                        role: 'pro',
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        full_name: `${formData.firstName} ${formData.lastName}`,
                        phone: formData.phone,
                        company_name: formData.isAutoEntrepreneur ? '' : formData.companyName,
                        is_auto_entrepreneur: formData.isAutoEntrepreneur,
                    },
                },
            });

            if (otpError) {
                if (otpError.message.includes('rate limit')) {
                    setError('Trop de tentatives. Veuillez patienter quelques minutes.');
                } else {
                    throw otpError;
                }
                return;
            }

            localStorage.setItem('lescordistes_pw_notice', '1');
            posthog.identify(formData.email, { email: formData.email, role: 'pro', is_auto_entrepreneur: formData.isAutoEntrepreneur });
            posthog.capture('user_signed_up', { role: 'pro', is_auto_entrepreneur: formData.isAutoEntrepreneur });
            setMagicSent(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    const jsonLd = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Inscription Cordiste Indépendant ou Salarié",
        "description": "Créez votre profil de cordiste professionnel sur LesCordistes.com et trouvez des missions adaptées à vos diplômes (CQP, IRATA).",
        "url": "https://lescordistes.com/inscription-cordiste"
    });

    return (
        <AuthLayout
            seoTitle="Inscription Espace Cordiste BtoB | LesCordistes.com"
            seoDescription="Créez votre profil de cordiste gratuitement. Trouvez des chantiers et missions de travaux en hauteur en France."
            seoCanonical="https://lescordistes.com/inscription-cordiste"
            jsonLd={jsonLd}
            authMode="register"
        >
            <div className="p-6 sm:p-8 pt-4">
                <div className="flex flex-col items-center mb-6 relative">
                    <Link href="/inscription" className="absolute left-0 top-0 inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded px-1 -ml-1">
                        <ArrowLeft size={16} className="mr-1" /> Retour
                    </Link>
                    <div className="p-3 bg-orange-50 rounded-xl mb-3 mt-4">
                        <HardHat className="text-brand-orange" size={28} />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight text-center">Profil Cordiste</h1>
                </div>

                {magicSent ? (
                    <div className="text-center py-6 space-y-4">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                            <Mail size={32} className="text-brand-blue animate-bounce" />
                        </div>
                        <h2 className="font-bold text-slate-900 text-lg">Vérifiez votre boîte mail !</h2>
                        <p className="text-sm text-slate-500">
                            Un lien magique a été envoyé à <strong>{formData.email}</strong>.<br />
                            Cliquez dessus pour activer votre compte.
                        </p>
                        <p className="text-xs text-slate-400">Vérifiez aussi vos spams.</p>
                        <button
                            type="button"
                            onClick={() => setMagicSent(false)}
                            className="text-xs text-slate-400 hover:text-brand-blue underline underline-offset-2 transition-colors"
                        >
                            Renvoyer un lien
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start" role="alert">
                                <span className="shrink-0 mr-2">⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="bg-green-50/70 border border-green-200/60 rounded-xl p-3 flex gap-3 items-start text-left shadow-sm">
                            <ShieldCheck className="text-green-600 shrink-0 mt-0.5" size={20} />
                            <div className="text-xs text-green-800 leading-relaxed font-medium">
                                Compte sécurisé. En vous inscrivant, vous acceptez nos <Link href="/cgu" className="underline hover:text-green-900">CGU</Link>, <Link href="/cgv" className="underline hover:text-green-900">CGV</Link> et notre <Link href="/confidentialite" className="underline hover:text-green-900">Politique de Confidentialité</Link>.
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Prénom *"
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="Jean"
                                    required
                                />
                                <Input
                                    label="Nom *"
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Dupont"
                                    required
                                />
                            </div>

                            <div className="space-y-3">
                                <div
                                    className="flex items-center gap-3 cursor-pointer"
                                    onClick={() => setFormData(prev => ({ ...prev, isAutoEntrepreneur: !prev.isAutoEntrepreneur }))}
                                >
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                                        formData.isAutoEntrepreneur ? 'bg-brand-blue border-brand-blue' : 'border-slate-300'
                                    }`}>
                                        {formData.isAutoEntrepreneur && <Check size={12} strokeWidth={3} className="text-white" />}
                                    </div>
                                    <span className="text-sm font-medium text-slate-700">Je suis auto-entrepreneur (pas de société)</span>
                                </div>

                                {!formData.isAutoEntrepreneur && (
                                    <Input
                                        label="Dénomination commerciale *"
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        placeholder="Ex: Cordistes Pro SAS"
                                        required
                                    />
                                )}
                            </div>

                            <Input
                                label="Téléphone *"
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="06 12 34 56 78"
                                required
                            />

                            <Input
                                label="Email professionnel *"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="votre@email.com"
                                required
                            />

                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full py-2.5 text-base font-semibold shadow-sm hover:shadow-md transition-shadow mt-2"
                                isLoading={loading}
                                disabled={loading || !formData.email || !formData.firstName || !formData.lastName || !formData.phone}
                            >
                                {loading ? 'Envoi en cours...' : (
                                    <span className="flex items-center justify-center gap-2">
                                        <Mail size={16} /> Recevoir mon lien d'activation
                                    </span>
                                )}
                            </Button>
                        </form>
                    </div>
                )}
            </div>
        </AuthLayout>
    );
}
