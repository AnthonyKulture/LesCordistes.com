'use client'

import React from 'react';
import { useRouter } from 'next/navigation'
import Link from 'next/link';
import { ShieldCheck, Building2, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useAuth } from '../contexts/AuthContext';
import { AuthLayout } from '../components/layout/AuthLayout';

export function RegisterClient() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useRouter();
    
    const [formData, setFormData] = React.useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        client_type: '',
    });
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        if (!authLoading && user) {
            router.push('/dashboard');
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
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        role: 'client',
                    },
                },
            });

            if (signUpError) throw signUpError;

            if (data.user) {
                const { error: profileError } = await (supabase as any)
                    .from('profiles')
                    .update({
                        full_name: formData.fullName,
                        role: 'client',
                        client_type: formData.client_type,
                    })
                    .eq('id', data.user.id);

                if (profileError) console.error('Profile update error:', profileError);

                router.push('/connexion?registered=1');
            }
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue lors de l\'inscription');
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
                
                {/* Header contextuel + Retour */}
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
                    <div aria-live="polite" className="empty:hidden">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start" role="alert" id="register-client-error">
                                <span className="shrink-0 mr-2">⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    <div className="bg-green-50/70 border border-green-200/60 rounded-xl p-3 flex gap-3 mb-6 items-start text-left shadow-sm">
                        <ShieldCheck className="text-green-600 shrink-0 mt-0.5" size={20} aria-hidden="true" />
                        <div className="text-xs text-green-800 leading-relaxed font-medium">
                            Compte sécurisé. En vous inscrivant, vous acceptez nos <Link href="/cgu" className="underline hover:text-green-900">CGU</Link>, <Link href="/cgv" className="underline hover:text-green-900">CGV</Link> et notre <Link href="/confidentialite" className="underline hover:text-green-900">Politique de Confidentialité</Link>.
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        
                        <Select
                            label="Vous êtes *"
                            name="client_type"
                            value={formData.client_type}
                            onChange={handleChange}
                            required
                            aria-required="true"
                            aria-invalid={!!error ? "true" : "false"}
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
                                { value: 'agence_interim', label: '🏢 Agence d\'intérim spécialisée' },
                                { value: 'autre_pro', label: '🤝 Autre professionnel' },
                            ]}
                        />

                        <Input
                            label="Nom et Prénom"
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="ex: Jean Dupont"
                            required
                            aria-required="true"
                            aria-invalid={!!error ? "true" : "false"}
                        />

                        <Input
                            label="Email de contact"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="votre@email.com"
                            required
                            aria-required="true"
                            aria-invalid={!!error ? "true" : "false"}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <Input
                                label="Mot de passe"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Min. 6 caractères"
                                required
                                aria-required="true"
                            />

                            <Input
                                label="Confirmation"
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Le même"
                                required
                                aria-required="true"
                            />
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full py-2.5 text-base font-semibold shadow-sm hover:shadow-md transition-shadow mt-4"
                            disabled={loading || !formData.email || !formData.password || !formData.fullName || !formData.client_type}
                        >
                            {loading ? 'Création en cours...' : 'Créer mon espace client'}
                        </Button>
                    </form>
                </div>
            </div>
        </AuthLayout>
    );
}
