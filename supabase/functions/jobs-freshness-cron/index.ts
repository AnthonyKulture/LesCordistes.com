// LesCordistes — Jobs freshness cron
//
// Schedule (pg_cron) : daily 06:00 UTC
//   select cron.schedule(
//     'jobs-freshness-cron',
//     '0 6 * * *',
//     $$ select net.http_post(
//          url := 'https://esvnvxkbnhvxpnlhyjsw.supabase.co/functions/v1/jobs-freshness-cron',
//          headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.cron_secret'))
//        );
//     $$
//   );
//
// Tasks per run:
//   A. For 'live' jobs older than 10 days with no revalidation email yet → send
//      revalidation email + mark revalidation_email_sent_at.
//   B. For 'live' jobs older than 15 days never revalidated → set status='expired'.
//
// Re-revalidation: window resets when last_validated_at is updated; we use
// coalesce(last_validated_at, created_at) as the freshness anchor.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const REVALIDATION_SECRET = Deno.env.get('REVALIDATION_SECRET')!;
const CRON_SECRET = Deno.env.get('CRON_SECRET') || '';
const SEO_BASE_URL = Deno.env.get('SEO_BASE_URL') || 'https://www.lescordistes.com';

const TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

// ─── HMAC token signing (Deno Web Crypto) ──────────────────────────────────────
async function sign(jobId: string, clientIdentifier: string): Promise<string> {
    const exp = Date.now() + TTL_MS;
    const payload = `${jobId}.${clientIdentifier}.${exp}`;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        enc.encode(REVALIDATION_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
    const sigHex = Array.from(new Uint8Array(sigBuf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    const full = `${payload}.${sigHex}`;
    // base64url
    return btoa(full).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

interface JobRow {
    id: string;
    title: string;
    location_city: string | null;
    created_by: string | null;
    client_contact_info: { name?: string; first_name?: string; email?: string } | null;
}

async function sendRevalidationEmail(job: JobRow, supabase: any) {
    // Determine recipient: client_contact_info.email is the source of truth
    // (filled for both registered and guest clients).
    const email = job.client_contact_info?.email;
    if (!email) {
        console.warn(`[freshness-cron] job ${job.id} has no client email, skipping`);
        return false;
    }

    // clientIdentifier for the token: use created_by UUID if present, fallback to email.
    const clientIdentifier = job.created_by || email;
    const token = await sign(job.id, clientIdentifier);
    const validateUrl = `${SEO_BASE_URL}/api/jobs/validate?token=${encodeURIComponent(token)}`;
    const name =
        job.client_contact_info?.first_name ||
        job.client_contact_info?.name?.split(' ')[0] ||
        '';

    const { error } = await supabase.functions.invoke('send-email', {
        body: {
            to: email,
            subject: `Votre mission « ${job.title} » est-elle toujours d'actualité ?`,
            templateId: 'job-revalidation-request',
            data: {
                name,
                title: job.title,
                city: job.location_city ?? '',
                validateUrl,
            },
        },
    });
    if (error) {
        console.error(`[freshness-cron] send-email error for job ${job.id}:`, error);
        return false;
    }
    return true;
}

serve(async (req: Request) => {
    // Optional protection: require CRON_SECRET in Authorization header
    if (CRON_SECRET) {
        const auth = req.headers.get('Authorization') || '';
        if (auth !== `Bearer ${CRON_SECRET}`) {
            return new Response('Unauthorized', { status: 401 });
        }
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
    });

    const now = new Date();
    const tenDaysAgo = new Date(now.getTime() - 10 * 86_400_000).toISOString();
    const fifteenDaysAgo = new Date(now.getTime() - 15 * 86_400_000).toISOString();

    // ─── A. Send revalidation emails (J+10) ────────────────────────────────
    // Use coalesce(last_validated_at, created_at) < J-10 AND revalidation_email_sent_at IS NULL
    // OR (revalidation_email_sent_at < last_validated_at) → re-revalidation cycle.
    //
    // For simplicity (v1), we use: status='live' AND revalidation_email_sent_at IS NULL
    //   AND coalesce(last_validated_at, created_at) < J-10
    // After last_validated_at is set, the next cycle requires manually clearing
    // revalidation_email_sent_at — we do that automatically when last_validated_at
    // is updated via /api/jobs/validate.

    const { data: toRevalidate, error: errA } = await supabase
        .from('jobs')
        .select('id, title, location_city, created_by, client_contact_info, created_at, last_validated_at')
        .eq('status', 'live')
        .is('revalidation_email_sent_at', null)
        .or(`last_validated_at.lt.${tenDaysAgo},and(last_validated_at.is.null,created_at.lt.${tenDaysAgo})`);

    if (errA) {
        console.error('[freshness-cron] query A error:', errA);
        return new Response(JSON.stringify({ error: errA.message }), { status: 500 });
    }

    let emailsSent = 0;
    for (const job of toRevalidate ?? []) {
        const ok = await sendRevalidationEmail(job as JobRow, supabase);
        if (ok) {
            await supabase
                .from('jobs')
                .update({ revalidation_email_sent_at: now.toISOString() })
                .eq('id', job.id);
            emailsSent++;
        }
    }

    // ─── B. Auto-archive (J+15) ─────────────────────────────────────────────
    const { data: expired, error: errB } = await supabase
        .from('jobs')
        .update({ status: 'expired', expired_at: now.toISOString() })
        .eq('status', 'live')
        .is('last_validated_at', null)
        .lt('created_at', fifteenDaysAgo)
        .select('id');

    if (errB) {
        console.error('[freshness-cron] query B error:', errB);
        return new Response(JSON.stringify({ error: errB.message }), { status: 500 });
    }

    return new Response(
        JSON.stringify({
            ok: true,
            emailsSent,
            expiredCount: expired?.length ?? 0,
            timestamp: now.toISOString(),
        }),
        { headers: { 'Content-Type': 'application/json' } }
    );
});
