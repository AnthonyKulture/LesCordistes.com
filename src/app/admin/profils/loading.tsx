import { SkeletonProfileCard } from '@/components/admin/SkeletonCard'

export default function Loading() {
    return (
        <div className="px-4 md:px-8 py-6 max-w-[1400px] mx-auto" aria-hidden="true">
            <header className="mb-6">
                <div className="h-7 w-32 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-64 bg-slate-100 rounded mt-2 animate-pulse" />
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => <SkeletonProfileCard key={i} />)}
            </div>
        </div>
    )
}
