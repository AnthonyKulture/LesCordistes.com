'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Camera, Building2, Save } from 'lucide-react'
import { StatusBadge, LqsBadge } from '@/components/admin/StatusBadge'
import { AiSidebar } from '@/components/admin/AiSidebar'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
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

type Contact = { first_name?: string; last_name?: string; name?: string; email?: string; phone?: string; company_name?: string }

export function MissionDetail({ initial }: { initial: Job }) {
    const [job, setJob] = useState<Job>(initial)
    const [editTitle, setEditTitle] = useState(job.title)
    const [editDescription, setEditDescription] = useState(job.description)
    const [savingEdit, setSavingEdit] = useState(false)
    const [confirmApprove, setConfirmApprove] = useState(false)
    const [showReject, setShowReject] = useState(false)
    const [reasonChoice, setReasonChoice] = useState('')
    const [reasonCustom, setReasonCustom] = useState('')
    const [busy, setBusy] = useState<'approve' | 'reject' | null>(null)
    const [feedback, setFeedback] = useState<string | null>(null)

    const lqs = computeLQS(job)
    const contact = (job.client_contact_info ?? {}) as Contact
    const photos = Array.isArray(job.photos_url) ? job.photos_url : []
    const dirty = editTitle !== job.title || editDescription !== job.description

    async function refresh() {
        const r = await fetch(`/api/ops/jobs/${job.id}`, { cache: 'no-store' })
        const data = await r.json()
        if (data.job) {
            setJob(data.job as Job)
            setEditTitle((data.job as Job).title)
            setEditDescription((data.job as Job).description)
        }
    }

    async function saveEdit() {
        setSavingEdit(true)
        try {
            const res = await fetch(`/api/ops/jobs/${job.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'update', data: { title: editTitle, description: editDescription } }),
            })
            if (!res.ok) throw new Error(await res.text())
            await refresh()
            setFeedback('Mission mise à jour ✓')
            setTimeout(() => setFeedback(null), 3000)
        } catch (err) {
            setFeedback('Erreur : ' + (err instanceof Error ? err.message : 'inconnue'))
        } finally {
            setSavingEdit(false)
        }
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

    function applyAiBlock(text: string, target: 'title' | 'description') {
        if (target === 'title') setEditTitle(text)
        else setEditDescription(text)
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

                {/* Edit form */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                    <h2 className="text-sm font-semibold text-slate-700">Édition</h2>
                    <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wider">Titre</label>
                        <input
                            type="text"
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#243355]/30"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wider">Description</label>
                        <textarea
                            value={editDescription}
                            onChange={e => setEditDescription(e.target.value)}
                            rows={8}
                            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#243355]/30 resize-y"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">{editDescription.length} caractères</span>
                        <button
                            type="button"
                            onClick={saveEdit}
                            disabled={!dirty || savingEdit}
                            className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-[#243355] text-white rounded-lg hover:bg-[#1c2945] disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" /> {savingEdit ? 'Enregistrement…' : 'Enregistrer'}
                        </button>
                    </div>
                </div>

                {/* Actions modération */}
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

                {/* Détails */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <h2 className="md:col-span-2 text-sm font-semibold text-slate-700 mb-2">Détails techniques</h2>
                    <DetailRow label="Type" value={job.type ?? 'standard'} />
                    <DetailRow label="Type client" value={job.client_type ?? '—'} />
                    <DetailRow label="Hauteur" value={job.height_meters ? `${job.height_meters} m` : '—'} />
                    <DetailRow label="Adresse" value={job.location_address ?? '—'} />
                    <DetailRow
                        label="Budget"
                        value={
                            job.daily_rate
                                ? `TJM ${job.daily_rate} €`
                                : job.budget_min || job.budget_max
                                  ? `${job.budget_min ?? '?'} – ${job.budget_max ?? '?'} €`
                                  : '—'
                        }
                    />
                    <DetailRow label="Deadline" value={job.deadline ? new Date(job.deadline).toLocaleDateString('fr-FR') : '—'} />
                    <DetailRow label="Date de début" value={job.start_date ? new Date(job.start_date).toLocaleDateString('fr-FR') : '—'} />
                    <DetailRow label="Durée" value={job.duration_days ? `${job.duration_days} j` : '—'} />
                    <DetailRow label="Type de structure" value={job.structure_type ?? '—'} />
                    <DetailRow label="Réf. interne" value={job.internal_reference ?? '—'} />
                    <DetailRow label="Niveau requis" value={(job.required_level ?? []).join(', ') || '—'} />
                    <DetailRow label="Habilitations" value={(job.required_habilitations ?? []).join(', ') || '—'} />
                    <DetailRow label="Travail nuit/WE" value={job.work_night_weekend ? 'Oui' : 'Non'} />
                    <DetailRow label="Plan de prévention" value={job.security_plan_confirmed ? 'Confirmé' : '—'} />
                    <DetailRow label="Crédit cost" value={String(job.credit_cost ?? 1)} />
                    <DetailRow
                        label="Créée le"
                        value={new Date(job.created_at).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                    />
                </div>

                {/* Contact client */}
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <h2 className="text-sm font-semibold text-slate-700 mb-3">Contact client</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <DetailRow label="Nom" value={contact.name ?? (`${contact.first_name ?? ''} ${contact.last_name ?? ''}`.trim() || '—')} />
                        <DetailRow label="Société" value={contact.company_name ?? '—'} icon={Building2} />
                        <DetailRow label="Email" value={contact.email ?? '—'} icon={Mail} />
                        <DetailRow label="Téléphone" value={contact.phone ?? '—'} icon={Phone} />
                    </div>
                </div>

                {/* Photos */}
                {photos.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-xl p-5">
                        <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <Camera className="h-4 w-4" /> Photos ({photos.length})
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {photos.map((url, i) => (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <a key={i} href={url} target="_blank" rel="noreferrer" className="block aspect-video bg-slate-100 rounded-lg overflow-hidden">
                                    <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            <aside className="xl:sticky xl:top-6 xl:self-start xl:h-[calc(100vh-3rem)]">
                <AiSidebar
                    title="Assistant — Mission"
                    context={{ type: 'job', id: job.id, data: job }}
                    onMutationSuccess={(tool) => {
                        // Toute mutation sur la mission courante doit recharger les données
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
                <div className="hidden xl:block mt-3">
                    <p className="text-xs text-slate-500">
                        Astuce : copie un bloc proposé par l&apos;IA puis colle-le dans le titre/description ci-contre.
                    </p>
                    <button
                        type="button"
                        onClick={async () => {
                            const text = await navigator.clipboard.readText().catch(() => '')
                            if (text) applyAiBlock(text, 'description')
                        }}
                        className="mt-2 text-xs text-[#243355] hover:underline"
                    >
                        Coller depuis le presse-papier dans la description
                    </button>
                </div>
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

function DetailRow({ label, value, icon: Icon }: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }) {
    return (
        <div className="flex items-start justify-between gap-3 py-1 border-b border-slate-100 last:border-0">
            <span className="text-xs uppercase tracking-wider text-slate-500 inline-flex items-center gap-1">
                {Icon && <Icon className="h-3 w-3" />} {label}
            </span>
            <span className="text-sm text-slate-800 text-right break-words max-w-[60%]">{value}</span>
        </div>
    )
}
