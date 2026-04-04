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

export function Login() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useRouter();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        if (!authLoading && user) {
            router.push('/dashboard');
        }
    }, [user, authLoading, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) throw signInError;
            // The useEffect will handle redirection once the auth state updates
        } catch (err: any) {
            setError(err.message || 'Email ou mot de passe incorrect');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = (errorMessage: string) => {
        setError(errorMessage);
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
                    {/* Accessibilité : aria-live pour les annonces du lecteur d'écran sur les erreurs/succès */}
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
                        <GoogleSignInButton mode="signin" onError={handleGoogleError} />
                    </div>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase font-medium">
                            <span className="px-3 bg-white text-slate-400">Ou avec votre email</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        <div>
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
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-sm font-medium text-slate-700 shadow-none"> {/* Keep matching standard if Input uses own label, though we override */} </label>
                            </div>
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
                                    className="text-xs text-brand-blue hover:text-brand-blue-dark font-medium underline-offset-4 hover:underline transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded h-auto w-auto"
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
                            aria-disabled={loading || !email || !password}
                        >
                            {loading ? 'Connexion en cours...' : 'Se connecter'}
                        </Button>
                    </form>
                </div>
            </div>
        </AuthLayout>
    );
}
