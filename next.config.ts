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
    async redirects() {
        return [
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
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
                ],
            },
        ]
    },
}

export default nextConfig
