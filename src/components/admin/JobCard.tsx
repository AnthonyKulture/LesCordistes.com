'use client'

import Link from 'next/link'
import { useState } from 'react'
import { MapPin, Image as ImageIcon, Calendar, Wallet, ArrowRight, Check, X } from 'lucide-react'
import { StatusBadge, LqsBadge } from './StatusBadge'
import { ConfirmDialog } from './ConfirmDialog'
import { computeLQS } from '@/lib/types/ops'
import type { Job } from '@/lib/types/ops'

type Props = {
    job: Job
    onChange?: () => void
}

const REJECTION_REASONS = [
    'Informations insuffisantes (description trop vague)',
    'Localisation non précisée',
    'Mission hors périmètre (ne requiert pas de cordiste)',
    'Doublon avec une mission existante',
    'Contact invalide ou manquant',
    'Mission inappropriée ou spam',
    'Budget irréaliste',
    'Autre',
]

const CATEGORY_LABEL: Record<string, string> = {
    cleaning: 'Nettoyage',
    construction: 'Construction',
    masonry: 'Maçonnerie',
    painting: 'Peinture',
    industry: 'Industrie',
    event: 'Événementiel',
    other: 'Autre',
}

export function JobCard({ job, onChange }: Props) {
    const lqs = computeLQS(job)
    const [busy, setBusy] = useState<'approve' | 'reject' | null>(null)
    const [confirmApprove, setConfirmApprove] = useState(false)
    const [showReject, setShowReject] = useState(false)
    const [reasonChoice, setReasonChoice] = useState('')
    const [reasonCustom, setReasonCustom] = useState('')

    async function approve() {
        setBusy('approve')
        try {
            const res = await fetch(`/api/ops/jobs/${job.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'approve' }),
            })
            if (!res.ok) throw new Error(await res.text())
            onChange?.()
        } catch (err) {
            alert('Erreur : ' + (err instanceof Error ? err.message : 'inconnue'))
        } finally {
            setBusy(null)
            setConfirmApprove(false)
        }
    }

    async function reject() {
        const reason = reasonChoice === 'Autre' ? reasonCustom.trim() || 'Autre' : reasonChoice
        if (!reason) return
        setBusy('reject')
        try {
            const res = await fetch(`/api/ops/jobs/${job.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reject', reason }),
            })
            if (!res.ok) throw new Error(await res.text())
            onChange?.()
        } catch (err) {
            alert('Erreur : ' + (err instanceof Error ? err.message : 'inconnue'))
        } finally {
            setBusy(null)
            setShowReject(false)
            setReasonChoice('')
            setReasonCustom('')
        }
    }

    const photos = Array.isArray(job.photos_url) ? job.photos_url.length : 0

    return (
        <article className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
            <header className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                    <Link href={`/admin/missions/${job.id}`} className="block group">
                        <h3 className="font-semibold text-slate-900 truncate group-hover:text-[#243355]">{job.title}</h3>
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {job.location_city}
                            {job.location_department ? ` (${job.location_department})` : ''}
                        </span>
                        <span>·</span>
                        <span>{CATEGORY_LABEL[job.category] ?? job.category}</span>
                        {job.client_type && (
                            <>
                                <span>·</span>
                                <span>{job.client_type.replace(/_/g, ' ')}</span>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                    <StatusBadge status={job.status} />
                    <LqsBadge value={lqs} />
                </div>
            </header>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mb-3">
                <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(job.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                </span>
                <span className="inline-flex items-center gap-1">
                    <ImageIcon className="h-3 w-3" /> {photos}
                </span>
                {(job.budget_min || job.budget_max || job.daily_rate) && (
                    <span className="inline-flex items-center gap-1">
                        <Wallet className="h-3 w-3" />
                        {job.daily_rate
                            ? `TJM ${job.daily_rate} €`
                            : `${job.budget_min ?? '?'}–${job.budget_max ?? '?'} €`}
                    </span>
                )}
            </div>

            <p className="text-sm text-slate-700 line-clamp-2 mb-3">{job.description}</p>

            <div className="flex items-center gap-2">
                <Link
                    href={`/admin/missions/${job.id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#243355] hover:underline"
                >
                    Voir détail <ArrowRight className="h-3 w-3" />
                </Link>
                {job.status === 'pending' && (
                    <div className="ml-auto flex gap-2">
                        <button
                            type="button"
                            onClick={() => setShowReject(true)}
                            disabled={!!busy}
                            className="inline-flex items-center gap-1 text-xs px-3 py-1.5 border border-red-200 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50"
                        >
                            <X className="h-3 w-3" /> Rejeter
                        </button>
                        <button
                            type="button"
                            onClick={() => setConfirmApprove(true)}
                            disabled={!!busy}
                            className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                        >
                            <Check className="h-3 w-3" /> Approuver
                        </button>
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={confirmApprove}
                title="Approuver la mission"
                description={`Mettre « ${job.title} » en ligne ?`}
                confirmLabel="Approuver"
                busy={busy === 'approve'}
                onConfirm={approve}
                onCancel={() => setConfirmApprove(false)}
            />

            {showReject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !busy && setShowReject(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-1">Rejeter la mission</h2>
                        <p className="text-sm text-slate-500 mb-4">« {job.title} »</p>
                        <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                            {REJECTION_REASONS.map(r => (
                                <label key={r} className="flex items-start gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="reason"
                                        value={r}
                                        checked={reasonChoice === r}
                                        onChange={() => setReasonChoice(r)}
                                        className="mt-0.5 accent-red-500"
                                    />
                                    <span className="text-sm text-slate-700">{r}</span>
                                </label>
                            ))}
                        </div>
                        {reasonChoice === 'Autre' && (
                            <textarea
                                value={reasonCustom}
                                onChange={e => setReasonCustom(e.target.value)}
                                placeholder="Précise le motif…"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm h-20 resize-none mb-4"
                            />
                        )}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowReject(false)}
                                disabled={busy === 'reject'}
                                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={reject}
                                disabled={!reasonChoice || busy === 'reject'}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 disabled:opacity-50"
                            >
                                {busy === 'reject' ? '…' : 'Confirmer le rejet'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </article>
    )
}
