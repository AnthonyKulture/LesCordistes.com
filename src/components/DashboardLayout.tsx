'use client'

import React from 'react';
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard,
    Briefcase,
    User,
    LogOut,
    Menu,
    X,
    Shield,
    MessageCircle,
    Star,
    Coins,
    Zap
} from 'lucide-react';
import { ModeSwitcher } from './layout/ModeSwitcher';
import { useDashboardMode } from '../contexts/DashboardContext';
import { ModeTransitionOverlay } from './layout/ModeTransitionOverlay';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    ;
    const router = useRouter();
    const pathname = usePathname();
    const { user, profile, signOut } = useAuth();
    const { mode, setMode } = useDashboardMode();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    const menuItems = React.useMemo(() => {
        const dashboardItem = { icon: LayoutDashboard, label: 'Tableau de bord', path: '/dashboard' };
        const items = [];

        // Client (Purely recruiter role)
        if (profile?.role === 'client') {
            items.push(
                dashboardItem,
                { icon: MessageCircle, label: 'Messages', path: '/messages' },
                { icon: User, label: 'Mon compte', path: '/profile' },
            );
        }

        // Pro (Dual mode)
        if (profile?.role === 'pro') {
            if (mode === 'worker') {
                items.push(
                    dashboardItem,
                    { icon: Briefcase, label: 'Trouver des missions', path: '/jobs' },
                    { icon: Zap, label: 'Mes demandes de renfort', path: '/dashboard', action: () => setMode('recruiter') },
                    { icon: MessageCircle, label: 'Messagerie', path: '/messages' },
                    { icon: Star, label: 'Mes avis', path: user ? `/pros/${user.id}` : '/profile' },
                    { icon: Coins, label: 'Mes crédits', path: '/credits' },
                    { icon: User, label: 'Mon profil pro', path: '/profile' },
                );
            } else {
                // Recruiter mode (Pro acting as recruiter)
                items.push(
                    dashboardItem,
                    { icon: Briefcase, label: 'Demander du renfort', path: '/post-job?type=renfort_pro' },
                    { icon: LayoutDashboard, label: 'Passer en Mode Cordiste', path: '/dashboard', action: () => setMode('worker') },
                    { icon: MessageCircle, label: 'Messagerie', path: '/messages' },
                    { icon: Coins, label: 'Mes crédits', path: '/credits' },
                    { icon: User, label: 'Mon profil pro', path: '/profile' },
                );
            }
        }

        // Admin
        if (profile?.role === 'admin') {
            items.push(
                { icon: Shield, label: 'Admin', path: '/admin' },
                dashboardItem,
                { icon: Briefcase, label: 'Toutes les missions', path: '/jobs' },
                { icon: User, label: 'Utilisateurs', path: '/profile' },
            );
        }

        return items;
    }, [profile?.role, mode, user?.id]);

    return (
        <div className="min-h-screen bg-slate-50">
            <ModeTransitionOverlay />
            
            {/* Mobile menu button — positioned below the sticky Header */}
            <div className="lg:hidden fixed top-20 left-4 z-40">
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 bg-white rounded-lg shadow-md border border-slate-200"
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar — full height, above header */}
            <aside
                className={`
                    fixed top-0 left-0 h-screen w-64 bg-white border-r border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] z-50 transform transition-transform duration-300 ease-in-out
                    ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0
                `}
            >
                {/* Sidebar Header/Logo area could go here if needed, but App.tsx has Logo in Header */}
                <div className="h-20 lg:h-16 flex items-center px-6 border-b border-slate-50">
                    <span className="font-black text-brand-blue tracking-tighter text-xl">DASHBOARD</span>
                </div>

                <nav className="px-3 pt-6 space-y-1 overflow-y-auto h-[calc(100vh-210px)]">
                    {menuItems.map((item, idx) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.path && !(item as any).action;

                        return (
                            <Link
                                key={`${item.path}-${idx}`}
                                href={item.path}
                                className={`
                                    relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group
                                    ${isActive
                                        ? 'bg-blue-50/50 text-brand-blue font-bold shadow-sm shadow-brand-blue/5'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'
                                    }
                                `}
                                onClick={() => {
                                    if ((item as any).action) (item as any).action();
                                    setMobileMenuOpen(false);
                                }}
                            >
                                {/* Indicator line for active item */}
                                {isActive && (
                                    <div className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-brand-blue rounded-r-full" />
                                )}
                                
                                <Icon size={18} className={`${isActive ? 'text-brand-blue' : 'text-slate-400 group-hover:text-slate-600'} transition-colors`} />
                                <span className="text-[13px]">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-3 bg-white border-t border-slate-50 shadow-[0_-5px_15px_rgba(0,0,0,0.01)]">
                    <div className="mb-3">
                        <ModeSwitcher />
                    </div>
                    
                    <div className="mb-3 px-3 py-2 bg-slate-50 rounded-xl flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-black text-xs">
                            {profile?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-slate-900 truncate tracking-tight">{profile?.full_name || user?.email}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                {profile?.role === 'pro' && mode === 'recruiter' ? 'Mode Recruteur' : (profile?.role || 'Compte')}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2.5 px-4 py-2.5 w-full text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all text-xs font-bold group"
                    >
                        <LogOut size={16} className="text-slate-300 group-hover:text-red-500" />
                        <span>Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="lg:ml-64 min-h-screen">
                <div className="p-4 lg:p-8">
                    {children}
                </div>
            </main>

            {/* Mobile overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}
        </div>
    );
}
