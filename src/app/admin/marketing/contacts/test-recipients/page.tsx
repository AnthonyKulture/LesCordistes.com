import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { TestRecipientsManager } from './TestRecipientsManager'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Comptes test · Marketing · Admin' }

/* eslint-disable @typescript-eslint/no-explicit-any */

interface ContactRow {
    id: string
    email: string
    first_name: string | null
    audience_type: string
    marketing_opt_in: boolean
    unsubscribed_at: string | null
}

export default async function TestRecipientsPage() {
    const admin = createSupabaseAdminClient() as any
    const { data } = await admin
        .from('marketing_contacts')
        .select('id, email, first_name, audience_type, marketing_opt_in, unsubscribed_at')
        .eq('metadata->>is_test_recipient', 'true')
        .order('email', { ascending: true })

    return (
        <div className="px-4 md:px-8 py-6 max-w-3xl mx-auto space-y-4">
            <header>
                <h1 className="text-2xl font-bold text-slate-900">Comptes test</h1>
                <p className="text-sm text-slate-500">
                    Contacts marqués comme testeurs. Le segment <strong>« Comptes test »</strong> les cible et ignore les
                    filtres opt-in/désinscription. Idéal pour valider une campagne ou un playbook de bout en bout sans
                    spammer la base.
                </p>
            </header>
            <TestRecipientsManager initial={(data ?? []) as ContactRow[]} />
        </div>
    )
}
