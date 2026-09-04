import Link from 'next/link'
import type { AnalyticsRange } from '@/lib/types/ops'

export const RANGE_OPTIONS: { value: AnalyticsRange; label: string; periodLabel: string }[] = [
    { value: '30d', label: '30 j', periodLabel: '30 derniers jours' },
    { value: '90d', label: '90 j', periodLabel: '90 derniers jours' },
    { value: '12m', label: '12 m', periodLabel: '12 derniers mois' },
]

export function RangeSelector({ active, basePath }: { active: AnalyticsRange; basePath: string }) {
    return (
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5" role="group" aria-label="Période">
            {RANGE_OPTIONS.map(opt => (
                <Link
                    key={opt.value}
                    href={`${basePath}?range=${opt.value}`}
                    aria-current={opt.value === active ? 'page' : undefined}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        opt.value === active ? 'bg-[#243355] text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                    {opt.label}
                </Link>
            ))}
        </div>
    )
}
