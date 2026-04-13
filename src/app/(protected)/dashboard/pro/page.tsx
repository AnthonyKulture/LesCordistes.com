'use client'

import { Suspense } from 'react'
import { DashboardSelector } from '@/views/dashboards/DashboardSelector'

export default function ProDashboardPage() {
    return (
        <Suspense>
            <DashboardSelector />
        </Suspense>
    )
}
