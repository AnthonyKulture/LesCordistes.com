'use client'

import { Suspense } from 'react'
import { DashboardSelector } from '@/views/dashboards/DashboardSelector'

export default function ClientDashboardPage() {
    return (
        <Suspense>
            <DashboardSelector />
        </Suspense>
    )
}
