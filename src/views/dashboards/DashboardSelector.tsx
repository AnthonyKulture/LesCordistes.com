'use client'

import { useEffect, useRef, useState } from 'react';
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
    // true tant qu'un upsert de registration est en cours — bloque le redirect /connexion
    const [applying, setApplying] = useState(false);

    // Applique les données d'inscription depuis localStorage (posées avant le magic link)
    useEffect(() => {
        if (loading || !user || applied.current) return;

        const proRaw = typeof window !== 'undefined' ? localStorage.getItem(PRO_KEY) : null;
        const clientRaw = typeof window !== 'undefined' ? localStorage.getItem(CLIENT_KEY) : null;

        if (!proRaw && !clientRaw) return;

        applied.current = true;
        setApplying(true);

        const supabase = createSupabaseBrowserClient();

        const finish = async (redirectTo: string) => {
            await refreshProfile();
            setApplying(false);
            router.replace(redirectTo);
        };

        if (proRaw) {
            try {
                const data = JSON.parse(proRaw);
                localStorage.removeItem(PRO_KEY);
                const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ') || null;
                (supabase.from('profiles') as any).upsert({
                    id:           user.id,
                    email:        user.email,
                    role:         'pro',
                    first_name:   data.firstName || null,
                    last_name:    data.lastName  || null,
                    full_name:    fullName,
                    phone:        data.phone     || null,
                    company_name: (!data.isAutoEntrepreneur && data.companyName) ? data.companyName : null,
                }, { onConflict: 'id' }).then(() => {
                    supabase.functions.invoke('send-email', {
                        body: {
                            to: data.email || user.email,
                            subject: 'Votre profil pro est actif — LesCordistes.com',
                            templateId: 'welcome-pro',
                            data: { name: data.firstName || '' },
                        },
                    }).catch(() => {});
                    finish('/dashboard/pro?welcome=pro');
                }).catch(() => finish('/dashboard/pro'));
            } catch {
                localStorage.removeItem(PRO_KEY);
                setApplying(false);
            }
        } else if (clientRaw) {
            try {
                const data = JSON.parse(clientRaw);
                localStorage.removeItem(CLIENT_KEY);
                const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ') || null;
                (supabase.from('profiles') as any).upsert({
                    id:          user.id,
                    email:       user.email,
                    role:        'client',
                    first_name:  data.firstName  || null,
                    last_name:   data.lastName   || null,
                    full_name:   fullName,
                    client_type: data.client_type || null,
                }, { onConflict: 'id' }).then(() => {
                    supabase.functions.invoke('send-email', {
                        body: {
                            to: data.email || user.email,
                            subject: 'Bienvenue sur LesCordistes.com',
                            templateId: 'welcome-client',
                            data: { name: data.firstName || '' },
                        },
                    }).catch(() => {});
                    finish('/dashboard/client?welcome=client');
                }).catch(() => finish('/dashboard/client'));
            } catch {
                localStorage.removeItem(CLIENT_KEY);
                setApplying(false);
            }
        }
    }, [loading, user, router, refreshProfile]);

    // Redirections — bloquées si un upsert de registration est en cours
    useEffect(() => {
        if (applying) return;
        if (!loading && !profile) {
            router.replace('/connexion');
        }
        if (!loading && profile && !profile.role) {
            router.replace('/choisir-role');
        }
        if (!loading && profile?.role === 'admin') {
            router.replace('/admin');
        }
    }, [loading, profile, applying, router]);

    if (loading || applying) return null;
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
