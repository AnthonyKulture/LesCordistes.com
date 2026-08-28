'use client'

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { createSupabaseBrowserClient } from '../lib/supabase-browser';
import type { Session, User } from '@supabase/supabase-js';
import type { Profile } from '../types';

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    signOut: () => Promise<void>;
    isAdmin: boolean;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    // Utilisateur dont le profil est déjà chargé ou en cours de chargement.
    // Garde de déduplication : au montage, getSession() et l'événement INITIAL_SESSION
    // arrivent tous les deux et déclencheraient sinon deux requêtes `profiles`.
    const profileUserIdRef = useRef<string | null>(null);

    const loadProfile = useCallback(async (userId: string, silent = false) => {
        const supabase = createSupabaseBrowserClient();
        profileUserIdRef.current = userId;
        if (!silent) setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            // Réponse obsolète (déconnexion ou changement d'utilisateur pendant le vol) :
            // la garde de déduplication ne pointe plus sur `userId` → on ignore le résultat
            // au lieu de réinjecter le profil d'un utilisateur qui n'est plus connecté.
            const stale = profileUserIdRef.current !== userId;

            if (error) {
                if ((error as { code?: string }).code === 'PGRST116') {
                    if (!stale) profileUserIdRef.current = null;
                    return;
                }
                throw error;
            }
            if (!stale) setProfile(data);
        } catch (error) {
            if (profileUserIdRef.current === userId) profileUserIdRef.current = null;
            const msg = (error as { message?: string })?.message ?? JSON.stringify(error);
            console.error('Error loading profile:', msg);
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    const refreshProfile = async () => {
        if (user) {
            await loadProfile(user.id, true);
        }
    };

    useEffect(() => {
        const supabase = createSupabaseBrowserClient();
        let cancelled = false;

        const syncSession = (session: Session | null, allowSilentRefresh: boolean) => {
            const nextUser = session?.user ?? null;
            setUser(nextUser);

            if (!nextUser) {
                profileUserIdRef.current = null;
                setProfile(null);
                setLoading(false);
                return;
            }

            if (profileUserIdRef.current === nextUser.id) {
                // Profil déjà chargé ou en vol : ne pas toucher à `loading`, sinon
                // (protected)/layout.tsx affiche son spinner et démonte l'arbre protégé.
                if (allowSilentRefresh) void loadProfile(nextUser.id, true);
                return;
            }

            void loadProfile(nextUser.id);
        };

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!cancelled) syncSession(session, false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            if (cancelled) return;
            // TOKEN_REFRESHED (~55 min) ne change ni l'utilisateur ni son profil.
            if (event === 'TOKEN_REFRESHED') return;
            syncSession(session, event === 'SIGNED_IN' || event === 'USER_UPDATED');
        });

        return () => {
            cancelled = true;
            subscription.unsubscribe();
        };
    }, [loadProfile]);

    const signOut = async () => {
        const supabase = createSupabaseBrowserClient();
        try {
            await supabase.auth.signOut({ scope: 'local' });
        } catch (err) {
            console.warn('[auth] signOut API failed, forcing local cleanup', err);
        }
        setUser(null);
        setProfile(null);
        // Si signOut() a levé, l'événement SIGNED_OUT n'est pas émis : la garde de
        // déduplication resterait sur l'ancien userId et une reconnexion du MÊME
        // utilisateur passerait par le chemin silencieux (loading=false, profile=null).
        profileUserIdRef.current = null;
        if (typeof window !== 'undefined') {
            try {
                Object.keys(window.localStorage).forEach((k) => {
                    if (k.startsWith('sb-') && k.endsWith('-auth-token')) {
                        window.localStorage.removeItem(k);
                    }
                });
            } catch {}
        }
    };

    const isAdmin = profile?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, profile, loading, signOut, isAdmin, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
