'use client'

import { useMemo, useState } from 'react'
import { Mail, X, Users, Send, Loader2 } from 'lucide-react'
import { FRENCH_DEPARTMENTS } from '@/constants/departments'

interface PreviewData {
    total: number
    pros_matched: number
    alerts_matched: number
    suppressed: number
    both_sources: number
    capped: boolean
    max_send: number
    sample: string[]
}

export function ZoneMailPanel({
    jobId,
    defaultDepartments,
    defaultSubject,
    defaultBody,
    defaultLink,
}: {
    jobId: string
    defaultDepartments: string[]
    defaultSubject: string
    defaultBody: string
    defaultLink?: string
}) {
    const [open, setOpen] = useState(false)
    const [depts, setDepts] = useState<string[]>(defaultDepartments)
    const [subject, setSubject] = useState(defaultSubject)
    const [body, setBody] = useState(defaultBody)
    const [link, setLink] = useState(defaultLink ?? '')
    const [preview, setPreview] = useState<PreviewData | null>(null)
    const [busy, setBusy] = useState<'preview' | 'send' | null>(null)
    const [feedback, setFeedback] = useState<string | null>(null)
    const [confirming, setConfirming] = useState(false)

    const sortedDepts = useMemo(
        () => [...FRENCH_DEPARTMENTS].sort((a, b) => a.code.localeCompare(b.code)),
        []
    )

    function toggleDept(code: string) {
        setPreview(null)
        setConfirming(false)
        setDepts(prev =>
            prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
        )
    }

    async function loadPreview() {
        setBusy('preview')
        setFeedback(null)
        try {
            const res = await fetch('/api/ops/zone-mail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ departments: depts, dry_run: true }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data?.error ?? 'erreur')
            setPreview(data as PreviewData)
        } catch (err) {
            setFeedback('Erreur aperçu : ' + (err instanceof Error ? err.message : 'inconnue'))
        } finally {
            setBusy(null)
        }
    }

    async function send() {
        setBusy('send')
        setFeedback(null)
        try {
            const res = await fetch('/api/ops/zone-mail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    departments: depts,
                    subject,
                    body,
                    link: link.trim() || undefined,
                    job_id: jobId,
                    confirm: 'send',
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data?.error ?? 'erreur')
            setFeedback(
                `✓ ${data.sent} email${data.sent > 1 ? 's' : ''} envoyé${data.sent > 1 ? 's' : ''}` +
                    (data.failed > 0 ? ` · ${data.failed} échec(s)` : '') +
                    (data.truncated ? ` · tronqué à ${preview?.max_send ?? ''}` : '')
            )
            setConfirming(false)
            setPreview(null)
        } catch (err) {
            setFeedback('Erreur envoi : ' + (err instanceof Error ? err.message : 'inconnue'))
        } finally {
            setBusy(null)
        }
    }

    const canSend = depts.length > 0 && subject.trim() && body.trim()

    if (!open) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-brand-blue text-white rounded-lg text-sm font-semibold hover:bg-brand-blue/90"
            >
                <Mail className="h-4 w-4" />
                Prévenir les pros de la zone
            </button>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <h2 className="text-base font-bold text-slate-900 inline-flex items-center gap-2">
                        <Mail className="h-4 w-4 text-brand-blue" />
                        Email ciblé par zone d&apos;intervention
                    </h2>
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="px-5 py-4 space-y-4">
                    {/* Départements */}
                    <div>
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                            Départements ciblés ({depts.length})
                        </label>
                        <p className="text-xs text-slate-400 mt-0.5 mb-2">
                            Pros inscrits sur ces zones + abonnés alertes. Dédupliqué par email, désinscrits exclus.
                        </p>
                        <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto p-2 border border-slate-100 rounded-lg bg-slate-50">
                            {sortedDepts.map(d => (
                                <button
                                    key={d.code}
                                    type="button"
                                    onClick={() => toggleDept(d.code)}
                                    title={d.label}
                                    className={`w-10 h-8 text-xs font-semibold rounded border transition-all ${
                                        depts.includes(d.code)
                                            ? 'bg-brand-blue text-white border-brand-blue'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-brand-blue'
                                    }`}
                                >
                                    {d.code}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Aperçu destinataires */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={loadPreview}
                            disabled={depts.length === 0 || busy !== null}
                            className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                            {busy === 'preview' ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Users className="h-4 w-4" />
                            )}
                            Compter les destinataires
                        </button>
                        {preview && (
                            <div className="text-sm text-slate-600">
                                <strong className="text-slate-900">{preview.total}</strong> destinataire
                                {preview.total > 1 ? 's' : ''}
                                <span className="text-slate-400">
                                    {' '}
                                    ({preview.pros_matched} pros · {preview.alerts_matched} alertes
                                    {preview.suppressed > 0 && ` · ${preview.suppressed} désinscrits exclus`})
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Sujet */}
                    <div>
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                            Sujet
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            maxLength={200}
                            className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                        />
                    </div>

                    {/* Corps */}
                    <div>
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                            Message
                        </label>
                        <p className="text-xs text-slate-400 mt-0.5 mb-1">
                            Texte brut. Un lien de désinscription et « répondez à cet email » sont ajoutés automatiquement.
                        </p>
                        <textarea
                            value={body}
                            onChange={e => setBody(e.target.value)}
                            rows={8}
                            maxLength={8000}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-mono"
                        />
                    </div>

                    {/* Lien CTA */}
                    <div>
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                            Lien bouton (optionnel)
                        </label>
                        <input
                            type="url"
                            value={link}
                            onChange={e => setLink(e.target.value)}
                            placeholder="https://www.lescordistes.com/jobs/…"
                            className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                        />
                    </div>

                    {feedback && (
                        <div className="text-sm px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                            {feedback}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900"
                    >
                        Fermer
                    </button>
                    {!confirming ? (
                        <button
                            type="button"
                            onClick={() => {
                                if (!preview) loadPreview()
                                setConfirming(true)
                            }}
                            disabled={!canSend || busy !== null}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg text-sm font-semibold hover:bg-brand-blue/90 disabled:opacity-50"
                        >
                            <Send className="h-4 w-4" />
                            Envoyer…
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-600">
                                Confirmer l&apos;envoi à {preview?.total ?? '…'} destinataire
                                {(preview?.total ?? 0) > 1 ? 's' : ''} ?
                            </span>
                            <button
                                type="button"
                                onClick={send}
                                disabled={busy !== null}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
                            >
                                {busy === 'send' ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                                Confirmer
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
