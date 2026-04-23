import { Suspense } from 'react'
import { ProfilesList } from './ProfilesList'

export const metadata = {
    title: 'Profils · Admin',
}

export default function ProfilesPage() {
    return (
        <div className="px-4 md:px-8 py-6 max-w-[1400px] mx-auto">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Profils</h1>
                <p className="text-sm text-slate-500">Pros, clients, ajustement de crédits.</p>
            </header>
            <Suspense fallback={<div className="text-sm text-slate-500">Chargement…</div>}>
                <ProfilesList />
            </Suspense>
        </div>
    )
}
