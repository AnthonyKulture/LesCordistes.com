import { useDashboardMode } from '../../contexts/DashboardContext';
import { useAuth } from '../../contexts/AuthContext';
import { ProDashboard } from './ProDashboard';
import { ClientDashboard } from './ClientDashboard';
import { Navigate } from 'react-router-dom';

export function DashboardSelector() {
    const { mode } = useDashboardMode();
    const { profile, loading } = useAuth();

    if (loading) return null;

    if (!profile) {
        return <Navigate to="/login" replace />;
    }

    // Admins see a specific dashboard (or we could let them use the pro one)
    if (profile.role === 'admin') {
        return <Navigate to="/admin" replace />;
    }

    // Logic: 
    // If Pro -> Switch based on mode
    // If Client -> Always show ClientDashboard
    if (profile.role === 'client') {
        return <ClientDashboard key="client-dash" />;
    }

    return mode === 'worker' 
        ? <ProDashboard key="pro-worker-dash" /> 
        : <ClientDashboard key="pro-recruiter-dash" />;
}
