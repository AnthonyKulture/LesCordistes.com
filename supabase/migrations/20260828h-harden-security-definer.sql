-- ============================================================================
-- PHASE 5 — Durcissement des fonctions SECURITY DEFINER + réparation Realtime
--
-- (1) SEARCH_PATH sur les fonctions SECURITY DEFINER
-- ----------------------------------------------------------------------------
-- Une fonction SECURITY DEFINER s'exécute avec les droits de son PROPRIÉTAIRE
-- (souvent postgres). Si son `search_path` n'est pas figé, elle résout ses
-- appels selon le search_path de l'APPELANT : un utilisateur peut créer une
-- fonction ou une table dans `pg_temp` portant le nom d'un objet que la
-- fonction utilise, et la faire exécuter avec des droits élevés.
--
-- Ce n'est pas théorique sur ce projet : la relecture du helper `is_admin()`
-- (migration 20260828d) a identifié exactement ce vecteur, corrigé alors en
-- `SET search_path = public, pg_temp`. Une vingtaine de fonctions antérieures
-- n'ont jamais eu ce durcissement.
--
-- MÉTHODE : plutôt que d'énumérer des noms à la main — plusieurs fonctions sont
-- définies dans 2 ou 3 fichiers successifs et on ignore laquelle a gagné en
-- base — on parcourt `pg_proc` et on ne touche QUE ce qui existe réellement et
-- n'a pas déjà de search_path. Idempotent par construction : un second passage
-- ne trouve plus rien.
--
-- `pg_temp` est placé EN DERNIER : c'est la position qui neutralise le
-- détournement, puisque les objets temporaires ne sont plus consultés en premier.
-- `private` est inclus car les triggers d'email y vivent et s'y appellent.
-- ============================================================================

BEGIN;

DO $harden$
DECLARE
    r record;
    v_path text;
    v_count int := 0;
BEGIN
    FOR r IN
        SELECT n.nspname AS schema_name,
               p.proname AS func_name,
               pg_get_function_identity_arguments(p.oid) AS args
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE p.prosecdef                                   -- SECURITY DEFINER
          AND n.nspname IN ('public', 'private')
          AND NOT EXISTS (
              SELECT 1
              FROM unnest(COALESCE(p.proconfig, ARRAY[]::text[])) AS cfg
              WHERE cfg LIKE 'search_path=%'
          )
        ORDER BY n.nspname, p.proname
    LOOP
        -- Inclure `private` uniquement s'il existe, pour ne pas figer un
        -- search_path qui référencerait un schéma absent.
        v_path := CASE
            WHEN EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'private')
                THEN 'public, private, pg_temp'
            ELSE 'public, pg_temp'
        END;

        EXECUTE format(
            'ALTER FUNCTION %I.%I(%s) SET search_path = %s',
            r.schema_name, r.func_name, r.args, v_path
        );
        v_count := v_count + 1;
        RAISE NOTICE 'search_path figé sur %.%(%)', r.schema_name, r.func_name, r.args;
    END LOOP;

    RAISE NOTICE '% fonction(s) SECURITY DEFINER durcie(s).', v_count;
END $harden$;

-- ============================================================================
-- (2) Realtime : réparer le listener `notifications`
-- ----------------------------------------------------------------------------
-- `supabase-messaging-improvements.sql` (lignes 7-11) fait
-- `DROP PUBLICATION supabase_realtime` puis la recrée en n'y ajoutant QUE
-- `messages` et `conversations`. La table `notifications` n'y a jamais été
-- remise.
--
-- Conséquence : le listener de src/hooks/useNotifications.ts est branché sur
-- `postgres_changes` / table `notifications` avec un filtre `user_id=eq.<id>`
-- correct… mais ne reçoit JAMAIS rien. La cloche de notifications ne se met à
-- jour qu'au rechargement de page — un bug fonctionnel silencieux, pas une
-- question de performance.
--
-- Le filtre côté client étant déjà posé (Phase 5.1), ajouter la table n'expose
-- rien : chaque abonné ne reçoit que ses propres lignes, et la policy RLS
-- `Users can view own notifications` est de toute façon réévaluée par Realtime.
-- ============================================================================

DO $realtime$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        RAISE NOTICE 'Publication supabase_realtime absente — rien à faire.';
        RETURN;
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'notifications'
    ) THEN
        RAISE NOTICE 'notifications déjà publiée en Realtime — rien à faire.';
    ELSE
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
        RAISE NOTICE 'notifications ajoutée à la publication Realtime.';
    END IF;
END $realtime$;

COMMIT;

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================
-- 1) Plus aucune fonction SECURITY DEFINER sans search_path (doit renvoyer 0) :
--      SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
--      WHERE p.prosecdef AND n.nspname IN ('public','private')
--        AND NOT EXISTS (SELECT 1 FROM unnest(COALESCE(p.proconfig, '{}')) c
--                        WHERE c LIKE 'search_path=%');
--
-- 2) Voir le search_path effectif de chaque fonction durcie :
--      SELECT n.nspname, p.proname, p.proconfig
--      FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
--      WHERE p.prosecdef AND n.nspname IN ('public','private') ORDER BY 1,2;
--
-- 3) Tables publiées en Realtime :
--      SELECT schemaname, tablename FROM pg_publication_tables
--      WHERE pubname = 'supabase_realtime' ORDER BY 2;
--
-- 4) NON-RÉGRESSION à retester manuellement — ces fonctions portent des flux
--    critiques, et figer un search_path peut casser un appel non qualifié :
--      · inscription d'un pro et d'un client → email de bienvenue reçu
--      · modération d'une mission (pending → live) → email au client
--      · déblocage d'un lead → crédit débité, email reçu, notification créée
--      · envoi d'un message → notification créée
--      · dashboard admin → les KPI agrégés s'affichent (admin_credits_agg,
--        admin_sum_transactions, admin_top_live_cities)
--      · cloche de notifications → se met à jour SANS recharger la page
--
-- ROLLBACK d'une fonction précise si un appel non qualifié cassait :
--      ALTER FUNCTION <schema>.<nom>(<args>) RESET search_path;
-- ============================================================================
