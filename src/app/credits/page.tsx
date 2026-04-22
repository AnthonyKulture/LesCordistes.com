import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Credits } from '@/views/Credits'

export const metadata: Metadata = {
    title: 'Tarifs & Fonctionnement — LesCordistes',
    description: 'Découvrez comment fonctionne LesCordistes pour les cordistes : parcourez les chantiers gratuitement, accédez aux coordonnées du client avec un crédit.',
    alternates: { canonical: 'https://lescordistes.com/credits' },
}

export default function Page() {
    return (
        <Suspense>
            <Credits />
        </Suspense>
    )
}
