import { StatsGrid } from '@/components/admin/StatsGrid'
import type { OpsStats } from '@/lib/types/ops'

type Props = {
    // Données pré-chargées côté serveur par admin/page.tsx (élimine le spinner initial)
    initialStats?: OpsStats | null
}

export function DashboardShell({ initialStats }: Props) {
    return (
        <div className="px-4 md:px-8 py-6 max-w-[1600px] mx-auto">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Dashboard Ops</h1>
                <p className="text-sm text-slate-500">Vue temps réel de la plateforme.</p>
            </header>

            <StatsGrid initial={initialStats} />
        </div>
    )
}
