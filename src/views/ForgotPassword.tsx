'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { translateAuthError } from '../lib/authErrors';

export function ForgotPassword() {
    const router = useRouter();
    const [email, setEmail] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
            });

            if (error) throw error;

            setSuccess(true);
        } catch (err: any) {
            console.error('Password reset error:', err);
            setError(translateAuthError(err));
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <h1 className="text-2xl font-bold text-slate-900">Email envoyé !</h1>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-4">
                            <p className="text-slate-600">
                                Nous avons envoyé un lien de réinitialisation à <strong>{email}</strong>
                            </p>
                            <p className="text-sm text-slate-500">
                                Vérifiez votre boîte de réception et cliquez sur le lien pour réinitialiser votre mot de passe.
                                <strong> Pensez à vérifier vos courriers indésirables (Spam).</strong>
                            </p>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => router.push('/login')}
                            >
                                Retour à la connexion
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <h1 className="text-2xl font-bold text-slate-900">Mot de passe oublié</h1>
                    <p className="text-slate-600 mt-2">
                        Entrez votre email pour recevoir un lien de réinitialisation
                    </p>
                </CardHeader>
                <CardBody>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm break-words" role="alert">
                                {error}
                            </div>
                        )}

                        <Input
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="votre@email.com"
                            required
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                        </Button>

                        <button
                            type="button"
                            onClick={() => router.push('/login')}
                            className="w-full text-center text-sm text-slate-600 hover:text-brand-blue transition-colors"
                        >
                            Retour à la connexion
                        </button>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
}
