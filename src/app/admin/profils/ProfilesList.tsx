'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { ProfileCard } from '@/components/admin/ProfileCard'
import type { ProfileWithCredits } from '@/lib/types/ops'

const ROLES = [
    { id: 'pro', label: 'Pros' },
    { id: 'client', label: 'Clients' },
    { id: 'admin', label: 'Admins' },
] as const
type RoleId = typeof ROLES[number]['id']

export function ProfilesList() {
    const params = useSearchParams()
    const router = useRouter()
    const initial = (params.get('role') as RoleId) || 'pro'
    const [role, setRole] = useState<RoleId>(initial)
    const [search, setSearch] = useState('')
    const [users, setUsers] = useState<ProfileWithCredits[]>([])
    const [loading, setLoading] = useState(true)
    const [withCredits, setWithCredits] = useState(false)

    useEffect(() => {
        const next = new URLSearchParams(params.toString())
        next.set('role', role)
        router.replace(`/admin/profils?${next.toString()}`, { scroll: false })
    }, [role, params, router])

    useEffect(() => {
        let cancelled = false
        async function load() {
            setLoading(true)
            try {
                const res = await fetch(`/api/ops/users?role=${role}&limit=200`, { cache: 'no-store' })
                const data = await res.json()
                if (!cancelled) setUsers(data.users as ProfileWithCredits[])
            } catch (err) {
                console.error(err)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => {
            cancelled = true
        }
    }, [role])

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        return users.filter(u => {
            if (withCredits && (u.credits_balance ?? 0) <= 0) return false
            if (!q) return true
            return (
                u.email.toLowerCase().includes(q) ||
                (u.full_name ?? '').toLowerCase().includes(q) ||
                (u.company_name ?? '').toLowerCase().includes(q)
            )
        })
    }, [users, search, withCredits])

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

            {loading && <div className="text-sm text-slate-500">Chargement…</div>}
            {!loading && filtered.length === 0 && (
                <div className="text-sm text-slate-500 italic py-8 text-center bg-white border border-slate-200 rounded-xl">
                    Aucun profil dans cette vue.
                </div>
            )}
            {!loading && filtered.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filtered.map(u => (
                        <ProfileCard key={u.id} profile={u} />
                    ))}
                </div>
            )}
        </div>
    )
}
