type Props = {
    /** Nombre de blocs de contenu simulés sous l'en-tête. */
    rows?: number
}

/**
 * Squelette générique des pages admin.
 *
 * Sert de frontière Suspense : sans `loading.tsx`, une navigation vers une route
 * `force-dynamic` fige l'écran précédent jusqu'au rendu serveur complet, et le
 * préchargement des <Link> est inopérant (le routeur ne met rien en cache tant
 * qu'il n'a pas de frontière à préfetcher).
 */
export function PageSkeleton({ rows = 6 }: Props) {
    return (
        <div className="px-4 md:px-8 py-6 max-w-[1600px] mx-auto">
            <span className="sr-only" role="status">Chargement…</span>
            <div className="animate-pulse" aria-hidden="true">
            <div className="mb-6">
                <div className="h-7 w-48 bg-slate-200 rounded" />
                <div className="h-4 w-72 bg-slate-100 rounded mt-2" />
            </div>
            <div className="space-y-3">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="h-20 bg-white border border-slate-200 rounded-xl" />
                ))}
            </div>
            </div>
        </div>
    )
}
