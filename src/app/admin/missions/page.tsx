import { Suspense } from 'react'
import { MissionsList } from './MissionsList'

export const metadata = {
    title: 'Missions · Admin',
}

export default function MissionsPage() {
    return (
        <div className="px-4 md:px-8 py-6 max-w-[1400px] mx-auto">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Missions</h1>
                <p className="text-sm text-slate-500">Modération et suivi du flux de leads.</p>
            </header>
            <Suspense fallback={<div className="text-sm text-slate-500">Chargement…</div>}>
                <MissionsList />
            </Suspense>
        </div>
    )
}
