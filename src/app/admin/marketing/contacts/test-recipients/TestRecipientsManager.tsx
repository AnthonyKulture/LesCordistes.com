'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, X } from 'lucide-react'

interface Contact {
    id: string
    email: string
    first_name: string | null
    audience_type: string
    marketing_opt_in: boolean
    unsubscribed_at: string | null
}

export function TestRecipientsManager({ initial }: { initial: Contact[] }) {
    const router = useRouter()
    const [list, setList] = useState<Contact[]>(initial)
    const [email, setEmail] = useState('')
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function add() {
        setError(null)
        setBusy(true)
        try {
            const res = await fetch('/api/admin/marketing/contacts/test-flag', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, is_test: true }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(`${data?.error ?? 'Erreur'}${data?.hint ? ' — ' + data.hint : ''}`)
                return
            }
            setEmail('')
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur')
        } finally {
            setBusy(false)
        }
    }

    async function remove(c: Contact) {
        setBusy(true)
        try {
            await fetch('/api/admin/marketing/contacts/test-flag', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: c.email, is_test: false }),
            })
            setList(prev => prev.filter(x => x.id !== c.id))
            router.refresh()
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                <div className="text-sm font-semibold text-slate-900">Ajouter un compte test</div>
                <div className="flex gap-2">
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && email && !busy) add()
                        }}
                        placeholder="anthony@surly.fr"
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#243355]/30"
                    />
                    <button
                        type="button"
                        onClick={add}
                        disabled={busy || !email}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-[#243355] text-white hover:bg-[#1c2944] disabled:opacity-50"
                    >
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        Ajouter
                    </button>
                </div>
                <p className="text-xs text-slate-500">
                    L'email doit déjà exister dans <code>marketing_contacts</code> (sync depuis profiles via le bouton{' '}
                    <em>Sync contacts</em> de la sub-nav).
                </p>
                {error && (
                    <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                        {error}
                    </div>
                )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white">
                <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-900">
                        Contacts marqués test ({list.length})
                    </h2>
                </div>
                {list.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500">
                        Aucun compte test pour le moment.
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {list.map(c => (
                            <li
                                key={c.id}
                                className="px-5 py-3 flex items-center justify-between gap-3 text-sm"
                            >
                                <div className="min-w-0">
                                    <div className="font-mono text-xs text-slate-900 truncate">{c.email}</div>
                                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                                        <span
                                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                                c.audience_type === 'pro'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : c.audience_type === 'client'
                                                      ? 'bg-emerald-100 text-emerald-700'
                                                      : 'bg-slate-100 text-slate-600'
                                            }`}
                                        >
                                            {c.audience_type}
                                        </span>
                                        {c.first_name && <span>{c.first_name}</span>}
                                        {c.unsubscribed_at && (
                                            <span className="text-red-600">désinscrit</span>
                                        )}
                                        {!c.marketing_opt_in && !c.unsubscribed_at && (
                                            <span className="text-amber-700">opt-out</span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => remove(c)}
                                    disabled={busy}
                                    className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
                                    title="Retirer"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
