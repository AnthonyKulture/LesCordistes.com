'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Gift, X, Sparkles, Loader2 } from 'lucide-react'
import { usePromoCode } from '../../hooks/usePromoCode'
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

export const PromoActivation: React.FC = () => {
    const { pendingCode, status, checking, redeem, clearPending, isAuthenticated } = usePromoCode()
    const toast = useToast()
    const [open, setOpen] = useState(false)
    const [autoOpened, setAutoOpened] = useState(false)

    // Auto-open la modale au premier landing avec un code éligible (1× par session)
    useEffect(() => {
        if (autoOpened || !pendingCode) return
        if (!isAuthenticated) return
        if (status?.ok) {
            setOpen(true)
            setAutoOpened(true)
        }
    }, [pendingCode, status, isAuthenticated, autoOpened])

    if (!pendingCode) return null
    if (status && !status.ok) return null  // raisons terminales déjà clear par le hook

    const eligible = status?.ok === true
    const credits = eligible ? status.credits_amount : 1

    const handleActivate = async () => {
        if (!isAuthenticated) {
            // Garde le code en localStorage, redirige vers login avec retour
            return
        }
        const result = await redeem.mutateAsync(pendingCode)
        if (result.ok) {
            toast.success(`+${result.credits_granted} crédit ajouté ! Solde : ${result.new_balance}`)
            setOpen(false)
        } else {
            toast.error(REASON_MESSAGES[result.reason] || 'Erreur lors de l\'activation.')
            setOpen(false)
        }
    }

    return (
        <>
            {/* Bannière persistante */}
            <div className="bg-gradient-to-r from-brand-blue to-brand-blue-light text-white">
                <div className="container max-w-7xl py-2.5 px-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <Gift size={18} className="shrink-0" />
                        <p className="text-sm font-medium truncate">
                            <span className="font-bold">{credits} crédit offert</span>
                            <span className="opacity-80 hidden sm:inline"> avec le code </span>
                            <span className="font-mono font-bold ml-1 sm:ml-0">{pendingCode}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => setOpen(true)}
                            className="text-xs sm:text-sm font-semibold bg-white text-brand-blue rounded-full px-4 py-1.5 hover:bg-opacity-90 transition-opacity"
                        >
                            Activer
                        </button>
                        <button
                            onClick={clearPending}
                            className="opacity-70 hover:opacity-100 transition-opacity"
                            aria-label="Fermer"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modale */}
            {open && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header coloré */}
                        <div className="bg-gradient-to-br from-brand-blue to-brand-blue-light text-white p-8 text-center relative">
                            <button
                                onClick={() => setOpen(false)}
                                className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors"
                                aria-label="Fermer"
                            >
                                <X size={20} />
                            </button>
                            <Sparkles size={32} className="mx-auto mb-3 text-amber-300" />
                            <p className="text-xs uppercase tracking-widest text-blue-100 font-semibold mb-2">
                                Code promo
                            </p>
                            <p className="font-mono text-2xl font-bold tracking-widest mb-4">
                                {pendingCode}
                            </p>
                            <div className="text-5xl font-extrabold mb-1">
                                +{credits}
                            </div>
                            <p className="text-blue-100 text-sm">
                                {credits > 1 ? 'crédits offerts' : 'crédit offert'}
                            </p>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            {!isAuthenticated ? (
                                <>
                                    <p className="text-slate-700 text-sm mb-5 text-center">
                                        Connectez-vous à votre compte pro pour activer votre crédit.
                                    </p>
                                    <Link
                                        href="/connexion"
                                        className="block w-full text-center bg-brand-blue text-white font-semibold rounded-xl py-3 hover:bg-opacity-90 transition-opacity"
                                    >
                                        Me connecter
                                    </Link>
                                    <p className="text-xs text-slate-400 text-center mt-3">
                                        Pas encore inscrit ?{' '}
                                        <Link href="/inscription" className="text-brand-blue hover:underline">
                                            Créer un compte pro
                                        </Link>
                                    </p>
                                </>
                            ) : checking ? (
                                <div className="flex items-center justify-center py-6 text-slate-500 text-sm gap-2">
                                    <Loader2 size={18} className="animate-spin" />
                                    Vérification…
                                </div>
                            ) : !eligible ? (
                                <p className="text-slate-700 text-sm text-center py-4">
                                    Ce code n&apos;est plus disponible.
                                </p>
                            ) : (
                                <>
                                    <p className="text-slate-700 text-sm mb-5 text-center">
                                        Activez votre crédit gratuit et débloquez la mission qui vous intéresse.
                                        <span className="block text-xs text-slate-400 mt-2">
                                            1 crédit = 1 contact client direct (téléphone, email, adresse).
                                        </span>
                                    </p>
                                    <button
                                        onClick={handleActivate}
                                        disabled={redeem.isPending}
                                        className="block w-full text-center bg-brand-blue text-white font-semibold rounded-xl py-3 hover:bg-opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {redeem.isPending ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Loader2 size={16} className="animate-spin" />
                                                Activation…
                                            </span>
                                        ) : (
                                            'Activer mon crédit'
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
