import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { CreditTransaction } from '../types';

// Clé alignée sur les invalidations émises par useCredits().unlockLead
export function useCreditTransactions() {
    const { user } = useAuth();

    const { data: transactions, isLoading } = useQuery({
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

    return {
        transactions: transactions || [],
        isLoading,
    };
}
