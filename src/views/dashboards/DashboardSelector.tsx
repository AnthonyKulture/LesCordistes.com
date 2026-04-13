'use client'

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboardMode } from '../../contexts/DashboardContext';
import { useAuth } from '../../contexts/AuthContext';
import { createSupabaseBrowserClient } from '../../lib/supabase-browser';
import { ProDashboard } from './ProDashboard';
import { ClientDashboard } from './ClientDashboard';

const PRO_KEY = 'lescordistes_pro_reg';
const CLIENT_KEY = 'lescordistes_client_reg';

export function DashboardSelector() {
    const { mode } = useDashboardMode();
    const { profile, user, loading, refreshProfile } = useAuth();
    const router = useRouter();
    const applied = useRef(false);

    // Apply pending registration data from localStorage (set before magic link)
    useEffect(() => {
        if (loading || !user || !profile || applied.current) return;

        const proRaw = typeof window !== 'undefined' ? localStorage.getItem(PRO_KEY) : null;
        const clientRaw = typeof window !== 'undefined' ? localStorage.getItem(CLIENT_KEY) : null;

        if (!proRaw && !clientRaw) return;
        applied.current = true;

        const supabase = createSupabaseBrowserClient();

        if (proRaw) {
            try {
                const data = JSON.parse(proRaw);
                localStorage.removeItem(PRO_KEY);
                const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ') || null;
                (supabase.from('profiles') as any).update({
                    first_name: data.firstName || null,
                    last_name: data.lastName || null,
                    full_name: fullName,
                    company_name: (!data.isAutoEntrepreneur && data.companyName) ? data.companyName : null,
                    role: 'pro',
                }).eq('id', user.id).then(async () => {
                    await refreshProfile();
                    supabase.functions.invoke('send-email', {
                        body: {
                            to: data.email || user.email,
                            subject: 'Votre profil pro est actif — LesCordistes.com',
                            templateId: 'welcome-pro',
                            data: { name: data.firstName || '' },
                        },
                    }).catch(() => {});
                    router.replace('/dashboard/pro?welcome=pro');
                });
            } catch {
                localStorage.removeItem(PRO_KEY);
            }
        } else if (clientRaw) {
            try {
                const data = JSON.parse(clientRaw);
                localStorage.removeItem(CLIENT_KEY);
                const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ') || null;
                (supabase.from('profiles') as any).update({
                    first_name: data.firstName || null,
                    last_name: data.lastName || null,
                    full_name: fullName,
                    role: 'client',
                    client_type: data.client_type || null,
                }).eq('id', user.id).then(async () => {
                    await refreshProfile();
                    supabase.functions.invoke('send-email', {
                        body: {
                            to: data.email || user.email,
                            subject: 'Bienvenue sur LesCordistes.com',
                            templateId: 'welcome-client',
                            data: { name: data.firstName || '' },
                        },
                    }).catch(() => {});
                    router.replace('/dashboard/client?welcome=client');
                });
            } catch {
                localStorage.removeItem(CLIENT_KEY);
            }
        }
    }, [loading, user, profile, router, refreshProfile]);

    useEffect(() => {
        if (!loading && !profile) {
            router.replace('/connexion');
        }
        if (!loading && profile && !profile.role) {
            router.replace('/choisir-role');
        }
        if (!loading && profile?.role === 'admin') {
            router.replace('/admin');
        }
    }, [loading, profile, router]);

    if (loading) return null;
    if (!profile) return null;
    if (!profile.role) return null;
    if (profile.role === 'admin') return null;

    if (profile.role === 'client') {
        return <ClientDashboard key="client-dash" />;
    }

    return mode === 'worker'
        ? <ProDashboard key="pro-worker-dash" />
        : <ClientDashboard key="pro-recruiter-dash" />;
}
