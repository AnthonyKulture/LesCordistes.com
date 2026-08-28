import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Notification {
    id: string;
    user_id: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    read: boolean;
    created_at: string;
}

interface SharedNotificationChannel {
    channel: RealtimeChannel;
    listeners: Set<() => void>;
}

// Le Header monte NotificationBell deux fois (desktop + mobile) : sans mutualisation
// supabase-js lèverait "subscribe can only be called a single time" sur le même topic.
const sharedNotificationChannels = new Map<string, SharedNotificationChannel>();

function subscribeNotifications(userId: string, onChange: () => void): () => void {
    let entry = sharedNotificationChannels.get(userId);

    if (!entry) {
        const listeners = new Set<() => void>();
        const channel = supabase
            .channel(`notifications:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`,
                },
                () => { listeners.forEach(listener => listener()); }
            )
            .subscribe();

        entry = { channel, listeners };
        sharedNotificationChannels.set(userId, entry);
    }

    entry.listeners.add(onChange);

    return () => {
        const current = sharedNotificationChannels.get(userId);
        if (!current) return;
        current.listeners.delete(onChange);
        if (current.listeners.size === 0) {
            sharedNotificationChannels.delete(userId);
            supabase.removeChannel(current.channel);
        }
    };
}

export function useNotifications() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const PAGE_SIZE = 20;
    const [limit, setLimit] = useState(PAGE_SIZE);

    const { data: notifications, isLoading } = useQuery({
        queryKey: ['notifications', user?.id, limit],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await (supabase as any)
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(limit);
            if (error) throw error;
            return data as Notification[];
        },
        enabled: !!user,
        placeholderData: keepPreviousData,
    });

    const hasMore = (notifications || []).length >= limit;
    const loadMore = useCallback(() => setLimit(prev => prev + PAGE_SIZE), []);

    // === REALTIME : écoute les nouvelles notifications (canal mutualisé) ===
    const userId = user?.id;
    useEffect(() => {
        if (!userId) return;
        return subscribeNotifications(userId, () => {
            queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
        });
    }, [userId, queryClient]);

    const unreadCount = (notifications || []).filter(n => !n.read).length;

    const markAsRead = useMutation({
        mutationFn: async (notifId: string) => {
            await (supabase as any)
                .from('notifications')
                .update({ read: true })
                .eq('id', notifId);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] }),
    });

    const markAllRead = useMutation({
        mutationFn: async () => {
            if (!user) return;
            await (supabase as any)
                .from('notifications')
                .update({ read: true })
                .eq('user_id', user.id)
                .eq('read', false);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] }),
    });

    const sendNotification = async (payload: {
        user_id: string;
        type: string;
        title: string;
        message: string;
        link?: string;
    }) => {
        await (supabase as any).from('notifications').insert(payload);
    };

    return {
        notifications: notifications || [],
        unreadCount,
        isLoading,
        markAsRead,
        markAllRead,
        sendNotification,
        hasMore,
        loadMore,
    };
}
