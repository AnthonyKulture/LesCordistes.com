/**
 * Route GET /api/cron/indexnow-sitemap — Push hebdomadaire du sitemap complet
 * vers IndexNow (Bing/Yandex/Naver).
 *
 * Effet : refresh complet de l'indexation Bing une fois par semaine. Garantit
 * que toute URL ajoutée/modifiée depuis le dernier ping est notifiée, même si
 * le hook deploy a échoué ou si une page a été ajoutée hors deploy.
 *
 * Sécurité : header `x-cron-secret` ou `?secret=` = process.env.CRON_SECRET.
 * Schedule : Vercel cron lundi 8h UTC (cf. vercel.json crons).
 *
 * Logique :
 *   1. Importe le générateur sitemap (même source que /sitemap.xml)
 *   2. Extrait toutes les URLs (string)
 *   3. Délègue à /api/indexnow pour le ping (DRY : la logique IndexNow est
 *      centralisée dans une seule route)
 */

import sitemap from '@/app/sitemap'
import { SEO_BASE_URL } from '@/constants/seoConfig'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function checkSecret(req: Request): boolean {
    const expected = process.env.CRON_SECRET
    if (!expected) return false
    // Méthode 1 : header personnalisé `x-cron-secret`
    const headerSecret = req.headers.get('x-cron-secret')
    if (headerSecret === expected) return true
    // Méthode 2 : `Authorization: Bearer <secret>` — format envoyé automatiquement
    // par Vercel Cron si CRON_SECRET est défini comme env var
    const auth = req.headers.get('authorization')
    if (auth && auth.startsWith('Bearer ') && auth.slice(7) === expected) return true
    // Méthode 3 : query string `?secret=` (debug local et tests manuels)
    const url = new URL(req.url)
    const querySecret = url.searchParams.get('secret')
    return querySecret === expected
}

export async function GET(req: Request) {
    if (!checkSecret(req)) {
        return Response.json({ error: 'unauthorized' }, { status: 401 })
    }

    // Génère la liste d'URLs depuis la même source que /sitemap.xml
    const entries = sitemap()
    const urls = entries.map((e) => e.url)

    if (urls.length === 0) {
        return Response.json({ error: 'sitemap empty' }, { status: 500 })
    }

    // Délègue à /api/indexnow (réutilisation logique + même secret)
    const indexnowUrl = `${SEO_BASE_URL}/api/indexnow`
    const res = await fetch(indexnowUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-cron-secret': process.env.CRON_SECRET ?? '',
        },
        body: JSON.stringify({ urls }),
    })

    const result = await res.json().catch(() => ({}))

    return Response.json({
        ok: res.ok,
        sitemapEntries: urls.length,
        indexnowResponse: result,
    }, { status: res.status })
}
