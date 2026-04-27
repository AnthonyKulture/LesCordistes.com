'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { translateAuthError } from '../lib/authErrors';

export function ResetPassword() {
    const router = useRouter();
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState(false);
    const errorRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (error && errorRef.current) {
            errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            errorRef.current.focus();
        }
    }, [error]);

    React.useEffect(() => {
        if (success && typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [success]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        if (password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (err: any) {
            setError(translateAuthError(err));
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex justify-center pt-8 sm:pt-16 pb-12 px-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <h1 className="text-2xl font-bold text-green-600">Mot de passe réinitialisé !</h1>
                    </CardHeader>
                    <CardBody>
                        <p className="text-slate-600">
                            Votre mot de passe a été mis à jour avec succès. Redirection vers la page de connexion...
                        </p>
                    </CardBody>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex justify-center pt-8 sm:pt-16 pb-12 px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <h1 className="text-2xl font-bold text-slate-900">Nouveau mot de passe</h1>
                    <p className="text-slate-600 mt-2">
                        Choisissez un nouveau mot de passe sécurisé
                    </p>
                </CardHeader>
                <CardBody>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div ref={errorRef} tabIndex={-1} className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm break-words scroll-mt-24 outline-none" role="alert">
                                {error}
                            </div>
                        )}

                        <Input
                            label="Nouveau mot de passe"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Minimum 6 caractères"
                            required
                        />

                        <Input
                            label="Confirmer le mot de passe"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Retapez votre mot de passe"
                            required
                        />

                        <div className="text-sm text-slate-600">
                            <p className="font-semibold mb-1">Votre mot de passe doit contenir :</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li className={password.length >= 6 ? 'text-green-600' : ''}>
                                    Au moins 6 caractères
                                </li>
                                <li className={password === confirmPassword && password ? 'text-green-600' : ''}>
                                    Les deux mots de passe correspondent
                                </li>
                            </ul>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? 'Mise à jour...' : 'Réinitialiser le mot de passe'}
                        </Button>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
}
