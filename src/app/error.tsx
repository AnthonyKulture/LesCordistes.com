'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('[app-error]', error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="max-w-md text-center">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                    Une erreur est survenue
                </h1>
                <p className="text-slate-600 mb-6">
                    La page n&apos;a pas pu s&apos;afficher. Réessayez — si le problème persiste,
                    écrivez-nous à{' '}
                    <a href="mailto:contact@lescordistes.com" className="text-brand-blue hover:underline">
                        contact@lescordistes.com
                    </a>
                    .
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="px-5 py-2.5 rounded-lg bg-brand-blue text-white font-medium hover:bg-brand-blue/90 transition-colors"
                    >
                        Réessayer
                    </button>
                    <Link
                        href="/"
                        className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-100 transition-colors"
                    >
                        Retour à l&apos;accueil
                    </Link>
                </div>
                {error.digest && (
                    <p className="mt-6 text-xs text-slate-400">Référence : {error.digest}</p>
                )}
            </div>
        </div>
    )
}
