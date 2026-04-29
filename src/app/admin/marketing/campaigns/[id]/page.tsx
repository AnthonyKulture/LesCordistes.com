import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { CampaignDetailActions } from './CampaignDetailActions'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Campagne · Marketing · Admin' }

/* eslint-disable @typescript-eslint/no-explicit-any */

const STATUS_LABEL: Record<string, string> = {
    draft: 'Brouillon',
    scheduled: 'Planifiée',
    sending: 'Envoi en cours',
    sent: 'Envoyée',
    failed: 'Échec',
    cancelled: 'Annulée',
}
const STATUS_COLOR: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700',
    scheduled: 'bg-blue-100 text-blue-700',
    sending: 'bg-amber-100 text-amber-700',
    sent: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    cancelled: 'bg-slate-100 text-slate-500',
}

export default async function CampaignDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const admin = createSupabaseAdminClient() as any

    const { data: campaign } = await admin
        .from('marketing_campaigns')
        .select('*')
        .eq('id', id)
        .single()
    if (!campaign) notFound()

    interface RecipientRow {
        id: string
        email: string
        status: string
        skip_reason: string | null
        sent_at: string | null
        error_message: string | null
    }
    const [{ data: tpl }, { data: segment }, { data: recipients, count: recipientsCount }] =
        await Promise.all([
            admin
                .from('marketing_email_templates')
                .select('*')
                .eq('template_key', campaign.template_key)
                .maybeSingle(),
            campaign.segment_id
                ? admin.from('marketing_segments').select('*').eq('id', campaign.segment_id).maybeSingle()
                : Promise.resolve({ data: null }),
            admin
                .from('marketing_campaign_recipients')
                .select('id, email, status, skip_reason, sent_at, error_message', { count: 'exact' })
                .eq('campaign_id', id)
                .order('created_at', { ascending: false })
                .limit(50) as Promise<{ data: RecipientRow[] | null; count: number | null }>,
        ])

    const stats = (campaign.stats ?? {}) as Record<string, number | string | null>
    const isLocked = campaign.status === 'sending' || campaign.status === 'sent'

    return (
        <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto space-y-6">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="min-w-0">
                    <Link href="/admin/marketing/campaigns" className="text-xs text-slate-500 hover:underline">
                        ← Toutes les campagnes
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900 mt-1 truncate">{campaign.name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span
                            className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded-full ${STATUS_COLOR[campaign.status]}`}
                        >
                            {STATUS_LABEL[campaign.status] ?? campaign.status}
                        </span>
                        <span className="text-xs text-slate-500">
                            créée le {new Date(campaign.created_at).toLocaleString('fr-FR')}
                        </span>
                    </div>
                </div>
            </header>

            <section className="rounded-xl border border-slate-200 bg-white p-5">
                <h2 className="font-semibold text-slate-900 text-sm mb-3">Configuration</h2>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <Row label="Audience" value={campaign.audience_type} />
                    <Row label="Segment" value={segment?.name ?? '—'} />
                    <Row label="Template" value={`${tpl?.name ?? campaign.template_key} (${campaign.template_key})`} />
                    <Row label="Edge template" value={tpl?.edge_template_id ?? '—'} mono />
                    <Row label="Objet" value={campaign.subject} />
                    <Row label="Preview text" value={campaign.preview_text ?? '—'} />
                </dl>
                {campaign.template_data && Object.keys(campaign.template_data).length > 0 && (
                    <div className="mt-4">
                        <div className="text-xs font-medium text-slate-700 mb-1">Variables (template_data)</div>
                        <pre className="text-xs bg-slate-50 border border-slate-200 rounded p-3 overflow-x-auto">
                            {JSON.stringify(campaign.template_data, null, 2)}
                        </pre>
                    </div>
                )}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5">
                <h2 className="font-semibold text-slate-900 text-sm mb-3">Statistiques</h2>
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

            {!isLocked && <CampaignDetailActions campaignId={id} status={campaign.status} />}

            {recipientsCount && recipientsCount > 0 ? (
                <section className="rounded-xl border border-slate-200 bg-white">
                    <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                        <h2 className="font-semibold text-slate-900 text-sm">
                            Destinataires ({recipientsCount.toLocaleString('fr-FR')})
                        </h2>
                        <span className="text-xs text-slate-500">50 derniers</span>
                    </div>
                    <ul className="divide-y divide-slate-100 text-sm">
                        {(recipients ?? []).map(r => (
                            <li key={r.id} className="px-5 py-2 flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="font-mono text-xs truncate">{r.email}</div>
                                    {r.error_message && (
                                        <div className="text-xs text-red-600 truncate">{r.error_message}</div>
                                    )}
                                </div>
                                <span
                                    className={`text-[11px] font-semibold px-2 py-0.5 rounded shrink-0 ${
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
