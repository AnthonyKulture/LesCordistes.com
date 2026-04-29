// Toggle du flag `is_test_recipient` (metadata jsonb) sur un contact marketing.
// Utilisé pour cibler le segment "Comptes test" sans toucher aux opt-in.

import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/ops/guard'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { logAdminAction } from '@/lib/ops/audit'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* eslint-disable @typescript-eslint/no-explicit-any */

interface ContactRow {
    id: string
    email: string
    first_name: string | null
    audience_type: string
    marketing_opt_in: boolean
    unsubscribed_at: string | null
    metadata: Record<string, unknown> | null
}

export async function GET(_req: NextRequest) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    const admin = createSupabaseAdminClient() as any
    const { data, error } = await admin
        .from('marketing_contacts')
        .select('id, email, first_name, audience_type, marketing_opt_in, unsubscribed_at, metadata')
        .eq('metadata->>is_test_recipient', 'true')
        .order('created_at', { ascending: false })

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ contacts: (data ?? []) as ContactRow[] })
}

export async function POST(req: NextRequest) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    let body: any
    try {
        body = await req.json()
    } catch {
        return Response.json({ error: 'invalid_json' }, { status: 400 })
    }

    const email = String(body?.email ?? '').trim().toLowerCase()
    const flag = body?.is_test === false ? false : true

    if (!EMAIL_RE.test(email)) {
        return Response.json({ error: 'invalid_email' }, { status: 400 })
    }

    const admin = createSupabaseAdminClient() as any

    // Trouver le contact (case-insensitive). On utilise ilike pour match lower(email).
    const { data: contact } = await admin
        .from('marketing_contacts')
        .select('id, email, metadata')
        .ilike('email', email)
        .maybeSingle()

    if (!contact) {
        return Response.json(
            {
                error: 'contact_not_found',
                hint: "Synchronise marketing_contacts (bouton 'Sync contacts'), ou vérifie que l'email existe dans profiles.",
            },
            { status: 404 }
        )
    }

    const currentMetadata = (contact.metadata as Record<string, unknown> | null) ?? {}
    const nextMetadata = flag
        ? { ...currentMetadata, is_test_recipient: 'true' }
        : Object.fromEntries(
              Object.entries(currentMetadata).filter(([k]) => k !== 'is_test_recipient')
          )

    const { error } = await admin
        .from('marketing_contacts')
        .update({ metadata: nextMetadata })
        .eq('id', contact.id)

    if (error) return Response.json({ error: error.message }, { status: 500 })

    await logAdminAction({
        action: flag ? 'marketing_contact_test_flag_set' : 'marketing_contact_test_flag_cleared',
        target_table: 'marketing_contacts',
        target_id: contact.id,
        payload: { email },
        performed_by: guard.user.id,
    })

    return Response.json({ ok: true, email, is_test: flag })
}
