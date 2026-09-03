import { requireAdmin } from '@/lib/ops/guard'
import { fetchContacts } from '@/lib/ops/fetchContacts'
import { isContactAudience, isLifecycleStage } from '@/lib/types/crm'

export const dynamic = 'force-dynamic'

/**
 * Face HTTP de `fetchContacts` — sert les rafraîchissements de la liste après
 * une mutation, et les rechargements TanStack Query.
 *
 * `available: false` distingue « migration 20260902a non appliquée » de
 * « aucun contact ». La liste affiche deux états vides très différents ; les
 * confondre ferait passer une migration oubliée pour une base vide.
 */
export async function GET(req: Request) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    const params = new URL(req.url).searchParams
    const rawStage = params.get('stage')
    const rawAudience = params.get('audience')
    const rawHasAccount = params.get('hasAccount')
    const rawLimit = Number(params.get('limit'))

    const contacts = await fetchContacts({
        q: params.get('q') ?? undefined,
        stage: isLifecycleStage(rawStage) ? rawStage : undefined,
        audience: isContactAudience(rawAudience) ? rawAudience : undefined,
        hasAccount:
            rawHasAccount === 'true' ? true : rawHasAccount === 'false' ? false : undefined,
        source: params.get('source') ?? undefined,
        limit: Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : undefined,
    })

    // Données admin authentifiées : jamais de cache partagé (edge/CDN).
    return Response.json(
        { contacts: contacts ?? [], available: contacts !== null },
        { headers: { 'Cache-Control': 'private, no-store' } }
    )
}
