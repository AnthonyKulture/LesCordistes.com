'use client'

import { useState } from 'react'
import { StatsGrid } from '@/components/admin/StatsGrid'
import { AiSidebar } from '@/components/admin/AiSidebar'
import { NotifyButton } from '@/components/admin/NotifyButton'

export function DashboardShell() {
    const [statsKey, setStatsKey] = useState(0)

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
                <StatsGrid key={statsKey} />
                <aside className="xl:sticky xl:top-6 xl:self-start xl:h-[calc(100vh-3rem)]">
                    <AiSidebar
                        context={{ type: 'free' }}
                        title="Assistant Ops"
                        onMutationSuccess={() => setStatsKey(k => k + 1)}
                    />
                </aside>
            </div>
        </div>
    )
}
