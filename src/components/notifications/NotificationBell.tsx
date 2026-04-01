import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, CheckCheck, Briefcase, Star, Coins, MessageCircle, Info, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications, type Notification } from '../../hooks/useNotifications';

const notifIcons: Record<string, React.FC<any>> = {
    job_approved: Briefcase,
    job_rejected: Briefcase,
    new_review: Star,
    credit_purchased: Coins,
    new_message: MessageCircle,
    lead_unlocked: Zap,
    default: Info,
};

const notifColors: Record<string, string> = {
    job_approved: 'bg-green-100 text-green-600',
    job_rejected: 'bg-red-100 text-red-600',
    new_review: 'bg-yellow-100 text-yellow-600',
    credit_purchased: 'bg-blue-100 text-blue-600',
    new_message: 'bg-purple-100 text-purple-600',
    lead_unlocked: 'bg-orange-100 text-orange-600',
    default: 'bg-slate-100 text-slate-600',
};

function timeAgo(date: string): string {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'À l\'instant';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${Math.floor(hours / 24)} jour${Math.floor(hours / 24) > 1 ? 's' : ''}`;
}

function NotifItem({ notif, onClick }: { notif: Notification; onClick: (n: Notification) => void }) {
    const Icon = notifIcons[notif.type] || notifIcons.default;
    const colorClass = notifColors[notif.type] || notifColors.default;

    return (
        <button
            onClick={() => onClick(notif)}
            className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${!notif.read ? 'bg-blue-50/40' : ''}`}
        >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${colorClass}`}>
                <Icon size={14} />
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-sm leading-tight ${!notif.read ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                    {notif.title}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                <p className="text-xs text-slate-400 mt-1">{timeAgo(notif.created_at)}</p>
            </div>
            {!notif.read && (
                <div className="w-2 h-2 bg-brand-blue rounded-full shrink-0 mt-2" />
            )}
        </button>
    );
}

export const NotificationBell: React.FC = () => {
    const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleNotifClick = (notif: Notification) => {
        if (!notif.read) markAsRead.mutate(notif.id);
        if (notif.link) navigate(notif.link);
        setOpen(false);
    };

    return (
        <div className="relative" ref={panelRef}>
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 rounded-full hover:bg-slate-100 transition-colors"
                aria-label="Notifications"
            >
                <Bell size={20} className="text-slate-600" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-[10px] text-white font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm transition-all">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                        <h3 className="font-bold text-slate-900 text-sm">
                            Notifications {unreadCount > 0 && <span className="text-brand-blue">({unreadCount})</span>}
                        </h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => markAllRead.mutate()}
                                    className="text-xs text-brand-blue hover:underline flex items-center gap-1"
                                >
                                    <CheckCheck size={13} />
                                    Tout lire
                                </button>
                            )}
                            <button onClick={() => setOpen(false)}>
                                <X size={16} className="text-slate-400 hover:text-slate-600" />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                        {notifications.length === 0 ? (
                            <div className="py-10 text-center">
                                <Bell className="mx-auto text-slate-200 mb-2" size={28} />
                                <p className="text-sm text-slate-400">Aucune notification</p>
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <NotifItem key={notif.id} notif={notif} onClick={handleNotifClick} />
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="border-t border-slate-100 p-2">
                            <button
                                onClick={() => { navigate('/notifications'); setOpen(false); }}
                                className="w-full text-xs text-slate-500 hover:text-brand-blue py-1.5 transition-colors"
                            >
                                Voir toutes les notifications →
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
