'use client'

import { useState } from 'react'
import { Eye, Loader2 } from 'lucide-react'

interface Segment {
    id: string
    name: string
    description: string | null
    audience_type: string
    filters: { kind?: string; preset?: string }
    is_system: boolean
}

interface PreviewResult {
    count: number
    sample: Array<{ email: string; first_name: string | null; audience_type: string }>
}

export function SegmentsList({ segments }: { segments: Segment[] }) {
    const [previews, setPreviews] = useState<Record<string, PreviewResult>>({})
    const [loading, setLoading] = useState<Record<string, boolean>>({})

    async function preview(id: string) {
        setLoading(s => ({ ...s, [id]: true }))
        try {
            const res = await fetch(`/api/admin/marketing/segments?preview=${id}`, { cache: 'no-store' })
            const data = await res.json()
            if (res.ok) setPreviews(p => ({ ...p, [id]: data as PreviewResult }))
        } finally {
            setLoading(s => ({ ...s, [id]: false }))
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {segments.map(s => {
                const p = previews[s.id]
                const isLoading = loading[s.id]
                return (
                    <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h3 className="font-semibold text-slate-900">{s.name}</h3>
                                {s.description && <p className="text-xs text-slate-500 mt-1">{s.description}</p>}
                            </div>
                            <span
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                    s.audience_type === 'pro'
                                        ? 'bg-blue-100 text-blue-700'
                                        : s.audience_type === 'client'
                                          ? 'bg-emerald-100 text-emerald-700'
                                          : 'bg-slate-100 text-slate-600'
                                }`}
                            >
                                {s.audience_type}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="font-mono">{s.filters?.preset ?? 'custom'}</span>
                            {s.is_system && (
                                <span className="inline-block bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">
                                    système
                                </span>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => preview(s.id)}
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Eye className="h-3 w-3" />}
                            Prévisualiser
                        </button>
                        {p && (
                            <div className="rounded-lg bg-slate-50 p-3 space-y-2">
                                <div className="text-sm font-semibold text-slate-900">
                                    {p.count.toLocaleString('fr-FR')} contact(s) ciblé(s)
                                </div>
                                {p.sample.length > 0 && (
                                    <ul className="text-xs text-slate-600 space-y-0.5 font-mono">
                                        {p.sample.map(x => (
                                            <li key={x.email} className="truncate">
                                                {x.email} {x.first_name ? `· ${x.first_name}` : ''}
                                            </li>
                                        ))}
                                        {p.count > p.sample.length && (
                                            <li className="text-slate-400 italic">… et {p.count - p.sample.length} autres</li>
                                        )}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
