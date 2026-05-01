'use client'

import React, { useMemo, useState } from 'react'
import { Bell, Check, Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { FRENCH_DEPARTMENTS } from '../../constants/departments'

interface Props {
    /** Optionnel : valeur initiale du sélecteur de départements (ex: zones d'intervention du pro). */
    defaultDepartments?: string[]
    /** Pré-remplit l'email (utilisateur connecté). */
    defaultEmail?: string
}

export const ProAlertCTA: React.FC<Props> = ({ defaultDepartments, defaultEmail }) => {
    // Le bloc reste TOUJOURS affiché — pas de close ni de localStorage dismiss.
    // C'est volontaire : on veut maximiser la capture d'emails côté pro,
    // notamment pour les visiteurs non-connectés.
    const [expanded, setExpanded] = useState(false)
    const [email, setEmail] = useState(defaultEmail || '')
    const [departments, setDepartments] = useState<string[]>(defaultDepartments ?? [])
    const [search, setSearch] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [done, setDone] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const toggleDept = (code: string) => {
        setDepartments(prev =>
            prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
        )
    }

    const filteredDepts = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return FRENCH_DEPARTMENTS
        return FRENCH_DEPARTMENTS.filter(
            d => d.label.toLowerCase().includes(q) || d.code.includes(q)
        )
    }, [search])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Email invalide')
            return
        }
        if (departments.length === 0) {
            setError('Sélectionnez au moins un département')
            return
        }
        setSubmitting(true)
        try {
            const res = await fetch('/api/pro-alerts/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, departments, source: 'jobs_page' }),
            })
            const body = await res.json().catch(() => ({}))
            if (!res.ok) {
                setError(body?.error ?? 'Inscription impossible')
                return
            }
            setDone(true)
            setExpanded(false)
        } catch {
            setError('Réseau indisponible. Réessayez.')
        } finally {
            setSubmitting(false)
        }
    }

    if (done) {
        return (
            <div className="flex items-start sm:items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 sm:px-5 sm:py-3.5 mb-6">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
                    <Check size={16} className="text-emerald-600" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-emerald-900 leading-snug">
                        C'est noté — alertes activées pour {departments.length === 1 ? 'le département' : 'les départements'} {departments.join(', ')}.
                    </p>
                    <p className="text-xs text-emerald-700 mt-1 break-words">
                        On vous écrit à <strong>{email}</strong> dès qu'une nouvelle mission tombe.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gradient-to-r from-brand-blue/5 to-brand-blue-light/5 border border-brand-blue/20 rounded-xl mb-6 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 sm:px-5 sm:py-3.5">
                {/* Header line — icon + texte. Texte wrappe sur mobile (pas de truncate). */}
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-brand-blue via-brand-blue-light to-brand-blue animate-gradient-shift flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Bell size={16} className="text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800 leading-snug">
                            Pas de mission dans votre coin ? Soyez alerté dès qu'il y en a une.
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                            Email + vos départements — gratuit, désinscription en 1 clic.
                        </p>
                    </div>
                </div>

                {/* CTA — pleine largeur sur mobile, auto sur sm+. Animé. */}
                <button
                    type="button"
                    onClick={() => setExpanded(v => !v)}
                    className="w-full sm:w-auto flex-shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 bg-gradient-to-r from-brand-blue via-brand-blue-light to-brand-blue animate-gradient-shift text-white rounded-lg text-sm sm:text-xs font-bold uppercase tracking-wide shadow-sm hover:shadow-md transition-shadow"
                >
                    <Bell size={14} className="sm:hidden" />
                    {expanded ? 'Réduire' : 'Activer mes alertes'}
                </button>
            </div>

            <AnimatePresence initial={false}>
                {expanded && (
                    <motion.form
                        key="form"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        onSubmit={handleSubmit}
                        className="border-t border-brand-blue/10 bg-white/50"
                    >
                        <div className="p-4 sm:p-5 space-y-4">
                            <div>
                                <label htmlFor="pro-alert-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Email pro
                                </label>
                                <input
                                    id="pro-alert-email"
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="prenom@entreprise.com"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
                                    autoComplete="email"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Départements suivis · {departments.length} sélectionné{departments.length !== 1 ? 's' : ''}
                                </label>

                                {departments.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                        {departments.map(code => {
                                            const dept = FRENCH_DEPARTMENTS.find(d => d.code === code)
                                            return (
                                                <button
                                                    type="button"
                                                    key={code}
                                                    onClick={() => toggleDept(code)}
                                                    className="inline-flex items-center gap-1 px-2 py-1 bg-brand-blue text-white text-xs font-semibold rounded-md hover:bg-brand-blue/90"
                                                >
                                                    {dept?.label ?? code}
                                                    <X size={11} />
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}

                                <div className="relative mb-2">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder="Rechercher un département (nom ou code)..."
                                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
                                    />
                                </div>

                                <div className="max-h-44 overflow-y-auto bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
                                    {filteredDepts.map(dept => {
                                        const checked = departments.includes(dept.code)
                                        return (
                                            <label
                                                key={dept.code}
                                                className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 ${
                                                    checked ? 'bg-brand-blue/5' : ''
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => toggleDept(dept.code)}
                                                    className="h-4 w-4 rounded border-slate-300 text-brand-blue focus:ring-brand-blue/30"
                                                />
                                                <span className="text-slate-700">{dept.label}</span>
                                            </label>
                                        )
                                    })}
                                    {filteredDepts.length === 0 && (
                                        <p className="text-xs text-slate-400 px-3 py-3">Aucun département.</p>
                                    )}
                                </div>
                            </div>

                            {error && (
                                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                                    {error}
                                </p>
                            )}

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <p className="text-[11px] text-slate-500 leading-tight order-2 sm:order-1">
                                    Vous recevrez un email <strong>uniquement</strong> quand une nouvelle mission tombe dans vos départements. Désinscription en 1 clic.
                                </p>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="order-1 sm:order-2 w-full sm:w-auto flex-shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 bg-gradient-to-r from-brand-blue via-brand-blue-light to-brand-blue animate-gradient-shift text-white rounded-lg text-sm sm:text-xs font-bold uppercase tracking-wide shadow-sm hover:shadow-md transition-shadow disabled:opacity-60 whitespace-nowrap"
                                >
                                    {submitting ? 'Inscription…' : 'Activer mes alertes'}
                                </button>
                            </div>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    )
}
