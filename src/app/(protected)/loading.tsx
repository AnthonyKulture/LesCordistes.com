export default function Loading() {
    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container max-w-6xl py-8">
                <div className="h-7 w-56 rounded bg-slate-200 animate-pulse" />
                <div className="mt-2 h-4 w-72 rounded bg-slate-100 animate-pulse" />

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm animate-pulse"
                        >
                            <div className="h-4 w-24 rounded bg-slate-100" />
                            <div className="mt-3 h-7 w-16 rounded bg-slate-200" />
                        </div>
                    ))}
                </div>

                <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="h-5 w-40 rounded bg-slate-200 animate-pulse" />
                    <div className="mt-5 space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4 animate-pulse">
                                <div className="h-10 w-10 rounded-lg bg-slate-100 shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-1/2 rounded bg-slate-200" />
                                    <div className="h-3 w-1/3 rounded bg-slate-100" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
