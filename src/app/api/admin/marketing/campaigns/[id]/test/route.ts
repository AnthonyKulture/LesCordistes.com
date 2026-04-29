import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/ops/guard'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { sendMarketingEmail } from '@/lib/marketing/sendMarketingEmail'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    const { id } = await params
    let body: any
    try {
        body = await req.json()
    } catch {
        return Response.json({ error: 'invalid_json' }, { status: 400 })
    }

    // Accepte soit "to" (string, single ou CSV), soit "tos" (array de strings).
    const rawTo = body?.to ?? body?.tos ?? ''
    const candidates: string[] = Array.isArray(rawTo)
        ? rawTo.map(String)
        : String(rawTo)
              .split(/[,;\n]/)
              .map(s => s.trim())
              .filter(Boolean)
    const tos = Array.from(
        new Set(candidates.map(s => s.toLowerCase()).filter(s => EMAIL_RE.test(s)))
    )
    if (tos.length === 0) {
        return Response.json({ error: 'invalid_email' }, { status: 400 })
    }
    if (tos.length > 10) {
        return Response.json({ error: 'too_many_recipients', max: 10 }, { status: 400 })
    }

    const admin = createSupabaseAdminClient() as any
    const { data: campaign } = await admin
        .from('marketing_campaigns')
        .select('id, name, subject, preview_text, template_key, template_data')
        .eq('id', id)
        .single()
    if (!campaign) return Response.json({ error: 'not_found' }, { status: 404 })

    const { data: tpl } = await admin
        .from('marketing_email_templates')
        .select('edge_template_id')
        .eq('template_key', campaign.template_key)
        .single()
    if (!tpl) return Response.json({ error: 'template_not_found' }, { status: 400 })

    const results = await Promise.all(
        tos.map(addr =>
            sendMarketingEmail({
                to: addr,
                subject: `[TEST] ${campaign.subject}`,
                previewText: campaign.preview_text,
                edgeTemplateId: tpl.edge_template_id,
                templateData: { ...(campaign.template_data ?? {}), campaignName: campaign.name },
                campaignId: 'TEST',
                isTest: true,
                performedBy: guard.user.id,
            }).then(r => ({ to: addr, ...r }))
        )
    )

    const sent = results.filter(r => r.ok).length
    const failed = results.length - sent
    return Response.json({
        ok: failed === 0,
        sent,
        failed,
        results: results.map(r => ({
            to: r.to,
            ok: r.ok,
            error: r.error ?? null,
            skipReason: r.skipReason ?? null,
            resendId: r.resendId ?? null,
        })),
    })
}
