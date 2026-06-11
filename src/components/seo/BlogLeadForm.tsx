'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, ArrowRight, Phone } from 'lucide-react'
import { SEO_PHONE, SEO_PHONE_DISPLAY } from '@/constants/seoConfig'

interface Props {
    title?: string
    subtitle?: string
    defaultCategory?: string
    source: string
    ctaLabel?: string
}

const CATEGORIES = [
    { value: 'cleaning', label: 'Nettoyage de façade / vitres' },
    { value: 'masonry', label: 'Maçonnerie / Ravalement' },
    { value: 'painting', label: 'Peinture en hauteur' },
    { value: 'construction', label: 'Construction / Travaux' },
    { value: 'securing', label: 'Sécurisation / Filets / Garde-corps' },
    { value: 'industry', label: 'Maintenance industrielle' },
    { value: 'telecom', label: 'Antennes / Pylônes / Fibre' },
    { value: 'event', label: 'Événementiel / Installation' },
    { value: 'inspection', label: 'Inspection / Audit' },
    { value: 'repair', label: 'Dépannage / Urgence' },
    { value: 'pruning', label: 'Élagage / Démoussage' },
    { value: 'other', label: 'Autre' },
] as const

export function BlogLeadForm({
    title = 'Recevez vos devis gratuits',
    subtitle = 'Sous 48h · sans engagement',
    defaultCategory = '',
    source,
    ctaLabel = 'Recevoir mes devis gratuits',
}: Props) {
    const router = useRouter()
    const [category, setCategory] = useState(defaultCategory)
    const [city, setCity] = useState('')
    const [email, setEmail] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const isValid =
        category &&
        city.trim().length >= 2 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!isValid || submitting) return
        setSubmitting(true)

        fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                category,
                step_reached: 1,
                source,
            }),
        }).catch(() => {})

        const params = new URLSearchParams({
            type: 'standard',
            prefill_city: city.trim(),
            prefill_email: email,
            prefill_category: category,
        })
        router.push(`/post-job?${params.toString()}`)
    }

    return (
        <div className="my-10 rounded-2xl bg-white shadow-xl border border-slate-200 p-6 md:p-7 scroll-mt-28">
            <div className="grid md:grid-cols-2 gap-6 items-start">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-medium mb-4">
                        <ShieldCheck size={14} />
                        Cordistes certifiés CQP / IRATA
                    </div>
                    <p className="text-xl md:text-2xl font-extrabold text-slate-900 leading-tight mb-3">
                        {title}
                    </p>
                    <p className="text-sm text-slate-600 mb-4">{subtitle}</p>
                    <ul className="space-y-2 text-sm text-slate-600">
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Validation manuelle de chaque pro
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            RC Pro vérifiée
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Service 100 % gratuit
                        </li>
                    </ul>
                </div>

                <form
                    id="deposer-mission"
                    onSubmit={handleSubmit}
                    className="space-y-3"
                    aria-label="Demander un devis cordiste"
                >
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Type de travaux
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                            className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                        >
                            <option value="">— Sélectionnez —</option>
                            {CATEGORIES.map((c) => (
                                <option key={c.value} value={c.value}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Ville du chantier
                        </label>
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
                            placeholder="Ex. Lyon, Paris…"
                            className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Votre email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="votre@email.fr"
                            className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!isValid || submitting}
                        className="w-full h-11 inline-flex items-center justify-center gap-2 bg-brand-blue hover:bg-brand-blue-light disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-colors"
                    >
                        {ctaLabel}
                        <ArrowRight size={16} />
                    </button>

                    <a
                        href={`tel:${SEO_PHONE}`}
                        className="md:hidden w-full h-10 inline-flex items-center justify-center gap-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        <Phone size={14} />
                        {SEO_PHONE_DISPLAY}
                    </a>

                    <p className="text-[11px] text-slate-400 text-center">
                        En continuant vous acceptez nos CGU. Aucun spam.
                    </p>
                </form>
            </div>
        </div>
    )
}
