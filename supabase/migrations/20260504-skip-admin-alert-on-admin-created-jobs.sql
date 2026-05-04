-- LesCordistes — Skip "⚖️ Modération requise" admin alert when the mission
-- is created by the admin himself (admin_created = true).
-- 2026-05-04
--
-- Contexte : private.trigger_on_new_job() (défini dans supabase-email-triggers.sql)
-- envoie un email à anthony@lescordistes.com pour CHAQUE nouvelle mission.
-- Quand l'admin crée la mission depuis /admin/jobs/new (suite à un appel/mail
-- client confirmé, status='live' direct), recevoir cet email est inutile :
-- l'admin sait déjà que la mission existe, et il l'a déjà publiée.
--
-- Fix : early-return si NEW.admin_created = true.
--
-- À exécuter MANUELLEMENT dans Supabase SQL Editor.

CREATE OR REPLACE FUNCTION private.trigger_on_new_job()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Skip si la mission est créée par l'admin lui-même (suite à un appel/mail
    -- client confirmé) → l'admin sait déjà qu'elle existe, pas besoin d'email.
    IF NEW.admin_created = true THEN
        RETURN NEW;
    END IF;

    -- 1. Email Admin pour modération
    PERFORM private.invoke_send_email(
        'anthony@lescordistes.com',
        '⚖️ Modération requise : ' || NEW.title,
        'admin-alert',
        jsonb_build_object(
            'title', 'Nouvelle mission postée',
            'message', 'La mission « ' || NEW.title || ' » à ' || NEW.location_city || ' attend votre validation.',
            'link', 'https://lescordistes.com/admin/jobs',
            'linkText', 'Accéder à la modération'
        )
    );
    RETURN NEW;
END;
$$;

-- Vérification : la fonction contient bien le early-return
SELECT
    p.proname,
    p.prosrc ~ 'admin_created = true' AS has_admin_skip
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'private' AND p.proname = 'trigger_on_new_job';
-- Doit retourner has_admin_skip = TRUE.
