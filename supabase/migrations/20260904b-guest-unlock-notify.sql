-- ============================================================================
-- 20260904b — Déblocage de lead : notifier aussi les missions postées en invité
-- 2026-09-04
--
-- CONSTAT : `private.trigger_on_lead_unlocked_merged()` (migration 20260828e)
-- lit l'email du client dans `profiles` via `j.created_by`. Quand la mission a
-- été postée sans compte (`created_by IS NULL`), le LEFT JOIN ne ramène rien,
-- `v_client_email` reste NULL et AUCUN email ne part. Le client invité
-- n'apprend donc jamais qu'un professionnel a payé pour le contacter — au
-- moment précis où il devrait revenir sur le site.
--
-- CORRECTIF : repli sur `jobs.client_contact_info->>'email'`, exactement comme
-- le fait déjà `private.trigger_on_job_moderation()` (email « mission publiée /
-- refusée »). Aucune autre logique ne bouge.
--
-- CE QUI NE CHANGE PAS :
--   • Client AVEC compte : `profiles.email` reste prioritaire → même
--     destinataire, même sujet, même lien qu'avant. Aucun doublon possible :
--     l'email n'est envoyé QU'UNE fois, la source de l'adresse est choisie
--     avant l'envoi (repli, pas envoi supplémentaire).
--   • Notification en base (`notifications`) : toujours conditionnée à
--     `created_by IS NOT NULL` — la table exige un `user_id`, un invité n'en a
--     pas. Dans le cas invité, seul l'email part.
--   • Email admin : inchangé, systématique.
--   • Un seul SELECT partagé (le verrou FOR UPDATE sur `credits` pris par
--     `unlock_lead()` reste aussi court qu'avec 20260828e).
--
-- SEULE DIFFÉRENCE ASSUMÉE : le lien du CTA. `/dashboard/client` est un
-- cul-de-sac pour un invité (pas de compte, redirection connexion) → on
-- l'envoie sur la page publique de sa mission.
--
-- Idempotent et rejouable.
--
-- ⚠ Si `20260828e-triggers-stripe.sql` est re-joué un jour, il restaure
--   l'ancien corps (sans repli invité) → re-jouer CE FICHIER ensuite.
-- ============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION private.trigger_on_lead_unlocked_merged()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
-- SECURITY DEFINER sans search_path figé = la fonction résout ses tables dans le
-- search_path de l'appelant. Même règle que 20260904a.
SET search_path = public, pg_temp
AS $$
DECLARE
    v_job_title    TEXT;
    v_job_slug     TEXT;
    v_client_id    UUID;
    v_client_email TEXT;
    v_guest_email  TEXT;
    v_pro_name     TEXT;
    v_client_link  TEXT;
    v_link_text    TEXT;
BEGIN
    -- UN seul aller-retour pour les 3 entités (mission, client, pro).
    -- NULLIF(trim(...), '') : `client_contact_info` est saisi par le wizard,
    -- une chaîne vide y est possible — elle ne doit pas devenir un destinataire.
    SELECT j.title,
           j.slug,
           j.created_by,
           cli.email,
           NULLIF(btrim(j.client_contact_info->>'email'), '')
      INTO v_job_title, v_job_slug, v_client_id, v_client_email, v_guest_email
    FROM jobs j
    LEFT JOIN profiles cli ON cli.id = j.created_by
    WHERE j.id = NEW.job_id;

    SELECT full_name INTO v_pro_name FROM profiles WHERE id = NEW.pro_id;

    -- Garde-fou concaténation : `jobs.title` est NOT NULL, donc v_job_title
    -- n'est NULL que si la mission a disparu (impossible, FK) — on évite
    -- quand même un sujet d'email NULL.
    v_job_title := COALESCE(v_job_title, '(mission ' || NEW.job_id::TEXT || ')');

    -- Repli invité : la mission a été postée sans compte, l'adresse ne vit que
    -- dans client_contact_info. Même préséance que trigger_on_job_moderation().
    IF v_client_email IS NULL THEN
        v_client_email := v_guest_email;
    END IF;

    -- Filtre minimal : un « @ » entouré de caractères. Évite d'appeler
    -- l'Edge Function pour un champ libre mal rempli.
    IF v_client_email IS NOT NULL AND v_client_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN
        v_client_email := NULL;
    END IF;

    -- Destination du CTA : espace client pour un compte, page publique de la
    -- mission pour un invité (qui n'a pas de tableau de bord).
    IF v_client_id IS NOT NULL THEN
        v_client_link := 'https://www.lescordistes.com/dashboard/client';
        v_link_text   := 'Gérer mes contacts';
    ELSIF v_job_slug IS NOT NULL THEN
        v_client_link := 'https://www.lescordistes.com/jobs/' || v_job_slug;
        v_link_text   := 'Voir ma mission';
    ELSE
        v_client_link := 'https://www.lescordistes.com';
        v_link_text   := 'Ouvrir LesCordistes.com';
    END IF;

    -- 1. Notification en base — nécessite un user_id, donc un compte.
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

    -- 2. Email au client — compte OU invité, un seul envoi.
    IF v_client_email IS NOT NULL THEN
        PERFORM private.invoke_send_email(
            v_client_email,
            '⚡ Un professionnel est intéressé !',
            'admin-alert',
            jsonb_build_object(
                'title', 'Nouveau contact sur votre mission',
                'message', (COALESCE(v_pro_name, 'Un professionnel') || ' a débloqué vos coordonnées pour votre mission « ' || v_job_title || ' ». Il devrait vous contacter prochainement.'),
                'link', v_client_link,
                'linkText', v_link_text
            )
        );
    END IF;

    -- 3. Email à l'admin — inchangé.
    PERFORM private.invoke_send_email(
        'anthony@lescordistes.com',
        '💰 Lead Débloqué : ' || v_job_title,
        'admin-alert',
        jsonb_build_object(
            'title', 'Nouveau lead débloqué',
            'message', 'Le pro ' || COALESCE(v_pro_name, 'ID:' || NEW.pro_id) || ' a débloqué la mission « ' || v_job_title || ' ».',
            'link', 'https://lescordistes.com/admin/transactions',
            'linkText', 'Voir l''historique'
        )
    );

    RETURN NEW;
END;
$$;

-- Le trigger est recréé à l'identique (DROP + CREATE = idempotent ; PostgreSQL
-- n'a pas de CREATE OR REPLACE TRIGGER avant la v14 et Supabase ne garantit pas
-- la version). Même nom qu'en 20260828e : aucun doublon de trigger possible.
DROP TRIGGER IF EXISTS on_lead_unlocked ON public.unlocked_leads;
CREATE TRIGGER on_lead_unlocked
    AFTER INSERT ON public.unlocked_leads
    FOR EACH ROW
    EXECUTE FUNCTION private.trigger_on_lead_unlocked_merged();

COMMENT ON FUNCTION private.trigger_on_lead_unlocked_merged() IS
'Fusion notification + emails sur déblocage de lead (20260828e), étendue par '
'la migration 20260904b : repli sur client_contact_info->>''email'' quand '
'jobs.created_by est NULL (mission postée en invité). La notification en base '
'reste conditionnée à l''existence d''un compte. Re-jouer 20260828e '
'supprimerait le repli invité — re-jouer 20260904b ensuite.';

COMMIT;

-- ============================================================================
-- VÉRIFICATION (après COMMIT)
-- ============================================================================
-- 1) Le corps actif contient bien le repli invité, et un seul trigger reste
--    attaché à unlocked_leads :
--
--   SELECT p.prosrc ~ 'client_contact_info' AS repli_invite_present
--   FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
--   WHERE n.nspname = 'private' AND p.proname = 'trigger_on_lead_unlocked_merged';
--   -- attendu : true
--
--   SELECT t.tgname, n.nspname || '.' || p.proname AS fn
--   FROM pg_trigger t
--   JOIN pg_class c ON c.oid = t.tgrelid
--   JOIN pg_proc p ON p.oid = t.tgfoid
--   JOIN pg_namespace n ON n.oid = p.pronamespace
--   WHERE NOT t.tgisinternal AND c.relname = 'unlocked_leads';
--   -- attendu : UNE ligne → on_lead_unlocked → private.trigger_on_lead_unlocked_merged
--
-- 2) Combien de missions invitées sont concernées (déblocages passés, muets) :
--
--   SELECT COUNT(*) AS deblocages_invite_non_notifies
--   FROM unlocked_leads ul
--   JOIN jobs j ON j.id = ul.job_id
--   WHERE j.created_by IS NULL
--     AND NULLIF(btrim(j.client_contact_info->>'email'), '') IS NOT NULL;
--   -- ces envois-là sont perdus : le trigger ne vaut que pour l'avenir.
--
-- 3) Test réel (à faire une fois) : débloquer en compte pro une mission
--    invitée de test, vérifier qu'UN SEUL email « Un professionnel est
--    intéressé ! » arrive à l'adresse de client_contact_info, et que l'email
--    admin arrive comme avant. Puis contrôler la file pg_net :
--
--   SELECT id, url, (body::jsonb)->>'to' AS destinataire, created
--   FROM net.http_request_queue ORDER BY id DESC LIMIT 10;
-- ============================================================================
