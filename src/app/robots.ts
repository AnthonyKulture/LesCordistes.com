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
                ],
            },
        ],
        sitemap: 'https://lescordistes.com/sitemap.xml',
    }
}
