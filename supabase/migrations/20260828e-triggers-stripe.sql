-- ============================================================================
-- ÉTAPE E — Nettoyage des TRIGGERS + idempotence Stripe
-- 2026-08-28
--
-- Ce fichier corrige quatre problèmes indépendants, tous idempotents et
-- non-cassants. Il ne modifie AUCUN fichier .sql existant : il vient
-- APRÈS eux dans l'ordre chronologique et écrase l'état cumulé.
--
--   (1) notify_new_message() : deux définitions incompatibles se sont
--       écrasées mutuellement + deux triggers distincts sur `messages`.
--   (2) unlocked_leads : deux triggers AFTER INSERT sérialisés sous le
--       verrou FOR UPDATE de `credits` → fusion en un seul.
--   (3) private.trigger_on_new_profile() : UPDATE réflexif sur `profiles`
--       dans la transaction du signup → déplacé en BEFORE INSERT.
--   (4) credit_transactions : idempotence Stripe par seq scan sur
--       `description` → colonne dédiée + index UNIQUE partiel.
--
-- ⚠ ORDRE DE DÉPLOIEMENT pour la partie (4) : lancer CE FICHIER D'ABORD,
--   puis déployer le patch de src/app/api/webhook/route.ts. Le patch
--   proposé tolère les deux états (colonne absente ou présente), mais
--   migrer d'abord évite tout aller-retour d'erreur PostgREST.
--
-- ⚠ RE-RUN DES ANCIENS FICHIERS : `supabase-email-triggers.sql`,
--   `supabase-notify-lead-unlock.sql`, `supabase-notify-new-message.sql`
--   et `20260501-welcome-email-dedup.sql` contiennent tous des
--   CREATE OR REPLACE / CREATE TRIGGER qui ré-introduisent les problèmes
--   corrigés ici. Si l'un d'eux est re-joué un jour → re-jouer CE FICHIER
--   ensuite. Les requêtes de vérification en fin de fichier le détectent.
-- ============================================================================


-- ============================================================================
-- DIAGNOSTIC — À LANCER AVANT (l'état live est inconnu)
-- Ces requêtes sont en lecture seule. Les lancer d'abord, garder le résultat.
-- ============================================================================
--
-- D1. Quels triggers existent réellement sur les tables concernées, et quelle
--     fonction appellent-ils ? (pg_trigger.tgisinternal exclut les contraintes)
--
--   SELECT c.relname            AS table_name,
--          t.tgname             AS trigger_name,
--          n.nspname || '.' || p.proname AS function_name,
--          CASE t.tgenabled WHEN 'O' THEN 'enabled' ELSE t.tgenabled::text END AS state,
--          pg_get_triggerdef(t.oid) AS definition
--   FROM pg_trigger t
--   JOIN pg_class     c ON c.oid = t.tgrelid
--   JOIN pg_proc      p ON p.oid = t.tgfoid
--   JOIN pg_namespace n ON n.oid = p.pronamespace
--   WHERE NOT t.tgisinternal
--     AND c.relname IN ('messages', 'unlocked_leads', 'profiles')
--   ORDER BY c.relname, t.tgname;
--
--   Attendu AVANT migration (le pire cas) :
--     messages        → on_new_message          + on_new_message_notify   (2 triggers, MÊME fonction)
--     unlocked_leads  → on_lead_unlocked        + on_lead_unlocked_email  (2 triggers)
--     profiles        → on_new_profile_created  + on_profile_welcome + on_profile_verified
--                       + update_profiles_updated_at
--
-- D2. Quel CORPS de notify_new_message() est réellement actif ?
--     C'est LA question : les deux fichiers déclarent la même signature
--     `notify_new_message()`, donc il n'existe qu'UN seul objet pg_proc et
--     c'est le dernier CREATE OR REPLACE joué qui a gagné.
--
--   SELECT p.oid::regprocedure                        AS fonction,
--          p.prosrc ~ 'conversation_participants'     AS corps_casse,
--          p.prosrc ~ 'conv\.client_id'               AS corps_sain,
--          p.prosrc ~ 'pnvmlwjaxibguvijkdoc'          AS url_autre_projet
--   FROM pg_proc p
--   JOIN pg_namespace n ON n.oid = p.pronamespace
--   WHERE n.nspname = 'public' AND p.proname = 'notify_new_message';
--
--   Si corps_casse = TRUE → la messagerie est CASSÉE en production :
--   `conversation_participants` n'existe dans aucun fichier de schéma, donc
--   chaque INSERT dans `messages` lève « relation ... does not exist » et la
--   transaction du message est annulée. Ce fichier répare.
--   Si corps_sain = TRUE → seul le trigger parasite est à supprimer.
--
-- D3. La table fantôme existe-t-elle (ne devrait retourner AUCUNE ligne) ?
--
--   SELECT to_regclass('public.conversation_participants') AS doit_etre_null;
--
-- D4. Doublons Stripe déjà en base (bloquerait l'index UNIQUE de l'étape 4) :
--
--   SELECT description, COUNT(*) AS n, array_agg(id) AS ids
--   FROM public.credit_transactions
--   WHERE description LIKE 'Achat Stripe - Session %'
--   GROUP BY description
--   HAVING COUNT(*) > 1;
--
--   Si cette requête renvoie des lignes → des crédits ont été accordés deux
--   fois pour une même session. Les traiter (remboursement / suppression du
--   doublon) AVANT de lancer ce fichier, sinon l'étape 4 échoue avec un
--   message explicite (c'est voulu : on ne masque pas un double débit).
--
-- D5. Plan actuel de la déduplication Stripe (pour mesurer le gain) :
--
--   EXPLAIN (ANALYZE, BUFFERS)
--   SELECT id FROM public.credit_transactions
--   WHERE description = 'Achat Stripe - Session cs_test_inexistant';
--
--   Attendu AVANT : Seq Scan on credit_transactions.
--   Attendu APRÈS (avec le patch TS) : Index Scan / Index Only Scan.
-- ============================================================================


BEGIN;

-- Filet : le schéma `private` est créé par supabase-email-triggers.sql. On le
-- rend explicite pour que ce fichier soit rejouable sur une base fraîche.
CREATE SCHEMA IF NOT EXISTS private;

-- ============================================================================
-- (1) notify_new_message() — conflit de définitions + trigger parasite
-- ============================================================================
-- POURQUOI : en PostgreSQL une fonction est identifiée par (schéma, nom,
-- signature). `supabase-messaging-improvements.sql` et
-- `supabase-notify-new-message.sql` déclarent tous les deux
-- `public.notify_new_message()` sans argument : il n'existe donc qu'UN seul
-- objet en base, et le dernier CREATE OR REPLACE joué a silencieusement
-- écrasé le corps de l'autre. Les deux triggers (`on_new_message` et
-- `on_new_message_notify`) pointent vers ce même objet unique : ils
-- exécutent donc DEUX FOIS le même code à chaque INSERT dans `messages`.
--
-- Le corps de `supabase-notify-new-message.sql` est structurellement
-- invalide sur ce projet :
--   • il lit `conversation_participants`, table qui n'existe dans aucun
--     fichier de schéma (le modèle réel est `conversations.client_id` /
--     `conversations.pro_id`, cf. supabase-migrations-mvp.sql PHASE 10) ;
--   • il appelle une Edge Function sur `pnvmlwjaxibguvijkdoc.supabase.co`,
--     qui n'est PAS le projet de LesCordistes (`esvnvxkbnhvxpnlhyjsw`) ;
--   • il demande le template `new-message`, absent du switch de
--     `supabase/functions/send-email/index.ts` (il lèverait
--     « Template not found »).
-- Aucune fonctionnalité n'est donc perdue en le supprimant : il n'a jamais
-- pu envoyer un seul email.
--
-- Le survivant est la version `conversations.client_id / pro_id` qui insère
-- une notification interne — cohérente avec le schéma et consommée par
-- l'UI (table `notifications`).

DROP TRIGGER IF EXISTS on_new_message_notify ON public.messages;

-- CREATE OR REPLACE, pas ALTER : garantit que le corps ACTIF est le bon,
-- quel que soit l'ordre dans lequel les anciens fichiers ont été joués.
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    recipient_id UUID;
    conv         RECORD;
    sender       RECORD;
BEGIN
    -- Destinataire = l'autre participant de la conversation
    SELECT * INTO conv FROM conversations WHERE id = NEW.conversation_id;

    IF conv.client_id = NEW.sender_id THEN
        recipient_id := conv.pro_id;
    ELSE
        recipient_id := conv.client_id;
    END IF;

    -- Nom de l'expéditeur
    SELECT full_name, company_name INTO sender FROM profiles WHERE id = NEW.sender_id;

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
$$;

-- Le trigger canonique est recréé à l'identique (DROP + CREATE = idempotent ;
-- PostgreSQL n'a pas de CREATE OR REPLACE TRIGGER avant la v14 et Supabase
-- ne garantit pas la version).
DROP TRIGGER IF EXISTS on_new_message ON public.messages;
CREATE TRIGGER on_new_message
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_new_message();

COMMENT ON FUNCTION public.notify_new_message() IS
'Notification interne sur nouveau message. Source unique : migration 20260828e. '
'NE PAS re-jouer supabase-notify-new-message.sql (corps basé sur une table '
'conversation_participants inexistante + URL d''un autre projet Supabase).';


-- ============================================================================
-- (2) unlocked_leads — fusion des deux triggers AFTER INSERT
-- ============================================================================
-- POURQUOI : `unlock_lead()` (cf. 20260427-unlock-lead-live-only.sql) fait un
-- `SELECT balance FROM credits WHERE pro_id = ... FOR UPDATE` puis, PLUS LOIN
-- dans la même transaction, l'INSERT dans `unlocked_leads`. En PostgreSQL un
-- verrou de ligne est conservé jusqu'au COMMIT : tout ce que les triggers
-- AFTER INSERT exécutent allonge mécaniquement la détention du verrou sur la
-- ligne `credits` du pro. Or ces deux triggers font 4 SELECT et 3 appels
-- `net.http_post` (pg_net). Résultat : les déblocages successifs d'un MÊME pro
-- sont sérialisés derrière ce verrou.
--
-- Fusion : un SEUL trigger, un SEUL SELECT (jobs LEFT JOIN profiles ×2) qui
-- alimente à la fois la notification en base et les deux emails.
--
-- Comportements strictement préservés :
--   • notification `lead_unlocked` insérée si la mission a un `created_by` ;
--   • email au client si ce client a un email ;
--   • email admin systématique.
-- Seule différence assumée : le LEFT JOIN remplace l'INNER JOIN de
-- `private.trigger_on_lead_unlocked()`. Avec l'INNER JOIN, une mission
-- invitée (`created_by IS NULL`) ne ramenait aucune ligne → `v_job_title`
-- restait NULL → le sujet de l'email admin devenait NULL par concaténation
-- (« Lead Débloqué : » || NULL = NULL). Le LEFT JOIN corrige ce cas ; aucun
-- email précédemment envoyé ne cesse de l'être.

DROP TRIGGER IF EXISTS on_lead_unlocked       ON public.unlocked_leads;
DROP TRIGGER IF EXISTS on_lead_unlocked_email ON public.unlocked_leads;

-- Nom neuf volontaire : un re-run de supabase-email-triggers.sql fera un
-- CREATE OR REPLACE sur `private.trigger_on_lead_unlocked()` (ancien corps) —
-- il ne touchera pas à la fonction fusionnée ci-dessous.
CREATE OR REPLACE FUNCTION private.trigger_on_lead_unlocked_merged()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_job_title    TEXT;
    v_client_id    UUID;
    v_client_email TEXT;
    v_pro_name     TEXT;
BEGIN
    -- UN seul aller-retour pour les 3 entités (mission, client, pro).
    SELECT j.title, j.created_by, cli.email, pro.full_name
      INTO v_job_title, v_client_id, v_client_email, v_pro_name
    FROM jobs j
    LEFT JOIN profiles cli ON cli.id = j.created_by
    LEFT JOIN profiles pro ON pro.id = NEW.pro_id
    WHERE j.id = NEW.job_id;

    -- Garde-fou concaténation : `jobs.title` est NOT NULL, donc v_job_title
    -- n'est NULL que si la mission a disparu (impossible, FK) — on évite
    -- quand même un sujet d'email NULL.
    v_job_title := COALESCE(v_job_title, '(mission ' || NEW.job_id::TEXT || ')');

    -- 1. Notification en base (ex-trigger `on_lead_unlocked`)
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

    -- 2. Email au client (ex-trigger `on_lead_unlocked_email`, partie 3)
    IF v_client_email IS NOT NULL THEN
        PERFORM private.invoke_send_email(
            v_client_email,
            '⚡ Un professionnel est intéressé !',
            'admin-alert',
            jsonb_build_object(
                'title', 'Nouveau contact sur votre mission',
                'message', (COALESCE(v_pro_name, 'Un professionnel') || ' a débloqué vos coordonnées pour votre mission « ' || v_job_title || ' ». Il devrait vous contacter prochainement.'),
                'link', 'https://lescordistes.com/dashboard/client',
                'linkText', 'Gérer mes contacts'
            )
        );
    END IF;

    -- 3. Email à l'admin (ex-trigger `on_lead_unlocked_email`, partie 4)
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

CREATE TRIGGER on_lead_unlocked
    AFTER INSERT ON public.unlocked_leads
    FOR EACH ROW
    EXECUTE FUNCTION private.trigger_on_lead_unlocked_merged();

COMMENT ON FUNCTION private.trigger_on_lead_unlocked_merged() IS
'Fusion de trigger_notify_lead_unlock() (notification) et de '
'private.trigger_on_lead_unlocked() (emails). Un seul SELECT partagé pour '
'raccourcir la détention du verrou FOR UPDATE sur credits dans unlock_lead(). '
'Migration 20260828e.';

-- L'ancienne fonction de notification n'est plus référencée par aucun trigger
-- (vérifié : aucune autre occurrence dans le repo). DROP ... IF EXISTS pour
-- rester idempotent même si elle a déjà été supprimée.
DROP FUNCTION IF EXISTS public.trigger_notify_lead_unlock();

-- `private.trigger_on_lead_unlocked()` est volontairement CONSERVÉE (elle est
-- recréée par supabase-email-triggers.sql à chaque re-run) : elle n'est plus
-- attachée à aucun trigger, donc inerte. On la marque DEPRECATED — le DO
-- protège le cas où supabase-email-triggers.sql n'aurait jamais été joué.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'private' AND p.proname = 'trigger_on_lead_unlocked'
    ) THEN
        EXECUTE $c$COMMENT ON FUNCTION private.trigger_on_lead_unlocked() IS 'DEPRECATED 2026-08-28 (migration 20260828e) - remplacee par private.trigger_on_lead_unlocked_merged(). Plus attachee a aucun trigger. Ne pas re-attacher : doublerait les emails.'$c$;
    END IF;
END $$;


-- ============================================================================
-- (3) private.trigger_on_new_profile() — suppression de l'UPDATE réflexif
-- ============================================================================
-- POURQUOI : le trigger AFTER INSERT sur `profiles` exécutait
-- `UPDATE public.profiles SET welcome_email_sent_at = NOW() WHERE id = NEW.id`
-- (cf. 20260501-welcome-email-dedup.sql). Dans PostgreSQL, un UPDATE crée une
-- NOUVELLE version de ligne (MVCC) — la version fraîchement insérée devient
-- immédiatement morte et devra être ramassée par autovacuum — et il déclenche
-- en cascade tous les triggers UPDATE de `profiles` :
--   • update_profiles_updated_at (BEFORE UPDATE, supabase-schema.sql)
--   • on_profile_welcome         (AFTER UPDATE,  supabase-email-triggers.sql)
--   • on_profile_verified        (BEFORE UPDATE OF verification_status —
--     ne fire pas ici, la colonne n'est pas dans le SET, mais il est évalué)
-- Le tout DANS la transaction du signup, qui contient déjà l'INSERT auth.users,
-- l'INSERT profiles et 2 appels pg_net.
--
-- CORRECTION : positionner le flag en BEFORE INSERT, où `NEW` est encore
-- modifiable en mémoire. Aucune écriture supplémentaire, aucune version morte,
-- aucun trigger UPDATE déclenché.
--
-- POURQUOI ÇA NE CASSE PAS LA DÉDUPLICATION :
--   • Flux email+password : handle_new_user() insère `full_name` non vide →
--     le BEFORE INSERT pose welcome_email_sent_at = NOW() → le AFTER INSERT
--     envoie le welcome (sa condition ne lit plus le flag, voir ci-dessous) →
--     plus tard, `on_profile_welcome` (AFTER UPDATE) voit
--     OLD.welcome_email_sent_at NON NULL → ne renvoie rien. Identique à avant.
--   • Flux Google OAuth : handle_new_user() insère `full_name = ''` → le
--     BEFORE INSERT ne pose RIEN (flag NULL) → le AFTER INSERT n'envoie pas de
--     welcome → RoleSelectionModal fait l'UPDATE full_name '' → 'X' →
--     `on_profile_welcome` fire avec OLD.welcome_email_sent_at IS NULL et
--     NEW.welcome_email_sent_at IS NULL → envoie le welcome. INCHANGÉ.
--
-- PORTÉE VOLONTAIREMENT MINIMALE : `private.trigger_on_profile_welcome()`
-- (chemin Google OAuth) fait le MÊME UPDATE réflexif et n'est PAS touché ici.
-- Le corriger demanderait de relâcher sa condition `NEW.welcome_email_sent_at
-- IS NULL`, seul garde-fou du chemin OAuth. Bloc prêt à l'emploi en fin de
-- fichier, commenté, à activer seulement après un test manuel du flux OAuth.

-- Filet de sécurité : la colonne existe déjà (20260501) — ADD IF NOT EXISTS
-- rend ce fichier rejouable même sur une base où 20260501 n'a pas été passée.
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS welcome_email_sent_at TIMESTAMPTZ;

-- 3.a — Le flag est désormais posé AVANT l'écriture de la ligne.
CREATE OR REPLACE FUNCTION private.set_welcome_flag_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Même condition que celle qui déclenche l'envoi dans le AFTER INSERT :
    -- le flag reflète exactement « un welcome part pour cette ligne ».
    IF NEW.welcome_email_sent_at IS NULL
       AND NEW.full_name IS NOT NULL
       AND NEW.full_name <> '' THEN
        NEW.welcome_email_sent_at := NOW();
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_new_profile_welcome_flag ON public.profiles;
CREATE TRIGGER on_new_profile_welcome_flag
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION private.set_welcome_flag_on_insert();

-- 3.b — Le AFTER INSERT ne fait plus d'écriture. Sa condition d'envoi ne peut
-- plus lire `NEW.welcome_email_sent_at` (qui vient d'être posé en BEFORE) :
-- elle repose sur `full_name`, ce qui était DÉJÀ le critère réel — au moment
-- de l'INSERT le flag valait toujours NULL, le test était donc vacant.
CREATE OR REPLACE FUNCTION private.trigger_on_new_profile()
RETURNS TRIGGER
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

    -- Welcome user — cas email+password (full_name renseigné dès l'INSERT).
    -- Le flag welcome_email_sent_at a été posé par on_new_profile_welcome_flag
    -- (BEFORE INSERT) : plus aucun UPDATE ici.
    IF NEW.full_name IS NOT NULL AND NEW.full_name <> '' THEN
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
    END IF;

    RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION private.trigger_on_new_profile() IS
'Migration 20260828e : plus d''UPDATE réflexif. Le flag welcome_email_sent_at '
'est posé par le trigger BEFORE INSERT on_new_profile_welcome_flag. '
'⚠ Re-jouer 20260501-welcome-email-dedup.sql restaurerait l''ancien corps, '
'dont le test « NEW.welcome_email_sent_at IS NULL » serait alors TOUJOURS '
'faux → plus aucun welcome email au signup. Re-jouer 20260828e après.';


-- ============================================================================
-- (4) Idempotence Stripe — DÉPLACÉE dans 20260828f-stripe-idempotence.sql
-- ============================================================================
-- POURQUOI LA SCISSION : le garde-fou anti-doublons de cette étape lève une
-- EXCEPTION si des double-créditations Stripe existent déjà en base. Tant
-- qu'elle vivait dans CETTE transaction, cet échec annulait aussi les
-- correctifs de triggers (1) (2) (3) ci-dessus, sans aucun rapport avec Stripe.
-- Les deux migrations sont désormais indépendantes et jouables dans n'importe
-- quel ordre.

COMMIT;


-- ============================================================================
-- CREATE INDEX CONCURRENTLY — traitement explicite
-- ============================================================================
-- Les deux CREATE INDEX ci-dessus sont VOLONTAIREMENT non-CONCURRENTLY :
--
--   1. `CREATE INDEX CONCURRENTLY` ne peut PAS s'exécuter dans un bloc
--      transactionnel (SQLSTATE 25001). Le SQL Editor de Supabase enveloppe le
--      script entier dans une transaction implicite → l'instruction échouerait,
--      et avec elle tout le reste du fichier.
--   2. L'index UNIQUE doit être construit APRÈS le backfill (4.a) et APRÈS le
--      garde-fou (4.b) : les garder dans la même transaction rend l'ensemble
--      atomique (soit tout passe, soit rien).
--   3. `credit_transactions` est une petite table sur ce projet. Un CREATE
--      INDEX classique prend un verrou SHARE (bloque les écritures, pas les
--      lectures) pendant quelques millisecondes. Le webhook Stripe rejoue en
--      cas d'échec : le risque opérationnel est nul.
--
-- SI la table a grossi (> ~1 M lignes) et qu'une coupure d'écriture est
-- inacceptable : retirer les deux CREATE INDEX du bloc transactionnel et les
-- lancer SÉPARÉMENT, une instruction à la fois, HORS de tout BEGIN :
--
--   CREATE UNIQUE INDEX CONCURRENTLY uniq_credit_transactions_stripe_session
--       ON public.credit_transactions (stripe_session_id)
--       WHERE stripe_session_id IS NOT NULL;
--
--   CREATE INDEX CONCURRENTLY idx_credit_transactions_description_stripe
--       ON public.credit_transactions (description)
--       WHERE description LIKE 'Achat Stripe%';
--
-- Ne PAS combiner CONCURRENTLY avec IF NOT EXISTS : en cas d'échec, un index
-- INVALIDE est laissé en base et le IF NOT EXISTS masquera la relance.
-- Contrôler ensuite :
--
--   SELECT c.relname, i.indisvalid, i.indisready
--   FROM pg_index i JOIN pg_class c ON c.oid = i.indexrelid
--   WHERE c.relname LIKE '%credit_transactions%stripe%';
--
--   -- si indisvalid = false :
--   DROP INDEX CONCURRENTLY <nom>;   -- puis relancer la création


-- ============================================================================
-- VÉRIFICATION — À LANCER APRÈS
-- ============================================================================
-- V1. Il ne doit plus rester QU'UN trigger sur messages et QU'UN sur
--     unlocked_leads (relancer D1) :
--
--   SELECT c.relname, t.tgname, n.nspname || '.' || p.proname AS fn
--   FROM pg_trigger t
--   JOIN pg_class c ON c.oid = t.tgrelid
--   JOIN pg_proc p ON p.oid = t.tgfoid
--   JOIN pg_namespace n ON n.oid = p.pronamespace
--   WHERE NOT t.tgisinternal AND c.relname IN ('messages','unlocked_leads','profiles')
--   ORDER BY c.relname, t.tgname;
--
--   Attendu :
--     messages       → on_new_message → public.notify_new_message
--     unlocked_leads → on_lead_unlocked → private.trigger_on_lead_unlocked_merged
--     profiles       → on_new_profile_created, on_new_profile_welcome_flag,
--                      on_profile_verified, on_profile_welcome,
--                      update_profiles_updated_at
--
-- V2. Le corps actif de notify_new_message est le bon :
--
--   SELECT p.prosrc ~ 'conversation_participants' AS doit_etre_false,
--          p.prosrc ~ 'conv\.client_id'           AS doit_etre_true
--   FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
--   WHERE n.nspname = 'public' AND p.proname = 'notify_new_message';
--
-- V3. Plus d'UPDATE réflexif dans le trigger INSERT de profiles :
--
--   SELECT p.prosrc ~ 'UPDATE public\.profiles' AS doit_etre_false
--   FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
--   WHERE n.nspname = 'private' AND p.proname = 'trigger_on_new_profile';
--
-- V4. Le flag est bien posé à l'INSERT (test à blanc, dans une transaction
--     annulée — n'envoie pas d'email car ROLLBACK annule aussi la file pg_net) :
--
--   BEGIN;
--     INSERT INTO public.profiles (id, email, role, full_name)
--     VALUES (gen_random_uuid(), 'test-flag@example.invalid', 'pro', 'Jean Test');
--     SELECT full_name, welcome_email_sent_at IS NOT NULL AS flag_pose
--     FROM public.profiles WHERE email = 'test-flag@example.invalid';
--   ROLLBACK;
--
--   ⚠ la contrainte FK profiles.id → auth.users(id) fera échouer cet INSERT :
--   c'est attendu. Test réel = créer un compte de test via l'UI et vérifier
--   qu'UN SEUL welcome email arrive, puis :
--     SELECT email, welcome_email_sent_at FROM profiles ORDER BY created_at DESC LIMIT 5;
--
-- V5. Stripe — l'index est bien utilisé :
--
--   EXPLAIN (ANALYZE, BUFFERS)
--   SELECT id FROM public.credit_transactions
--   WHERE stripe_session_id = 'cs_test_inexistant';
--   -- attendu : Index Scan using uniq_credit_transactions_stripe_session
--
--   EXPLAIN (ANALYZE, BUFFERS)
--   SELECT id FROM public.credit_transactions
--   WHERE description = 'Achat Stripe - Session cs_test_inexistant'
--     AND description LIKE 'Achat Stripe%';
--   -- attendu : Index Scan using idx_credit_transactions_description_stripe
--
--   SELECT COUNT(*) FILTER (WHERE stripe_session_id IS NOT NULL) AS backfillees,
--          COUNT(*) FILTER (WHERE description LIKE 'Achat Stripe - Session %') AS attendues
--   FROM public.credit_transactions;
--   -- les deux nombres doivent être égaux.


-- ============================================================================
-- OPTIONNEL — NON APPLIQUÉ : UPDATE réflexif de trigger_on_profile_welcome()
-- ============================================================================
-- `private.trigger_on_profile_welcome()` (AFTER UPDATE, chemin Google OAuth)
-- souffre du même défaut : il fait `UPDATE public.profiles SET
-- welcome_email_sent_at = NOW()` DEPUIS un trigger AFTER UPDATE — donc une
-- ré-entrée dans la même chaîne de triggers (elle s'arrête d'elle-même au
-- 2e passage car OLD.full_name est alors non vide, mais elle crée une version
-- de ligne morte de plus).
--
-- Ce n'est PAS corrigé ici : la condition d'envoi actuelle contient
-- `NEW.welcome_email_sent_at IS NULL`, seul garde-fou du chemin OAuth. Le
-- corriger impose de la relâcher (sur `OLD` uniquement) — ce qui modifie la
-- sémantique d'un UPDATE qui écrirait full_name ET welcome_email_sent_at dans
-- la même instruction. Aucun code TS ne le fait aujourd'hui (vérifié : aucune
-- occurrence de welcome_email_sent_at dans src/), mais le flux OAuth est le
-- plus difficile à tester à blanc — d'où l'abstention.
--
-- Bloc prêt à l'emploi, à activer SEULEMENT après un test manuel complet du
-- flux « Se connecter avec Google → RoleSelectionModal → 1 seul email » :
--
--   CREATE OR REPLACE FUNCTION private.set_welcome_flag_on_update()
--   RETURNS TRIGGER LANGUAGE plpgsql AS $fn$
--   BEGIN
--       IF (OLD.full_name IS NULL OR OLD.full_name = '')
--          AND NEW.full_name IS NOT NULL AND NEW.full_name <> ''
--          AND OLD.welcome_email_sent_at IS NULL
--          AND NEW.welcome_email_sent_at IS NULL THEN
--           NEW.welcome_email_sent_at := NOW();
--       END IF;
--       RETURN NEW;
--   END;
--   $fn$;
--
--   DROP TRIGGER IF EXISTS on_profile_welcome_flag ON public.profiles;
--   CREATE TRIGGER on_profile_welcome_flag
--       BEFORE UPDATE ON public.profiles
--       FOR EACH ROW
--       EXECUTE FUNCTION private.set_welcome_flag_on_update();
--
--   -- puis remplacer trigger_on_profile_welcome() : condition basée sur
--   -- OLD.welcome_email_sent_at IS NULL uniquement (retirer le test sur NEW,
--   -- que le BEFORE vient de renseigner), et SUPPRIMER l'UPDATE final.
-- ============================================================================
