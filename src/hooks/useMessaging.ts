import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    attachments?: string[];
    read_at?: string;
    created_at: string;
}

export interface Conversation {
    id: string;
    job_id: string;
    client_id: string;
    pro_id: string;
    created_at: string;
    // Joined fields
    job_title?: string;
    other_user_name?: string;
    last_message?: string;
    last_message_at?: string;
    unread_count?: number;
}

export function useMessaging(conversationId?: string) {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Get all conversations for current user
    const { data: conversations, isLoading: loadingConvos } = useQuery({
        queryKey: ['conversations', user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from('conversations')
                .select(`
                    *,
                    job:jobs(title),
                    client:profiles!client_id(full_name, company_name),
                    pro:profiles!pro_id(full_name, company_name)
                `)
                .or(`client_id.eq.${user.id},pro_id.eq.${user.id}`)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return (data as unknown as any[]).map(conv => {
                const isMeClient = conv.client_id === user.id;
                const otherUser = isMeClient ? conv.pro : conv.client;
                
                return {
                    ...conv,
                    job_title: conv.job?.title,
                    other_user_name: otherUser?.company_name || otherUser?.full_name || (isMeClient ? 'Professionnel' : 'Client')
                };
            }) as Conversation[];
        },
        enabled: !!user,
    });

    // Get messages in a specific conversation
    const { data: messages, isLoading: loadingMsgs } = useQuery({
        queryKey: ['messages', conversationId],
        queryFn: async () => {
            if (!conversationId) return [];
            const { data, error } = await (supabase as any)
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });
            if (error) throw error;
            return data as Message[];
        },
        enabled: !!conversationId,
    });

    // Global unread messages count
    const { data: globalUnreadCount } = useQuery({
        queryKey: ['unread_messages', user?.id],
        queryFn: async () => {
            if (!user) return 0;

            // Fetch IDs of conversations where user is a participant
            const { data: myConvs, error: convError } = await supabase
                .from('conversations')
                .select('id')
                .or(`client_id.eq.${user.id},pro_id.eq.${user.id}`);

            if (convError) throw convError;
            if (!myConvs || myConvs.length === 0) return 0;

            const convIds = (myConvs as any[]).map(c => c.id);

            // Count unread messages only in those conversations
            const { count, error } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .in('conversation_id', convIds)
                .is('read_at', null)
                .neq('sender_id', user.id);

            if (error) throw error;
            return count || 0;
        },
        enabled: !!user,
    });

    // === GLOBAL REALTIME : écoute les nouveaux messages partout ===
    // On ne l'active que si on n'est pas déjà dans une conversation spécifique
    // pour éviter les doublons de souscription sur le même client
    useEffect(() => {
        if (!user || conversationId) return;
        const channelId = `global_unread_${user.id.replace(/-/g, '_')}`;
        const channel = supabase.channel(channelId)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
                queryClient.invalidateQueries({ queryKey: ['unread_messages'] });
                queryClient.invalidateQueries({ queryKey: ['conversations'] });
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, () => {
                queryClient.invalidateQueries({ queryKey: ['unread_messages'] });
            })
            .subscribe((status) => {
                if (status !== 'SUBSCRIBED' && status !== 'CLOSED') {
                    console.error(`Realtime ${channelId} failed:`, status);
                }
            });
        return () => { supabase.removeChannel(channel); };
    }, [user, queryClient, conversationId]);

    // === REALTIME SPECIFIQUE CONVERSATION ===
    useEffect(() => {
        if (!conversationId) return;
        const channelId = `chat_session_${conversationId.replace(/-/g, '_')}`;

        const channel = supabase
            .channel(channelId)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                },
                (payload) => {
                    // Filter manually in the callback
                    if (payload.new && payload.new.conversation_id === conversationId) {
                        queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
                    }
                }
            )
            .subscribe((status) => {
                if (status !== 'SUBSCRIBED' && status !== 'CLOSED' && status !== 'CHANNEL_ERROR') {
                    console.error(`Realtime ${channelId} failed:`, status);
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId, queryClient]);

    // Send a message
    const sendMessage = useMutation({
        mutationFn: async ({ content, attachments }: { content: string; attachments?: string[] }) => {
            if (!user || !conversationId) throw new Error('Missing data');
            const { error } = await (supabase as any).from('messages').insert({
                conversation_id: conversationId,
                sender_id: user.id,
                content,
                attachments: attachments || [],
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
    });

    // Start or get a conversation (between a client and a pro for a specific job)
    const startConversation = useMutation({
        mutationFn: async ({ proId, clientId, jobId }: { proId?: string; clientId?: string; jobId?: string }) => {
            if (!user) throw new Error('Not authenticated');

            const actualClientId = clientId || user.id;
            const actualProId = proId || user.id;

            // Check if exists
            let query = (supabase as any)
                .from('conversations')
                .select('id')
                .eq('pro_id', actualProId)
                .eq('client_id', actualClientId);

            if (jobId) {
                query = query.eq('job_id', jobId);
            } else {
                query = query.is('job_id', null);
            }

            const { data: existing } = await query.maybeSingle();

            if (existing) return existing.id as string;

            // Create new
            const { data, error } = await (supabase as any).from('conversations').insert({
                job_id: jobId || null,
                client_id: actualClientId,
                pro_id: actualProId,
            }).select('id').single();

            if (error) throw error;
            return data.id as string;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations'] }),
    });

    // Mark messages as read in a conversation
    const markAsRead = useMutation({
        mutationFn: async (convId: string) => {
            if (!user) return;
            const res = await (supabase as any)
                .from('messages')
                .update({ read_at: new Date().toISOString() })
                .eq('conversation_id', convId)
                .is('read_at', null)
                .neq('sender_id', user.id)
                .select(); // Select to see what happened
            
            if (res.error) throw res.error;
            return { count: res.data?.length || 0, conversationId: convId };
        },
        onSuccess: (data) => {
            if (data?.count && data.count > 0) {
                console.log(`[markAsRead] Success! Marked ${data.count} messages as read for conversation ${data.conversationId}`);
            }
            queryClient.invalidateQueries({ queryKey: ['messages', data?.conversationId] });
            queryClient.invalidateQueries({ queryKey: ['unread_messages'] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
        onError: (err) => {
            console.error('[markAsRead] Error marking messages as read:', err);
        }
    });

    return {
        conversations: conversations || [],
        messages: messages || [],
        globalUnreadCount: globalUnreadCount || 0,
        loadingConvos,
        loadingMsgs,
        sendMessage,
        startConversation,
        markAsRead,
    };
}
