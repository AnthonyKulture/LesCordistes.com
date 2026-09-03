'use client'

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Loader2, Search } from 'lucide-react'
import { StageBadge } from '@/components/admin/contacts/StageBadge'
import {
    AUDIENCE_META,
    formatAbsolute,
    formatRelative,
    sourceLabel,
    STAGE_META,
} from '@/components/admin/contacts/crmLabels'
import { LIFECYCLE_STAGES, type ContactAudience, type ContactListRow, type LifecycleStage } from '@/lib/types/crm'
import { CONTACTS_KEY, CONTACTS_LIST_LIMIT } from './contactsKeys'

type AccountFilter = 'all' | 'yes' | 'no'
type StageFilter = LifecycleStage | 'all'
type AudienceFilter = ContactAudience | 'all'

type Props = {
    initialContacts: ContactListRow[] | null
    initialStage: StageFilter
    initialAudience: AudienceFilter
    initialAccount: AccountFilter
    initialSource: string
    initialQuery: string
}

type Payload = { contacts: ContactListRow[]; available: boolean }

const AUDIENCE_OPTIONS: { value: AudienceFilter; label: string }[] = [
    { value: 'all', label: 'Tous les types' },
    { value: 'client', label: 'Clients' },
    { value: 'pro', label: 'Professionnels' },
    { value: 'unknown', label: 'Non qualifiés' },
]

const ACCOUNT_OPTIONS: { value: AccountFilter; label: string }[] = [
    { value: 'all', label: 'Compte : indifférent' },
    { value: 'yes', label: 'Avec un compte' },
    { value: 'no', label: 'Sans compte' },
]

const SELECT_CLASS =
    'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#243355]/40'

/** Un numéro se cherche tel qu'on l'a en tête, pas tel qu'il est stocké. */
function digitsOnly(value: string): string {
    return value.replace(/\D/g, '')
}

export function ContactsList({
    initialContacts,
    initialStage,
    initialAudience,
    initialAccount,
    initialSource,
    initialQuery,
}: Props) {
    const [search, setSearch] = useState(initialQuery)
    const [stage, setStage] = useState<StageFilter>(initialStage)
    const [audience, setAudience] = useState<AudienceFilter>(initialAudience)
    const [account, setAccount] = useState<AccountFilter>(initialAccount)
    const [source, setSource] = useState(initialSource)
    const [mountedAt] = useState(() => Date.now())
    const deferredSearch = useDeferredValue(search)

    const { data, isPending, isFetching, isError } = useQuery<Payload>({
        queryKey: CONTACTS_KEY,
        queryFn: async ({ signal }) => {
            const res = await fetch(`/api/ops/contacts?limit=${CONTACTS_LIST_LIMIT}`, {
                cache: 'no-store',
                signal,
            })
            if (!res.ok) throw new Error(`API ${res.status}`)
            return (await res.json()) as Payload
        },
        staleTime: 30_000,
        placeholderData: keepPreviousData,
        initialData: initialContacts
            ? { contacts: initialContacts, available: true }
            : undefined,
        initialDataUpdatedAt: initialContacts ? mountedAt : undefined,
    })

    // Le socle ne renvoie `null` que si le RPC est absent ou en erreur. Tant que
    // la réponse client n'a pas confirmé l'indisponibilité, on montre le
    // squelette : afficher « migration manquante » pendant le chargement ferait
    // clignoter un faux diagnostic à chaque visite.
    const available = initialContacts !== null || data?.available !== false
    const rows = useMemo(() => data?.contacts ?? [], [data])

    // Synchro shallow de l'URL — les filtres restent partageables et survivent à
    // un rechargement, sans refetch du payload RSC à chaque frappe.
    useEffect(() => {
        if (typeof window === 'undefined') return
        const next = new URLSearchParams()
        if (deferredSearch.trim()) next.set('q', deferredSearch.trim())
        if (stage !== 'all') next.set('stage', stage)
        if (audience !== 'all') next.set('audience', audience)
        if (account !== 'all') next.set('account', account)
        if (source) next.set('source', source)
        const qs = next.toString()
        const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname
        if (url === `${window.location.pathname}${window.location.search}`) return
        window.history.replaceState(null, '', url)
    }, [deferredSearch, stage, audience, account, source])

    const sourceOptions = useMemo(() => {
        const all = new Set<string>()
        for (const row of rows) for (const s of row.sources) all.add(s)
        return Array.from(all).sort((a, b) => sourceLabel(a).localeCompare(sourceLabel(b), 'fr'))
    }, [rows])

    // Tout sauf le stage : les compteurs d'onglets doivent annoncer exactement ce
    // que la sélection de l'onglet donnera.
    const preStage = useMemo(() => {
        const q = deferredSearch.trim().toLowerCase()
        const qDigits = digitsOnly(q)
        return rows.filter(row => {
            if (audience !== 'all' && row.audience_type !== audience) return false
            if (account === 'yes' && !row.has_account) return false
            if (account === 'no' && row.has_account) return false
            if (source && !row.sources.includes(source)) return false
            if (!q) return true
            if (row.email.toLowerCase().includes(q)) return true
            if ((row.full_name ?? '').toLowerCase().includes(q)) return true
            if (qDigits.length >= 2 && digitsOnly(row.phone ?? '').includes(qDigits)) return true
            return false
        })
    }, [rows, deferredSearch, audience, account, source])

    const stageCounts = useMemo(() => {
        const counts = new Map<LifecycleStage, number>()
        for (const row of preStage) {
            counts.set(row.lifecycle_stage, (counts.get(row.lifecycle_stage) ?? 0) + 1)
        }
        return counts
    }, [preStage])

    const visible = useMemo(
        () => (stage === 'all' ? preStage : preStage.filter(row => row.lifecycle_stage === stage)),
        [preStage, stage]
    )

    const openActions = useMemo(
        () => preStage.reduce((sum, row) => sum + (row.open_actions > 0 ? 1 : 0), 0),
        [preStage]
    )

    const hasFilters =
        search.trim() !== '' || stage !== 'all' || audience !== 'all' || account !== 'all' || source !== ''

    const resetFilters = useCallback(() => {
        setSearch('')
        setStage('all')
        setAudience('all')
        setAccount('all')
        setSource('')
    }, [])

    if (!available) {
        return (
            <section className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
                <h2 className="text-base font-bold text-amber-900">Le CRM n’est pas encore branché</h2>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-amber-800">
                    Les fiches contact s’appuient sur les fonctions <code>admin_contacts_list</code> et{' '}
                    <code>admin_contact_detail</code>, qui n’existent pas encore en base. Applique la
                    migration <code>supabase/migrations/20260902a-contact-socle.sql</code> dans le SQL
                    Editor Supabase : elle crée le pivot, le journal d’événements et rattrape
                    l’historique existant. L’écran se remplira au rechargement suivant.
                </p>
            </section>
        )
    }

    return (
        <div className="space-y-4">
            <section className="rounded-xl border border-slate-200 bg-white p-3 space-y-3">
                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                    <div className="relative flex-1 min-w-0">
                        <Search
                            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                            aria-hidden="true"
                        />
                        <input
                            type="search"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Rechercher un email, un nom, un téléphone…"
                            aria-label="Rechercher un contact"
                            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#243355]/40"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={audience}
                            onChange={e => setAudience(e.target.value as AudienceFilter)}
                            aria-label="Filtrer par type de contact"
                            className={SELECT_CLASS}
                        >
                            {AUDIENCE_OPTIONS.map(o => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                        <select
                            value={account}
                            onChange={e => setAccount(e.target.value as AccountFilter)}
                            aria-label="Filtrer sur la présence d’un compte"
                            className={SELECT_CLASS}
                        >
                            {ACCOUNT_OPTIONS.map(o => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                        <select
                            value={source}
                            onChange={e => setSource(e.target.value)}
                            aria-label="Filtrer par source d’acquisition"
                            className={SELECT_CLASS}
                            disabled={sourceOptions.length === 0}
                        >
                            <option value="">Toutes les sources</option>
                            {sourceOptions.map(s => (
                                <option key={s} value={s}>
                                    {sourceLabel(s)}
                                </option>
                            ))}
                        </select>
                        {isFetching && !isPending && (
                            <Loader2
                                className="h-4 w-4 animate-spin text-slate-400"
                                aria-label="Actualisation en cours"
                            />
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrer par stage">
                    <StageChip
                        label="Tous"
                        count={preStage.length}
                        active={stage === 'all'}
                        onClick={() => setStage('all')}
                    />
                    {LIFECYCLE_STAGES.map(s => (
                        <StageChip
                            key={s}
                            label={STAGE_META[s].label}
                            title={STAGE_META[s].hint}
                            count={stageCounts.get(s) ?? 0}
                            active={stage === s}
                            onClick={() => setStage(s)}
                        />
                    ))}
                </div>
            </section>

            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 px-1 text-xs text-slate-500">
                <span>
                    <strong className="font-semibold tabular-nums text-slate-700">{visible.length}</strong>{' '}
                    contact{visible.length > 1 ? 's' : ''} affiché{visible.length > 1 ? 's' : ''} sur{' '}
                    <span className="tabular-nums">{rows.length}</span>
                </span>
                {openActions > 0 && (
                    <span className="text-amber-700">
                        · <strong className="font-semibold tabular-nums">{openActions}</strong> avec une
                        demande de rappel à traiter
                    </span>
                )}
                {rows.length >= CONTACTS_LIST_LIMIT && (
                    <span>· liste plafonnée aux {CONTACTS_LIST_LIMIT} contacts les plus récemment actifs</span>
                )}
                {hasFilters && (
                    <button
                        type="button"
                        onClick={resetFilters}
                        className="rounded text-slate-600 underline underline-offset-2 hover:text-[#243355] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#243355]/40"
                    >
                        Réinitialiser les filtres
                    </button>
                )}
            </p>

            {isPending && (
                <div className="space-y-2" aria-hidden="true">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-14 animate-pulse rounded-lg border border-slate-200 bg-white" />
                    ))}
                </div>
            )}

            {!isPending && isError && (
                <div className="rounded-xl border border-red-100 bg-white py-8 text-center text-sm text-red-600">
                    Impossible de charger les contacts. Recharge la page ; si l’erreur persiste, vérifie
                    les journaux de la route <code>/api/ops/contacts</code>.
                </div>
            )}

            {!isPending && !isError && visible.length === 0 && (
                <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
                    {rows.length === 0 ? (
                        <>
                            <p className="text-sm font-semibold text-slate-700">Aucun contact pour l’instant</p>
                            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                                Une fiche naît toute seule à la première capture d’email, demande de rappel,
                                alerte pro ou inscription. Rien à saisir à la main.
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="text-sm font-semibold text-slate-700">
                                Aucun contact ne correspond à ces filtres
                            </p>
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="mt-3 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#243355]/40"
                            >
                                Réinitialiser les filtres
                            </button>
                        </>
                    )}
                </div>
            )}

            {!isPending && visible.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <caption className="sr-only">
                                Contacts du CRM, du plus récemment actif au plus ancien
                            </caption>
                            <thead className="border-b border-slate-200 bg-slate-50">
                                <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                                    <th scope="col" className="px-4 py-2.5">Contact</th>
                                    <th scope="col" className="px-4 py-2.5">Téléphone</th>
                                    <th scope="col" className="px-4 py-2.5">Type</th>
                                    <th scope="col" className="px-4 py-2.5">Stage</th>
                                    <th scope="col" className="px-4 py-2.5">Dernière activité</th>
                                    <th scope="col" className="px-4 py-2.5">Source</th>
                                    <th scope="col" className="px-4 py-2.5 text-right">À traiter</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {visible.map(row => (
                                    <ContactRow key={row.id} row={row} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}

function StageChip({
    label,
    count,
    active,
    title,
    onClick,
}: {
    label: string
    count: number
    active: boolean
    title?: string
    onClick: () => void
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            aria-pressed={active}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#243355]/40 ${
                active
                    ? 'bg-[#243355] text-white'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
        >
            {label}
            <span
                className={`tabular-nums ${active ? 'text-white/70' : 'text-slate-400'}`}
            >
                {count}
            </span>
        </button>
    )
}

function ContactRow({ row }: { row: ContactListRow }) {
    const name = row.full_name ?? 'Sans nom'
    const extraSources = row.sources.length - 2

    return (
        // `relative` + lien étiré : toute la ligne est cliquable, mais il n'existe
        // qu'UNE cible focusable, correctement annoncée au clavier.
        <tr className="relative transition-colors hover:bg-slate-50 has-[a:focus-visible]:bg-slate-50">
            <td className="px-4 py-2.5">
                {/* Largeur bornée : sans elle, un email long étire la colonne et
                    pousse le stage hors de l'écran sur un portable. */}
                <div className="max-w-[260px]">
                    <Link
                        href={`/admin/contacts/${row.id}`}
                        className="block truncate rounded-sm font-medium text-slate-900 before:absolute before:inset-0 before:content-[''] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#243355]"
                    >
                        {name}
                    </Link>
                    <div className="mt-0.5 flex items-center gap-1.5">
                        <span className="truncate text-xs text-slate-500">{row.email}</span>
                        {!row.marketing_opt_in && (
                            <span className="shrink-0 rounded border border-slate-200 px-1 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                                Opt-out
                            </span>
                        )}
                    </div>
                </div>
            </td>
            <td className="whitespace-nowrap px-4 py-2.5 text-slate-600 tabular-nums">
                {row.phone ?? <span className="text-slate-300">—</span>}
            </td>
            <td className="px-4 py-2.5">
                <div className="text-slate-700">{AUDIENCE_META[row.audience_type].short}</div>
                <div className="text-[11px] text-slate-400">
                    {row.has_account ? 'compte' : 'sans compte'}
                </div>
            </td>
            <td className="px-4 py-2.5">
                <StageBadge stage={row.lifecycle_stage} size="sm" />
            </td>
            <td className="whitespace-nowrap px-4 py-2.5 text-slate-600">
                <time
                    dateTime={row.last_activity_at ?? undefined}
                    title={formatAbsolute(row.last_activity_at)}
                    suppressHydrationWarning
                >
                    {formatRelative(row.last_activity_at)}
                </time>
            </td>
            <td className="px-4 py-2.5">
                <div className="flex flex-wrap items-center gap-1">
                    {row.sources.length === 0 && <span className="text-slate-300">—</span>}
                    {row.sources.slice(0, 2).map(s => (
                        <span
                            key={s}
                            className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600"
                        >
                            {sourceLabel(s)}
                        </span>
                    ))}
                    {extraSources > 0 && (
                        <span
                            className="text-[11px] text-slate-400 tabular-nums"
                            title={row.sources.map(sourceLabel).join(' · ')}
                        >
                            +{extraSources}
                        </span>
                    )}
                </div>
            </td>
            <td className="px-4 py-2.5 text-right">
                {row.open_actions > 0 ? (
                    <span
                        className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 tabular-nums"
                        aria-label={`${row.open_actions} demande${row.open_actions > 1 ? 's' : ''} de rappel à traiter`}
                    >
                        {row.open_actions}
                        <span aria-hidden="true">à traiter</span>
                    </span>
                ) : (
                    <span className="text-slate-300">—</span>
                )}
            </td>
        </tr>
    )
}
