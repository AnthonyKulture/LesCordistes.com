import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { FRENCH_DEPARTMENTS } from '@/constants/departments'

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'Alertes pros · Admin',
}

interface AlertRow {
    id: string
    email: string
    departments: string[]
    source: string | null
    confirmed_at: string | null
    unsubscribed_at: string | null
    last_alert_sent_at: string | null
    last_match_count: number
    total_alerts_sent: number
    created_at: string
}

const DEPT_LABEL = new Map(FRENCH_DEPARTMENTS.map(d => [d.code, d.label]))

const formatDateTime = (iso: string | null) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    })
}

export default async function AdminAlertsPage() {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const admin = (await createSupabaseAdminClient()) as any

    const { data: subs } = await admin
        .from('pro_alert_subscriptions')
        .select(
            'id, email, departments, source, confirmed_at, unsubscribed_at, last_alert_sent_at, last_match_count, total_alerts_sent, created_at'
        )
        .order('created_at', { ascending: false })
        .limit(300)

    const rows: AlertRow[] = (subs ?? []) as AlertRow[]
    const active = rows.filter(r => !r.unsubscribed_at)
    const last7d = rows.filter(
        r => new Date(r.created_at).getTime() > Date.now() - 7 * 86_400_000
    )

    // Top 5 départements suivis
    const deptCount = new Map<string, number>()
    for (const r of active) {
        for (const d of r.departments ?? []) {
            deptCount.set(d, (deptCount.get(d) ?? 0) + 1)
        }
    }
    const topDepts = Array.from(deptCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)

    return (
        <div className="px-4 md:px-8 py-6 max-w-[1600px] mx-auto">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Alertes pros</h1>
                <p className="text-sm text-slate-500">
                    Inscriptions email captées sur la page <strong>/jobs</strong>. Le cron <code>pro-alerts-cron</code> envoie les alertes toutes les 30 minutes.
                </p>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <Stat label="Abonnés actifs" value={active.length} />
                <Stat label="Inscrits (7j)" value={last7d.length} />
                <Stat
                    label="Désinscrits"
                    value={rows.length - active.length}
                    hint={`${rows.length ? Math.round(((rows.length - active.length) / rows.length) * 100) : 0} %`}
                />
                <Stat label="Affichés" value={rows.length} hint="300 derniers" />
            </div>

            {topDepts.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
                    <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-2">
                        Top départements suivis (abonnés actifs)
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {topDepts.map(([code, count]) => (
                            <span
                                key={code}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-blue/10 text-brand-blue text-xs font-semibold rounded-md"
                            >
                                {DEPT_LABEL.get(code) ?? code}
                                <span className="bg-brand-blue text-white px-1.5 rounded text-[10px]">{count}</span>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                <th className="px-4 py-3">Inscrit le</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Départements</th>
                                <th className="px-4 py-3">Source</th>
                                <th className="px-4 py-3">Dernière alerte</th>
                                <th className="px-4 py-3">Total envoyés</th>
                                <th className="px-4 py-3">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rows.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                                        Aucune inscription pour le moment.
                                    </td>
                                </tr>
                            )}
                            {rows.map(r => (
                                <tr key={r.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                                        {formatDateTime(r.created_at)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <a
                                            href={`mailto:${r.email}`}
                                            className="text-brand-blue hover:underline font-medium"
                                        >
                                            {r.email}
                                        </a>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1 max-w-md">
                                            {(r.departments ?? []).map(code => (
                                                <span
                                                    key={code}
                                                    className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-700 text-[11px] rounded font-medium"
                                                    title={DEPT_LABEL.get(code) ?? code}
                                                >
                                                    {code}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-500">{r.source ?? '—'}</td>
                                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                                        {formatDateTime(r.last_alert_sent_at)}
                                        {r.last_match_count > 0 && (
                                            <div className="text-[11px] text-slate-400">
                                                {r.last_match_count} mission{r.last_match_count > 1 ? 's' : ''}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-slate-700 font-medium">
                                        {r.total_alerts_sent}
                                    </td>
                                    <td className="px-4 py-3">
                                        {r.unsubscribed_at ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                                                Désinscrit
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                                                Actif
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
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
