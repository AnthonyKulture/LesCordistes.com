import { requireAdmin } from '@/lib/ops/guard'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { logAdminAction } from '@/lib/ops/audit'

export const dynamic = 'force-dynamic'

const UPDATABLE_PROFILE_FIELDS = new Set([
    'role',
    'first_name',
    'last_name',
    'full_name',
    'phone',
    'bio',
    'company_name',
    'siret',
    'certifications',
    'skills',
    'equipment',
    'intervention_zones',
    'insurance_info',
    'client_type',
])

type Body = {
    action: 'update'
    data?: Record<string, unknown>
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    const { id } = await params
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const admin = createSupabaseAdminClient() as any

    const [profile, credits, transactions, unlocked, jobs] = await Promise.all([
        admin.from('profiles').select('*').eq('id', id).single(),
        admin.from('credits').select('balance, updated_at').eq('pro_id', id).maybeSingle(),
        admin.from('credit_transactions').select('*').eq('pro_id', id).order('created_at', { ascending: false }).limit(50),
        admin.from('unlocked_leads').select('id, job_id, unlocked_at').eq('pro_id', id).order('unlocked_at', { ascending: false }).limit(20),
        admin.from('jobs').select('id, title, status, created_at, location_city').eq('created_by', id).order('created_at', { ascending: false }).limit(20),
    ])

    if (profile.error) return Response.json({ error: 'User not found' }, { status: 404 })

    return Response.json({
        profile: profile.data,
        credits: credits.data ?? { balance: 0, updated_at: null },
        transactions: transactions.data ?? [],
        unlocked_leads: unlocked.data ?? [],
        jobs: jobs.data ?? [],
    })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    const { id } = await params
    const body = (await req.json()) as Body
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const admin = createSupabaseAdminClient() as any

    if (body.action !== 'update') {
        return Response.json({ error: 'Unknown action' }, { status: 400 })
    }

    const cleaned: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(body.data ?? {})) {
        if (UPDATABLE_PROFILE_FIELDS.has(k)) cleaned[k] = v
    }
    if (Object.keys(cleaned).length === 0) {
        return Response.json({ error: 'No allowed fields to update' }, { status: 400 })
    }

    const { error } = await admin.from('profiles').update(cleaned).eq('id', id)
    if (error) return Response.json({ error: error.message }, { status: 500 })

    await logAdminAction({
        action: 'profile_updated',
        target_table: 'profiles',
        target_id: id,
        payload: { fields: Object.keys(cleaned) },
        performed_by: guard.user.id,
    })

    return Response.json({ ok: true })
}
