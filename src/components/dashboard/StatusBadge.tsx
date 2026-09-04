

interface StatusBadgeProps {
    status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const styles: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        live: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
        completed: 'bg-slate-100 text-slate-800',
        expired: 'bg-orange-100 text-orange-800',
        cancelled: 'bg-slate-100 text-slate-600',
    };

    const labels: Record<string, string> = {
        pending: '⏳ En attente',
        live: '✅ Publiée',
        rejected: '❌ Rejetée',
        completed: '✓ Terminée',
        expired: '⌛ Expirée',
        cancelled: '🚫 Annulée',
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
            {labels[status] || status}
        </span>
    );
}
