'use client'

import React from 'react';
import { useRouter } from 'next/navigation'
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { useAuth } from '../contexts/AuthContext';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Mail, Lock } from 'lucide-react';
import posthog from 'posthog-js';

type LoginTab = 'password' | 'magic';

export function Login() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [tab, setTab] = React.useState<LoginTab>('password');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [magicEmail, setMagicEmail] = React.useState('');
    const [magicSent, setMagicSent] = React.useState(false);
    const [magicLoading, setMagicLoading] = React.useState(false);

    React.useEffect(() => {
        if (!authLoading && user) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
            if (signInError) throw signInError;
            posthog.identify(email, { email });
            posthog.capture('user_logged_in', { method: 'password' });
        } catch (err: any) {
            setError(err.message || 'Email ou mot de passe incorrect');
        } finally {
            setLoading(false);
        }
    };

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!magicEmail) return;
        setError('');
        setMagicLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email: magicEmail,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent('/dashboard')}`,
                },
            });
            if (error) throw error;
            posthog.capture('user_logged_in', { method: 'magic_link', email: magicEmail });
            setMagicSent(true);
        } catch (err: any) {
            setError(err.message || 'Erreur lors de l\'envoi du lien');
        } finally {
            setMagicLoading(false);
        }
    };

    const handleTabChange = (t: LoginTab) => {
        setTab(t);
        setError('');
        setMagicSent(false);
    };

    const isRegistered = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('registered') === '1';

    const jsonLd = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Connexion Espace Membre | LesCordistes.com",
        "description": "Accédez à votre espace personnel sécurisé LesCordistes.com pour gérer vos annonces, postuler aux missions en hauteur et mettre à jour votre profil pro.",
        "url": "https://lescordistes.com/connexion",
    });

    return (
        <AuthLayout
            seoTitle="Connexion Espace Membre | LesCordistes.com"
            seoDescription="Accédez à votre espace personnel sécurisé LesCordistes.com pour gérer vos annonces, postuler aux missions en hauteur et mettre à jour votre profil pro."
            seoCanonical="https://lescordistes.com/connexion"
            jsonLd={jsonLd}
            authMode="login"
        >
            <div className="p-6 sm:p-8 pt-4">
                <div className="text-center mb-6">
                    <h1 className="sr-only">Connexion Espace Membre</h1>
                    <p className="text-slate-500 text-sm sm:text-base font-medium">
                        Connectez-vous pour accéder à votre compte personnel
                    </p>
                </div>

                <div className="space-y-6">
                    <div aria-live="polite" className="empty:hidden">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4 flex items-start" role="alert" id="login-error">
                                <span className="shrink-0 mr-2">⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}
                        {isRegistered && (
                            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4 flex items-start" role="status">
                                <span className="text-xl shrink-0 mr-3">📧</span>
                                <div>
                                    <p className="font-semibold text-sm">Inscription réussie !</p>
                                    <p className="text-xs mt-1 leading-relaxed">
                                        Veuillez vérifier votre boîte mail (<strong>et vos spams</strong>) pour valider votre compte.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-2">
                        <GoogleSignInButton mode="signin" onError={(msg) => setError(msg)} />
                    </div>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase font-medium">
                            <span className="px-3 bg-white text-slate-400">Ou avec votre email</span>
                        </div>
                    </div>

                    {/* Onglets */}
                    <div className="flex rounded-xl border border-slate-200 p-1 bg-slate-50 gap-1">
                        <button
                            type="button"
                            onClick={() => handleTabChange('password')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
                                tab === 'password'
                                    ? 'bg-white shadow-sm text-slate-900'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <Lock size={15} />
                            Mot de passe
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTabChange('magic')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
                                tab === 'magic'
                                    ? 'bg-white shadow-sm text-slate-900'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <Mail size={15} />
                            Lien magique
                        </button>
                    </div>

                    {tab === 'password' && (
                        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                            <Input
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="votre@email.com"
                                required
                                aria-label="Adresse email"
                                aria-invalid={!!error ? "true" : "false"}
                                aria-describedby={error ? "login-error" : undefined}
                            />
                            <div>
                                <Input
                                    label="Mot de passe"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    aria-label="Mot de passe"
                                    aria-invalid={!!error ? "true" : "false"}
                                    aria-describedby={error ? "login-error" : undefined}
                                />
                                <div className="flex justify-end mt-1.5">
                                    <Link
                                        href="/forgot-password"
                                        className="text-xs text-brand-blue hover:text-brand-blue-dark font-medium underline-offset-4 hover:underline transition-all"
                                    >
                                        Mot de passe oublié ?
                                    </Link>
                                </div>
                            </div>
                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full py-2.5 text-base font-semibold shadow-sm hover:shadow-md transition-shadow"
                                disabled={loading || !email || !password}
                            >
                                {loading ? 'Connexion en cours...' : 'Se connecter'}
                            </Button>
                        </form>
                    )}

                    {tab === 'magic' && (
                        <div>
                            {magicSent ? (
                                <div className="text-center py-6 space-y-3">
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                                        <Mail size={32} className="text-brand-blue animate-bounce" />
                                    </div>
                                    <p className="font-semibold text-slate-900">Lien envoyé !</p>
                                    <p className="text-sm text-slate-500">
                                        Vérifiez votre boîte mail à <strong>{magicEmail}</strong> et cliquez sur le lien pour vous connecter.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setMagicSent(false)}
                                        className="text-xs text-slate-400 hover:text-brand-blue underline underline-offset-2 transition-colors"
                                    >
                                        Renvoyer un lien
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleMagicLink} className="space-y-5">
                                    <p className="text-sm text-slate-500">
                                        Entrez votre email et recevez un lien de connexion instantané — sans mot de passe.
                                    </p>
                                    <Input
                                        label="Email"
                                        type="email"
                                        value={magicEmail}
                                        onChange={(e) => setMagicEmail(e.target.value)}
                                        placeholder="votre@email.com"
                                        required
                                    />
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="w-full py-2.5 text-base font-semibold"
                                        disabled={magicLoading || !magicEmail}
                                    >
                                        {magicLoading ? 'Envoi...' : 'Recevoir mon lien de connexion'}
                                    </Button>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AuthLayout>
    );
}
