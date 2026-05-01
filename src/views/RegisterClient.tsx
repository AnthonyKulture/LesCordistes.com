'use client'

import React from 'react';
import { useRouter } from 'next/navigation'
import Link from 'next/link';
import { ShieldCheck, Building2, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { createSupabaseBrowserClient } from '../lib/supabase-browser';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useAuth } from '../contexts/AuthContext';
import { AuthLayout } from '../components/layout/AuthLayout';
import { translateAuthError } from '../lib/authErrors';
import posthog from 'posthog-js';

const STORAGE_KEY = 'lescordistes_client_reg';

export function RegisterClient() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = React.useState({
        firstName: '',
        lastName: '',
        client_type: '',
        email: '',
        password: '',
    });
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const errorRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (error && errorRef.current) {
            errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            errorRef.current.focus();
        }
    }, [error]);

    React.useEffect(() => {
        if (!authLoading && user) {
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

        if (formData.password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setLoading(true);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));

            const { error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        role: 'client',
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        full_name: `${formData.firstName} ${formData.lastName}`.trim(),
                        client_type: formData.client_type,
                    },
                },
            });

            if (signUpError) {
                setError(translateAuthError(signUpError));
                return;
            }

            posthog.identify(formData.email, { email: formData.email, role: 'client', client_type: formData.client_type });
            posthog.capture('user_signed_up', { role: 'client', client_type: formData.client_type });
            // Welcome email envoyé par le trigger SQL handle_new_user (INSERT) — ne pas dupliquer ici.
            router.push('/dashboard');
        } catch (err: any) {
            setError(translateAuthError(err));
        } finally {
            setLoading(false);
        }
    };

    const jsonLd = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Création de compte Client (B2B & Particuliers)",
        "description": "Trouvez le meilleur cordiste pour vos chantiers et missions en hauteur en vous inscrivant gratuitement sur LesCordistes.com.",
        "url": "https://www.lescordistes.com/inscription-client"
    });

    return (
        <AuthLayout
            seoTitle="Inscription Espace Client BtoB et Particulier | LesCordistes.com"
            seoDescription="Accédez à des centaines de cordistes qualifiés pour vos missions en hauteur. Inscription 100% gratuite et rapide."
            seoCanonical="https://www.lescordistes.com/inscription-client"
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

                    <div className="space-y-6">
                        {error && (
                            <div ref={errorRef} tabIndex={-1} className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2 scroll-mt-24 outline-none" role="alert">
                                <span className="shrink-0" aria-hidden="true">⚠️</span>
                                <span className="min-w-0 break-words">{error}</span>
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

                            <Input
                                label="Mot de passe *"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Au moins 6 caractères"
                                required
                            />

                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full py-2.5 text-base font-semibold shadow-sm hover:shadow-md transition-shadow mt-2"
                                isLoading={loading}
                                disabled={loading || !formData.email || !formData.firstName || !formData.lastName || !formData.client_type || !formData.password}
                            >
                                {loading ? 'Création en cours...' : 'Créer mon compte'}
                            </Button>
                        </form>
                    </div>
            </div>
        </AuthLayout>
    );
}
