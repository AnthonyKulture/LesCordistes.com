-- LesCordistes.com - Améliorations de la Messagerie
-- À exécuter dans l'éditeur SQL Supabase

-- 1. ACTIVER LE TEMPS RÉEL SUR LES TABLES DE MESSAGERIE
-- (Indispensable pour la mise à jour instantanée de l'interface)
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;


-- 2. TRIGGER POUR CREER UNE NOTIFICATION A CHAQUE NOUVEAU MESSAGE
-- Ce déclencheur se lance uniquement pour les messages où le sender_id est défini
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
    recipient_id UUID;
    conv RECORD;
    sender RECORD;
BEGIN
    -- Obtenir la conversation pour déterminer le destinataire
    SELECT * INTO conv FROM conversations WHERE id = NEW.conversation_id;
    
    IF conv.client_id = NEW.sender_id THEN
        recipient_id := conv.pro_id;
    ELSE
        recipient_id := conv.client_id;
    END IF;

    -- Obtenir le nom de l'expéditeur
    SELECT full_name, company_name INTO sender FROM profiles WHERE id = NEW.sender_id;

    -- Créer la notification interne pour l'autre utilisateur
    INSERT INTO notifications (user_id, type, title, message, link, read)
    VALUES (
        recipient_id,
        'new_message',
        'Nouveau message',
        COALESCE(sender.company_name, sender.full_name, 'Un utilisateur') || ' vous a envoyé un message.',
        '/messages?id=' || conv.id,
        false
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- S'assurer que le trigger n'existe pas déjà
DROP TRIGGER IF EXISTS on_new_message ON messages;

-- Attacher le trigger à la table messages après une insertion
CREATE TRIGGER on_new_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_message();
