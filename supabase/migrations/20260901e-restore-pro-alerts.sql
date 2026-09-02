-- ============================================================================
-- CORRECTIF — Restauration des alertes missions pour les pros
--
-- CE QUI S'EST PASSÉ. La migration 20260901c a traité les souscriptions
-- `source = 'auto:profile_zones'` comme des souscriptions SUBIES : elle a
-- retiré leur auto-création (section 2) et désinscrit d'office les 35
-- existantes (section 3).
--
-- C'ÉTAIT FAUX. Renseigner ses zones d'intervention à la création du profil
-- EST la demande d'alertes — c'est le choix produit, explicitement documenté
-- en tête de 20260504-pro-alerts-auto-from-profile-zones.sql : « Sur ce
-- projet, l'inscription en tant que pro vaut consentement aux alertes mission
-- par défaut. » Le préfixe `auto:` désigne le mode de création de la ligne,
-- pas une absence de consentement.
--
-- Confirmé par le client le 2026-09-01 : « les 35 pros doivent impérativement
-- avoir les alertes, ils les ont demandées en mettant leur zone
-- d'intervention pendant la création de profil ».
--
-- CETTE MIGRATION RÉTABLIT L'ÉTAT ANTÉRIEUR, en trois gestes :
--   1. réinscrit les souscriptions désinscrites PAR 20260901c uniquement ;
--   2. restaure l'auto-création dans find_pro_alert_matches (corps 20260504) ;
--   3. retire la propagation de l'opt-out marketing vers ces souscriptions.
--
-- CE QUI EST CONSERVÉ DE 20260901c : l'opt-in explicite des leads du wizard
-- (une relance commerciale après une saisie d'email abandonnée n'a rien à voir
-- avec un service demandé par un pro inscrit), et la réactivation ajoutée à
-- subscribe_pro_alert — elle reste utile et sans effet de bord.
--
-- Idempotente et relançable. À exécuter dans Supabase SQL Editor.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. PRÉVISUALISATION — à lire AVANT d'exécuter le reste
-- ----------------------------------------------------------------------------
--   SELECT count(*) AS a_reinscrire
--   FROM pro_alert_subscriptions s
--   WHERE s.source = 'auto:profile_zones'
--     AND s.unsubscribed_at IS NOT NULL
--     AND NOT EXISTS (SELECT 1 FROM marketing_unsubscribes u
--                     WHERE lower(u.email) = lower(s.email));
--   → doit être proche de 35. Si le nombre est très supérieur, s'arrêter :
--     des désinscriptions volontaires seraient sur le point d'être écrasées.

-- ----------------------------------------------------------------------------
-- 1. Réinscription des souscriptions coupées par 20260901c
--
-- CIBLAGE PRUDENT — on ne réinscrit QUE celles pour lesquelles il n'existe
-- AUCUNE trace de désinscription volontaire. Une désinscription via le lien
-- d'un email laisse toujours une ligne dans `marketing_unsubscribes`
-- (mark_marketing_unsubscribed l'insère systématiquement) : son absence
-- signe une désinscription d'office, donc la nôtre.
-- Un pro qui s'était volontairement désinscrit AVANT le 1er septembre garde
-- donc son opt-out — c'est le point de cette clause.
-- ----------------------------------------------------------------------------
UPDATE pro_alert_subscriptions s
SET unsubscribed_at = NULL,
    confirmed_at    = COALESCE(s.confirmed_at, NOW() - INTERVAL '7 days'),
    updated_at      = NOW()
WHERE s.source = 'auto:profile_zones'
  AND s.unsubscribed_at IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM marketing_unsubscribes u
      WHERE lower(u.email) = lower(s.email)
  );

-- ----------------------------------------------------------------------------
-- 2. find_pro_alert_matches — restauration du corps 20260504
--    (auto-création + sync des départements + requête de matching)
--    search_path durci au passage : `public, pg_temp` (leçon 20260828h).
-- ----------------------------------------------------------------------------
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

REVOKE EXECUTE ON FUNCTION find_pro_alert_matches(INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION find_pro_alert_matches(INTEGER) TO service_role;

-- ----------------------------------------------------------------------------
-- 3. mark_marketing_unsubscribed — retrait de la propagation vers les alertes
--
-- 20260901c coupait les souscriptions `auto:profile_zones` lors d'un opt-out
-- MARKETING, au motif qu'elles étaient subies. Elles ne le sont pas : se
-- désinscrire de la prospection ne doit pas couper un service demandé.
-- Les deux canaux redeviennent indépendants, chacun avec son propre lien de
-- désinscription — c'est bien la décision « opt-out séparé » du client, dont
-- 20260901c avait tiré la mauvaise conséquence.
-- Corps 20260901a restauré à l'identique (lower(email), search_path durci).
-- ----------------------------------------------------------------------------
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

    -- PAS de propagation vers pro_alert_subscriptions : les alertes missions
    -- sont un service demandé (zones d'intervention), pas de la prospection.
    -- Le lien de désinscription des emails d'alerte appelle, lui,
    -- unsubscribe_pro_alert — c'est la voie prévue pour les couper.

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

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================
-- 1) Plus aucune souscription auto désinscrite sans trace volontaire (0 attendu) :
--      SELECT count(*) FROM pro_alert_subscriptions s
--      WHERE s.source = 'auto:profile_zones' AND s.unsubscribed_at IS NOT NULL
--        AND NOT EXISTS (SELECT 1 FROM marketing_unsubscribes u
--                        WHERE lower(u.email) = lower(s.email));
--
-- 2) Les 35 sont actives :
--      SELECT count(*) FROM pro_alert_subscriptions
--      WHERE source = 'auto:profile_zones' AND unsubscribed_at IS NULL;
--
-- 3) L'auto-création est de retour (le RPC ne doit plus renvoyer 0 pour un pro
--    ayant des zones et aucune souscription) :
--      SELECT count(*) FROM find_pro_alert_matches(10);
--
-- 4) Aucune désinscription volontaire n'a été écrasée :
--      SELECT s.email, s.unsubscribed_at FROM pro_alert_subscriptions s
--      JOIN marketing_unsubscribes u ON lower(u.email) = lower(s.email)
--      WHERE s.unsubscribed_at IS NULL;   -- doit rester vide
-- ============================================================================
