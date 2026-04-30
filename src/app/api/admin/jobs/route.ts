// POST /api/admin/jobs
// Création de mission "au nom" d'un client par l'admin (suite à un appel ou
// un mail). Le client ne reçoit AUCUN email automatique. Il sera notifié
// uniquement quand un pro débloquera son lead.
//
// Optionnel : si `from_request_id` est passé, on lie le contact_request source
// (converted_to_job_id) pour traçabilité.

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/ops/guard'
import { sendTelegram, escapeHtml } from '@/lib/ops/telegram'
import { CATEGORY_LABELS } from '@/constants/categories'

export const dynamic = 'force-dynamic'

const VALID_CATEGORIES = Object.keys(CATEGORY_LABELS)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const supabase = guard.supabase as any

    try {
        const body = await req.json()
        const {
            // Mission
            title,
            description,
            category,
            type,
            client_type,
            location_city,
            location_address,
            location_department,
            height_meters,
            budget_min,
            budget_max,
            deadline,
            // Client contact
            contact_first_name,
            contact_last_name,
            contact_email,
            contact_phone,
            contact_company_name,
            // Admin meta
            admin_notes,
            from_request_id,
            // Status (par défaut 'live' — admin-modéré direct)
            status,
        } = body as Record<string, string | number | undefined | null>

        // Validation — minimum vital
        if (!description || String(description).trim().length < 10) {
            return NextResponse.json(
                { error: 'Description trop courte (minimum 10 caractères)' },
                { status: 400 }
            )
        }
        if (!category || !VALID_CATEGORIES.includes(String(category))) {
            return NextResponse.json({ error: 'Catégorie invalide' }, { status: 400 })
        }
        if (!location_city || String(location_city).trim().length < 2) {
            return NextResponse.json({ error: 'Ville requise' }, { status: 400 })
        }
        if (contact_email && !EMAIL_RE.test(String(contact_email))) {
            return NextResponse.json({ error: 'Email client invalide' }, { status: 400 })
        }
        if (!contact_email && !contact_phone) {
            return NextResponse.json(
                { error: 'Email ou téléphone client requis' },
                { status: 400 }
            )
        }

        const cleanType = type === 'renfort_pro' ? 'renfort_pro' : 'standard'
        const cleanStatus =
            status === 'pending' || status === 'live' || status === 'rejected'
                ? status
                : 'live'

        // Generate slug + id
        const jobId = crypto.randomUUID()
        const autoTitle =
            (title && String(title).trim()) ||
            `${CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]} - ${location_city}`
        const slugBase = `${autoTitle}-${location_city}`
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
        const slug = `${slugBase}-${jobId.split('-')[0]}`

        const fullName =
            [contact_first_name, contact_last_name].filter(Boolean).join(' ') || ''

        const jobData: Record<string, any> = {
            id: jobId,
            slug,
            title: autoTitle,
            description: String(description).trim(),
            category,
            type: cleanType,
            client_type: client_type || null,
            location_city: String(location_city).trim(),
            location_address: location_address || null,
            location_department: location_department || null,
            height_meters: height_meters ? Number(height_meters) : null,
            budget_min: budget_min ? Number(budget_min) : null,
            budget_max: budget_max ? Number(budget_max) : null,
            deadline: deadline || null,
            status: cleanStatus,
            created_by: null,
            admin_created: true,
            admin_notes: admin_notes ? String(admin_notes).trim() : null,
            client_contact_info: {
                first_name: contact_first_name ? String(contact_first_name).trim() : '',
                last_name: contact_last_name ? String(contact_last_name).trim() : '',
                name: fullName,
                email: contact_email ? String(contact_email).trim().toLowerCase() : '',
                phone: contact_phone ? String(contact_phone).trim() : '',
                ...(contact_company_name
                    ? { company_name: String(contact_company_name).trim() }
                    : {}),
            },
        }

        const { error: insertError } = await supabase.from('jobs').insert(jobData)

        if (insertError) {
            console.error('[admin/jobs] insert error:', insertError)
            return NextResponse.json(
                { error: insertError.message || 'Erreur insertion mission' },
                { status: 500 }
            )
        }

        // Lier le contact_request source si fourni
        if (from_request_id) {
            const { error: linkError } = await supabase
                .from('contact_requests')
                .update({ converted_to_job_id: jobId })
                .eq('id', from_request_id)
            if (linkError) {
                console.error('[admin/jobs] link contact_request error:', linkError)
                // Non-bloquant
            }
        }

        // Notification Telegram admin (best-effort)
        const tgLines = [
            '📝 <b>Mission créée par admin</b>',
            `Titre : ${escapeHtml(autoTitle)}`,
            `Ville : ${escapeHtml(String(location_city))}`,
            `Client : ${escapeHtml(fullName || 'Anonyme')}`,
            contact_email ? `Email : ${escapeHtml(String(contact_email))}` : '',
            contact_phone ? `Tél. : ${escapeHtml(String(contact_phone))}` : '',
            from_request_id ? `Source : contact_request ${from_request_id}` : '',
            '',
            `→ ${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.lescordistes.com'}/jobs/${slug}`,
        ].filter(Boolean)
        sendTelegram(tgLines.join('\n')).catch(() => {})

        return NextResponse.json({ ok: true, id: jobId, slug })
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error('[admin/jobs] POST error:', msg)
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
