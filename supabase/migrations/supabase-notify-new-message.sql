-- ============================================================
-- LesCordistes — Email notification pour nouveaux messages
-- Déclenche un email via la Edge Function send-email
-- quand un message est envoyé et que le destinataire
-- ne l'a pas lu dans les 2 dernières minutes (pas actif)
-- ============================================================

-- Nécessite l'extension pg_net (activée par défaut sur Supabase)
-- et la variable SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY

CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_conversation_id   UUID;
    v_sender_name       TEXT;
    v_recipient_id      UUID;
    v_recipient_email   TEXT;
    v_recipient_name    TEXT;
    v_job_title         TEXT;
    v_last_read         TIMESTAMPTZ;
    v_message_preview   TEXT;
    v_conversation_url  TEXT;
    v_supabase_url      TEXT;
    v_service_key       TEXT;
BEGIN
    v_supabase_url := current_setting('app.supabase_url', true);
    v_service_key  := current_setting('app.service_role_key', true);

    -- Utiliser les variables d'env Supabase si les settings locaux sont vides
    IF v_supabase_url IS NULL OR v_supabase_url = '' THEN
        v_supabase_url := 'https://pnvmlwjaxibguvijkdoc.supabase.co';
    END IF;

    v_conversation_id := NEW.conversation_id;

    -- Nom de l'expéditeur
    SELECT COALESCE(full_name, email) INTO v_sender_name
    FROM profiles WHERE id = NEW.sender_id;

    -- Trouver le destinataire (l'autre participant de la conversation)
    SELECT p.id, p.email, COALESCE(p.full_name, p.email)
    INTO v_recipient_id, v_recipient_email, v_recipient_name
    FROM conversation_participants cp
    JOIN profiles p ON p.id = cp.user_id
    WHERE cp.conversation_id = v_conversation_id
      AND cp.user_id != NEW.sender_id
    LIMIT 1;

    -- Si pas de destinataire trouvé, ne rien faire
    IF v_recipient_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Vérifier quand le destinataire a lu la conversation pour la dernière fois
    SELECT last_read_at INTO v_last_read
    FROM conversation_participants
    WHERE conversation_id = v_conversation_id
      AND user_id = v_recipient_id;

    -- Ne pas envoyer si le destinataire a lu la conversation dans les 2 dernières minutes
    -- (il est probablement en train de lire)
    IF v_last_read IS NOT NULL AND v_last_read > NOW() - INTERVAL '2 minutes' THEN
        RETURN NEW;
    END IF;

    -- Titre de la mission liée (si applicable)
    SELECT j.title INTO v_job_title
    FROM conversations c
    LEFT JOIN jobs j ON j.id = c.job_id
    WHERE c.id = v_conversation_id;

    -- Prévisualisation du message (tronqué à 150 chars)
    v_message_preview := LEFT(NEW.content, 150);
    IF LENGTH(NEW.content) > 150 THEN
        v_message_preview := v_message_preview || '…';
    END IF;

    v_conversation_url := 'https://lescordistes.com/messages?id=' || v_conversation_id::TEXT;

    -- Appel de la Edge Function via pg_net
    PERFORM net.http_post(
        url := v_supabase_url || '/functions/v1/send-email',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || v_service_key
        ),
        body := jsonb_build_object(
            'to', v_recipient_email,
            'subject', 'Nouveau message de ' || v_sender_name || ' — LesCordistes',
            'templateId', 'new-message',
            'data', jsonb_build_object(
                'recipientName', v_recipient_name,
                'senderName', v_sender_name,
                'messagePreview', v_message_preview,
                'conversationUrl', v_conversation_url,
                'jobTitle', v_job_title
            )
        )::TEXT
    );

    RETURN NEW;
END;
$$;

-- Créer le trigger sur la table messages
DROP TRIGGER IF EXISTS on_new_message_notify ON messages;
CREATE TRIGGER on_new_message_notify
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_message();
