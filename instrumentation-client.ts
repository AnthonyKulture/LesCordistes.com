import { initPostHog } from '@/lib/posthog-client'

// Opt-out model: analytics run by default unless the user has explicitly refused.
// Legal basis: legitimate interest for audience measurement (ePrivacy / GDPR Art. 6-1-f).
try {
    const raw = localStorage.getItem('lc_consent')
    if (raw) {
        const parsed = JSON.parse(raw)
        const expired = new Date(parsed.expires) < new Date()
        if (!expired && parsed.analytics === false) {
            // Explicit refusal stored — do not init
        } else if (!expired && parsed.analytics === true) {
            initPostHog()
        } else {
            // Expired or malformed — treat as no consent → init (opt-out model)
            initPostHog()
        }
    } else {
        // First visit, no choice made yet → init (opt-out model)
        initPostHog()
    }
} catch {
    // localStorage unavailable — init as safe fallback
    initPostHog()
}
