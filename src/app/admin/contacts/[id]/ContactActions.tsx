'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { Flag, Loader2, Mail, Pencil, Phone, StickyNote } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { StageBadge } from '@/components/admin/contacts/StageBadge'
import { STAGE_META } from '@/components/admin/contacts/crmLabels'
import { LIFECYCLE_STAGES, type LifecycleStage, type ManualEventKind } from '@/lib/types/crm'
import { CONTACTS_KEY } from '../contactsKeys'

type Props = {
    contactId: string
    email: string
    phone: string | null
    stage: LifecycleStage
    unsubscribed: boolean
}

const NOTE_MAX = 4000
const TITLE_MAX = 120

const ERROR_LABELS: Record<string, string> = {
    contact_not_found: 'Cette fiche n’existe plus.',
    invalid_kind: 'Type d’événement refusé par la base.',
    invalid_stage: 'Stage inconnu.',
    invalid_title: 'Le texte est vide ou trop long.',
    detail_too_long: `La note dépasse ${NOTE_MAX} caractères.`,
    invalid_contact_id: 'Identifiant de fiche invalide.',
    invalid_json: 'Requête malformée.',
}

function humanError(raw: unknown, fallback: string): string {
    if (typeof raw !== 'string' || raw.length === 0) return fallback
    // Le 503 du socle arrive déjà rédigé en français, on ne le retraduit pas.
    return ERROR_LABELS[raw] ?? raw
}

/**
 * Actions rapides de la fiche — le cœur de l'écran.
 *
 * Règle non négociable : aucune action de contact ne quitte l'outil sans
 * laisser de trace. « Appeler » et « Email » sont de vraies ancres `tel:` /
 * `mailto:` (le clic doit rester un geste utilisateur pour que le gestionnaire
 * s'ouvre), et l'écriture au journal part en parallèle du même clic. La trace
 * n'est jamais une saisie séparée que l'opérateur pourrait oublier.
 */
export function ContactActions({ contactId, email, phone, stage, unsubscribed }: Props) {
    const router = useRouter()
    const toast = useToast()
    const queryClient = useQueryClient()
    const [, startTransition] = useTransition()

    const [busy, setBusy] = useState<ManualEventKind | 'stage' | null>(null)
    const [noteOpen, setNoteOpen] = useState(false)
    const [stageOpen, setStageOpen] = useState(false)
    const [note, setNote] = useState('')

    const refresh = useCallback(() => {
        // La liste porte `lifecycle_stage` et `last_activity_at` : la laisser
        // périmée afficherait un stage obsolète au retour en arrière.
        queryClient.invalidateQueries({ queryKey: CONTACTS_KEY, refetchType: 'none' })
        startTransition(() => router.refresh())
    }, [queryClient, router])

    const trace = useCallback(
        async (kind: ManualEventKind, title: string, detail: string | null, success: string) => {
            setBusy(kind)
            try {
                const res = await fetch(`/api/ops/contacts/${contactId}/events`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ kind, title, detail }),
                    // `mailto:` peut être servi par un webmail : le navigateur
                    // quitte alors la page et annule les requêtes en vol — le
                    // clic « Email » partirait sans laisser de trace, exactement
                    // ce que cet écran doit empêcher. `keepalive` fait survivre
                    // le POST au déchargement (corps très en deçà des 64 Ko).
                    keepalive: true,
                })
                const body = (await res.json().catch(() => null)) as { error?: unknown } | null
                if (!res.ok) throw new Error(humanError(body?.error, `Erreur ${res.status}`))
                toast.success(success)
                refresh()
                return true
            } catch (e) {
                toast.error(
                    e instanceof Error ? e.message : 'L’action n’a pas pu être inscrite au journal.'
                )
                return false
            } finally {
                setBusy(null)
            }
        },
        [contactId, refresh, toast]
    )

    const submitNote = useCallback(async () => {
        const text = note.trim()
        if (!text) return
        const firstLine = text.split('\n')[0].trim()
        const title = firstLine.length > TITLE_MAX ? `${firstLine.slice(0, TITLE_MAX - 1)}…` : firstLine
        const ok = await trace('note', title, text === title ? null : text, 'Note ajoutée au journal.')
        if (ok) {
            setNote('')
            setNoteOpen(false)
        }
    }, [note, trace])

    const applyStage = useCallback(
        async (next: LifecycleStage) => {
            if (next === stage) {
                setStageOpen(false)
                return
            }
            setBusy('stage')
            try {
                const res = await fetch(`/api/ops/contacts/${contactId}/stage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ stage: next }),
                })
                const body = (await res.json().catch(() => null)) as { error?: unknown } | null
                if (!res.ok) throw new Error(humanError(body?.error, `Erreur ${res.status}`))
                toast.success(`Stage passé à « ${STAGE_META[next].label} ».`)
                setStageOpen(false)
                refresh()
            } catch (e) {
                toast.error(e instanceof Error ? e.message : 'Changement de stage refusé.')
            } finally {
                setBusy(null)
            }
        },
        [contactId, refresh, stage, toast]
    )

    const working = busy !== null

    return (
        <>
            <div className="space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Stage
                </span>
                <button
                    type="button"
                    onClick={() => setStageOpen(true)}
                    disabled={working}
                    title={STAGE_META[stage].hint}
                    className="flex w-full items-center gap-2 rounded-lg border border-slate-200 px-2 py-1.5 text-left transition-colors hover:bg-slate-50 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#243355]/40"
                >
                    <StageBadge stage={stage} />
                    <Pencil className="ml-auto h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                    <span className="sr-only">Changer le stage du contact</span>
                </button>
            </div>

            {unsubscribed && (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-relaxed text-rose-800">
                    Ce contact s’est désinscrit. Un email de prospection est exclu ; seule une réponse
                    à sa propre demande reste légitime.
                </p>
            )}

            <div className="grid grid-cols-2 gap-2">
                <ActionAnchor
                    href={phone ? `tel:${phone.replace(/\s/g, '')}` : undefined}
                    icon={Phone}
                    label="Appeler"
                    busy={busy === 'call'}
                    disabledReason="Aucun téléphone sur cette fiche"
                    onClick={() =>
                        void trace('call', 'Appel lancé depuis la fiche', null, 'Appel inscrit au journal.')
                    }
                />
                <ActionButton
                    icon={StickyNote}
                    label="Note"
                    busy={busy === 'note'}
                    disabled={working}
                    onClick={() => setNoteOpen(true)}
                />
                <ActionAnchor
                    href={email ? `mailto:${email}` : undefined}
                    icon={Mail}
                    label="Email"
                    busy={busy === 'email_sent'}
                    disabledReason="Aucune adresse sur cette fiche"
                    onClick={() =>
                        void trace(
                            'email_sent',
                            'Email ouvert depuis la fiche',
                            null,
                            'Ouverture de l’email inscrite au journal.'
                        )
                    }
                />
                <ActionButton
                    icon={Flag}
                    label="Changer le stage"
                    busy={busy === 'stage'}
                    disabled={working}
                    onClick={() => setStageOpen(true)}
                />
            </div>

            <Modal
                open={noteOpen}
                title="Ajouter une note"
                description="Elle rejoint le journal du contact, signée de ton compte."
                onClose={() => setNoteOpen(false)}
                busy={busy === 'note'}
            >
                <NoteForm
                    value={note}
                    onChange={setNote}
                    onSubmit={submitNote}
                    onCancel={() => setNoteOpen(false)}
                    busy={busy === 'note'}
                />
            </Modal>

            <Modal
                open={stageOpen}
                title="Changer le stage"
                description="Un stage posé à la main est verrouillé : le recalcul automatique ne le touchera plus. Le changement est inscrit au journal."
                onClose={() => setStageOpen(false)}
                busy={busy === 'stage'}
            >
                <ul className="space-y-1.5">
                    {LIFECYCLE_STAGES.map(s => {
                        const current = s === stage
                        return (
                            <li key={s}>
                                <button
                                    type="button"
                                    onClick={() => void applyStage(s)}
                                    disabled={busy === 'stage'}
                                    aria-current={current ? 'true' : undefined}
                                    className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left transition-colors disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#243355]/40 ${
                                        current
                                            ? 'border-[#243355] bg-slate-50'
                                            : 'border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    <StageBadge stage={s} size="sm" />
                                    <span className="min-w-0 flex-1 text-xs leading-relaxed text-slate-500">
                                        {STAGE_META[s].hint}
                                    </span>
                                    {current && (
                                        <span className="shrink-0 text-[11px] font-semibold text-[#243355]">
                                            actuel
                                        </span>
                                    )}
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </Modal>
        </>
    )
}

// ── Briques ─────────────────────────────────────────────────────────────────

type IconComponent = typeof Phone

const ACTION_CLASS =
    'flex flex-col items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-3 text-xs font-semibold text-slate-700 transition-colors hover:border-[#243355] hover:text-[#243355] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#243355]/40'

function ActionButton({
    icon: Icon,
    label,
    busy,
    disabled,
    onClick,
}: {
    icon: IconComponent
    label: string
    busy: boolean
    disabled: boolean
    onClick: () => void
}) {
    return (
        <button type="button" onClick={onClick} disabled={disabled} className={ACTION_CLASS}>
            {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
                <Icon className="h-4 w-4" aria-hidden="true" />
            )}
            <span className="text-center leading-tight">{label}</span>
        </button>
    )
}

/**
 * `tel:` et `mailto:` doivent partir d'une vraie ancre : déclencher la
 * navigation depuis un handler asynchrone la ferait bloquer par le navigateur
 * (plus de geste utilisateur). Le clic ouvre donc le gestionnaire, et la trace
 * part en parallèle.
 */
function ActionAnchor({
    href,
    icon: Icon,
    label,
    busy,
    disabledReason,
    onClick,
}: {
    href: string | undefined
    icon: IconComponent
    label: string
    busy: boolean
    disabledReason: string
    onClick: () => void
}) {
    if (!href) {
        return (
            <button type="button" disabled title={disabledReason} className={ACTION_CLASS}>
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="text-center leading-tight">{label}</span>
                <span className="sr-only">— indisponible : {disabledReason}</span>
            </button>
        )
    }

    // Le handler reste branché même quand une autre action est en vol : une
    // ancre navigue de toute façon, la débrancher créerait un chemin où
    // l'opérateur appelle sans que rien ne soit inscrit au journal.
    return (
        <a href={href} onClick={onClick} className={ACTION_CLASS}>
            {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
                <Icon className="h-4 w-4" aria-hidden="true" />
            )}
            <span className="text-center leading-tight">{label}</span>
        </a>
    )
}

function NoteForm({
    value,
    onChange,
    onSubmit,
    onCancel,
    busy,
}: {
    value: string
    onChange: (v: string) => void
    onSubmit: () => void
    onCancel: () => void
    busy: boolean
}) {
    const ref = useRef<HTMLTextAreaElement>(null)
    useEffect(() => {
        ref.current?.focus()
    }, [])

    const remaining = NOTE_MAX - value.length

    return (
        <div className="space-y-3">
            <textarea
                ref={ref}
                value={value}
                maxLength={NOTE_MAX}
                onChange={e => onChange(e.target.value)}
                rows={6}
                placeholder="Ce qui s’est dit, ce qu’il attend, la prochaine étape…"
                aria-label="Contenu de la note"
                className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm leading-relaxed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#243355]/40"
            />
            <p className="text-xs text-slate-400">
                La première ligne sert de titre dans le journal.
                {remaining < 500 && (
                    <span className="ml-1 tabular-nums">{remaining} caractères restants.</span>
                )}
            </p>
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={busy}
                    className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#243355]/40"
                >
                    Annuler
                </button>
                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={busy || value.trim().length === 0}
                    className="flex-1 rounded-lg bg-[#243355] px-4 py-2 text-sm font-medium text-white hover:bg-[#1c2945] disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#243355]/40"
                >
                    {busy ? 'Enregistrement…' : 'Enregistrer'}
                </button>
            </div>
        </div>
    )
}

function Modal({
    open,
    title,
    description,
    busy,
    onClose,
    children,
}: {
    open: boolean
    title: string
    description?: string
    busy: boolean
    onClose: () => void
    children: React.ReactNode
}) {
    useEffect(() => {
        if (!open) return
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !busy) onClose()
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [open, busy, onClose])

    if (!open) return null

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={busy ? undefined : onClose}
            />
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                {description && (
                    <p className="mb-4 mt-1 text-sm leading-relaxed text-slate-600">{description}</p>
                )}
                {children}
            </div>
        </div>
    )
}
