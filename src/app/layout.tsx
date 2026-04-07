import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/Providers'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import '../index.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    metadataBase: new URL('https://lescordistes.com'),
    title: {
        default: 'LesCordistes.com - Plateforme pour Professionnels du Travail sur Cordes',
        template: '%s | LesCordistes',
    },
    description: "Trouvez des chantiers ou recrutez des cordistes qualifiés. La marketplace n°1 pour les travaux d'accès difficile et les métiers de la corde.",
    keywords: ['cordiste', 'travail en hauteur', 'accès difficile', 'IRATA', 'CQP', 'missions cordiste'],
    openGraph: {
        siteName: 'LesCordistes.com',
        locale: 'fr_FR',
        type: 'website',
    },
    robots: {
        index: true,
        follow: true,
    },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="fr">
            <body className={`${inter.className} overflow-x-hidden`} suppressHydrationWarning>
                <Providers>
                    <div className="flex flex-col min-h-screen w-full">
                        <Header />
                        <main className="flex-grow">
                            {children}
                        </main>
                        <Footer />
                    </div>
                </Providers>
            </body>
        </html>
    )
}
