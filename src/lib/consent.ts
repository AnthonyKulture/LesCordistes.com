export interface ConsentState {
    version: string
    timestamp: string
    expires: string
    analytics: boolean
}

const CONSENT_KEY = 'lc_consent'
const CONSENT_VERSION = '1'
const EXPIRES_DAYS = 180

export function getConsent(): ConsentState | null {
    if (typeof window === 'undefined') return null
    try {
        const raw = localStorage.getItem(CONSENT_KEY)
        if (!raw) return null
        const parsed: ConsentState = JSON.parse(raw)
        if (new Date(parsed.expires) < new Date()) {
            localStorage.removeItem(CONSENT_KEY)
            return null
        }
        return parsed
    } catch {
        return null
    }
}

export function setConsent(analytics: boolean): ConsentState {
    const now = new Date()
    const expires = new Date(now.getTime() + EXPIRES_DAYS * 24 * 60 * 60 * 1000)
    const state: ConsentState = {
        version: CONSENT_VERSION,
        timestamp: now.toISOString(),
        expires: expires.toISOString(),
        analytics,
    }
    localStorage.setItem(CONSENT_KEY, JSON.stringify(state))
    return state
}

export function hasConsent(): boolean {
    return getConsent() !== null
}

export function analyticsConsented(): boolean {
    return getConsent()?.analytics === true
}

export function applyGtagConsent(analytics: boolean) {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
    window.gtag('consent', 'update', {
        analytics_storage: analytics ? 'granted' : 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
    })
}
