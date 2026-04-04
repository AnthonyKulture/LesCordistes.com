'use client'

import React, { useState } from 'react';
import { User, Briefcase } from 'lucide-react';
import { Button } from './ui/Button';
import { supabase } from '../lib/supabase';
import { useToast } from './ui/Toast';
import { useQueryClient } from '@tanstack/react-query';

interface RoleSelectionModalProps {
    userId: string;
    onComplete: () => void;
}

/**
 * Affiché lors d'une première connexion Google OAuth
 * pour permettre à l'utilisateur de choisir son rôle (client ou pro).
 */
export const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({ userId, onComplete }) => {
    const [selected, setSelected] = useState<'client' | 'pro' | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const toast = useToast();
    const queryClient = useQueryClient();

    const handleConfirm = async () => {
        if (!selected) return;
        setIsSaving(true);
        try {
            // Récupérer le full_name depuis les métadonnées Google
            const { data: { user } } = await supabase.auth.getUser();
            const googleName = user?.user_metadata?.full_name || user?.user_metadata?.name || '';

            const { error } = await (supabase as any)
                .from('profiles')
                .update({ role: selected, full_name: googleName || 'Utilisateur' })
                .eq('id', userId);

            if (error) throw error;

            queryClient.invalidateQueries({ queryKey: ['profile'] });
            toast.success(`Compte ${selected === 'pro' ? 'professionnel' : 'client'} activé !`);
            onComplete();
        } catch (err) {
            toast.error('Erreur lors de la sélection du rôle.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">Bienvenue ! 👋</h2>
                    <p className="text-slate-600 mt-2">Comment souhaitez-vous utiliser LesCordistes ?</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Client */}
                    <button
                        onClick={() => setSelected('client')}
                        className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${
                            selected === 'client'
                                ? 'border-brand-blue bg-brand-blue/5 shadow-md'
                                : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            selected === 'client' ? 'bg-brand-blue text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                            <Briefcase size={24} />
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-slate-900">Client</p>
                            <p className="text-xs text-slate-500 mt-1">Je cherche un professionnel</p>
                        </div>
                    </button>

                    {/* Pro */}
                    <button
                        onClick={() => setSelected('pro')}
                        className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${
                            selected === 'pro'
                                ? 'border-brand-blue bg-brand-blue/5 shadow-md'
                                : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            selected === 'pro' ? 'bg-brand-blue text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                            <User size={24} />
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-slate-900">Professionnel</p>
                            <p className="text-xs text-slate-500 mt-1">Je propose mes services</p>
                        </div>
                    </button>
                </div>

                <Button
                    variant="primary"
                    className="w-full"
                    disabled={!selected || isSaving}
                    isLoading={isSaving}
                    onClick={handleConfirm}
                >
                    Continuer
                </Button>
            </div>
        </div>
    );
};
