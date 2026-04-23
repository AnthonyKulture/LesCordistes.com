'use client'

import { useState } from 'react'
import { Mail, Phone, Building2, Award, MapPin, CreditCard, Plus, Minus } from 'lucide-react'
import { AiSidebar } from '@/components/admin/AiSidebar'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import type { Profile, CreditTransaction } from '@/lib/types/ops'

type Props = {
    initialProfile: Profile
    initialBalance: number
    initialTransactions: CreditTransaction[]
}

const TX_LABEL: Record<string, string> = {
    purchase: 'Achat / ajout',
    spend: 'Dépense / déblocage',
    refund: 'Remboursement',
}

export function ProfileDetail({ initialProfile, initialBalance, initialTransactions }: Props) {
    const [profile] = useState<Profile>(initialProfile)
    const [balance, setBalance] = useState(initialBalance)
    const [transactions, setTransactions] = useState<CreditTransaction[]>(initialTransactions)
    const [delta, setDelta] = useState('')
    const [description, setDescription] = useState('')
    const [busy, setBusy] = useState(false)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [feedback, setFeedback] = useState<string | null>(null)

    const name =
        profile.full_name ||
        [profile.first_name, profile.last_name].filter(Boolean).join(' ') ||
        profile.email
    const certs = profile.certifications ?? []
    const zones = profile.intervention_zones ?? []
    const equipment = profile.equipment ?? []

    const numericDelta = Number(delta)
    const validDelta = Number.isFinite(numericDelta) && numericDelta !== 0
    const validDesc = description.trim().length >= 3

    async function applyAdjust() {
        setBusy(true)
        try {
            const res = await fetch(`/api/ops/users/${profile.id}/credits`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ delta: numericDelta, description: description.trim() }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data?.error ?? 'erreur')
            setBalance(data.balance)
            setDelta('')
            setDescription('')
            setFeedback(`Solde mis à jour : ${data.balance} crédits ✓`)

            // recharger l'historique
            const txRes = await fetch(`/api/ops/users/${profile.id}`, { cache: 'no-store' })
            const txData = await txRes.json()
            if (txData.transactions) setTransactions(txData.transactions as CreditTransaction[])
        } catch (err) {
            setFeedback('Erreur : ' + (err instanceof Error ? err.message : 'inconnue'))
        } finally {
            setBusy(false)
            setConfirmOpen(false)
            setTimeout(() => setFeedback(null), 4000)
        }
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6">
            <section className="space-y-4 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{name}</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            {profile.email} · <span className="uppercase text-xs">{profile.role}</span>
                        </p>
                    </div>
                    {profile.role === 'pro' && (
                        <div className="text-right">
                            <div className="text-xs uppercase tracking-wider text-slate-500">Solde</div>
                            <div className="text-3xl font-bold text-[#243355] tabular-nums">{balance}</div>
                            <div className="text-xs text-slate-500">crédits</div>
                        </div>
                    )}
                </div>

                {feedback && (
                    <div className="text-sm bg-slate-100 text-slate-700 px-3 py-2 rounded-lg">{feedback}</div>
                )}

                {/* Infos */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <h2 className="md:col-span-2 text-sm font-semibold text-slate-700 mb-2">Identité</h2>
                    <DetailRow label="Téléphone" value={profile.phone ?? '—'} icon={Phone} />
                    <DetailRow label="Société" value={profile.company_name ?? '—'} icon={Building2} />
                    <DetailRow label="SIRET" value={profile.siret ?? '—'} />
                    <DetailRow label="Email" value={profile.email} icon={Mail} />
                    <DetailRow label="Type client" value={profile.client_type ?? '—'} />
                    <DetailRow
                        label="Inscrit le"
                        value={new Date(profile.created_at).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                    />
                </div>

                {profile.bio && (
                    <div className="bg-white border border-slate-200 rounded-xl p-5">
                        <h2 className="text-sm font-semibold text-slate-700 mb-2">Bio</h2>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{profile.bio}</p>
                    </div>
                )}

                {(certs.length > 0 || zones.length > 0 || equipment.length > 0) && (
                    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                        <h2 className="text-sm font-semibold text-slate-700">Compétences</h2>
                        {certs.length > 0 && (
                            <div>
                                <div className="text-xs uppercase tracking-wider text-slate-500 mb-1 inline-flex items-center gap-1">
                                    <Award className="h-3 w-3" /> Certifications
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {certs.map(c => (
                                        <span key={c} className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded">
                                            {c}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {zones.length > 0 && (
                            <div>
                                <div className="text-xs uppercase tracking-wider text-slate-500 mb-1 inline-flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> Zones
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {zones.map(z => (
                                        <span key={z} className="text-xs px-2 py-1 bg-blue-50 text-[#243355] rounded">
                                            {z}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {equipment.length > 0 && (
                            <div>
                                <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Équipement</div>
                                <div className="flex flex-wrap gap-1">
                                    {equipment.map(e => (
                                        <span key={e} className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded">
                                            {e}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Crédits — uniquement pour les pros */}
                {profile.role === 'pro' && (
                    <div className="bg-white border border-slate-200 rounded-xl p-5">
                        <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <CreditCard className="h-4 w-4" /> Ajustement de crédits
                        </h2>
                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setDelta(d => String(Number(d || '0') - 1))}
                                    className="p-2 border border-slate-200 rounded hover:bg-slate-50"
                                    aria-label="Décrémenter"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <input
                                    type="number"
                                    value={delta}
                                    onChange={e => setDelta(e.target.value)}
                                    placeholder="±N"
                                    className="w-24 text-center px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                                />
                                <button
                                    type="button"
                                    onClick={() => setDelta(d => String(Number(d || '0') + 1))}
                                    className="p-2 border border-slate-200 rounded hover:bg-slate-50"
                                    aria-label="Incrémenter"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                            <input
                                type="text"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Motif obligatoire (ex: dédommagement bug)"
                                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                            />
                            <button
                                type="button"
                                disabled={!validDelta || !validDesc || busy}
                                onClick={() => setConfirmOpen(true)}
                                className="px-4 py-2 bg-[#243355] text-white rounded-lg text-sm hover:bg-[#1c2945] disabled:opacity-50"
                            >
                                Appliquer
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            Solde actuel : <strong>{balance}</strong> · Solde résultant :{' '}
                            <strong className={validDelta && balance + numericDelta < 0 ? 'text-red-600' : ''}>
                                {validDelta ? balance + numericDelta : balance}
                            </strong>
                        </p>
                    </div>
                )}

                {/* Historique transactions */}
                {profile.role === 'pro' && (
                    <div className="bg-white border border-slate-200 rounded-xl p-5">
                        <h2 className="text-sm font-semibold text-slate-700 mb-3">Historique transactions</h2>
                        {transactions.length === 0 ? (
                            <p className="text-sm text-slate-500 italic">Aucune transaction.</p>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {transactions.map(t => (
                                    <li key={t.id} className="py-2 flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="text-sm text-slate-800">
                                                {TX_LABEL[t.type] ?? t.type}{' '}
                                                {t.description && <span className="text-slate-500">— {t.description}</span>}
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                {new Date(t.created_at).toLocaleString('fr-FR')}
                                            </div>
                                        </div>
                                        <span className={`font-mono tabular-nums font-semibold ${t.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {t.amount > 0 ? '+' : ''}
                                            {t.amount}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </section>

            <aside className="xl:sticky xl:top-6 xl:self-start xl:h-[calc(100vh-3rem)]">
                <AiSidebar
                    title="Assistant — Profil"
                    context={{ type: 'profile', id: profile.id, data: profile }}
                    onMutationSuccess={async (tool) => {
                        if (tool === 'adjust_credits') {
                            // Rechargement du solde + transactions
                            try {
                                const r = await fetch(`/api/ops/users/${profile.id}`, { cache: 'no-store' })
                                const data = await r.json()
                                if (typeof data.credits?.balance === 'number') setBalance(Number(data.credits.balance))
                                if (Array.isArray(data.transactions)) setTransactions(data.transactions as CreditTransaction[])
                                setFeedback('Solde mis à jour par l\'IA ✓')
                                setTimeout(() => setFeedback(null), 4000)
                            } catch {}
                        } else if (tool === 'update_profile_fields' || tool === 'notify_user') {
                            setFeedback(`Action IA exécutée (${tool}).`)
                            setTimeout(() => setFeedback(null), 4000)
                        }
                    }}
                />
            </aside>

            <ConfirmDialog
                open={confirmOpen}
                title={`Ajustement ${numericDelta > 0 ? '+' : ''}${numericDelta} crédit(s)`}
                description={`Pro : ${name}\nSolde : ${balance} → ${balance + numericDelta}\nMotif : ${description.trim()}`}
                confirmLabel="Confirmer"
                danger={numericDelta < 0}
                busy={busy}
                onConfirm={applyAdjust}
                onCancel={() => setConfirmOpen(false)}
            />
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
