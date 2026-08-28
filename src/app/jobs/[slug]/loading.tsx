export default function Loading() {
    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container max-w-5xl py-6">
                <div className="h-4 w-64 rounded bg-slate-200 animate-pulse" />
                <div className="mt-5 h-4 w-40 rounded bg-slate-200 animate-pulse" />

                <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
                    <div className="space-y-4">
                        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm animate-pulse">
                            <div className="h-6 w-3/4 rounded bg-slate-200" />
                            <div className="mt-3 h-4 w-1/3 rounded bg-slate-100" />
                            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="h-16 rounded-xl bg-slate-100" />
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm animate-pulse">
                            <div className="h-5 w-40 rounded bg-slate-200" />
                            <div className="mt-4 space-y-2">
                                <div className="h-4 w-full rounded bg-slate-100" />
                                <div className="h-4 w-full rounded bg-slate-100" />
                                <div className="h-4 w-2/3 rounded bg-slate-100" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm animate-pulse">
                            <div className="h-5 w-36 rounded bg-slate-200" />
                            <div className="mt-4 space-y-2.5">
                                <div className="h-10 rounded-lg bg-slate-100" />
                                <div className="h-10 rounded-lg bg-slate-100" />
                                <div className="h-10 rounded-lg bg-slate-100" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
