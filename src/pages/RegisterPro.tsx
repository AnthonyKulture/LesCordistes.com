import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, HardHat, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { AuthLayout } from '../components/layout/AuthLayout';

export function RegisterPro() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    
    const [formData, setFormData] = React.useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
    });
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        if (!authLoading && user) {
            navigate('/dashboard');
        }
    }, [user, authLoading, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                        role: 'pro',
                    },
                },
            });

            if (signUpError) throw signUpError;

            if (data.user) {
                const { error: profileError } = await (supabase as any)
                    .from('profiles')
                    .update({
                        full_name: formData.fullName,
                        role: 'pro',
                    })
                    .eq('id', data.user.id);

                if (profileError) console.error('Profile update error:', profileError);

                navigate('/connexion?registered=1');
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
                
                {/* Header contextuel + Retour */}
                <div className="flex flex-col items-center mb-6 relative">
                    <Link to="/inscription" className="absolute left-0 top-0 inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded px-1 -ml-1">
                        <ArrowLeft size={16} className="mr-1" /> Retour
                    </Link>
                    <div className="p-3 bg-orange-50 rounded-xl mb-3 mt-4">
                        <HardHat className="text-brand-orange" size={28} />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight text-center">Profil Cordiste</h1>
                </div>

                <div className="space-y-6">
                    <div aria-live="polite" className="empty:hidden">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start" role="alert" id="register-pro-error">
                                <span className="shrink-0 mr-2">⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    <div className="bg-green-50/70 border border-green-200/60 rounded-xl p-3 flex gap-3 mb-6 items-start text-left shadow-sm">
                        <ShieldCheck className="text-green-600 shrink-0 mt-0.5" size={20} aria-hidden="true" />
                        <div className="text-xs text-green-800 leading-relaxed font-medium">
                            Compte sécurisé. En vous inscrivant, vous acceptez nos <Link to="/cgu" className="underline hover:text-green-900">CGU</Link>, <Link to="/cgv" className="underline hover:text-green-900">CGV</Link> et notre <Link to="/confidentialite" className="underline hover:text-green-900">Politique de Confidentialité</Link>.
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
                            label="Email professionnel"
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
                            disabled={loading || !formData.email || !formData.password || !formData.fullName}
                        >
                            {loading ? 'Création en cours...' : 'Valider mon profil'}
                        </Button>
                    </form>
                </div>
            </div>
        </AuthLayout>
    );
}
