'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Send, Mail, AlertTriangle, Search } from 'lucide-react'

interface PreviewRecipient {
    contact_id: string
    email: string
    first_name: string | null
    last_name: string | null
    excluded: boolean
}

interface PreviewData {
    total_in_segment: number
    recipients: PreviewRecipient[]
}

export function CampaignDetailActions({
    campaignId,
    status,
}: {
    campaignId: string
    status: string
}) {
    const router = useRouter()
    const [testEmail, setTestEmail] = useState('')
    const [sendingTest, setSendingTest] = useState(false)
    const [testResult, setTestResult] = useState<string | null>(null)

    const [preview, setPreview] = useState<PreviewData | null>(null)
    const [excluded, setExcluded] = useState<Set<string>>(new Set())
    const [search, setSearch] = useState('')
    const [loadingPreview, setLoadingPreview] = useState(false)
    const [confirmingSend, setConfirmingSend] = useState(false)
    const [sending, setSending] = useState(false)
    const [sendResult, setSendResult] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const filtered = useMemo(() => {
        if (!preview) return []
        const q = search.trim().toLowerCase()
        if (!q) return preview.recipients
        return preview.recipients.filter(r => {
            const fullName = `${r.first_name ?? ''} ${r.last_name ?? ''}`.trim().toLowerCase()
            return r.email.toLowerCase().includes(q) || fullName.includes(q)
        })
    }, [preview, search])

    const finalCount = preview ? preview.recipients.length - excluded.size : 0

    async function sendTest() {
        if (!testEmail) return
        setSendingTest(true)
        setTestResult(null)
        setError(null)
        try {
            const res = await fetch(`/api/admin/marketing/campaigns/${campaignId}/test`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: testEmail }),
            })
            const data = (await res.json()) as {
                ok?: boolean
                sent?: number
                failed?: number
                results?: Array<{ to: string; ok: boolean; error: string | null }>
                error?: string
            }
            if (!res.ok) {
                setError(data?.error ?? 'Erreur envoi test')
            } else if (typeof data.sent === 'number') {
                const failedDetail =
                    data.failed && data.failed > 0
                        ? ' · ' +
                          (data.results ?? [])
                              .filter(r => !r.ok)
                              .map(r => `${r.to}: ${r.error}`)
                              .join(', ')
                        : ''
                setTestResult(
                    `Test : ${data.sent} envoyé(s)${data.failed ? `, ${data.failed} échec(s)${failedDetail}` : ''}.`
                )
            } else {
                setTestResult(`Test envoyé.`)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur')
        } finally {
            setSendingTest(false)
        }
    }

    async function loadPreview() {
        setLoadingPreview(true)
        setError(null)
        try {
            const res = await fetch(`/api/admin/marketing/campaigns/${campaignId}/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dry_run: true }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data?.error ?? 'Erreur preview')
                return
            }
            const recipients: PreviewRecipient[] = data.recipients ?? []
            setPreview({
                total_in_segment: data.total_in_segment ?? recipients.length,
                recipients,
            })
            setExcluded(new Set(recipients.filter(r => r.excluded).map(r => r.contact_id)))
            setConfirmingSend(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur')
        } finally {
            setLoadingPreview(false)
        }
    }

    function toggleExclude(contactId: string) {
        setExcluded(prev => {
            const next = new Set(prev)
            if (next.has(contactId)) next.delete(contactId)
            else next.add(contactId)
            return next
        })
    }

    function excludeAllVisible() {
        setExcluded(prev => {
            const next = new Set(prev)
            filtered.forEach(r => next.add(r.contact_id))
            return next
        })
    }

    function includeAllVisible() {
        setExcluded(prev => {
            const next = new Set(prev)
            filtered.forEach(r => next.delete(r.contact_id))
            return next
        })
    }

    async function realSend() {
        if (!preview) return
        setSending(true)
        setError(null)
        try {
            const res = await fetch(`/api/admin/marketing/campaigns/${campaignId}/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    confirm: 'send',
                    excluded_contact_ids: Array.from(excluded),
                }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data?.error ?? 'Erreur envoi')
                return
            }
            setSendResult(
                `Envoi terminé : ${data.sent} envoyé(s), ${data.failed} échec(s), ${data.skipped} skipped.`
            )
            setConfirmingSend(false)
            setPreview(null)
            setExcluded(new Set())
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur')
        } finally {
            setSending(false)
        }
    }

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <h2 className="font-semibold text-slate-900 text-sm">Actions</h2>

            {/* Email de test */}
            <div className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-semibold text-slate-900">Envoyer un test</span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                    Envoie une copie marquée [TEST] sans créer de destinataire de campagne. Plusieurs adresses séparées
                    par virgule (max 10).
                </p>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={testEmail}
                        onChange={e => setTestEmail(e.target.value)}
                        placeholder="anthony@surly.fr, anthonyprofit.sydney@gmail.com"
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#243355]/30"
                    />
                    <button
                        type="button"
                        onClick={sendTest}
                        disabled={sendingTest || !testEmail}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
                    >
                        {sendingTest ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        Envoyer
                    </button>
                </div>
                {testResult && <div className="mt-2 text-xs text-emerald-700">{testResult}</div>}
            </div>

            {/* Envoi réel */}
            {(status === 'draft' || status === 'failed') && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-amber-700" />
                        <span className="text-sm font-semibold text-amber-900">Envoi réel</span>
                    </div>

                    {!confirmingSend ? (
                        <>
                            <p className="text-xs text-amber-900 mb-3">
                                Cliquez sur Prévisualiser pour voir la liste des destinataires et exclure
                                manuellement certains pros avant l'envoi. Aucun email n'est envoyé tant que vous
                                n'avez pas confirmé.
                            </p>
                            <button
                                type="button"
                                onClick={loadPreview}
                                disabled={loadingPreview}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 disabled:opacity-50"
                            >
                                {loadingPreview ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                Prévisualiser l'envoi
                            </button>
                        </>
                    ) : preview ? (
                        <div className="space-y-3">
                            <div className="rounded-lg bg-white border border-amber-300 p-3 text-sm">
                                <div className="flex items-baseline justify-between gap-3">
                                    <div className="text-amber-900">
                                        <strong>{finalCount.toLocaleString('fr-FR')}</strong> destinataire(s) recevront cet email
                                        {excluded.size > 0 && (
                                            <span className="text-amber-700">
                                                {' '}
                                                · <strong>{excluded.size}</strong> exclu(s) manuellement
                                            </span>
                                        )}
                                        .
                                    </div>
                                    <div className="text-xs text-slate-500 shrink-0">
                                        {preview.total_in_segment} dans le segment
                                    </div>
                                </div>
                            </div>

                            {/* Liste cochable */}
                            <div className="rounded-lg bg-white border border-slate-200 overflow-hidden">
                                <div className="px-3 py-2 border-b border-slate-200 flex items-center gap-2">
                                    <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder="Rechercher par email ou nom"
                                        className="flex-1 text-xs focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={excludeAllVisible}
                                        className="text-[11px] text-red-700 hover:underline shrink-0"
                                    >
                                        Tout exclure
                                    </button>
                                    <button
                                        type="button"
                                        onClick={includeAllVisible}
                                        className="text-[11px] text-emerald-700 hover:underline shrink-0"
                                    >
                                        Tout inclure
                                    </button>
                                </div>
                                <ul className="max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs">
                                    {filtered.length === 0 && (
                                        <li className="px-3 py-3 text-slate-400 italic">Aucun résultat.</li>
                                    )}
                                    {filtered.map(r => {
                                        const isExcluded = excluded.has(r.contact_id)
                                        const fullName = [r.first_name, r.last_name]
                                            .filter(Boolean)
                                            .join(' ')
                                        return (
                                            <li
                                                key={r.contact_id}
                                                className={`px-3 py-2 flex items-center gap-2 ${
                                                    isExcluded ? 'bg-red-50/50' : 'hover:bg-slate-50'
                                                }`}
                                            >
                                                <input
                                                    id={`recipient-${r.contact_id}`}
                                                    type="checkbox"
                                                    checked={!isExcluded}
                                                    onChange={() => toggleExclude(r.contact_id)}
                                                    className="h-3.5 w-3.5 rounded border-slate-300"
                                                />
                                                <label
                                                    htmlFor={`recipient-${r.contact_id}`}
                                                    className="flex-1 min-w-0 cursor-pointer"
                                                >
                                                    <div
                                                        className={`font-mono text-[11px] truncate ${
                                                            isExcluded ? 'line-through text-slate-400' : 'text-slate-700'
                                                        }`}
                                                    >
                                                        {r.email}
                                                    </div>
                                                    {fullName && (
                                                        <div
                                                            className={`text-[11px] truncate ${
                                                                isExcluded ? 'text-slate-400' : 'text-slate-500'
                                                            }`}
                                                        >
                                                            {fullName}
                                                        </div>
                                                    )}
                                                </label>
                                                {isExcluded && (
                                                    <span className="text-[10px] font-semibold text-red-600 shrink-0">
                                                        EXCLU
                                                    </span>
                                                )}
                                            </li>
                                        )
                                    })}
                                </ul>
                                {preview.recipients.length >= 1000 && (
                                    <div className="px-3 py-2 text-[11px] text-amber-700 border-t border-slate-200 bg-amber-50">
                                        Liste tronquée à 1000 destinataires — affinez le segment si besoin.
                                    </div>
                                )}
                            </div>

                            {finalCount === 0 ? (
                                <p className="text-xs text-amber-700">
                                    Aucun destinataire — l'envoi est bloqué. Vérifiez le segment ou réincluez des contacts.
                                </p>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={realSend}
                                        disabled={sending}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                        Confirmer l'envoi à {finalCount.toLocaleString('fr-FR')} contact(s)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setConfirmingSend(false)
                                            setPreview(null)
                                            setExcluded(new Set())
                                            setSearch('')
                                        }}
                                        disabled={sending}
                                        className="px-3 py-2 text-sm rounded-lg border border-slate-200 hover:bg-slate-50"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            )}

            {sendResult && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm text-emerald-800">
                    {sendResult}
                </div>
            )}
            {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
                    {error}
                </div>
            )}
        </section>
    )
}
