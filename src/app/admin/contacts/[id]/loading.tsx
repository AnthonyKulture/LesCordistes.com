export default function Loading() {
    return (
        <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-8">
            <span className="sr-only" role="status">
                Chargement de la fiche contact…
            </span>
            <div className="animate-pulse" aria-hidden="true">
                <div className="mb-4 h-4 w-32 rounded bg-slate-200" />
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
                    <div className="h-96 rounded-xl border border-slate-200 bg-white" />
                    <div className="space-y-3">
                        <div className="h-64 rounded-xl border border-slate-200 bg-white" />
                        <div className="h-40 rounded-xl border border-slate-200 bg-white" />
                    </div>
                </div>
            </div>
        </div>
    )
}
