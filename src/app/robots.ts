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
                    '/pro/',
                ],
            },
        ],
        sitemap: 'https://www.lescordistes.com/sitemap.xml',
    }
}
