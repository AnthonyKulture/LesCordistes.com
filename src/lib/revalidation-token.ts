import { createHmac, timingSafeEqual } from 'crypto'

const TTL_MS = 14 * 24 * 60 * 60 * 1000 // 14 jours

function getSecret(): string {
    const s = process.env.REVALIDATION_SECRET
    if (!s || s.length < 32) {
        throw new Error('REVALIDATION_SECRET missing or too short (min 32 chars)')
    }
    return s
}

function toBase64Url(buf: Buffer): string {
    return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(str: string): Buffer {
    const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4))
    return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64')
}

// Séparateur `~` : impossible dans UUID (0-9a-f-), email (rare, pas dans gmail/surly/etc.),
// digits, hex. Évite le bug de `.split('.')` quand l'email contient des points.
const SEP = '~'

export function signRevalidationToken(jobId: string, clientIdentifier: string): string {
    const exp = Date.now() + TTL_MS
    const payload = `${jobId}${SEP}${clientIdentifier}${SEP}${exp}`
    const sig = createHmac('sha256', getSecret()).update(payload).digest('hex')
    return toBase64Url(Buffer.from(`${payload}${SEP}${sig}`))
}

export type VerifyResult =
    | { ok: true; jobId: string; clientIdentifier: string }
    | { ok: false; reason: 'decode_error' | 'bad_format' | 'bad_exp' | 'expired' | 'bad_signature'; debug?: Record<string, unknown> }

export function verifyRevalidationTokenDetailed(token: string): VerifyResult {
    let decoded: string
    try {
        decoded = fromBase64Url(token).toString('utf8')
    } catch {
        return { ok: false, reason: 'decode_error' }
    }
    const parts = decoded.split(SEP)
    if (parts.length !== 4) {
        return {
            ok: false,
            reason: 'bad_format',
            debug: { partsCount: parts.length, sepUsed: SEP, decodedSample: decoded.slice(0, 60) },
        }
    }
    const [jobId, clientIdentifier, expStr, sig] = parts
    const exp = Number(expStr)
    if (!Number.isFinite(exp)) {
        return { ok: false, reason: 'bad_exp', debug: { expStr } }
    }
    if (Date.now() > exp) {
        return { ok: false, reason: 'expired', debug: { exp, now: Date.now() } }
    }
    const expected = createHmac('sha256', getSecret())
        .update(`${jobId}${SEP}${clientIdentifier}${SEP}${exp}`)
        .digest('hex')
    const a = Buffer.from(sig, 'hex')
    const b = Buffer.from(expected, 'hex')
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
        return { ok: false, reason: 'bad_signature', debug: { jobId, clientIdentifier } }
    }
    return { ok: true, jobId, clientIdentifier }
}

export function verifyRevalidationToken(
    token: string
): { jobId: string; clientIdentifier: string } | null {
    const r = verifyRevalidationTokenDetailed(token)
    return r.ok ? { jobId: r.jobId, clientIdentifier: r.clientIdentifier } : null
}
