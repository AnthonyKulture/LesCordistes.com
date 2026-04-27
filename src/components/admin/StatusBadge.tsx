type Props = {
    status: 'pending' | 'live' | 'rejected' | 'completed' | 'cancelled' | 'expired' | string
}

const MAP: Record<string, { label: string; className: string }> = {
    pending: { label: 'En attente', className: 'bg-amber-100 text-amber-800' },
    live: { label: 'En ligne', className: 'bg-emerald-100 text-emerald-800' },
    expired: { label: 'Déjà effectuée', className: 'bg-slate-200 text-slate-700' },
    rejected: { label: 'Rejetée', className: 'bg-red-100 text-red-800' },
    completed: { label: 'Terminée', className: 'bg-slate-200 text-slate-700' },
    cancelled: { label: 'Archivée', className: 'bg-slate-100 text-slate-500' },
}

export function StatusBadge({ status }: Props) {
    const m = MAP[status] ?? { label: status, className: 'bg-slate-100 text-slate-600' }
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${m.className}`}>
            {m.label}
        </span>
    )
}

export function LqsBadge({ value }: { value: number }) {
    const color = value < 50 ? 'bg-red-100 text-red-700' : value < 70 ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold ${color}`}>
            LQS {value}
        </span>
    )
}
