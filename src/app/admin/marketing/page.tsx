import Link from 'next/link'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { Mail, Users, UserCheck, UserX, Send, AlertTriangle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'Marketing · Admin',
}

/* eslint-disable @typescript-eslint/no-explicit-any */

interface CampaignRow {
    id: string
    name: string
    audience_type: string
    template_key: string
    status: string
    created_at: string
    sent_at: string | null
    stats: Record<string, number> | null
}

async function getDashboardData() {
    const admin = createSupabaseAdminClient() as any

    const [
        { count: totalContacts },
        { count: clientsCount },
        { count: prosCount },
        { count: unsubscribed },
        { data: campaigns },
        { data: recentRecipients },
    ] = await Promise.all([
        admin.from('marketing_contacts').select('id', { count: 'exact', head: true }),
        admin
            .from('marketing_contacts')
            .select('id', { count: 'exact', head: true })
            .eq('audience_type', 'client')
            .eq('marketing_opt_in', true)
            .is('unsubscribed_at', null),
        admin
            .from('marketing_contacts')
            .select('id', { count: 'exact', head: true })
            .eq('audience_type', 'pro')
            .eq('marketing_opt_in', true)
            .is('unsubscribed_at', null),
        admin
            .from('marketing_contacts')
            .select('id', { count: 'exact', head: true })
            .not('unsubscribed_at', 'is', null),
        admin
            .from('marketing_campaigns')
            .select('id, name, audience_type, template_key, status, created_at, sent_at, stats')
            .order('created_at', { ascending: false })
            .limit(8),
        admin
            .from('marketing_campaign_recipients')
            .select('id, campaign_id, email, status, error_message, sent_at')
            .eq('status', 'failed')
            .order('created_at', { ascending: false })
            .limit(5),
    ])

    return {
        stats: {
            total: totalContacts ?? 0,
            clients: clientsCount ?? 0,
            pros: prosCount ?? 0,
            unsubscribed: unsubscribed ?? 0,
        },
        campaigns: (campaigns ?? []) as CampaignRow[],
        recentErrors: (recentRecipients ?? []) as Array<{
            id: string
            campaign_id: string
            email: string
            status: string
            error_message: string | null
            sent_at: string | null
        }>,
    }
}

function StatCard({
    label,
    value,
    icon: Icon,
    color = 'text-slate-700',
}: {
    label: string
    value: number
    icon: typeof Mail
    color?: string
}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
                <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">{value.toLocaleString('fr-FR')}</div>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        draft: 'bg-slate-100 text-slate-700',
        scheduled: 'bg-blue-100 text-blue-700',
        sending: 'bg-amber-100 text-amber-700',
        sent: 'bg-green-100 text-green-700',
        failed: 'bg-red-100 text-red-700',
        cancelled: 'bg-slate-100 text-slate-500',
    }
    return (
        <span className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded-full ${map[status] ?? 'bg-slate-100'}`}>
            {status}
        </span>
    )
}

export default async function MarketingDashboardPage() {
    const { stats, campaigns, recentErrors } = await getDashboardData()

    return (
        <div className="px-4 md:px-8 py-6 max-w-[1400px] mx-auto space-y-6">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Marketing</h1>
                    <p className="text-sm text-slate-500">
                        Campagnes, segments, templates emails marketing.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link
                        href="/admin/marketing/campaigns/new"
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-[#243355] text-white hover:bg-[#1c2944]"
                    >
                        <Send className="h-4 w-4" /> Nouvelle campagne
                    </Link>
                    <Link
                        href="/admin/marketing/campaigns"
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-slate-200 hover:bg-slate-50"
                    >
                        Toutes les campagnes
                    </Link>
                </div>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard label="Contacts (total)" value={stats.total} icon={Users} color="text-slate-500" />
                <StatCard label="Clients opt-in" value={stats.clients} icon={UserCheck} color="text-emerald-600" />
                <StatCard label="Pros opt-in" value={stats.pros} icon={UserCheck} color="text-emerald-600" />
                <StatCard label="Désinscrits" value={stats.unsubscribed} icon={UserX} color="text-red-600" />
            </div>

            <section className="rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
                    <h2 className="font-semibold text-slate-900 text-sm">Campagnes récentes</h2>
                    <Link href="/admin/marketing/campaigns" className="text-xs text-[#243355] hover:underline">
                        Voir tout
                    </Link>
                </div>
                {campaigns.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500">
                        Aucune campagne pour le moment.
                        <Link href="/admin/marketing/campaigns/new" className="ml-1 text-[#243355] underline">
                            Créer la première
                        </Link>
                        .
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {campaigns.map(c => {
                            const sent = c.stats?.sent ?? 0
                            const targeted = c.stats?.targeted ?? 0
                            const failed = c.stats?.failed ?? 0
                            return (
                                <li key={c.id}>
                                    <Link
                                        href={`/admin/marketing/campaigns/${c.id}`}
                                        className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-slate-900 truncate">{c.name}</span>
                                                <StatusBadge status={c.status} />
                                            </div>
                                            <div className="text-xs text-slate-500 truncate">
                                                {c.audience_type} · {c.template_key} ·{' '}
                                                {new Date(c.created_at).toLocaleDateString('fr-FR')}
                                            </div>
                                        </div>
                                        <div className="text-right text-xs text-slate-600 shrink-0">
                                            {targeted > 0 && (
                                                <div>
                                                    {sent}/{targeted} envoyés
                                                    {failed > 0 && (
                                                        <span className="text-red-600 ml-1">· {failed} échec</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </section>

            {recentErrors.length > 0 && (
                <section className="rounded-xl border border-amber-200 bg-amber-50">
                    <div className="flex items-center gap-2 px-5 py-3 border-b border-amber-200">
                        <AlertTriangle className="h-4 w-4 text-amber-700" />
                        <h2 className="text-sm font-semibold text-amber-900">Dernières erreurs d'envoi</h2>
                    </div>
                    <ul className="divide-y divide-amber-100">
                        {recentErrors.map(r => (
                            <li key={r.id} className="px-5 py-2 text-xs text-amber-900">
                                <span className="font-mono">{r.email}</span>
                                {r.error_message && <> — <span className="text-amber-700">{r.error_message}</span></>}
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    )
}
