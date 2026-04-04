'use client'

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { CheckCircle, ChevronDown, Star } from 'lucide-react';

interface Job {
    id: string;
    title: string;
}

interface CompleteJobModalProps {
    job: Job;
    onComplete: (proId?: string, rating?: number, comment?: string) => void;
    onCancel: () => void;
}

export function CompleteJobModal({ 
    job, 
    onComplete, 
    onCancel 
}: CompleteJobModalProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [selectedProId, setSelectedProId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch pros who unlocked this lead
    const { data: pros } = useQuery({
        queryKey: ['unlocked-pros', job.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('unlocked_leads')
                .select(`
                    pro_id,
                    profiles:pro_id (id, full_name, email)
                `)
                .eq('job_id', job.id);
            
            if (error) throw error;
            return data.map((d: any) => d.profiles) as { id: string, full_name: string | null, email: string }[];
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onComplete(selectedProId || undefined, rating || undefined, comment || undefined);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-8 pb-0">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center shrink-0">
                            <CheckCircle size={28} className="text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 leading-tight">Clôturer la mission</h2>
                            <p className="text-slate-500 font-medium">"{job.title}"</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 pt-4 space-y-8">
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                        <p className="text-slate-700 text-sm leading-relaxed">
                            Avez-vous trouvé un professionnel pour cette mission ? Vous pouvez le noter ci-dessous pour aider la communauté.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                            Quel professionnel avez-vous choisi ?
                        </label>
                        <div className="relative">
                            <select
                                value={selectedProId}
                                onChange={(e) => setSelectedProId(e.target.value)}
                                className="w-full pl-4 pr-10 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-brand-blue appearance-none transition-all text-slate-900 font-medium"
                            >
                                <option value="">Choisir un professionnel (Optionnel)</option>
                                {pros?.map(pro => (
                                    <option key={pro.id} value={pro.id}>
                                        {pro.full_name || pro.email}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                        </div>
                        {pros && pros.length === 0 && (
                            <p className="text-xs text-amber-600 mt-2 font-medium">
                                Aucun professionnel n'a encore débloqué vos coordonnées pour cette mission.
                            </p>
                        )}
                    </div>

                    {selectedProId && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">Note globale</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setRating(s)}
                                            className={`transition-all transform hover:scale-110 ${s <= rating ? 'text-yellow-400' : 'text-slate-200'}`}
                                        >
                                            <Star size={36} fill={s <= rating ? 'currentColor' : 'none'} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">Votre avis</label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Partagez votre expérience (qualité, ponctualité, prix...)"
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl h-32 outline-none focus:border-brand-blue resize-none transition-all placeholder:text-slate-300"
                                />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-4 pb-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            className="h-14 rounded-2xl font-bold border-2 hover:bg-slate-50"
                        >
                            Annuler
                        </Button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`h-14 rounded-2xl font-black text-white shadow-xl transition-all transform active:scale-95 flex items-center justify-center ${
                                isSubmitting 
                                    ? 'bg-slate-400 cursor-not-allowed' 
                                    : 'bg-green-500 hover:bg-green-600 hover:shadow-green-500/20 shadow-lg'
                            }`}
                        >
                            {isSubmitting ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                "Confirmer & Terminer"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
