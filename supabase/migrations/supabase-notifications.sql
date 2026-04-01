-- ============================================================
-- LesCordistes — Notifications automatiques de modération
-- À exécuter dans l'éditeur SQL Supabase
-- ============================================================

-- Fonction RPC pour notifier le client après modération de sa mission
CREATE OR REPLACE FUNCTION notify_moderation(
    p_job_id UUID,
    p_new_status TEXT,
    p_rejection_reason TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_client_id UUID;
    v_job_title TEXT;
    v_notif_type TEXT;
    v_notif_title TEXT;
    v_notif_message TEXT;
BEGIN
    -- Récupérer le client et le titre de la mission
    SELECT created_by, title INTO v_client_id, v_job_title
    FROM jobs
    WHERE id = p_job_id;

    -- Si pas de client associé (mission anonyme), on sort
    IF v_client_id IS NULL THEN
        RETURN;
    END IF;

    -- Construire la notification selon le statut
    IF p_new_status = 'live' THEN
        v_notif_type    := 'job_approved';
        v_notif_title   := '✅ Mission publiée !';
        v_notif_message := 'Votre mission « ' || v_job_title || ' » a été approuvée et est maintenant visible par les professionnels.';
    ELSIF p_new_status = 'rejected' THEN
        v_notif_type    := 'job_rejected';
        v_notif_title   := '❌ Mission refusée';
        v_notif_message := 'Votre mission « ' || v_job_title || ' » n''a pas été approuvée.'
            || CASE WHEN p_rejection_reason IS NOT NULL
               THEN ' Motif : ' || p_rejection_reason
               ELSE '' END;
    ELSE
        RETURN;
    END IF;

    -- Insérer la notification
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
        v_client_id,
        v_notif_type,
        v_notif_title,
        v_notif_message,
        '/dashboard/client'
    );
END;
$$;

GRANT EXECUTE ON FUNCTION notify_moderation(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION notify_moderation(UUID, TEXT, TEXT) TO service_role;


-- ============================================================
-- Trigger automatique : notification lors du changement
-- de statut d'une mission (alternative aux appels manuels)
-- ============================================================

CREATE OR REPLACE FUNCTION trigger_notify_job_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Déclencher uniquement si le statut a changé
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        IF NEW.status IN ('live', 'rejected') THEN
            PERFORM notify_moderation(NEW.id, NEW.status, NEW.rejection_reason);
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_job_status_change ON jobs;
CREATE TRIGGER on_job_status_change
    AFTER UPDATE OF status ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION trigger_notify_job_status_change();
