/**
 * Accès aux deux RPC d'écriture du CRM contact (migration 20260902a).
 *
 * Pendant du `fetchContacts.ts` du socle, côté écriture. Trois raisons d'exister
 * plutôt que d'appeler `.rpc()` en direct dans chaque route :
 *
 *  1. `admin_add_contact_event` et `admin_set_contact_stage` ne lèvent PAS
 *     d'exception sur une entrée invalide : elles renvoient un jsonb
 *     `{ ok: false, error: '…' }`. Une route qui ignorerait ce contenu
 *     répondrait 200 sur un échec.
 *  2. Le code doit tourner AVANT et APRÈS l'application de la migration :
 *     PGRST202 (PostgREST ne connaît pas la fonction) et 42883 (Postgres non
 *     plus) se traduisent en 503 explicite, jamais en 500 opaque.
 *  3. Les fonctions n'existent pas dans `database.types.ts` (fichier généré) :
 *     `.rpc()` typé les rejetterait. On restreint la surface au strict
 *     nécessaire au lieu de caster le client entier en `any`.
 *
 * ⚠️ Module serveur uniquement (il tire le client service_role).
 */

import { createSupabaseAdminClient } from '@/lib/supabase-server'

const MIGRATION = '20260902a-contact-socle'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUuid(value: string): boolean {
    return UUID_RE.test(value)
}

type RpcError = { code?: string; message?: string } | null

type RpcClient = {
    rpc: (
        fn: string,
        args: Record<string, unknown>
    ) => PromiseLike<{ data: unknown; error: RpcError }>
}

export type RpcOutcome =
    | { status: 'ok'; data: Record<string, unknown> }
    /** Refus métier renvoyé par la fonction elle-même (jsonb ok:false). */
    | { status: 'rejected'; reason: string }
    /** Migration non appliquée — la route doit répondre 503, pas 500. */
    | { status: 'unavailable' }
    | { status: 'error'; message: string }

function isMissingFunction(error: RpcError): boolean {
    return error?.code === 'PGRST202' || error?.code === '42883'
}

async function callRpc(fn: string, args: Record<string, unknown>): Promise<RpcOutcome> {
    const client = createSupabaseAdminClient() as unknown as RpcClient
    const { data, error } = await client.rpc(fn, args)

    if (error) {
        if (isMissingFunction(error)) {
            console.warn(
                `[contactRpc] ${fn} indisponible — migration ${MIGRATION} à appliquer :`,
                error.message ?? 'fonction absente'
            )
            return { status: 'unavailable' }
        }
        console.error(`[contactRpc] ${fn} a échoué :`, error.message ?? 'réponse vide')
        return { status: 'error', message: error.message ?? 'RPC error' }
    }

    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        return { status: 'error', message: 'Réponse RPC inattendue' }
    }

    const record = data as Record<string, unknown>
    if (record.ok !== true) {
        return {
            status: 'rejected',
            reason: typeof record.error === 'string' ? record.error : 'unknown',
        }
    }

    return { status: 'ok', data: record }
}

export function addContactEvent(input: {
    contactId: string
    kind: string
    title: string
    detail: string | null
    actor: string | null
}): Promise<RpcOutcome> {
    return callRpc('admin_add_contact_event', {
        p_contact_id: input.contactId,
        p_kind: input.kind,
        p_title: input.title,
        p_detail: input.detail,
        p_actor: input.actor,
    })
}

export function setContactStage(input: {
    contactId: string
    stage: string
    actor: string | null
}): Promise<RpcOutcome> {
    return callRpc('admin_set_contact_stage', {
        p_contact_id: input.contactId,
        p_stage: input.stage,
        p_actor: input.actor,
    })
}

/** Traduction unique refus RPC → réponse HTTP, partagée par les deux routes. */
export function respondToOutcome(outcome: RpcOutcome, payload: Record<string, unknown>): Response {
    const headers = { 'Cache-Control': 'private, no-store' }

    switch (outcome.status) {
        case 'ok':
            return Response.json({ ok: true, ...payload }, { headers })
        case 'rejected':
            return Response.json(
                { error: outcome.reason },
                { status: outcome.reason === 'contact_not_found' ? 404 : 400, headers }
            )
        case 'unavailable':
            return Response.json(
                { error: `CRM indisponible — migration ${MIGRATION} non appliquée.` },
                { status: 503, headers }
            )
        default:
            return Response.json({ error: outcome.message }, { status: 500, headers })
    }
}
