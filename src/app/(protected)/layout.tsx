'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { KeyRound, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const PW_NOTICE_KEY = 'lescordistes_pw_notice'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [showNotice, setShowNotice] = useState(false)

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/connexion')
        }
    }, [user, loading, router])

    useEffect(() => {
        if (user && typeof window !== 'undefined') {
            setShowNotice(localStorage.getItem(PW_NOTICE_KEY) === '1')
        }
    }, [user])

    const dismissNotice = () => {
        localStorage.removeItem(PW_NOTICE_KEY)
        setShowNotice(false)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue" />
            </div>
        )
    }

    if (!user) return null

    return (
        <>
            {showNotice && (
                <div className="bg-brand-blue/10 border-b border-brand-blue/20">
                    <div className="container max-w-5xl py-3 flex items-center gap-3">
                        <KeyRound size={16} className="text-brand-blue shrink-0" />
                        <p className="text-sm text-slate-700 flex-1">
                            Vous vous êtes connecté via un lien magique.{' '}
                            <Link href="/profile" className="font-semibold text-brand-blue underline underline-offset-2 hover:text-brand-blue-dark" onClick={dismissNotice}>
                                Définissez un mot de passe
                            </Link>{' '}
                            pour vous reconnecter facilement.
                        </p>
                        <button onClick={dismissNotice} className="text-slate-400 hover:text-slate-600 transition-colors shrink-0">
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}
            {children}
        </>
    )
}
