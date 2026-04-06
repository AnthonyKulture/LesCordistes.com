'use client'

import React from 'react';
import { useRouter } from 'next/navigation'
import Link from 'next/link';
import { ShieldCheck, Building2, ArrowLeft, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { createSupabaseBrowserClient } from '../lib/supabase-browser';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useAuth } from '../contexts/AuthContext';
import { AuthLayout } from '../components/layout/AuthLayout';

const STORAGE_KEY = 'lescordistes_client_reg';

export function RegisterClient() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = React.useState({
        firstName: '',
        lastName: '',
        client_type: '',
        email: '',
    });
    const [loading, setLoading] = React.useState(false);
    const [magicSent, setMagicSent] = React.useState(false);
    const [error, setError] = React.useState('');

    // Handle return from magic link confirmation
    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('confirmed') === 'true' && user) {
            const pending = localStorage.getItem(STORAGE_KEY);
            if (pending) {
                try {
                    const data = JSON.parse(pending);
                    const client = createSupabaseBrowserClient();
                    (client.from('profiles') as any).update({
                        first_name: data.firstName || null,
                        last_name: data.lastName || null,
                        full_name: [data.firstName, data.lastName].filter(Boolean).join(' ') || null,
                        role: 'client',
                        client_type: data.client_type || null,
                    }).eq('id', user.id).then(() => {
                        localStorage.removeItem(STORAGE_KEY);
                        router.push('/dashboard');
                    });
                } catch {
                    localStorage.removeItem(STORAGE_KEY);
                    router.push('/dashboard');
                }
            } else {
                router.push('/dashboard');
            }
            return;
        }
        if (!authLoading && user && !params.get('confirmed')) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            setError('Prénom et nom sont requis');
            return;
        }
        if (!formData.client_type) {
            setError('Veuillez sélectionner votre profil');
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
                    emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent('/inscription-client?confirmed=true')}`,
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
            setMagicSent(true);
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    const jsonLd = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Création de compte Client (B2B & Particuliers)",
        "description": "Trouvez le meilleur cordiste pour vos chantiers et missions en hauteur en vous inscrivant gratuitement sur LesCordistes.com.",
        "url": "https://lescordistes.com/inscription-client"
    });

    return (
        <AuthLayout
            seoTitle="Inscription Espace Client BtoB et Particulier | LesCordistes.com"
            seoDescription="Accédez à des centaines de cordistes qualifiés pour vos missions en hauteur. Inscription 100% gratuite et rapide."
            seoCanonical="https://lescordistes.com/inscription-client"
            jsonLd={jsonLd}
            authMode="register"
        >
            <div className="p-6 sm:p-8 pt-4">
                <div className="flex flex-col items-center mb-6 relative">
                    <Link href="/inscription" className="absolute left-0 top-0 inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded px-1 -ml-1">
                        <ArrowLeft size={16} className="mr-1" /> Retour
                    </Link>
                    <div className="p-3 bg-blue-50 rounded-xl mb-3 mt-4">
                        <Building2 className="text-brand-blue" size={28} />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight text-center">Espace Client</h1>
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
                            <Select
                                label="Vous êtes *"
                                name="client_type"
                                value={formData.client_type}
                                onChange={handleChange}
                                required
                                options={[
                                    { value: '', label: 'Choisir votre profil...' },
                                    { value: 'particulier', label: '🏡 Particulier' },
                                    { value: 'copropriete_syndic', label: '🏢 Copropriété & Syndic' },
                                    { value: 'entreprise_tertiaire', label: '💼 Entreprise & Tertiaire' },
                                    { value: 'industrie_energie', label: '⚙️ Industrie & Énergie' },
                                    { value: 'collectivite_public', label: '🏛️ Collectivité & Public' },
                                    { value: 'association_evenementiel', label: '🎪 Association & Événementiel' },
                                    { value: 'entreprise_travaux_hauteur', label: '🏗️ Société de travaux en hauteur' },
                                    { value: 'entreprise_btp', label: '👷 Entreprise du BTP / Génie Civil' },
                                    { value: 'agence_interim', label: "🏢 Agence d'intérim spécialisée" },
                                    { value: 'autre_pro', label: '🤝 Autre professionnel' },
                                ]}
                            />

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

                            <Input
                                label="Email de contact *"
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
                                disabled={loading || !formData.email || !formData.firstName || !formData.lastName || !formData.client_type}
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
