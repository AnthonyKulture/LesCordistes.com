-- LesCordistes — Pro alerts : auto-création de souscriptions à partir des
-- intervention_zones des profils pro.
-- 2026-05-04
--
-- Problème : find_pro_alert_matches ne lit que pro_alert_subscriptions
-- (opt-in explicite via le bouton sur /jobs). Les pros qui ont rempli
-- leurs zones d'intervention dans leur profil (intervention_zones) ne
-- recevaient AUCUN email d'alerte. Sur ce projet, l'inscription en tant
-- que pro vaut consentement aux alertes mission par défaut.
--
-- Fix : avant le SELECT, le RPC auto-crée une souscription pour chaque
-- pro ayant des intervention_zones et aucune souscription existante.
-- Source = 'auto:profile_zones' pour traçabilité. confirmed_at = NOW()
-- - 7 jours → récupère les missions récentes sans noyer le pro avec 6 mois
-- d'historique. Si le pro modifie ses zones plus tard, on sync uniquement
-- les souscriptions auto-créées (les souscriptions explicites restent
-- canoniques).
--
-- Comportement utilisateur :
--   - Désinscription via le lien email → marque unsubscribed_at, le pro
--     ne reçoit plus rien (même si on rejoue le cron).
--   - Suppression des intervention_zones du profil → la sous existante
--     reste avec ses anciens dpts (decision : ne pas toucher si vide).
--
-- À exécuter MANUELLEMENT dans Supabase SQL Editor.

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
    -- 1. Auto-créer les souscriptions pour les pros ayant des intervention_zones
    --    mais sans souscription existante (active OU désinscrite).
    --    confirmed_at = NOW() - 7 jours → récupère les missions récentes
    --    sans noyer le pro avec 6 mois d'historique.
    INSERT INTO pro_alert_subscriptions
        (email, departments, source, marketing_opt_in, confirmed_at)
    SELECT
        p.email,
        p.intervention_zones,
        'auto:profile_zones',
        TRUE,
        NOW() - INTERVAL '7 days'
    FROM profiles p
    WHERE p.role = 'pro'
      AND p.intervention_zones IS NOT NULL
      AND array_length(p.intervention_zones, 1) > 0
      AND p.email IS NOT NULL
      AND p.email <> ''
      AND NOT EXISTS (
          SELECT 1 FROM pro_alert_subscriptions s
          WHERE lower(s.email) = lower(p.email)
      );

    -- 2. Sync les départements pour les souscriptions auto-créées si le pro
    --    a mis à jour ses intervention_zones depuis. On ne touche PAS aux
    --    souscriptions explicites (source != 'auto:profile_zones').
    UPDATE pro_alert_subscriptions s
    SET departments = p.intervention_zones,
        updated_at  = NOW()
    FROM profiles p
    WHERE lower(s.email) = lower(p.email)
      AND s.source = 'auto:profile_zones'
      AND p.role = 'pro'
      AND p.intervention_zones IS NOT NULL
      AND array_length(p.intervention_zones, 1) > 0
      AND s.departments IS DISTINCT FROM p.intervention_zones;

    -- 3. Query existante (inchangée)
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

REVOKE ALL ON FUNCTION find_pro_alert_matches(INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION find_pro_alert_matches(INTEGER) TO service_role;

-- ============================================================
-- Vérification : combien d'auto-souscriptions vont être créées au prochain cron
-- ============================================================
SELECT
    'pros sans souscription, avec intervention_zones' AS check,
    COUNT(*) AS rows_to_auto_create
FROM profiles p
WHERE p.role = 'pro'
  AND p.intervention_zones IS NOT NULL
  AND array_length(p.intervention_zones, 1) > 0
  AND p.email IS NOT NULL
  AND p.email <> ''
  AND NOT EXISTS (
      SELECT 1 FROM pro_alert_subscriptions s
      WHERE lower(s.email) = lower(p.email)
  );
