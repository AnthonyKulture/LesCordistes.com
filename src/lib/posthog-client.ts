import posthog from 'posthog-js'

let initialized = false

export function initPostHog() {
    if (initialized) return
    if (process.env.NODE_ENV === 'development') return
    initialized = true
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: '/ingest',
        ui_host: 'https://eu.posthog.com',
        defaults: '2026-01-30',
        capture_exceptions: true,
        debug: process.env.NODE_ENV === 'development',
    })
}

export function optOutPostHog() {
    if (!initialized) return
    posthog.opt_out_capturing()
}

export function isPostHogInitialized() {
    return initialized
}
