'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { AdminDashboard } from '@/views/admin/Dashboard'

export default function AdminPage() {
    const { user, profile, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading) {
            if (!user) router.replace('/connexion')
            else if (profile?.role !== 'admin') router.replace('/dashboard')
        }
    }, [user, profile, loading, router])

    if (loading || !user || profile?.role !== 'admin') return null

    return <AdminDashboard />
}
