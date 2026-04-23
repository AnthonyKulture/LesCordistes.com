// Deux usages :
// - GET  : déclenche le briefing matinal Telegram (cron Vercel ou appel manuel admin)
//   protégé par CRON_SECRET (header x-cron-secret) OU par session admin.
// - POST : envoie un message Telegram ad-hoc depuis l'UI (admin only).

import { requireAdmin } from '@/lib/ops/guard'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { sendTelegram, escapeHtml } from '@/lib/ops/telegram'

export const dynamic = 'force-dynamic'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.lescordistes.com'

function isoDaysAgo(n: number) {
    const d = new Date()
    d.setDate(d.getDate() - n)
    return d.toISOString()
}

async function buildMorningBriefing(): Promise<string> {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const admin = createSupabaseAdminClient() as any
    const weekAgo = isoDaysAgo(7)
    const monthAgo = isoDaysAgo(30)

    const [pending, newPros, purchases, leadsWeek, topCitiesQ] = await Promise.all([
        admin.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        admin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'pro').gte('created_at', weekAgo),
        admin.from('credit_transactions').select('amount').eq('type', 'purchase').gte('created_at', monthAgo),
        admin.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
        admin.from('jobs').select('location_city').eq('status', 'live').not('location_city', 'is', null).limit(500),
    ])

    const soldThisMonth = (purchases.data ?? []).reduce((acc: number, t: any) => acc + Math.abs(Number(t.amount) || 0), 0)

    const cityCounts = new Map<string, number>()
    for (const r of (topCitiesQ.data ?? []) as Array<{ location_city: string | null }>) {
        const c = (r.location_city ?? '').trim()
        if (!c) continue
        cityCounts.set(c, (cityCounts.get(c) ?? 0) + 1)
    }
    const topCity = Array.from(cityCounts.entries()).sort((a, b) => b[1] - a[1])[0]

    return [
        '☀️ <b>Bonjour Anthony</b>',
        '',
        `📋 Missions en attente : <b>${pending.count ?? 0}</b>`,
        `👷 Nouveaux pros cette semaine : <b>${newPros.count ?? 0}</b>`,
        `💳 Crédits vendus sur 30 j : <b>${soldThisMonth}</b>`,
        `📨 Leads funnel sur 7 j : <b>${leadsWeek.count ?? 0}</b>`,
        topCity ? `🗺️ Top ville live : <b>${escapeHtml(topCity[0])}</b> (${topCity[1]})` : '',
        '',
        `→ ${SITE_URL}/admin`,
    ]
        .filter(Boolean)
        .join('\n')
}

export async function GET(req: Request) {
    const cronSecretHeader = req.headers.get('x-cron-secret') ?? new URL(req.url).searchParams.get('secret')
    const expected = process.env.CRON_SECRET || process.env.ADMIN_SECRET

    if (!expected || cronSecretHeader !== expected) {
        // Pas de secret valide : exige une session admin
        const guard = await requireAdmin()
        if (!guard.ok) return guard.response
    }

    const text = await buildMorningBriefing()
    const result = await sendTelegram(text)
    if (!result.ok) return Response.json({ error: result.error }, { status: 500 })
    return Response.json({ ok: true, sent: text })
}

export async function POST(req: Request) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    const { text, silent } = (await req.json()) as { text: string; silent?: boolean }
    if (!text || typeof text !== 'string' || text.length < 2) {
        return Response.json({ error: 'text required' }, { status: 400 })
    }
    const result = await sendTelegram(text, { silent })
    if (!result.ok) return Response.json({ error: result.error }, { status: 500 })
    return Response.json({ ok: true })
}
