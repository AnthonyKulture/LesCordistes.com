// /admin/jobs/new — Création manuelle d'une mission par l'admin (suite à un
// appel téléphonique ou un mail). Le client ne reçoit aucun email automatique.
//
// Si ?from_request=<id> est présent, on pré-remplit depuis contact_requests.

import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { NewJobForm } from './NewJobForm'

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'Créer une mission · Admin',
}

interface ContactRequestPrefill {
    id: string
    first_name: string | null
    email: string | null
    phone: string | null
    city: string | null
    category: string | null
    message: string | null
}

interface SearchParams {
    from_request?: string
    prefill_email?: string
    prefill_phone?: string
    prefill_city?: string
    prefill_category?: string
}

export default async function AdminNewJobPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}) {
    const params = await searchParams
    const requestId = params.from_request

    let prefill: ContactRequestPrefill | null = null

    if (requestId) {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const admin = (await createSupabaseAdminClient()) as any
        const { data } = await admin
            .from('contact_requests')
            .select('id, first_name, email, phone, city, category, message')
            .eq('id', requestId)
            .maybeSingle()
        prefill = (data ?? null) as ContactRequestPrefill | null
    }

    const initial = prefill
        ? {
              contact_first_name: prefill.first_name ?? '',
              contact_email: prefill.email ?? '',
              contact_phone: prefill.phone ?? '',
              location_city: prefill.city ?? '',
              category: prefill.category ?? '',
              description: prefill.message ?? '',
          }
        : params.prefill_email || params.prefill_phone || params.prefill_city || params.prefill_category
          ? {
                contact_email: params.prefill_email ?? '',
                contact_phone: params.prefill_phone ?? '',
                location_city: params.prefill_city ?? '',
                category: params.prefill_category ?? '',
            }
          : undefined

    return (
        <div className="px-4 md:px-8 py-6 max-w-3xl mx-auto">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Créer une mission</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Pour les clients qui ont appelé ou écrit en direct. Le client n&apos;est pas inscrit
                    et ne recevra aucun email automatique. Il sera notifié uniquement quand un pro
                    débloquera son lead.
                </p>
            </header>

            <NewJobForm fromRequestId={prefill?.id ?? null} initial={initial} />
        </div>
    )
}
