'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'framer-motion'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import { DashboardProvider } from '../contexts/DashboardContext'
import { ToastProvider } from './ui/Toast'
import { RoleSelectionModal } from './RoleSelectionModal'

function GoogleRoleGuard({ children }: { children: React.ReactNode }) {
    const { user, profile, loading } = useAuth()
    const pathname = usePathname()
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        if (loading || !user || !profile) return
        const isGoogleUser = user.app_metadata?.provider === 'google'
        const isNewUser = !profile.full_name
        const isPostJob = pathname === '/post-job'
        if (isGoogleUser && isNewUser && !isPostJob) {
            setShowModal(true)
        } else {
            setShowModal(false)
        }
    }, [user, profile, loading, pathname])

    return (
        <>
            {children}
            {showModal && user && (
                <RoleSelectionModal userId={user.id} onComplete={() => setShowModal(false)} />
            )}
        </>
    )
}

function PostHogInit() {
    useEffect(() => {
        let optedOut = false
        try {
            const raw = typeof window !== 'undefined' ? localStorage.getItem('lc_consent') : null
            if (raw) {
                const parsed = JSON.parse(raw)
                const expired = new Date(parsed.expires) < new Date()
                if (!expired && parsed.analytics === false) optedOut = true
            }
        } catch {
            optedOut = false
        }
        if (optedOut) return

        // Import dynamique : posthog-js reste hors du First Load JS partagé
        void import('@/lib/posthog-client')
            .then(({ initPostHog }) => initPostHog())
            .catch(() => {})
    }, [])
    return null
}

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        refetchOnWindowFocus: false,
                        retry: 1,
                        staleTime: 60 * 1000,
                    },
                },
            })
    )

    return (
        <QueryClientProvider client={queryClient}>
            <MotionConfig reducedMotion="user">
                <PostHogInit />
                <ToastProvider>
                    <AuthProvider>
                        <DashboardProvider>
                            <GoogleRoleGuard>
                                {children}
                            </GoogleRoleGuard>
                        </DashboardProvider>
                    </AuthProvider>
                </ToastProvider>
            </MotionConfig>
        </QueryClientProvider>
    )
}
