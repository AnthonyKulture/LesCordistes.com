'use client'

import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { StatusBadge, LqsBadge } from '@/components/admin/StatusBadge'
import { AiSidebar } from '@/components/admin/AiSidebar'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { MissionEditForm } from '@/components/admin/MissionEditForm'
import { PhotoManager } from '@/components/admin/PhotoManager'
import { computeLQS } from '@/lib/types/ops'
import type { Job } from '@/lib/types/ops'

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
    securing: 'Sécurisation',
    telecom: 'Télécommunications',
    inspection: 'Inspection',
    repair: 'Dépannage',
    pruning: 'Élagage & Végétaux',
    other: 'Autre',
}

export function MissionDetail({ initial }: { initial: Job }) {
    const [job, setJob] = useState<Job>(initial)
    const [confirmApprove, setConfirmApprove] = useState(false)
    const [showReject, setShowReject] = useState(false)
    const [reasonChoice, setReasonChoice] = useState('')
    const [reasonCustom, setReasonCustom] = useState('')
    const [busy, setBusy] = useState<'approve' | 'reject' | null>(null)
    const [feedback, setFeedback] = useState<string | null>(null)

    const lqs = computeLQS(job)
    const photos = Array.isArray(job.photos_url) ? job.photos_url : []

    async function refresh() {
        const r = await fetch(`/api/ops/jobs/${job.id}`, { cache: 'no-store' })
        const data = await r.json()
        if (data.job) setJob(data.job as Job)
    }

    async function approve() {
        setBusy('approve')
        try {
            const res = await fetch(`/api/ops/jobs/${job.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'approve' }),
            })
            if (!res.ok) throw new Error(await res.text())
            await refresh()
            setFeedback('Mission approuvée ✓')
            setTimeout(() => setFeedback(null), 3000)
        } catch (err) {
            setFeedback('Erreur : ' + (err instanceof Error ? err.message : 'inconnue'))
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
            await refresh()
            setFeedback('Mission rejetée ✓')
            setTimeout(() => setFeedback(null), 3000)
        } catch (err) {
            setFeedback('Erreur : ' + (err instanceof Error ? err.message : 'inconnue'))
        } finally {
            setBusy(null)
            setShowReject(false)
            setReasonChoice('')
            setReasonCustom('')
        }
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6">
            <section className="space-y-4 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
                        <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                            <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {job.location_city}
                                {job.location_department && ` (${job.location_department})`}
                            </span>
                            <span>·</span>
                            <span>{CATEGORY_LABEL[job.category] ?? job.category}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <StatusBadge status={job.status} />
                        <LqsBadge value={lqs} />
                    </div>
                </div>

                {feedback && (
                    <div className="text-sm bg-slate-100 text-slate-700 px-3 py-2 rounded-lg">{feedback}</div>
                )}

                {/* Édition complète — tous les champs */}
                <MissionEditForm job={job} onSaved={refresh} />

                {/* Photos — upload / suppression */}
                <PhotoManager
                    jobId={job.id}
                    photos={photos}
                    onChange={next => setJob(j => ({ ...j, photos_url: next }))}
                />

                {/* Modération */}
                {job.status === 'pending' && (
                    <div className="bg-white border border-slate-200 rounded-xl p-5">
                        <h2 className="text-sm font-semibold text-slate-700 mb-3">Modération</h2>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setShowReject(true)}
                                disabled={!!busy}
                                className="px-4 py-2 border border-red-200 text-red-700 rounded-lg text-sm hover:bg-red-50"
                            >
                                Rejeter
                            </button>
                            <button
                                type="button"
                                onClick={() => setConfirmApprove(true)}
                                disabled={!!busy}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"
                            >
                                Approuver
                            </button>
                        </div>
                    </div>
                )}

                {job.status === 'rejected' && job.rejection_reason && (
                    <div className="bg-red-50 border border-red-100 text-red-800 rounded-xl p-4 text-sm">
                        <strong>Motif de rejet :</strong> {job.rejection_reason}
                    </div>
                )}

                <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-500 space-y-1">
                    <div>
                        <span className="uppercase tracking-wider">Créée le</span>{' '}
                        {new Date(job.created_at).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                    {job.updated_at && (
                        <div>
                            <span className="uppercase tracking-wider">Dernière maj</span>{' '}
                            {new Date(job.updated_at).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                    )}
                </div>
            </section>

            <aside className="xl:sticky xl:top-6 xl:self-start xl:h-[calc(100vh-3rem)]">
                <AiSidebar
                    title="Assistant — Mission"
                    context={{ type: 'job', id: job.id, data: job }}
                    onMutationSuccess={(tool) => {
                        if (
                            tool === 'update_job_fields' ||
                            tool === 'approve_mission' ||
                            tool === 'reject_mission' ||
                            tool === 'archive_mission'
                        ) {
                            refresh()
                            setFeedback(`Action IA exécutée (${tool}) — fiche rechargée.`)
                            setTimeout(() => setFeedback(null), 4000)
                        }
                    }}
                    quickActions={[
                        {
                            label: 'Améliore la description',
                            prompt:
                                'Réécris la description de cette mission en conservant absolument toutes les informations techniques. Texte final dans un bloc de code.',
                        },
                        {
                            label: 'Suggère un titre',
                            prompt: 'Propose 3 titres alternatifs courts et explicites. Mets-les dans un bloc de code, un par ligne.',
                        },
                        {
                            label: 'Détecte les problèmes',
                            prompt:
                                'Cette mission est-elle prête à être publiée ? Liste précisément ce qui manque ou pose problème (info, budget, contact, photos).',
                        },
                        {
                            label: 'Résume pour un pro',
                            prompt: 'Résume cette mission en 2 phrases percutantes qui donnent envie à un cordiste de dépenser 1 crédit pour la débloquer.',
                        },
                    ]}
                />
            </aside>

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
                                        name="reason-detail"
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
                                placeholder="Précise…"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm h-20 resize-none mb-4"
                            />
                        )}
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setShowReject(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm">
                                Annuler
                            </button>
                            <button
                                type="button"
                                disabled={!reasonChoice || busy === 'reject'}
                                onClick={reject}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm disabled:opacity-50"
                            >
                                {busy === 'reject' ? '…' : 'Confirmer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
