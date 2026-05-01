// LesCordistes — Pro mission alerts cron
//
// Schedule (pg_cron) : toutes les 30 minutes. Voir migration
//   supabase/migrations/20260501-pro-alerts-schedule.sql
//
// Tâches par run :
//   1. RPC find_pro_alert_matches(p_max_jobs_per_sub) → liste des couples
//      (subscription, job) éligibles (mission live, créée après l'inscription,
//      département dans la liste suivie, pas encore envoyé).
//   2. Grouper par subscription → 1 email batché par cordiste, max 12 missions.
//   3. Pour chaque destinataire :
//      - Signer un token unsubscribe HMAC (réutilise marketing-nurture-cron / pattern projet).
//      - Invoquer send-email avec template `pro-mission-alert`.
//      - Insérer (subscription_id, job_id) dans pro_alert_sends pour dedup.
//      - Update subscription : last_alert_sent_at, last_match_count, total_alerts_sent.
//
// Sécurité : Authorization: Bearer ${CRON_SECRET}. Déployer avec --no-verify-jwt.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
// Hardcodée (cf. mémoire mulch / marketing-nurture-cron) : la variable
// Deno SUPABASE_ANON_KEY est tronquée sur ce projet.
const SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzdm52eGtibmh2eHBubGh5anN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMDQ3MjEsImV4cCI6MjA4ODg4MDcyMX0.8P53xQ3pnGud3-TuZQ-5Pnpv-29PW_pfkAvJuCfDOKs';
const CRON_SECRET = Deno.env.get('CRON_SECRET') || '';
const MARKETING_UNSUBSCRIBE_SECRET =
    Deno.env.get('MARKETING_UNSUBSCRIBE_SECRET') ||
    Deno.env.get('OPTOUT_SECRET') ||
    '';
const SEO_BASE_URL = Deno.env.get('SEO_BASE_URL') || 'https://www.lescordistes.com';

const SEND_EMAIL_URL = `${SUPABASE_URL}/functions/v1/send-email`;
const TTL_MS = 365 * 24 * 60 * 60 * 1000; // 1 an
const SEP = '~';
const BATCH_DELAY_MS = 250;
const MAX_JOBS_PER_SUB = 12;
const ALERT_CAMPAIGN_ID = 'pro-mission-alert'; // pseudo-id pour le token unsub

// Codes département (FR métropole + DROM) → libellé court (sans le code).
// Permet d'afficher un libellé propre dans l'email sans répliquer toute la table.
const DEPT_LABEL: Record<string, string> = {
    '01': 'Ain', '02': 'Aisne', '03': 'Allier', '04': 'Alpes-de-Haute-Provence',
    '05': 'Hautes-Alpes', '06': 'Alpes-Maritimes', '07': 'Ardèche', '08': 'Ardennes',
    '09': 'Ariège', '10': 'Aube', '11': 'Aude', '12': 'Aveyron', '13': 'Bouches-du-Rhône',
    '14': 'Calvados', '15': 'Cantal', '16': 'Charente', '17': 'Charente-Maritime',
    '18': 'Cher', '19': 'Corrèze', '2A': 'Corse-du-Sud', '2B': 'Haute-Corse',
    '21': "Côte-d'Or", '22': "Côtes-d'Armor", '23': 'Creuse', '24': 'Dordogne',
    '25': 'Doubs', '26': 'Drôme', '27': 'Eure', '28': 'Eure-et-Loir', '29': 'Finistère',
    '30': 'Gard', '31': 'Haute-Garonne', '32': 'Gers', '33': 'Gironde', '34': 'Hérault',
    '35': 'Ille-et-Vilaine', '36': 'Indre', '37': 'Indre-et-Loire', '38': 'Isère',
    '39': 'Jura', '40': 'Landes', '41': 'Loir-et-Cher', '42': 'Loire', '43': 'Haute-Loire',
    '44': 'Loire-Atlantique', '45': 'Loiret', '46': 'Lot', '47': 'Lot-et-Garonne',
    '48': 'Lozère', '49': 'Maine-et-Loire', '50': 'Manche', '51': 'Marne',
    '52': 'Haute-Marne', '53': 'Mayenne', '54': 'Meurthe-et-Moselle', '55': 'Meuse',
    '56': 'Morbihan', '57': 'Moselle', '58': 'Nièvre', '59': 'Nord', '60': 'Oise',
    '61': 'Orne', '62': 'Pas-de-Calais', '63': 'Puy-de-Dôme', '64': 'Pyrénées-Atlantiques',
    '65': 'Hautes-Pyrénées', '66': 'Pyrénées-Orientales', '67': 'Bas-Rhin',
    '68': 'Haut-Rhin', '69': 'Rhône', '70': 'Haute-Saône', '71': 'Saône-et-Loire',
    '72': 'Sarthe', '73': 'Savoie', '74': 'Haute-Savoie', '75': 'Paris',
    '76': 'Seine-Maritime', '77': 'Seine-et-Marne', '78': 'Yvelines', '79': 'Deux-Sèvres',
    '80': 'Somme', '81': 'Tarn', '82': 'Tarn-et-Garonne', '83': 'Var', '84': 'Vaucluse',
    '85': 'Vendée', '86': 'Vienne', '87': 'Haute-Vienne', '88': 'Vosges', '89': 'Yonne',
    '90': 'Territoire de Belfort', '91': 'Essonne', '92': 'Hauts-de-Seine',
    '93': 'Seine-Saint-Denis', '94': 'Val-de-Marne', '95': "Val-d'Oise",
    '971': 'Guadeloupe', '972': 'Martinique', '973': 'Guyane', '974': 'La Réunion',
    '976': 'Mayotte',
};

// ─── HMAC token ───────────────────────────────────────────────────────────────
async function signUnsubscribeToken(email: string, campaignId: string): Promise<string> {
    if (!MARKETING_UNSUBSCRIBE_SECRET) {
        throw new Error('MARKETING_UNSUBSCRIBE_SECRET (ou OPTOUT_SECRET) doit être défini');
    }
    const exp = Date.now() + TTL_MS;
    const payload = `${email}${SEP}${campaignId}${SEP}${exp}`;
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

async function buildUnsubscribeUrl(email: string): Promise<string> {
    const token = await signUnsubscribeToken(email, ALERT_CAMPAIGN_ID);
    return `${SEO_BASE_URL}/marketing/unsubscribe?token=${encodeURIComponent(token)}&source=pro-alerts`;
}

function sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
}

async function hashShort(s: string): Promise<string> {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
        .slice(0, 12);
}

interface MatchRow {
    subscription_id: string;
    email: string;
    departments: string[];
    job_id: string;
    job_title: string;
    job_slug: string | null;
    job_city: string | null;
    job_department: string | null;
    job_category: string | null;
    job_type: string | null;
    job_credit_cost: number | null;
    job_created_at: string;
}

interface SubGroup {
    subscription_id: string;
    email: string;
    departments: string[];
    matches: MatchRow[];
}

interface RunStats {
    subs_targeted: number;
    sent: number;
    failed: number;
    jobs_matched: number;
    last_error?: string;
}

// ─── HTTP entrypoint ──────────────────────────────────────────────────────────
serve(async (req: Request) => {
    if (CRON_SECRET) {
        const auth = req.headers.get('Authorization') || '';
        const expected = `Bearer ${CRON_SECRET}`;
        if (auth !== expected) {
            const receivedSecret = auth.startsWith('Bearer ')
                ? auth.slice('Bearer '.length)
                : '';
            return new Response(
                JSON.stringify({
                    error: 'cron_secret_mismatch',
                    expected_len: CRON_SECRET.length,
                    received_len: receivedSecret.length,
                    expected_hash: await hashShort(CRON_SECRET),
                    received_hash: receivedSecret ? await hashShort(receivedSecret) : null,
                    has_authorization: !!req.headers.get('Authorization'),
                }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
    });

    const { data: matches, error: rpcErr } = await supabase.rpc('find_pro_alert_matches', {
        p_max_jobs_per_sub: MAX_JOBS_PER_SUB,
    });

    if (rpcErr) {
        console.error('[pro-alerts] RPC error:', rpcErr);
        return new Response(JSON.stringify({ error: rpcErr.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const rows = (matches ?? []) as MatchRow[];

    // Grouper par subscription
    const groups = new Map<string, SubGroup>();
    for (const row of rows) {
        let g = groups.get(row.subscription_id);
        if (!g) {
            g = {
                subscription_id: row.subscription_id,
                email: row.email,
                departments: row.departments,
                matches: [],
            };
            groups.set(row.subscription_id, g);
        }
        g.matches.push(row);
    }

    const stats: RunStats = {
        subs_targeted: groups.size,
        sent: 0,
        failed: 0,
        jobs_matched: rows.length,
    };

    for (const group of groups.values()) {
        const emailLc = group.email.trim().toLowerCase();

        // Préparer payload pour le template
        const matchedDepts = Array.from(
            new Set(
                group.matches
                    .map((m) => m.job_department)
                    .filter((x): x is string => !!x)
            )
        );
        // Filtrer aux départements suivis (sécurité, déjà filtré par le RPC)
        const departmentsForLabel = matchedDepts
            .filter((d) => group.departments.includes(d))
            .map((code) => DEPT_LABEL[code] || code);
        const departmentsLabel = departmentsForLabel.length > 0
            ? departmentsForLabel.join(', ')
            : group.departments.map((c) => DEPT_LABEL[c] || c).join(', ');

        const missions = group.matches.map((m) => ({
            title: m.job_title,
            city: m.job_city ?? '',
            departmentLabel: m.job_department ? (DEPT_LABEL[m.job_department] || m.job_department) : '',
            slug: m.job_slug ?? m.job_id,
            isRenfort: m.job_type === 'renfort_pro',
            creditCost: typeof m.job_credit_cost === 'number' ? m.job_credit_cost : 1,
        }));

        let unsubscribeUrl: string;
        try {
            unsubscribeUrl = await buildUnsubscribeUrl(emailLc);
        } catch (err) {
            console.error('[pro-alerts] sign unsubscribe failed:', err);
            stats.failed++;
            stats.last_error = err instanceof Error ? err.message : String(err);
            continue;
        }

        const subject = group.matches.length === 1
            ? `Nouvelle mission disponible — ${group.matches[0].job_city ?? departmentsLabel}`
            : `${group.matches.length} nouvelles missions dans vos départements`;

        const fullData: Record<string, unknown> = {
            departments: departmentsLabel,
            missions: JSON.stringify(missions),
            unsubscribeUrl,
            unsubscribe_url: unsubscribeUrl,
            email: emailLc,
        };

        let sendOk = false;
        let resendId: string | null = null;
        let errorMessage: string | null = null;

        try {
            const res = await fetch(SEND_EMAIL_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                    apikey: SUPABASE_ANON_KEY,
                },
                body: JSON.stringify({
                    to: emailLc,
                    subject,
                    templateId: 'pro-mission-alert',
                    data: fullData,
                }),
            });
            const rawBody = await res.text().catch(() => '');
            let body: { id?: string; error?: unknown } = {};
            try {
                body = rawBody ? JSON.parse(rawBody) : {};
            } catch { /* not json */ }
            if (res.ok) {
                sendOk = true;
                resendId = body.id ?? null;
            } else {
                const errPart = typeof body.error === 'string'
                    ? body.error
                    : body.error
                        ? JSON.stringify(body.error)
                        : rawBody.slice(0, 200);
                errorMessage = `HTTP ${res.status} ${errPart}`;
            }
        } catch (err) {
            errorMessage = err instanceof Error ? err.message : String(err);
        }

        if (sendOk) {
            // Marquer chaque (sub, job) comme envoyé — bulk insert
            const sendsToInsert = group.matches.map((m) => ({
                subscription_id: group.subscription_id,
                job_id: m.job_id,
                email: emailLc,
                resend_email_id: resendId,
            }));
            const { error: insertErr } = await supabase
                .from('pro_alert_sends')
                .insert(sendsToInsert);
            if (insertErr) {
                // 23505 = certains existent déjà ; pas catastrophique, log only.
                console.warn('[pro-alerts] sends insert warning:', insertErr.message);
            }

            // Update aggregate sur la souscription
            const { error: updErr } = await supabase
                .from('pro_alert_subscriptions')
                .update({
                    last_alert_sent_at: new Date().toISOString(),
                    last_match_count: group.matches.length,
                    total_alerts_sent: (await getCurrentTotal(supabase, group.subscription_id)) + 1,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', group.subscription_id);
            if (updErr) {
                console.warn('[pro-alerts] sub update warning:', updErr.message);
            }
            stats.sent++;
        } else {
            console.error('[pro-alerts] send failed for', emailLc, '-', errorMessage);
            stats.failed++;
            if (errorMessage) stats.last_error = errorMessage;
        }

        await sleep(BATCH_DELAY_MS);
    }

    return new Response(
        JSON.stringify({ ok: true, stats }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
});

// deno-lint-ignore no-explicit-any
async function getCurrentTotal(supabase: any, subId: string): Promise<number> {
    const { data } = await supabase
        .from('pro_alert_subscriptions')
        .select('total_alerts_sent')
        .eq('id', subId)
        .maybeSingle();
    return typeof data?.total_alerts_sent === 'number' ? data.total_alerts_sent : 0;
}
