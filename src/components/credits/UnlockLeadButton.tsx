'use client'

import React, { useState } from 'react';
import { Lock, Coins, Check, Loader } from 'lucide-react';
import { useCredits } from '../../hooks/useCredits';
import { CreditPurchaseModal } from '../credits/CreditWidget';
import type { Job } from '../../types';
import posthog from 'posthog-js';

interface UnlockLeadButtonProps {
    job: Job;
    onUnlocked?: () => void;
    onSuccess?: () => void;
    label?: string;
}

import { motion } from 'framer-motion';

export const UnlockLeadButton: React.FC<UnlockLeadButtonProps> = ({ job, onUnlocked, onSuccess, label }) => {
    const { balance, isJobUnlocked, unlockLead } = useCredits();
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [error, setError] = useState('');

    const handleSuccess = () => {
        onUnlocked?.();
        onSuccess?.();
    };

    const unlocked = isJobUnlocked(job.id);

    if (unlocked) {
        return (
            <div className="flex items-center gap-2 text-green-600 text-sm font-semibold p-3 bg-green-50 rounded-xl border border-green-100">
                <Check size={18} />
                Lead débloqué avec succès
            </div>
        );
    }

    const handleUnlock = async () => {
        setError('');
        const cost = job.credit_cost || 1;
        if (balance < cost) {
            setShowBuyModal(true);
            return;
        }
        try {
            await unlockLead.mutateAsync(job.id);
            posthog.capture('lead_unlocked', { job_id: job.id, credit_cost: job.credit_cost || 1, job_category: job.category, job_type: job.type });
            handleSuccess();
        } catch (e: any) {
            setError(e.message || 'Erreur lors du déblocage');
        }
    };

    return (
        <>
            <div className="w-full">
                {balance === 0 ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                            <Coins size={16} className="text-amber-600 shrink-0" />
                            <p className="text-xs text-amber-700 font-medium">
                                Solde de crédits épuisé
                            </p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowBuyModal(true)}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 transition-all uppercase tracking-wide"
                        >
                            <Coins size={16} /> Acheter des crédits
                        </motion.button>
                    </div>
                ) : (
                    <button
                        onClick={handleUnlock}
                        disabled={unlockLead.isPending}
                        className="w-full flex items-center justify-between px-4 py-2 bg-orange-500 text-white rounded-lg shadow-sm hover:bg-orange-600 transition-all disabled:opacity-60 group font-medium"
                    >
                        {unlockLead.isPending ? (
                            <div className="flex items-center justify-center w-full gap-2 text-sm">
                                <Loader size={16} className="animate-spin" /> 
                                Déblocage...
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 text-sm">
                                    <Lock size={14} className="group-hover:rotate-12 transition-transform" /> 
                                    {label || "Débloquer ce lead"} 
                                </div>
                                <span className="bg-white text-orange-600 px-2 py-0.5 rounded text-xs font-bold shrink-0 whitespace-nowrap shadow-sm">
                                    {job.credit_cost || 1} crédit{(job.credit_cost || 1) > 1 ? 's' : ''}
                                </span>
                            </>
                        )}
                    </button>
                )}
                {error && (
                    <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-xs mt-2 font-medium text-center bg-red-50 p-2 rounded-lg border border-red-100" 
                        role="alert"
                    >
                        {error}
                    </motion.p>
                )}
            </div>
            <CreditPurchaseModal isOpen={showBuyModal} onClose={() => setShowBuyModal(false)} />
        </>
    );
};
