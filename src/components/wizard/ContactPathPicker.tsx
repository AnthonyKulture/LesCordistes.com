'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FileText,
    MessageSquare,
    PhoneCall,
    ArrowRight,
    CheckCircle2,
    Clock,
    Mail,
    Phone,
    Send,
} from 'lucide-react'
import { CATEGORY_LABELS } from '@/constants/categories'

type CardId = 'wizard' | 'message' | 'callback'

interface Props {
    /**
     * Appelé quand l'utilisateur choisit le wizard. Le parent peut alors
     * scroller / focus sur le wizard ou ne rien faire (le wizard est déjà visible).
     */
    onWizardSelected?: () => void
}

const CATEGORIES = Object.entries(CATEGORY_LABELS) as Array<[string, string]>

export function ContactPathPicker({ onWizardSelected }: Props) {
    const [active, setActive] = useState<CardId | null>(null)

    return (
        <div className="mb-10">
            <p className="text-center text-sm font-semibold text-slate-700 mb-4">
                Comment souhaitez-vous démarrer ?
            </p>

            {/* 3 cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card
                    id="wizard"
                    active={active === 'wizard'}
                    onClick={() => {
                        setActive('wizard')
                        onWizardSelected?.()
                        // Smooth scroll jusqu'au wizard juste en dessous
                        setTimeout(() => {
                            document
                                .getElementById('wizard-anchor')
                                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }, 80)
                    }}
                    icon={<FileText size={22} />}
                    title="Décrire mon projet"
                    subtitle="Wizard 3 minutes"
                    bullets={['Recevez 3 devis sous 48h', 'Cordistes certifiés CQP/IRATA']}
                    accent="blue"
                />

                <Card
                    id="message"
                    active={active === 'message'}
                    onClick={() => setActive(active === 'message' ? null : 'message')}
                    icon={<MessageSquare size={22} />}
                    title="Message rapide"
                    subtitle="2 minutes"
                    bullets={['Décrivez en quelques mots', 'Anthony répond sous 2h']}
                    accent="emerald"
                />

                <Card
                    id="callback"
                    active={active === 'callback'}
                    onClick={() => setActive(active === 'callback' ? null : 'callback')}
                    icon={<PhoneCall size={22} />}
                    title="Être recontacté"
                    subtitle="Moins d'1 minute"
                    bullets={['On vous rappelle sous 1h ouvrée', 'Email ou téléphone, au choix']}
                    accent="amber"
                />
            </div>

            {/* Inline forms */}
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

            {/* Séparateur OU */}
            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                    <span className="bg-slate-50 px-3 text-slate-400 font-medium uppercase tracking-wider">
                        ou continuez avec le formulaire complet
                    </span>
                </div>
            </div>
            <div id="wizard-anchor" className="scroll-mt-24" />
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────

interface CardProps {
    id: CardId
    active: boolean
    onClick: () => void
    icon: React.ReactNode
    title: string
    subtitle: string
    bullets: string[]
    accent: 'blue' | 'emerald' | 'amber'
}

const ACCENT = {
    blue: {
        bgActive: 'bg-brand-blue text-white',
        bgIdle: 'bg-white hover:bg-slate-50 border-slate-200 hover:border-brand-blue',
        iconBg: 'bg-brand-blue/10 text-brand-blue group-hover:bg-brand-blue group-hover:text-white',
    },
    emerald: {
        bgActive: 'bg-emerald-600 text-white',
        bgIdle: 'bg-white hover:bg-emerald-50 border-slate-200 hover:border-emerald-500',
        iconBg: 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white',
    },
    amber: {
        bgActive: 'bg-amber-500 text-white',
        bgIdle: 'bg-white hover:bg-amber-50 border-slate-200 hover:border-amber-500',
        iconBg: 'bg-amber-100 text-amber-700 group-hover:bg-amber-500 group-hover:text-white',
    },
} as const

function Card({ active, onClick, icon, title, subtitle, bullets, accent }: CardProps) {
    const a = ACCENT[accent]
    return (
        <button
            type="button"
            onClick={onClick}
            className={`group relative text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                active ? `${a.bgActive} border-transparent shadow-lg scale-[1.02]` : a.bgIdle
            }`}
        >
            <div className="flex items-start gap-3">
                <div
                    className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        active ? 'bg-white/20 text-white' : a.iconBg
                    }`}
                >
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <h3 className={`font-bold text-base leading-tight ${active ? 'text-white' : 'text-slate-900'}`}>
                            {title}
                        </h3>
                    </div>
                    <p className={`text-xs font-medium mb-2 ${active ? 'text-white/80' : 'text-slate-500'}`}>
                        <Clock size={11} className="inline mr-1 -mt-0.5" />
                        {subtitle}
                    </p>
                    <ul className="space-y-1">
                        {bullets.map((b, i) => (
                            <li
                                key={i}
                                className={`flex items-start gap-1.5 text-xs leading-snug ${
                                    active ? 'text-white/90' : 'text-slate-600'
                                }`}
                            >
                                <CheckCircle2
                                    size={12}
                                    className={`shrink-0 mt-0.5 ${active ? 'text-white' : 'text-emerald-500'}`}
                                />
                                {b}
                            </li>
                        ))}
                    </ul>
                </div>
                <ArrowRight
                    size={18}
                    className={`shrink-0 transition-transform ${
                        active ? 'translate-x-1 text-white' : 'text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1'
                    }`}
                />
            </div>
        </button>
    )
}

// ─── Quick Message ────────────────────────────────────────────────────────────

function QuickMessageForm({ onClose }: { onClose: () => void }) {
    const [firstName, setFirstName] = useState('')
    const [email, setEmail] = useState('')
    const [city, setCity] = useState('')
    const [category, setCategory] = useState('')
    const [message, setMessage] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [done, setDone] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const valid =
        firstName.trim().length >= 2 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
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
                    email: email.trim().toLowerCase(),
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
                title="Message envoyé ✓"
                body={`Merci ${firstName.split(' ')[0]} ! Anthony va revenir vers vous par email d'ici 2 heures (pendant les heures ouvrées).`}
                onClose={onClose}
            />
        )
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-4 bg-white rounded-2xl border-2 border-emerald-200 p-5 md:p-6 shadow-sm"
        >
            <div className="flex items-center gap-2 mb-4">
                <MessageSquare size={18} className="text-emerald-600" />
                <h4 className="font-bold text-slate-900">Décrivez votre projet en quelques mots</h4>
            </div>

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

            <Field label="Votre message *">
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={4}
                    placeholder="Ex. : Façade R+4 à nettoyer en centre-ville, idéalement avant fin mai. Hauteur ~12 m."
                    className={inputCls}
                    maxLength={1000}
                />
                <div className="text-right text-xs text-slate-400 mt-1">{message.length}/1000</div>
            </Field>

            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

            <div className="flex gap-2 mt-4">
                <button type="button" onClick={onClose} className={btnGhost}>
                    Annuler
                </button>
                <button
                    type="submit"
                    disabled={!valid || submitting}
                    className={`${btnPrimary} bg-emerald-600 hover:bg-emerald-700 flex-1`}
                >
                    {submitting ? 'Envoi…' : (
                        <>
                            <Send size={16} />
                            Envoyer mon message
                        </>
                    )}
                </button>
            </div>
        </form>
    )
}

// ─── Callback Request ─────────────────────────────────────────────────────────

function CallbackForm({ onClose }: { onClose: () => void }) {
    const [firstName, setFirstName] = useState('')
    const [channel, setChannel] = useState<'phone' | 'email'>('phone')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [city, setCity] = useState('')
    const [slot, setSlot] = useState<'morning' | 'afternoon' | 'evening' | ''>('')
    const [message, setMessage] = useState('')
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
                    city: city.trim() || null,
                    message: message.trim() || null,
                    preferred_channel: channel,
                    preferred_time_slot: slot || null,
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
                title="Demande reçue ✓"
                body={`Merci ${firstName.split(' ')[0]} ! Anthony va vous contacter ${
                    channel === 'phone' ? 'par téléphone' : 'par email'
                } sous 1 heure ouvrée.`}
                onClose={onClose}
            />
        )
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-4 bg-white rounded-2xl border-2 border-amber-200 p-5 md:p-6 shadow-sm"
        >
            <div className="flex items-center gap-2 mb-4">
                <PhoneCall size={18} className="text-amber-600" />
                <h4 className="font-bold text-slate-900">Comment vous joindre ?</h4>
            </div>

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

            {/* Toggle channel */}
            <div className="mt-4 mb-1 text-xs font-semibold text-slate-700">Je préfère qu'on me joigne par *</div>
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
            ) : (
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
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <Field label="Ville (optionnel)">
                    <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Lyon, Paris…"
                        className={inputCls}
                    />
                </Field>
                <Field label="Créneau préféré (optionnel)">
                    <select value={slot} onChange={(e) => setSlot(e.target.value as typeof slot)} className={inputCls}>
                        <option value="">Pas de préférence</option>
                        <option value="morning">Matin (9h-12h)</option>
                        <option value="afternoon">Après-midi (14h-18h)</option>
                        <option value="evening">Fin de journée (18h-20h)</option>
                    </select>
                </Field>
            </div>

            <Field label="Quelques mots sur votre besoin (optionnel)">
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={2}
                    placeholder="Ex. : Renseignements sur tarifs cordiste pour façade haussmannienne."
                    className={inputCls}
                    maxLength={500}
                />
            </Field>

            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

            <div className="flex gap-2 mt-4">
                <button type="button" onClick={onClose} className={btnGhost}>
                    Annuler
                </button>
                <button
                    type="submit"
                    disabled={!valid || submitting}
                    className={`${btnPrimary} bg-amber-500 hover:bg-amber-600 flex-1`}
                >
                    {submitting ? 'Envoi…' : (
                        <>
                            <PhoneCall size={16} />
                            Demander à être recontacté
                        </>
                    )}
                </button>
            </div>
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
        <div className="mt-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 text-center">
            <CheckCircle2 size={40} className="mx-auto text-emerald-600 mb-3" />
            <h4 className="font-bold text-lg text-emerald-900 mb-1">{title}</h4>
            <p className="text-sm text-emerald-800 mb-4 max-w-md mx-auto">{body}</p>
            <button type="button" onClick={onClose} className={btnGhost}>
                Fermer
            </button>
        </div>
    )
}

const inputCls =
    'w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all'
const btnPrimary =
    'inline-flex items-center justify-center gap-2 px-4 py-2.5 text-white font-bold rounded-lg disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors'
const btnGhost =
    'inline-flex items-center justify-center gap-2 px-4 py-2.5 text-slate-700 font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors'
