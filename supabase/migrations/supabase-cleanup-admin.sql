-- ============================================================
-- Script de nettoyage complet pour admin@lescordistes.com
-- À exécuter dans l'éditeur SQL de Supabase
-- ============================================================

DO $$ 
DECLARE 
    v_user_id UUID;
    v_email TEXT := 'admin@lescordistes.com';
BEGIN
    -- 1. Récupérer l'ID de l'utilisateur dans la table interne de Supabase
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

    IF v_user_id IS NULL THEN
        RAISE NOTICE 'Utilisateur % non trouvé dans auth.users. Il est peut-être déjà supprimé de la table d''authentification.', v_email;
    ELSE
        -- 2. Suppression manuelle des dépendances pour éviter les erreurs de clés étrangères
        -- (Même si certaines ont ON DELETE CASCADE, on assure le coup)
        
        DELETE FROM messages WHERE sender_id = v_user_id;
        DELETE FROM conversations WHERE client_id = v_user_id OR pro_id = v_user_id;
        DELETE FROM notifications WHERE user_id = v_user_id;
        DELETE FROM reviews WHERE pro_id = v_user_id OR client_id = v_user_id;
        DELETE FROM unlocked_leads WHERE pro_id = v_user_id;
        DELETE FROM credit_transactions WHERE pro_id = v_user_id;
        DELETE FROM credits WHERE pro_id = v_user_id;
        
        -- Suppression des missions créées ou modérées par cet utilisateur
        DELETE FROM jobs WHERE created_by = v_user_id OR moderated_by = v_user_id;
        
        -- Suppression du profil
        DELETE FROM profiles WHERE id = v_user_id;

        -- 3. Suppression finale de l'utilisateur dans le système d'authentification
        -- C'est cette étape qui libère l'adresse email pour une nouvelle inscription
        DELETE FROM auth.users WHERE id = v_user_id;

        RAISE NOTICE 'Nettoyage complet effectué pour %. Vous pouvez maintenant recréer le compte.', v_email;
    END IF;
END $$;
