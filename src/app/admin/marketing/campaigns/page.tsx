import Link from 'next/link'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { Send } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Campagnes · Marketing · Admin' }

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

interface CampaignRow {
    id: string
    name: string
    audience_type: string
    template_key: string
    segment_id: string | null
    status: string
    created_at: string
    sent_at: string | null
    stats: Record<string, number> | null
}

async function getCampaigns(): Promise<CampaignRow[]> {
    const admin = createSupabaseAdminClient() as any
    const { data } = await admin
        .from('marketing_campaigns')
        .select('id, name, audience_type, template_key, segment_id, status, created_at, sent_at, stats')
        .order('created_at', { ascending: false })
        .limit(200)
    return (data ?? []) as CampaignRow[]
}

export default async function CampaignsListPage() {
    const campaigns = await getCampaigns()
    return (
        <div className="px-4 md:px-8 py-6 max-w-[1400px] mx-auto space-y-4">
            <header className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Campagnes</h1>
                    <p className="text-sm text-slate-500">{campaigns.length} campagne(s) au total.</p>
                </div>
                <Link
                    href="/admin/marketing/campaigns/new"
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-[#243355] text-white hover:bg-[#1c2944]"
                >
                    <Send className="h-4 w-4" /> Nouvelle campagne
                </Link>
            </header>

            {campaigns.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                    Aucune campagne.
                </div>
            ) : (
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium text-slate-600">Nom</th>
                                <th className="px-4 py-2 text-left font-medium text-slate-600">Audience</th>
                                <th className="px-4 py-2 text-left font-medium text-slate-600">Template</th>
                                <th className="px-4 py-2 text-left font-medium text-slate-600">Statut</th>
                                <th className="px-4 py-2 text-right font-medium text-slate-600">Envoyés / Cible</th>
                                <th className="px-4 py-2 text-right font-medium text-slate-600">Erreurs</th>
                                <th className="px-4 py-2 text-left font-medium text-slate-600">Créée</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {campaigns.map(c => {
                                const sent = c.stats?.sent ?? 0
                                const targeted = c.stats?.targeted ?? 0
                                const failed = c.stats?.failed ?? 0
                                return (
                                    <tr key={c.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-2">
                                            <Link
                                                href={`/admin/marketing/campaigns/${c.id}`}
                                                className="font-medium text-slate-900 hover:text-[#243355]"
                                            >
                                                {c.name}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-2 text-slate-600">{c.audience_type}</td>
                                        <td className="px-4 py-2 text-slate-600 font-mono text-xs">{c.template_key}</td>
                                        <td className="px-4 py-2">
                                            <span
                                                className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded-full ${STATUS_COLOR[c.status] ?? 'bg-slate-100'}`}
                                            >
                                                {STATUS_LABEL[c.status] ?? c.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-right tabular-nums">
                                            {targeted > 0 ? `${sent} / ${targeted}` : '—'}
                                        </td>
                                        <td className="px-4 py-2 text-right tabular-nums">
                                            {failed > 0 ? <span className="text-red-600">{failed}</span> : '—'}
                                        </td>
                                        <td className="px-4 py-2 text-slate-500 text-xs">
                                            {new Date(c.created_at).toLocaleDateString('fr-FR', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
