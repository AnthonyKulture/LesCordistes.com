import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { CATEGORY_LABELS } from '@/constants/categories'

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'Leads · Admin',
}

interface LeadRow {
    id: string
    email: string
    phone: string | null
    category: string | null
    city: string | null
    step_reached: number
    source: string | null
    created_at: string
    updated_at: string | null
    followup_sent_at: string | null
    followup_status: string | null
    followup_skip_reason: string | null
}

const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    })

const stepLabel = (step: number) =>
    step >= 5 ? 'Finalisé' : step >= 1 ? `Étape ${step}` : 'Capture email'

const sourceLabel = (s: string | null) => {
    if (!s) return '—'
    if (s.startsWith('city_hero_')) return `City · ${s.replace('city_hero_', '')}`
    if (s.startsWith('blog_')) return `Blog · ${s.replace('blog_', '')}`
    if (s === 'wizard_step1') return 'Wizard · step 1'
    if (s === 'exit_intent') return 'Exit-intent'
    return s
}

export default async function AdminLeadsPage() {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const admin = (await createSupabaseAdminClient()) as any

    const { data: leads } = await admin
        .from('leads')
        .select('id, email, phone, category, city, step_reached, source, created_at, updated_at, followup_sent_at, followup_status, followup_skip_reason')
        .order('created_at', { ascending: false })
        .limit(200)

    const rows: LeadRow[] = (leads ?? []) as LeadRow[]

    const last7d = rows.filter(
        (l) => new Date(l.created_at).getTime() > Date.now() - 7 * 86_400_000
    )
    const completedCount = last7d.filter((l) => l.step_reached >= 5).length
    const followedUpCount = last7d.filter((l) => l.followup_status === 'sent').length

    return (
        <div className="px-4 md:px-8 py-6 max-w-[1600px] mx-auto">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
                <p className="text-sm text-slate-500">
                    Captures email — wizard, city pages, blog & exit-intent. Relance auto à T+5 min si pas de mission créée.
                </p>
            </header>

            {/* Stats 7j */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <Stat label="Leads (7j)" value={last7d.length} />
                <Stat label="Finalisés" value={completedCount} hint={`${last7d.length ? Math.round((completedCount / last7d.length) * 100) : 0} %`} />
                <Stat label="Relances envoyées" value={followedUpCount} />
                <Stat label="Affichés" value={rows.length} hint="200 derniers" />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Étape</th>
                                <th className="px-4 py-3">Catégorie</th>
                                <th className="px-4 py-3">Ville</th>
                                <th className="px-4 py-3">Source</th>
                                <th className="px-4 py-3">Relance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rows.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                                        Aucun lead pour le moment.
                                    </td>
                                </tr>
                            )}
                            {rows.map((l) => {
                                const completed = l.step_reached >= 5
                                return (
                                    <tr key={l.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDateTime(l.created_at)}</td>
                                        <td className="px-4 py-3">
                                            <a href={`mailto:${l.email}`} className="text-brand-blue hover:underline font-medium">
                                                {l.email}
                                            </a>
                                            {l.phone && <div className="text-xs text-slate-500">{l.phone}</div>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                completed
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : l.step_reached >= 3
                                                        ? 'bg-amber-100 text-amber-800'
                                                        : 'bg-slate-100 text-slate-700'
                                            }`}>
                                                {stepLabel(l.step_reached)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">
                                            {l.category ? (CATEGORY_LABELS[l.category as keyof typeof CATEGORY_LABELS] ?? l.category) : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">{l.city ?? '—'}</td>
                                        <td className="px-4 py-3 text-slate-500 text-xs">{sourceLabel(l.source)}</td>
                                        <td className="px-4 py-3">
                                            {l.followup_status === 'sent' && (
                                                <span className="text-xs text-emerald-700 font-medium">
                                                    ✓ Envoyée
                                                    {l.followup_sent_at && (
                                                        <div className="text-slate-400 font-normal">{formatDateTime(l.followup_sent_at)}</div>
                                                    )}
                                                </span>
                                            )}
                                            {l.followup_status === 'skipped' && (
                                                <span className="text-xs text-slate-500">
                                                    Skip · {l.followup_skip_reason ?? '—'}
                                                </span>
                                            )}
                                            {l.followup_status === 'failed' && (
                                                <span className="text-xs text-red-700" title={l.followup_skip_reason ?? ''}>
                                                    ✗ Échec
                                                </span>
                                            )}
                                            {!l.followup_status && (
                                                <span className="text-xs text-slate-400">
                                                    En attente
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

function Stat({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold">{label}</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{value}</div>
            {hint && <div className="text-xs text-slate-500 mt-0.5">{hint}</div>}
        </div>
    )
}
