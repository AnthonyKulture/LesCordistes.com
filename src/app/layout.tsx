import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Providers } from '@/components/Providers'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ConsentBanner } from '@/components/ConsentBanner'
import '../index.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    metadataBase: new URL('https://www.lescordistes.com'),
    title: {
        default: 'LesCordistes.com · Plateforme pour Professionnels du Travail sur Cordes',
        template: '%s · LesCordistes',
    },
    description: "Trouvez des chantiers ou recrutez des cordistes qualifiés. La marketplace n°1 pour les travaux d'accès difficile et les métiers de la corde.",
    keywords: ['cordiste', 'travail en hauteur', 'accès difficile', 'IRATA', 'CQP', 'missions cordiste'],
    openGraph: {
        siteName: 'LesCordistes.com',
        locale: 'fr_FR',
        type: 'website',
        images: [{
            url: 'https://www.lescordistes.com/lescordistes.com-3.webp',
            width: 1200,
            height: 630,
            alt: 'LesCordistes.com — Plateforme nationale des travaux en hauteur',
        }],
    },
    twitter: {
        card: 'summary_large_image',
        site: '@lescordistes',
        images: ['https://www.lescordistes.com/lescordistes.com-3.webp'],
    },
    robots: {
        index: true,
        follow: true,
    },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="fr">
            <head>
                {/*
                 * Google Consent Mode v2 — must execute BEFORE gtag.js loads.
                 * Reads stored consent from localStorage so returning visitors
                 * never trigger analytics without prior consent.
                 */}
                <Script id="consent-mode-defaults" strategy="beforeInteractive">
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}

                        var _lc = null;
                        try {
                            var _raw = localStorage.getItem('lc_consent');
                            if (_raw) {
                                var _p = JSON.parse(_raw);
                                if (new Date(_p.expires) > new Date()) { _lc = _p; }
                            }
                        } catch(e) {}

                        // Opt-out model: grant analytics unless user explicitly refused.
                        var _refused = _lc && _lc.analytics === false;
                        gtag('consent', 'default', {
                            analytics_storage:   _refused ? 'denied' : 'granted',
                            ad_storage:          'denied',
                            ad_user_data:        'denied',
                            ad_personalization:  'denied',
                        });
                    `}
                </Script>

                <Script
                    src="https://www.googletagmanager.com/gtag/js?id=G-DRVMQVTQPZ"
                    strategy="afterInteractive"
                />
                <Script id="google-analytics" strategy="afterInteractive">
                    {`
                        gtag('js', new Date());
                        gtag('config', 'G-DRVMQVTQPZ');
                    `}
                </Script>
            </head>
            <body className={`${inter.className} overflow-x-clip`} suppressHydrationWarning>
                <Providers>
                    <div className="flex flex-col min-h-screen w-full">
                        <Header />
                        <main className="flex-grow">
                            {children}
                        </main>
                        <Footer />
                    </div>
                    <ConsentBanner />
                    <SpeedInsights />
                </Providers>
            </body>
        </html>
    )
}
