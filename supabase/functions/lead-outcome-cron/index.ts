// LesCordistes — Lead outcome cron (relance J+15)
//
// Schedule (pg_cron) : quotidien 07:30 UTC — posé par la migration
//   supabase/migrations/20260901d-instrumentation.sql (entrée Vault 'cron_secret').
//
// Logique :
//   1. SELECT unlocked_leads débloqués il y a > 15 jours, sans outcome,
//      sans outcome_email_sent_at (batch 50, chronologique).
//   2. Jointures jobs (title, location_city) + profiles (email, prénom).
//   3. Envoi via send-email (template 'lead-outcome') : 3 liens-boutons signés
//      HMAC vers /api/lead-outcome (gagné / perdu / pas de réponse).
//   4. UPDATE outcome_email_sent_at (aussi en cas de destinataire sans email,
//      pour ne pas re-sélectionner la ligne à chaque run).
//
// Sécurité : Authorization Bearer ${CRON_SECRET} — FAIL-CLOSED (secret absent
// = tout refuser). Le secret HMAC des liens (LEAD_OUTCOME_SECRET, replis
// identiques à src/app/api/lead-outcome/route.ts) est lui aussi fail-closed.
// Déployer : npx supabase functions deploy lead-outcome-cron --no-verify-jwt --project-ref esvnvxkbnhvxpnlhyjsw

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const CRON_SECRET = Deno.env.get('CRON_SECRET') || '';
const LEAD_OUTCOME_SECRET =
    Deno.env.get('LEAD_OUTCOME_SECRET') ||
    Deno.env.get('MARKETING_UNSUBSCRIBE_SECRET') ||
    Deno.env.get('OPTOUT_SECRET') ||
    '';
const SEO_BASE_URL = Deno.env.get('SEO_BASE_URL') || 'https://www.lescordistes.com';

const SEND_EMAIL_URL = `${SUPABASE_URL}/functions/v1/send-email`;
const OUTCOME_DELAY_DAYS = 15;
const MAX_PER_RUN = 50;
const TOKEN_TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 jours

// ─── HMAC token signing (Deno Web Crypto) ─────────────────────────────────────
// Format `leadId~exp~sigHex` en base64url, séparateur `~` (convention projet).
// Vérifié par src/app/api/lead-outcome/route.ts — même payload, même secret.
const SEP = '~';

async function signOutcomeToken(leadId: string): Promise<string> {
    const exp = Date.now() + TOKEN_TTL_MS;
    const payload = `${leadId}${SEP}${exp}`;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        enc.encode(LEAD_OUTCOME_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
    const sigHex = Array.from(new Uint8Array(sigBuf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    return btoa(`${payload}${SEP}${sigHex}`).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

interface JobEmbed {
    title: string | null;
    location_city: string | null;
}

interface ProfileEmbed {
    email: string | null;
    first_name: string | null;
    full_name: string | null;
}

interface LeadRow {
    id: string;
    unlocked_at: string;
    jobs: JobEmbed | JobEmbed[] | null;
    profiles: ProfileEmbed | ProfileEmbed[] | null;
}

function one<T>(v: T | T[] | null): T | null {
    if (Array.isArray(v)) return v[0] ?? null;
    return v;
}

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    // Auth fail-closed : sans CRON_SECRET configuré, on refuse tout.
    const auth = req.headers.get('Authorization') || '';
    if (!CRON_SECRET || auth !== `Bearer ${CRON_SECRET}`) {
        return new Response(JSON.stringify({ error: 'unauthorized' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    if (!LEAD_OUTCOME_SECRET) {
        console.error('[lead-outcome-cron] LEAD_OUTCOME_SECRET manquant (et aucun repli) — aucun lien signable.');
        return new Response(JSON.stringify({ error: 'misconfigured: LEAD_OUTCOME_SECRET missing' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
    });

    const cutoff = new Date(Date.now() - OUTCOME_DELAY_DAYS * 86_400_000).toISOString();

    const { data: leads, error: selectErr } = await supabase
        .from('unlocked_leads')
        .select('id, unlocked_at, jobs(title, location_city), profiles(email, first_name, full_name)')
        .is('outcome', null)
        .is('outcome_email_sent_at', null)
        .lt('unlocked_at', cutoff)
        .order('unlocked_at', { ascending: true })
        .limit(MAX_PER_RUN);

    if (selectErr) {
        console.error('[lead-outcome-cron] select error:', selectErr.message);
        return new Response(JSON.stringify({ error: selectErr.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    const rows = (leads ?? []) as unknown as LeadRow[];
    const stats = { processed: 0, sent: 0, skipped_no_email: 0, failed: 0 };

    for (const lead of rows) {
        stats.processed++;

        const job = one(lead.jobs);
        const profile = one(lead.profiles);
        const email = profile?.email || null;

        if (!email) {
            stats.skipped_no_email++;
            await supabase
                .from('unlocked_leads')
                .update({ outcome_email_sent_at: new Date().toISOString() })
                .eq('id', lead.id);
            continue;
        }

        const token = await signOutcomeToken(lead.id);
        const outcomeUrl = (outcome: string) =>
            `${SEO_BASE_URL}/api/lead-outcome?token=${encodeURIComponent(token)}&outcome=${outcome}`;

        const name = profile?.first_name || profile?.full_name?.split(' ')[0] || '';
        const jobTitle = job?.title || 'votre mission';
        const subject = `Avez-vous obtenu ce chantier ? — ${jobTitle}`;

        try {
            const sendRes = await fetch(SEND_EMAIL_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: email,
                    subject,
                    templateId: 'lead-outcome',
                    data: {
                        name,
                        jobTitle,
                        city: job?.location_city ?? '',
                        wonUrl: outcomeUrl('won'),
                        lostUrl: outcomeUrl('lost'),
                        noResponseUrl: outcomeUrl('no_response'),
                    },
                }),
            });

            if (!sendRes.ok) {
                const errText = await sendRes.text().catch(() => '');
                stats.failed++;
                console.error('[lead-outcome-cron] send failed:', lead.id, sendRes.status, errText.slice(0, 300));
                continue;
            }

            await supabase
                .from('unlocked_leads')
                .update({ outcome_email_sent_at: new Date().toISOString() })
                .eq('id', lead.id);
            stats.sent++;
        } catch (err) {
            stats.failed++;
            const msg = err instanceof Error ? err.message : String(err);
            console.error('[lead-outcome-cron] send threw:', lead.id, msg);
        }
    }

    return new Response(
        JSON.stringify({ ok: true, ...stats, cutoff, timestamp: new Date().toISOString() }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
});
