import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { CreditTransaction, UnlockedLead } from '../types';

export function useCredits() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Get credit balance
    const { data: credits, isLoading } = useQuery({
        queryKey: ['credits', user?.id],
        queryFn: async () => {
            if (!user) return null;
            const { data, error } = await (supabase as any)
                .from('credits')
                .select('*')
                .eq('pro_id', user.id)
                .single();
            if (error && error.code !== 'PGRST116') throw error;
            return data as { balance: number } | null;
        },
        enabled: !!user,
    });

    // Get unlocked leads
    const { data: unlockedLeads } = useQuery({
        queryKey: ['unlocked-leads', user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await (supabase as any)
                .from('unlocked_leads')
                .select('job_id')
                .eq('pro_id', user.id);
            if (error) throw error;
            return (data as UnlockedLead[]).map(l => l.job_id);
        },
        enabled: !!user,
    });

    // Get transaction history
    const { data: transactions } = useQuery({
        queryKey: ['credit-transactions', user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await (supabase as any)
                .from('credit_transactions')
                .select('*')
                .eq('pro_id', user.id)
                .order('created_at', { ascending: false })
                .limit(20);
            if (error) throw error;
            return data as CreditTransaction[];
        },
        enabled: !!user,
    });

    // === ATOMIQUE : Déblocage d'un lead via RPC Supabase ===
    // Requiert l'exécution préalable de supabase-rpc-unlock-lead.sql dans Supabase
    const unlockLead = useMutation({
        mutationFn: async (jobId: string) => {
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await (supabase as any).rpc('unlock_lead', {
                p_pro_id: user.id,
                p_job_id: jobId,
            });

            if (error) {
                // Messages d'erreur lisibles depuis les RAISE EXCEPTION SQL
                if (error.message?.includes('Solde insuffisant')) {
                    throw new Error('Pas assez de crédits pour débloquer ce lead.');
                }
                throw new Error(error.message || 'Erreur lors du déblocage');
            }

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['credits', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['unlocked-leads', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['credit-transactions', user?.id] });
        },
    });

    // Add credits (called after Stripe payment / webhook)
    const addCredits = useMutation({
        mutationFn: async ({ amount, description }: { amount: number; description: string }) => {
            if (!user) throw new Error('Not authenticated');
            const balance = credits?.balance || 0;

            await (supabase as any).from('credit_transactions').insert({
                pro_id: user.id,
                type: 'purchase',
                amount,
                description,
            });

            await (supabase as any).from('credits').upsert({
                pro_id: user.id,
                balance: balance + amount,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'pro_id' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['credits', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['credit-transactions', user?.id] });
        },
    });

    const isJobUnlocked = (jobId: string) => unlockedLeads?.includes(jobId) || false;

    return {
        balance: credits?.balance || 0,
        isLoading,
        transactions: transactions || [],
        unlockedLeads: unlockedLeads || [],
        isJobUnlocked,
        unlockLead,
        addCredits,
    };
}
