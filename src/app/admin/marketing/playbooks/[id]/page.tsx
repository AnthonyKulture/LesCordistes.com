import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { PlaybookToggle } from '../PlaybookToggle'
import { RunNowButton } from './RunNowButton'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Playbook · Marketing · Admin' }

/* eslint-disable @typescript-eslint/no-explicit-any */

interface RunRow {
    id: string
    email: string
    status: string
    skip_reason: string | null
    error_message: string | null
    sent_at: string | null
    created_at: string
}

export default async function PlaybookDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const admin = createSupabaseAdminClient() as any

    const { data: playbook } = await admin
        .from('marketing_playbooks')
        .select('*')
        .eq('id', id)
        .single()
    if (!playbook) notFound()

    const [{ data: segment }, { data: template }, { data: runs, count: runsCount }] = await Promise.all([
        admin.from('marketing_segments').select('*').eq('id', playbook.segment_id).maybeSingle(),
        admin
            .from('marketing_email_templates')
            .select('*')
            .eq('template_key', playbook.template_key)
            .maybeSingle(),
        admin
            .from('marketing_playbook_runs')
            .select('id, email, status, skip_reason, error_message, sent_at, created_at', {
                count: 'exact',
            })
            .eq('playbook_id', id)
            .order('created_at', { ascending: false })
            .limit(50) as Promise<{ data: RunRow[] | null; count: number | null }>,
    ])

    const stats = (playbook.stats ?? {}) as Record<string, number | string | null>

    return (
        <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto space-y-6">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="min-w-0">
                    <Link href="/admin/marketing/playbooks" className="text-xs text-slate-500 hover:underline">
                        ← Tous les playbooks
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900 mt-1">{playbook.name}</h1>
                    {playbook.description && (
                        <p className="text-sm text-slate-500 mt-1">{playbook.description}</p>
                    )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <RunNowButton id={id} />
                    <PlaybookToggle id={id} active={playbook.is_active} />
                </div>
            </header>

            <section className="rounded-xl border border-slate-200 bg-white p-5">
                <h2 className="font-semibold text-slate-900 text-sm mb-3">Configuration</h2>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <Row label="Audience" value={playbook.audience_type} />
                    <Row label="Segment" value={segment?.name ?? '—'} />
                    <Row label="Template" value={`${template?.name ?? playbook.template_key}`} />
                    <Row
                        label="Edge template"
                        value={template?.edge_template_id ?? '—'}
                        mono
                    />
                    <Row label="Trigger" value={playbook.trigger_kind} />
                    <Row label="Cooldown" value={`${playbook.cooldown_days} j`} />
                    <Row label="Max / run" value={String(playbook.max_per_run)} />
                    <Row label="Objet" value={playbook.subject} />
                    <Row label="Preview text" value={playbook.preview_text ?? '—'} />
                    <Row
                        label="Dernier run"
                        value={
                            playbook.last_run_at
                                ? new Date(playbook.last_run_at).toLocaleString('fr-FR')
                                : '—'
                        }
                    />
                </dl>
                {playbook.template_data && Object.keys(playbook.template_data).length > 0 && (
                    <div className="mt-4">
                        <div className="text-xs font-medium text-slate-700 mb-1">
                            Variables (template_data)
                        </div>
                        <pre className="text-xs bg-slate-50 border border-slate-200 rounded p-3 overflow-x-auto">
                            {JSON.stringify(playbook.template_data, null, 2)}
                        </pre>
                    </div>
                )}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5">
                <h2 className="font-semibold text-slate-900 text-sm mb-3">Statistiques (dernier run)</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Stat label="Cible" value={Number(stats.targeted ?? 0)} />
                    <Stat label="Envoyés" value={Number(stats.sent ?? 0)} accent="emerald" />
                    <Stat label="Échecs" value={Number(stats.failed ?? 0)} accent="red" />
                    <Stat label="Skipped" value={Number(stats.skipped ?? 0)} accent="amber" />
                </div>
                {stats.last_error && (
                    <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                        Dernière erreur : {String(stats.last_error)}
                    </div>
                )}
            </section>

            {runsCount && runsCount > 0 ? (
                <section className="rounded-xl border border-slate-200 bg-white">
                    <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                        <h2 className="font-semibold text-slate-900 text-sm">
                            Historique d'envois ({runsCount.toLocaleString('fr-FR')})
                        </h2>
                        <span className="text-xs text-slate-500">50 derniers</span>
                    </div>
                    <ul className="divide-y divide-slate-100 text-sm">
                        {(runs ?? []).map(r => (
                            <li
                                key={r.id}
                                className="px-5 py-2 flex items-center justify-between gap-3"
                            >
                                <div className="min-w-0">
                                    <div className="font-mono text-xs truncate">{r.email}</div>
                                    {r.error_message && (
                                        <div className="text-xs text-red-600 truncate">{r.error_message}</div>
                                    )}
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="text-[10px] text-slate-400">
                                        {new Date(r.created_at).toLocaleString('fr-FR', {
                                            day: '2-digit',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </div>
                                    <span
                                        className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                                            r.status === 'sent'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : r.status === 'failed'
                                                  ? 'bg-red-100 text-red-700'
                                                  : r.status === 'skipped'
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-slate-100 text-slate-700'
                                        }`}
                                    >
                                        {r.status}
                                        {r.skip_reason ? ` · ${r.skip_reason}` : ''}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            ) : null}
        </div>
    )
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
    return (
        <div className="flex gap-3">
            <dt className="text-xs uppercase tracking-wide text-slate-500 w-32 shrink-0 pt-0.5">{label}</dt>
            <dd className={mono ? 'font-mono text-slate-700 break-all' : 'text-slate-700'}>{value}</dd>
        </div>
    )
}

function Stat({
    label,
    value,
    accent,
}: {
    label: string
    value: number
    accent?: 'emerald' | 'red' | 'amber'
}) {
    const color =
        accent === 'emerald'
            ? 'text-emerald-700'
            : accent === 'red'
              ? 'text-red-700'
              : accent === 'amber'
                ? 'text-amber-700'
                : 'text-slate-900'
    return (
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
            <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
            <div className={`text-xl font-bold ${color} tabular-nums`}>{value.toLocaleString('fr-FR')}</div>
        </div>
    )
}
