'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'

export function NotifyButton() {
    const [busy, setBusy] = useState(false)
    const [feedback, setFeedback] = useState<string | null>(null)

    async function trigger() {
        setBusy(true)
        setFeedback(null)
        try {
            const res = await fetch('/api/ops/notify', { method: 'GET' })
            const data = await res.json()
            if (!res.ok) throw new Error(data?.error ?? 'erreur')
            setFeedback('Briefing envoyé sur Telegram ✓')
        } catch (err) {
            setFeedback('Erreur : ' + (err instanceof Error ? err.message : 'inconnue'))
        } finally {
            setBusy(false)
            setTimeout(() => setFeedback(null), 4000)
        }
    }

    return (
        <div className="flex items-center gap-3">
            {feedback && <span className="text-xs text-slate-500">{feedback}</span>}
            <button
                type="button"
                onClick={trigger}
                disabled={busy}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
            >
                <Send className="h-4 w-4" />
                {busy ? 'Envoi…' : 'Briefing Telegram'}
            </button>
        </div>
    )
}
