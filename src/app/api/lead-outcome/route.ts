// Route publique de collecte d'outcome (relance J+15 des déblocages de leads).
// GET  /api/lead-outcome?token=<hmac>&outcome=won|lost|no_response  → page de confirmation, N'ÉCRIT RIEN
// POST /api/lead-outcome (token + outcome en form-urlencoded)       → enregistre l'issue
//
// Le token est signé côté edge function lead-outcome-cron (HMAC SHA-256,
// format `id~exp~sig` base64url — même famille que src/lib/marketing/
// unsubscribeToken.ts et src/lib/revalidation-token.ts, séparateur `~`).
// Secret : LEAD_OUTCOME_SECRET, avec repli sur MARKETING_UNSUBSCRIBE_SECRET
// puis OPTOUT_SECRET — la chaîne de repli DOIT être identique à celle de
// supabase/functions/lead-outcome-cron/index.ts, sinon aucun token ne se
// vérifie. Premier clic gagnant : l'outcome n'est posé que s'il est encore NULL.
//
// ─────────────────────────────────────────────────────────────────────────────
// POURQUOI LE GET N'ÉCRIT PLUS
//
// L'email de relance porte les trois liens en clair, `won` en premier. Les
// passerelles de sécurité mail (Outlook Safe Links, Proofpoint URL Defense,
// Mimecast, Barracuda) et les prefetchers pré-visitent les URL d'un message,
// dans l'ordre. Tant que le GET écrivait, le premier lien visité par un
// scanner figeait l'issue — et ce premier lien est `won`. La mesure se
// fabriquait donc des chantiers gagnés, exactement dans le sens qui flatte :
// `won` alimente le numérateur du taux de réponse, les deux termes du taux de
// transformation, et fait BAISSER le coût par chantier gagné. Rien n'étant
// journalisé, un faux clic est indiscernable d'un vrai. Le garde-fou n=20 de
// /admin/analytics protège du bruit d'échantillonnage, pas de données fausses.
//
// Le GET est donc devenu inerte : il rend un formulaire. Aucun pré-visiteur
// n'envoie de POST — l'écriture exige une action humaine délibérée. Le contrat
// des liens de l'email est inchangé, seule leur destination l'est.

import { createHmac, timingSafeEqual } from 'crypto'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SEP = '~'

const OUTCOME_LABELS: Record<string, string> = {
    won: 'Chantier obtenu — félicitations !',
    lost: 'Chantier non obtenu',
    no_response: 'Le client n\'a pas répondu',
}

function getSecret(): string | null {
    return (
        process.env.LEAD_OUTCOME_SECRET ||
        process.env.MARKETING_UNSUBSCRIBE_SECRET ||
        process.env.OPTOUT_SECRET ||
        null
    )
}

function verifyOutcomeToken(token: string): string | null {
    try {
        const secret = getSecret()
        if (!secret) {
            console.error('[lead-outcome] LEAD_OUTCOME_SECRET manquant (et aucun repli défini)')
            return null
        }
        const decoded = Buffer.from(token, 'base64url').toString('utf8')
        const parts = decoded.split(SEP)
        if (parts.length !== 3) return null

        const [leadId, expRaw, sig] = parts
        if (!leadId || !sig) return null
        if (!/^[0-9a-f-]{36}$/i.test(leadId)) return null

        const exp = Number(expRaw)
        if (!Number.isFinite(exp) || exp < Date.now()) return null

        const expectedSig = createHmac('sha256', secret)
            .update(`${leadId}${SEP}${expRaw}`)
            .digest('hex')

        const a = Buffer.from(sig, 'utf8')
        const b = Buffer.from(expectedSig, 'utf8')
        if (a.length !== b.length) return null
        if (!timingSafeEqual(a, b)) return null

        return leadId
    } catch {
        return null
    }
}

function page(title: string, message: string, status = 200): Response {
    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="robots" content="noindex"/>
<title>${title} · LesCordistes</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Inter,Arial,sans-serif;">
<div style="max-width:480px;margin:64px auto;padding:0 16px;">
  <div style="background:#ffffff;border-radius:12px;padding:40px 32px;text-align:center;box-shadow:0 2px 12px rgba(36,51,85,0.08);">
    <p style="font-size:13px;font-weight:700;color:#5B8DDB;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 16px;">LesCordistes.com</p>
    <h1 style="font-size:22px;font-weight:700;color:#243355;margin:0 0 12px;line-height:30px;">${title}</h1>
    <p style="font-size:15px;color:#64748b;line-height:24px;margin:0 0 28px;">${message}</p>
    <a href="https://www.lescordistes.com/jobs" style="display:inline-block;background:#243355;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:13px 26px;border-radius:6px;">Voir les missions disponibles</a>
  </div>
  <p style="font-size:12px;color:#94a3b8;text-align:center;margin:20px 0 0;">© 2026 LesCordistes.com</p>
</div>
</body>
</html>`
    return new Response(html, {
        status,
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    })
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

// Page de confirmation : le seul rendu du GET. Le bouton POSTe vers la même
// route ; aucun robot d'inspection de liens ne franchit cette étape.
function confirmPage(token: string, outcome: string): Response {
    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="robots" content="noindex"/>
<title>Confirmez votre réponse · LesCordistes</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Inter,Arial,sans-serif;">
<div style="max-width:480px;margin:64px auto;padding:0 16px;">
  <div style="background:#ffffff;border-radius:12px;padding:40px 32px;text-align:center;box-shadow:0 2px 12px rgba(36,51,85,0.08);">
    <p style="font-size:13px;font-weight:700;color:#5B8DDB;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 16px;">LesCordistes.com</p>
    <h1 style="font-size:22px;font-weight:700;color:#243355;margin:0 0 12px;line-height:30px;">Confirmez votre réponse</h1>
    <p style="font-size:15px;color:#64748b;line-height:24px;margin:0 0 8px;">Vous êtes sur le point de répondre&nbsp;:</p>
    <p style="font-size:17px;font-weight:600;color:#243355;line-height:26px;margin:0 0 24px;">«&nbsp;${escapeHtml(OUTCOME_LABELS[outcome])}&nbsp;»</p>
    <form method="post" action="/api/lead-outcome" style="margin:0;">
      <input type="hidden" name="token" value="${escapeHtml(token)}"/>
      <input type="hidden" name="outcome" value="${escapeHtml(outcome)}"/>
      <button type="submit" style="display:inline-block;background:#243355;color:#ffffff;font-size:15px;font-weight:600;border:0;cursor:pointer;padding:13px 26px;border-radius:6px;">Confirmer ma réponse</button>
    </form>
    <p style="font-size:13px;color:#94a3b8;line-height:20px;margin:20px 0 0;">Rien n'est enregistré tant que vous n'avez pas confirmé. Vous pouvez fermer cette page sans répondre.</p>
  </div>
  <p style="font-size:12px;color:#94a3b8;text-align:center;margin:20px 0 0;">© 2026 LesCordistes.com</p>
</div>
</body>
</html>`
    return new Response(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    })
}

// Un token qui a survécu au HMAC peut malgré tout contenir des caractères hors
// alphabet base64url : Buffer.from(..., 'base64url') les ignore silencieusement.
// On les refuse en amont, en plus de l'échappement HTML, pour que la valeur
// réinjectée dans le formulaire soit celle qui a été signée.
function isWellFormedToken(token: string): boolean {
    return /^[A-Za-z0-9_-]+$/.test(token)
}

// GET : ne touche pas la base. Il valide le lien et rend le formulaire.
export async function GET(req: Request) {
    const url = new URL(req.url)
    const token = url.searchParams.get('token') || ''
    const outcome = url.searchParams.get('outcome') || ''

    if (!token || !isWellFormedToken(token) || !Object.prototype.hasOwnProperty.call(OUTCOME_LABELS, outcome)) {
        return page('Lien invalide', 'Ce lien est incomplet ou mal formé. Utilisez les boutons de l\'email que vous avez reçu.', 400)
    }

    if (!verifyOutcomeToken(token)) {
        return page('Lien invalide ou expiré', 'Ce lien de suivi n\'est plus valide. Aucune action n\'a été enregistrée.', 400)
    }

    return confirmPage(token, outcome)
}

// POST : la seule écriture. Déclenché par le bouton de la page de confirmation.
export async function POST(req: Request) {
    let form: FormData
    try {
        form = await req.formData()
    } catch {
        return page('Lien invalide', 'Ce formulaire est incomplet ou mal formé. Utilisez les boutons de l\'email que vous avez reçu.', 400)
    }

    const token = typeof form.get('token') === 'string' ? (form.get('token') as string) : ''
    const outcome = typeof form.get('outcome') === 'string' ? (form.get('outcome') as string) : ''

    if (!token || !isWellFormedToken(token) || !Object.prototype.hasOwnProperty.call(OUTCOME_LABELS, outcome)) {
        return page('Lien invalide', 'Ce formulaire est incomplet ou mal formé. Utilisez les boutons de l\'email que vous avez reçu.', 400)
    }

    const leadId = verifyOutcomeToken(token)
    if (!leadId) {
        return page('Lien invalide ou expiré', 'Ce lien de suivi n\'est plus valide. Aucune action n\'a été enregistrée.', 400)
    }

    // Cast any : outcome/outcome_at (migration 20260901d) pas encore dans
    // database.types.ts — à régénérer après passage de la migration en prod.
    const admin = createSupabaseAdminClient() as any

    const { data, error } = await admin
        .from('unlocked_leads')
        .update({ outcome, outcome_at: new Date().toISOString() })
        .eq('id', leadId)
        .is('outcome', null)
        .select('id')

    if (error) {
        // PGRST204 = colonne inconnue du schema cache PostgREST (colonnes outcome
        // absentes : migration 20260901d pas encore passée) — 42703 par ceinture.
        if (error.code === 'PGRST204' || error.code === '42703') {
            console.error('[lead-outcome] colonnes outcome absentes (migration 20260901d non appliquée)')
            return page('Service momentanément indisponible', 'Réessayez dans quelques instants — votre réponse n\'a pas été perdue, le lien reste valable.', 503)
        }
        console.error('[lead-outcome] update error:', error.message)
        return page('Une erreur est survenue', 'Votre réponse n\'a pas pu être enregistrée. Réessayez plus tard, le lien reste valable.', 500)
    }

    if (!data || data.length === 0) {
        const { data: existing } = await admin
            .from('unlocked_leads')
            .select('outcome')
            .eq('id', leadId)
            .maybeSingle()

        if (existing?.outcome) {
            return page('Réponse déjà enregistrée', 'Merci, votre retour sur ce chantier a déjà été pris en compte. Seule la première réponse est conservée.')
        }
        return page('Lien invalide', 'Ce lien ne correspond à aucun déblocage connu.', 404)
    }

    return page(
        'Merci pour votre retour !',
        `Votre réponse « ${OUTCOME_LABELS[outcome]} » a bien été enregistrée. Elle nous aide à améliorer la qualité des missions proposées sur la plateforme.`
    )
}
