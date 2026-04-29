-- ============================================================
-- LesCordistes — Marketing : segment "Comptes test"
-- À exécuter dans le SQL Editor APRÈS 20260429-marketing.sql
--
-- Ajoute un preset `test_recipients` qui filtre les contacts dont
-- `metadata->>'is_test_recipient' = 'true'`. Les flags sont posés
-- via /admin/marketing/contacts/test-recipients (UI) ou directement
-- en SQL :
--   UPDATE marketing_contacts
--   SET metadata = jsonb_set(metadata, '{is_test_recipient}', 'true'::jsonb)
--   WHERE lower(email) IN ('anthony@surly.fr', 'anthonyprofit.sydney@gmail.com');
-- ============================================================

-- 1) Étend resolve_segment_contacts avec le preset test_recipients.
CREATE OR REPLACE FUNCTION resolve_segment_contacts(p_segment_id UUID)
RETURNS TABLE (
    contact_id    UUID,
    email         TEXT,
    first_name    TEXT,
    last_name     TEXT,
    audience_type TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_filters JSONB;
    v_preset  TEXT;
BEGIN
    SELECT filters INTO v_filters FROM marketing_segments WHERE id = p_segment_id;
    IF v_filters IS NULL THEN
        RETURN;
    END IF;
    v_preset := v_filters->>'preset';

    IF v_preset = 'all_clients_opt_in' THEN
        RETURN QUERY
        SELECT mc.id, mc.email, mc.first_name, mc.last_name, mc.audience_type
        FROM marketing_contacts mc
        WHERE mc.audience_type = 'client'
          AND mc.marketing_opt_in = TRUE
          AND mc.unsubscribed_at IS NULL;

    ELSIF v_preset = 'all_pros_opt_in' THEN
        RETURN QUERY
        SELECT mc.id, mc.email, mc.first_name, mc.last_name, mc.audience_type
        FROM marketing_contacts mc
        WHERE mc.audience_type = 'pro'
          AND mc.marketing_opt_in = TRUE
          AND mc.unsubscribed_at IS NULL;

    ELSIF v_preset = 'pros_zero_unlocks' THEN
        RETURN QUERY
        SELECT mc.id, mc.email, mc.first_name, mc.last_name, mc.audience_type
        FROM marketing_contacts mc
        WHERE mc.audience_type = 'pro'
          AND mc.marketing_opt_in = TRUE
          AND mc.unsubscribed_at IS NULL
          AND mc.user_id IS NOT NULL
          AND NOT EXISTS (
              SELECT 1 FROM unlocked_leads ul WHERE ul.pro_id = mc.user_id
          );

    ELSIF v_preset = 'pros_profile_incomplete' THEN
        RETURN QUERY
        SELECT mc.id, mc.email, mc.first_name, mc.last_name, mc.audience_type
        FROM marketing_contacts mc
        JOIN profiles p ON p.id = mc.user_id
        WHERE mc.audience_type = 'pro'
          AND mc.marketing_opt_in = TRUE
          AND mc.unsubscribed_at IS NULL
          AND (
                COALESCE(p.bio, '') = ''
             OR p.intervention_zones IS NULL OR array_length(p.intervention_zones, 1) IS NULL
             OR p.certifications IS NULL OR array_length(p.certifications, 1) IS NULL
          );

    ELSIF v_preset = 'pros_verified_inactive' THEN
        RETURN QUERY
        SELECT mc.id, mc.email, mc.first_name, mc.last_name, mc.audience_type
        FROM marketing_contacts mc
        JOIN profiles p ON p.id = mc.user_id
        LEFT JOIN auth.users u ON u.id = p.id
        WHERE mc.audience_type = 'pro'
          AND mc.marketing_opt_in = TRUE
          AND mc.unsubscribed_at IS NULL
          AND p.verification_status = 'verified'
          AND (u.last_sign_in_at IS NULL OR u.last_sign_in_at < NOW() - INTERVAL '21 days');

    ELSIF v_preset = 'clients_inactive' THEN
        RETURN QUERY
        SELECT mc.id, mc.email, mc.first_name, mc.last_name, mc.audience_type
        FROM marketing_contacts mc
        JOIN profiles p ON p.id = mc.user_id
        LEFT JOIN auth.users u ON u.id = p.id
        WHERE mc.audience_type = 'client'
          AND mc.marketing_opt_in = TRUE
          AND mc.unsubscribed_at IS NULL
          AND (u.last_sign_in_at IS NULL OR u.last_sign_in_at < NOW() - INTERVAL '30 days')
          AND NOT EXISTS (
              SELECT 1 FROM jobs j
              WHERE j.created_by = mc.user_id AND j.status = 'live'
          );

    ELSIF v_preset = 'recent_contacts_30d' THEN
        RETURN QUERY
        SELECT mc.id, mc.email, mc.first_name, mc.last_name, mc.audience_type
        FROM marketing_contacts mc
        WHERE mc.marketing_opt_in = TRUE
          AND mc.unsubscribed_at IS NULL
          AND mc.created_at > NOW() - INTERVAL '30 days';

    ELSIF v_preset = 'test_recipients' THEN
        -- Contacts explicitement marqués test (metadata.is_test_recipient = true).
        -- Ce segment IGNORE les filtres opt-in/unsub : utilisé uniquement par
        -- l'admin pour valider un envoi de bout en bout.
        RETURN QUERY
        SELECT mc.id, mc.email, mc.first_name, mc.last_name, mc.audience_type
        FROM marketing_contacts mc
        WHERE mc.metadata->>'is_test_recipient' = 'true';

    ELSE
        RETURN;
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION resolve_segment_contacts(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION resolve_segment_contacts(UUID) TO service_role;

-- 2) Seed du segment "Comptes test" (idempotent).
INSERT INTO marketing_segments (name, description, audience_type, filters, is_system)
VALUES (
    'Comptes test',
    'Contacts marqués comme testeurs (metadata.is_test_recipient = true). Ignore opt-in/unsub. À utiliser uniquement pour valider campagnes/playbooks de bout en bout.',
    'mixed',
    jsonb_build_object('kind', 'preset', 'preset', 'test_recipients'),
    TRUE
)
ON CONFLICT DO NOTHING;
