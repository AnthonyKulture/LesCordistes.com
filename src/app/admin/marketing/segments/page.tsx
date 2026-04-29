import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { SegmentsList } from './SegmentsList'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Segments · Marketing · Admin' }

/* eslint-disable @typescript-eslint/no-explicit-any */

export default async function SegmentsPage() {
    const admin = createSupabaseAdminClient() as any
    const { data: segments } = await admin
        .from('marketing_segments')
        .select('*')
        .order('is_system', { ascending: false })
        .order('name', { ascending: true })

    return (
        <div className="px-4 md:px-8 py-6 max-w-[1400px] mx-auto space-y-4">
            <header>
                <h1 className="text-2xl font-bold text-slate-900">Segments</h1>
                <p className="text-sm text-slate-500">
                    Listes de filtres réutilisables pour cibler une campagne. Cliquer pour prévisualiser le nombre de contacts.
                </p>
            </header>
            <SegmentsList segments={segments ?? []} />
        </div>
    )
}
