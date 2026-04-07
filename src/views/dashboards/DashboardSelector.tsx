'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboardMode } from '../../contexts/DashboardContext';
import { useAuth } from '../../contexts/AuthContext';
import { ProDashboard } from './ProDashboard';
import { ClientDashboard } from './ClientDashboard';

export function DashboardSelector() {
    const { mode } = useDashboardMode();
    const { profile, loading } = useAuth();
    const router = useRouter();

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
