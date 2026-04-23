import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { ProfileDetail } from './ProfileDetail'
import type { Profile, CreditTransaction } from '@/lib/types/ops'

export const dynamic = 'force-dynamic'

export default async function ProfileDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const admin = createSupabaseAdminClient() as any

    const [profileQ, creditsQ, txQ] = await Promise.all([
        admin.from('profiles').select('*').eq('id', id).single(),
        admin.from('credits').select('balance, updated_at').eq('pro_id', id).maybeSingle(),
        admin.from('credit_transactions').select('*').eq('pro_id', id).order('created_at', { ascending: false }).limit(50),
    ])

    if (profileQ.error || !profileQ.data) notFound()

    return (
        <div className="px-4 md:px-8 py-6 max-w-[1600px] mx-auto">
            <Link
                href="/admin/profils"
                className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-[#243355] mb-4"
            >
                <ArrowLeft className="h-4 w-4" /> Retour aux profils
            </Link>
            <ProfileDetail
                initialProfile={profileQ.data as unknown as Profile}
                initialBalance={Number(creditsQ.data?.balance ?? 0)}
                initialTransactions={(txQ.data ?? []) as unknown as CreditTransaction[]}
            />
        </div>
    )
}
