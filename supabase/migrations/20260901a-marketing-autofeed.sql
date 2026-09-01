-- ============================================================
-- LesCordistes — Marketing : assainissement + alimentation auto
-- À exécuter dans le SQL Editor de Supabase (idempotent)
--
-- 1. Normalise les emails existants en minuscules (contacts +
--    recipients) — sans risque de collision : les index uniques
--    sur lower(email) l'excluent déjà.
-- 2. Index plats pour les lookups .eq('email', ...) côté app
--    (les index d'unicité sont des index d'expression lower(email),
--    inutilisables par un prédicat email = $1).
-- 3. upsert_marketing_contact() — réconciliation par lower(email) :
--    attache user_id aux contacts "ghost" (opt-out sans user_id),
--    gère le changement d'email d'un profil, ne réactive JAMAIS un
--    unsubscribed_at posé.
-- 4. sync_marketing_contacts() corrigée : l'upsert historique était
--    ON CONFLICT (user_id) alors que l'unicité réelle est
--    lower(email) → collision avec un ghost opt-out = échec.
-- 5. Trigger AFTER INSERT OR UPDATE sur profiles → alimentation
--    automatique des contacts (le bouton "Sync contacts" reste en
--    rattrapage).
-- 6. mark_marketing_unsubscribed() réécrite : écrit lower(email).
-- 7. Verrouillage : aucune fonction exécutable par anon /
--    authenticated (les DEFAULT PRIVILEGES Supabase re-grantent
--    anon/authenticated sur toute nouvelle fonction — révocation
--    nominative obligatoire, cf. 20260828l).
-- ============================================================

-- ------------------------------------------------------------
-- 1. Normalisation des emails existants
-- ------------------------------------------------------------
UPDATE marketing_contacts
SET email = lower(email)
WHERE email <> lower(email);

UPDATE marketing_campaign_recipients
SET email = lower(email)
WHERE email <> lower(email);

-- ------------------------------------------------------------
-- 2. Index plats pour les lookups par égalité stricte
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_marketing_contacts_email_eq
    ON marketing_contacts (email);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_email_eq
    ON marketing_campaign_recipients (campaign_id, email);

-- ------------------------------------------------------------
-- 3. upsert_marketing_contact() — brique de réconciliation unique,
--    partagée par sync_marketing_contacts() et le trigger profiles.
-- ------------------------------------------------------------
-- Retourne 'inserted' | 'updated' | 'skipped'.
-- Invariants :
--   - email toujours stocké en lower().
--   - marketing_opt_in / unsubscribed_at jamais modifiés : un opt-out
--     (contact ghost créé par mark_marketing_unsubscribed) reste opt-out,
--     on lui attache simplement user_id.
--   - user_id attaché uniquement s'il est libre (contact NULL et aucun
--     autre contact ne le porte — protège l'index unique sur user_id
--     quand un profil a changé d'email ET qu'un ghost existe au nouveau).
CREATE OR REPLACE FUNCTION upsert_marketing_contact(
    p_user_id    UUID,
    p_email      TEXT,
    p_first_name TEXT,
    p_last_name  TEXT,
    p_role       TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_email_lc TEXT := lower(trim(p_email));
    v_id       UUID;
BEGIN
    IF p_user_id IS NULL OR v_email_lc IS NULL OR v_email_lc = '' THEN
        RETURN 'skipped';
    END IF;
    IF p_role IS NULL OR p_role NOT IN ('client', 'pro') THEN
        RETURN 'skipped';
    END IF;

    -- a) Réconciliation par lower(email) — couvre contacts existants ET ghosts.
    SELECT mc.id INTO v_id
    FROM marketing_contacts mc
    WHERE lower(mc.email) = v_email_lc
    LIMIT 1;

    IF v_id IS NOT NULL THEN
        UPDATE marketing_contacts mc SET
            user_id = CASE
                WHEN mc.user_id IS NOT NULL THEN mc.user_id
                WHEN EXISTS (
                    SELECT 1 FROM marketing_contacts o
                    WHERE o.user_id = p_user_id AND o.id <> mc.id
                ) THEN mc.user_id
                ELSE p_user_id
            END,
            email         = v_email_lc,
            first_name    = COALESCE(p_first_name, mc.first_name),
            last_name     = COALESCE(p_last_name, mc.last_name),
            audience_type = p_role,
            updated_at    = NOW()
        WHERE mc.id = v_id;
        RETURN 'updated';
    END IF;

    -- b) Aucun contact avec cet email : le profil a peut-être changé
    --    d'email — retrouver son contact par user_id et le mettre à jour.
    UPDATE marketing_contacts mc SET
        email         = v_email_lc,
        first_name    = COALESCE(p_first_name, mc.first_name),
        last_name     = COALESCE(p_last_name, mc.last_name),
        audience_type = p_role,
        updated_at    = NOW()
    WHERE mc.user_id = p_user_id;
    IF FOUND THEN
        RETURN 'updated';
    END IF;

    -- c) Nouveau contact.
    INSERT INTO marketing_contacts
        (user_id, email, first_name, last_name, audience_type, source)
    VALUES
        (p_user_id, v_email_lc, p_first_name, p_last_name, p_role, 'profile_sync');
    RETURN 'inserted';
END;
$$;

REVOKE EXECUTE ON FUNCTION upsert_marketing_contact(UUID, TEXT, TEXT, TEXT, TEXT)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION upsert_marketing_contact(UUID, TEXT, TEXT, TEXT, TEXT)
    TO service_role;

-- ------------------------------------------------------------
-- 4. sync_marketing_contacts() — corrigée (réconciliation par email)
-- ------------------------------------------------------------
-- Appelée uniquement via service_role (route API admin
-- /api/admin/marketing/contacts?action=sync → createSupabaseAdminClient).
CREATE OR REPLACE FUNCTION sync_marketing_contacts()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    r          RECORD;
    v_result   TEXT;
    v_inserted INTEGER := 0;
    v_updated  INTEGER := 0;
BEGIN
    FOR r IN
        SELECT p.id AS user_id, p.email, p.first_name, p.last_name, p.role
        FROM profiles p
        WHERE p.email IS NOT NULL AND p.email <> ''
          AND p.role IN ('client', 'pro')
    LOOP
        v_result := upsert_marketing_contact(
            r.user_id, r.email, r.first_name, r.last_name, r.role
        );
        IF v_result = 'inserted' THEN
            v_inserted := v_inserted + 1;
        ELSIF v_result = 'updated' THEN
            v_updated := v_updated + 1;
        END IF;
    END LOOP;

    RETURN jsonb_build_object(
        'inserted', v_inserted,
        'updated',  v_updated,
        'total',    v_inserted + v_updated
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION sync_marketing_contacts()
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION sync_marketing_contacts() TO service_role;

-- ------------------------------------------------------------
-- 5. Alimentation automatique : trigger sur profiles
-- ------------------------------------------------------------
-- Un échec marketing ne doit jamais bloquer une inscription ou une
-- mise à jour de profil → exception avalée avec WARNING.
CREATE OR REPLACE FUNCTION marketing_contact_autofeed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NEW.email IS NULL OR NEW.email = ''
       OR NEW.role IS NULL OR NEW.role NOT IN ('client', 'pro') THEN
        RETURN NEW;
    END IF;

    IF TG_OP = 'UPDATE'
       AND NEW.email      IS NOT DISTINCT FROM OLD.email
       AND NEW.first_name IS NOT DISTINCT FROM OLD.first_name
       AND NEW.last_name  IS NOT DISTINCT FROM OLD.last_name
       AND NEW.role       IS NOT DISTINCT FROM OLD.role THEN
        RETURN NEW;
    END IF;

    BEGIN
        PERFORM upsert_marketing_contact(
            NEW.id, NEW.email, NEW.first_name, NEW.last_name, NEW.role
        );
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'marketing_contact_autofeed: échec pour profile % : %',
            NEW.id, SQLERRM;
    END;
    RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION marketing_contact_autofeed()
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION marketing_contact_autofeed() TO service_role;

DROP TRIGGER IF EXISTS trg_marketing_contact_autofeed ON profiles;
CREATE TRIGGER trg_marketing_contact_autofeed
    AFTER INSERT OR UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION marketing_contact_autofeed();

-- ------------------------------------------------------------
-- 6. mark_marketing_unsubscribed() — écrit lower(email)
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
-- 7. Backfill immédiat (idempotent, respecte les opt-out)
-- ------------------------------------------------------------
SELECT sync_marketing_contacts();

-- ============================================================
-- FIN — vérifier en dashboard Supabase :
--   SELECT sync_marketing_contacts();          -- 2e passage idempotent
--   SELECT email, user_id, marketing_opt_in, unsubscribed_at
--   FROM marketing_contacts ORDER BY updated_at DESC LIMIT 20;
-- ============================================================
