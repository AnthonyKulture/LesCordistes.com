'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'

const ITEMS = [
    { href: '/admin/marketing', label: 'Dashboard', exact: true },
    { href: '/admin/marketing/campaigns', label: 'Campagnes', exact: false },
    { href: '/admin/marketing/templates', label: 'Templates', exact: true },
    { href: '/admin/marketing/segments', label: 'Segments', exact: true },
] as const

export function MarketingSubNav() {
    const pathname = usePathname()
    const [syncing, setSyncing] = useState(false)
    const [syncResult, setSyncResult] = useState<string | null>(null)

    async function syncContacts() {
        setSyncing(true)
        setSyncResult(null)
        try {
            const res = await fetch('/api/admin/marketing/contacts?action=sync', {
                method: 'POST',
            })
            const data = await res.json()
            if (res.ok && data?.result) {
                setSyncResult(
                    `${data.result.inserted ?? 0} ajouté(s), ${data.result.updated ?? 0} mis à jour.`
                )
            } else {
                setSyncResult(`Erreur : ${data?.error ?? 'inconnue'}`)
            }
        } catch (err) {
            setSyncResult(err instanceof Error ? err.message : 'Erreur')
        } finally {
            setSyncing(false)
            setTimeout(() => setSyncResult(null), 5000)
        }
    }

    return (
        <div className="border-b border-slate-200 bg-white">
            <div className="px-4 md:px-8 max-w-[1400px] mx-auto flex items-center justify-between gap-3 overflow-x-auto">
                <nav className="flex gap-1 py-1 -mb-px">
                    {ITEMS.map(item => {
                        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                    active
                                        ? 'border-[#243355] text-[#243355]'
                                        : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                                }`}
                            >
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>
                <div className="flex items-center gap-2 py-2 shrink-0">
                    {syncResult && <span className="text-xs text-slate-500">{syncResult}</span>}
                    <button
                        type="button"
                        onClick={syncContacts}
                        disabled={syncing}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
                        title="Synchronise marketing_contacts depuis profiles"
                    >
                        {syncing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                        Sync contacts
                    </button>
                </div>
            </div>
        </div>
    )
}
