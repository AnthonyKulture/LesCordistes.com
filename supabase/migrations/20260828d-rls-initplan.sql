-- ============================================================================
-- 20260828d — OPTIMISATION RLS : initPlan, helper is_admin(), décorrélation
--             des EXISTS, suppression des policies strictement dupliquées.
--
-- OBJECTIF : réduire le coût CPU de la RLS SANS modifier d'un iota la
-- sémantique d'accès. Aucune ligne visible aujourd'hui ne doit devenir
-- invisible, aucune ligne cachée aujourd'hui ne doit devenir visible.
--
-- ── POURQUOI (mécanismes Postgres) ─────────────────────────────────────────
--
-- (a) initPlan — `auth.uid()`, `auth.jwt()` et `auth.role()` sont des fonctions
--     STABLE. Écrites NUES dans une expression de policy, le planner les traite
--     comme des expressions de qualification ordinaires : elles sont appelées
--     POUR CHAQUE LIGNE scannée par la requête. Enveloppées dans un sous-select
--     scalaire non corrélé — `(select auth.uid())` — le planner les remonte en
--     InitPlan : le nœud est évalué UNE SEULE FOIS avant le scan, et le résultat
--     est réutilisé comme constante pour toutes les lignes.
--     La valeur retournée est rigoureusement la même (STABLE = constante pour
--     la durée de l'instruction) : la sémantique est inchangée par construction.
--     C'est le lint `auth_rls_initplan` documenté par Supabase.
--
-- (b) Helper `is_admin()` — le test « suis-je admin ? » était inliné 14 fois
--     sous forme `EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND
--     role = 'admin')`. Ce sous-plan corrélé à `auth.uid()` nu était replanifié
--     et réexécuté par ligne. Centralisé dans une fonction SQL STABLE
--     SECURITY DEFINER et appelée via `(select public.is_admin())`, on obtient
--     un InitPlan unique par requête + un point de vérité unique.
--
-- (c)(d) Décorrélation des EXISTS — un `EXISTS (SELECT 1 FROM t WHERE t.pk =
--     <colonne de la ligne courante>)` est un sous-plan CORRÉLÉ : Postgres ne
--     peut pas le hisser hors de la boucle, il l'exécute une fois par ligne
--     scannée. Réécrit en `<colonne> IN (SELECT pk FROM t WHERE <prédicat non
--     corrélé>)`, le sous-plan devient indépendant de la ligne courante : le
--     planner peut le matérialiser en hashed SubPlan (une seule exécution) ou
--     le transformer en semi-join. L'équivalence stricte tient parce que la
--     colonne jointe est une CLÉ PRIMAIRE (unique, NOT NULL) — cf. preuves en
--     bas de fichier.
--
-- (e) Doublons — les policies PERMISSIVE d'une même table/commande se combinent
--     en OR. Deux policies à l'expression identique donnent `A OR A ≡ A` :
--     la seconde est du coût pur (un sous-plan de plus évalué par ligne) sans
--     aucun effet sur le résultat. On n'en supprime QUE des paires prouvées
--     byte-identiques (même commande, même PERMISSIVE, même absence de clause
--     TO, même expression).
--
-- IDEMPOTENT : DROP POLICY IF EXISTS + CREATE POLICY partout (jamais ALTER
-- POLICY, qui échoue si le nom exact n'existe pas). CREATE OR REPLACE pour la
-- fonction. Le fichier peut être relancé autant de fois que nécessaire.
--
-- NE TOUCHE PAS : les policies de `storage.objects`, `leads`,
-- `contact_requests`, `promo_codes`, ni les policies INSERT `WITH CHECK (true)`
-- (aucune fonction auth à optimiser dedans) — cf. section « NON TOUCHÉ ».
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. HELPER is_admin()
--
-- POURQUOI SECURITY DEFINER : la fonction s'exécute avec les droits de son
-- propriétaire, donc elle ne redéclenche pas la RLS de `profiles` depuis
-- l'intérieur d'une policy (pas de risque de récursion si `profiles` est un
-- jour durci). Aujourd'hui la policy SELECT de `profiles` est USING (true),
-- donc le résultat est identique à l'EXISTS inliné — l'équivalence est stricte.
--
-- POURQUOI `SET search_path = public, pg_temp` : obligatoire sur toute fonction
-- SECURITY DEFINER, sinon un appelant peut détourner la résolution de nom
-- `profiles` vers une table qu'il contrôle.
-- ATTENTION : `SET search_path = public` SEUL NE SUFFIT PAS. Postgres documente
-- que si `pg_temp` n'est pas listé explicitement dans le search_path, il est
-- quand même parcouru — et EN PREMIER, avant même `pg_catalog`. Un appelant
-- disposant du droit TEMPORARY (accordé à PUBLIC par défaut) pourrait créer
-- `CREATE TEMP TABLE profiles (id uuid, role text)` avec une ligne à son nom :
-- le corps de la fonction (LANGUAGE sql à corps textuel → noms résolus à
-- l'exécution, pas à la création) résoudrait `profiles` vers cette table et
-- renverrait true. Contrairement à une expression de policy, dont les noms sont
-- figés en OID au moment du CREATE POLICY et donc non détournables : ce serait
-- une RÉGRESSION de sécurité introduite par cette migration.
-- Double protection appliquée : `pg_temp` listé EN DERNIER + la table est
-- schéma-qualifiée `public.profiles` dans le corps.
--
-- POURQUOI STABLE (et pas VOLATILE) : c'est ce qui autorise le planner à la
-- hisser en InitPlan quand elle est appelée via `(select public.is_admin())`.
--
-- Aucune fonction `is_admin` n'existe dans le dépôt (vérifié : aucun
-- `CREATE FUNCTION ... is_admin` dans supabase/migrations/*.sql ni dans
-- supabase-email-triggers.sql), donc pas de collision de signature.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (select auth.uid())
          AND role = 'admin'
    );
$$;

COMMENT ON FUNCTION public.is_admin() IS
    'true si l''appelant courant (auth.uid()) a le rôle admin. Appeler via (select public.is_admin()) dans les policies pour obtenir un InitPlan.';

-- GRANT EXECUTE : indispensable pour `anon` AUSSI. Les policies qui l'utilisent
-- (« Admins can view all jobs », « View lead activations ») n'ont pas de clause
-- TO : elles s'appliquent donc à PUBLIC, y compris aux visiteurs anonymes, et
-- une policy ne peut pas appeler une fonction sur laquelle le rôle appelant
-- n'a pas EXECUTE (erreur 42501 → la page publique casserait).
-- Aucune fuite : pour `anon`, auth.uid() est NULL → la fonction renvoie false.
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 2. profiles
-- « Public profiles are viewable by everyone » (SELECT USING true) : aucune
-- fonction auth → laissée strictement telle quelle.
-- Les deux policies ci-dessous n'ont pas de WITH CHECK explicite : pour un
-- UPDATE, Postgres retombe alors sur l'expression USING. On reproduit la même
-- forme (USING seul) pour ne rien changer.
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK ((select auth.uid()) = id);

-- ---------------------------------------------------------------------------
-- 3. jobs
--
-- « Jobs are viewable by everyone » (SELECT USING status IN ('live','expired',
-- 'completed')) : aucune fonction auth → non touchée. C'est elle qui donne
-- l'accès public/anonyme, elle reste intacte.
--
-- DÉDOUBLONNAGE UPDATE : « Users can update own jobs » (créé par
-- supabase-fix-all.sql) et « Creators can update own jobs » (créé par
-- supabase-rls-dual-profile.sql) ont EXACTEMENT la même définition —
-- FOR UPDATE, PERMISSIVE, sans clause TO, USING (auth.uid() = created_by),
-- sans WITH CHECK. Aucun des deux fichiers ne droppe l'autre : les deux
-- coexistent en base quel que soit l'ordre d'exécution. `A OR A ≡ A` →
-- on n'en garde qu'une (« Creators can update own jobs », cohérente avec la
-- famille Creators view/update/delete).
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Creators can view own jobs" ON public.jobs;
CREATE POLICY "Creators can view own jobs"
    ON public.jobs FOR SELECT
    USING ((select auth.uid()) = created_by);

DROP POLICY IF EXISTS "Admins can view all jobs" ON public.jobs;
CREATE POLICY "Admins can view all jobs"
    ON public.jobs FOR SELECT
    USING ((select public.is_admin()));

DROP POLICY IF EXISTS "Admins can update jobs" ON public.jobs;
CREATE POLICY "Admins can update jobs"
    ON public.jobs FOR UPDATE
    USING ((select public.is_admin()));

-- Dédoublonnage : on supprime le doublon ET on recrée la survivante optimisée.
DROP POLICY IF EXISTS "Users can update own jobs"   ON public.jobs;
DROP POLICY IF EXISTS "Creators can update own jobs" ON public.jobs;
CREATE POLICY "Creators can update own jobs"
    ON public.jobs FOR UPDATE
    USING ((select auth.uid()) = created_by);

DROP POLICY IF EXISTS "Creators can delete own jobs" ON public.jobs;
CREATE POLICY "Creators can delete own jobs"
    ON public.jobs FOR DELETE
    USING ((select auth.uid()) = created_by);

-- INSERT : on optimise « Authenticated users can create jobs » et on NE TOUCHE
-- PAS « Anyone can create jobs » (WITH CHECK (true), aucune fonction auth à
-- optimiser, et son existence en base dépend de l'ordre d'exécution de
-- supabase-fix-all.sql vs supabase-rls-dual-profile.sql — cf. section
-- « NON TOUCHÉ » en bas de fichier).
-- Réécriture CONDITIONNELLE : on n'optimise cette policy que si elle existe
-- DÉJÀ en base. Un DROP+CREATE aveugle la CRÉERAIT dans le cas où
-- supabase-fix-all.sql s'est exécuté en dernier — élargissant l'accès INSERT
-- au lieu de le laisser inchangé. Même incertitude d'ordre d'exécution que
-- pour « Anyone can create jobs » (cf. section NON TOUCHÉ), donc même prudence.
DO $do$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename  = 'jobs'
          AND policyname = 'Authenticated users can create jobs'
    ) THEN
        DROP POLICY "Authenticated users can create jobs" ON public.jobs;
        CREATE POLICY "Authenticated users can create jobs"
            ON public.jobs FOR INSERT
            WITH CHECK ((select auth.role()) = 'authenticated');
        RAISE NOTICE 'jobs INSERT : policy « Authenticated users can create jobs » optimisée (initPlan).';
    ELSE
        RAISE NOTICE 'jobs INSERT : policy « Authenticated users can create jobs » ABSENTE en base — non créée (aucun changement de sémantique). Vérifier l''état réel : SELECT policyname, with_check FROM pg_policies WHERE tablename=''jobs'' AND cmd=''INSERT'';';
    END IF;
END $do$;

-- ---------------------------------------------------------------------------
-- 4. credits
-- DÉDOUBLONNAGE SELECT : « Pro can view own credits » (supabase-migrations-mvp)
-- et « Users can view own credits » (supabase-stripe-fix) sont identiques —
-- FOR SELECT, PERMISSIVE, sans TO, USING (auth.uid() = pro_id). On conserve
-- « Pro can view own credits », cohérente avec les policies INSERT/UPDATE
-- « Pro can ... own credits » de la même table.
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own credits" ON public.credits;
DROP POLICY IF EXISTS "Pro can view own credits"   ON public.credits;
CREATE POLICY "Pro can view own credits"
    ON public.credits FOR SELECT
    USING ((select auth.uid()) = pro_id);

DROP POLICY IF EXISTS "Pro can insert own credits" ON public.credits;
CREATE POLICY "Pro can insert own credits"
    ON public.credits FOR INSERT
    WITH CHECK ((select auth.uid()) = pro_id);

DROP POLICY IF EXISTS "Pro can update own credits" ON public.credits;
CREATE POLICY "Pro can update own credits"
    ON public.credits FOR UPDATE
    USING ((select auth.uid()) = pro_id);

-- ---------------------------------------------------------------------------
-- 5. credit_transactions
-- Même dédoublonnage : « Pro can view own transactions » (mvp) ==
-- « Users can view own transactions » (stripe-fix). On garde la première.
-- « Service role can insert transactions » (WITH CHECK true) : non touchée
-- (aucune fonction auth ; sa suppression serait un changement de sécurité,
-- pas une optimisation — cf. « NON TOUCHÉ »).
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own transactions" ON public.credit_transactions;
DROP POLICY IF EXISTS "Pro can view own transactions"   ON public.credit_transactions;
CREATE POLICY "Pro can view own transactions"
    ON public.credit_transactions FOR SELECT
    USING ((select auth.uid()) = pro_id);

-- ---------------------------------------------------------------------------
-- 6. unlocked_leads
--
-- « View lead activations » combine 3 branches en OR. La 3e était un EXISTS
-- CORRÉLÉ sur `jobs` (référence `job_id` de la ligne unlocked_leads courante) :
-- réexécuté pour chaque ligne scannée. Décorrélé en semi-join `job_id IN
-- (SELECT id FROM jobs WHERE created_by = ...)`, le sous-plan ne dépend plus
-- de la ligne courante → une seule exécution matérialisée.
-- `jobs.id` étant la CLÉ PRIMAIRE (unique, NOT NULL), les deux formes
-- sélectionnent exactement le même ensemble (preuve en bas de fichier).
-- La RLS de `jobs` continue de s'appliquer à l'intérieur du sous-select,
-- exactement comme elle s'appliquait à l'intérieur de l'EXISTS.
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "View lead activations" ON public.unlocked_leads;
CREATE POLICY "View lead activations"
    ON public.unlocked_leads FOR SELECT
    USING (
        (select auth.uid()) = pro_id                    -- le pro voit ses déblocages
        OR (select public.is_admin())                   -- l'admin voit tout
        OR job_id IN (                                  -- le client voit les déblocages de SES missions
            SELECT j.id FROM public.jobs j
            WHERE j.created_by = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Pro can unlock leads" ON public.unlocked_leads;
CREATE POLICY "Pro can unlock leads"
    ON public.unlocked_leads FOR INSERT
    WITH CHECK ((select auth.uid()) = pro_id);

-- ---------------------------------------------------------------------------
-- 7. reviews
-- « Reviews are publicly viewable » (SELECT USING true) : non touchée.
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Clients can submit reviews" ON public.reviews;
CREATE POLICY "Clients can submit reviews"
    ON public.reviews FOR INSERT
    WITH CHECK ((select auth.uid()) = client_id);

-- ---------------------------------------------------------------------------
-- 8. notifications
-- « Service role can insert notifications » (WITH CHECK true) : non touchée.
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    USING ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- 9. conversations
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Participants can view their conversations" ON public.conversations;
CREATE POLICY "Participants can view their conversations"
    ON public.conversations FOR SELECT
    USING (
        (select auth.uid()) = client_id
        OR (select auth.uid()) = pro_id
    );

DROP POLICY IF EXISTS "Participants can create their conversations" ON public.conversations;
CREATE POLICY "Participants can create their conversations"
    ON public.conversations FOR INSERT
    WITH CHECK (
        (select auth.uid()) = client_id
        OR (select auth.uid()) = pro_id
    );

-- ---------------------------------------------------------------------------
-- 10. messages
--
-- C'était le pire cas du schéma : l'EXISTS sur `conversations` référence
-- `conversation_id` de la ligne `messages` courante → sous-plan CORRÉLÉ,
-- exécuté une fois par message scanné (un fil de 500 messages = 500
-- exécutions + 500 appels à auth.uid()).
-- Réécrit en semi-join décorrélé : le sous-select ne dépend plus que de
-- l'InitPlan auth.uid(), donc une exécution unique, matérialisée en hash.
-- `conversations.id` est la CLÉ PRIMAIRE → équivalence stricte (preuve en bas).
-- Le prédicat interne (client_id = uid OR pro_id = uid) est repris à
-- l'identique, et la RLS de `conversations` s'applique dans les deux formes.
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Participants can view messages" ON public.messages;
CREATE POLICY "Participants can view messages"
    ON public.messages FOR SELECT
    USING (
        conversation_id IN (
            SELECT c.id FROM public.conversations c
            WHERE c.client_id = (select auth.uid())
               OR c.pro_id    = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Participants can send messages" ON public.messages;
CREATE POLICY "Participants can send messages"
    ON public.messages FOR INSERT
    WITH CHECK (
        (select auth.uid()) = sender_id
        AND conversation_id IN (
            SELECT c.id FROM public.conversations c
            WHERE c.client_id = (select auth.uid())
               OR c.pro_id    = (select auth.uid())
        )
    );

-- ---------------------------------------------------------------------------
-- 11. promo_redemptions
-- `promo_codes` a la RLS activée SANS aucune policy (deny-all volontaire,
-- tout passe par les RPC SECURITY DEFINER) → rien à optimiser.
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Pro can view own redemptions" ON public.promo_redemptions;
CREATE POLICY "Pro can view own redemptions"
    ON public.promo_redemptions FOR SELECT
    USING ((select auth.uid()) = pro_id);

-- ---------------------------------------------------------------------------
-- 12. TABLES ADMIN/OPS — paires `<t>_service_role_all` + `<t>_admin_select`
--
-- Ces 11 tables ont été créées avec des policies générées par des boucles
-- DO/format() identiques (supabase-admin-actions.sql, 20260429-marketing.sql,
-- 20260429-marketing-nurture.sql, 20260501-pro-alert-subscriptions.sql).
-- On rejoue la même boucle en version optimisée.
--
-- POURQUOI ON GARDE `<t>_service_role_all` (question (f)) :
-- le rôle Postgres `service_role` de Supabase porte l'attribut BYPASSRLS, et
-- les fonctions SECURITY DEFINER / jobs pg_cron s'exécutent sous le
-- propriétaire des tables (qui contourne aussi la RLS, aucune table n'étant en
-- FORCE ROW LEVEL SECURITY). Ces policies sont donc, en théorie, du poids mort.
-- MAIS une fois `auth.jwt()` remonté en InitPlan, leur coût résiduel est d'un
-- seul déréférencement jsonb par requête (plus par ligne) : le gain d'une
-- suppression est ~nul. En face, le risque est un 403 silencieux sur un chemin
-- ops/cron si une seule de ces hypothèses est fausse en prod (je n'ai pas accès
-- à la base pour vérifier `rolbypassrls`). Rapport risque/gain défavorable →
-- ON LES CONSERVE, optimisées. La suppression, si elle est souhaitée, doit
-- faire l'objet d'une migration dédiée après vérification de
-- `SELECT rolbypassrls FROM pg_roles WHERE rolname = 'service_role';`.
--
-- Le garde `to_regclass` rend la boucle relançable même si une table venait à
-- manquer (DROP POLICY IF EXISTS échoue si la RELATION n'existe pas).
-- ---------------------------------------------------------------------------

DO $do$
DECLARE
    t TEXT;
BEGIN
    FOR t IN SELECT unnest(ARRAY[
        'admin_actions',
        'marketing_contacts',
        'marketing_email_templates',
        'marketing_segments',
        'marketing_campaigns',
        'marketing_campaign_recipients',
        'marketing_unsubscribes',
        'marketing_playbooks',
        'marketing_playbook_runs',
        'pro_alert_subscriptions',
        'pro_alert_sends'
    ])
    LOOP
        CONTINUE WHEN to_regclass('public.' || t) IS NULL;

        EXECUTE format($f$
            DROP POLICY IF EXISTS "%1$s_service_role_all" ON public.%1$I;
            CREATE POLICY "%1$s_service_role_all" ON public.%1$I
                FOR ALL
                USING (((select auth.jwt()) ->> 'role') = 'service_role')
                WITH CHECK (((select auth.jwt()) ->> 'role') = 'service_role');

            DROP POLICY IF EXISTS "%1$s_admin_select" ON public.%1$I;
            CREATE POLICY "%1$s_admin_select" ON public.%1$I
                FOR SELECT TO authenticated
                USING ((select public.is_admin()));
        $f$, t);
    END LOOP;
END
$do$;

COMMIT;

-- ============================================================================
-- BLOC DE VÉRIFICATION — à lancer APRÈS le COMMIT
-- ============================================================================

-- V1. Chasse aux fonctions auth restées NUES.
--     Méthode : `pg_get_expr` rend un sous-select scalaire sous la forme
--     `( SELECT auth.uid() AS uid)`. On efface ces formes-là du texte, puis on
--     cherche ce qui reste de `auth.<fn>()` — c'est nécessairement un appel nu.
--     Colonne `nu` attendue : FALSE partout. Trier les TRUE en tête.
--     (Le rendu exact de pg_get_expr peut varier selon la version majeure de
--     Postgres : en cas de TRUE inattendu, relire la colonne `expr` à l'œil
--     avant de conclure.)
SELECT tablename, policyname, cmd,
       regexp_replace(
           coalesce(qual, '') || ' | ' || coalesce(with_check, ''),
           '\( SELECT auth\.(uid|jwt|role)\(\)( AS \w+)?\)', '', 'g'
       ) ~ 'auth\.(uid|jwt|role)\(\)' AS nu,
       coalesce(qual, '') || ' | ' || coalesce(with_check, '') AS expr
FROM pg_policies
WHERE schemaname = 'public'
  AND (coalesce(qual, '') || coalesce(with_check, '')) LIKE '%auth.%'
ORDER BY nu DESC, tablename, policyname;

-- V2. Inventaire complet de l'état obtenu, table par table.
--     Comparer avec le tableau AVANT/APRÈS du rapport.
SELECT tablename, policyname, cmd, permissive, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;

-- V3. Doublons permissifs restants (même table + même commande).
--     Attendu APRÈS migration : SEULE la table `jobs` doit encore apparaître —
--       jobs / SELECT  → 3 (viewable-by-everyone + admin + creator :
--                           NON équivalentes, conservées volontairement)
--       jobs / UPDATE  → 2 (admin + creator : NON équivalentes, conservées)
--       jobs / INSERT  → 2 seulement si « Anyone can create jobs » existe
--                        encore en base (cf. V5 et section NON TOUCHÉ / A)
--     `credits` et `credit_transactions` NE DOIVENT PLUS apparaître : c'est la
--     preuve que le dédoublonnage SELECT a bien été appliqué.
SELECT tablename, cmd, count(*) AS nb, array_agg(policyname ORDER BY policyname)
FROM pg_policies
WHERE schemaname = 'public' AND permissive = 'PERMISSIVE'
GROUP BY tablename, cmd
HAVING count(*) > 1
ORDER BY nb DESC, tablename;

-- V4. Le helper existe, est STABLE (provolatile='s'), SECURITY DEFINER
--     (prosecdef=true), avec search_path pinné, et est exécutable par anon.
SELECT p.proname, p.provolatile, p.prosecdef, p.proconfig,
       has_function_privilege('anon',          'public.is_admin()', 'EXECUTE') AS anon_ok,
       has_function_privilege('authenticated', 'public.is_admin()', 'EXECUTE') AS auth_ok,
       has_function_privilege('service_role',  'public.is_admin()', 'EXECUTE') AS svc_ok
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'is_admin';

-- V5. Présence (ou non) de la policy INSERT non touchée sur jobs — sert à
--     trancher la question laissée ouverte (cf. « NON TOUCHÉ » ci-dessous).
SELECT policyname, cmd, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'jobs' AND cmd = 'INSERT'
ORDER BY policyname;

-- V6. Preuve que l'InitPlan est bien produit (chercher « InitPlan 1 » dans le
--     plan, et NON un appel de fonction dans le Filter ligne à ligne).
--     À lancer en session authentifiée simulée :
--       BEGIN;
--         SET LOCAL role authenticated;
--         SET LOCAL request.jwt.claims = '{"sub":"<uuid-utilisateur>","role":"authenticated"}';
--         EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM messages LIMIT 50;
--         EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM unlocked_leads LIMIT 50;
--       ROLLBACK;

-- ============================================================================
-- TESTS D'ACCÈS À REJOUER (obligatoires — la RLS ne se teste pas au plan)
-- ============================================================================
-- 1. ANONYME (clé anon, non connecté)
--    · /jobs liste bien les missions live / expired / completed
--    · une mission `pending` reste INVISIBLE
--    · `select client_contact_info from jobs` renvoie toujours 42501 (grant
--      colonne posé par 20260828b — non modifié ici)
--
-- 2. CLIENT connecté
--    · le dashboard client affiche TOUTES ses missions, y compris `pending`
--      et `rejected` (policy « Creators can view own jobs »)
--    · l'annulation d'une mission fonctionne (UPDATE status='cancelled' →
--      policy « Creators can update own jobs », la survivante du dédoublonnage)
--    · le client voit les pros ayant débloqué SES missions (JobUnlockers →
--      policy « View lead activations », branche décorrélée)
--    · il ne voit AUCUNE mission d'un autre client
--
-- 3. PRO connecté
--    · solde de crédits visible (credits SELECT)
--    · historique des transactions visible (credit_transactions SELECT)
--    · ses leads débloqués visibles, et UNIQUEMENT les siens
--    · déblocage d'un lead : le RPC unlock_lead passe, les coordonnées
--      apparaissent via get_job_contact
--    · publication d'une mission en mode recruteur (jobs INSERT authenticated)
--
-- 4. MESSAGERIE (client ↔ pro)
--    · chaque participant lit le fil, l'autre partie aussi
--    · un TIERS connecté ne lit RIEN du fil (policy messages SELECT)
--    · envoi d'un message dans sa propre conversation : OK
--    · envoi d'un message dans une conversation dont on n'est pas participant :
--      REFUSÉ (policy messages INSERT)
--
-- 5. ADMIN
--    · /admin voit les missions `pending` (policy « Admins can view all jobs »)
--    · modération pending → live (policy « Admins can update jobs »)
--    · pages ops marketing / pro_alert_* toujours lisibles (`*_admin_select`)
--
-- 6. INVITÉ (wizard /post-job sans compte)
--    · la publication passe toujours — elle transite par /api/submit-job en
--      service_role, qui contourne la RLS. Aucune policy touchée ici.
--
-- 7. CRONS / EDGE FUNCTIONS (service_role)
--    · jobs-freshness, marketing-nurture, pro-alerts : inchangés
--      (`*_service_role_all` conservées).

-- ============================================================================
-- NON TOUCHÉ — DÉCISIONS DE PRUDENCE ASSUMÉES
-- ============================================================================
-- A) jobs / « Anyone can create jobs » (INSERT, WITH CHECK (true))
--    NON SUPPRIMÉE, et c'est délibéré.
--    · Elle n'est PAS équivalente à « Authenticated users can create jobs » :
--      `true` autorise aussi `anon`, `auth.role() = 'authenticated'` non.
--    · Son existence en base est INCERTAINE : supabase-fix-all.sql la recrée
--      (CHECK true) et supabase-rls-dual-profile.sql la droppe pour créer
--      « Authenticated users can create jobs ». Les deux fichiers sont arrivés
--      dans le même commit (51e4449) et rien ne détermine leur ordre
--      d'exécution réel dans le SQL Editor.
--    · Un DROP+CREATE aveugle serait donc soit une suppression de policy, soit
--      — pire — une RECRÉATION d'une policy absente (réouverture d'un INSERT
--      anonyme). Les deux sont des changements de sémantique.
--    · Côté code, la suppression serait fonctionnellement neutre : le flux
--      invité passe par /api/submit-job → createSupabaseAdminClient()
--      (service_role, contourne la RLS) ; le flux connecté insère depuis le
--      navigateur en `authenticated` (src/views/PostJob.tsx L366, branche
--      `finalUserId` non nul) ; /api/job-draft et /api/admin/jobs sont
--      serveur-only. Aucun chemin n'insère en `anon` depuis le navigateur.
--    · => Décision : lancer V5. Si « Anyone can create jobs » apparaît, sa
--      suppression est un correctif de SÉCURITÉ (elle laisse aujourd'hui
--      n'importe quel porteur de la clé anon insérer une ligne dans `jobs`),
--      pas une optimisation — à traiter dans une migration dédiée et testée,
--      pas ici.
--
-- B) credit_transactions / « Service role can insert transactions »
--    (INSERT, WITH CHECK (true)) — NON TOUCHÉE.
--    Aucune fonction auth à optimiser. À signaler cependant : malgré son nom,
--    elle autorise tout rôle (y compris `authenticated`) à insérer une ligne
--    arbitraire dans l'historique des crédits. Le solde réel vit dans
--    `credits`, donc pas de création de crédit — mais c'est un vecteur de
--    pollution de l'historique. Correctif de sécurité à part entière.
--
-- C) notifications / « Service role can insert notifications »
--    (INSERT, WITH CHECK (true)) — NON TOUCHÉE, même raisonnement que (B) :
--    n'importe quel utilisateur connecté peut écrire une notification à
--    n'importe qui. Hors périmètre d'une migration de performance.
--
-- D) `*_service_role_all` sur les 11 tables ops/marketing — CONSERVÉES.
--    Argument complet en section 12. Résumé : gain nul après initPlan,
--    risque non nul sans accès à la base pour vérifier `rolbypassrls`.
--
-- E) storage.objects (« Anyone can upload job photos », « Job photos are
--    publicly accessible ») — NON TOUCHÉES. Aucune fonction auth (test sur
--    `bucket_id` seulement), et modifier une policy du schéma `storage` depuis
--    une migration applicative est un risque gratuit.
--
-- F) leads, contact_requests, promo_codes — NON TOUCHÉES.
--    Policies constantes (`WITH CHECK (true)` / `USING (false)`) ou aucune
--    policy du tout : rien à optimiser.
--
-- G) jobs / « Jobs are viewable by everyone », profiles / « Public profiles are
--    viewable by everyone », reviews / « Reviews are publicly viewable » —
--    NON TOUCHÉES : expressions constantes ou colonnes seules.
--
-- H) Les policies permissives multiples restantes sur `jobs` (3 en SELECT,
--    2 en UPDATE) NE SONT PAS fusionnées. Elles ne sont pas équivalentes, et
--    les fusionner en une seule expression forcerait `anon` à évaluer
--    `is_admin()` sur le chemin public le plus chaud du site. Le lint
--    `multiple_permissive_policies` de Supabase reste donc actif ici : c'est
--    un compromis assumé, pas un oubli.
-- ============================================================================
