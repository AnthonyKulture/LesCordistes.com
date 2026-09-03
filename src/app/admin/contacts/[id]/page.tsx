import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Briefcase, Coins, ExternalLink } from 'lucide-react'
import { fetchContactDetail, fetchContacts } from '@/lib/ops/fetchContacts'
import { isCurrentUserAdmin } from '@/lib/ops/guard'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { ContactTimeline } from '@/components/admin/contacts/ContactTimeline'
import {
    AUDIENCE_META,
    formatAbsolute,
    formatEuros,
    formatRelative,
    sourceLabel,
} from '@/components/admin/contacts/crmLabels'
import type { ContactDetail } from '@/lib/types/crm'
import { ContactActions } from './ContactActions'

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'Fiche contact · Admin',
}

const JOBS_SHOWN = 8

export default async function ContactDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    // Fail-closed, comme sur la liste : layout et page sont rendus
    // concurremment, le garde du layout ne suffit pas à retenir la lecture.
    if (!(await isCurrentUserAdmin())) notFound()

    const detail = await fetchContactDetail(id)

    if (!detail) {
        // `null` recouvre deux causes très différentes. Une sonde sur la liste
        // les sépare : si elle répond, le RPC existe et c'est l'identifiant qui
        // est inconnu ; sinon la migration n'est pas appliquée.
        const probe = await fetchContacts({ limit: 1 })
        if (probe !== null) notFound()
        return <MigrationMissing />
    }

    const { contact, events, jobs, credits } = detail
    const name = contact.full_name ?? 'Sans nom'

    return (
        <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-8">
            <Link
                href="/admin/contacts"
                className="mb-4 inline-flex items-center gap-1 rounded text-sm text-slate-600 hover:text-[#243355] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#243355]/40"
            >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Retour aux contacts
            </Link>

            <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
                {/* ── Identité + actions ─────────────────────────────────── */}
                <aside className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 lg:sticky lg:top-6">
                    <div>
                        <h1 className="text-xl font-bold leading-tight text-slate-900">{name}</h1>
                        <p className="mt-0.5 break-all text-sm text-slate-500">{contact.email}</p>
                    </div>

                    <ContactActions
                        contactId={contact.id}
                        email={contact.email}
                        phone={contact.phone}
                        stage={contact.lifecycle_stage}
                        unsubscribed={contact.unsubscribed_at !== null}
                    />

                    <dl className="space-y-2 border-t border-slate-100 pt-3 text-sm">
                        <Row label="Type">{AUDIENCE_META[contact.audience_type].label}</Row>
                        <Row label="Compte">
                            {contact.user_id ? (
                                <Link
                                    href={`/admin/profils/${contact.user_id}`}
                                    className="inline-flex items-center gap-1 rounded text-[#243355] underline underline-offset-2 hover:text-[#1c2945] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#243355]/40"
                                >
                                    Voir le profil
                                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                                </Link>
                            ) : (
                                <span className="text-slate-500">Aucun compte</span>
                            )}
                        </Row>
                        <Row label="Téléphone">
                            {contact.phone ? (
                                <span className="tabular-nums">{contact.phone}</span>
                            ) : (
                                <span className="text-slate-400">Non renseigné</span>
                            )}
                        </Row>
                        <Row label="Ville">
                            {contact.city ?? <span className="text-slate-400">Non renseignée</span>}
                        </Row>
                        {contact.company_name && <Row label="Société">{contact.company_name}</Row>}
                        <Row label="Emails marketing">
                            {contact.unsubscribed_at ? (
                                <span className="text-rose-700">
                                    Désinscrit le {formatAbsolute(contact.unsubscribed_at)}
                                </span>
                            ) : contact.marketing_opt_in ? (
                                'Autorisés'
                            ) : (
                                <span className="text-slate-500">Refusés</span>
                            )}
                        </Row>
                        <Row label="Consentement">
                            {contact.consent_at ? (
                                formatAbsolute(contact.consent_at)
                            ) : (
                                <span className="text-slate-400">Non horodaté</span>
                            )}
                        </Row>
                        <Row label="Sources">
                            {contact.sources.length > 0 ? (
                                <span className="flex flex-wrap gap-1">
                                    {contact.sources.map(s => (
                                        <span
                                            key={s}
                                            className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600"
                                        >
                                            {sourceLabel(s)}
                                        </span>
                                    ))}
                                </span>
                            ) : (
                                <span className="text-slate-400">Inconnue</span>
                            )}
                        </Row>
                        <Row label="Première trace">{formatAbsolute(contact.created_at)}</Row>
                        <Row label="Dernière activité">
                            <span title={formatAbsolute(contact.last_activity_at)}>
                                {formatRelative(contact.last_activity_at)}
                            </span>
                        </Row>
                    </dl>
                </aside>

                {/* ── Missions, crédits, journal ──────────────────────────── */}
                <div className="min-w-0 space-y-5">
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                        <JobsCard jobs={jobs} />
                        <CreditsCard credits={credits} userId={contact.user_id} />
                    </div>

                    <section>
                        <h2 className="mb-3 text-sm font-bold text-slate-900">
                            Journal
                            <span className="ml-2 text-xs font-normal text-slate-400 tabular-nums">
                                {events.length} événement{events.length > 1 ? 's' : ''}
                            </span>
                        </h2>
                        <ContactTimeline events={events} />
                    </section>
                </div>
            </div>
        </div>
    )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-3">
            <dt className="shrink-0 text-xs font-medium uppercase tracking-wide text-slate-400">
                {label}
            </dt>
            <dd className="min-w-0 text-right text-slate-700">{children}</dd>
        </div>
    )
}

function JobsCard({ jobs }: { jobs: ContactDetail['jobs'] }) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
                <Briefcase className="h-4 w-4 text-slate-400" aria-hidden="true" />
                Missions
                <span className="text-xs font-normal text-slate-400 tabular-nums">{jobs.length}</span>
            </h2>
            {jobs.length === 0 ? (
                <p className="text-sm text-slate-500">
                    Ce contact n’a encore publié aucune mission.
                </p>
            ) : (
                <ul className="space-y-1.5">
                    {jobs.slice(0, JOBS_SHOWN).map(job => (
                        <li key={job.id}>
                            <Link
                                href={`/admin/missions/${job.id}`}
                                className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 -mx-2 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#243355]/40"
                            >
                                <span className="min-w-0">
                                    <span className="block truncate text-sm text-slate-800">
                                        {job.title || 'Mission sans titre'}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        {formatAbsolute(job.created_at)}
                                    </span>
                                </span>
                                <StatusBadge status={job.status} />
                            </Link>
                        </li>
                    ))}
                    {jobs.length > JOBS_SHOWN && (
                        <li className="px-0 pt-1 text-xs text-slate-400 tabular-nums">
                            + {jobs.length - JOBS_SHOWN} autre{jobs.length - JOBS_SHOWN > 1 ? 's' : ''} mission
                            {jobs.length - JOBS_SHOWN > 1 ? 's' : ''} plus ancienne
                            {jobs.length - JOBS_SHOWN > 1 ? 's' : ''}
                        </li>
                    )}
                </ul>
            )}
        </section>
    )
}

function CreditsCard({
    credits,
    userId,
}: {
    credits: { balance: number; purchased_cents: number; unlocks: number } | null
    userId: string | null
}) {
    if (!credits) {
        return (
            <section className="rounded-xl border border-slate-200 bg-white p-4">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
                    <Coins className="h-4 w-4 text-slate-400" aria-hidden="true" />
                    Crédits
                </h2>
                <p className="text-sm text-slate-500">
                    Réservé aux professionnels disposant d’un compte. Rien à afficher ici.
                </p>
            </section>
        )
    }

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
                <Coins className="h-4 w-4 text-slate-400" aria-hidden="true" />
                Crédits
            </h2>
            <dl className="grid grid-cols-3 gap-2 text-center">
                <Metric label="Solde" value={String(credits.balance)} />
                <Metric label="Achats" value={formatEuros(credits.purchased_cents)} />
                <Metric label="Déblocages" value={String(credits.unlocks)} />
            </dl>
            {userId && (
                <Link
                    href={`/admin/profils/${userId}`}
                    className="mt-3 inline-flex items-center gap-1 rounded text-xs text-[#243355] underline underline-offset-2 hover:text-[#1c2945] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#243355]/40"
                >
                    Ajuster le solde sur la fiche profil
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </Link>
            )}
        </section>
    )
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg bg-slate-50 px-2 py-2">
            <dt className="text-[11px] uppercase tracking-wide text-slate-500">{label}</dt>
            <dd className="mt-0.5 text-lg font-bold text-slate-900 tabular-nums">{value}</dd>
        </div>
    )
}

function MigrationMissing() {
    return (
        <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-8">
            <Link
                href="/admin/contacts"
                className="mb-4 inline-flex items-center gap-1 rounded text-sm text-slate-600 hover:text-[#243355] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#243355]/40"
            >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Retour aux contacts
            </Link>
            <section className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
                <h1 className="text-base font-bold text-amber-900">Le CRM n’est pas encore branché</h1>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-amber-800">
                    La fonction <code>admin_contact_detail</code> n’existe pas en base : impossible de
                    dire si cette fiche existe. Applique la migration{' '}
                    <code>supabase/migrations/20260902a-contact-socle.sql</code> dans le SQL Editor
                    Supabase, puis recharge.
                </p>
            </section>
        </div>
    )
}
