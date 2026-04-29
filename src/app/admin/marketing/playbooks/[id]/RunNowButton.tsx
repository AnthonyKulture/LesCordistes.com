'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Play } from 'lucide-react'

interface RunResult {
    ok?: boolean
    ran?: number
    results?: Array<{
        playbook_id: string
        name: string
        stats: { targeted: number; sent: number; failed: number; skipped: number; last_error?: string }
    }>
}

export function RunNowButton({ id }: { id: string }) {
    const router = useRouter()
    const [running, setRunning] = useState(false)
    const [result, setResult] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [confirmOpen, setConfirmOpen] = useState(false)

    async function run() {
        setRunning(true)
        setError(null)
        setResult(null)
        try {
            const res = await fetch(`/api/admin/marketing/playbooks/${id}/run-now`, {
                method: 'POST',
            })
            const data = (await res.json()) as RunResult & { error?: string }
            if (!res.ok) {
                setError(data?.error ?? 'Erreur')
                return
            }
            const r = data.results?.[0]
            if (r) {
                setResult(`${r.stats.sent} envoyés · ${r.stats.failed} échec(s) · ${r.stats.skipped} skipped`)
            } else {
                setResult('Run terminé')
            }
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur')
        } finally {
            setRunning(false)
            setConfirmOpen(false)
        }
    }

    if (!confirmOpen) {
        return (
            <div className="flex flex-col items-end gap-1">
                <button
                    type="button"
                    onClick={() => setConfirmOpen(true)}
                    disabled={running}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
                >
                    <Play className="h-3.5 w-3.5" />
                    Lancer maintenant
                </button>
                {result && <span className="text-xs text-emerald-700">{result}</span>}
                {error && <span className="text-xs text-red-700">{error}</span>}
            </div>
        )
    }

    return (
        <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={run}
                    disabled={running}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                >
                    {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                    Confirmer le run
                </button>
                <button
                    type="button"
                    onClick={() => setConfirmOpen(false)}
                    disabled={running}
                    className="px-3 py-2 text-sm rounded-lg border border-slate-200 hover:bg-slate-50"
                >
                    Annuler
                </button>
            </div>
            <span className="text-xs text-amber-700 max-w-xs text-right">
                Va envoyer (réellement) à tous les contacts éligibles, plafonné à <code>max_per_run</code>.
            </span>
        </div>
    )
}
