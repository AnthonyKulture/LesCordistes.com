'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, MessageSquare, PhoneCall, CheckCircle2, Mail, Phone, Send } from 'lucide-react'
import { CATEGORY_LABELS } from '@/constants/categories'

type CardId = 'wizard' | 'message' | 'callback'

interface Props {
    /**
     * Appelé quand l'utilisateur choisit le wizard. Le parent doit alors
     * afficher le wizard (caché par défaut tant qu'aucun choix n'est fait).
     */
    onWizardSelected: () => void
}

const CATEGORIES = Object.entries(CATEGORY_LABELS) as Array<[string, string]>

export function ContactPathPicker({ onWizardSelected }: Props) {
    const [active, setActive] = useState<'message' | 'callback' | null>(null)
    const formRef = useRef<HTMLDivElement>(null)

    // Sur mobile, scroll léger vers le formulaire qui s'ouvre
    useEffect(() => {
        if (!active) return
        if (typeof window === 'undefined') return
        if (window.innerWidth >= 768) return // desktop : pas besoin (cartes côte à côte)

        // Attendre la fin de l'animation framer-motion (250ms) avant de scroller
        const t = window.setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 280)
        return () => window.clearTimeout(t)
    }, [active])

    return (
        <div className="mb-6 sm:mb-10">
            {/* 3 cartes minimales — empilées compactes sur mobile, colonnes sur desktop */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-4">
                <Card
                    onClick={() => onWizardSelected()}
                    icon={<FileText className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={1.7} />}
                    title="Publier mon projet"
                    duration="5 min"
                    accent="blue"
                />
                <Card
                    onClick={() => setActive(active === 'message' ? null : 'message')}
                    selected={active === 'message'}
                    icon={<MessageSquare className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={1.7} />}
                    title="Message rapide"
                    duration="2 min"
                    accent="emerald"
                />
                <Card
                    onClick={() => setActive(active === 'callback' ? null : 'callback')}
                    selected={active === 'callback'}
                    icon={<PhoneCall className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={1.7} />}
                    title="Être recontacté"
                    duration="< 1 min"
                    accent="amber"
                />
            </div>

            {/* Inline forms (cartes 2 et 3 uniquement) */}
            <div ref={formRef} className="scroll-mt-28">
                <AnimatePresence mode="wait">
                    {active === 'message' && (
                        <motion.div
                            key="message"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                        >
                            <QuickMessageForm onClose={() => setActive(null)} />
                        </motion.div>
                    )}
                    {active === 'callback' && (
                        <motion.div
                            key="callback"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                        >
                            <CallbackForm onClose={() => setActive(null)} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

// ─── Card minimaliste ─────────────────────────────────────────────────────────

const ACCENT = {
    blue: {
        ring: 'hover:border-brand-blue hover:shadow-brand-blue/10',
        iconBg: 'bg-brand-blue/10 text-brand-blue group-hover:bg-brand-blue group-hover:text-white',
        active: 'border-brand-blue bg-brand-blue/5',
        activeIcon: 'bg-brand-blue text-white',
    },
    emerald: {
        ring: 'hover:border-emerald-500 hover:shadow-emerald-500/10',
        iconBg: 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white',
        active: 'border-emerald-500 bg-emerald-50',
        activeIcon: 'bg-emerald-600 text-white',
    },
    amber: {
        ring: 'hover:border-amber-500 hover:shadow-amber-500/10',
        iconBg: 'bg-amber-100 text-amber-700 group-hover:bg-amber-500 group-hover:text-white',
        active: 'border-amber-500 bg-amber-50',
        activeIcon: 'bg-amber-500 text-white',
    },
} as const

function Card({
    onClick,
    selected,
    icon,
    title,
    duration,
    accent,
}: {
    onClick: () => void
    selected?: boolean
    icon: React.ReactNode
    title: string
    duration: string
    accent: 'blue' | 'emerald' | 'amber'
}) {
    const a = ACCENT[accent]
    return (
        <button
            type="button"
            onClick={onClick}
            className={`group relative bg-white rounded-2xl border-2 transition-all duration-200 flex md:block items-center gap-3 px-4 py-3 sm:px-6 sm:py-7 text-left md:text-center hover:-translate-y-0.5 hover:shadow-lg ${
                selected ? a.active : `border-slate-200 ${a.ring}`
            }`}
        >
            <div
                className={`md:mx-auto md:mb-3 shrink-0 w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-colors ${
                    selected ? a.activeIcon : a.iconBg
                }`}
            >
                {icon}
            </div>
            <div className="flex-1 min-w-0 md:flex-none">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">{title}</h3>
                <p className="text-xs text-slate-500 mt-0.5 sm:mt-1">{duration}</p>
            </div>
        </button>
    )
}

// ─── Quick Message ────────────────────────────────────────────────────────────

function QuickMessageForm({ onClose }: { onClose: () => void }) {
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [city, setCity] = useState('')
    const [category, setCategory] = useState('')
    const [message, setMessage] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [done, setDone] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const valid =
        firstName.trim().length >= 2 &&
        lastName.trim().length >= 2 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
        /^[+]?[\d\s().-]{6,20}$/.test(phone) &&
        message.trim().length >= 5

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!valid || submitting) return
        setSubmitting(true)
        setError(null)

        try {
            const res = await fetch('/api/contact-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    request_type: 'quick_message',
                    first_name: firstName.trim(),
                    last_name: lastName.trim(),
                    email: email.trim().toLowerCase(),
                    phone: phone.trim(),
                    city: city.trim() || null,
                    category: category || null,
                    message: message.trim(),
                    source: 'post_job_picker',
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Erreur')
            setDone(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur réseau')
        } finally {
            setSubmitting(false)
        }
    }

    if (done) {
        return (
            <SuccessPanel
                title="Message envoyé"
                body={`Merci ${firstName.split(' ')[0]} ! Anthony revient vers vous par email d'ici 2 heures (heures ouvrées).`}
                onClose={onClose}
            />
        )
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-5 bg-white rounded-2xl border-2 border-emerald-200 p-6 md:p-7 shadow-sm"
        >
            <h4 className="font-bold text-slate-900 text-lg mb-1">Décrivez votre projet</h4>
            <p className="text-sm text-slate-500 mb-5">Quelques mots suffisent.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <Field label="Prénom *">
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        placeholder="Anthony"
                        className={inputCls}
                    />
                </Field>
                <Field label="Nom *">
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        placeholder="Dupont"
                        className={inputCls}
                    />
                </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <Field label="Email *">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="vous@email.fr"
                        className={inputCls}
                    />
                </Field>
                <Field label="Téléphone *">
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        placeholder="06 12 34 56 78"
                        className={inputCls}
                    />
                </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <Field label="Ville (optionnel)">
                    <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Lyon, Paris…"
                        className={inputCls}
                    />
                </Field>
                <Field label="Type de travaux (optionnel)">
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
                        <option value="">— Sélectionner —</option>
                        {CATEGORIES.map(([v, label]) => (
                            <option key={v} value={v}>
                                {label}
                            </option>
                        ))}
                    </select>
                </Field>
            </div>

            <Field label="Votre message">
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={4}
                    placeholder="Ex. : Façade R+4 à nettoyer en centre-ville, idéalement avant fin mai. Hauteur ~12 m."
                    className={inputCls}
                    maxLength={1000}
                />
            </Field>

            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

            <button
                type="submit"
                disabled={!valid || submitting}
                className={`${btnPrimary} bg-emerald-600 hover:bg-emerald-700 w-full mt-5`}
            >
                {submitting ? 'Envoi…' : (
                    <>
                        <Send size={16} />
                        Envoyer mon message
                    </>
                )}
            </button>
        </form>
    )
}

// ─── Callback ─────────────────────────────────────────────────────────────────

function CallbackForm({ onClose }: { onClose: () => void }) {
    const [firstName, setFirstName] = useState('')
    const [channel, setChannel] = useState<'phone' | 'email'>('phone')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [slot, setSlot] = useState<'morning' | 'afternoon' | 'evening' | ''>('')
    const [submitting, setSubmitting] = useState(false)
    const [done, setDone] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const phoneValid = /^[+]?[\d\s().-]{6,20}$/.test(phone)
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    const valid =
        firstName.trim().length >= 2 && (channel === 'phone' ? phoneValid : emailValid)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!valid || submitting) return
        setSubmitting(true)
        setError(null)

        try {
            const res = await fetch('/api/contact-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    request_type: 'callback',
                    first_name: firstName.trim(),
                    email: channel === 'email' ? email.trim().toLowerCase() : null,
                    phone: channel === 'phone' ? phone.trim() : null,
                    preferred_channel: channel,
                    preferred_time_slot: channel === 'phone' && slot ? slot : null,
                    source: 'post_job_picker',
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Erreur')
            setDone(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur réseau')
        } finally {
            setSubmitting(false)
        }
    }

    if (done) {
        const firstWord = firstName.split(' ')[0]
        let body: string
        if (channel === 'email') {
            body = `Merci ${firstWord} ! On vous écrit par email dès que possible.`
        } else if (slot === 'morning') {
            body = `Merci ${firstWord} ! On vous appelle dans la matinée.`
        } else if (slot === 'afternoon') {
            body = `Merci ${firstWord} ! On vous appelle dans l'après-midi.`
        } else if (slot === 'evening') {
            body = `Merci ${firstWord} ! On vous appelle en fin de journée.`
        } else {
            body = `Merci ${firstWord} ! On vous rappelle dès que possible.`
        }
        return <SuccessPanel title="Demande reçue" body={body} onClose={onClose} />
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-5 bg-white rounded-2xl border-2 border-amber-200 p-6 md:p-7 shadow-sm"
        >
            <h4 className="font-bold text-slate-900 text-lg mb-1">Comment vous joindre ?</h4>
            <p className="text-sm text-slate-500 mb-5">On vous rappelle dès que possible.</p>

            <Field label="Prénom">
                <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    placeholder="Votre prénom"
                    className={inputCls}
                />
            </Field>

            <div className="mt-4 mb-2 text-xs font-semibold text-slate-700">Je préfère par</div>
            <div className="grid grid-cols-2 gap-2 mb-3">
                <ChannelToggle
                    selected={channel === 'phone'}
                    onClick={() => setChannel('phone')}
                    icon={<Phone size={16} />}
                    label="Téléphone"
                />
                <ChannelToggle
                    selected={channel === 'email'}
                    onClick={() => setChannel('email')}
                    icon={<Mail size={16} />}
                    label="Email"
                />
            </div>

            {channel === 'phone' ? (
                <>
                    <Field label="Téléphone">
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            placeholder="06 12 34 56 78"
                            className={inputCls}
                        />
                    </Field>

                    <div className="mt-3">
                        <Field label="Créneau préféré (optionnel)">
                            <select value={slot} onChange={(e) => setSlot(e.target.value as typeof slot)} className={inputCls}>
                                <option value="">Pas de préférence</option>
                                <option value="morning">Matin</option>
                                <option value="afternoon">Après-midi</option>
                                <option value="evening">Fin de journée</option>
                            </select>
                        </Field>
                    </div>
                </>
            ) : (
                <Field label="Email">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="vous@email.fr"
                        className={inputCls}
                    />
                </Field>
            )}

            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

            <button
                type="submit"
                disabled={!valid || submitting}
                className={`${btnPrimary} bg-amber-500 hover:bg-amber-600 w-full mt-5`}
            >
                {submitting ? 'Envoi…' : (
                    <>
                        <PhoneCall size={16} />
                        Demander à être recontacté
                    </>
                )}
            </button>
        </form>
    )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ChannelToggle({
    selected,
    onClick,
    icon,
    label,
}: {
    selected: boolean
    onClick: () => void
    icon: React.ReactNode
    label: string
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-all text-sm font-semibold ${
                selected
                    ? 'border-amber-500 bg-amber-50 text-amber-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
        >
            {icon}
            {label}
        </button>
    )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="block">
            <span className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</span>
            {children}
        </label>
    )
}

function SuccessPanel({
    title,
    body,
    onClose,
}: {
    title: string
    body: string
    onClose: () => void
}) {
    return (
        <div className="mt-5 bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-7 text-center">
            <CheckCircle2 size={44} className="mx-auto text-emerald-600 mb-3" />
            <h4 className="font-bold text-lg text-emerald-900 mb-1">{title}</h4>
            <p className="text-sm text-emerald-800 mb-5 max-w-md mx-auto leading-relaxed">{body}</p>
            <button type="button" onClick={onClose} className={btnGhost}>
                Fermer
            </button>
        </div>
    )
}

const inputCls =
    'w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all'
const btnPrimary =
    'inline-flex items-center justify-center gap-2 px-4 py-3 text-white font-bold rounded-lg disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors'
const btnGhost =
    'inline-flex items-center justify-center gap-2 px-4 py-2 text-slate-700 font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm'
