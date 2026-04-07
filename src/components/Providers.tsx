'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
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
            <ToastProvider>
                <AuthProvider>
                    <DashboardProvider>
                        <GoogleRoleGuard>
                            {children}
                        </GoogleRoleGuard>
                    </DashboardProvider>
                </AuthProvider>
            </ToastProvider>
        </QueryClientProvider>
    )
}
