import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { MissionDetail, type UnlockEntry } from './MissionDetail'
import type { Job } from '@/lib/types/ops'

export const dynamic = 'force-dynamic'

export default async function MissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const admin = createSupabaseAdminClient() as any

    const [jobRes, unlocksRes] = await Promise.all([
        admin.from('jobs').select('*').eq('id', id).single(),
        admin
            .from('unlocked_leads')
            .select('id, unlocked_at, pro:profiles!pro_id(id, full_name, role, avatar_url, company_name)')
            .eq('job_id', id)
            .order('unlocked_at', { ascending: false }),
    ])

    if (!jobRes.data) notFound()

    return (
        <div className="px-4 md:px-8 py-6 max-w-[1600px] mx-auto">
            <Link
                href="/admin/missions"
                className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-[#243355] mb-4"
            >
                <ArrowLeft className="h-4 w-4" /> Retour aux missions
            </Link>
            <MissionDetail
                initial={jobRes.data as unknown as Job}
                unlocks={(unlocksRes.data ?? []) as unknown as UnlockEntry[]}
            />
        </div>
    )
}
