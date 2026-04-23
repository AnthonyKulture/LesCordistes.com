import { requireAdmin } from '@/lib/ops/guard'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { logAdminAction } from '@/lib/ops/audit'

export const dynamic = 'force-dynamic'

type Body = {
    delta: number
    description: string
    allow_negative?: boolean
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    const { id } = await params
    const body = (await req.json()) as Body
    const delta = Number(body.delta)
    const description = body.description?.trim()

    if (!Number.isFinite(delta) || delta === 0) {
        return Response.json({ error: 'delta must be a non-zero number' }, { status: 400 })
    }
    if (!description || description.length < 3) {
        return Response.json({ error: 'description required (min 3 chars)' }, { status: 400 })
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const admin = createSupabaseAdminClient() as any

    const { data: profile, error: pErr } = await admin
        .from('profiles')
        .select('id, role, email')
        .eq('id', id)
        .single()
    if (pErr || !profile) return Response.json({ error: 'User not found' }, { status: 404 })
    if (profile.role !== 'pro') {
        return Response.json({ error: 'Credits only apply to pro accounts' }, { status: 400 })
    }

    const { data: existing } = await admin
        .from('credits')
        .select('balance')
        .eq('pro_id', id)
        .maybeSingle()

    const currentBalance = Number(existing?.balance ?? 0)
    const newBalance = currentBalance + delta

    if (newBalance < 0 && !body.allow_negative) {
        return Response.json(
            { error: `Resulting balance would be negative (${newBalance}). Set allow_negative:true to confirm.` },
            { status: 400 }
        )
    }

    const txInsert = await admin.from('credit_transactions').insert({
        pro_id: id,
        type: delta > 0 ? 'purchase' : 'spend',
        amount: delta,
        description: `[admin] ${description}`,
    })
    if (txInsert.error) return Response.json({ error: txInsert.error.message }, { status: 500 })

    if (existing) {
        const { error } = await admin
            .from('credits')
            .update({ balance: newBalance, updated_at: new Date().toISOString() })
            .eq('pro_id', id)
        if (error) return Response.json({ error: error.message }, { status: 500 })
    } else {
        const { error } = await admin.from('credits').insert({ pro_id: id, balance: newBalance })
        if (error) return Response.json({ error: error.message }, { status: 500 })
    }

    await logAdminAction({
        action: 'credits_adjusted',
        target_table: 'credits',
        target_id: id,
        payload: {
            delta,
            description,
            before: currentBalance,
            after: newBalance,
            target_email: profile.email,
        },
        performed_by: guard.user.id,
    })

    return Response.json({ ok: true, balance: newBalance })
}
