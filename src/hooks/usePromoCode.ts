'use client'

import { useEffect, useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const STORAGE_KEY = 'lc_pending_promo'

export type PromoCheckResult =
    | { ok: true; code: string; credits_amount: number; valid_until: string | null }
    | { ok: false; reason: string }

export type PromoRedeemResult =
    | { ok: true; credits_granted: number; new_balance: number; code: string }
    | { ok: false; reason: string }

const TERMINAL_REASONS = new Set([
    'not_found',
    'inactive',
    'expired',
    'wrong_audience',
    'already_active_user',
    'already_redeemed',
    'limit_reached',
])

export function usePromoCode() {
    const { user } = useAuth()
    const searchParams = useSearchParams()
    const queryClient = useQueryClient()
    const [pendingCode, setPendingCode] = useState<string | null>(null)

    // URL > localStorage. Hydrate côté client uniquement.
    useEffect(() => {
        if (typeof window === 'undefined') return
        const fromUrl = searchParams?.get('promo') || ''
        const stored = localStorage.getItem(STORAGE_KEY) || ''
        const code = (fromUrl || stored).toUpperCase().trim()
        if (code) {
            localStorage.setItem(STORAGE_KEY, code)
            setPendingCode(code)
        }
    }, [searchParams])

    // Vérifie l'éligibilité sans consommer (pour afficher le bon message UI).
    const { data: status, isFetching: checking } = useQuery<PromoCheckResult | null>({
        queryKey: ['promo-check', pendingCode, user?.id],
        queryFn: async () => {
            if (!pendingCode || !user) return null
            const { data, error } = await (supabase as any).rpc('check_promo_code', { p_code: pendingCode })
            if (error) return { ok: false, reason: 'rpc_error' } as PromoCheckResult
            return data as PromoCheckResult
        },
        enabled: !!pendingCode && !!user,
        staleTime: 60_000,
    })

    const clearPending = useCallback(() => {
        if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY)
        setPendingCode(null)
    }, [])

    // Auto-clear si la cause est terminale (déjà utilisé, expiré, mauvais audience…)
    useEffect(() => {
        if (status && !status.ok && TERMINAL_REASONS.has(status.reason)) {
            clearPending()
        }
    }, [status, clearPending])

    const redeem = useMutation<PromoRedeemResult, Error, string>({
        mutationFn: async (code: string) => {
            const { data, error } = await (supabase as any).rpc('redeem_promo_code', { p_code: code })
            if (error) return { ok: false, reason: error.message || 'rpc_error' } as PromoRedeemResult
            return data as PromoRedeemResult
        },
        onSuccess: (result) => {
            if (result.ok) {
                clearPending()
                queryClient.invalidateQueries({ queryKey: ['credits', user?.id] })
                queryClient.invalidateQueries({ queryKey: ['credit-transactions', user?.id] })
            }
        },
    })

    return {
        pendingCode,
        status: status ?? null,
        checking,
        redeem,
        clearPending,
        isAuthenticated: !!user,
    }
}
