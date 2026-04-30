// LesCordistes — Leads follow-up cron
//
// Schedule (pg_cron) : toutes les 5 minutes. Voir migration
//   supabase/migrations/20260430-leads-followup-schedule.sql
//
// Logique :
//   1. SELECT leads créés il y a >= 5 min sans followup_sent_at.
//   2. Pour chaque lead : skip si un job avec le même email a été créé depuis
//      la capture du lead → mark followup_status = 'skipped'.
//   3. Sinon : envoie email perso "Anthony" via send-email + admin-custom
//      avec from: 'Anthony Profit <anthony@lescordistes.com>' et replyTo.
//   4. UPDATE followup_sent_at + status (sent / failed / skipped).
//
// Sécurité : Authorization Bearer ${CRON_SECRET}.
// Déployer avec : npx supabase functions deploy leads-followup-cron --no-verify-jwt --project-ref esvnvxkbnhvxpnlhyjsw

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
// Clé ANON publique hardcodée — Deno.env SUPABASE_ANON_KEY est tronquée sur ce projet.
const SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzdm52eGtibmh2eHBubGh5anN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMDQ3MjEsImV4cCI6MjA4ODg4MDcyMX0.8P53xQ3pnGud3-TuZQ-5Pnpv-29PW_pfkAvJuCfDOKs';
const CRON_SECRET = Deno.env.get('CRON_SECRET') || '';

const SEND_EMAIL_URL = `${SUPABASE_URL}/functions/v1/send-email`;
const FOLLOWUP_DELAY_MIN = 5;
const MAX_PER_RUN = 50;

const FOLLOWUP_BODY = `Bonjour,

Vous avez commencé à déposer un projet sur LesCordistes.com mais le formulaire n'a pas été finalisé.

Je me permets de vous écrire directement : pouvez-vous me dire en quelques mots quel est votre besoin (type de travaux, lieu, échéance) ? Je vous mets en relation avec les bons cordistes certifiés rapidement.

Vous pouvez aussi me répondre à ce mail ou m'appeler, je m'occupe du reste.

Cordialement,

Anthony Profit
+33 06 60 50 16 82
Fondateur — LesCordistes.com
anthony@lescordistes.com`;

interface LeadRow {
    id: string;
    email: string;
    city: string | null;
    created_at: string;
}

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    // Auth check
    const auth = req.headers.get('Authorization') || '';
    if (!CRON_SECRET || auth !== `Bearer ${CRON_SECRET}`) {
        return new Response(JSON.stringify({ error: 'unauthorized' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const cutoff = new Date(Date.now() - FOLLOWUP_DELAY_MIN * 60_000).toISOString();

    const { data: leads, error: selectErr } = await supabase
        .from('leads')
        .select('id, email, city, created_at')
        .lt('created_at', cutoff)
        .is('followup_sent_at', null)
        .order('created_at', { ascending: true })
        .limit(MAX_PER_RUN);

    if (selectErr) {
        console.error('[leads-followup] select error:', selectErr.message);
        return new Response(JSON.stringify({ error: selectErr.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    const rows = (leads ?? []) as LeadRow[];
    const stats = { processed: 0, sent: 0, skipped_job_created: 0, failed: 0 };

    for (const lead of rows) {
        stats.processed++;

        // Skip si un job avec ce mail a été créé après la capture
        const { data: matchingJobs } = await supabase
            .from('jobs')
            .select('id')
            .filter('client_contact_info->>email', 'ilike', lead.email)
            .gte('created_at', lead.created_at)
            .limit(1);

        if (matchingJobs && matchingJobs.length > 0) {
            stats.skipped_job_created++;
            await supabase
                .from('leads')
                .update({
                    followup_sent_at: new Date().toISOString(),
                    followup_status: 'skipped',
                    followup_skip_reason: 'job_created',
                })
                .eq('id', lead.id);
            continue;
        }

        const subject = lead.city
            ? `Votre projet de cordiste à ${lead.city}`
            : 'Votre projet déposé sur LesCordistes.com';

        try {
            const sendRes = await fetch(SEND_EMAIL_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({
                    to: lead.email,
                    subject,
                    templateId: 'admin-custom',
                    from: 'Anthony Profit <anthony@lescordistes.com>',
                    replyTo: 'anthony@lescordistes.com',
                    data: {
                        subject,
                        body: FOLLOWUP_BODY,
                    },
                }),
            });

            if (!sendRes.ok) {
                const errText = await sendRes.text();
                stats.failed++;
                await supabase
                    .from('leads')
                    .update({
                        followup_sent_at: new Date().toISOString(),
                        followup_status: 'failed',
                        followup_skip_reason: errText.slice(0, 200),
                    })
                    .eq('id', lead.id);
            } else {
                stats.sent++;
                await supabase
                    .from('leads')
                    .update({
                        followup_sent_at: new Date().toISOString(),
                        followup_status: 'sent',
                    })
                    .eq('id', lead.id);
            }
        } catch (err) {
            stats.failed++;
            const msg = err instanceof Error ? err.message : String(err);
            console.error('[leads-followup] send threw:', msg);
            await supabase
                .from('leads')
                .update({
                    followup_sent_at: new Date().toISOString(),
                    followup_status: 'failed',
                    followup_skip_reason: msg.slice(0, 200),
                })
                .eq('id', lead.id);
        }
    }

    return new Response(JSON.stringify({ ok: true, ...stats }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
});
