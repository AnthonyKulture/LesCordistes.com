/**
 * Vocabulaire d'affichage du CRM contact — libellés, tons, icônes, dates.
 *
 * Module PUR (aucun import serveur) : il est consommé à la fois par la fiche
 * (Server Component) et par la liste ('use client'). Toute logique de rendu
 * partagée passe par ici, jamais par une duplication de labels.
 *
 * ⚠️ Fuseau figé à Europe/Paris dans TOUTES les dates absolues. Le serveur
 * Vercel tourne en UTC, le navigateur de l'opérateur en Europe/Paris : sans ce
 * `timeZone`, le même horodatage rendu au SSR puis réhydraté produit deux
 * chaînes différentes (décalage d'une à deux heures) et React signale une
 * divergence d'hydratation.
 */

import {
    AlertTriangle,
    Bell,
    BellOff,
    Briefcase,
    CalendarCheck,
    CircleDot,
    ClipboardCheck,
    CreditCard,
    Flag,
    Inbox,
    ListChecks,
    Phone,
    PhoneIncoming,
    Send,
    ShieldCheck,
    StickyNote,
    Unlock,
    UserPlus,
} from 'lucide-react'
import type { ContactAudience, LifecycleStage } from '@/lib/types/crm'

type IconComponent = typeof Inbox

// ── Stages ──────────────────────────────────────────────────────────────────
// Règles reprises de recompute_contact_lifecycle() (migration 20260902a) : les
// hints décrivent le calcul réel, pas une intention. Le libellé est TOUJOURS
// écrit à côté de la pastille — aucune information n'est portée par la couleur
// seule. `dormant` se distingue en plus par un liseré discontinu, pour rester
// lisible en niveaux de gris.

export const STAGE_META: Record<
    LifecycleStage,
    { label: string; hint: string; badge: string; dot: string }
> = {
    nouveau: {
        label: 'Nouveau',
        hint: 'Capturé, sans interaction marquante',
        badge: 'bg-slate-100 text-slate-700 border-slate-300',
        dot: 'bg-slate-400',
    },
    engage: {
        label: 'Engagé',
        hint: 'Wizard à l’étape 3+, demande de rappel ou alerte',
        badge: 'bg-amber-50 text-amber-800 border-amber-300',
        dot: 'bg-amber-500',
    },
    converti: {
        label: 'Converti',
        hint: 'A publié une mission ou créé un compte',
        badge: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        dot: 'bg-emerald-500',
    },
    actif: {
        label: 'Actif',
        hint: 'Déblocage ou achat de crédits dans les 90 jours',
        badge: 'bg-blue-50 text-blue-800 border-blue-300',
        dot: 'bg-blue-500',
    },
    dormant: {
        label: 'Dormant',
        hint: 'Plus aucune activité depuis 90 jours',
        badge: 'bg-white text-slate-500 border-slate-300 border-dashed',
        dot: 'bg-slate-300',
    },
    desinscrit: {
        label: 'Désinscrit',
        hint: 'S’est désinscrit — ne plus démarcher',
        badge: 'bg-rose-50 text-rose-800 border-rose-300',
        dot: 'bg-rose-500',
    },
}

export const AUDIENCE_META: Record<ContactAudience, { label: string; short: string }> = {
    client: { label: 'Client', short: 'Client' },
    pro: { label: 'Professionnel', short: 'Pro' },
    unknown: { label: 'Non qualifié', short: '—' },
}

// ── Événements ──────────────────────────────────────────────────────────────
// `kind` est un TEXT sans CHECK côté base : un kind inconnu doit se dégrader
// proprement (icône neutre + libellé brut) plutôt que casser la timeline.

type EventMeta = { label: string; icon: IconComponent; manual: boolean }

const EVENT_META: Record<string, EventMeta> = {
    lead_captured: { label: 'Lead capturé', icon: Inbox, manual: false },
    wizard_progress: { label: 'Progression wizard', icon: ListChecks, manual: false },
    contact_request: { label: 'Demande de rappel', icon: PhoneIncoming, manual: false },
    signup: { label: 'Compte créé', icon: UserPlus, manual: false },
    job_posted: { label: 'Mission publiée', icon: Briefcase, manual: false },
    job_moderated: { label: 'Mission modérée', icon: ShieldCheck, manual: false },
    lead_unlocked: { label: 'Lead débloqué', icon: Unlock, manual: false },
    credits_purchased: { label: 'Crédits achetés', icon: CreditCard, manual: false },
    credits_exhausted: { label: 'Crédits épuisés', icon: AlertTriangle, manual: false },
    outcome_reported: { label: 'Issue déclarée', icon: ClipboardCheck, manual: false },
    alert_subscribed: { label: 'Alerte activée', icon: Bell, manual: false },
    unsubscribed: { label: 'Désinscription', icon: BellOff, manual: false },
    status_change: { label: 'Changement de stage', icon: Flag, manual: true },
    note: { label: 'Note', icon: StickyNote, manual: true },
    call: { label: 'Appel', icon: Phone, manual: true },
    // « Email » et non « Email envoyé » : la fiche trace l'ouverture du client
    // mail, elle ne sait pas si le message est parti. Le titre de l'événement
    // dit ce qui s'est réellement passé.
    email_sent: { label: 'Email', icon: Send, manual: true },
    meeting: { label: 'Rendez-vous', icon: CalendarCheck, manual: true },
}

export function eventMeta(kind: string): EventMeta {
    return EVENT_META[kind] ?? { label: kind || 'Événement', icon: CircleDot, manual: false }
}

// ── Sources ─────────────────────────────────────────────────────────────────
// Même grammaire que l'écran Leads : les producteurs de `source` sont les mêmes
// (wizard, hero de ville, blog, exit-intent).

export function sourceLabel(source: string): string {
    if (!source) return '—'
    if (source.startsWith('city_hero_')) return `Ville · ${source.slice('city_hero_'.length)}`
    if (source.startsWith('blog_')) return `Blog · ${source.slice('blog_'.length)}`
    if (source.startsWith('auto:')) return `Auto · ${source.slice('auto:'.length)}`
    if (source === 'wizard_step1') return 'Wizard · étape 1'
    if (source === 'exit_intent') return 'Exit-intent'
    return source
}

// ── Dates ───────────────────────────────────────────────────────────────────

const TZ = 'Europe/Paris'

const ABSOLUTE = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TZ,
})

const MONTH = new Intl.DateTimeFormat('fr-FR', {
    month: 'long',
    year: 'numeric',
    timeZone: TZ,
})

function parse(iso: string | null | undefined): Date | null {
    if (!iso) return null
    const d = new Date(iso)
    return Number.isNaN(d.getTime()) ? null : d
}

export function formatAbsolute(iso: string | null | undefined): string {
    const d = parse(iso)
    return d ? ABSOLUTE.format(d) : '—'
}

/** Clé de regroupement mensuel — stable quel que soit le fuseau du lecteur. */
export function monthKey(iso: string | null | undefined): string {
    const d = parse(iso)
    if (!d) return 'inconnu'
    return MONTH.format(d)
}

export function capitalize(value: string): string {
    return value.length > 0 ? value[0].toUpperCase() + value.slice(1) : value
}

/**
 * Distance au présent, granularité décroissante. Sert de libellé principal :
 * l'horodatage exact reste accessible en `title` et pour les lecteurs d'écran.
 */
export function formatRelative(iso: string | null | undefined): string {
    const d = parse(iso)
    if (!d) return 'jamais'

    const diff = Date.now() - d.getTime()
    if (diff < 0) return 'à l’instant'

    const minutes = Math.floor(diff / 60_000)
    if (minutes < 1) return 'à l’instant'
    if (minutes < 60) return `il y a ${minutes} min`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `il y a ${hours} h`

    const days = Math.floor(hours / 24)
    if (days === 1) return 'hier'
    if (days < 31) return `il y a ${days} j`

    const months = Math.floor(days / 30.44)
    if (months < 12) return `il y a ${months} mois`

    const years = Math.floor(days / 365.25)
    return `il y a ${years} an${years > 1 ? 's' : ''}`
}

/** Montant en centimes → euros, sans décimale (les packs sont ronds). */
export function formatEuros(cents: number): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
    }).format(Math.round(cents) / 100)
}
