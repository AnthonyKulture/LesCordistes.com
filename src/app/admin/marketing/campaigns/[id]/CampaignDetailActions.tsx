'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Send, Mail, AlertTriangle } from 'lucide-react'

interface PreviewData {
    recipients_count: number
    sample: Array<{ email: string; first_name: string | null }>
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
    const [loadingPreview, setLoadingPreview] = useState(false)
    const [confirmingSend, setConfirmingSend] = useState(false)
    const [sending, setSending] = useState(false)
    const [sendResult, setSendResult] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

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
            setPreview({
                recipients_count: data.recipients_count,
                sample: data.sample ?? [],
            })
            setConfirmingSend(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur')
        } finally {
            setLoadingPreview(false)
        }
    }

    async function realSend() {
        if (!preview) return
        setSending(true)
        setError(null)
        try {
            const res = await fetch(`/api/admin/marketing/campaigns/${campaignId}/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ confirm: 'send' }),
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
                                Cliquez sur Prévisualiser pour voir le nombre exact de destinataires avant tout envoi.
                                Aucun email n'est envoyé tant que vous n'avez pas confirmé.
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
                                <div className="text-amber-900">
                                    <strong>{preview.recipients_count.toLocaleString('fr-FR')}</strong>{' '}
                                    destinataire(s) recevront cet email après filtrage opt-in/désinscrits.
                                </div>
                                {preview.sample.length > 0 && (
                                    <ul className="mt-2 text-xs text-slate-600 font-mono space-y-0.5">
                                        {preview.sample.slice(0, 5).map(s => (
                                            <li key={s.email}>{s.email}</li>
                                        ))}
                                        {preview.recipients_count > 5 && (
                                            <li className="text-slate-400 italic">
                                                … et {preview.recipients_count - 5} autres
                                            </li>
                                        )}
                                    </ul>
                                )}
                            </div>
                            {preview.recipients_count === 0 ? (
                                <p className="text-xs text-amber-700">
                                    Aucun destinataire — l'envoi est bloqué. Vérifiez le segment.
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
                                        Confirmer l'envoi à {preview.recipients_count.toLocaleString('fr-FR')} contact(s)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setConfirmingSend(false)
                                            setPreview(null)
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
