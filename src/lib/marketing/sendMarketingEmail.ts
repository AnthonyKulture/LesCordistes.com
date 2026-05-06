// Wrapper serveur pour envoyer un email marketing via l'edge function send-email.
// JAMAIS appelé côté client. Sécurités intégrées :
//   - skip si contact unsubscribed ou marketing_opt_in = false
//   - skip si email invalide
//   - injection automatique de unsubscribeUrl signé HMAC
//   - création/mise à jour du recipient (anti double-envoi via unique index)
//   - logs admin_actions

import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { logAdminAction } from '@/lib/ops/audit'
import { buildUnsubscribeUrl } from './unsubscribeToken'

const SEO_BASE_URL =
    process.env.NEXT_PUBLIC_SEO_BASE_URL || 'https://www.lescordistes.com'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface SendMarketingEmailInput {
    to: string
    firstName?: string | null
    lastName?: string | null
    subject: string
    previewText?: string | null
    edgeTemplateId: string                 // ex: 'admin-custom', 'pro-credit-offer', 'marketing-generic'
    templateData: Record<string, unknown>  // variables passées au template
    campaignId: string                     // peut être 'TEST' pour les sends de test
    contactId?: string | null
    isTest?: boolean
    performedBy?: string                   // userId de l'admin qui a déclenché
}

export interface SendMarketingEmailResult {
    ok: boolean
    status: 'sent' | 'skipped' | 'failed'
    skipReason?: 'no_opt_in' | 'unsubscribed' | 'invalid_email' | 'duplicate'
    resendId?: string
    error?: string
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function sendMarketingEmail(
    input: SendMarketingEmailInput
): Promise<SendMarketingEmailResult> {
    const admin = createSupabaseAdminClient() as any
    const emailLc = input.to.trim().toLowerCase()

    if (!EMAIL_RE.test(emailLc)) {
        if (!input.isTest) {
            await upsertRecipient(admin, input, {
                status: 'skipped',
                skip_reason: 'invalid_email',
            })
        }
        return { ok: false, status: 'skipped', skipReason: 'invalid_email' }
    }

    // Vérifier opt-in (sauf en test, où l'admin envoie à un email arbitraire de prévisualisation).
    if (!input.isTest) {
        const { data: contact } = await admin
            .from('marketing_contacts')
            .select('id, marketing_opt_in, unsubscribed_at')
            .ilike('email', emailLc)
            .maybeSingle()

        if (contact?.unsubscribed_at) {
            await upsertRecipient(admin, input, {
                status: 'skipped',
                skip_reason: 'unsubscribed',
                contact_id: contact.id,
            })
            return { ok: false, status: 'skipped', skipReason: 'unsubscribed' }
        }
        if (contact && contact.marketing_opt_in === false) {
            await upsertRecipient(admin, input, {
                status: 'skipped',
                skip_reason: 'no_opt_in',
                contact_id: contact.id,
            })
            return { ok: false, status: 'skipped', skipReason: 'no_opt_in' }
        }

        // Anti double-envoi : si un recipient 'sent' existe déjà → skip.
        const { data: existing } = await admin
            .from('marketing_campaign_recipients')
            .select('id, status')
            .eq('campaign_id', input.campaignId)
            .ilike('email', emailLc)
            .maybeSingle()

        if (existing?.status === 'sent') {
            return { ok: false, status: 'skipped', skipReason: 'duplicate' }
        }
    }

    const unsubscribeUrl = buildUnsubscribeUrl(
        SEO_BASE_URL,
        emailLc,
        input.isTest ? null : input.campaignId
    )

    // Toutes les variables marketing reçoivent unsubscribeUrl + name (prénom).
    const firstName = input.firstName?.trim() || ''
    const fullData: Record<string, unknown> = {
        ...input.templateData,
        name: input.templateData.name ?? firstName,
        prenom: input.templateData.prenom ?? firstName,
        firstName: input.templateData.firstName ?? firstName,
        email: emailLc,
        unsubscribeUrl,
        unsubscribe_url: unsubscribeUrl,
        campaignName: input.templateData.campaignName ?? null,
    }

    let invokeError: unknown = null
    let resendId: string | null = null
    let errorBody: string | null = null

    try {
        const { data, error } = await admin.functions.invoke('send-email', {
            body: {
                to: emailLc,
                subject: input.subject,
                templateId: input.edgeTemplateId,
                data: fullData,
            },
        })
        if (error) {
            invokeError = error
            // supabase-js masque le body Resend derrière "Edge Function returned a non-2xx status code".
            // On va chercher la vraie réponse pour pouvoir diagnostiquer (rate-limit, domaine non vérifié, etc.).
            const ctx = (error as { context?: unknown }).context
            if (ctx && typeof (ctx as Response).text === 'function') {
                try {
                    errorBody = await (ctx as Response).text()
                } catch {
                    /* ignore */
                }
            }
        } else {
            resendId = (data as { id?: string } | null)?.id ?? null
        }
    } catch (err) {
        invokeError = err
    }

    const baseMessage =
        invokeError instanceof Error
            ? invokeError.message
            : invokeError
              ? String(invokeError)
              : null
    const errorMessage = invokeError
        ? errorBody
            ? `${baseMessage ?? 'invoke_error'} | body=${errorBody.slice(0, 400)}`
            : baseMessage
        : null

    if (!input.isTest) {
        await upsertRecipient(admin, input, {
            status: invokeError ? 'failed' : 'sent',
            sent_at: invokeError ? null : new Date().toISOString(),
            resend_email_id: resendId,
            error_message: errorMessage,
        })
    }

    if (input.performedBy) {
        await logAdminAction({
            action: input.isTest ? 'marketing_test_email' : 'marketing_email_sent',
            target_table: 'marketing_campaigns',
            target_id: input.isTest ? null : input.campaignId,
            payload: {
                to: emailLc,
                subject: input.subject,
                template: input.edgeTemplateId,
                campaign_id: input.isTest ? null : input.campaignId,
                resend_id: resendId,
                error: errorMessage,
            },
            performed_by: input.performedBy,
        })
    }

    if (invokeError) {
        return { ok: false, status: 'failed', error: errorMessage ?? 'unknown error' }
    }
    return { ok: true, status: 'sent', resendId: resendId ?? undefined }
}

async function upsertRecipient(
    admin: any,
    input: SendMarketingEmailInput,
    patch: {
        status: 'pending' | 'sent' | 'failed' | 'skipped' | 'unsubscribed'
        skip_reason?: string | null
        sent_at?: string | null
        resend_email_id?: string | null
        error_message?: string | null
        contact_id?: string | null
    }
): Promise<void> {
    if (!input.campaignId || input.campaignId === 'TEST') return

    const emailLc = input.to.trim().toLowerCase()
    const baseRow = {
        campaign_id: input.campaignId,
        email: emailLc,
        contact_id: patch.contact_id ?? input.contactId ?? null,
    }

    // Upsert sur (campaign_id, lower(email)) — le unique index est sur lower(email),
    // mais Supabase n'a pas d'expression-key onConflict. Fallback : insert OR update.
    const { data: existing } = await admin
        .from('marketing_campaign_recipients')
        .select('id')
        .eq('campaign_id', input.campaignId)
        .ilike('email', emailLc)
        .maybeSingle()

    if (existing?.id) {
        await admin
            .from('marketing_campaign_recipients')
            .update({
                status: patch.status,
                skip_reason: patch.skip_reason ?? null,
                sent_at: patch.sent_at ?? null,
                resend_email_id: patch.resend_email_id ?? null,
                error_message: patch.error_message ?? null,
            })
            .eq('id', existing.id)
    } else {
        await admin.from('marketing_campaign_recipients').insert({
            ...baseRow,
            status: patch.status,
            skip_reason: patch.skip_reason ?? null,
            sent_at: patch.sent_at ?? null,
            resend_email_id: patch.resend_email_id ?? null,
            error_message: patch.error_message ?? null,
        })
    }
}
