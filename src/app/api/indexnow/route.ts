/**
 * Route POST /api/indexnow — Push d'URLs vers IndexNow (protocole Bing/Yandex/Naver).
 *
 * Effet : notifie immédiatement les moteurs participants qu'une ou plusieurs
 * URLs sont nouvelles ou modifiées. Indexation en 24-48 h au lieu de plusieurs
 * semaines via crawl naturel.
 *
 * Sécurité : header `x-cron-secret` ou `?secret=` = process.env.CRON_SECRET.
 * Pas d'auth utilisateur (route serveur uniquement, jamais appelée client-side).
 *
 * Usage :
 *   curl -X POST -H "x-cron-secret: $CRON_SECRET" \
 *     -H "Content-Type: application/json" \
 *     -d '{"urls":["https://www.lescordistes.com/cordiste-paris"]}' \
 *     https://www.lescordistes.com/api/indexnow
 *
 * Limites IndexNow :
 *   - 10 000 URLs max par requête (on chunke si dépassé)
 *   - Toutes les URLs doivent appartenir au domaine déclaré dans la clé
 *   - Réponse HTTP 200/202 = succès, 400/403/422 = erreur (clé invalide, etc.)
 *
 * Doc : https://www.indexnow.org/documentation
 */

import { SEO_BASE_URL } from '@/constants/seoConfig'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const INDEXNOW_KEY = 'c6ec276663dc1d163620ecb9cb16d9b6'
const INDEXNOW_HOST = 'www.lescordistes.com'
const INDEXNOW_KEY_LOCATION = `${SEO_BASE_URL}/${INDEXNOW_KEY}.txt`
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/IndexNow'
const MAX_URLS_PER_REQUEST = 10_000

interface IndexNowPayload {
    host: string
    key: string
    keyLocation: string
    urlList: string[]
}

function chunk<T>(arr: T[], size: number): T[][] {
    const out: T[][] = []
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
    return out
}

function isValidUrl(u: string): boolean {
    try {
        const url = new URL(u)
        return url.host === INDEXNOW_HOST && (url.protocol === 'https:' || url.protocol === 'http:')
    } catch {
        return false
    }
}

async function pingIndexNow(urls: string[]): Promise<{ status: number; ok: boolean }> {
    const payload: IndexNowPayload = {
        host: INDEXNOW_HOST,
        key: INDEXNOW_KEY,
        keyLocation: INDEXNOW_KEY_LOCATION,
        urlList: urls,
    }
    const res = await fetch(INDEXNOW_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Host': 'api.indexnow.org',
        },
        body: JSON.stringify(payload),
    })
    return { status: res.status, ok: res.status >= 200 && res.status < 300 }
}

function checkSecret(req: Request): boolean {
    const expected = process.env.CRON_SECRET
    if (!expected) return false
    const headerSecret = req.headers.get('x-cron-secret')
    if (headerSecret === expected) return true
    const auth = req.headers.get('authorization')
    if (auth && auth.startsWith('Bearer ') && auth.slice(7) === expected) return true
    const url = new URL(req.url)
    const querySecret = url.searchParams.get('secret')
    return querySecret === expected
}

export async function POST(req: Request) {
    if (!checkSecret(req)) {
        return Response.json({ error: 'unauthorized' }, { status: 401 })
    }

    let body: { urls?: unknown }
    try {
        body = await req.json()
    } catch {
        return Response.json({ error: 'invalid json body' }, { status: 400 })
    }

    if (!Array.isArray(body.urls)) {
        return Response.json({ error: 'urls must be an array of strings' }, { status: 400 })
    }

    const allUrls = body.urls.filter((u): u is string => typeof u === 'string')
    const validUrls = [...new Set(allUrls.filter(isValidUrl))]
    const rejected = allUrls.length - validUrls.length

    if (validUrls.length === 0) {
        return Response.json({ error: 'no valid urls', rejected }, { status: 400 })
    }

    const batches = chunk(validUrls, MAX_URLS_PER_REQUEST)
    const results: Array<{ batch: number; size: number; status: number; ok: boolean }> = []
    let pushed = 0

    for (const [i, batch] of batches.entries()) {
        try {
            const r = await pingIndexNow(batch)
            results.push({ batch: i + 1, size: batch.length, status: r.status, ok: r.ok })
            if (r.ok) pushed += batch.length
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err)
            results.push({ batch: i + 1, size: batch.length, status: 0, ok: false })
            console.error(`[indexnow] batch ${i + 1} failed:`, msg)
        }
    }

    return Response.json({
        ok: results.every((r) => r.ok),
        submitted: validUrls.length,
        pushed,
        rejected,
        batches: results,
    })
}

export async function GET(req: Request) {
    // GET = simple health check + meta info (utile pour vérifier la conf en prod)
    if (!checkSecret(req)) {
        return Response.json({ error: 'unauthorized' }, { status: 401 })
    }
    return Response.json({
        ok: true,
        endpoint: INDEXNOW_ENDPOINT,
        host: INDEXNOW_HOST,
        key: INDEXNOW_KEY,
        keyLocation: INDEXNOW_KEY_LOCATION,
        maxUrlsPerRequest: MAX_URLS_PER_REQUEST,
    })
}
