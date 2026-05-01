// Endpoint public de désinscription marketing.
// Accessible sans authentification, protégé par token HMAC signé côté serveur.
// IMPORTANT : ne touche QUE marketing_contacts + marketing_unsubscribes.
// Les emails transactionnels (welcome, payment-receipt, password-reset, etc.)
// continuent d'être envoyés.

import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { verifyUnsubscribeToken } from '@/lib/marketing/unsubscribeToken'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/* eslint-disable @typescript-eslint/no-explicit-any */

function page(title: string, body: string, status: number): NextResponse {
    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>${title} — LesCordistes</title>
<style>
  body{font-family:Inter,system-ui,sans-serif;background:#f1f5f9;margin:0;padding:60px 16px;color:#243355}
  .card{max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:48px 40px;text-align:center;box-shadow:0 2px 12px rgba(36,51,85,.08)}
  h1{font-size:1.3rem;margin:0 0 16px;color:#243355;font-weight:700}
  p{margin:0 0 24px;color:#475569;line-height:1.65;font-size:.95rem}
  a{display:inline-block;margin-top:8px;color:#243355;font-size:.9rem;text-decoration:none;border:1px solid #e2e8f0;padding:10px 18px;border-radius:6px}
  a:hover{border-color:#243355}
</style>
</head>
<body>
<div class="card">
  <h1>${title}</h1>
  <p>${body}</p>
  <a href="https://www.lescordistes.com">Retour à lescordistes.com</a>
</div>
</body>
</html>`
    return new NextResponse(html, {
        status,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
}

function hashIp(ip: string | null): string | null {
    if (!ip) return null
    return createHash('sha256').update(ip).digest('hex').slice(0, 32)
}

async function processUnsubscribe(
    req: NextRequest,
    tokenSource: 'query' | 'post'
): Promise<NextResponse> {
    const url = new URL(req.url)
    const token =
        tokenSource === 'query'
            ? url.searchParams.get('token')
            : url.searchParams.get('token') ||
              (await safeFormToken(req))

    if (!token) {
        return page(
            'Lien invalide',
            'Ce lien de désinscription est incomplet. Contactez-nous à contact@lescordistes.com si nécessaire.',
            400
        )
    }

    const payload = verifyUnsubscribeToken(token)
    if (!payload) {
        return page(
            'Lien invalide ou expiré',
            'Ce lien de désinscription est invalide ou expiré. Contactez-nous à contact@lescordistes.com si nécessaire.',
            400
        )
    }

    const admin = createSupabaseAdminClient() as any
    const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        null
    const userAgent = req.headers.get('user-agent') || null

    const { data, error } = await admin.rpc('mark_marketing_unsubscribed', {
        p_email: payload.email,
        p_reason: 'unsubscribe_link',
        p_campaign_id: payload.campaignId,
        p_user_agent: userAgent,
        p_ip_hash: hashIp(ip),
    })

    if (error) {
        console.error('[marketing/unsubscribe] RPC error:', error)
        return page(
            'Erreur technique',
            "Erreur technique lors de la désinscription. Contactez anthony@lescordistes.com.",
            500
        )
    }

    // Désinscrit aussi des alertes pro-mission (idempotent — no-op si l'email
    // n'a pas de souscription). Le token unsub est partagé entre tous les
    // emails marketing.
    const { error: alertErr } = await admin.rpc('unsubscribe_pro_alert', {
        p_email: payload.email,
    })
    if (alertErr) {
        console.warn('[marketing/unsubscribe] pro-alerts unsub warning:', alertErr.message)
    }

    if (data && (data as any).ok === false) {
        return page(
            'Lien invalide',
            "Ce lien n'est pas valide.",
            400
        )
    }

    return page(
        'Vous êtes désinscrit',
        'Votre adresse a bien été retirée des emails marketing. Les notifications transactionnelles (paiements, mises à jour de mission) continuent d\'arriver.',
        200
    )
}

async function safeFormToken(req: NextRequest): Promise<string | null> {
    try {
        const ct = req.headers.get('content-type') || ''
        if (ct.includes('application/x-www-form-urlencoded') || ct.includes('multipart/form-data')) {
            const fd = await req.formData()
            const t = fd.get('token')
            return typeof t === 'string' ? t : null
        }
        return null
    } catch {
        return null
    }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
    return processUnsubscribe(req, 'query')
}

// Conformité RFC 8058 (List-Unsubscribe-Post One-Click) — accepte POST.
export async function POST(req: NextRequest): Promise<NextResponse> {
    return processUnsubscribe(req, 'post')
}
