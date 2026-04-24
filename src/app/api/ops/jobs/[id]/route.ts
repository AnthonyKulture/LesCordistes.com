import { requireAdmin } from '@/lib/ops/guard'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { logAdminAction } from '@/lib/ops/audit'
import { sendTelegram, escapeHtml } from '@/lib/ops/telegram'

export const dynamic = 'force-dynamic'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.lescordistes.com'

// Champs scalaires modifiables par l'admin via `action: 'update'`.
// Volontairement exclus : id, created_at, updated_at, created_by,
// moderated_by, moderated_at, status (transitions via approve/reject/archive),
// photos_url (géré via l'endpoint dédié /photos).
const UPDATABLE_FIELDS = new Set([
    // Basiques
    'title',
    'slug',
    'description',
    'category',
    'type',
    'client_type',
    'credit_cost',
    'rejection_reason',
    // Localisation
    'location_city',
    'location_address',
    'location_department',
    'latitude',
    'longitude',
    // Budget & durée
    'budget_min',
    'budget_max',
    'daily_rate',
    'duration_days',
    'height_meters',
    // Dates
    'deadline',
    'start_date',
    // Technique / B2B
    'internal_reference',
    'structure_type',
    'specific_equipment',
    'equipment_management',
    'contract_type',
    'work_night_weekend',
    'security_plan_confirmed',
    // Arrays
    'required_level',
    'required_habilitations',
    'secondary_trades',
    // JSONB
    'client_contact_info',
])

type JobAction = 'approve' | 'reject' | 'update' | 'archive'

type Body = {
    action: JobAction
    data?: Record<string, unknown>
    reason?: string
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    const { id } = await params
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const admin = createSupabaseAdminClient() as any

    const { data: job, error } = await admin.from('jobs').select('*').eq('id', id).single()
    if (error) return Response.json({ error: error.message }, { status: 404 })

    return Response.json({ job })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    const { id } = await params
    const body = (await req.json()) as Body
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const admin = createSupabaseAdminClient() as any

    const { data: existing, error: fetchErr } = await admin.from('jobs').select('id, status, title').eq('id', id).single()
    if (fetchErr || !existing) return Response.json({ error: 'Job not found' }, { status: 404 })

    const now = new Date().toISOString()

    if (body.action === 'approve') {
        const { error } = await admin
            .from('jobs')
            .update({ status: 'live', moderated_at: now, moderated_by: guard.user.id, rejection_reason: null })
            .eq('id', id)
        if (error) return Response.json({ error: error.message }, { status: 500 })

        await logAdminAction({
            action: 'job_approved',
            target_table: 'jobs',
            target_id: id,
            payload: { before: existing.status, after: 'live' },
            performed_by: guard.user.id,
        })

        sendTelegram(
            `<b>✅ Mission approuvée</b>\n${escapeHtml(existing.title)}\n${SITE_URL}/admin/missions/${id}`
        ).catch(() => {})

        return Response.json({ ok: true, status: 'live' })
    }

    if (body.action === 'reject') {
        const reason = body.reason?.trim()
        if (!reason) return Response.json({ error: 'rejection_reason required' }, { status: 400 })

        const { error } = await admin
            .from('jobs')
            .update({ status: 'rejected', moderated_at: now, moderated_by: guard.user.id, rejection_reason: reason })
            .eq('id', id)
        if (error) return Response.json({ error: error.message }, { status: 500 })

        await logAdminAction({
            action: 'job_rejected',
            target_table: 'jobs',
            target_id: id,
            payload: { before: existing.status, after: 'rejected', reason },
            performed_by: guard.user.id,
        })

        sendTelegram(
            `<b>❌ Mission rejetée</b>\n${escapeHtml(existing.title)}\nMotif : ${escapeHtml(reason)}`
        ).catch(() => {})

        return Response.json({ ok: true, status: 'rejected' })
    }

    if (body.action === 'archive') {
        const { error } = await admin.from('jobs').update({ status: 'cancelled' }).eq('id', id)
        if (error) return Response.json({ error: error.message }, { status: 500 })

        await logAdminAction({
            action: 'job_archived',
            target_table: 'jobs',
            target_id: id,
            payload: { before: existing.status, after: 'cancelled' },
            performed_by: guard.user.id,
        })
        return Response.json({ ok: true, status: 'cancelled' })
    }

    if (body.action === 'update') {
        const data = body.data ?? {}
        const cleaned: Record<string, unknown> = {}
        for (const [k, v] of Object.entries(data)) {
            if (!UPDATABLE_FIELDS.has(k)) continue
            // Normalisation : "" → null pour les scalaires nullable,
            // conserve les arrays et objets tels quels.
            if (v === '' && k !== 'title' && k !== 'description' && k !== 'category' && k !== 'location_city') {
                cleaned[k] = null
            } else {
                cleaned[k] = v
            }
        }
        if (Object.keys(cleaned).length === 0) {
            return Response.json({ error: 'No allowed fields to update' }, { status: 400 })
        }

        const { error } = await admin.from('jobs').update(cleaned).eq('id', id)
        if (error) return Response.json({ error: error.message }, { status: 500 })

        await logAdminAction({
            action: 'job_updated',
            target_table: 'jobs',
            target_id: id,
            payload: { fields: Object.keys(cleaned), values: cleaned },
            performed_by: guard.user.id,
        })

        return Response.json({ ok: true })
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 })
}
