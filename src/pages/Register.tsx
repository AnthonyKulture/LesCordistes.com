import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { useAuth } from '../contexts/AuthContext';

export function Register() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const urlRole = new URLSearchParams(window.location.search).get('role');
    const defaultRole = (urlRole === 'client' || urlRole === 'pro') ? urlRole : 'client';
    const [formData, setFormData] = React.useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        role: defaultRole as 'client' | 'pro',
    });
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        if (!authLoading && user) {
            navigate('/dashboard');
        }
    }, [user, authLoading, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        if (formData.password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        role: formData.role,
                    },
                },
            });

            if (error) throw error;

            if (data.user) {
                // Create profile
                const { error: profileError } = await (supabase as any)
                    .from('profiles')
                    .update({
                        full_name: formData.fullName,
                        role: formData.role,
                        client_type: (formData as any).client_type || null,
                    })
                    .eq('id', data.user.id);

                if (profileError) console.error('Profile update error:', profileError);

                // Pas d'alert() - redirection directe vers login avec message d'état
                navigate('/login?registered=1');
            }
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue lors de l\'inscription');
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
                <title>Créer un compte | LesCordistes.com</title>
                <meta name="description" content="Rejoignez LesCordistes.com, la plateforme experte de mise en relation entre clients et cordistes professionnels. Inscription gratuite et rapide." />
                <link rel="canonical" href="https://lescordistes.com/register" />
            </Helmet>
            <Card className="w-full max-w-md">
                <CardHeader>
                    <h1 className="text-2xl font-bold text-slate-900">Créer un compte</h1>
                    <p className="text-slate-600 mt-2">
                        Rejoignez LesCordistes.com
                    </p>
                </CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        {/* Google Sign-Up */}
                        <GoogleSignInButton mode="signup" onError={handleGoogleError} />

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-slate-500">Ou créer avec email</span>
                            </div>
                        </div>

                        {/* Email/Password Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="bg-green-50/50 border border-green-100 rounded-xl p-3 flex gap-3 mb-2 text-center items-center justify-center">
                                <ShieldCheck className="text-green-600 shrink-0" size={18} />
                                <div className="text-[10px] text-green-800 leading-relaxed font-semibold text-center">
                                    Compte sécurisé (RGPD First). En vous inscrivant, vous acceptez nos <Link to="/cgu" className="underline">CGU</Link>, <Link to="/cgv" className="underline">CGV</Link> et notre <Link to="/confidentialite" className="underline">Politique de Confidentialité</Link>.
                                </div>
                            </div>
                            <Select
                                label="Je suis"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                options={[
                                    { value: 'client', label: 'Un client (je poste des missions)' },
                                    { value: 'pro', label: 'Un professionnel (je cherche des missions)' },
                                ]}
                            />

                            <Input
                                label="Nom complet"
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Jean Dupont"
                                required
                            />

                            {formData.role === 'client' && (
                                <Select
                                    label="Vous êtes *"
                                    name="client_type"
                                    value={(formData as any).client_type || ''}
                                    onChange={handleChange}
                                    required
                                    options={[
                                        { value: '', label: 'Choisir votre profil' },
                                        { value: 'particulier', label: '🏡 Particulier' },
                                        { value: 'copropriete_syndic', label: '🏢 Copropriété & Syndic' },
                                        { value: 'entreprise_tertiaire', label: '💼 Entreprise & Tertiaire' },
                                        { value: 'industrie_energie', label: '⚙️ Industrie & Énergie' },
                                        { value: 'collectivite_public', label: '🏛️ Collectivité & Public' },
                                        { value: 'association_evenementiel', label: '🎪 Association & Événementiel' },
                                        { value: 'entreprise_travaux_hauteur', label: '🏗️ Société de travaux en hauteur' },
                                        { value: 'entreprise_btp', label: '👷 Entreprise du BTP / Génie Civil' },
                                        { value: 'agence_interim', label: '🏢 Agence d\'intérim spécialisée' },
                                        { value: 'autre_pro', label: '🤝 Autre professionnel' },
                                    ]}
                                />
                            )}

                            <Input
                                label="Email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="votre@email.com"
                                required
                            />

                            <Input
                                label="Mot de passe"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Minimum 6 caractères"
                                required
                            />

                            <Input
                                label="Confirmer le mot de passe"
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Retapez votre mot de passe"
                                required
                            />



                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? 'Inscription...' : 'Créer mon compte'}
                            </Button>
                        </form>

                        <div className="text-center text-sm text-slate-600">
                            Déjà un compte ?{' '}
                            <Link to="/login" className="text-brand-blue hover:text-brand-blue-light font-semibold">
                                Se connecter
                            </Link>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
