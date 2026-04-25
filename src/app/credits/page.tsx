import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Credits } from '@/views/Credits'
import { SEO_BASE_URL } from '@/constants/seoConfig'

export const metadata: Metadata = {
    title: 'Tarifs & crédits cordistes · LesCordistes',
    description: 'Comment fonctionne LesCordistes pour les cordistes : parcourez les chantiers gratuitement, accédez aux coordonnées client avec un crédit.',
    alternates: { canonical: `${SEO_BASE_URL}/credits` },
}

export default function Page() {
    return (
        <Suspense>
            <Credits />
        </Suspense>
    )
}
