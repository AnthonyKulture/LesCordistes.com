// PATCH /api/admin/contact-requests/[id]
// Admin only — met à jour le status d'une demande (new → contacted → closed).

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/ops/guard'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    const { id } = await params
    const { status, notes } = (await req.json()) as { status?: string; notes?: string }

    if (status && !['new', 'contacted', 'closed'].includes(status)) {
        return NextResponse.json({ error: 'status invalide' }, { status: 400 })
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const admin = createSupabaseAdminClient() as any

    const update: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
    }
    if (status) {
        update.status = status
        if (status === 'contacted') {
            update.contacted_at = new Date().toISOString()
            update.contacted_by = guard.user.id
        }
    }
    if (typeof notes === 'string') update.notes = notes.slice(0, 1000)

    const { error } = await admin.from('contact_requests').update(update).eq('id', id)
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
}
