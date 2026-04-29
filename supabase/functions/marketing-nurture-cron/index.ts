// LesCordistes — Marketing Nurture Cron
//
// Schedule (pg_cron) : daily 09:00 UTC. Voir migration
//   supabase/migrations/20260429-marketing-nurture-schedule.sql
//
// Tasks per run :
//   1. Lister les playbooks actifs via RPC list_active_playbooks().
//   2. Pour chaque playbook, récupérer les contacts éligibles via RPC
//      resolve_playbook_recipients(playbook_id, max_per_run).
//   3. Pour chaque destinataire :
//      - signer un token unsubscribe HMAC,
//      - invoquer l'edge function send-email avec le template + variables,
//      - écrire une ligne dans marketing_playbook_runs (sent / failed),
//   4. Mettre à jour playbook.last_run_at + stats.
//
// Sécurité :
//   - Auth via header Authorization: Bearer ${CRON_SECRET}.
//   - Déployer avec --no-verify-jwt (cf. mémoire mulch / jobs-freshness-cron).
//
// Idempotence :
//   - Le UNIQUE INDEX (playbook_id, contact_id) sur marketing_playbook_runs
//     empêche le double-envoi : si un INSERT échoue avec violation d'unique,
//     on saute le contact (déjà reçu).

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const CRON_SECRET = Deno.env.get('CRON_SECRET') || '';
const MARKETING_UNSUBSCRIBE_SECRET =
    Deno.env.get('MARKETING_UNSUBSCRIBE_SECRET') ||
    Deno.env.get('OPTOUT_SECRET') ||
    '';
const SEO_BASE_URL = Deno.env.get('SEO_BASE_URL') || 'https://www.lescordistes.com';

const SEND_EMAIL_URL = `${SUPABASE_URL}/functions/v1/send-email`;
const TTL_MS = 365 * 24 * 60 * 60 * 1000; // 1 an
const SEP = '~';
const BATCH_DELAY_MS = 200;

// ─── HMAC signing (Web Crypto, identique à Next.js src/lib/marketing/unsubscribeToken.ts) ─
async function signUnsubscribeToken(email: string, playbookId: string): Promise<string> {
    if (!MARKETING_UNSUBSCRIBE_SECRET) {
        throw new Error('MARKETING_UNSUBSCRIBE_SECRET (ou OPTOUT_SECRET) doit être défini');
    }
    const exp = Date.now() + TTL_MS;
    const payload = `${email}${SEP}${playbookId}${SEP}${exp}`;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        enc.encode(MARKETING_UNSUBSCRIBE_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
    const sigHex = Array.from(new Uint8Array(sigBuf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    return base64UrlEncode(`${payload}${SEP}${sigHex}`);
}

function base64UrlEncode(s: string): string {
    return btoa(unescape(encodeURIComponent(s)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

function buildUnsubscribeUrl(email: string, playbookId: string): Promise<string> {
    return signUnsubscribeToken(email, playbookId).then(
        (token) => `${SEO_BASE_URL}/marketing/unsubscribe?token=${encodeURIComponent(token)}`
    );
}

interface ActivePlaybook {
    id: string;
    name: string;
    audience_type: string;
    segment_id: string;
    template_key: string;
    edge_template_id: string;
    template_data: Record<string, unknown>;
    subject: string;
    preview_text: string | null;
    cooldown_days: number;
    max_per_run: number;
}

interface Recipient {
    contact_id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    audience_type: string;
}

interface RunStats {
    targeted: number;
    sent: number;
    failed: number;
    skipped: number;
    last_error?: string;
}

// deno-lint-ignore no-explicit-any
async function processPlaybook(supabase: any, pb: ActivePlaybook): Promise<RunStats> {
    const stats: RunStats = { targeted: 0, sent: 0, failed: 0, skipped: 0 };

    const { data: recipients, error } = await supabase.rpc('resolve_playbook_recipients', {
        p_playbook_id: pb.id,
        p_max: pb.max_per_run,
    });
    if (error) {
        console.error(`[nurture] playbook ${pb.id} resolve error:`, error);
        stats.last_error = error.message;
        return stats;
    }

    const list = (recipients ?? []) as Recipient[];
    stats.targeted = list.length;

    for (const r of list) {
        const emailLc = r.email.trim().toLowerCase();
        const firstName = (r.first_name ?? '').trim();

        // Tentative d'INSERT en première intention. Si conflit (déjà envoyé),
        // on saute. Statut 'pending' temporaire ; on le passera à 'sent' / 'failed'.
        const { data: insertedRows, error: insertErr } = await supabase
            .from('marketing_playbook_runs')
            .insert({
                playbook_id: pb.id,
                contact_id: r.contact_id,
                email: emailLc,
                status: 'pending',
            })
            .select('id')
            .limit(1);

        if (insertErr) {
            // 23505 = unique violation. Géré silencieusement.
            // deno-lint-ignore no-explicit-any
            const code = (insertErr as any).code;
            if (code === '23505') {
                stats.skipped++;
                continue;
            }
            console.error(`[nurture] insert run failed for ${emailLc}:`, insertErr);
            stats.failed++;
            stats.last_error = insertErr.message;
            continue;
        }

        const runId = insertedRows?.[0]?.id;

        // Vérifier opt-in / unsubscribed (le segment exclut déjà ces cas via
        // resolve_segment_contacts, mais c'est une safety belt).
        const { data: contact } = await supabase
            .from('marketing_contacts')
            .select('marketing_opt_in, unsubscribed_at')
            .eq('id', r.contact_id)
            .maybeSingle();

        if (contact?.unsubscribed_at || contact?.marketing_opt_in === false) {
            await supabase
                .from('marketing_playbook_runs')
                .update({ status: 'skipped', skip_reason: 'unsubscribed' })
                .eq('id', runId);
            stats.skipped++;
            continue;
        }

        // Préparer les variables du template.
        const unsubscribeUrl = await buildUnsubscribeUrl(emailLc, pb.id);
        const fullData: Record<string, unknown> = {
            ...(pb.template_data ?? {}),
            name: firstName,
            prenom: firstName,
            firstName,
            email: emailLc,
            unsubscribeUrl,
            unsubscribe_url: unsubscribeUrl,
            campaignName: pb.name,
        };

        // Appel direct à l'edge send-email via fetch (l'API supabase
        // functions.invoke côté Deno est moins fiable pour les fonctions
        // déployées avec auth ; un POST signé avec le service-role JWT marche
        // partout).
        let sendOk = false;
        let resendId: string | null = null;
        let errorMessage: string | null = null;

        try {
            const res = await fetch(SEND_EMAIL_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                    apikey: SUPABASE_SERVICE_ROLE_KEY,
                },
                body: JSON.stringify({
                    to: emailLc,
                    subject: pb.subject,
                    templateId: pb.edge_template_id,
                    data: fullData,
                }),
            });
            const body = (await res.json().catch(() => ({}))) as { id?: string; error?: unknown };
            if (res.ok) {
                sendOk = true;
                resendId = body.id ?? null;
            } else {
                errorMessage =
                    typeof body.error === 'string'
                        ? body.error
                        : JSON.stringify(body.error ?? `HTTP ${res.status}`);
            }
        } catch (err) {
            errorMessage = err instanceof Error ? err.message : String(err);
        }

        if (sendOk) {
            await supabase
                .from('marketing_playbook_runs')
                .update({
                    status: 'sent',
                    sent_at: new Date().toISOString(),
                    resend_email_id: resendId,
                })
                .eq('id', runId);
            stats.sent++;
        } else {
            await supabase
                .from('marketing_playbook_runs')
                .update({
                    status: 'failed',
                    error_message: errorMessage ?? 'unknown',
                })
                .eq('id', runId);
            stats.failed++;
            if (errorMessage) stats.last_error = errorMessage;
        }

        await sleep(BATCH_DELAY_MS);
    }

    return stats;
}

function sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
}

// ─── HTTP entrypoint ──────────────────────────────────────────────────────────
serve(async (req: Request) => {
    if (CRON_SECRET) {
        const auth = req.headers.get('Authorization') || '';
        const expected = `Bearer ${CRON_SECRET}`;
        if (auth !== expected) {
            const receivedLen = auth.startsWith('Bearer ')
                ? auth.slice('Bearer '.length).length
                : 0;
            return new Response(
                JSON.stringify({
                    error: 'cron_secret_mismatch',
                    expected_len: CRON_SECRET.length,
                    received_len: receivedLen,
                    has_authorization: !!req.headers.get('Authorization'),
                }),
                {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }
    }

    const url = new URL(req.url);
    const onlyPlaybookId = url.searchParams.get('playbook_id');

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
    });

    // Liste des playbooks à exécuter.
    let playbooks: ActivePlaybook[] = [];
    if (onlyPlaybookId) {
        const { data, error } = await supabase
            .from('marketing_playbooks')
            .select(
                'id, name, audience_type, segment_id, template_key, template_data, subject, preview_text, cooldown_days, max_per_run, marketing_email_templates!inner(edge_template_id, is_active)'
            )
            .eq('id', onlyPlaybookId)
            .maybeSingle();
        if (error || !data) {
            return new Response(
                JSON.stringify({ error: error?.message ?? 'playbook_not_found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }
        // deno-lint-ignore no-explicit-any
        const row: any = data;
        playbooks = [
            {
                id: row.id,
                name: row.name,
                audience_type: row.audience_type,
                segment_id: row.segment_id,
                template_key: row.template_key,
                edge_template_id: row.marketing_email_templates.edge_template_id,
                template_data: row.template_data ?? {},
                subject: row.subject,
                preview_text: row.preview_text,
                cooldown_days: row.cooldown_days,
                max_per_run: row.max_per_run,
            },
        ];
    } else {
        const { data, error } = await supabase.rpc('list_active_playbooks');
        if (error) {
            console.error('[nurture] list_active_playbooks error:', error);
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        playbooks = (data ?? []) as ActivePlaybook[];
    }

    const results: Array<{ playbook_id: string; name: string; stats: RunStats }> = [];
    for (const pb of playbooks) {
        const stats = await processPlaybook(supabase, pb);
        // Persiste stats + last_run_at sur le playbook.
        await supabase
            .from('marketing_playbooks')
            .update({
                last_run_at: new Date().toISOString(),
                stats,
            })
            .eq('id', pb.id);
        results.push({ playbook_id: pb.id, name: pb.name, stats });
    }

    return new Response(
        JSON.stringify({
            ok: true,
            ran: results.length,
            results,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
});
