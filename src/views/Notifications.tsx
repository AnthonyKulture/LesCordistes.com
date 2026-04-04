'use client'

import React from 'react';
import { Bell, CheckCheck, Briefcase, Star, Coins, MessageCircle, Info, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNotifications, type Notification } from '../hooks/useNotifications';

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
    const days = Math.floor(hours / 24);
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
}

export const NotificationsPage: React.FC = () => {
    const { notifications, unreadCount, markAsRead, markAllRead, isLoading, hasMore, loadMore } = useNotifications();
    const router = useRouter();

    const handleClick = (notif: Notification) => {
        if (!notif.read) markAsRead.mutate(notif.id);
        if (notif.link) router.push(notif.link);
    };

    return (
        <div className="min-h-screen bg-slate-50 py-10">
            <div className="container max-w-2xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <Bell size={24} className="text-brand-blue" />
                            Notifications
                        </h1>
                        {unreadCount > 0 && (
                            <p className="text-sm text-slate-500 mt-0.5">{unreadCount} non lue(s)</p>
                        )}
                    </div>

                    {unreadCount > 0 && (
                        <button
                            onClick={() => markAllRead.mutate()}
                            className="flex items-center gap-2 text-sm text-brand-blue hover:underline"
                        >
                            <CheckCheck size={16} />
                            Tout marquer comme lu
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-16">
                            <Bell className="mx-auto text-slate-200 mb-3" size={48} />
                            <h2 className="font-semibold text-slate-700 mb-1">Tout est calme ici</h2>
                            <p className="text-sm text-slate-400">Vous n'avez aucune notification pour le moment.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {notifications.map(notif => {
                                const Icon = notifIcons[notif.type] || notifIcons.default;
                                const colorClass = notifColors[notif.type] || notifColors.default;

                                return (
                                    <button
                                        key={notif.id}
                                        onClick={() => handleClick(notif)}
                                        className={`w-full text-left flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition-colors ${!notif.read ? 'bg-blue-50/40' : ''}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${colorClass}`}>
                                            <Icon size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={`text-sm leading-snug ${!notif.read ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                                                    {notif.title}
                                                </p>
                                                {!notif.read && (
                                                    <div className="w-2 h-2 bg-brand-blue rounded-full shrink-0 mt-1.5" />
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                                            <p className="text-xs text-slate-400 mt-1.5">{timeAgo(notif.created_at)}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Load more */}
                {hasMore && !isLoading && (
                    <div className="text-center mt-4">
                        <button
                            onClick={loadMore}
                            className="text-sm text-brand-blue hover:underline font-medium px-6 py-2.5 bg-white rounded-xl shadow-sm border border-slate-100 hover:border-brand-blue/30 transition-colors"
                        >
                            Charger plus de notifications
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
