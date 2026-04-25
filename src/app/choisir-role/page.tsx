'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, HardHat } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useAuth } from '@/contexts/AuthContext'
import { AuthLayout } from '@/components/layout/AuthLayout'

export default function ChoisirRolePage() {
    const { user, profile, loading, refreshProfile } = useAuth()
    const router = useRouter()
    const [selecting, setSelecting] = useState(false)

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/connexion')
        }
        if (!loading && profile?.role) {
            router.replace('/dashboard')
        }
    }, [loading, user, profile, router])

    const handleSelectRole = async (role: 'pro' | 'client') => {
        if (!user || selecting) return
        setSelecting(true)
        try {
            const supabase = createSupabaseBrowserClient()
            await (supabase.from('profiles') as any).update({ role }).eq('id', user.id)
            await refreshProfile()
            supabase.functions.invoke('send-email', {
                body: {
                    to: user.email,
                    subject: role === 'pro'
                        ? 'Votre profil pro est actif — LesCordistes.com'
                        : 'Bienvenue sur LesCordistes.com',
                    templateId: role === 'pro' ? 'welcome-pro' : 'welcome-client',
                    data: { name: profile?.first_name || '' },
                },
            }).catch(() => {})
            router.replace(role === 'pro' ? '/dashboard/pro?welcome=pro' : '/dashboard/client?welcome=client')
        } finally {
            setSelecting(false)
        }
    }

    if (loading || !user) return null

    return (
        <AuthLayout
            seoTitle="Choisir votre rôle | LesCordistes.com"
            seoDescription="Indiquez-nous si vous êtes cordiste ou si vous recherchez des cordistes."
            seoCanonical="https://www.lescordistes.com/choisir-role"
        >
            <div className="p-6 sm:p-8 pt-4">
                <div className="text-center mb-6">
                    <h1 className="text-xl font-black text-slate-900">Bienvenue !</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Comment souhaitez-vous utiliser la plateforme ?
                    </p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={() => handleSelectRole('pro')}
                        disabled={selecting}
                        className="block w-full group relative p-5 bg-white border-2 border-slate-100 hover:border-orange-400 hover:shadow-md rounded-xl transition-all duration-200 text-left disabled:opacity-50"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
                                <HardHat className="text-orange-500" size={24} />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-slate-900 group-hover:text-orange-500 transition-colors">
                                    Je suis Cordiste
                                </h2>
                                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                                    Trouvez des chantiers, des missions ou du renfort.
                                </p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => handleSelectRole('client')}
                        disabled={selecting}
                        className="block w-full group relative p-5 bg-white border-2 border-slate-100 hover:border-brand-blue hover:shadow-md rounded-xl transition-all duration-200 text-left disabled:opacity-50"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                                <Building2 className="text-brand-blue" size={24} />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-slate-900 group-hover:text-brand-blue transition-colors">
                                    Je recherche des cordistes
                                </h2>
                                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                                    Publiez vos offres et trouvez des pros certifiés.
                                </p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </AuthLayout>
    )
}
