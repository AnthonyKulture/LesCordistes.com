-- LesCordistes.com - Notification automatique lors du déblocage d'un lead
-- À exécuter dans l'éditeur SQL Supabase

-- 1. Fonction pour envoyer la notification
CREATE OR REPLACE FUNCTION trigger_notify_lead_unlock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_client_id UUID;
    v_job_title TEXT;
    v_pro_name TEXT;
BEGIN
    -- 1. Récupérer le client et le titre de la mission
    SELECT created_by, title INTO v_client_id, v_job_title
    FROM jobs
    WHERE id = NEW.job_id;

    -- 2. Récupérer le nom du pro
    SELECT full_name INTO v_pro_name
    FROM profiles
    WHERE id = NEW.pro_id;

    -- 3. Si on a un client, on notifie
    IF v_client_id IS NOT NULL THEN
        INSERT INTO notifications (user_id, type, title, message, link)
        VALUES (
            v_client_id,
            'lead_unlocked',
            '⚡ Nouveau professionnel intéressé !',
            (COALESCE(v_pro_name, 'Un professionnel') || ' a débloqué vos coordonnées pour votre mission « ' || v_job_title || ' ».'),
            '/dashboard/client'
        );
    END IF;

    RETURN NEW;
END;
$$;

-- 2. Trigger sur la table unlocked_leads
DROP TRIGGER IF EXISTS on_lead_unlocked ON unlocked_leads;
CREATE TRIGGER on_lead_unlocked
    AFTER INSERT ON unlocked_leads
    FOR EACH ROW
    EXECUTE FUNCTION trigger_notify_lead_unlock();

-- 3. Permissions (au cas où)
GRANT EXECUTE ON FUNCTION trigger_notify_lead_unlock() TO authenticated;
GRANT EXECUTE ON FUNCTION trigger_notify_lead_unlock() TO service_role;
