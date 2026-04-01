import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export type DashboardMode = 'worker' | 'recruiter';

interface DashboardContextType {
    mode: DashboardMode;
    isSwitching: boolean;
    toggleMode: () => void;
    setMode: (mode: DashboardMode) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
    const { profile } = useAuth();
    const [isSwitching, setIsSwitching] = useState(false);
    const [mode, setMode] = useState<DashboardMode>(() => {
        const saved = localStorage.getItem('dashboardMode');
        return (saved as DashboardMode) || 'worker';
    });

    // Forces recruiter mode for clients, allows switching for pros & admins
    useEffect(() => {
        if (profile && profile.role === 'client') {
            setMode('recruiter');
        }
    }, [profile]);

    // Persist mode for pro users
    useEffect(() => {
        if (profile?.role === 'pro' || profile?.role === 'admin') {
            localStorage.setItem('dashboardMode', mode);
        }
    }, [mode, profile]);

    const toggleMode = () => {
        setIsSwitching(true);
        
        // Artificial delay for high-end feel and clean state reset
        setTimeout(() => {
            setMode(prev => (prev === 'worker' ? 'recruiter' : 'worker'));
            
            // End transition after a bit more time to reveal the new UI
            setTimeout(() => {
                setIsSwitching(false);
            }, 800);
        }, 1200);
    };

    return (
        <DashboardContext.Provider value={{ mode, isSwitching, toggleMode, setMode }}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboardMode() {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboardMode must be used within a DashboardProvider');
    }
    return context;
}
