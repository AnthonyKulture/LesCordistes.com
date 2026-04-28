import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Publier une mission cordiste — Devis gratuits sous 48h',
    description: 'Publiez votre mission de travaux sur cordes ou en hauteur en 2 min. Recevez des devis gratuits de cordistes certifiés (IRATA, CQP) sous 48h.',
    alternates: { canonical: 'https://www.lescordistes.com/post-job' },
    robots: { index: true, follow: true },
}

export default function PostJobLayout({ children }: { children: React.ReactNode }) {
    return children
}
