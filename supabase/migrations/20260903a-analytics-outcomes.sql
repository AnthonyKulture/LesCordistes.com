-- ============================================================================
-- 20260903a — Analytics : section « Issues des leads »
--
-- Étend admin_analytics_overview d'une section 'outcomes' au lieu d'ajouter un
-- RPC parallèle : un seul aller-retour pour la page, une seule surface à
-- verrouiller (les DEFAULT PRIVILEGES Supabase rendent chaque nouvelle fonction
-- exposée par défaut — leçon 20260828l). Le corps est repris à l'identique de
-- 20260901d, dernière définition en vigueur ; seule la clef 'outcomes' s'ajoute
-- à l'objet final.
--
-- ────────────────────────────────────────────────────────────────────────────
-- POURQUOI CETTE SECTION N'EST PAS BORNÉE PAR LA PÉRIODE
--
-- Un outcome se lit 15 jours après le déblocage, et la réponse arrive quand le
-- pro clique — parfois des semaines plus tard. Découper cette chaîne sur
-- [p_from, p_to) apparierait des réponses avec des sollicitations d'une autre
-- fenêtre, et viderait structurellement la période récente (un déblocage de
-- moins de 15 jours n'a jamais été sollicité). 'outcomes' est donc CUMULATIF,
-- au même titre que 'all_time', et sans clef 'previous' : sur deux réponses en
-- base, un delta période-sur-période ne mesurerait que du bruit.
--
-- ────────────────────────────────────────────────────────────────────────────
-- POURQUOI AUCUN POURCENTAGE N'EST CALCULÉ ICI
--
-- Contrairement aux autres sections, 'outcomes' ne renvoie QUE des effectifs
-- bruts. Volumétrie du 2026-09-03 : 3 sollicitations, 2 réponses. Un taux de
-- transformation sur n=2 est un nombre présentable à un investisseur et faux :
-- son intervalle de confiance à 95 % couvre presque tout l'intervalle [0, 1].
--
-- Un ratio présent dans le payload finit toujours par être affiché. On ne le
-- calcule donc pas : le rendu (src/app/admin/analytics/page.tsx) décide seul
-- s'il a assez d'effectif pour convertir une fraction en pourcentage, et
-- affiche « échantillon insuffisant (n=…) » en dessous du seuil.
--
-- ────────────────────────────────────────────────────────────────────────────
-- POURQUOI LA COLONNE outcome_email_suppressed
--
-- outcome_email_sent_at ne veut pas dire « email parti ». Trois écritures la
-- renseignent :
--   1. le cron a envoyé l'email                          → vraie sollicitation
--   2. le cron a sauté la ligne (destinataire sans email) → pas d'email
--   3. la migration 20260902c a neutralisé le passif      → pas d'email
-- Le cas 3 concerne 6 lignes. Les compter au dénominateur donnerait 2/9 = 22 %
-- de taux de réponse au lieu de 2/3 : un mensonge, dans l'autre sens.
--
-- Le délai (outcome_email_sent_at - unlocked_at) ne suffit PAS à les séparer :
-- 20260902c a neutralisé les déblocages de plus de 60 jours, et la première
-- exécution du cron a rattrapé un arriéré dont la plus ancienne ligne frôle ce
-- même seuil. Une règle « délai > 60 j » classerait cette sollicitation
-- authentique parmi les neutralisées.
--
-- Le discriminant exact est ailleurs : 20260902c est un UPDATE de masse, donc
-- ses lignes partagent à la microseconde près le même NOW() (timestamp de
-- transaction). Le cron, lui, écrit ligne par ligne autour d'un aller-retour
-- HTTP d'envoi d'email : deux de ses horodatages ne coïncident jamais. On
-- combine les deux signaux (même instant exact ET délai > 60 j) pour un
-- backfill JOUÉ UNE SEULE FOIS, matérialisé dans une colonne.
--
-- ⚠️ CE BACKFILL NE RATTRAPE QUE LE PASSÉ. Il ne surveille rien : les lignes
-- neutralisées APRÈS son passage lui échappent, et entreraient dans
-- `solicited` sans qu'aucun email ne soit parti — le bug 2/9 réintroduit, avec
-- un compteur `suppressed` resté à 0 pour le masquer. C'est pourquoi
-- 20260902c a été corrigée pour poser elle-même outcome_email_suppressed dans
-- son UPDATE : la source de vérité est l'écrivain, l'heuristique n'est qu'un
-- rattrapage ponctuel des lignes écrites avant que cette règle existe. Tout
-- futur script de neutralisation doit suivre la même règle.
--
-- Le cas 2 (destinataire sans email) reste indiscernable en base et compte donc
-- comme une sollicitation — c'est le sens conservateur : il abaisse le taux de
-- réponse au lieu de le flatter.
--
-- ────────────────────────────────────────────────────────────────────────────
-- COÛT D'ACQUISITION
--
-- Numérateur : crédits réellement débités pour les déblocages MESURÉS (ceux
-- dont on connaît l'issue), lus dans credit_transactions (type='spend', montant
-- négatif → ABS) et non re-devinés depuis le barème ; repli sur jobs.credit_cost
-- puis 1 quand aucune transaction ne correspond. Dénominateur : les 'won'.
--
-- On expose les deux numérateurs, la population mesurée entière ('answered',
-- 'no_response' compris) et la seule population résolue ('won' + 'lost') : un
-- pro paie aussi les leads dont le client n'a jamais répondu, les exclure du
-- coût sous-estimerait la facture réelle.
--
-- eur_per_credit est le prix moyen RÉELLEMENT encaissé (achats Stripe, montant
-- exact via amount_cents avec repli proxy packs), pas un tarif catalogue : les
-- trois packs vont de 20 € à 14 € le crédit, choisir l'un d'eux serait arbitraire.
--
-- Divisions par zéro : NULLIF partout — un ratio sans dénominateur vaut NULL.
-- Idempotente et rejouable.
-- ============================================================================

BEGIN;

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Marqueur de sollicitation neutralisée (voir l'en-tête)
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.unlocked_leads
    ADD COLUMN IF NOT EXISTS outcome_email_suppressed BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN public.unlocked_leads.outcome_email_suppressed IS
    'TRUE = outcome_email_sent_at a été posé par une neutralisation de masse (20260902c), pas par un envoi réel. Exclut la ligne du dénominateur du taux de réponse.';

-- Backfill de rattrapage — ne concerne QUE les lignes neutralisées par le
-- passage de 20260902c le 2026-09-02, avant que ce script ne pose lui-même le
-- marqueur.
--
-- La fenêtre est EXACTE, pas heuristique. `lead-outcome-cron` a été déployé le
-- 2026-09-02 à 12:52 UTC (version 1, premier déploiement) et sa planification
-- pg_cron est quotidienne à 07:30 UTC : sa première exécution possible était
-- donc le 2026-09-03 à 07:30 UTC. AUCUN email de relance n'a pu partir le
-- 2026-09-02. Toute ligne portant `outcome_email_sent_at` ce jour-là a
-- nécessairement été écrite par la neutralisation, jamais par un envoi.
--
-- Bornes en timestamptz explicites plutôt qu'un `::date` : la conversion en
-- date dépend du TimeZone de session, un `SET TimeZone` malencontreux
-- déplacerait la fenêtre d'un jour.
--
-- Immuable et rejouable : cette fenêtre est close, elle ne peut plus jamais
-- capturer une ligne nouvelle. Pour les neutralisations FUTURES, c'est le
-- script qui neutralise qui écrit le marqueur (voir l'en-tête) — on ne devine
-- plus rien.
DO $backfill$
DECLARE
    v_marked INT;
BEGIN
    UPDATE public.unlocked_leads ul
    SET    outcome_email_suppressed = TRUE
    WHERE  ul.outcome IS NULL
      AND  ul.outcome_email_suppressed = FALSE
      AND  ul.outcome_email_sent_at >= TIMESTAMPTZ '2026-09-02 00:00:00+00'
      AND  ul.outcome_email_sent_at <  TIMESTAMPTZ '2026-09-03 00:00:00+00';

    GET DIAGNOSTICS v_marked = ROW_COUNT;
    RAISE NOTICE '% sollicitation(s) neutralisée(s) marquée(s) — exclues du taux de réponse.', v_marked;
END $backfill$;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. admin_analytics_overview + section 'outcomes'
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_analytics_overview(
    p_from timestamptz,
    p_to   timestamptz
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
WITH bounds AS (
    SELECT 'current'::text AS k, p_from AS f, p_to AS t
    UNION ALL
    SELECT 'previous', p_from - (p_to - p_from), p_from
),
per AS (
    SELECT
        b.k,
        jsonb_build_object(
            'revenue_eur', rev.revenue_eur,
            'purchases', rev.purchases,
            'buyers', rev.buyers,
            'arpu_eur', ROUND(rev.revenue_eur::numeric / NULLIF(rev.buyers, 0), 2),
            'missions_moderated', liq.cohort,
            'revenue_per_mission_eur', ROUND(rev.revenue_eur::numeric / NULLIF(liq.cohort, 0), 2),
            'liquidity', jsonb_build_object(
                'cohort', liq.cohort,
                'pct_unlocked', ROUND(liq.unlocked::numeric / NULLIF(liq.cohort, 0), 4),
                'median_hours_to_first_unlock', ROUND(liq.median_hours_first_unlock::numeric, 1),
                'avg_unlocks_per_mission', ROUND(liq.total_unlocks::numeric / NULLIF(liq.cohort, 0), 2),
                'pct_expired_no_unlock', ROUND(liq.expired_no_unlock::numeric / NULLIF(liq.cohort, 0), 4)
            ),
            'supply', jsonb_build_object(
                'new_pros', sup.new_pros,
                'active_pros', act.active_pros
            ),
            'demand', jsonb_build_object(
                'jobs_created', dj.jobs_created,
                'mix_standard', dj.mix_standard,
                'mix_renfort_pro', dj.mix_renfort_pro,
                'wizard_leads', wl.wizard_leads,
                'wizard_completed', wl.wizard_completed,
                'wizard_completion', ROUND(wl.wizard_completed::numeric / NULLIF(wl.wizard_leads, 0), 4),
                'moderated_total', mo.moderated_total,
                'approved', mo.approved,
                'pct_approved', ROUND(mo.approved::numeric / NULLIF(mo.moderated_total, 0), 4),
                'median_hours_moderation', ROUND(mo.median_hours_moderation::numeric, 1)
            ),
            'engagement', jsonb_build_object(
                'conversations', cv.conversations,
                'reviews', rv.reviews
            )
        ) AS metrics
    FROM bounds b
    -- Revenu : exact (amount_cents) avec repli proxy packs (achats Stripe uniquement)
    CROSS JOIN LATERAL (
        SELECT
            ROUND(COALESCE(SUM(COALESCE(
                amount_cents / 100.0,
                CASE amount WHEN 3 THEN 60 WHEN 10 THEN 150 WHEN 20 THEN 280 ELSE 0 END
            )), 0)::numeric, 2) AS revenue_eur,
            COUNT(*)::int AS purchases,
            COUNT(DISTINCT pro_id)::int AS buyers
        FROM public.credit_transactions
        WHERE type = 'purchase'
          AND stripe_session_id IS NOT NULL
          AND created_at >= b.f AND created_at < b.t
    ) rev
    -- Liquidité : cohorte des missions modérées-approuvées dans la période
    -- (moderated_at dans [f, t) et status hors pending/rejected — une mission
    -- rejetée ne peut pas être débloquée, l'inclure fausserait pct_unlocked).
    CROSS JOIN LATERAL (
        SELECT
            COUNT(*)::int AS cohort,
            COUNT(*) FILTER (WHERE u.n > 0)::int AS unlocked,
            COALESCE(SUM(u.n), 0)::int AS total_unlocks,
            COUNT(*) FILTER (WHERE j.status = 'expired' AND u.n = 0)::int AS expired_no_unlock,
            percentile_cont(0.5) WITHIN GROUP (
                ORDER BY EXTRACT(EPOCH FROM (u.first_unlock - j.moderated_at)) / 3600.0
            ) FILTER (WHERE u.first_unlock IS NOT NULL) AS median_hours_first_unlock
        FROM public.jobs j
        CROSS JOIN LATERAL (
            SELECT COUNT(*)::int AS n, MIN(ul.unlocked_at) AS first_unlock
            FROM public.unlocked_leads ul
            WHERE ul.job_id = j.id
        ) u
        WHERE j.moderated_at >= b.f AND j.moderated_at < b.t
          AND j.status NOT IN ('pending', 'rejected')
    ) liq
    -- Modération : toutes les missions modérées dans la période, rejets inclus
    CROSS JOIN LATERAL (
        SELECT
            COUNT(*)::int AS moderated_total,
            COUNT(*) FILTER (WHERE status NOT IN ('pending', 'rejected'))::int AS approved,
            percentile_cont(0.5) WITHIN GROUP (
                ORDER BY EXTRACT(EPOCH FROM (moderated_at - created_at)) / 3600.0
            ) AS median_hours_moderation
        FROM public.jobs
        WHERE moderated_at >= b.f AND moderated_at < b.t
    ) mo
    CROSS JOIN LATERAL (
        SELECT
            COUNT(*)::int AS jobs_created,
            COUNT(*) FILTER (WHERE type = 'renfort_pro')::int AS mix_renfort_pro,
            COUNT(*) FILTER (WHERE COALESCE(type, 'standard') <> 'renfort_pro')::int AS mix_standard
        FROM public.jobs
        WHERE created_at >= b.f AND created_at < b.t
    ) dj
    CROSS JOIN LATERAL (
        SELECT
            COUNT(*)::int AS wizard_leads,
            COUNT(*) FILTER (WHERE step_reached >= 5)::int AS wizard_completed
        FROM public.leads
        WHERE created_at >= b.f AND created_at < b.t
    ) wl
    CROSS JOIN LATERAL (
        SELECT COUNT(*)::int AS new_pros
        FROM public.profiles
        WHERE role = 'pro' AND created_at >= b.f AND created_at < b.t
    ) sup
    CROSS JOIN LATERAL (
        SELECT COUNT(DISTINCT pro_id)::int AS active_pros
        FROM public.unlocked_leads
        WHERE unlocked_at >= b.f AND unlocked_at < b.t
    ) act
    CROSS JOIN LATERAL (
        SELECT COUNT(*)::int AS conversations
        FROM public.conversations
        WHERE created_at >= b.f AND created_at < b.t
    ) cv
    CROSS JOIN LATERAL (
        SELECT COUNT(*)::int AS reviews
        FROM public.reviews
        WHERE created_at >= b.f AND created_at < b.t
    ) rv
),
-- ── Issues des leads : une ligne par déblocage, qualifiée ────────────────────
-- 'solicited' inclut toute ligne portant une réponse même si l'horodatage
-- d'envoi manque (le cron pose outcome_email_sent_at APRÈS l'envoi : un plantage
-- entre les deux laisserait une réponse sans sollicitation, donc un taux > 100 %).
outcome_leads AS (
    SELECT
        COALESCE(NULLIF(TRIM(j.location_city), ''), 'Ville non renseignée') AS city,
        COALESCE(NULLIF(j.type::text, ''), 'standard')                      AS job_type,
        ul.outcome,
        (ul.outcome IS NOT NULL) AS answered,
        (
            ul.outcome IS NOT NULL
            OR (ul.outcome_email_sent_at IS NOT NULL AND NOT ul.outcome_email_suppressed)
        ) AS solicited,
        (ul.outcome IS NULL AND ul.outcome_email_suppressed) AS suppressed,
        (ul.unlocked_at IS NOT NULL AND ul.unlocked_at < now() - INTERVAL '15 days') AS eligible,
        -- Crédits réellement débités ; repli barème de la mission puis 1.
        COALESCE(sp.credits, j.credit_cost, 1)::int AS credits
    FROM public.unlocked_leads ul
    LEFT JOIN public.jobs j ON j.id = ul.job_id
    LEFT JOIN LATERAL (
        SELECT SUM(ABS(ct.amount))::int AS credits
        FROM public.credit_transactions ct
        WHERE ct.type = 'spend'
          AND ct.pro_id = ul.pro_id
          AND ct.job_id = ul.job_id
    ) sp ON TRUE
),
outcome_funnel AS (
    SELECT
        COUNT(*)::int                                                        AS unlocks_total,
        COUNT(*) FILTER (WHERE eligible)::int                                AS eligible,
        COUNT(*) FILTER (WHERE solicited)::int                               AS solicited,
        COUNT(*) FILTER (WHERE suppressed)::int                              AS suppressed,
        COUNT(*) FILTER (WHERE eligible AND NOT solicited AND NOT suppressed)::int AS pending_solicitation,
        COUNT(*) FILTER (WHERE answered)::int                                AS answered,
        COUNT(*) FILTER (WHERE solicited AND NOT answered)::int              AS awaiting_answer,
        COUNT(*) FILTER (WHERE outcome = 'won')::int                         AS won,
        COUNT(*) FILTER (WHERE outcome = 'lost')::int                        AS lost,
        COUNT(*) FILTER (WHERE outcome = 'no_response')::int                 AS no_response,
        COUNT(*) FILTER (WHERE outcome IN ('won', 'lost'))::int              AS resolved,
        COALESCE(SUM(credits) FILTER (WHERE answered), 0)::int               AS credits_answered,
        COALESCE(SUM(credits) FILTER (WHERE outcome IN ('won', 'lost')), 0)::int AS credits_resolved,
        COUNT(DISTINCT city) FILTER (WHERE solicited)::int                   AS cities_total
    FROM outcome_leads
),
-- Prix moyen réellement encaissé du crédit (achats Stripe, tous packs confondus).
outcome_price AS (
    SELECT
        COALESCE(SUM(amount), 0)::int AS credits_purchased,
        ROUND(
            COALESCE(SUM(COALESCE(
                amount_cents / 100.0,
                CASE amount WHEN 3 THEN 60 WHEN 10 THEN 150 WHEN 20 THEN 280 ELSE 0 END
            )), 0)::numeric / NULLIF(SUM(amount), 0),
            2
        ) AS eur_per_credit
    FROM public.credit_transactions
    WHERE type = 'purchase'
      AND stripe_session_id IS NOT NULL
),
-- Ventilations : uniquement les segments réellement sollicités (un segment
-- jamais interrogé n'a rien à dire). Plafond à 20 villes, cities_total donne
-- le total pour que le rendu puisse annoncer la troncature.
outcome_by_city AS (
    SELECT
        city AS label,
        COUNT(*)::int AS n_solicited,
        jsonb_build_object(
            'label',       city,
            'solicited',   COUNT(*)::int,
            'answered',    COUNT(*) FILTER (WHERE answered)::int,
            'won',         COUNT(*) FILTER (WHERE outcome = 'won')::int,
            'lost',        COUNT(*) FILTER (WHERE outcome = 'lost')::int,
            'no_response', COUNT(*) FILTER (WHERE outcome = 'no_response')::int,
            'resolved',    COUNT(*) FILTER (WHERE outcome IN ('won', 'lost'))::int
        ) AS bucket
    FROM outcome_leads
    WHERE solicited
    GROUP BY city
    ORDER BY 2 DESC, 1 ASC
    LIMIT 20
),
outcome_by_job_type AS (
    SELECT
        job_type AS label,
        COUNT(*)::int AS n_solicited,
        jsonb_build_object(
            'label',       job_type,
            'solicited',   COUNT(*)::int,
            'answered',    COUNT(*) FILTER (WHERE answered)::int,
            'won',         COUNT(*) FILTER (WHERE outcome = 'won')::int,
            'lost',        COUNT(*) FILTER (WHERE outcome = 'lost')::int,
            'no_response', COUNT(*) FILTER (WHERE outcome = 'no_response')::int,
            'resolved',    COUNT(*) FILTER (WHERE outcome IN ('won', 'lost'))::int
        ) AS bucket
    FROM outcome_leads
    WHERE solicited
    GROUP BY job_type
    ORDER BY 2 DESC, 1 ASC
)
SELECT jsonb_object_agg(per.k, per.metrics) || jsonb_build_object(
    'all_time', (
        SELECT jsonb_build_object(
            'buyers_total', a.buyers_total,
            'repeat_buyers', a.repeat_buyers,
            'repeat_rate', ROUND(a.repeat_buyers::numeric / NULLIF(a.buyers_total, 0), 4),
            'total_pros', a.total_pros,
            'complete_profiles', a.complete_profiles,
            'pct_complete_profiles', ROUND(a.complete_profiles::numeric / NULLIF(a.total_pros, 0), 4)
        )
        FROM (
            SELECT
                (SELECT COUNT(*)::int FROM (
                    SELECT pro_id FROM public.credit_transactions
                    WHERE type = 'purchase' AND stripe_session_id IS NOT NULL
                    GROUP BY pro_id
                ) s1) AS buyers_total,
                (SELECT COUNT(*)::int FROM (
                    SELECT pro_id FROM public.credit_transactions
                    WHERE type = 'purchase' AND stripe_session_id IS NOT NULL
                    GROUP BY pro_id
                    HAVING COUNT(*) >= 2
                ) s2) AS repeat_buyers,
                (SELECT COUNT(*)::int FROM public.profiles WHERE role = 'pro') AS total_pros,
                (SELECT COUNT(*)::int FROM public.profiles
                 WHERE role = 'pro' AND LENGTH(COALESCE(bio, '')) >= 150) AS complete_profiles
        ) a
    )
) || (
    -- Section cumulative, effectifs bruts uniquement (voir l'en-tête du fichier).
    SELECT jsonb_build_object('outcomes', jsonb_build_object(
        'delay_days', 15,
        'funnel', jsonb_build_object(
            'unlocks_total',        f.unlocks_total,
            'eligible',             f.eligible,
            'solicited',            f.solicited,
            'suppressed',           f.suppressed,
            'pending_solicitation', f.pending_solicitation,
            'answered',             f.answered,
            'awaiting_answer',      f.awaiting_answer
        ),
        'answers', jsonb_build_object(
            'won',         f.won,
            'lost',        f.lost,
            'no_response', f.no_response,
            'resolved',    f.resolved
        ),
        'acquisition', jsonb_build_object(
            'won',               f.won,
            'credits_answered',  f.credits_answered,
            'credits_resolved',  f.credits_resolved,
            'credits_purchased', p.credits_purchased,
            'eur_per_credit',    p.eur_per_credit
        ),
        'cities_total', f.cities_total,
        'by_city', (
            SELECT COALESCE(jsonb_agg(c.bucket ORDER BY c.n_solicited DESC, c.label), '[]'::jsonb)
            FROM outcome_by_city c
        ),
        'by_job_type', (
            SELECT COALESCE(jsonb_agg(t.bucket ORDER BY t.n_solicited DESC, t.label), '[]'::jsonb)
            FROM outcome_by_job_type t
        )
    ))
    FROM outcome_funnel f CROSS JOIN outcome_price p
)
FROM per;
$$;

-- ⚠️ Un CREATE OR REPLACE conserve les ACL, mais on re-pose les verrous : si ce
-- fichier est un jour rejoué sur une base où 20260901b/d ne sont pas passées, la
-- fonction naît ici et les DEFAULT PRIVILEGES Supabase l'exposeraient à anon et
-- authenticated (leçon 20260828l). REVOKE FROM PUBLIC seul ne suffit pas.
REVOKE EXECUTE ON FUNCTION public.admin_analytics_overview(timestamptz, timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_analytics_overview(timestamptz, timestamptz) TO service_role;

COMMIT;

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================
-- 1) Payload :
--    SELECT jsonb_pretty(public.admin_analytics_overview(now() - interval '30 days', now()) -> 'outcomes');
--    Attendu au 2026-09-03 : funnel.solicited = 3, funnel.suppressed = 6,
--    answers.won = 1, answers.lost = 1, answers.resolved = 2.
-- 2) Neutralisées : SELECT count(*) FROM unlocked_leads WHERE outcome_email_suppressed;
--    → 6 (les lignes traitées par 20260902c, jamais destinataires d'un email).
-- 3) Cohérence : funnel.answered <= funnel.solicited, toujours — sinon le taux
--    de réponse dépasserait 100 %.
-- 4) ACL : SELECT proacl FROM pg_proc WHERE proname = 'admin_analytics_overview';
--    → ni anon ni authenticated.
-- 5) Base vide (aucun déblocage) : tous les compteurs à 0, by_city = [],
--    by_job_type = [], eur_per_credit = null — aucune division par zéro.
-- ============================================================================
