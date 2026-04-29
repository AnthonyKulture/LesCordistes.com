import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/ops/guard'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function GET(_req: NextRequest) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    const admin = createSupabaseAdminClient() as any

    const { data, error } = await admin
        .from('marketing_email_templates')
        .select('*')
        .eq('is_active', true)
        .order('audience_type', { ascending: true })
        .order('name', { ascending: true })

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ templates: data ?? [] })
}
