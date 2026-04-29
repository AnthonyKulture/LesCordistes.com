import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { NewCampaignForm } from './NewCampaignForm'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Nouvelle campagne · Marketing · Admin' }

/* eslint-disable @typescript-eslint/no-explicit-any */

export default async function NewCampaignPage() {
    const admin = createSupabaseAdminClient() as any
    const [{ data: templates }, { data: segments }] = await Promise.all([
        admin.from('marketing_email_templates').select('*').eq('is_active', true).order('name'),
        admin.from('marketing_segments').select('*').order('is_system', { ascending: false }).order('name'),
    ])

    return (
        <div className="px-4 md:px-8 py-6 max-w-3xl mx-auto space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-slate-900">Nouvelle campagne</h1>
                <p className="text-sm text-slate-500">
                    Création en brouillon. L'envoi réel se fait depuis la page de détail après confirmation.
                </p>
            </header>
            <NewCampaignForm templates={templates ?? []} segments={segments ?? []} />
        </div>
    )
}
