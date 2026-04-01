import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
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
    });

    const hasMore = (notifications || []).length >= limit;
    const loadMore = useCallback(() => setLimit(prev => prev + PAGE_SIZE), []);

    // === REALTIME : écoute les nouvelles notifications ===
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel(`notifications:${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`,
                },
                () => {
                    queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id, queryClient]);

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
