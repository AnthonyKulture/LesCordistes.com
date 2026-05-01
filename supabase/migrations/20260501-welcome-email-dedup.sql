-- LesCordistes — Anti-doublon welcome email
-- 2026-05-01
--
-- Problème : un pro qui s'inscrit reçoit jusqu'à 3× le welcome email.
--
-- Causes :
--   A. Code client (RegisterPro / RoleSelectionModal / choisir-role) qui appelait
--      `functions.invoke('send-email', { templateId: 'welcome-pro' })` après
--      le signUp. → Déjà retiré dans le commit 29cb9cb.
--   B. Le trigger INSERT (private.trigger_on_new_profile) envoie le welcome
--      lorsque full_name est renseigné dès l'INSERT (cas email+password).
--   C. Le trigger UPDATE (private.trigger_on_profile_welcome) fire ENSUITE
--      quand Supabase Auth met à jour le profil post-confirmation, et
--      renvoie un welcome avec un subject incohérent ('Bienvenue!' au lieu
--      de 'Votre profil pro est actif').
--
-- Fix : flag profiles.welcome_email_sent_at qui prouve qu'un welcome a déjà
-- été envoyé. Les 2 triggers le checkent AVANT d'envoyer et le settent APRÈS.
--
-- Bonus : le trigger UPDATE utilisait des subjects différents — on aligne sur
-- ceux du trigger INSERT pour une expérience cohérente (un seul wording par
-- rôle, peu importe le flow d'inscription).
--
-- À exécuter MANUELLEMENT dans Supabase SQL Editor.

-- 1. Colonne flag --------------------------------------------------------
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS welcome_email_sent_at TIMESTAMPTZ;

-- 2. Backfill — les profils existants ne doivent PAS recevoir un welcome
-- rétroactif lors d'un futur UPDATE de leur full_name.
UPDATE public.profiles
SET welcome_email_sent_at = COALESCE(updated_at, created_at, NOW())
WHERE welcome_email_sent_at IS NULL;

-- 3. Trigger INSERT — anti-doublon ---------------------------------------
CREATE OR REPLACE FUNCTION private.trigger_on_new_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    -- Alerte Admin (toujours envoyée, distincte du welcome user)
    PERFORM private.invoke_send_email(
        'anthony@lescordistes.com',
        'Nouveau Profil : ' || NEW.role,
        'admin-alert',
        jsonb_build_object(
            'title', 'Nouvelle inscription ' || NEW.role,
            'message', 'Un nouvel utilisateur s''est inscrit : ' || NEW.email || ' (' || COALESCE(NEW.full_name, 'Sans nom') || ')',
            'link', 'https://lescordistes.com/admin/users',
            'linkText', 'Gérer les utilisateurs'
        )
    );

    -- Welcome user — uniquement si :
    --   • full_name est déjà renseigné (cas email+password), ET
    --   • pas déjà envoyé (welcome_email_sent_at IS NULL)
    IF NEW.full_name IS NOT NULL
       AND NEW.full_name != ''
       AND NEW.welcome_email_sent_at IS NULL THEN

        IF NEW.role = 'client' THEN
            PERFORM private.invoke_send_email(
                NEW.email,
                'Bienvenue sur LesCordistes.com !',
                'welcome-client',
                jsonb_build_object('name', split_part(NEW.full_name, ' ', 1))
            );
        ELSIF NEW.role = 'pro' THEN
            PERFORM private.invoke_send_email(
                NEW.email,
                'Votre profil pro est actif — LesCordistes.com',
                'welcome-pro',
                jsonb_build_object('name', split_part(NEW.full_name, ' ', 1))
            );
        END IF;

        -- Marquer comme envoyé pour empêcher le trigger UPDATE de re-envoyer
        -- (cas Supabase Auth qui touche au profil post-confirmation).
        UPDATE public.profiles
        SET welcome_email_sent_at = NOW()
        WHERE id = NEW.id;
    END IF;

    RETURN NEW;
END;
$function$;

-- 4. Trigger UPDATE — anti-doublon + alignement subjects -----------------
CREATE OR REPLACE FUNCTION private.trigger_on_profile_welcome()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    -- Ne fire que si :
    --   1. full_name passe de NULL/'' → renseigné (cas Google OAuth + flow OAuth + RoleSelectionModal)
    --   2. ET aucun welcome déjà envoyé (OLD.welcome_email_sent_at IS NULL)
    IF (OLD.full_name IS NULL OR OLD.full_name = '')
       AND NEW.full_name IS NOT NULL
       AND NEW.full_name != ''
       AND OLD.welcome_email_sent_at IS NULL
       AND NEW.welcome_email_sent_at IS NULL THEN

        IF NEW.role = 'client' THEN
            PERFORM private.invoke_send_email(
                NEW.email,
                'Bienvenue sur LesCordistes.com !',
                'welcome-client',
                jsonb_build_object('name', split_part(NEW.full_name, ' ', 1))
            );
        ELSIF NEW.role = 'pro' THEN
            -- Subject identique au trigger INSERT (avant : 'Bienvenue!' incohérent)
            PERFORM private.invoke_send_email(
                NEW.email,
                'Votre profil pro est actif — LesCordistes.com',
                'welcome-pro',
                jsonb_build_object('name', split_part(NEW.full_name, ' ', 1))
            );
        END IF;

        UPDATE public.profiles
        SET welcome_email_sent_at = NOW()
        WHERE id = NEW.id;
    END IF;

    RETURN NEW;
END;
$function$;

-- 5. Vérification --------------------------------------------------------
SELECT
    n.nspname AS schema,
    p.proname AS function_name,
    p.prosrc ~ 'welcome_email_sent_at' AS has_dedup_check
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'private'
  AND p.proname IN ('trigger_on_new_profile', 'trigger_on_profile_welcome');

-- Doit retourner has_dedup_check = TRUE pour les 2 fonctions.
