'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, ArrowRight, Phone } from 'lucide-react'
import { SEO_PHONE, getCityRegionLabel } from '@/constants/seoConfig'

interface Props {
    cityName: string
    citySlug: string
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

export function CityLeadHero({ cityName, citySlug }: Props) {
    const router = useRouter()
    const [category, setCategory] = useState('')
    const [email, setEmail] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const isValid = category && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    const regionLabel = getCityRegionLabel(citySlug, cityName)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!isValid || submitting) return
        setSubmitting(true)

        // Lead capture (best effort, ne bloque pas la redirection)
        fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                category,
                step_reached: 1,
                source: `city_hero_${citySlug}`,
            }),
        }).catch(() => {})

        const params = new URLSearchParams({
            type: 'standard',
            prefill_city: cityName,
            prefill_email: email,
            prefill_category: category,
        })
        router.push(`/post-job?${params.toString()}`)
    }

    return (
        <section className="bg-gradient-to-b from-slate-50 to-white pt-20 pb-12 md:pt-24 md:pb-16 border-b border-slate-100">
            <div className="container max-w-5xl px-4">
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-medium mb-5">
                            <ShieldCheck size={14} />
                            Cordistes certifiés CQP/IRATA {regionLabel}
                        </div>

                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
                            Cordiste à {cityName} —{' '}
                            <span className="text-brand-blue-light">
                                Trouvez un pro certifié en 2 min
                            </span>
                        </h1>

                        <p className="text-base md:text-lg text-slate-600 leading-relaxed mb-6 max-w-lg">
                            Devis gratuits sous 48h · Cordistes CQP/IRATA vérifiés
                        </p>

                        <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600 mb-2">
                            <li className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Validation manuelle
                            </li>
                            <li className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                RC Pro vérifiée
                            </li>
                            <li className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                100% gratuit
                            </li>
                        </ul>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="bg-white rounded-2xl shadow-xl border border-slate-200 p-5 md:p-6"
                        aria-label={`Demander un devis cordiste à ${cityName}`}
                    >
                        <p className="text-sm font-bold text-slate-900 mb-1">
                            Recevez vos devis gratuits
                        </p>
                        <p className="text-xs text-slate-500 mb-4">
                            Sous 48h · sans engagement
                        </p>

                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Type de travaux
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                            className="w-full px-3 py-2.5 mb-3 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                        >
                            <option value="">— Sélectionnez —</option>
                            {CATEGORIES.map((c) => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>

                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Votre email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="votre@email.fr"
                            className="w-full px-3 py-2.5 mb-4 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                        />

                        <button
                            type="submit"
                            disabled={!isValid || submitting}
                            className="w-full h-11 inline-flex items-center justify-center gap-2 bg-brand-blue hover:bg-brand-blue-light disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-colors"
                        >
                            Recevoir mes devis gratuits
                            <ArrowRight size={16} />
                        </button>

                        <a
                            href={`tel:${SEO_PHONE}`}
                            className="md:hidden mt-3 w-full h-10 inline-flex items-center justify-center gap-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            <Phone size={14} />
                            {SEO_PHONE}
                        </a>

                        <p className="text-[11px] text-slate-400 text-center mt-3">
                            En continuant vous acceptez nos CGU. Aucun spam.
                        </p>
                    </form>
                </div>
            </div>
        </section>
    )
}
