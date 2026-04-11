'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cookie, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react'
import { getConsent, setConsent, hasConsent, applyGtagConsent } from '@/lib/consent'
import { initPostHog, optOutPostHog } from '@/lib/posthog-client'

export function ConsentBanner() {
    const [visible, setVisible] = useState(false)
    const [expanded, setExpanded] = useState(false)
    const [analyticsEnabled, setAnalyticsEnabled] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        if (!hasConsent()) setVisible(true)
    }, [])

    if (!mounted || !visible) return null

    function accept(analytics: boolean) {
        setConsent(analytics)
        applyGtagConsent(analytics)
        if (analytics) {
            initPostHog()
        } else {
            optOutPostHog()
        }
        setVisible(false)
    }

    return (
        <div
            role="dialog"
            aria-label="Gestion des cookies"
            aria-modal="false"
            className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up"
        >
            <div className="bg-slate-900 border-t border-slate-700 shadow-xl">
                <div className="container py-3">
                    {!expanded ? (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4">
                            {/* Text */}
                            <div className="flex items-start gap-2 flex-1 min-w-0">
                                <Cookie size={14} className="text-brand-blue-light shrink-0 mt-0.5" aria-hidden="true" />
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Nous utilisons des cookies analytiques (GA4, PostHog) pour mesurer l'audience.{' '}
                                    <Link href="/confidentialite" className="text-slate-500 hover:text-slate-300 underline underline-offset-2 transition-colors">
                                        En savoir plus
                                    </Link>
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => { setAnalyticsEnabled(false); setExpanded(true) }}
                                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-800"
                                >
                                    Personnaliser <ChevronDown size={12} />
                                </button>
                                <button
                                    onClick={() => accept(false)}
                                    className="text-xs text-slate-400 border border-slate-700 hover:border-slate-500 hover:text-white transition-colors px-3 py-1.5 rounded"
                                >
                                    Refuser
                                </button>
                                <button
                                    onClick={() => accept(true)}
                                    className="text-xs font-medium text-white bg-brand-blue hover:bg-brand-blue-light transition-colors px-3 py-1.5 rounded"
                                >
                                    Accepter
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {/* Header */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Cookie size={13} className="text-brand-blue-light" aria-hidden="true" />
                                    <span className="text-xs font-semibold text-slate-100">Personnaliser mes préférences</span>
                                </div>
                                <button
                                    onClick={() => setExpanded(false)}
                                    aria-label="Réduire"
                                    className="text-slate-600 hover:text-slate-300 transition-colors"
                                >
                                    <ChevronUp size={14} />
                                </button>
                            </div>

                            {/* Categories */}
                            <div className="grid sm:grid-cols-2 gap-2 mb-3">
                                <div className="flex items-start justify-between gap-3 px-3 py-2.5 rounded-lg bg-slate-700 border border-slate-600">
                                    <div className="flex items-start gap-2 min-w-0">
                                        <ShieldCheck size={12} className="text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                                        <div>
                                            <p className="text-xs font-semibold text-slate-100">Nécessaires</p>
                                            <p className="text-xs text-slate-400 mt-0.5">Authentification, session, paiement</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-emerald-400 shrink-0 mt-0.5 font-medium">Toujours actifs</span>
                                </div>

                                <div className="flex items-start justify-between gap-3 px-3 py-2.5 rounded-lg bg-slate-700 border border-slate-600">
                                    <div className="flex items-start gap-2 min-w-0">
                                        <Cookie size={12} className="text-brand-blue-light shrink-0 mt-0.5" aria-hidden="true" />
                                        <div>
                                            <p className="text-xs font-semibold text-slate-100">Analytiques</p>
                                            <p className="text-xs text-slate-400 mt-0.5">Google Analytics · PostHog</p>
                                        </div>
                                    </div>
                                    <button
                                        role="switch"
                                        aria-checked={analyticsEnabled}
                                        aria-label="Activer les cookies analytiques"
                                        onClick={() => setAnalyticsEnabled(v => !v)}
                                        className={`shrink-0 relative inline-flex h-4 w-7 items-center rounded-full transition-colors mt-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue-light ${
                                            analyticsEnabled ? 'bg-brand-blue-light' : 'bg-slate-600'
                                        }`}
                                    >
                                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${
                                            analyticsEnabled ? 'translate-x-3.5' : 'translate-x-0.5'
                                        }`} />
                                    </button>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between gap-2">
                                <Link href="/confidentialite" className="text-xs text-slate-500 underline underline-offset-2 hover:text-slate-300 transition-colors">Confidentialité</Link>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => accept(false)}
                                        className="text-xs text-slate-400 border border-slate-700 hover:border-slate-500 hover:text-white transition-colors px-3 py-1.5 rounded"
                                    >
                                        Tout refuser
                                    </button>
                                    <button
                                        onClick={() => accept(analyticsEnabled)}
                                        className="text-xs font-medium text-white bg-brand-blue hover:bg-brand-blue-light transition-colors px-3 py-1.5 rounded"
                                    >
                                        Enregistrer
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export function ConsentManager() {
    function reopen() {
        localStorage.removeItem('lc_consent')
        window.location.reload()
    }

    return (
        <button onClick={reopen} className="hover:text-brand-blue transition-colors">
            Cookies
        </button>
    )
}
