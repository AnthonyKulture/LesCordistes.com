import { requireAdmin } from '@/lib/ops/guard'
import { isManualEventKind } from '@/lib/types/crm'
import { addContactEvent, isUuid, respondToOutcome } from '../../contactRpc'

export const dynamic = 'force-dynamic'

const TITLE_MAX = 200
const DETAIL_MAX = 4000

type Body = {
    kind?: unknown
    title?: unknown
    detail?: unknown
}

/**
 * POST /api/ops/contacts/[id]/events — ajoute un événement manuel au journal.
 *
 * C'est le point d'entrée de la doctrine « aucune action de contact ne quitte
 * l'outil sans laisser de trace » : la fiche appelle cette route au moment même
 * où l'opérateur clique sur Appeler ou Email, pas dans un second temps.
 *
 * La liste blanche des `kind` est doublée côté base (admin_add_contact_event
 * refuse tout ce qui n'est pas note/call/email_sent/meeting) — on valide ici
 * pour rendre un 400 lisible, pas pour se substituer à elle.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    const { id } = await params
    if (!isUuid(id)) {
        return Response.json({ error: 'invalid_contact_id' }, { status: 400 })
    }

    let body: Body
    try {
        body = (await req.json()) as Body
    } catch {
        return Response.json({ error: 'invalid_json' }, { status: 400 })
    }

    if (!isManualEventKind(body.kind)) {
        return Response.json({ error: 'invalid_kind' }, { status: 400 })
    }

    const title = typeof body.title === 'string' ? body.title.trim() : ''
    if (title.length === 0 || title.length > TITLE_MAX) {
        return Response.json({ error: 'invalid_title' }, { status: 400 })
    }

    const rawDetail = typeof body.detail === 'string' ? body.detail.trim() : ''
    if (rawDetail.length > DETAIL_MAX) {
        return Response.json({ error: 'detail_too_long' }, { status: 400 })
    }

    const outcome = await addContactEvent({
        contactId: id,
        kind: body.kind,
        title,
        detail: rawDetail.length > 0 ? rawDetail : null,
        actor: guard.user.email ?? null,
    })

    // Pas de logAdminAction ici : `contact_events` EST le journal, et il porte
    // déjà l'auteur. Doubler chaque note dans admin_actions noierait la piste
    // d'audit des actions sensibles sous le volume du suivi commercial.
    return respondToOutcome(outcome, {
        eventId: outcome.status === 'ok' ? (outcome.data.event_id ?? null) : null,
    })
}
