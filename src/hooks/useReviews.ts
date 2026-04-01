import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Review } from '../types';

export function useReviews(proId?: string, jobId?: string) {
    const queryClient = useQueryClient();

    const { data: reviews, isLoading } = useQuery({
        queryKey: ['reviews', proId, jobId],
        queryFn: async () => {
            let query = (supabase as any).from('reviews').select('*');
            if (proId) query = query.eq('pro_id', proId);
            if (jobId) query = query.eq('job_id', jobId);
            query = query.order('created_at', { ascending: false });
            const { data, error } = await query;
            if (error) throw error;
            return data as Review[];
        },
        enabled: !!proId || !!jobId,
    });

    const avgRating = reviews && reviews.length > 0
        ? parseFloat((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1))
        : null;

    const submitReview = useMutation({
        mutationFn: async (review: {
            pro_id: string;
            job_id: string;
            client_id: string;
            rating: number;
            comment?: string;
        }) => {
            const { error } = await (supabase as any).from('reviews').insert(review);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
        },
    });

    return { reviews: reviews || [], isLoading, avgRating, submitReview };
}
