import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        if (!authLoading && user) {
            navigate('/dashboard');
        }
    }, [user, authLoading, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (error) throw error;
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

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Helmet>
                <title>Connexion | LesCordistes.com</title>
                <meta name="description" content="Connectez-vous à votre espace personnel LesCordistes.com pour gérer vos annonces, vos missions et votre profil de cordiste." />
                <link rel="canonical" href="https://lescordistes.com/login" />
            </Helmet>
            <Card className="w-full max-w-md">
                <CardHeader>
                    <h1 className="text-2xl font-bold text-slate-900">Connexion</h1>
                    <p className="text-slate-600 mt-2">
                        Connectez-vous pour accéder à votre compte
                    </p>
                </CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        {new URLSearchParams(window.location.search).get('registered') === '1' && (
                            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-start gap-3">
                                <span className="text-xl">📧</span>
                                <div>
                                    <p className="font-medium">Inscription réussie !</p>
                                    <p className="text-sm mt-1">
                                        Veuillez vérifier votre boîte mail (<strong>et vos courriers indésirables / spams</strong>) pour valider votre compte avant de vous connecter.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Google Sign-In */}
                        <GoogleSignInButton mode="signin" onError={handleGoogleError} />

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-slate-500">Ou continuer avec email</span>
                            </div>
                        </div>

                        {/* Email/Password Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="votre@email.com"
                                required
                            />

                            <Input
                                label="Mot de passe"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />

                            <div className="flex items-center justify-end">
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-brand-blue hover:text-brand-blue-light font-medium"
                                >
                                    Mot de passe oublié ?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? 'Connexion...' : 'Se connecter'}
                            </Button>
                        </form>

                        <div className="text-center text-sm text-slate-600">
                            Pas encore de compte ?{' '}
                            <Link to="/register" className="text-brand-blue hover:text-brand-blue-light font-semibold">
                                S'inscrire
                            </Link>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
