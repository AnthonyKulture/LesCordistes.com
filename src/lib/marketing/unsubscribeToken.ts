// Token HMAC signé pour les liens de désinscription marketing.
// Format identique à src/lib/revalidation-token.ts (séparateur `~` pour
// supporter les emails contenant des `.`).

import { createHmac, timingSafeEqual } from 'crypto'

const SEP = '~'
const TTL_MS = 365 * 24 * 60 * 60 * 1000 // 1 an

function b64urlEncode(input: string): string {
    return Buffer.from(input, 'utf8').toString('base64url')
}

function b64urlDecode(input: string): string {
    return Buffer.from(input, 'base64url').toString('utf8')
}

function getSecret(): string {
    const s =
        process.env.MARKETING_UNSUBSCRIBE_SECRET ||
        process.env.OPTOUT_SECRET ||
        ''
    if (!s) {
        throw new Error(
            'MARKETING_UNSUBSCRIBE_SECRET (ou OPTOUT_SECRET en fallback) doit être défini dans les variables d\'environnement'
        )
    }
    return s
}

export function signUnsubscribeToken(
    email: string,
    campaignId: string | null = null
): string {
    const exp = Date.now() + TTL_MS
    const payload = `${email}${SEP}${campaignId ?? ''}${SEP}${exp}`
    const sig = createHmac('sha256', getSecret()).update(payload).digest('hex')
    return b64urlEncode(`${payload}${SEP}${sig}`)
}

export interface UnsubscribePayload {
    email: string
    campaignId: string | null
    expiresAt: Date
}

export function verifyUnsubscribeToken(
    token: string
): UnsubscribePayload | null {
    try {
        const decoded = b64urlDecode(token)
        const parts = decoded.split(SEP)
        if (parts.length !== 4) return null

        const [email, campaignIdRaw, expRaw, sig] = parts
        if (!email || !sig) return null

        const exp = Number(expRaw)
        if (!Number.isFinite(exp) || exp < Date.now()) return null

        const expectedPayload = `${email}${SEP}${campaignIdRaw}${SEP}${expRaw}`
        const expectedSig = createHmac('sha256', getSecret())
            .update(expectedPayload)
            .digest('hex')

        const a = Buffer.from(sig, 'utf8')
        const b = Buffer.from(expectedSig, 'utf8')
        if (a.length !== b.length) return null
        if (!timingSafeEqual(a, b)) return null

        return {
            email,
            campaignId: campaignIdRaw || null,
            expiresAt: new Date(exp),
        }
    } catch {
        return null
    }
}

export function buildUnsubscribeUrl(
    baseUrl: string,
    email: string,
    campaignId: string | null = null
): string {
    const token = signUnsubscribeToken(email, campaignId)
    const u = new URL('/marketing/unsubscribe', baseUrl)
    u.searchParams.set('token', token)
    return u.toString()
}
