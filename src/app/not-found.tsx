import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Page introuvable | LesCordistes.com',
    robots: { index: false, follow: false },
}

export default function NotFoundPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12">
            <div className="container max-w-lg text-center">
                <div className="text-8xl font-extrabold text-slate-200 mb-4">404</div>
                <h1 className="text-3xl font-bold text-slate-900 mb-3">Page introuvable</h1>
                <p className="text-lg text-slate-600 mb-8">
                    La page que vous recherchez n&apos;existe pas ou a été déplacée.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/" className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-brand-blue text-white rounded-lg font-semibold hover:bg-brand-blue-light transition-colors">
                        Retour à l&apos;accueil
                    </Link>
                    <Link href="/jobs" className="inline-flex items-center justify-center gap-2 px-8 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 transition-colors">
                        Voir les missions
                    </Link>
                </div>
            </div>
        </div>
    )
}
