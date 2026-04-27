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
// Séparateur `~` (synchronisé avec src/lib/revalidation-token.ts) : évite le bug
// de split('.') quand le clientIdentifier (email) contient des points.
const SEP = '~';

async function sign(jobId: string, clientIdentifier: string): Promise<string> {
    const exp = Date.now() + TTL_MS;
    const payload = `${jobId}${SEP}${clientIdentifier}${SEP}${exp}`;
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
    const full = `${payload}${SEP}${sigHex}`;
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

async function sendRevalidationEmail(
    job: JobRow,
    supabase: any
): Promise<{ ok: boolean; reason?: string }> {
    const email = job.client_contact_info?.email;
    if (!email) {
        return { ok: false, reason: 'no_email' };
    }

    const clientIdentifier = job.created_by || email;
    const token = await sign(job.id, clientIdentifier);
    const validateUrl = `${SEO_BASE_URL}/api/jobs/validate?token=${encodeURIComponent(token)}`;
    const name =
        job.client_contact_info?.first_name ||
        job.client_contact_info?.name?.split(' ')[0] ||
        '';

    const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            to: email,
            subject: `Votre mission « ${job.title} » est-elle toujours d'actualité ?`,
            templateId: 'job-revalidation-request',
            data: {
                name,
                title: job.title,
                city: job.location_city ?? '',
                validateUrl,
            },
        }),
    });

    if (!res.ok) {
        const body = await res.text().catch(() => '');
        return { ok: false, reason: `send_${res.status}: ${body.slice(0, 300)}` };
    }
    return { ok: true };
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
    // J+5 : seuil d'envoi de l'email de revalidation
    const revalidationThreshold = new Date(now.getTime() - 5 * 86_400_000).toISOString();
    // J+15 : seuil d'auto-archivage (status='expired')
    const archiveThreshold = new Date(now.getTime() - 15 * 86_400_000).toISOString();

    // ─── A. Send revalidation emails (J+5) ─────────────────────────────────
    // Logique : coalesce(last_validated_at, created_at) < J-5 AND revalidation_email_sent_at IS NULL.
    // Implémentée en 2 requêtes (PostgREST `.or(...)` casse sur les ISO timestamps
    // contenant des `.` car `.` est le séparateur field.op.value).
    const SELECT_COLS =
        'id, title, location_city, created_by, client_contact_info, created_at, last_validated_at';

    // A1 — jobs déjà revalidés au moins une fois mais last_validated_at < J-5.
    const { data: a1, error: errA1 } = await supabase
        .from('jobs')
        .select(SELECT_COLS)
        .eq('status', 'live')
        .is('revalidation_email_sent_at', null)
        .not('last_validated_at', 'is', null)
        .lt('last_validated_at', revalidationThreshold);

    // A2 — jobs jamais revalidés, créés il y a > 5 jours.
    const { data: a2, error: errA2 } = await supabase
        .from('jobs')
        .select(SELECT_COLS)
        .eq('status', 'live')
        .is('revalidation_email_sent_at', null)
        .is('last_validated_at', null)
        .lt('created_at', revalidationThreshold);

    if (errA1 || errA2) {
        console.error('[freshness-cron] query A error:', errA1 || errA2);
        return new Response(
            JSON.stringify({ error: (errA1 || errA2)?.message }),
            { status: 500 }
        );
    }

    const seen = new Set<string>();
    const toRevalidate: JobRow[] = [];
    for (const j of [...(a1 ?? []), ...(a2 ?? [])]) {
        if (!seen.has(j.id)) {
            seen.add(j.id);
            toRevalidate.push(j as JobRow);
        }
    }

    let emailsSent = 0;
    const debug: Array<{ id: string; ok: boolean; reason?: string }> = [];
    for (const job of toRevalidate ?? []) {
        const result = await sendRevalidationEmail(job as JobRow, supabase);
        debug.push({ id: job.id, ok: result.ok, reason: result.reason });
        if (result.ok) {
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
        .lt('created_at', archiveThreshold)
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
            debug: {
                a1Count: a1?.length ?? 0,
                a2Count: a2?.length ?? 0,
                uniqueCount: toRevalidate.length,
                threshold: revalidationThreshold,
                perJob: debug,
                envCheck: {
                    SUPABASE_URL: SUPABASE_URL?.slice(0, 40) || 'MISSING',
                    SERVICE_ROLE_LEN: SUPABASE_SERVICE_ROLE_KEY?.length || 0,
                    SERVICE_ROLE_PREFIX: SUPABASE_SERVICE_ROLE_KEY?.slice(0, 10) || '',
                    SERVICE_ROLE_DOTS: (SUPABASE_SERVICE_ROLE_KEY?.match(/\./g) || []).length,
                },
            },
        }),
        { headers: { 'Content-Type': 'application/json' } }
    );
});
