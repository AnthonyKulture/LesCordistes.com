import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type UnreadEvent = 'insert' | 'update';

interface SharedUnreadChannel {
    channel: RealtimeChannel;
    listeners: Set<(event: UnreadEvent) => void>;
}

// Un seul canal Realtime par utilisateur, quel que soit le nombre de composants
// qui montent le hook : supabase-js refuse deux `subscribe()` sur le même topic.
const sharedUnreadChannels = new Map<string, SharedUnreadChannel>();

function subscribeUnread(userId: string, onChange: (event: UnreadEvent) => void): () => void {
    let entry = sharedUnreadChannels.get(userId);

    if (!entry) {
        const listeners = new Set<(event: UnreadEvent) => void>();
        const notify = (event: UnreadEvent) => { listeners.forEach(listener => listener(event)); };
        const channelId = `unread_messages_${userId.replace(/-/g, '_')}`;

        const channel = supabase
            .channel(channelId)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => notify('insert'))
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, () => notify('update'))
            .subscribe((status) => {
                if (status !== 'SUBSCRIBED' && status !== 'CLOSED') {
                    console.error(`Realtime ${channelId} failed:`, status);
                }
            });

        entry = { channel, listeners };
        sharedUnreadChannels.set(userId, entry);
    }

    entry.listeners.add(onChange);

    return () => {
        const current = sharedUnreadChannels.get(userId);
        if (!current) return;
        current.listeners.delete(onChange);
        if (current.listeners.size === 0) {
            sharedUnreadChannels.delete(userId);
            supabase.removeChannel(current.channel);
        }
    };
}

export function useUnreadCount() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const userId = user?.id;

    const { data } = useQuery({
        queryKey: ['unread_messages', userId],
        queryFn: async () => {
            if (!userId) return 0;
            // La policy RLS "Participants can view messages" restreint déjà le SELECT
            // aux conversations de l'utilisateur : inutile d'en pré-charger les ids.
            const { count, error } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .is('read_at', null)
                .neq('sender_id', userId);

            if (error) throw error;
            return count || 0;
        },
        enabled: !!userId,
        staleTime: 30_000,
    });

    useEffect(() => {
        if (!userId) return;
        return subscribeUnread(userId, (event) => {
            queryClient.invalidateQueries({ queryKey: ['unread_messages', userId] });
            // Un markAsRead émet un UPDATE par message lu : invalider la liste des
            // conversations (3 joins, non bornée) à chaque UPDATE déclencherait une
            // rafale de refetch à l'ouverture d'un fil. Seul un nouveau message la change.
            if (event === 'insert') {
                queryClient.invalidateQueries({ queryKey: ['conversations', userId] });
            }
        });
    }, [userId, queryClient]);

    return { unreadCount: data ?? 0 };
}
