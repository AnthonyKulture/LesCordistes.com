// POST /api/contact-requests
// Public endpoint pour les 2 alternatives au wizard /post-job :
//   - 'quick_message' : mini-formulaire (email + ville + message)
//   - 'callback'      : être recontacté (email OU phone + créneau)
//
// Idempotent : pas d'unique constraint, l'utilisateur peut soumettre plusieurs fois.
// Notification Telegram immédiate à l'admin.

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { sendTelegram, escapeHtml } from '@/lib/ops/telegram'

export const dynamic = 'force-dynamic'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[+]?[\d\s().-]{6,20}$/

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const {
            request_type,
            first_name,
            email,
            phone,
            city,
            category,
            message,
            preferred_channel,
            preferred_time_slot,
            source,
        } = body as Record<string, string | undefined>

        // Validation
        if (request_type !== 'quick_message' && request_type !== 'callback') {
            return NextResponse.json({ error: 'request_type invalide' }, { status: 400 })
        }

        const cleanEmail = email?.trim().toLowerCase() || null
        const cleanPhone = phone?.trim() || null

        if (cleanEmail && !EMAIL_RE.test(cleanEmail)) {
            return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
        }
        if (cleanPhone && !PHONE_RE.test(cleanPhone)) {
            return NextResponse.json({ error: 'Téléphone invalide' }, { status: 400 })
        }
        if (!cleanEmail && !cleanPhone) {
            return NextResponse.json({ error: 'Email ou téléphone requis' }, { status: 400 })
        }

        if (request_type === 'quick_message') {
            if (!cleanEmail) {
                return NextResponse.json({ error: 'Email requis pour un message rapide' }, { status: 400 })
            }
            if (!message || message.trim().length < 5) {
                return NextResponse.json({ error: 'Message trop court' }, { status: 400 })
            }
        }

        const cleanFirstName = first_name?.trim().slice(0, 60) || null
        const cleanCity = city?.trim().slice(0, 80) || null
        const cleanCategory = category?.trim().slice(0, 40) || null
        const cleanMessage = message?.trim().slice(0, 1000) || null
        const cleanChannel =
            preferred_channel === 'email' || preferred_channel === 'phone' ? preferred_channel : null
        const cleanSlot =
            preferred_time_slot && ['morning', 'afternoon', 'evening'].includes(preferred_time_slot)
                ? preferred_time_slot
                : null

        /* eslint-disable @typescript-eslint/no-explicit-any */
        const admin = createSupabaseAdminClient() as any

        const { data: inserted, error } = await admin
            .from('contact_requests')
            .insert({
                request_type,
                first_name: cleanFirstName,
                email: cleanEmail,
                phone: cleanPhone,
                city: cleanCity,
                category: cleanCategory,
                message: cleanMessage,
                preferred_channel: cleanChannel,
                preferred_time_slot: cleanSlot,
                source: source || null,
                updated_at: new Date().toISOString(),
            })
            .select('id')
            .single()

        if (error) {
            console.error('contact_requests insert error:', error.message)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Notification Telegram (best-effort, non-bloquant)
        const slotLabel = cleanSlot
            ? ({ morning: 'matin', afternoon: 'après-midi', evening: 'soir' } as const)[
                  cleanSlot as 'morning' | 'afternoon' | 'evening'
              ]
            : null
        const lines = [
            request_type === 'callback' ? '📞 <b>Demande de rappel</b>' : '💬 <b>Message rapide</b>',
            cleanFirstName ? `Prénom : ${escapeHtml(cleanFirstName)}` : '',
            cleanEmail ? `Email : ${escapeHtml(cleanEmail)}` : '',
            cleanPhone ? `Tél. : ${escapeHtml(cleanPhone)}` : '',
            cleanCity ? `Ville : ${escapeHtml(cleanCity)}` : '',
            cleanCategory ? `Type : ${escapeHtml(cleanCategory)}` : '',
            slotLabel ? `Créneau : ${slotLabel}` : '',
            cleanChannel ? `Canal préféré : ${cleanChannel}` : '',
            cleanMessage ? `\n💬 ${escapeHtml(cleanMessage)}` : '',
            '',
            `→ ${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.lescordistes.com'}/admin/contact-requests`,
        ].filter(Boolean)
        sendTelegram(lines.join('\n')).catch(() => {})

        return NextResponse.json({ ok: true, id: inserted?.id })
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error('contact_requests POST error:', msg)
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
