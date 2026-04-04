'use client'

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
    Menu, 
    X, 
    LogOut, 
    MessageCircle, 
    Briefcase, 
    HardHat, 
    User, 
    LayoutDashboard, 
    Settings,
    ChevronDown,
    Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useMessaging } from '../../hooks/useMessaging';
import { useDashboardMode } from '../../contexts/DashboardContext';
import { Button } from '../ui/Button';
import { NotificationBell } from '../notifications/NotificationBell';

export const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const { user, profile, signOut } = useAuth();
    const { mode, toggleMode, isSwitching } = useDashboardMode();
    const { globalUnreadCount } = useMessaging();
    const router = useRouter();
    const pathname = usePathname();

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close menus on route change
    useEffect(() => {
        setIsMenuOpen(false);
        setIsProfileOpen(false);
    }, [pathname]);

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    const isPro = profile?.role === 'pro';
    const isClient = profile?.role === 'client';
    const isAdmin = profile?.role === 'admin';

    // CTA Logic based on user state and mode
    let showHeaderCTA = true;
    let ctaLabel = 'Publier un projet';
    let ctaUrl = '/post-job';
    let ctaVariant: 'primary' | 'outline' = 'primary';
    let ctaIcon = <Plus size={18} />;

    if (user) {
        if (isPro || isAdmin) {
            if (mode === 'recruiter') {
                ctaLabel = 'Recruter du renfort';
                ctaUrl = '/post-job?type=renfort_pro';
                ctaVariant = 'outline';
            } else {
                ctaLabel = 'Missions disponibles';
                ctaUrl = '/jobs';
                ctaVariant = 'primary';
                ctaIcon = <Briefcase size={18} />;
            }
        } else if (isClient) {
            ctaLabel = 'Publier un projet';
            ctaUrl = '/post-job';
        }
    }

    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-24">
                    {/* LEFT: Logo & Secondary Nav */}
                    <div className="flex items-center gap-12 flex-shrink-0">
                        <Link href="/" className="flex items-center">
                            <img
                                src="/lescordistes.comFichier 10.png"
                                alt="LesCordistes Logo"
                                className="h-14 w-auto object-contain hover:opacity-90 transition-opacity"
                            />
                        </Link>

                        {/* Secondary Navigation (Desktop) - Only for visitors */}
                        {!user && (
                            <nav className="hidden xl:flex items-center gap-8">
                                <a href="#how-it-works" className="text-sm font-bold text-slate-500 hover:text-brand-blue transition-colors">
                                    Comment ça marche ?
                                </a>
                            </nav>
                        )}
                    </div>

                    {/* CENTER: Role Switcher (Desktop) */}
                    <div className="hidden lg:flex flex-1 justify-center px-4">
                        {user && (isPro || isAdmin) && (
                            <div className="flex bg-slate-100/50 p-1 rounded-2xl border border-slate-200/50 shadow-inner">
                                <button
                                    onClick={() => mode !== 'worker' && toggleMode()}
                                    disabled={isSwitching}
                                    className={`relative flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                        mode === 'worker' 
                                        ? 'bg-white text-brand-blue shadow-sm ring-1 ring-slate-200' 
                                        : 'text-slate-400 hover:text-slate-600'
                                    } ${isSwitching ? 'opacity-50 cursor-wait' : ''}`}
                                >
                                    <HardHat size={14} className={mode === 'worker' ? 'text-brand-blue' : 'text-slate-400'} />
                                    Recherche missions
                                    {mode === 'worker' && (
                                        <motion.div layoutId="switcher-bg" className="absolute inset-0 bg-white rounded-xl -z-10 shadow-sm ring-1 ring-slate-200" />
                                    )}
                                </button>
                                <button
                                    onClick={() => mode !== 'recruiter' && toggleMode()}
                                    disabled={isSwitching}
                                    className={`relative flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                        mode === 'recruiter' 
                                        ? 'bg-white text-orange-600 shadow-sm ring-1 ring-orange-100' 
                                        : 'text-slate-400 hover:text-slate-600'
                                    } ${isSwitching ? 'opacity-50 cursor-wait' : ''}`}
                                >
                                    <Briefcase size={14} className={mode === 'recruiter' ? 'text-orange-500' : 'text-slate-400'} />
                                    Mode Recruteur
                                    {mode === 'recruiter' && (
                                        <motion.div layoutId="switcher-bg" className="absolute inset-0 bg-white rounded-xl -z-10 shadow-sm ring-1 ring-orange-100" />
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Actions */}
                    <div className="hidden md:flex items-center gap-4 lg:gap-6 flex-shrink-0">
                        {!user ? (
                            <div className="flex items-center gap-4 border-r border-slate-100 pr-4 mr-2">
                                <Link 
                                    href="/connexion" 
                                    className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-brand-blue transition-all px-3 py-2 rounded-xl hover:bg-slate-50 border-1 border-transparent hover:border-slate-100"
                                >
                                    <User size={18} className="text-slate-400 group-hover:text-brand-blue" />
                                    Connexion
                                </Link>
                                <Link href="/jobs">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50 font-black shadow-sm hover:shadow-md transition-all whitespace-nowrap"
                                    >
                                        Trouver des missions
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 lg:gap-6 border-r border-slate-100 pr-4 mr-2">
                                <Link 
                                    href="/messages" 
                                    className="p-2 text-slate-500 hover:text-brand-blue transition-all hover:bg-slate-50 rounded-xl relative group"
                                    title="Messages"
                                >
                                    <MessageCircle size={22} strokeWidth={2} />
                                    <span className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-[10px] text-white font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm transition-opacity ${globalUnreadCount > 0 ? 'opacity-100' : 'opacity-0'}`}>
                                        {globalUnreadCount > 99 ? '99+' : globalUnreadCount}
                                    </span>
                                </Link>

                                <NotificationBell />

                                {/* Profile Dropdown */}
                                <div className="relative" ref={profileRef}>
                                    <button 
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="flex items-center gap-2 p-1 pr-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all border border-slate-200/50 group"
                                    >
                                        <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-brand-blue shadow-sm border border-slate-200/50 font-bold overflow-hidden ring-2 ring-transparent group-hover:ring-brand-blue/10 transition-all">
                                            {profile?.avatar_url ? (
                                                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={20} />
                                            )}
                                        </div>
                                        <div className="hidden lg:block text-left">
                                            <p className="text-xs font-black text-slate-800 leading-tight truncate max-w-[80px]">
                                                {profile?.full_name?.split(' ')[0] || 'Profil'}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 capitalize">
                                                {profile?.role}
                                            </p>
                                        </div>
                                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {isProfileOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-3 w-64 bg-white rounded-[24px] shadow-2xl border border-slate-100 overflow-hidden py-2 z-50"
                                            >
                                                <div className="px-5 py-4 border-b border-slate-50 mb-2">
                                                    <p className="text-sm font-black text-slate-900 truncate">{profile?.full_name || user.email}</p>
                                                    <p className="text-xs font-medium text-slate-500 truncate">{user.email}</p>
                                                </div>

                                                <Link href="/dashboard" className="flex items-center gap-3 px-5 py-3 text-slate-600 hover:bg-slate-50 hover:text-brand-blue transition-colors font-bold text-sm">
                                                    <LayoutDashboard size={18} />
                                                    Tableau de bord
                                                </Link>
                                                
                                                {profile?.role === 'admin' && (
                                                    <Link href="/admin" className="flex items-center gap-3 px-5 py-3 text-slate-600 hover:bg-slate-50 hover:text-brand-blue transition-colors font-bold text-sm">
                                                        <Settings size={18} />
                                                        Administration
                                                    </Link>
                                                )}

                                                <Link href="/profile" className="flex items-center gap-3 px-5 py-3 text-slate-600 hover:bg-slate-50 hover:text-brand-blue transition-colors font-bold text-sm">
                                                    <User size={18} />
                                                    Mon Profil
                                                </Link>

                                                <div className="px-2 mt-2 pt-2 border-t border-slate-50">
                                                    <button
                                                        onClick={handleSignOut}
                                                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-bold text-sm"
                                                    >
                                                        <LogOut size={18} />
                                                        Déconnexion
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}

                        {/* Far Right Primary CTA */}
                        {showHeaderCTA && (
                            <Button 
                                variant={ctaVariant}
                                size="sm"
                                onClick={() => router.push(ctaUrl)}
                                className={`flex items-center gap-2 font-bold px-6 shadow-lg shadow-brand-blue/10 ${
                                    ctaVariant === 'outline' 
                                    ? 'border-orange-200 text-orange-700 bg-orange-50/50 hover:bg-orange-50' 
                                    : 'bg-brand-blue hover:bg-brand-blue/90'
                                }`}
                            >
                                {ctaIcon}
                                {ctaLabel}
                            </Button>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex md:hidden items-center gap-4">
                        {user && <NotificationBell />}
                        <button
                            className="p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden overflow-hidden border-t border-slate-100"
                        >
                            <nav className="flex flex-col py-6 gap-6">
                                {(isPro || isAdmin) && (
                                    <div className="flex bg-slate-100 rounded-2xl p-1 border border-slate-200">
                                        <button
                                            onClick={() => mode !== 'worker' && toggleMode()}
                                            disabled={isSwitching}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                                mode === 'worker' 
                                                ? 'bg-white text-brand-blue shadow-sm' 
                                                : 'text-slate-500'
                                            }`}
                                        >
                                            <HardHat size={16} />
                                            Recherche missions
                                        </button>
                                        <button
                                            onClick={() => mode !== 'recruiter' && toggleMode()}
                                            disabled={isSwitching}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                                mode === 'recruiter' 
                                                ? 'bg-white text-orange-600 shadow-sm' 
                                                : 'text-slate-500'
                                            }`}
                                        >
                                            <Briefcase size={16} />
                                            Mode Recruteur
                                        </button>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 gap-4">
                                    {showHeaderCTA && (
                                        <Link 
                                            href={ctaUrl}
                                            className={`flex items-center justify-center gap-2 h-14 rounded-2xl font-black text-sm transition-all ${
                                                ctaVariant === 'outline'
                                                ? 'bg-orange-50 text-orange-700 border-2 border-orange-100'
                                                : 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20'
                                            }`}
                                        >
                                            {ctaIcon}
                                            {ctaLabel}
                                        </Link>
                                    )}
                                    <Link href="/messages" className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl text-slate-700 font-bold">
                                        <MessageCircle size={20} />
                                        Messages
                                    </Link>
                                    <Link href="/dashboard" className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl text-slate-700 font-bold">
                                        <LayoutDashboard size={20} />
                                        Tableau de bord
                                    </Link>
                                    <button
                                        onClick={handleSignOut}
                                        className="flex items-center gap-3 p-4 bg-red-50 rounded-2xl text-red-600 font-bold"
                                    >
                                        <LogOut size={20} />
                                        Déconnexion
                                    </button>
                                </div>
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
};
;
