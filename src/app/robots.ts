import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/dashboard/',
                    '/admin/',
                    '/profile/',
                    '/messages/',
                    '/notifications/',
                    '/api/',
                    '/auth/',
                    '/credits/',
                    '/connexion/',
                    // ⚠️ NE JAMAIS raccourcir en '/pro' : /pros/{id} est indexable
                    // et listé au sitemap. Le matching robots.txt est un préfixe
                    // littéral, '/pro/' ne bloque donc PAS '/pros/…' — mais '/pro'
                    // les désindexerait tous. Cette règle vise /pro/widget.
                    '/pro/',
                ],
            },
        ],
        sitemap: 'https://www.lescordistes.com/sitemap.xml',
    }
}
