import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface StartConversationInput {
    proId?: string;
    clientId?: string;
    jobId?: string;
}

export function useStartConversation() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation<string, Error, StartConversationInput>({
        mutationFn: async ({ proId, clientId, jobId }) => {
            if (!user) throw new Error('Not authenticated');

            const actualClientId = clientId || user.id;
            const actualProId = proId || user.id;

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
}
