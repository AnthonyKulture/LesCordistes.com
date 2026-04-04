'use client'

import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '../ui/Button';
import { useReviews } from '../../hooks/useReviews';
import { useAuth } from '../../contexts/AuthContext';

interface StarRatingInputProps {
    value: number;
    onChange: (rating: number) => void;
    size?: number;
}

export const StarRatingInput: React.FC<StarRatingInputProps> = ({ value, onChange, size = 28 }) => {
    const [hovered, setHovered] = useState(0);

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(i => (
                <button
                    key={i}
                    type="button"
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => onChange(i)}
                    className="transition-transform hover:scale-110"
                >
                    <Star
                        size={size}
                        className={`transition-colors ${
                            i <= (hovered || value)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-slate-200 fill-slate-200'
                        }`}
                    />
                </button>
            ))}
        </div>
    );
};

export const StarDisplay: React.FC<{ rating: number; size?: number; count?: number }> = ({ rating, size = 16, count }) => (
    <div className="flex items-center gap-1.5">
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <Star
                    key={i}
                    size={size}
                    className={i <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-200'}
                />
            ))}
        </div>
        <span className="text-sm font-semibold text-slate-700">{rating.toFixed(1)}</span>
        {count !== undefined && <span className="text-xs text-slate-400">({count} avis)</span>}
    </div>
);

interface ReviewFormProps {
    proId: string;
    jobId: string;
    onSuccess?: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ proId, jobId, onSuccess }) => {
    const { user } = useAuth();
    const { submitReview } = useReviews(proId);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    if (!user) return null;

    if (submitted) {
        return (
            <div className="text-center py-6">
                <div className="text-4xl mb-2">🌟</div>
                <p className="font-semibold text-slate-900">Merci pour votre avis !</p>
                <p className="text-sm text-slate-500 mt-1">Il sera visible sur le profil du cordiste.</p>
            </div>
        );
    }

    const handleSubmit = async () => {
        if (rating === 0) {
            setError('Veuillez sélectionner une note.');
            return;
        }
        try {
            await submitReview.mutateAsync({
                pro_id: proId,
                job_id: jobId,
                client_id: user.id,
                rating,
                comment: comment.trim() || undefined,
            });
            setSubmitted(true);
            onSuccess?.();
        } catch (e: any) {
            setError(e.message || 'Erreur lors de l\'envoi');
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Votre note *</p>
                <StarRatingInput value={rating} onChange={setRating} />
            </div>
            <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Commentaire (optionnel)</label>
                <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Décrivez votre expérience avec ce cordiste..."
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button
                variant="primary"
                onClick={handleSubmit}
                isLoading={submitReview.isPending}
                className="w-full"
            >
                Envoyer mon avis
            </Button>
        </div>
    );
};

interface ReviewListProps {
    proId?: string;
    jobId?: string;
    showSummary?: boolean;
}

export const ReviewList: React.FC<ReviewListProps> = ({ proId, jobId, showSummary = true }) => {
    const { reviews, avgRating, isLoading } = useReviews(proId, jobId);

    if (isLoading) return <div className="text-sm text-slate-400">Chargement des avis...</div>;
    if (reviews.length === 0) return <p className="text-sm text-slate-400 italic">Aucun avis pour l'instant.</p>;

    return (
        <div className="space-y-4">
            {showSummary && avgRating && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                    <StarDisplay rating={avgRating} size={20} count={reviews.length} />
                </div>
            )}
            {reviews.map(review => (
                <div key={review.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-1.5">
                        <StarDisplay rating={review.rating} size={14} />
                        <span className="text-xs text-slate-400">
                            {new Date(review.created_at).toLocaleDateString('fr-FR')}
                        </span>
                    </div>
                    {review.comment && (
                        <p className="text-sm text-slate-700 leading-relaxed">{review.comment}</p>
                    )}
                </div>
            ))}
        </div>
    );
};
