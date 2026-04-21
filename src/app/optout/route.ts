import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface Prospect {
    id: string
    opt_out: boolean
    status: string
}

function adminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

function verifyToken(token: string, secret: string): string | null {
    let decoded: string
    try {
        decoded = Buffer.from(token, 'base64url').toString('utf8')
    } catch {
        return null
    }

    const lastDot = decoded.lastIndexOf('.')
    if (lastDot === -1) return null

    const prospectId = decoded.slice(0, lastDot)
    const receivedSig = decoded.slice(lastDot + 1)

    if (!prospectId || receivedSig.length !== 16) return null

    const expectedSig = createHmac('sha256', secret)
        .update(prospectId)
        .digest('hex')
        .slice(0, 16)

    const a = Buffer.from(receivedSig, 'utf8')
    const b = Buffer.from(expectedSig, 'utf8')
    if (a.length !== b.length) return null
    if (!timingSafeEqual(a, b)) return null

    return prospectId
}

function page(title: string, body: string, status: number): NextResponse {
    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} — LesCordistes</title>
<style>
  body{font-family:system-ui,sans-serif;background:#f5f5f5;margin:0;padding:60px 16px;color:#222}
  .card{max-width:460px;margin:0 auto;background:#fff;border-radius:8px;padding:48px 40px;text-align:center;box-shadow:0 2px 12px rgba(0,0,0,.07)}
  h1{font-size:1.2rem;margin:0 0 14px;color:#243355;font-weight:600}
  p{margin:0 0 36px;color:#555;line-height:1.65;font-size:.95rem}
  a{color:#243355;font-size:.85rem;text-decoration:none;border-bottom:1px solid #ccc;padding-bottom:1px}
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

export async function GET(req: NextRequest): Promise<NextResponse> {
    const token = req.nextUrl.searchParams.get('token')

    if (!token) {
        return page('Lien invalide', 'Ce lien de désinscription est invalide ou incomplet.', 400)
    }

    const secret = process.env.OPTOUT_SECRET
    if (!secret) {
        console.error('[optout] OPTOUT_SECRET manquant')
        return page('Erreur technique', 'Erreur technique, contactez anthony@lescordistes.com', 500)
    }

    const prospectId = verifyToken(token, secret)
    if (!prospectId) {
        return page('Lien invalide', 'Ce lien de désinscription est invalide ou expiré.', 400)
    }

    const supabase = adminClient()

    const { data, error: fetchError } = await supabase
        .from('prospects')
        .select('id, opt_out, status')
        .eq('id', prospectId)
        .single()

    if (fetchError || !data) {
        return page('Prospect introuvable', 'Aucun compte associé à ce lien.', 404)
    }

    const prospect = data as unknown as Prospect

    if (prospect.opt_out) {
        return page(
            'Déjà désinscrit',
            'Vous êtes déjà désinscrit de nos communications. Vous ne recevrez plus d\'email de notre part.',
            200
        )
    }

    const oldStatus = prospect.status

    const { error: updateError } = await supabase
        .from('prospects')
        .update({ opt_out: true, status: 'lost' })
        .eq('id', prospectId)

    if (updateError) {
        console.error('[optout] UPDATE prospects:', updateError)
        return page('Erreur technique', 'Erreur technique, contactez anthony@lescordistes.com', 500)
    }

    const { error: activityError } = await supabase
        .from('activities')
        .insert({
            prospect_id: prospectId,
            kind: 'status_change',
            payload: { from: oldStatus, to: 'lost', reason: 'optout_link_clicked' },
            created_by: 'optout_link',
        })

    if (activityError) {
        console.error('[optout] INSERT activities:', activityError)
    }

    return page(
        'Vous êtes désinscrit',
        'Vous avez bien été retiré de notre liste de prospection. À bientôt.',
        200
    )
}
