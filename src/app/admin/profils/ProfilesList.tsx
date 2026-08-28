'use client'

import { USERS_KEY } from './profilesKeys'

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Loader2, Search, MapPin, X } from 'lucide-react'
import { ProfileCard } from '@/components/admin/ProfileCard'
import { SkeletonProfileCard } from '@/components/admin/SkeletonCard'
import { FRENCH_DEPARTMENTS } from '@/constants/departments'
import type { ProfileWithCredits } from '@/lib/types/ops'
import type { AdminRole } from './profilesQuery'

const ROLES: { id: AdminRole; label: string }[] = [
    { id: 'pro', label: 'Pros' },
    { id: 'client', label: 'Clients' },
    { id: 'admin', label: 'Admins' },
]


type Props = {
    initialRole: AdminRole
    /** Rendu serveur du premier rôle. `null` = échec côté serveur, le client refetch. */
    initialProfiles: ProfileWithCredits[] | null
}

export function ProfilesList({ initialRole, initialProfiles }: Props) {
    const [role, setRole] = useState<AdminRole>(initialRole)
    const [search, setSearch] = useState('')
    const [withCredits, setWithCredits] = useState(false)
    const [deptFilter, setDeptFilter] = useState<string[]>([])
    const [showDeptPicker, setShowDeptPicker] = useState(false)
    const [mountedAt] = useState(() => Date.now())

    // Filtrage local instantané pendant que la requête serveur (debounce) est en vol.
    const deferredSearch = useDeferredValue(search)
    // Recherche serveur : élargit au-delà des 200 profils les plus récents.
    const [serverSearch, setServerSearch] = useState('')

    useEffect(() => {
        const t = setTimeout(() => setServerSearch(search.trim()), 350)
        return () => clearTimeout(t)
    }, [search])

    const sortedDepts = useMemo(
        () => [...FRENCH_DEPARTMENTS].sort((a, b) => a.code.localeCompare(b.code)),
        []
    )

    const toggleDept = useCallback((code: string) => {
        setDeptFilter(prev => (prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]))
    }, [])

    // Synchro shallow de l'URL. `router.replace()` déclenchait en plus un refetch
    // du payload RSC du segment à chaque changement d'onglet.
    useEffect(() => {
        if (typeof window === 'undefined') return
        const next = new URLSearchParams(window.location.search)
        if (next.get('role') === role) return
        next.set('role', role)
        window.history.replaceState(null, '', `${window.location.pathname}?${next.toString()}`)
    }, [role])

    const { data: users, isPending, isFetching, isError } = useQuery({
        queryKey: [...USERS_KEY, role, serverSearch],
        queryFn: async ({ signal }) => {
            const qs = new URLSearchParams({ role, limit: '200' })
            if (serverSearch) qs.set('q', serverSearch)
            const res = await fetch(`/api/ops/users?${qs.toString()}`, { cache: 'no-store', signal })
            if (!res.ok) throw new Error(`API ${res.status}`)
            const data = (await res.json()) as { users?: ProfileWithCredits[] }
            return data.users ?? []
        },
        staleTime: 30_000,
        placeholderData: keepPreviousData,
        initialData:
            role === initialRole && !serverSearch && initialProfiles ? initialProfiles : undefined,
        initialDataUpdatedAt: mountedAt,
    })

    const filtered = useMemo(() => {
        const list = users ?? []
        const q = deferredSearch.trim().toLowerCase()
        const deptActive = role === 'pro' && deptFilter.length > 0
        return list.filter(u => {
            if (withCredits && (u.credits_balance ?? 0) <= 0) return false
            if (deptActive) {
                const zones = u.intervention_zones ?? []
                if (!zones.some(z => deptFilter.includes(z))) return false
            }
            if (!q) return true
            return (
                u.email.toLowerCase().includes(q) ||
                (u.full_name ?? '').toLowerCase().includes(q) ||
                (u.company_name ?? '').toLowerCase().includes(q)
            )
        })
    }, [users, deferredSearch, withCredits, deptFilter, role])

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex flex-wrap gap-1 border border-slate-200 rounded-lg bg-white p-1">
                    {ROLES.map(r => (
                        <button
                            key={r.id}
                            type="button"
                            onClick={() => setRole(r.id)}
                            className={`px-3 py-1.5 text-sm rounded-md ${
                                role === r.id ? 'bg-[#243355] text-white' : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {role === 'pro' && (
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input
                                type="checkbox"
                                checked={withCredits}
                                onChange={e => setWithCredits(e.target.checked)}
                                className="accent-[#243355]"
                            />
                            Avec crédits
                        </label>
                    )}
                    {role === 'pro' && (
                        <button
                            type="button"
                            onClick={() => setShowDeptPicker(v => !v)}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border ${
                                deptFilter.length > 0
                                    ? 'border-[#243355] bg-[#243355]/5 text-[#243355] font-medium'
                                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <MapPin className="h-4 w-4" />
                            Zones
                            {deptFilter.length > 0 && (
                                <span className="ml-0.5 bg-[#243355] text-white text-[11px] px-1.5 rounded">
                                    {deptFilter.length}
                                </span>
                            )}
                        </button>
                    )}
                    {isFetching && !isPending && (
                        <Loader2 className="h-4 w-4 animate-spin text-slate-400" aria-label="Actualisation" />
                    )}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="search"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Email, nom, société…"
                            className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#243355]/30 w-full md:w-72"
                        />
                    </div>
                </div>
            </div>

            {role === 'pro' && deptFilter.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-slate-500">Zones d&apos;intervention :</span>
                    {deptFilter.map(code => (
                        <button
                            key={code}
                            type="button"
                            onClick={() => toggleDept(code)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#243355]/10 text-[#243355] text-xs font-medium rounded"
                        >
                            {code}
                            <X className="h-3 w-3" />
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => setDeptFilter([])}
                        className="text-xs text-slate-400 hover:text-slate-600 underline ml-1"
                    >
                        Tout effacer
                    </button>
                </div>
            )}

            {role === 'pro' && showDeptPicker && (
                <div className="bg-white border border-slate-200 rounded-xl p-3">
                    <div className="text-xs text-slate-500 mb-2">
                        Filtrer les pros dont la zone d&apos;intervention couvre au moins un département sélectionné.
                    </div>
                    <div className="flex flex-wrap gap-1 max-h-48 overflow-y-auto">
                        {sortedDepts.map(d => (
                            <button
                                key={d.code}
                                type="button"
                                onClick={() => toggleDept(d.code)}
                                title={d.label}
                                className={`w-10 h-8 text-xs font-semibold rounded border transition-all ${
                                    deptFilter.includes(d.code)
                                        ? 'bg-[#243355] text-white border-[#243355]'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-[#243355]'
                                }`}
                            >
                                {d.code}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {isPending && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Array.from({ length: 9 }).map((_, i) => <SkeletonProfileCard key={i} />)}
                </div>
            )}
            {!isPending && isError && (
                <div className="text-sm text-red-600 py-8 text-center bg-white border border-red-100 rounded-xl">
                    Impossible de charger les profils.
                </div>
            )}
            {!isPending && !isError && filtered.length === 0 && (
                <div className="text-sm text-slate-500 italic py-8 text-center bg-white border border-slate-200 rounded-xl">
                    Aucun profil dans cette vue.
                </div>
            )}
            {!isPending && filtered.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filtered.map(u => (
                        <ProfileCard key={u.id} profile={u} />
                    ))}
                </div>
            )}
        </div>
    )
}
