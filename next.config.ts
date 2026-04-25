import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
    env: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? '',
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? process.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '',
        NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? process.env.VITE_MAPBOX_ACCESS_TOKEN ?? '',
    },
    outputFileTracingRoot: path.join(__dirname),
    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: true },
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '*.supabase.co' },
            { protocol: 'https', hostname: 'www.transparenttextures.com' },
        ],
    },
    async rewrites() {
        return [
            {
                source: '/ingest/static/:path*',
                destination: 'https://eu-assets.i.posthog.com/static/:path*',
            },
            {
                source: '/ingest/:path*',
                destination: 'https://eu.i.posthog.com/:path*',
            },
        ]
    },
    async redirects() {
        return [
            // Canonical host : forcer www en un seul saut (à compléter par le réglage
            // de domaine Vercel pour collapse HTTP→HTTPS+www en un seul edge redirect).
            {
                source: '/:path*',
                has: [{ type: 'host', value: 'lescordistes.com' }],
                destination: 'https://www.lescordistes.com/:path*',
                permanent: true,
            },
            // Redirections depuis l'ancien site WordPress
            { source: '/trouver-des-missions-de-cordiste', destination: '/jobs', permanent: true },
            { source: '/trouver-des-missions-de-cordiste/', destination: '/jobs', permanent: true },
            { source: '/rechercher-des-cordistes', destination: '/post-job', permanent: true },
            { source: '/rechercher-des-cordistes/', destination: '/post-job', permanent: true },
            { source: '/inscription-professionnel', destination: '/inscription-cordiste', permanent: true },
            { source: '/inscription-professionnel/', destination: '/inscription-cordiste', permanent: true },
            { source: '/login', destination: '/connexion', permanent: true },
            { source: '/login/', destination: '/connexion', permanent: true },
            { source: '/account', destination: '/dashboard', permanent: true },
            { source: '/account/', destination: '/dashboard', permanent: true },
            { source: '/mon-compte', destination: '/dashboard', permanent: true },
            { source: '/mon-compte/', destination: '/dashboard', permanent: true },
            { source: '/missions-en-cours', destination: '/jobs', permanent: true },
            { source: '/missions-en-cours/', destination: '/jobs', permanent: true },
            { source: '/boutique', destination: '/credits', permanent: true },
            { source: '/boutique/', destination: '/credits', permanent: true },
            { source: '/panier', destination: '/credits', permanent: true },
            { source: '/panier/', destination: '/credits', permanent: true },
            { source: '/commander', destination: '/credits', permanent: true },
            { source: '/commander/', destination: '/credits', permanent: true },
            { source: '/thank-you', destination: '/job-success', permanent: true },
            { source: '/thank-you/', destination: '/job-success', permanent: true },
            { source: '/conditions-generales-dutilisation-et-de-vente', destination: '/cgu', permanent: true },
            { source: '/conditions-generales-dutilisation-et-de-vente/', destination: '/cgu', permanent: true },
            { source: '/histoire-lescordistes', destination: '/', permanent: true },
            { source: '/histoire-lescordistes/', destination: '/', permanent: true },
            { source: '/content-restricted', destination: '/', permanent: true },
            { source: '/register', destination: '/inscription', permanent: true },
        ]
    },
    async headers() {
        // CSP en report-only : observer 1-2 semaines puis migrer vers Content-Security-Policy enforcé.
        const csp = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com https://*.posthog.com https://eu-assets.i.posthog.com https://va.vercel-scripts.com https://maps.googleapis.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: blob: https: https://*.supabase.co https://www.googletagmanager.com https://www.google-analytics.com https://maps.googleapis.com https://maps.gstatic.com",
            "font-src 'self' data: https://fonts.gstatic.com",
            "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://eu.i.posthog.com https://eu-assets.i.posthog.com https://www.google-analytics.com https://*.googletagmanager.com https://api-adresse.data.gouv.fr https://*.vercel-insights.com",
            "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://maps.google.com https://www.google.com",
            "media-src 'self' https://*.supabase.co",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
            // Note: 'upgrade-insecure-requests' est ignoré en report-only
            // → à ré-ajouter quand on basculera en CSP enforcé.
        ].join('; ')

        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'Content-Security-Policy-Report-Only', value: csp },
                ],
            },
        ]
    },
}

export default nextConfig
