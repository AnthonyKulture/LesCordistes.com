import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { verifyRevalidationToken } from '@/lib/revalidation-token'
import { SEO_BASE_URL } from '@/constants/seoConfig'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    const url = new URL(req.url)
    const token = url.searchParams.get('token')

    if (!token) {
        console.warn('[validate] no token in request')
        return NextResponse.redirect(`${SEO_BASE_URL}/mission-confirmee?status=invalid`)
    }

    const decoded = verifyRevalidationToken(token)
    if (!decoded) {
        console.warn('[validate] token verification failed (signature or expiry) — check REVALIDATION_SECRET parity Vercel ↔ Supabase')
        return NextResponse.redirect(`${SEO_BASE_URL}/mission-confirmee?status=expired`)
    }

    // Cast to any: les nouvelles colonnes (last_validated_at, revalidation_email_sent_at)
    // ne sont pas encore dans database.types.ts (à régénérer après migration en prod).
    const admin = createSupabaseAdminClient() as any

    // Le clientIdentifier peut être soit un UUID (created_by) soit un email (guest).
    // On accepte les deux et on filtre par jobId + status='live' pour rester safe.
    const isUuid = /^[0-9a-f-]{36}$/i.test(decoded.clientIdentifier)

    // On reset revalidation_email_sent_at pour que le prochain cycle J+5 puisse repartir
    // (sinon le cron ne renverra jamais d'email même si last_validated_at devient ancien).
    let query = admin
        .from('jobs')
        .update({
            last_validated_at: new Date().toISOString(),
            revalidation_email_sent_at: null,
        })
        .eq('id', decoded.jobId)
        .eq('status', 'live')

    if (isUuid) {
        query = query.eq('created_by', decoded.clientIdentifier)
    } else {
        // Guest client : on vérifie que l'email du token correspond à celui du job
        query = query.eq('client_contact_info->>email', decoded.clientIdentifier)
    }

    const { error, data } = await query.select('id')

    if (error) {
        console.error('[validate] update error:', error.message, { jobId: decoded.jobId, isUuid })
        return NextResponse.redirect(`${SEO_BASE_URL}/mission-confirmee?status=notfound&job=${decoded.jobId}`)
    }
    if (!data || data.length === 0) {
        console.warn('[validate] no row matched', { jobId: decoded.jobId, clientIdentifier: decoded.clientIdentifier, isUuid })
        return NextResponse.redirect(`${SEO_BASE_URL}/mission-confirmee?status=notfound&job=${decoded.jobId}`)
    }

    console.log('[validate] success', { jobId: decoded.jobId })
    return NextResponse.redirect(`${SEO_BASE_URL}/mission-confirmee?status=ok&job=${decoded.jobId}`)
}
