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
    Plus,
    Mail,
    Phone,
    ArrowRight
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
    const [contactInfo, setContactInfo] = useState({ email: '', phone: '', emailHref: '', phoneHref: '' });

    useEffect(() => {
        const e = ['anthony', String.fromCharCode(64), 'lescordistes.com'].join('');
        setContactInfo({
            email: e,
            phone: '+33 6 60 50 16 82',
            emailHref: 'mailto:' + e,
            phoneHref: 'tel:+33660501682',
        });
    }, []);
    const profileRef = useRef<HTMLDivElement>(null);
    const { user, profile, signOut } = useAuth();
    const { mode, toggleMode, isSwitching } = useDashboardMode();
    const { globalUnreadCount } = useMessaging();
    const router = useRouter();
    const pathname = usePathname();

    // L'admin a son propre shell (sidebar + header). On masque le header public
    // pour éviter le conflit z-index sur sidebar desktop + drawer mobile.
    const isAdminRoute = pathname?.startsWith('/admin') ?? false;

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

    // Body scroll lock when mobile menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMenuOpen]);

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

    if (isAdminRoute) return null;

    return (
        <>
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-24">
                    {/* LEFT: Logo & Secondary Nav */}
                    <div className="flex items-center gap-12 flex-shrink-0">
                        <Link href="/" className="flex items-center">
                            <img
                                src="/logo-lescordistes.com.svg"
                                alt="LesCordistes Logo"
                                width={220}
                                height={60}
                                className="h-14 w-auto object-contain hover:opacity-90 transition-opacity"
                            />
                        </Link>

                        {/* Secondary Navigation (Desktop) - Only for visitors */}
                        {!user && (
                            <nav className="hidden xl:flex items-center gap-8">
                                <button
                                    onClick={() => {
                                        if (pathname === '/') {
                                            document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                                        } else {
                                            router.push('/#how-it-works');
                                        }
                                    }}
                                    className="text-sm font-bold text-slate-500 hover:text-brand-blue transition-colors"
                                >
                                    Comment ça marche ?
                                </button>
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
                            <>
                                <Link href="/jobs">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50 font-black shadow-sm hover:shadow-md transition-all whitespace-nowrap"
                                    >
                                        Trouver des missions
                                    </Button>
                                </Link>
                                <div className="h-5 w-px bg-slate-200" />
                            </>
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

                        {/* Connexion — extrême droite, non connecté seulement */}
                        {!user && (
                            <Link
                                href="/connexion"
                                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-blue transition-all px-3 py-2 rounded-xl hover:bg-slate-50 whitespace-nowrap"
                            >
                                <User size={15} className="text-slate-400" />
                                S'inscrire / Se connecter
                            </Link>
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

            </div>
        </header>

        {/* Mobile Fullscreen Menu */}
        <AnimatePresence>
            {isMenuOpen && (
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'tween', duration: 0.28, ease: 'easeInOut' }}
                    className="fixed inset-0 z-[60] bg-white flex flex-col md:hidden"
                >
                    {/* Top bar */}
                    <div className="flex items-center justify-between px-5 h-24 border-b border-slate-100 flex-shrink-0">
                        <Link href="/" onClick={() => setIsMenuOpen(false)}>
                            <img src="/logo-lescordistes.com.svg" alt="LesCordistes" width={200} height={56} className="h-12 w-auto object-contain" />
                        </Link>
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="p-2 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Nav links */}
                    <div className="flex-1 overflow-y-auto px-5 py-6">
                        {!user ? (
                            <nav className="flex flex-col">
                                <Link
                                    href="/post-job"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-between py-5 border-b border-slate-100 text-slate-900 font-bold text-lg group"
                                >
                                    Publier un projet
                                    <ArrowRight size={18} className="text-slate-300 group-hover:text-brand-blue transition-colors" />
                                </Link>
                                <Link
                                    href="/jobs"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-between py-5 border-b border-slate-100 text-orange-600 font-bold text-lg group"
                                >
                                    Trouver des missions
                                    <ArrowRight size={18} className="text-orange-200 group-hover:text-orange-500 transition-colors" />
                                </Link>
                                <Link
                                    href="/#how-it-works"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-between py-5 border-b border-slate-100 text-slate-600 font-semibold text-base group"
                                >
                                    Comment ça marche ?
                                    <ArrowRight size={18} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
                                </Link>
                                <Link
                                    href="/credits"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-between py-5 border-b border-slate-100 text-slate-600 font-semibold text-base group"
                                >
                                    Tarifs
                                    <ArrowRight size={18} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
                                </Link>
                                <Link
                                    href="/connexion"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-between py-5 text-slate-500 font-semibold text-base group"
                                >
                                    S'inscrire / Se connecter
                                    <ArrowRight size={18} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
                                </Link>
                            </nav>
                        ) : (
                            <nav className="flex flex-col">
                                {(isPro || isAdmin) && (
                                    <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200/80 mb-6">
                                        <button
                                            onClick={() => mode !== 'worker' && toggleMode()}
                                            disabled={isSwitching}
                                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wide transition-all ${
                                                mode === 'worker' ? 'bg-white text-brand-blue shadow-sm' : 'text-slate-400'
                                            }`}
                                        >
                                            <HardHat size={13} />
                                            Missions
                                        </button>
                                        <button
                                            onClick={() => mode !== 'recruiter' && toggleMode()}
                                            disabled={isSwitching}
                                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wide transition-all ${
                                                mode === 'recruiter' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400'
                                            }`}
                                        >
                                            <Briefcase size={13} />
                                            Recruteur
                                        </button>
                                    </div>
                                )}
                                <Link href={ctaUrl} onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between py-5 border-b border-slate-100 text-brand-blue font-bold text-lg group">
                                    {ctaLabel}
                                    <ArrowRight size={18} className="text-slate-300 group-hover:text-brand-blue transition-colors" />
                                </Link>
                                <Link href="/messages" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between py-5 border-b border-slate-100 text-slate-800 font-semibold text-base group">
                                    <span className="flex items-center gap-3">
                                        Messages
                                        {globalUnreadCount > 0 && (
                                            <span className="min-w-[20px] h-5 px-1.5 bg-red-500 text-[10px] text-white font-black flex items-center justify-center rounded-full">
                                                {globalUnreadCount > 99 ? '99+' : globalUnreadCount}
                                            </span>
                                        )}
                                    </span>
                                    <ArrowRight size={18} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
                                </Link>
                                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between py-5 border-b border-slate-100 text-slate-800 font-semibold text-base group">
                                    Tableau de bord
                                    <ArrowRight size={18} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
                                </Link>
                                <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between py-5 border-b border-slate-100 text-slate-800 font-semibold text-base group">
                                    Mon Profil
                                    <ArrowRight size={18} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
                                </Link>
                                {isAdmin && (
                                    <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between py-5 border-b border-slate-100 text-slate-800 font-semibold text-base group">
                                        Administration
                                        <ArrowRight size={18} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
                                    </Link>
                                )}
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center justify-between py-5 text-red-500 font-semibold text-base w-full group"
                                >
                                    Déconnexion
                                    <LogOut size={18} className="text-red-200 group-hover:text-red-400 transition-colors" />
                                </button>
                            </nav>
                        )}
                    </div>

                    {/* Contact footer */}
                    <div className="border-t border-slate-100 px-5 py-6 flex-shrink-0">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4">Contact</p>
                        <a
                            href={contactInfo.emailHref || '#'}
                            className="flex items-center gap-3 text-slate-700 font-semibold text-sm mb-3 hover:text-brand-blue transition-colors"
                        >
                            <Mail size={16} className="text-brand-blue flex-shrink-0" />
                            {contactInfo.email || '···'}
                        </a>
                        <a
                            href={contactInfo.phoneHref || '#'}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue/90 transition-colors"
                        >
                            <Phone size={15} className="flex-shrink-0" />
                            Nous appeler
                        </a>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
        </>
    );
};
