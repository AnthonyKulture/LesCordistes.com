'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowRight, ArrowLeft,
    Check,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { createSupabaseBrowserClient } from '../lib/supabase-browser'
import { FRENCH_DEPARTMENTS } from '../constants/departments'

const CERTIFICATIONS_LIST = [
    'CQP Cordiste N1', 'CQP Cordiste N2',
    'IRATA Level 1', 'IRATA Level 2', 'IRATA Level 3',
    'SPRAT Level 1', 'SPRAT Level 2', 'SPRAT Level 3',
    'Travaux en hauteur', 'Habilitation électrique B0', 'CACES Nacelle',
    'Premiers secours (SST)', 'Chef de chantier',
]

const SKILLS_LIST = [
    'Nettoyage facade', 'Inspection visuelle', 'Peinture en hauteur', 'Etancheite',
    'Ravalement', 'Soudure', 'Cablage', 'Maintenance industrielle',
    'Desamiantage', 'Photographie aerienne', 'Installation panneaux solaires',
    'Elagage', 'Travaux forestiers', 'Evenementiel', 'Cinema / Audiovisuel',
]

const STEPS = [
    {
        id: 'identity',
        icon: '👤',
        title: "Comment t'appelles-tu ?",
        subtitle: 'Ton nom et ton telephone sont visibles par les clients qui te contactent.',
        required: true,
    },
    {
        id: 'zones',
        icon: '📍',
        title: 'Ou travailles-tu ?',
        subtitle: 'Selectionne les departements ou tu es disponible. Tu pourras les modifier a tout moment.',
        required: true,
    },
    {
        id: 'certifications',
        icon: '🏆',
        title: 'Quelles certifications as-tu ?',
        subtitle: 'Les clients filtrent par certifications. Selectionne tout ce que tu possedes.',
        required: false,
    },
    {
        id: 'skills',
        icon: '⚡',
        title: 'Quelles sont tes specialites ?',
        subtitle: 'Ca aide les clients a trouver le bon profil parmi les cordistes.',
        required: false,
    },
    {
        id: 'bio',
        icon: '✍️',
        title: 'Presente-toi en quelques mots',
        subtitle: "Un bon pitch augmente tes chances d'etre selectionne.",
        required: false,
    },
    {
        id: 'company',
        icon: '🏢',
        title: 'Tu travailles en entreprise ?',
        subtitle: 'Optionnel — remplis si tu as une structure ou une RC Pro.',
        required: false,
        optional: true,
    },
]

interface FormData {
    first_name: string
    last_name: string
    phone: string
    intervention_zones: string[]
    certifications: string[]
    skills: string[]
    bio: string
    company_name: string
    siret: string
    insurance_info: string
}

const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
}

export function ProfileSetup() {
    const router = useRouter()
    const { user, profile, refreshProfile } = useAuth()
    const [step, setStep] = useState(0)
    const [direction, setDirection] = useState(1)
    const [isSaving, setIsSaving] = useState(false)
    const guardChecked = useRef(false)
    const formInitialized = useRef(false)

    const [form, setForm] = useState<FormData>({
        first_name: '',
        last_name: '',
        phone: '',
        intervention_zones: [],
        certifications: [],
        skills: [],
        bio: '',
        company_name: '',
        siret: '',
        insurance_info: '',
    })

    // Guard : pro uniquement.
    // "Deja complet" verifie une seule fois au mount pour eviter
    // une redirection intempestive apres refreshProfile() en cours de wizard.
    useEffect(() => {
        if (!profile) return
        if (profile.role !== 'pro') {
            router.replace('/dashboard')
            return
        }
        if (!guardChecked.current) {
            guardChecked.current = true
            const isComplete = !!(profile.first_name && (profile.intervention_zones ?? []).length > 0)
            if (isComplete) {
                router.replace('/dashboard')
            }
        }
    }, [profile, router])

    // Pre-fill : une seule fois dès que profile est disponible
    // On n'écoute pas les re-renders de profile pour ne pas écraser la saisie en cours
    useEffect(() => {
        if (formInitialized.current) return
        if (!user && !profile) return

        formInitialized.current = true

        const stored = typeof window !== 'undefined'
            ? (() => { try { return JSON.parse(localStorage.getItem('lescordistes_pro_reg') || '{}') } catch { return {} } })()
            : {}
        const meta = (user?.user_metadata ?? {}) as Record<string, string>

        if (profile) {
            const parts = (profile.full_name || '').trim().split(' ')
            setForm({
                first_name:         profile.first_name         || parts[0]                 || meta.first_name    || stored.firstName   || '',
                last_name:          profile.last_name          || parts.slice(1).join(' ') || meta.last_name     || stored.lastName    || '',
                phone:              profile.phone              || meta.phone               || stored.phone       || '',
                company_name:       profile.company_name       || meta.company_name        || stored.companyName || '',
                intervention_zones: profile.intervention_zones || [],
                certifications:     profile.certifications     || [],
                skills:             profile.skills             || [],
                bio:                profile.bio                || '',
                siret:              profile.siret              || '',
                insurance_info:     profile.insurance_info     || '',
            })
        } else {
            setForm(prev => ({
                ...prev,
                first_name:   meta.first_name   || stored.firstName   || '',
                last_name:    meta.last_name    || stored.lastName    || '',
                phone:        meta.phone        || stored.phone       || '',
                company_name: meta.company_name || stored.companyName || '',
            }))
        }
    }, [profile, user])

    // Scroll to top a chaque changement de step
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [step])

    const toggle = (field: 'intervention_zones' | 'certifications' | 'skills', value: string) => {
        setForm(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(v => v !== value)
                : [...prev[field], value],
        }))
    }

    const saveStep = async () => {
        if (!user) return
        setIsSaving(true)
        try {
            const client = createSupabaseBrowserClient()
            const full_name = `${form.first_name.trim()} ${form.last_name.trim()}`.trim()
            const { error } = await (client.from('profiles') as any).update({
                first_name:        form.first_name || null,
                last_name:         form.last_name  || null,
                full_name:         full_name       || null,
                phone:             form.phone      || null,
                intervention_zones: form.intervention_zones,
                certifications:    form.certifications,
                skills:            form.skills,
                bio:               form.bio              || null,
                company_name:      form.company_name     || null,
                siret:             form.siret            || null,
                insurance_info:    form.insurance_info   || null,
            }).eq('id', user.id)
            if (error) console.error('ProfileSetup update error:', error)
            // refreshProfile best-effort — n'interrompt pas la navigation
            refreshProfile().catch(err => console.error('refreshProfile error:', err))
        } finally {
            setIsSaving(false)
        }
    }

    // next() : la save est best-effort, une erreur ne bloque jamais la navigation
    const next = async () => {
        try { await saveStep() } catch (err) { console.error('saveStep error:', err) }
        if (step < STEPS.length - 1) {
            setDirection(1)
            setStep(s => s + 1)
        } else {
            router.push('/dashboard')
        }
    }

    const back = () => {
        setDirection(-1)
        setStep(s => s - 1)
    }

    const skip = () => {
        if (step < STEPS.length - 1) {
            setDirection(1)
            setStep(s => s + 1)
        } else {
            router.push('/dashboard')
        }
    }

    const canContinue = () => {
        const s = STEPS[step]
        if (!s.required) return true
        if (s.id === 'identity') return form.first_name.trim().length > 0 && form.phone.trim().length > 0
        if (s.id === 'zones') return form.intervention_zones.length > 0
        return true
    }

    const current = STEPS[step]
    const progress = ((step + 1) / STEPS.length) * 100

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Top bar */}
            <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
                <button
                    onClick={step === 0 ? () => router.push('/dashboard') : back}
                    className="flex items-center gap-1.5 text-slate-500 text-sm font-medium hover:text-slate-800 transition-colors"
                >
                    <ArrowLeft size={16} />
                    {step === 0 ? 'Plus tard' : 'Retour'}
                </button>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {step + 1} / {STEPS.length}
                </span>
                <div className="w-16" />
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-slate-100">
                <div
                    className="h-full bg-brand-blue transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Step content */}
            <div className="max-w-lg mx-auto w-full px-4 py-8">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={step}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.22, ease: 'easeInOut' }}
                    >
                        {/* Header */}
                        <div className="mb-8">
                            <div className="text-4xl mb-3">{current.icon}</div>
                            <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-2">
                                {current.title}
                            </h1>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                {current.subtitle}
                            </p>
                        </div>

                        {/* Step identity */}
                        {current.id === 'identity' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Prénom *</label>
                                        <input
                                            autoFocus
                                            type="text"
                                            value={form.first_name}
                                            onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))}
                                            placeholder="Jean"
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nom</label>
                                        <input
                                            type="text"
                                            value={form.last_name}
                                            onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))}
                                            placeholder="Dupont"
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue bg-white"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Téléphone *</label>
                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                        placeholder="+33 6 00 00 00 00"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue bg-white"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step zones */}
                        {current.id === 'zones' && (
                            <div>
                                <div className="flex flex-wrap gap-1.5 p-3 border border-slate-200 rounded-xl bg-white max-h-72 overflow-y-auto">
                                    {FRENCH_DEPARTMENTS.map(dept => (
                                        <button
                                            key={dept.code}
                                            type="button"
                                            onClick={() => toggle('intervention_zones', dept.code)}
                                            title={dept.label}
                                            className={`w-11 h-9 text-xs font-bold rounded-lg border transition-all ${
                                                form.intervention_zones.includes(dept.code)
                                                    ? 'bg-brand-blue text-white border-brand-blue shadow-sm'
                                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-brand-blue/50'
                                            }`}
                                        >
                                            {dept.code}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-400 mt-2 ml-1">
                                    {form.intervention_zones.length > 0
                                        ? `${form.intervention_zones.length} département(s) sélectionné(s)`
                                        : 'Sélectionne au moins un département'}
                                </p>
                            </div>
                        )}

                        {/* Step certifications */}
                        {current.id === 'certifications' && (
                            <div className="flex flex-wrap gap-2">
                                {CERTIFICATIONS_LIST.map(cert => (
                                    <button
                                        key={cert}
                                        type="button"
                                        onClick={() => toggle('certifications', cert)}
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm border transition-all ${
                                            form.certifications.includes(cert)
                                                ? 'bg-brand-blue text-white border-brand-blue'
                                                : 'bg-white text-slate-600 border-slate-200 hover:border-brand-blue/50'
                                        }`}
                                    >
                                        {form.certifications.includes(cert) && <Check size={12} />}
                                        {cert}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Step skills */}
                        {current.id === 'skills' && (
                            <div className="flex flex-wrap gap-2">
                                {SKILLS_LIST.map(skill => (
                                    <button
                                        key={skill}
                                        type="button"
                                        onClick={() => toggle('skills', skill)}
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm border transition-all ${
                                            form.skills.includes(skill)
                                                ? 'bg-green-500 text-white border-green-500'
                                                : 'bg-white text-slate-600 border-slate-200 hover:border-green-400/50'
                                        }`}
                                    >
                                        {form.skills.includes(skill) && <Check size={12} />}
                                        {skill}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Step bio */}
                        {current.id === 'bio' && (
                            <div>
                                <textarea
                                    autoFocus
                                    value={form.bio}
                                    onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                                    placeholder="Ex : Cordiste IRATA Level 2 avec 8 ans d'experience dans le BTP et l'industrie..."
                                    rows={6}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue bg-white resize-none"
                                />
                                <p className="text-xs text-slate-400 mt-1.5 ml-1">{form.bio.length} caractères</p>
                            </div>
                        )}

                        {/* Step company */}
                        {current.id === 'company' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nom de l'entreprise</label>
                                    <input
                                        type="text"
                                        value={form.company_name}
                                        onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))}
                                        placeholder="Ex: Cordistes Pro SARL"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">SIRET</label>
                                    <input
                                        type="text"
                                        value={form.siret}
                                        onChange={e => setForm(p => ({ ...p, siret: e.target.value }))}
                                        placeholder="123 456 789 00012"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Assurance RC Pro</label>
                                    <input
                                        type="text"
                                        value={form.insurance_info}
                                        onChange={e => setForm(p => ({ ...p, insurance_info: e.target.value }))}
                                        placeholder="Ex: AXA RC Pro n 123456 valide 12/2026"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue bg-white"
                                    />
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Actions */}
                <div className="mt-8 space-y-3">
                    <button
                        onClick={next}
                        disabled={!canContinue() || isSaving}
                        className="w-full flex items-center justify-center gap-2 bg-brand-blue hover:bg-brand-blue/90 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-blue/20 transition-all text-sm"
                    >
                        {isSaving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                {step === STEPS.length - 1 ? 'Terminer et accéder au dashboard' : 'Continuer'}
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>

                    {current.required && !canContinue() && (
                        <p className="text-center text-xs text-slate-400">
                            {current.id === 'identity' && 'Prénom et téléphone requis pour continuer'}
                            {current.id === 'zones' && 'Sélectionne au moins un département'}
                        </p>
                    )}

                    {current.optional && (
                        <button
                            onClick={skip}
                            className="w-full py-3 text-sm text-slate-400 hover:text-slate-600 transition-colors font-medium"
                        >
                            Passer cette étape
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
