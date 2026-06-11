/**
 * Skeleton loaders pour le back office admin.
 * Utilisés pendant le chargement des listes (missions, profils)
 * pour préserver la mise en page et améliorer la perception de rapidité.
 */

/** Skeleton d'une MetricCard (dashboard KPIs) */
export function SkeletonMetricCard() {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse">
            <div className="flex items-center justify-between mb-3">
                <div className="h-3 w-24 bg-slate-200 rounded" />
                <div className="h-7 w-7 bg-slate-200 rounded-lg" />
            </div>
            <div className="h-8 w-16 bg-slate-200 rounded mb-2" />
            <div className="h-3 w-32 bg-slate-100 rounded" />
        </div>
    )
}

/** Skeleton d'une JobCard (liste missions) */
export function SkeletonJobCard() {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse space-y-3">
            <div className="flex items-center justify-between">
                <div className="h-4 w-48 bg-slate-200 rounded" />
                <div className="h-5 w-16 bg-slate-100 rounded-full" />
            </div>
            <div className="h-3 w-32 bg-slate-100 rounded" />
            <div className="space-y-2">
                <div className="h-3 w-full bg-slate-100 rounded" />
                <div className="h-3 w-4/5 bg-slate-100 rounded" />
            </div>
            <div className="flex gap-2 pt-1">
                <div className="h-7 w-20 bg-slate-200 rounded-lg" />
                <div className="h-7 w-20 bg-slate-100 rounded-lg" />
            </div>
        </div>
    )
}

/** Skeleton d'une ProfileCard (liste profils) */
export function SkeletonProfileCard() {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse space-y-3">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-slate-200 rounded-full flex-shrink-0" />
                <div className="space-y-1.5 flex-1">
                    <div className="h-4 w-32 bg-slate-200 rounded" />
                    <div className="h-3 w-44 bg-slate-100 rounded" />
                </div>
            </div>
            <div className="flex gap-2">
                <div className="h-5 w-16 bg-slate-100 rounded-full" />
                <div className="h-5 w-20 bg-slate-100 rounded-full" />
            </div>
        </div>
    )
}

/** Grille de skeletons KPIs (7 cartes) */
export function SkeletonStatsGrid() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {Array.from({ length: 7 }).map((_, i) => (
                    <SkeletonMetricCard key={i} />
                ))}
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="h-4 w-40 bg-slate-200 rounded mb-4" />
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="py-2 flex items-center justify-between gap-3">
                        <div className="h-6 w-6 bg-slate-200 rounded-full" />
                        <div className="h-3 flex-1 bg-slate-100 rounded" />
                        <div className="h-3 w-24 bg-slate-100 rounded" />
                    </div>
                ))}
            </div>
        </div>
    )
}
