'use client'

import { useCallback, useState } from 'react'
import { StatsGrid } from '@/components/admin/StatsGrid'
import { AiSidebarLazy } from '@/components/admin/AiSidebarLazy'
import { NotifyButton } from '@/components/admin/NotifyButton'
import type { OpsStats } from '@/lib/types/ops'

type Props = {
    // Données pré-chargées côté serveur par admin/page.tsx (élimine le spinner initial)
    initialStats?: OpsStats | null
}

export function DashboardShell({ initialStats }: Props) {
    const [statsRefresh, setStatsRefresh] = useState(0)
    const handleMutationSuccess = useCallback(() => setStatsRefresh(n => n + 1), [])

    return (
        <div className="px-4 md:px-8 py-6 max-w-[1600px] mx-auto">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard Ops</h1>
                    <p className="text-sm text-slate-500">Vue temps réel de la plateforme.</p>
                </div>
                <NotifyButton />
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
                {/* ✅ Phase 2: initial passe les données SSR, évite le double aller-retour */}
                <StatsGrid initial={initialStats} refreshToken={statsRefresh} />
                <aside className="xl:sticky xl:top-6 xl:self-start xl:h-[calc(100vh-3rem)]">
                    <AiSidebarLazy
                        context={{ type: 'free' }}
                        title="Assistant Ops"
                        onMutationSuccess={handleMutationSuccess}
                    />
                </aside>
            </div>
        </div>
    )
}
