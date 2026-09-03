import { requireAdmin } from '@/lib/ops/guard'
import { logAdminAction } from '@/lib/ops/audit'
import { isLifecycleStage } from '@/lib/types/crm'
import { isUuid, respondToOutcome, setContactStage } from '../../contactRpc'

export const dynamic = 'force-dynamic'

type Body = { stage?: unknown }

/**
 * POST /api/ops/contacts/[id]/stage — override manuel du stage.
 *
 * Passe par `admin_set_contact_stage` plutôt que par un UPDATE : la fonction
 * pose l'événement `status_change`, et c'est le trigger sur `contact_events`
 * qui écrit `lifecycle_stage` ET `lifecycle_manual`. Un UPDATE direct depuis
 * ici oublierait `lifecycle_manual` et le prochain recalcul écraserait la
 * décision de l'opérateur.
 *
 * Contrairement aux notes et appels, un changement de stage est une mutation
 * d'état : il est aussi journalisé dans `admin_actions`.
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

    if (!isLifecycleStage(body.stage)) {
        return Response.json({ error: 'invalid_stage' }, { status: 400 })
    }

    const outcome = await setContactStage({
        contactId: id,
        stage: body.stage,
        actor: guard.user.email ?? null,
    })

    if (outcome.status === 'ok') {
        await logAdminAction({
            action: 'contact_stage_set',
            target_table: 'marketing_contacts',
            target_id: id,
            payload: {
                before: outcome.data.previous_stage ?? null,
                after: body.stage,
            },
            performed_by: guard.user.id,
        })
    }

    return respondToOutcome(outcome, {
        stage: body.stage,
        previousStage: outcome.status === 'ok' ? (outcome.data.previous_stage ?? null) : null,
    })
}
