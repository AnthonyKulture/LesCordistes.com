'use client'

import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Gift, Loader2, CheckCircle2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../ui/Toast'

const REASON_MESSAGES: Record<string, string> = {
    not_found: "Ce code promo n'existe pas.",
    inactive: 'Cette offre n\'est plus active.',
    expired: 'Cette offre a expiré.',
    not_yet_valid: 'Cette offre n\'est pas encore active.',
    wrong_audience: 'Cette offre n\'est pas destinée à votre type de compte.',
    already_active_user: 'Cette offre est réservée aux pros n\'ayant pas encore débloqué de mission.',
    already_redeemed: 'Vous avez déjà activé ce code.',
    limit_reached: 'Cette offre a atteint sa limite d\'activations.',
    not_authenticated: 'Connectez-vous pour activer votre crédit.',
    rpc_error: 'Erreur de connexion. Réessayez.',
}

type RedeemResult =
    | { ok: true; credits_granted: number; new_balance: number; code: string }
    | { ok: false; reason: string }

export const PromoCodeInput: React.FC = () => {
    const { user } = useAuth()
    const toast = useToast()
    const queryClient = useQueryClient()
    const [code, setCode] = useState('')
    const [done, setDone] = useState(false)

    const redeem = useMutation<RedeemResult, Error, string>({
        mutationFn: async (c: string) => {
            const { data, error } = await (supabase as any).rpc('redeem_promo_code', { p_code: c })
            if (error) return { ok: false, reason: error.message || 'rpc_error' }
            return data as RedeemResult
        },
        onSuccess: (result) => {
            if (result.ok) {
                toast.success(`+${result.credits_granted} crédit ajouté ! Solde : ${result.new_balance}`)
                queryClient.invalidateQueries({ queryKey: ['credits', user?.id] })
                queryClient.invalidateQueries({ queryKey: ['credit-transactions', user?.id] })
                setDone(true)
                setCode('')
            } else {
                toast.error(REASON_MESSAGES[result.reason] || 'Erreur lors de l\'activation.')
            }
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const trimmed = code.trim().toUpperCase()
        if (!trimmed) return
        redeem.mutate(trimmed)
    }

    if (!user) return null

    if (done) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6 flex items-center gap-3">
                <CheckCircle2 className="text-green-600 shrink-0" size={22} />
                <p className="text-sm text-green-800 font-medium">
                    Code activé ! Vos crédits sont disponibles.
                </p>
            </div>
        )
    }

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 mb-6 shadow-sm">
            <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                    <Gift className="text-amber-600" size={18} />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Vous avez un code promo&nbsp;?</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                        Saisissez votre code pour créditer votre compte.
                    </p>
                </div>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Ex : BIENVENUE1"
                    autoComplete="off"
                    spellCheck={false}
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-mono tracking-wider uppercase placeholder:font-sans placeholder:tracking-normal placeholder:normal-case placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                    disabled={redeem.isPending}
                />
                <button
                    type="submit"
                    disabled={redeem.isPending || !code.trim()}
                    className="bg-brand-blue text-white font-semibold rounded-xl px-5 py-2.5 text-sm hover:bg-opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                    {redeem.isPending ? (
                        <span className="flex items-center justify-center gap-2">
                            <Loader2 size={14} className="animate-spin" />
                            Activation…
                        </span>
                    ) : (
                        'Activer'
                    )}
                </button>
            </form>
        </div>
    )
}
