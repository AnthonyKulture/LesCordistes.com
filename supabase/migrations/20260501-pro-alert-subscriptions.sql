-- LesCordistes — Alertes pro par email (souscription depuis /jobs)
-- 2026-05-01
--
-- Objectif : un cordiste laisse son email + ses départements d'intervention
-- depuis la page /jobs. Chaque fois qu'une nouvelle mission live est publiée
-- dans l'un de ses départements, il reçoit un email batché.
--
-- Tables :
--   - pro_alert_subscriptions : 1 ligne / email (unique). Liste des départements suivis.
--   - pro_alert_sends         : 1 ligne / (subscription, job) — empêche de réenvoyer.
--
-- RLS :
--   - INSERT public via service_role uniquement (l'API admin route relaie).
--   - SELECT admin only (cohérent avec marketing_*).
--
-- À exécuter dans Supabase SQL Editor.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- 1. Table principale
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pro_alert_subscriptions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email               TEXT NOT NULL,
    departments         TEXT[] NOT NULL DEFAULT '{}',
    source              TEXT,                       -- ex: 'jobs_page', 'jobs_page_map'
    metadata            JSONB NOT NULL DEFAULT '{}'::jsonb,
    marketing_opt_in    BOOLEAN NOT NULL DEFAULT TRUE,
    confirmed_at        TIMESTAMPTZ DEFAULT NOW(),  -- single opt-in pour démarrer
    unsubscribed_at     TIMESTAMPTZ,
    last_alert_sent_at  TIMESTAMPTZ,
    last_match_count    INTEGER NOT NULL DEFAULT 0,
    total_alerts_sent   INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pro_alert_subs_email_lower
    ON pro_alert_subscriptions (lower(email));
CREATE INDEX IF NOT EXISTS idx_pro_alert_subs_active
    ON pro_alert_subscriptions (unsubscribed_at)
    WHERE unsubscribed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pro_alert_subs_departments
    ON pro_alert_subscriptions USING GIN (departments);

-- ------------------------------------------------------------
-- 2. Table d'envois — déduplication par (subscription, job)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pro_alert_sends (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES pro_alert_subscriptions(id) ON DELETE CASCADE,
    job_id          UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    email           TEXT NOT NULL,
    sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resend_email_id TEXT,
    UNIQUE (subscription_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_pro_alert_sends_subscription
    ON pro_alert_sends (subscription_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_pro_alert_sends_job
    ON pro_alert_sends (job_id);

-- ------------------------------------------------------------
-- 3. Trigger updated_at
-- ------------------------------------------------------------
DROP TRIGGER IF EXISTS update_pro_alert_subs_updated_at ON pro_alert_subscriptions;
CREATE TRIGGER update_pro_alert_subs_updated_at
    BEFORE UPDATE ON pro_alert_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------
-- 4. RLS — service_role écrit, admin lit
-- ------------------------------------------------------------
ALTER TABLE pro_alert_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pro_alert_sends         ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN SELECT unnest(ARRAY['pro_alert_subscriptions', 'pro_alert_sends']) LOOP
        EXECUTE format($f$
            DROP POLICY IF EXISTS "%1$s_service_role_all" ON %1$s;
            CREATE POLICY "%1$s_service_role_all" ON %1$s
                FOR ALL USING ((auth.jwt() ->> 'role') = 'service_role')
                WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');

            DROP POLICY IF EXISTS "%1$s_admin_select" ON %1$s;
            CREATE POLICY "%1$s_admin_select" ON %1$s
                FOR SELECT TO authenticated
                USING (EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                      AND profiles.role = 'admin'
                ));
        $f$, t);
    END LOOP;
END $$;

-- ------------------------------------------------------------
-- 5. RPC subscribe_pro_alert(email, departments, source, metadata)
-- Upsert idempotent + merge des départements existants si déjà inscrit.
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
SET search_path = public
AS $$
DECLARE
    v_email_lc       TEXT := lower(trim(p_email));
    v_clean_depts    TEXT[];
    v_existing_id    UUID;
    v_existing_depts TEXT[];
    v_merged_depts   TEXT[];
    v_was_unsub      TIMESTAMPTZ;
    v_subscription_id UUID;
    v_action         TEXT;
BEGIN
    IF v_email_lc IS NULL OR v_email_lc = '' OR v_email_lc !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' THEN
        RETURN jsonb_build_object('ok', false, 'error', 'invalid_email');
    END IF;

    -- Dédoublonner + filtrer codes vides
    SELECT array_agg(DISTINCT trim(d) ORDER BY trim(d))
    INTO v_clean_depts
    FROM unnest(coalesce(p_departments, ARRAY[]::TEXT[])) AS d
    WHERE coalesce(trim(d), '') <> '';

    IF v_clean_depts IS NULL OR array_length(v_clean_depts, 1) IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'error', 'no_departments');
    END IF;

    -- Existant ?
    SELECT id, departments, unsubscribed_at
    INTO v_existing_id, v_existing_depts, v_was_unsub
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
        -- Merge des départements (on n'écrase jamais, on ajoute).
        SELECT array_agg(DISTINCT d ORDER BY d)
        INTO v_merged_depts
        FROM (
            SELECT unnest(coalesce(v_existing_depts, ARRAY[]::TEXT[])) AS d
            UNION
            SELECT unnest(v_clean_depts)
        ) m;

        UPDATE pro_alert_subscriptions
        SET departments      = v_merged_depts,
            -- Si l'utilisateur s'était désinscrit, on ne le réactive PAS automatiquement
            -- Il doit explicitement se réinscrire. Mais on conserve la nouvelle source/metadata.
            source           = CASE WHEN v_was_unsub IS NULL THEN coalesce(p_source, source) ELSE source END,
            metadata         = CASE WHEN v_was_unsub IS NULL
                                    THEN metadata || coalesce(p_metadata, '{}'::jsonb)
                                    ELSE metadata END,
            updated_at       = NOW()
        WHERE id = v_existing_id;

        v_subscription_id := v_existing_id;
        v_action := CASE
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

REVOKE ALL ON FUNCTION subscribe_pro_alert(TEXT, TEXT[], TEXT, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION subscribe_pro_alert(TEXT, TEXT[], TEXT, JSONB) TO service_role;

-- ------------------------------------------------------------
-- 6. RPC unsubscribe_pro_alert(email)
-- Soft-delete : marketing_opt_in=false + unsubscribed_at=NOW().
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION unsubscribe_pro_alert(p_email TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_email_lc TEXT := lower(trim(p_email));
    v_id UUID;
BEGIN
    IF v_email_lc IS NULL OR v_email_lc = '' THEN
        RETURN jsonb_build_object('ok', false, 'error', 'invalid_email');
    END IF;

    UPDATE pro_alert_subscriptions
    SET marketing_opt_in = FALSE,
        unsubscribed_at  = COALESCE(unsubscribed_at, NOW()),
        updated_at       = NOW()
    WHERE lower(email) = v_email_lc
    RETURNING id INTO v_id;

    RETURN jsonb_build_object('ok', true, 'subscription_id', v_id);
END;
$$;

REVOKE ALL ON FUNCTION unsubscribe_pro_alert(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION unsubscribe_pro_alert(TEXT) TO service_role;

-- ------------------------------------------------------------
-- 7. RPC find_pro_alert_matches(p_max_jobs_per_sub) — utilisé par le cron.
-- Retourne (subscription_id, email, departments, job_id, job_title, job_slug,
--           job_city, job_department, job_category, job_created_at)
-- pour tous les couples (sub, job) :
--   - sub.unsubscribed_at IS NULL
--   - sub.marketing_opt_in = TRUE
--   - job.status = 'live'
--   - job.created_at > sub.confirmed_at (jamais d'alertes rétroactives au moment de l'inscription)
--   - job.location_department = ANY(sub.departments)
--   - aucune ligne (sub, job) déjà dans pro_alert_sends
-- LIMIT par sub : p_max_jobs_per_sub (typiquement 10).
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
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH ranked AS (
        SELECT
            s.id              AS subscription_id,
            s.email           AS email,
            s.departments     AS departments,
            j.id              AS job_id,
            j.title           AS job_title,
            j.slug            AS job_slug,
            j.location_city   AS job_city,
            j.location_department AS job_department,
            j.category        AS job_category,
            j.type            AS job_type,
            j.credit_cost     AS job_credit_cost,
            j.created_at      AS job_created_at,
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

REVOKE ALL ON FUNCTION find_pro_alert_matches(INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION find_pro_alert_matches(INTEGER) TO service_role;

-- ============================================================
-- FIN
-- ============================================================
