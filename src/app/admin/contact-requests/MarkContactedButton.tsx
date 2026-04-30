'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'

export function MarkContactedButton({ id }: { id: string }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleClick = async () => {
        if (loading) return
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/contact-requests/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'contacted' }),
            })
            if (res.ok) router.refresh()
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={loading}
            className="shrink-0 inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg transition-colors"
        >
            <Check size={16} />
            {loading ? '…' : 'Marquer contacté'}
        </button>
    )
}
