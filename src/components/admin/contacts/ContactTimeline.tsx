import type { ContactEvent } from '@/lib/types/crm'
import {
    capitalize,
    eventMeta,
    formatAbsolute,
    formatRelative,
    monthKey,
} from './crmLabels'

type Props = { events: ContactEvent[] }

/**
 * Journal anté-chronologique de la fiche, groupé par mois.
 *
 * Événements manuels et système ne sont pas distingués par la seule couleur :
 * un manuel est encadré, sa pastille est pleine, et son auteur est écrit en
 * toutes lettres — un système affiche « Système ». La distinction tient donc
 * en niveaux de gris comme en lecture d'écran.
 *
 * Composant serveur : la timeline n'a aucune interactivité, elle n'a pas à
 * peser sur le bundle client.
 */
export function ContactTimeline({ events }: Props) {
    if (events.length === 0) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
                <p className="text-sm font-semibold text-slate-700">Le journal est vide</p>
                <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                    Chaque capture, publication ou achat s’inscrira ici tout seul. Un appel ou une
                    note laissée depuis cette fiche aussi.
                </p>
            </div>
        )
    }

    // Les événements arrivent déjà triés du plus récent au plus ancien par
    // admin_contact_detail : on se contente de découper à chaque changement de
    // mois, sans retrier (un tri local diverge du tri SQL sur les ex æquo).
    const groups: { month: string; items: ContactEvent[] }[] = []
    for (const event of events) {
        const month = monthKey(event.occurred_at)
        const last = groups[groups.length - 1]
        if (last && last.month === month) last.items.push(event)
        else groups.push({ month, items: [event] })
    }

    return (
        <div className="space-y-6">
            {groups.map(group => (
                <section key={group.month}>
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {capitalize(group.month)}
                        <span className="ml-2 font-normal normal-case tracking-normal text-slate-400 tabular-nums">
                            {group.items.length} événement{group.items.length > 1 ? 's' : ''}
                        </span>
                    </h3>
                    <ol className="space-y-2">
                        {group.items.map(event => (
                            <TimelineItem key={event.id} event={event} />
                        ))}
                    </ol>
                </section>
            ))}
        </div>
    )
}

function TimelineItem({ event }: { event: ContactEvent }) {
    const meta = eventMeta(event.kind)
    const Icon = meta.icon
    const manual = meta.manual

    return (
        <li className="flex gap-3">
            <span
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    manual
                        ? 'bg-[#243355] text-white'
                        : 'bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200'
                }`}
                aria-hidden="true"
            >
                <Icon className="h-3.5 w-3.5" />
            </span>

            <div
                className={`min-w-0 flex-1 ${
                    manual ? 'rounded-lg border border-slate-200 bg-white px-3 py-2' : 'py-1'
                }`}
            >
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-sm font-medium text-slate-900">{event.title}</span>
                    <span className="text-[11px] uppercase tracking-wide text-slate-400">
                        {meta.label}
                    </span>
                </div>

                {event.detail && (
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                        {event.detail}
                    </p>
                )}

                <p className="mt-1 text-xs text-slate-400">
                    <time dateTime={event.occurred_at} title={formatAbsolute(event.occurred_at)}>
                        {formatRelative(event.occurred_at)}
                    </time>
                    <span aria-hidden="true"> · </span>
                    <span className="sr-only">Auteur : </span>
                    {event.actor ?? 'Système'}
                </p>
            </div>
        </li>
    )
}
