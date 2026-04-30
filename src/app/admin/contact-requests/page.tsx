import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { CATEGORY_LABELS } from '@/constants/categories'
import { MarkContactedButton } from './MarkContactedButton'

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'Demandes de contact · Admin',
}

interface RequestRow {
    id: string
    request_type: 'quick_message' | 'callback'
    first_name: string | null
    email: string | null
    phone: string | null
    city: string | null
    category: string | null
    message: string | null
    preferred_channel: string | null
    preferred_time_slot: string | null
    source: string | null
    status: 'new' | 'contacted' | 'closed'
    contacted_at: string | null
    notes: string | null
    created_at: string
}

const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    })

const slotLabel = (slot: string | null) => {
    if (!slot) return null
    const map: Record<string, string> = {
        morning: 'Matin (9h-12h)',
        afternoon: 'Après-midi (14h-18h)',
        evening: 'Fin de journée (18h-20h)',
    }
    return map[slot] ?? slot
}

export default async function AdminContactRequestsPage() {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const admin = (await createSupabaseAdminClient()) as any

    const { data: requests } = await admin
        .from('contact_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)

    const rows: RequestRow[] = (requests ?? []) as RequestRow[]
    const newCount = rows.filter((r) => r.status === 'new').length

    return (
        <div className="px-4 md:px-8 py-6 max-w-[1600px] mx-auto">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Demandes de contact</h1>
                <p className="text-sm text-slate-500">
                    Messages rapides + demandes de rappel via les 3 cartes en haut de /post-job.
                </p>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                <Stat label="Nouvelles" value={newCount} hint="à traiter" tone="amber" />
                <Stat label="Contactées" value={rows.filter((r) => r.status === 'contacted').length} />
                <Stat label="Total affichées" value={rows.length} />
            </div>

            <div className="space-y-3">
                {rows.length === 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
                        Aucune demande pour le moment.
                    </div>
                )}
                {rows.map((r) => (
                    <RequestCard key={r.id} r={r} />
                ))}
            </div>
        </div>
    )
}

function RequestCard({ r }: { r: RequestRow }) {
    const isNew = r.status === 'new'
    const isCallback = r.request_type === 'callback'

    return (
        <article
            className={`bg-white rounded-xl border-2 p-4 md:p-5 transition-colors ${
                isNew ? 'border-amber-200' : 'border-slate-200'
            }`}
        >
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-[280px]">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                                isCallback
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                            }`}
                        >
                            {isCallback ? '📞 Rappel' : '💬 Message'}
                        </span>
                        <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                r.status === 'new'
                                    ? 'bg-red-100 text-red-700'
                                    : r.status === 'contacted'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-slate-100 text-slate-600'
                            }`}
                        >
                            {r.status === 'new' ? 'Nouveau' : r.status === 'contacted' ? 'Contacté' : 'Clos'}
                        </span>
                        <span className="text-xs text-slate-400">{formatDateTime(r.created_at)}</span>
                    </div>

                    <h3 className="font-bold text-slate-900 mb-1">
                        {r.first_name || 'Anonyme'}
                        {r.city && <span className="text-slate-500 font-normal"> · {r.city}</span>}
                    </h3>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 mb-2">
                        {r.email && (
                            <a href={`mailto:${r.email}`} className="text-brand-blue hover:underline">
                                ✉ {r.email}
                            </a>
                        )}
                        {r.phone && (
                            <a href={`tel:${r.phone}`} className="text-brand-blue hover:underline">
                                ☎ {r.phone}
                            </a>
                        )}
                        {r.category && (
                            <span className="text-slate-500">
                                Type :{' '}
                                <strong className="text-slate-700">
                                    {CATEGORY_LABELS[r.category as keyof typeof CATEGORY_LABELS] ?? r.category}
                                </strong>
                            </span>
                        )}
                        {slotLabel(r.preferred_time_slot) && (
                            <span className="text-slate-500">
                                Créneau :{' '}
                                <strong className="text-slate-700">{slotLabel(r.preferred_time_slot)}</strong>
                            </span>
                        )}
                    </div>

                    {r.message && (
                        <div className="mt-3 p-3 bg-slate-50 rounded-lg text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {r.message}
                        </div>
                    )}

                    {r.contacted_at && (
                        <p className="text-xs text-slate-400 mt-2">
                            Contacté le {formatDateTime(r.contacted_at)}
                        </p>
                    )}
                </div>

                {isNew && <MarkContactedButton id={r.id} />}
            </div>
        </article>
    )
}

function Stat({
    label,
    value,
    hint,
    tone,
}: {
    label: string
    value: number | string
    hint?: string
    tone?: 'amber'
}) {
    return (
        <div
            className={`rounded-xl border p-4 ${
                tone === 'amber' ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'
            }`}
        >
            <div
                className={`text-xs uppercase tracking-wide font-semibold ${
                    tone === 'amber' ? 'text-amber-700' : 'text-slate-500'
                }`}
            >
                {label}
            </div>
            <div className={`text-2xl font-bold mt-1 ${tone === 'amber' ? 'text-amber-900' : 'text-slate-900'}`}>
                {value}
            </div>
            {hint && (
                <div className={`text-xs mt-0.5 ${tone === 'amber' ? 'text-amber-700' : 'text-slate-500'}`}>
                    {hint}
                </div>
            )}
        </div>
    )
}
