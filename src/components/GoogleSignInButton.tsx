import React from 'react';
import { Chrome } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface GoogleSignInButtonProps {
    mode?: 'signin' | 'signup';
    onError?: (error: string) => void;
}

export function GoogleSignInButton({ mode = 'signin', onError }: GoogleSignInButtonProps) {
    const [loading, setLoading] = React.useState(false);

    const handleGoogleSignIn = async () => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });

            if (error) {
                console.error('Google sign in error:', error);
                onError?.(error.message);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
            onError?.('Une erreur inattendue est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Chrome size={20} className="text-slate-600" />
            {loading ? (
                <span>Connexion en cours...</span>
            ) : (
                <span>
                    {mode === 'signin' ? 'Continuer avec Google' : "S'inscrire avec Google"}
                </span>
            )}
        </button>
    );
}
