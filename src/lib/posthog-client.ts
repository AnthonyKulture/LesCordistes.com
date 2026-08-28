let initialized = false
let initPromise: Promise<void> | null = null
// L'init étant désormais asynchrone (2 chunks), un « Refuser » cliqué pendant
// le chargement doit rester effectif : on mémorise l'intention et on l'applique
// dès que posthog est prêt.
let optOutRequested = false

// `posthog-js` (~50-60 Ko gz) est chargé dynamiquement : ce module est référencé
// par Providers.tsx ET ConsentBanner.tsx, tous deux montés dans le layout racine.
// Un import statique le ferait entrer dans le First Load JS de toutes les pages.
export function initPostHog(): Promise<void> {
  if (initPromise) return initPromise
  if (process.env.NODE_ENV === 'development') return Promise.resolve()

  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
  if (!token) {
    console.error('[PostHog] Missing NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN')
    return Promise.resolve()
  }

  initPromise = import('posthog-js')
    .then(({ default: posthog }) => {
      posthog.init(token, {
        api_host: '/ingest',
        ui_host: 'https://eu.posthog.com',
        defaults: '2026-01-30',
        capture_exceptions: true,
        debug: false,
      })
      initialized = true
      if (optOutRequested) posthog.opt_out_capturing()
    })
    .catch((err) => {
      initPromise = null
      console.error('[PostHog] Failed to load posthog-js', err)
    })

  return initPromise
}

export async function optOutPostHog(): Promise<void> {
  optOutRequested = true
  if (!initPromise) return
  await initPromise
  if (!initialized) return
  const { default: posthog } = await import('posthog-js')
  posthog.opt_out_capturing()
}

export function isPostHogInitialized() {
  return initialized
}
