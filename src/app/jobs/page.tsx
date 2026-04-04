import type { Metadata } from 'next'
import { JobBoard } from '@/views/JobBoard'

export const revalidate = 60 // ISR: re-render au plus toutes les 60 secondes

export const metadata: Metadata = {
    title: 'Missions Cordistes — Trouver des chantiers | LesCordistes',
    description: 'Toutes les missions disponibles pour cordistes et techniciens en travaux sur cordes. Nettoyage façade, maintenance industrielle, génie civil. Postulez directement.',
    alternates: {
        canonical: 'https://lescordistes.com/jobs',
    },
    openGraph: {
        title: 'Missions Cordistes — Trouver des chantiers | LesCordistes',
        description: 'Toutes les missions disponibles pour cordistes et techniciens en travaux sur cordes.',
        url: 'https://lescordistes.com/jobs',
        images: [{ url: '/lescordistes.com-3.webp', width: 1200, height: 630 }],
    },
}

export default function JobsPage() {
    return <JobBoard />
}
