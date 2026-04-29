import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/ops/guard'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function GET(req: NextRequest) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    const url = new URL(req.url)
    const segmentId = url.searchParams.get('preview')

    const admin = createSupabaseAdminClient() as any

    if (segmentId) {
        const { data, error } = await admin.rpc('resolve_segment_contacts', {
            p_segment_id: segmentId,
        })
        if (error) {
            return Response.json({ error: error.message }, { status: 500 })
        }
        const contacts = (data ?? []) as Array<{
            contact_id: string
            email: string
            first_name: string | null
            last_name: string | null
            audience_type: string
        }>
        return Response.json({
            count: contacts.length,
            sample: contacts.slice(0, 5).map(c => ({
                email: c.email,
                first_name: c.first_name,
                audience_type: c.audience_type,
            })),
        })
    }

    const { data, error } = await admin
        .from('marketing_segments')
        .select('*')
        .order('is_system', { ascending: false })
        .order('name', { ascending: true })

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ segments: data ?? [] })
}
