'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export function PlaybookToggle({ id, active }: { id: string; active: boolean }) {
    const router = useRouter()
    const [optimistic, setOptimistic] = useState(active)
    const [pending, startTransition] = useTransition()

    async function toggle() {
        const next = !optimistic
        setOptimistic(next)
        const res = await fetch(`/api/admin/marketing/playbooks/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_active: next }),
        })
        if (!res.ok) {
            setOptimistic(active)
            const data = await res.json().catch(() => ({}))
            alert(`Erreur : ${(data as { error?: string }).error ?? res.status}`)
            return
        }
        startTransition(() => router.refresh())
    }

    return (
        <button
            type="button"
            onClick={toggle}
            disabled={pending}
            className={`inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors ${
                optimistic
                    ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            } disabled:opacity-50`}
        >
            {pending && <Loader2 className="h-3 w-3 animate-spin" />}
            {optimistic ? 'Désactiver' : 'Activer'}
        </button>
    )
}
