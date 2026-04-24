// Tool use — schéma et exécution côté serveur.
// Les outils sont déclarés ici (envoyés à Claude via l'API) ET dispatchés ici
// (via runTool appelé par l'endpoint /api/ops/tools/execute après confirmation admin).

import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { logAdminAction } from '@/lib/ops/audit'
import { sendTelegram, escapeHtml } from '@/lib/ops/telegram'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.lescordistes.com'

/* eslint-disable @typescript-eslint/no-explicit-any */

// Définition des tools au format Anthropic API.
// Les descriptions sont TRÈS importantes : elles guident Claude pour choisir
// quand invoquer chaque outil. Garder en français (cohérence avec le system prompt).

// Les outils READ_ONLY_TOOLS sont exécutés automatiquement sans confirmation admin
// (aucune mutation DB possible). Les autres passent par le ConfirmDialog côté UI.
export const READ_ONLY_TOOLS = new Set([
    'search_jobs',
    'get_job',
    'search_profiles',
    'get_profile',
    'get_stats',
    'list_pending_missions',
])

export const TOOL_DEFINITIONS = [
    {
        name: 'search_jobs',
        description: 'Recherche missions (filtres statut/catégorie/ville/texte). Max 20.',
        input_schema: {
            type: 'object',
            properties: {
                status: { type: 'string', enum: ['pending', 'live', 'rejected', 'completed', 'cancelled'] },
                category: { type: 'string', enum: ['cleaning', 'construction', 'masonry', 'painting', 'industry', 'event', 'securing', 'telecom', 'inspection', 'repair', 'pruning', 'other'] },
                city: { type: 'string' },
                client_type: { type: 'string' },
                search: { type: 'string', description: 'texte dans titre/description/ville' },
                limit: { type: 'integer', description: 'défaut 10, max 20' },
            },
        },
    },
    {
        name: 'get_job',
        description: "Détails complets d'une mission par UUID (desc, contact, photos).",
        input_schema: {
            type: 'object',
            properties: { job_id: { type: 'string' } },
            required: ['job_id'],
        },
    },
    {
        name: 'search_profiles',
        description: 'Recherche profils (rôle, email, nom, société). Max 20.',
        input_schema: {
            type: 'object',
            properties: {
                role: { type: 'string', enum: ['pro', 'client', 'admin'] },
                search: { type: 'string' },
                has_credits: { type: 'boolean', description: 'pros avec balance >0' },
                limit: { type: 'integer' },
            },
        },
    },
    {
        name: 'get_profile',
        description: 'Profil complet + crédits + 10 dernières transactions.',
        input_schema: {
            type: 'object',
            properties: { user_id: { type: 'string' } },
            required: ['user_id'],
        },
    },
    {
        name: 'get_stats',
        description: 'Snapshot KPI (missions pending/live, pros, crédits 30j, leads 7j).',
        input_schema: { type: 'object', properties: {} },
    },
    {
        name: 'list_pending_missions',
        description: 'Raccourci search_jobs(status=pending), tri date desc.',
        input_schema: {
            type: 'object',
            properties: { limit: { type: 'integer' } },
        },
    },
    {
        name: 'approve_mission',
        description: 'Approuve une mission (pending→live). Notif Telegram auto.',
        input_schema: {
            type: 'object',
            properties: { job_id: { type: 'string' } },
            required: ['job_id'],
        },
    },
    {
        name: 'reject_mission',
        description: 'Rejette avec motif factuel ≥10 car (pending→rejected).',
        input_schema: {
            type: 'object',
            properties: {
                job_id: { type: 'string' },
                reason: { type: 'string' },
            },
            required: ['job_id', 'reason'],
        },
    },
    {
        name: 'archive_mission',
        description: 'Archive (status→cancelled).',
        input_schema: {
            type: 'object',
            properties: { job_id: { type: 'string' } },
            required: ['job_id'],
        },
    },
    {
        name: 'update_job_fields',
        description:
            "Met à jour champs mission. Whitelist : title, description, category, location_city, location_address, location_department, budget_min, budget_max, daily_rate, height_meters. NE pas changer le statut via cet outil.",
        input_schema: {
            type: 'object',
            properties: {
                job_id: { type: 'string' },
                fields: {
                    type: 'object',
                    properties: {
                        title: { type: 'string' },
                        description: { type: 'string' },
                        category: { type: 'string' },
                        location_city: { type: 'string' },
                        location_address: { type: 'string' },
                        location_department: { type: 'string' },
                        budget_min: { type: 'number' },
                        budget_max: { type: 'number' },
                        daily_rate: { type: 'number' },
                        height_meters: { type: 'number' },
                    },
                    additionalProperties: false,
                },
            },
            required: ['job_id', 'fields'],
        },
    },
    {
        name: 'adjust_credits',
        description: 'Ajuste solde pro (delta int, motif ≥3 car). allow_negative si solde final <0.',
        input_schema: {
            type: 'object',
            properties: {
                pro_id: { type: 'string' },
                delta: { type: 'integer' },
                description: { type: 'string' },
                allow_negative: { type: 'boolean' },
            },
            required: ['pro_id', 'delta', 'description'],
        },
    },
    {
        name: 'update_profile_fields',
        description:
            'Met à jour un profil. Whitelist : role (sensible), bio, full_name, phone, company_name, siret, certifications[], skills[], intervention_zones[], equipment[], insurance_info, client_type.',
        input_schema: {
            type: 'object',
            properties: {
                user_id: { type: 'string' },
                fields: {
                    type: 'object',
                    properties: {
                        role: { type: 'string', enum: ['client', 'pro', 'admin'] },
                        bio: { type: 'string' },
                        full_name: { type: 'string' },
                        phone: { type: 'string' },
                        company_name: { type: 'string' },
                        siret: { type: 'string' },
                        certifications: { type: 'array', items: { type: 'string' } },
                        skills: { type: 'array', items: { type: 'string' } },
                        intervention_zones: { type: 'array', items: { type: 'string' } },
                        equipment: { type: 'array', items: { type: 'string' } },
                        insurance_info: { type: 'string' },
                        client_type: { type: 'string' },
                    },
                    additionalProperties: false,
                },
            },
            required: ['user_id', 'fields'],
        },
    },
    {
        name: 'notify_user',
        description: "Notif in-app (dashboard). notif_type: info/warning/success (défaut info).",
        input_schema: {
            type: 'object',
            properties: {
                user_id: { type: 'string' },
                title: { type: 'string' },
                message: { type: 'string' },
                link: { type: 'string' },
                notif_type: { type: 'string' },
            },
            required: ['user_id', 'title', 'message'],
        },
    },
    {
        name: 'send_telegram_note',
        description: "Note Telegram à l'admin. HTML <b>/<i> ok.",
        input_schema: {
            type: 'object',
            properties: { text: { type: 'string' } },
            required: ['text'],
        },
    },
    {
        name: 'send_email',
        description:
            'Email custom. Fournir user_id (résout email+nom) OU to_email libre. body en texte brut, paragraphes sur \\n\\n, HTML échappé. link+link_text optionnels pour CTA.',
        input_schema: {
            type: 'object',
            properties: {
                user_id: { type: 'string' },
                to_email: { type: 'string' },
                to_name: { type: 'string' },
                subject: { type: 'string' },
                body: { type: 'string' },
                link: { type: 'string' },
                link_text: { type: 'string' },
            },
            required: ['subject', 'body'],
        },
    },
] as const

export type ToolName = typeof TOOL_DEFINITIONS[number]['name']

export const TOOL_NAMES = TOOL_DEFINITIONS.map(t => t.name) as ToolName[]

export type ToolResult =
    | { ok: true; summary: string; data?: Record<string, unknown> }
    | { ok: false; error: string }

const UPDATABLE_JOB_FIELDS = new Set([
    'title',
    'description',
    'category',
    'location_city',
    'location_address',
    'location_department',
    'budget_min',
    'budget_max',
    'daily_rate',
    'height_meters',
])

export async function runTool(name: string, input: Record<string, unknown>, performedBy: string): Promise<ToolResult> {
    switch (name) {
        // read-only
        case 'search_jobs':
            return searchJobs(input)
        case 'get_job':
            return getJob(input)
        case 'search_profiles':
            return searchProfiles(input)
        case 'get_profile':
            return getProfile(input)
        case 'get_stats':
            return getStats()
        case 'list_pending_missions':
            return listPendingMissions(input)
        // mutations
        case 'approve_mission':
            return approveMission(input, performedBy)
        case 'reject_mission':
            return rejectMission(input, performedBy)
        case 'archive_mission':
            return archiveMission(input, performedBy)
        case 'update_job_fields':
            return updateJobFields(input, performedBy)
        case 'update_profile_fields':
            return updateProfileFields(input, performedBy)
        case 'adjust_credits':
            return adjustCredits(input, performedBy)
        case 'notify_user':
            return notifyUser(input, performedBy)
        case 'send_telegram_note':
            return sendTelegramNote(input)
        case 'send_email':
            return sendEmail(input, performedBy)
        default:
            return { ok: false, error: `Outil inconnu : ${name}` }
    }
}

async function approveMission(input: Record<string, unknown>, performedBy: string): Promise<ToolResult> {
    const jobId = String(input.job_id ?? '')
    if (!jobId) return { ok: false, error: 'job_id manquant' }

    const admin = createSupabaseAdminClient() as any
    const { data: existing } = await admin.from('jobs').select('id, status, title').eq('id', jobId).single()
    if (!existing) return { ok: false, error: 'Mission introuvable' }

    const { error } = await admin
        .from('jobs')
        .update({
            status: 'live',
            moderated_at: new Date().toISOString(),
            moderated_by: performedBy,
            rejection_reason: null,
        })
        .eq('id', jobId)
    if (error) return { ok: false, error: error.message }

    await logAdminAction({
        action: 'job_approved',
        target_table: 'jobs',
        target_id: jobId,
        payload: { before: existing.status, after: 'live', via: 'ai_tool' },
        performed_by: performedBy,
    })

    sendTelegram(`<b>✅ Mission approuvée (via IA)</b>\n${escapeHtml(existing.title)}\n${SITE_URL}/admin/missions/${jobId}`).catch(() => {})

    return { ok: true, summary: `Mission "${existing.title}" approuvée — maintenant en ligne.` }
}

async function rejectMission(input: Record<string, unknown>, performedBy: string): Promise<ToolResult> {
    const jobId = String(input.job_id ?? '')
    const reason = String(input.reason ?? '').trim()
    if (!jobId) return { ok: false, error: 'job_id manquant' }
    if (reason.length < 10) return { ok: false, error: 'Motif trop court (10 caractères minimum)' }

    const admin = createSupabaseAdminClient() as any
    const { data: existing } = await admin.from('jobs').select('id, status, title').eq('id', jobId).single()
    if (!existing) return { ok: false, error: 'Mission introuvable' }

    const { error } = await admin
        .from('jobs')
        .update({
            status: 'rejected',
            moderated_at: new Date().toISOString(),
            moderated_by: performedBy,
            rejection_reason: reason,
        })
        .eq('id', jobId)
    if (error) return { ok: false, error: error.message }

    await logAdminAction({
        action: 'job_rejected',
        target_table: 'jobs',
        target_id: jobId,
        payload: { before: existing.status, after: 'rejected', reason, via: 'ai_tool' },
        performed_by: performedBy,
    })

    sendTelegram(`<b>❌ Mission rejetée (via IA)</b>\n${escapeHtml(existing.title)}\nMotif : ${escapeHtml(reason)}`).catch(() => {})

    return { ok: true, summary: `Mission "${existing.title}" rejetée. Motif : ${reason}` }
}

async function archiveMission(input: Record<string, unknown>, performedBy: string): Promise<ToolResult> {
    const jobId = String(input.job_id ?? '')
    if (!jobId) return { ok: false, error: 'job_id manquant' }

    const admin = createSupabaseAdminClient() as any
    const { data: existing } = await admin.from('jobs').select('id, status, title').eq('id', jobId).single()
    if (!existing) return { ok: false, error: 'Mission introuvable' }

    const { error } = await admin.from('jobs').update({ status: 'cancelled' }).eq('id', jobId)
    if (error) return { ok: false, error: error.message }

    await logAdminAction({
        action: 'job_archived',
        target_table: 'jobs',
        target_id: jobId,
        payload: { before: existing.status, after: 'cancelled', via: 'ai_tool' },
        performed_by: performedBy,
    })

    return { ok: true, summary: `Mission "${existing.title}" archivée.` }
}

async function updateJobFields(input: Record<string, unknown>, performedBy: string): Promise<ToolResult> {
    const jobId = String(input.job_id ?? '')
    const rawFields = (input.fields ?? {}) as Record<string, unknown>
    if (!jobId) return { ok: false, error: 'job_id manquant' }

    const cleaned: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(rawFields)) {
        if (UPDATABLE_JOB_FIELDS.has(k) && v !== undefined && v !== null) cleaned[k] = v
    }
    if (Object.keys(cleaned).length === 0) return { ok: false, error: 'Aucun champ autorisé à mettre à jour' }

    const admin = createSupabaseAdminClient() as any
    const { error } = await admin.from('jobs').update(cleaned).eq('id', jobId)
    if (error) return { ok: false, error: error.message }

    await logAdminAction({
        action: 'job_updated',
        target_table: 'jobs',
        target_id: jobId,
        payload: { fields: Object.keys(cleaned), values: cleaned, via: 'ai_tool' },
        performed_by: performedBy,
    })

    return {
        ok: true,
        summary: `Champs mis à jour : ${Object.keys(cleaned).join(', ')}.`,
        data: { fields_updated: Object.keys(cleaned) },
    }
}

async function adjustCredits(input: Record<string, unknown>, performedBy: string): Promise<ToolResult> {
    const proId = String(input.pro_id ?? '')
    const delta = Number(input.delta)
    const description = String(input.description ?? '').trim()
    const allowNegative = Boolean(input.allow_negative)

    if (!proId) return { ok: false, error: 'pro_id manquant' }
    if (!Number.isFinite(delta) || delta === 0) return { ok: false, error: 'delta doit être un nombre non nul' }
    if (description.length < 3) return { ok: false, error: 'description trop courte (≥3 caractères)' }

    const admin = createSupabaseAdminClient() as any
    const { data: profile } = await admin.from('profiles').select('id, role, email, full_name').eq('id', proId).single()
    if (!profile) return { ok: false, error: 'Profil introuvable' }
    if (profile.role !== 'pro') return { ok: false, error: 'Les crédits ne concernent que les profils pro' }

    const { data: existing } = await admin.from('credits').select('balance').eq('pro_id', proId).maybeSingle()
    const current = Number(existing?.balance ?? 0)
    const next = current + delta

    if (next < 0 && !allowNegative) {
        return { ok: false, error: `Solde résultant négatif (${next}). Renvoie avec allow_negative:true si tu veux forcer.` }
    }

    const txInsert = await admin.from('credit_transactions').insert({
        pro_id: proId,
        type: delta > 0 ? 'purchase' : 'spend',
        amount: delta,
        description: `[ai] ${description}`,
    })
    if (txInsert.error) return { ok: false, error: txInsert.error.message }

    if (existing) {
        const { error } = await admin
            .from('credits')
            .update({ balance: next, updated_at: new Date().toISOString() })
            .eq('pro_id', proId)
        if (error) return { ok: false, error: error.message }
    } else {
        const { error } = await admin.from('credits').insert({ pro_id: proId, balance: next })
        if (error) return { ok: false, error: error.message }
    }

    await logAdminAction({
        action: 'credits_adjusted',
        target_table: 'credits',
        target_id: proId,
        payload: {
            delta,
            description,
            before: current,
            after: next,
            target_email: profile.email,
            via: 'ai_tool',
        },
        performed_by: performedBy,
    })

    return {
        ok: true,
        summary: `Solde ${profile.full_name ?? profile.email} : ${current} → ${next} (${delta > 0 ? '+' : ''}${delta}).`,
        data: { balance: next },
    }
}

async function sendTelegramNote(input: Record<string, unknown>): Promise<ToolResult> {
    const text = String(input.text ?? '').trim()
    if (!text || text.length < 2) return { ok: false, error: 'text manquant' }
    const r = await sendTelegram(`🤖 <b>Note IA</b>\n${text}`)
    if (!r.ok) return { ok: false, error: r.error ?? 'échec envoi' }
    return { ok: true, summary: 'Note Telegram envoyée ✓' }
}

// ---------- READ-ONLY ----------

async function searchJobs(input: Record<string, unknown>): Promise<ToolResult> {
    const admin = createSupabaseAdminClient() as any
    const limit = Math.min(Math.max(Number(input.limit ?? 10), 1), 20)
    let q = admin
        .from('jobs')
        .select('id, title, status, category, location_city, location_department, client_type, created_at, created_by')
        .order('created_at', { ascending: false })
        .limit(limit)

    if (input.status) q = q.eq('status', String(input.status))
    if (input.category) q = q.eq('category', String(input.category))
    if (input.client_type) q = q.eq('client_type', String(input.client_type))
    if (input.city) q = q.ilike('location_city', `%${String(input.city)}%`)
    if (input.search) {
        const s = String(input.search)
        q = q.or(`title.ilike.%${s}%,description.ilike.%${s}%,location_city.ilike.%${s}%`)
    }

    const { data, error } = await q
    if (error) return { ok: false, error: error.message }
    const rows = data ?? []
    const summary = rows.length
        ? `${rows.length} mission(s) trouvée(s) :\n` +
          rows.map((j: any) => `- [${j.status}] ${j.title} (${j.location_city}, ${j.category}) — ${j.id}`).join('\n')
        : 'Aucune mission ne correspond.'
    return { ok: true, summary, data: { jobs: rows } }
}

async function listPendingMissions(input: Record<string, unknown>): Promise<ToolResult> {
    return searchJobs({ ...input, status: 'pending' })
}

async function getJob(input: Record<string, unknown>): Promise<ToolResult> {
    const jobId = String(input.job_id ?? '')
    if (!jobId) return { ok: false, error: 'job_id manquant' }

    const admin = createSupabaseAdminClient() as any
    const { data: job, error } = await admin.from('jobs').select('*').eq('id', jobId).single()
    if (error || !job) return { ok: false, error: 'Mission introuvable' }

    const contact = (job.client_contact_info ?? {}) as Record<string, unknown>
    const photos = Array.isArray(job.photos_url) ? job.photos_url.length : 0
    const summary = [
        `Mission ${job.id} [${job.status}]`,
        `Titre : ${job.title}`,
        `Catégorie : ${job.category} | Type : ${job.type ?? 'standard'} | Client : ${job.client_type ?? '—'}`,
        `Ville : ${job.location_city} (${job.location_department ?? '—'})`,
        `Hauteur : ${job.height_meters ?? '?'} m | Budget : ${job.budget_min ?? '?'}–${job.budget_max ?? '?'} € | TJM : ${job.daily_rate ?? '?'} €`,
        `Photos : ${photos}`,
        `Contact : ${contact.name ?? '—'} | ${contact.email ?? '—'} | ${contact.phone ?? '—'}`,
        job.rejection_reason ? `Motif rejet précédent : ${job.rejection_reason}` : '',
        '',
        `Description :\n${job.description}`,
    ]
        .filter(Boolean)
        .join('\n')

    return { ok: true, summary, data: { job } }
}

async function searchProfiles(input: Record<string, unknown>): Promise<ToolResult> {
    const admin = createSupabaseAdminClient() as any
    const limit = Math.min(Math.max(Number(input.limit ?? 10), 1), 20)

    let q = admin
        .from('profiles')
        .select('id, email, role, full_name, company_name, certifications, created_at')
        .order('created_at', { ascending: false })
        .limit(limit)

    if (input.role) q = q.eq('role', String(input.role))
    if (input.search) {
        const s = String(input.search)
        q = q.or(`email.ilike.%${s}%,full_name.ilike.%${s}%,company_name.ilike.%${s}%`)
    }

    const { data, error } = await q
    if (error) return { ok: false, error: error.message }
    let rows = data ?? []

    // Enrichir avec soldes si role=pro
    if (input.role === 'pro' || input.has_credits) {
        const ids = rows.map((r: any) => r.id)
        if (ids.length > 0) {
            const { data: credits } = await admin.from('credits').select('pro_id, balance').in('pro_id', ids)
            const balanceMap = new Map(((credits ?? []) as Array<{ pro_id: string; balance: number }>).map(c => [c.pro_id, Number(c.balance) || 0]))
            rows = rows.map((r: any) => ({ ...r, balance: balanceMap.get(r.id) ?? 0 }))
            if (input.has_credits) rows = rows.filter((r: any) => (r.balance ?? 0) > 0)
        }
    }

    const summary = rows.length
        ? `${rows.length} profil(s) trouvé(s) :\n` +
          rows
              .map((p: any) => {
                  const name = p.full_name || p.company_name || p.email
                  const bal = p.balance !== undefined ? ` | ${p.balance} crédits` : ''
                  return `- [${p.role}] ${name} — ${p.email}${bal} — ${p.id}`
              })
              .join('\n')
        : 'Aucun profil ne correspond.'
    return { ok: true, summary, data: { profiles: rows } }
}

async function getProfile(input: Record<string, unknown>): Promise<ToolResult> {
    const userId = String(input.user_id ?? '')
    if (!userId) return { ok: false, error: 'user_id manquant' }

    const admin = createSupabaseAdminClient() as any
    const [profileQ, creditsQ, txQ] = await Promise.all([
        admin.from('profiles').select('*').eq('id', userId).single(),
        admin.from('credits').select('balance').eq('pro_id', userId).maybeSingle(),
        admin.from('credit_transactions').select('type, amount, description, created_at').eq('pro_id', userId).order('created_at', { ascending: false }).limit(10),
    ])

    if (profileQ.error || !profileQ.data) return { ok: false, error: 'Profil introuvable' }
    const p = profileQ.data as any
    const balance = Number(creditsQ.data?.balance ?? 0)
    const recentTx = (txQ.data ?? []) as Array<{ type: string; amount: number; description: string | null; created_at: string }>

    const summary = [
        `Profil ${p.id} [${p.role}]`,
        `Nom : ${p.full_name || [p.first_name, p.last_name].filter(Boolean).join(' ') || '—'}`,
        `Email : ${p.email} | Tél : ${p.phone ?? '—'}`,
        `Société : ${p.company_name ?? '—'} (SIRET ${p.siret ?? '—'})`,
        `Client type : ${p.client_type ?? '—'}`,
        `Certifications : ${(p.certifications ?? []).join(', ') || '—'}`,
        `Zones : ${(p.intervention_zones ?? []).join(', ') || '—'}`,
        `Équipement : ${(p.equipment ?? []).join(', ') || '—'}`,
        `Solde crédits : ${balance}`,
        p.bio ? `\nBio :\n${p.bio}` : '',
        recentTx.length
            ? `\nDernières transactions :\n${recentTx.map(t => `  ${new Date(t.created_at).toLocaleDateString('fr-FR')} | ${t.type} ${t.amount > 0 ? '+' : ''}${t.amount} — ${t.description ?? ''}`).join('\n')}`
            : '',
    ]
        .filter(Boolean)
        .join('\n')
    return { ok: true, summary, data: { profile: p, balance, transactions: recentTx } }
}

async function getStats(): Promise<ToolResult> {
    const admin = createSupabaseAdminClient() as any
    const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
    const monthAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()

    const [pending, live, totalWeek, pros, newPros, purchases, spends, leadsWeek] = await Promise.all([
        admin.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        admin.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'live'),
        admin.from('jobs').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
        admin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'pro'),
        admin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'pro').gte('created_at', weekAgo),
        admin.from('credit_transactions').select('amount').eq('type', 'purchase').gte('created_at', monthAgo),
        admin.from('credit_transactions').select('amount').eq('type', 'spend').gte('created_at', monthAgo),
        admin.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
    ])

    const soldMonth = (purchases.data ?? []).reduce((a: number, t: any) => a + Math.abs(Number(t.amount) || 0), 0)
    const spentMonth = (spends.data ?? []).reduce((a: number, t: any) => a + Math.abs(Number(t.amount) || 0), 0)

    const summary = [
        `Missions : ${pending.count ?? 0} pending, ${live.count ?? 0} live, ${totalWeek.count ?? 0} créées sur 7j`,
        `Pros : ${pros.count ?? 0} total, +${newPros.count ?? 0} cette semaine`,
        `Crédits 30j : ${soldMonth} vendus, ${spentMonth} dépensés`,
        `Leads funnel : ${leadsWeek.count ?? 0} sur 7j`,
    ].join('\n')

    return {
        ok: true,
        summary,
        data: {
            jobs_pending: pending.count ?? 0,
            jobs_live: live.count ?? 0,
            jobs_week: totalWeek.count ?? 0,
            pros_total: pros.count ?? 0,
            pros_new_week: newPros.count ?? 0,
            credits_sold_month: soldMonth,
            credits_spent_month: spentMonth,
            leads_week: leadsWeek.count ?? 0,
        },
    }
}

// ---------- MUTATIONS (new) ----------

const UPDATABLE_PROFILE_FIELDS = new Set([
    'role',
    'bio',
    'full_name',
    'phone',
    'company_name',
    'siret',
    'certifications',
    'skills',
    'intervention_zones',
    'equipment',
    'insurance_info',
    'client_type',
])

async function updateProfileFields(input: Record<string, unknown>, performedBy: string): Promise<ToolResult> {
    const userId = String(input.user_id ?? '')
    const rawFields = (input.fields ?? {}) as Record<string, unknown>
    if (!userId) return { ok: false, error: 'user_id manquant' }

    const cleaned: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(rawFields)) {
        if (UPDATABLE_PROFILE_FIELDS.has(k) && v !== undefined && v !== null) cleaned[k] = v
    }
    if (Object.keys(cleaned).length === 0) return { ok: false, error: 'Aucun champ autorisé à mettre à jour' }

    const admin = createSupabaseAdminClient() as any
    const { data: before } = await admin.from('profiles').select('role').eq('id', userId).single()
    if (!before) return { ok: false, error: 'Profil introuvable' }

    const { error } = await admin.from('profiles').update(cleaned).eq('id', userId)
    if (error) return { ok: false, error: error.message }

    await logAdminAction({
        action: 'profile_updated',
        target_table: 'profiles',
        target_id: userId,
        payload: { fields: Object.keys(cleaned), values: cleaned, via: 'ai_tool', role_before: before.role },
        performed_by: performedBy,
    })

    return {
        ok: true,
        summary: `Profil mis à jour : ${Object.keys(cleaned).join(', ')}.`,
        data: { fields_updated: Object.keys(cleaned) },
    }
}

async function notifyUser(input: Record<string, unknown>, performedBy: string): Promise<ToolResult> {
    const userId = String(input.user_id ?? '')
    const title = String(input.title ?? '').trim()
    const message = String(input.message ?? '').trim()
    const link = input.link ? String(input.link) : null
    const notifType = input.notif_type ? String(input.notif_type) : 'info'

    if (!userId) return { ok: false, error: 'user_id manquant' }
    if (!title) return { ok: false, error: 'title manquant' }
    if (!message) return { ok: false, error: 'message manquant' }

    const admin = createSupabaseAdminClient() as any
    const { data: target } = await admin.from('profiles').select('id, email').eq('id', userId).single()
    if (!target) return { ok: false, error: 'Destinataire introuvable' }

    const { error } = await admin.from('notifications').insert({
        user_id: userId,
        type: notifType,
        title,
        message,
        link,
        read: false,
    })
    if (error) return { ok: false, error: error.message }

    await logAdminAction({
        action: 'user_notified',
        target_table: 'notifications',
        target_id: userId,
        payload: { title, message, link, notif_type: notifType, target_email: target.email, via: 'ai_tool' },
        performed_by: performedBy,
    })

    return { ok: true, summary: `Notification "${title}" envoyée à ${target.email}.` }
}

async function sendEmail(input: Record<string, unknown>, performedBy: string): Promise<ToolResult> {
    const userId = input.user_id ? String(input.user_id).trim() : ''
    const toEmailInput = input.to_email ? String(input.to_email).trim() : ''
    const toNameInput = input.to_name ? String(input.to_name).trim() : ''
    const subject = String(input.subject ?? '').trim()
    const body = String(input.body ?? '').trim()
    const link = input.link ? String(input.link).trim() : ''
    const linkText = input.link_text ? String(input.link_text).trim() : ''

    if (!subject) return { ok: false, error: 'subject manquant' }
    if (!body) return { ok: false, error: 'body manquant' }
    if (body.length < 10) return { ok: false, error: 'body trop court (≥10 caractères)' }
    if (link && !linkText) return { ok: false, error: 'link fourni sans link_text' }
    if (link && !/^https?:\/\//i.test(link)) return { ok: false, error: 'link doit commencer par http(s)://' }

    const admin = createSupabaseAdminClient() as any

    let toEmail = ''
    let toName = toNameInput
    let resolvedUserId: string | null = null

    if (userId) {
        const { data: profile } = await admin.from('profiles').select('id, email, full_name, first_name').eq('id', userId).single()
        if (!profile || !profile.email) return { ok: false, error: 'Profil introuvable ou sans email' }
        toEmail = profile.email as string
        if (!toName) toName = (profile.full_name as string) || (profile.first_name as string) || ''
        resolvedUserId = profile.id as string
    } else if (toEmailInput) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toEmailInput)) return { ok: false, error: "to_email n'est pas une adresse valide" }
        toEmail = toEmailInput
    } else {
        return { ok: false, error: 'Fournir user_id OU to_email' }
    }

    const { data: invokeData, error: invokeError } = await admin.functions.invoke('send-email', {
        body: {
            to: toEmail,
            subject,
            templateId: 'admin-custom',
            data: {
                name: toName,
                subject,
                body,
                link,
                linkText,
            },
        },
    })

    if (invokeError) {
        return { ok: false, error: `Resend error: ${invokeError.message ?? String(invokeError)}` }
    }

    await logAdminAction({
        action: 'email_sent',
        target_table: resolvedUserId ? 'profiles' : 'email_raw',
        target_id: resolvedUserId,
        payload: {
            to: toEmail,
            to_name: toName,
            subject,
            body_preview: body.slice(0, 200),
            body_length: body.length,
            link: link || null,
            link_text: linkText || null,
            resend_id: (invokeData as Record<string, unknown> | null)?.id ?? null,
            via: 'ai_tool',
        },
        performed_by: performedBy,
    })

    sendTelegram(`<b>📧 Email envoyé (via IA)</b>\n→ ${escapeHtml(toEmail)}\nObjet : ${escapeHtml(subject)}`).catch(() => {})

    return {
        ok: true,
        summary: `Email envoyé à ${toEmail} — objet : "${subject}".`,
        data: { to: toEmail },
    }
}
