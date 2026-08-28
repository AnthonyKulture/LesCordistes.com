'use client'

import { JOBS_KEY } from './jobsKeys'

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Search } from 'lucide-react'
import { JobCard } from '@/components/admin/JobCard'
import { SkeletonJobCard } from '@/components/admin/SkeletonCard'
import type { Job } from '@/lib/types/ops'
import type { MissionTabStatus } from './jobsQuery'

const TABS: { id: MissionTabStatus; label: string }[] = [
    { id: 'pending', label: 'En attente' },
    { id: 'live', label: 'En ligne' },
    { id: 'expired', label: 'Déjà effectuées' },
    { id: 'rejected', label: 'Rejetées' },
    { id: 'completed', label: 'Terminées' },
]


type Props = {
    initialStatus: MissionTabStatus
    /** Rendu serveur du premier onglet. `null` = échec côté serveur, le client refetch. */
    initialJobs: Job[] | null
}

export function MissionsList({ initialStatus, initialJobs }: Props) {
    const queryClient = useQueryClient()
    const [tab, setTab] = useState<MissionTabStatus>(initialStatus)
    const [search, setSearch] = useState('')
    const deferredSearch = useDeferredValue(search)
    const [mountedAt] = useState(() => Date.now())

    // Synchro shallow de l'URL. `router.replace()` déclenchait en plus un refetch
    // du payload RSC du segment à chaque changement d'onglet.
    useEffect(() => {
        if (typeof window === 'undefined') return
        const next = new URLSearchParams(window.location.search)
        if (next.get('status') === tab) return
        next.set('status', tab)
        window.history.replaceState(null, '', `${window.location.pathname}?${next.toString()}`)
    }, [tab])

    const { data: jobs, isPending, isFetching, isError } = useQuery({
        queryKey: [...JOBS_KEY, tab],
        queryFn: async ({ signal }) => {
            const res = await fetch(`/api/ops/jobs?status=${tab}&limit=100`, {
                cache: 'no-store',
                signal,
            })
            if (!res.ok) throw new Error(`API ${res.status}`)
            const data = (await res.json()) as { jobs?: Job[] }
            return data.jobs ?? []
        },
        staleTime: 30_000,
        placeholderData: keepPreviousData,
        initialData: tab === initialStatus && initialJobs ? initialJobs : undefined,
        initialDataUpdatedAt: mountedAt,
    })

    // Modération : la mission quitte l'onglet courant. Retrait optimiste du cache
    // plutôt qu'un refetch complet de la liste ; les autres onglets sont juste
    // marqués périmés et se rafraîchiront à leur prochaine sélection.
    const handleModerated = useCallback(
        (jobId: string) => {
            queryClient.setQueryData<Job[]>([...JOBS_KEY, tab], old =>
                old ? old.filter(j => j.id !== jobId) : old
            )
            queryClient.invalidateQueries({ queryKey: JOBS_KEY, refetchType: 'none' })
        },
        [queryClient, tab]
    )

    const filtered = useMemo(() => {
        const list = jobs ?? []
        const q = deferredSearch.trim().toLowerCase()
        if (!q) return list
        return list.filter(
            j =>
                j.title.toLowerCase().includes(q) ||
                j.location_city.toLowerCase().includes(q) ||
                j.description.toLowerCase().includes(q)
        )
    }, [jobs, deferredSearch])

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
                <div className="flex items-center gap-2">
                    {isFetching && !isPending && (
                        <Loader2 className="h-4 w-4 animate-spin text-slate-400" aria-label="Actualisation" />
                    )}
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
            </div>

            {isPending && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => <SkeletonJobCard key={i} />)}
                </div>
            )}
            {!isPending && isError && (
                <div className="text-sm text-red-600 py-8 text-center bg-white border border-red-100 rounded-xl">
                    Impossible de charger les missions.
                </div>
            )}
            {!isPending && !isError && filtered.length === 0 && (
                <div className="text-sm text-slate-500 italic py-8 text-center bg-white border border-slate-200 rounded-xl">
                    Aucune mission dans cette vue.
                </div>
            )}
            {!isPending && filtered.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {filtered.map(j => (
                        <JobCard key={j.id} job={j} onChange={handleModerated} />
                    ))}
                </div>
            )}
        </div>
    )
}
