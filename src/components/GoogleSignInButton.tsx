'use client'

import React from 'react';
import { supabase } from '../lib/supabase';

interface GoogleSignInButtonProps {
    mode?: 'signin' | 'signup';
    redirectTo?: string;
    onBeforeClick?: () => boolean;
    onError?: (error: string) => void;
}

export function GoogleSignInButton({ mode = 'signin', redirectTo, onBeforeClick, onError }: GoogleSignInButtonProps) {
    const [loading, setLoading] = React.useState(false);

    const handleGoogleSignIn = async () => {
        if (onBeforeClick) {
            const canProceed = onBeforeClick();
            if (!canProceed) return;
        }

        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectTo || window.location.origin,
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
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-2.5 bg-white border border-slate-200 rounded-lg font-medium text-[#3c4043] shadow-sm hover:shadow hover:bg-slate-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 48 48" aria-hidden="true" className="shrink-0">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                <path fill="none" d="M0 0h48v48H0z" />
            </svg>
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
