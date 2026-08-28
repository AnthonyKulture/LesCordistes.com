export default function Loading() {
    return (
        <div className="min-h-screen bg-slate-50">
            <section className="bg-gradient-to-br from-brand-blue via-brand-blue to-brand-blue-light py-10 md:py-16">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 text-center">
                    <div className="h-7 md:h-9 w-3/4 mx-auto rounded bg-white/20 animate-pulse" />
                    <div className="mt-3 h-4 w-5/6 mx-auto rounded bg-white/15 animate-pulse" />
                </div>
            </section>

            <div className="container max-w-7xl py-10">
                <div className="flex items-center gap-2 mb-6">
                    <div className="h-8 w-32 rounded-lg bg-slate-200 animate-pulse" />
                    <div className="h-8 w-28 rounded-lg bg-slate-200 animate-pulse" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm animate-pulse"
                        >
                            <div className="h-4 w-20 rounded bg-slate-200" />
                            <div className="mt-3 h-5 w-4/5 rounded bg-slate-200" />
                            <div className="mt-2 h-4 w-full rounded bg-slate-100" />
                            <div className="mt-1.5 h-4 w-2/3 rounded bg-slate-100" />
                            <div className="mt-4 flex gap-2">
                                <div className="h-6 w-24 rounded-full bg-slate-100" />
                                <div className="h-6 w-16 rounded-full bg-slate-100" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
