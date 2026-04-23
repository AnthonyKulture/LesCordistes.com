import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { MissionDetail } from './MissionDetail'
import type { Job } from '@/lib/types/ops'

export const dynamic = 'force-dynamic'

export default async function MissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const admin = createSupabaseAdminClient() as any
    const { data: job } = await admin.from('jobs').select('*').eq('id', id).single()
    if (!job) notFound()

    return (
        <div className="px-4 md:px-8 py-6 max-w-[1600px] mx-auto">
            <Link
                href="/admin/missions"
                className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-[#243355] mb-4"
            >
                <ArrowLeft className="h-4 w-4" /> Retour aux missions
            </Link>
            <MissionDetail initial={job as unknown as Job} />
        </div>
    )
}
