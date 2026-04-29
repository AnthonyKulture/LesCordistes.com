-- ============================================================
-- LesCordistes — Fix : cooldown_days basé sur profiles.created_at
--
-- Bug : resolve_playbook_recipients filtrait sur
--   marketing_contacts.created_at (= date du Sync contacts) au lieu
--   de la vraie date d'inscription du user (profiles.created_at).
-- Conséquence : juste après un Sync, tous les contacts avaient une
-- ancienneté de 0 jour → cooldown_days > 0 excluait tout le monde.
--
-- Correctif : LEFT JOIN profiles + COALESCE(p.created_at, mc.created_at)
-- pour garder un fallback propre sur les contacts non-users (manual_import).
-- ============================================================

CREATE OR REPLACE FUNCTION resolve_playbook_recipients(
    p_playbook_id UUID,
    p_max         INTEGER DEFAULT 200
)
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
    v_segment_id    UUID;
    v_cooldown_days INTEGER;
BEGIN
    SELECT pb.segment_id, pb.cooldown_days
    INTO v_segment_id, v_cooldown_days
    FROM marketing_playbooks pb
    WHERE pb.id = p_playbook_id;

    IF v_segment_id IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT s.contact_id, s.email, s.first_name, s.last_name, s.audience_type
    FROM resolve_segment_contacts(v_segment_id) AS s
    JOIN marketing_contacts mc ON mc.id = s.contact_id
    LEFT JOIN profiles p ON p.id = mc.user_id
    WHERE COALESCE(p.created_at, mc.created_at) <= NOW() - (v_cooldown_days || ' days')::INTERVAL
      AND NOT EXISTS (
          SELECT 1 FROM marketing_playbook_runs r
          WHERE r.playbook_id = p_playbook_id
            AND r.contact_id  = s.contact_id
      )
    LIMIT GREATEST(p_max, 1);
END;
$$;

REVOKE ALL ON FUNCTION resolve_playbook_recipients(UUID, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION resolve_playbook_recipients(UUID, INTEGER) TO service_role;
