import Link from 'next/link'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { PlaybookToggle } from './PlaybookToggle'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Playbooks · Marketing · Admin' }

/* eslint-disable @typescript-eslint/no-explicit-any */

interface PlaybookRow {
    id: string
    name: string
    description: string | null
    audience_type: string
    segment_id: string
    template_key: string
    subject: string
    trigger_kind: string
    cooldown_days: number
    max_per_run: number
    is_active: boolean
    last_run_at: string | null
    stats: Record<string, number | string | null> | null
    marketing_segments: { name: string } | null
}

export default async function PlaybooksPage() {
    const admin = createSupabaseAdminClient() as any
    const { data } = await admin
        .from('marketing_playbooks')
        .select(
            `id, name, description, audience_type, segment_id, template_key, subject,
             trigger_kind, cooldown_days, max_per_run, is_active, last_run_at, stats,
             marketing_segments:segment_id(name)`
        )
        .order('is_active', { ascending: false })
        .order('name', { ascending: true })

    const playbooks = (data ?? []) as PlaybookRow[]

    return (
        <div className="px-4 md:px-8 py-6 max-w-[1400px] mx-auto space-y-4">
            <header className="flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Playbooks</h1>
                    <p className="text-sm text-slate-500">
                        Séquences nurturing automatisées. Le cron tourne tous les jours à 09:00 UTC. Un contact ne reçoit
                        un playbook qu'une seule fois.
                    </p>
                </div>
            </header>

            {playbooks.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                    Aucun playbook. La migration <code>20260429-marketing-nurture.sql</code> n'a pas encore été appliquée
                    ou aucun seed n'a été inséré.
                </div>
            ) : (
                <div className="space-y-3">
                    {playbooks.map(p => (
                        <PlaybookCard key={p.id} pb={p} />
                    ))}
                </div>
            )}
        </div>
    )
}

function PlaybookCard({ pb }: { pb: PlaybookRow }) {
    const sent = (pb.stats?.sent as number) ?? 0
    const targeted = (pb.stats?.targeted as number) ?? 0
    const failed = (pb.stats?.failed as number) ?? 0

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Link
                            href={`/admin/marketing/playbooks/${pb.id}`}
                            className="font-semibold text-slate-900 hover:text-[#243355]"
                        >
                            {pb.name}
                        </Link>
                        <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                pb.audience_type === 'pro'
                                    ? 'bg-blue-100 text-blue-700'
                                    : pb.audience_type === 'client'
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : 'bg-slate-100 text-slate-600'
                            }`}
                        >
                            {pb.audience_type}
                        </span>
                        <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                pb.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                            }`}
                        >
                            {pb.is_active ? 'Actif' : 'Inactif'}
                        </span>
                    </div>
                    {pb.description && (
                        <p className="text-xs text-slate-500 mt-1">{pb.description}</p>
                    )}
                    <dl className="text-xs text-slate-600 mt-2 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1">
                        <div>
                            <dt className="text-slate-400 uppercase tracking-wide text-[10px]">Segment</dt>
                            <dd>{pb.marketing_segments?.name ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-slate-400 uppercase tracking-wide text-[10px]">Template</dt>
                            <dd className="font-mono">{pb.template_key}</dd>
                        </div>
                        <div>
                            <dt className="text-slate-400 uppercase tracking-wide text-[10px]">Cooldown</dt>
                            <dd>{pb.cooldown_days}j · max {pb.max_per_run}/run</dd>
                        </div>
                        <div>
                            <dt className="text-slate-400 uppercase tracking-wide text-[10px]">Dernier run</dt>
                            <dd>
                                {pb.last_run_at
                                    ? new Date(pb.last_run_at).toLocaleString('fr-FR', {
                                          day: '2-digit',
                                          month: 'short',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                      })
                                    : '—'}
                            </dd>
                        </div>
                    </dl>
                    {targeted > 0 && (
                        <div className="text-xs text-slate-600 mt-2">
                            Dernier run : {sent}/{targeted} envoyés
                            {failed > 0 && <span className="text-red-600 ml-1">· {failed} échec(s)</span>}
                        </div>
                    )}
                </div>
                <div className="shrink-0">
                    <PlaybookToggle id={pb.id} active={pb.is_active} />
                </div>
            </div>
        </div>
    )
}
