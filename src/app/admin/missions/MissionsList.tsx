'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { JobCard } from '@/components/admin/JobCard'
import type { Job } from '@/lib/types/ops'

const TABS = [
    { id: 'pending', label: 'En attente' },
    { id: 'live', label: 'En ligne' },
    { id: 'expired', label: 'Déjà effectuées' },
    { id: 'rejected', label: 'Rejetées' },
    { id: 'completed', label: 'Terminées' },
] as const
type TabId = typeof TABS[number]['id']

export function MissionsList() {
    const router = useRouter()
    const params = useSearchParams()
    const initialTab = (params.get('status') as TabId) || 'pending'
    const [tab, setTab] = useState<TabId>(initialTab)
    const [jobs, setJobs] = useState<Job[] | null>(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [refreshCount, setRefreshCount] = useState(0)

    useEffect(() => {
        const next = new URLSearchParams(params.toString())
        next.set('status', tab)
        router.replace(`/admin/missions?${next.toString()}`, { scroll: false })
    }, [tab, params, router])

    useEffect(() => {
        let cancelled = false
        async function load() {
            setLoading(true)
            try {
                const res = await fetch(`/api/ops/jobs?status=${tab}&limit=100`, { cache: 'no-store' })
                const data = await res.json()
                if (!cancelled) setJobs(data.jobs as Job[])
            } catch (err) {
                console.error(err)
                if (!cancelled) setJobs([])
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => {
            cancelled = true
        }
    }, [tab, refreshCount])

    const filtered = useMemo(() => {
        if (!jobs) return []
        const q = search.trim().toLowerCase()
        if (!q) return jobs
        return jobs.filter(
            j =>
                j.title.toLowerCase().includes(q) ||
                j.location_city.toLowerCase().includes(q) ||
                j.description.toLowerCase().includes(q)
        )
    }, [jobs, search])

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex flex-wrap gap-1 border border-slate-200 rounded-lg bg-white p-1">
                    {TABS.map(t => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setTab(t.id)}
                            className={`px-3 py-1.5 text-sm rounded-md ${
                                tab === t.id
                                    ? 'bg-[#243355] text-white'
                                    : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="search"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Rechercher titre, ville…"
                        className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#243355]/30 w-full md:w-72"
                    />
                </div>
            </div>

            {loading && <div className="text-sm text-slate-500">Chargement…</div>}
            {!loading && filtered.length === 0 && (
                <div className="text-sm text-slate-500 italic py-8 text-center bg-white border border-slate-200 rounded-xl">
                    Aucune mission dans cette vue.
                </div>
            )}
            {!loading && filtered.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {filtered.map(j => (
                        <JobCard key={j.id} job={j} onChange={() => setRefreshCount(c => c + 1)} />
                    ))}
                </div>
            )}
        </div>
    )
}
