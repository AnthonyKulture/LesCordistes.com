-- LesCordistes — RGPD : opt-in explicite pour la relance leads, fin de
-- l'auto-souscription aux alertes pro, purge planifiée.
-- 2026-09-01 (c)
--
-- Décisions client 2026-09-01 (tranchées, ne pas rediscuter) :
--   1. Relance leads = OPT-IN EXPLICITE : le cron leads-followup ne relance
--      que les leads ayant coché la case de consentement.
--   2. L'opt-out marketing coupe les alertes AUTO-souscrites
--      (source = 'auto:profile_zones'), jamais les souscriptions
--      explicitement demandées via le bouton /jobs.
--
-- PAS de backfill de consent_at : les leads existants n'ont PAS consenti,
-- consent_at reste NULL pour eux — c'est le point.
--
-- Idempotente et relançable. À exécuter dans Supabase SQL Editor.
-- Ordre de déploiement : le code (route /api/leads, cron leads-followup)
-- tourne avant ET après cette migration (repli 42703 côté code).

-- ------------------------------------------------------------
-- 1. leads.consent_at / consent_source
-- ------------------------------------------------------------
ALTER TABLE leads
    ADD COLUMN IF NOT EXISTS consent_at     TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS consent_source TEXT;

COMMENT ON COLUMN leads.consent_at IS
'Horodatage du consentement explicite à la relance (case cochée sur le formulaire). '
'NULL = pas de consentement : le lead est capturé mais jamais relancé.';

COMMENT ON COLUMN leads.consent_source IS
'Formulaire où la case a été cochée : wizard | city-hero | blog.';

-- Index cron : leads relançables (consentis, pas encore traités)
CREATE INDEX IF NOT EXISTS idx_leads_followup_pending_consent
    ON leads (created_at)
    WHERE followup_sent_at IS NULL AND consent_at IS NOT NULL;

-- ------------------------------------------------------------
-- 2. find_pro_alert_matches — retrait de l'auto-souscription
--    (revert au comportement 20260501 : seules les souscriptions
--    explicites via /jobs sont servies ; le RPC ne crée plus RIEN)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION find_pro_alert_matches(p_max_jobs_per_sub INTEGER DEFAULT 10)
RETURNS TABLE (
    subscription_id  UUID,
    email            TEXT,
    departments      TEXT[],
    job_id           UUID,
    job_title        TEXT,
    job_slug         TEXT,
    job_city         TEXT,
    job_department   TEXT,
    job_category     TEXT,
    job_type         TEXT,
    job_credit_cost  INTEGER,
    job_created_at   TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN QUERY
    WITH ranked AS (
        SELECT
            s.id                          AS subscription_id,
            s.email::TEXT                 AS email,
            s.departments                 AS departments,
            j.id                          AS job_id,
            j.title::TEXT                 AS job_title,
            j.slug::TEXT                  AS job_slug,
            j.location_city::TEXT         AS job_city,
            j.location_department::TEXT   AS job_department,
            j.category::TEXT              AS job_category,
            j.type::TEXT                  AS job_type,
            COALESCE(j.credit_cost, 1)::INTEGER AS job_credit_cost,
            j.created_at                  AS job_created_at,
            ROW_NUMBER() OVER (PARTITION BY s.id ORDER BY j.created_at DESC) AS rn
        FROM pro_alert_subscriptions s
        JOIN jobs j ON j.location_department = ANY(s.departments)
        WHERE s.unsubscribed_at IS NULL
          AND s.marketing_opt_in = TRUE
          AND j.status = 'live'
          AND j.created_at > s.confirmed_at
          AND NOT EXISTS (
              SELECT 1 FROM pro_alert_sends pas
              WHERE pas.subscription_id = s.id
                AND pas.job_id = j.id
          )
    )
    SELECT
        r.subscription_id,
        r.email,
        r.departments,
        r.job_id,
        r.job_title,
        r.job_slug,
        r.job_city,
        r.job_department,
        r.job_category,
        r.job_type,
        r.job_credit_cost,
        r.job_created_at
    FROM ranked r
    WHERE r.rn <= GREATEST(1, p_max_jobs_per_sub)
    ORDER BY r.subscription_id, r.job_created_at DESC;
END;
$$;

REVOKE EXECUTE ON FUNCTION find_pro_alert_matches(INTEGER)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION find_pro_alert_matches(INTEGER) TO service_role;

-- ------------------------------------------------------------
-- 3. Désactivation des souscriptions auto-créées existantes.
--    Identifiables par source = 'auto:profile_zones' (posé par 20260504).
--    Les souscriptions explicites (source différente) ne sont pas touchées.
--    Prévisualisation :
--      SELECT count(*) FROM pro_alert_subscriptions
--      WHERE source = 'auto:profile_zones' AND unsubscribed_at IS NULL;
-- ------------------------------------------------------------
UPDATE pro_alert_subscriptions
SET unsubscribed_at = NOW(),
    updated_at      = NOW()
WHERE source = 'auto:profile_zones'
  AND unsubscribed_at IS NULL;

-- ------------------------------------------------------------
-- 3bis. subscribe_pro_alert — un clic explicite RÉACTIVE une
--    souscription désinscrite d'office (source 'auto:profile_zones').
--
--    Sans quoi la section 3 crée une impasse : la désinscription de masse
--    des souscriptions auto + l'index unique lower(email) + le refus
--    historique de réactivation = un pro qui clique « M'alerter » sur /jobs
--    reçoit ok:true mais ne sera JAMAIS réinscrit.
--
--    Doctrine (décision client n°2) : le clic /jobs est un opt-in explicite —
--    il écrase un opt-out D'OFFICE. Une désinscription posée sur une
--    souscription déjà EXPLICITE (lien mail) reste, elle, respectée.
--    Base : corps 20260501, la branche UPDATE seule change.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION subscribe_pro_alert(
    p_email       TEXT,
    p_departments TEXT[],
    p_source      TEXT DEFAULT 'jobs_page',
    p_metadata    JSONB DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_email_lc       TEXT := lower(trim(p_email));
    v_clean_depts    TEXT[];
    v_existing_id    UUID;
    v_existing_depts TEXT[];
    v_existing_source TEXT;
    v_merged_depts   TEXT[];
    v_was_unsub      TIMESTAMPTZ;
    v_subscription_id UUID;
    v_action         TEXT;
    v_reactivate     BOOLEAN := FALSE;
BEGIN
    IF v_email_lc IS NULL OR v_email_lc = '' OR v_email_lc !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' THEN
        RETURN jsonb_build_object('ok', false, 'error', 'invalid_email');
    END IF;

    SELECT array_agg(DISTINCT trim(d) ORDER BY trim(d))
    INTO v_clean_depts
    FROM unnest(coalesce(p_departments, ARRAY[]::TEXT[])) AS d
    WHERE coalesce(trim(d), '') <> '';

    IF v_clean_depts IS NULL OR array_length(v_clean_depts, 1) IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'error', 'no_departments');
    END IF;

    SELECT id, departments, unsubscribed_at, source
    INTO v_existing_id, v_existing_depts, v_was_unsub, v_existing_source
    FROM pro_alert_subscriptions
    WHERE lower(email) = v_email_lc
    LIMIT 1;

    IF v_existing_id IS NULL THEN
        INSERT INTO pro_alert_subscriptions
            (email, departments, source, metadata, confirmed_at)
        VALUES
            (p_email, v_clean_depts, coalesce(p_source, 'jobs_page'), coalesce(p_metadata, '{}'::jsonb), NOW())
        RETURNING id INTO v_subscription_id;
        v_action := 'created';
    ELSE
        -- Réactivation UNIQUEMENT pour un opt-out d'office : la personne
        -- n'a jamais rien demandé, son clic vaut premier consentement.
        v_reactivate := (v_was_unsub IS NOT NULL AND v_existing_source = 'auto:profile_zones');

        SELECT array_agg(DISTINCT d ORDER BY d)
        INTO v_merged_depts
        FROM (
            SELECT unnest(coalesce(v_existing_depts, ARRAY[]::TEXT[])) AS d
            UNION
            SELECT unnest(v_clean_depts)
        ) m;

        UPDATE pro_alert_subscriptions
        SET departments      = v_merged_depts,
            unsubscribed_at  = CASE WHEN v_reactivate THEN NULL ELSE unsubscribed_at END,
            confirmed_at     = CASE WHEN v_reactivate THEN NOW() ELSE confirmed_at END,
            source           = CASE WHEN v_was_unsub IS NULL OR v_reactivate
                                    THEN coalesce(p_source, source) ELSE source END,
            metadata         = CASE WHEN v_was_unsub IS NULL OR v_reactivate
                                    THEN metadata || coalesce(p_metadata, '{}'::jsonb)
                                    ELSE metadata END,
            updated_at       = NOW()
        WHERE id = v_existing_id;

        v_subscription_id := v_existing_id;
        v_action := CASE
            WHEN v_reactivate THEN 'reactivated'
            WHEN v_was_unsub IS NOT NULL THEN 'updated_but_unsubscribed'
            ELSE 'updated'
        END;
    END IF;

    RETURN jsonb_build_object(
        'ok', true,
        'action', v_action,
        'subscription_id', v_subscription_id,
        'departments', coalesce(v_merged_depts, v_clean_depts)
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION subscribe_pro_alert(TEXT, TEXT[], TEXT, JSONB)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION subscribe_pro_alert(TEXT, TEXT[], TEXT, JSONB)
    TO service_role;

-- ------------------------------------------------------------
-- 4. mark_marketing_unsubscribed — propage l'opt-out marketing vers les
--    souscriptions d'alertes AUTO uniquement (décision client n°2).
--    Base : version 20260901a (écrit lower(email), search_path durci).
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION mark_marketing_unsubscribed(
    p_email      TEXT,
    p_reason     TEXT DEFAULT NULL,
    p_campaign_id UUID DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_ip_hash    TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_email_lc TEXT := lower(trim(p_email));
    v_contact_id UUID;
BEGIN
    IF v_email_lc IS NULL OR v_email_lc = '' THEN
        RETURN jsonb_build_object('ok', false, 'error', 'invalid_email');
    END IF;

    SELECT id INTO v_contact_id
    FROM marketing_contacts
    WHERE lower(email) = v_email_lc
    LIMIT 1;

    IF v_contact_id IS NULL THEN
        -- Contact inconnu : contact "ghost" opt-out pour bloquer toute
        -- future sync — stocké en minuscules.
        INSERT INTO marketing_contacts (email, audience_type, marketing_opt_in, unsubscribed_at, source)
        VALUES (v_email_lc, 'unknown', FALSE, NOW(), 'unsubscribe_link')
        ON CONFLICT ((lower(email))) DO UPDATE SET
            marketing_opt_in = FALSE,
            unsubscribed_at = COALESCE(marketing_contacts.unsubscribed_at, NOW())
        RETURNING id INTO v_contact_id;
    ELSE
        UPDATE marketing_contacts
        SET marketing_opt_in = FALSE,
            unsubscribed_at = COALESCE(unsubscribed_at, NOW()),
            updated_at = NOW()
        WHERE id = v_contact_id;
    END IF;

    -- Décision client 2026-09-01 : l'opt-out marketing coupe les alertes
    -- missions AUTO-souscrites, jamais celles explicitement demandées via
    -- le bouton /jobs (source différente de 'auto:profile_zones').
    UPDATE pro_alert_subscriptions
    SET unsubscribed_at = COALESCE(unsubscribed_at, NOW()),
        updated_at      = NOW()
    WHERE lower(email) = v_email_lc
      AND source = 'auto:profile_zones'
      AND unsubscribed_at IS NULL;

    INSERT INTO marketing_unsubscribes
        (email, contact_id, campaign_id, reason, user_agent, ip_hash)
    VALUES
        (v_email_lc, v_contact_id, p_campaign_id, p_reason, p_user_agent, p_ip_hash);

    RETURN jsonb_build_object(
        'ok', true,
        'contact_id', v_contact_id,
        'email', v_email_lc
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION mark_marketing_unsubscribed(TEXT, TEXT, UUID, TEXT, TEXT)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION mark_marketing_unsubscribed(TEXT, TEXT, UUID, TEXT, TEXT)
    TO service_role;

-- ------------------------------------------------------------
-- 5. Purge RGPD mensuelle (pg_cron, SQL pur — ni Vault ni pg_net requis :
--    contrairement à leads-followup, la purge n'appelle aucune edge function)
--
-- Prévisualiser l'effet AVANT le premier passage :
--   SELECT count(*) AS leads_a_purger FROM leads
--   WHERE consent_at IS NULL
--     AND COALESCE(updated_at, created_at) < NOW() - INTERVAL '3 years';
--   SELECT count(*) AS runs_a_purger FROM marketing_playbook_runs
--   WHERE created_at < NOW() - INTERVAL '2 years'
--     AND status IN ('failed', 'skipped');
--   (les runs 'sent' sont CONSERVÉS : ils forment le ledger anti-doublon
--    UNIQUE (playbook_id, contact_id) — les purger ré-enverrait le même
--    playbook aux contacts encore présents dans un segment evergreen)
-- ------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'rgpd-purge-monthly') THEN
        PERFORM cron.unschedule('rgpd-purge-monthly');
    END IF;
END $$;

-- Le 1er de chaque mois à 03:10 UTC.
SELECT cron.schedule(
    'rgpd-purge-monthly',
    '10 3 1 * *',
    $$
    DELETE FROM public.leads
    WHERE consent_at IS NULL
      AND COALESCE(updated_at, created_at) < NOW() - INTERVAL '3 years';
    DELETE FROM public.marketing_playbook_runs
    WHERE created_at < NOW() - INTERVAL '2 years'
      AND status IN ('failed', 'skipped');
    $$
);

-- Vérification
SELECT jobname, schedule, active FROM cron.job WHERE jobname = 'rgpd-purge-monthly';
