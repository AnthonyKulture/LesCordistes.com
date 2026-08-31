-- ============================================================================
-- SÉCURITÉ — Verrouillage des RPC admin exposés à la clé anon
--
-- CONSTAT (31/08/2026, vérifié en direct sur la base) : les 4 RPC admin
-- répondaient HTTP 200 à la clé anon publique :
--   admin_dashboard_stats · admin_credits_agg · admin_sum_transactions ·
--   admin_top_live_cities
-- Exposant : agrégats de crédits, sommes de transactions, compteurs, top villes,
-- et via admin_dashboard_stats le journal admin_actions (payload compris) et
-- l'identité des derniers déblocages.
--
-- CAUSE : Supabase pose des DEFAULT PRIVILEGES qui accordent EXECUTE à anon,
-- authenticated et service_role sur TOUTE nouvelle fonction du schéma public.
-- Le pattern « REVOKE ALL ... FROM PUBLIC » utilisé par 20260610 puis 20260828k
-- ne retire QUE le grant du pseudo-rôle PUBLIC — les grants explicites posés
-- par les default privileges sur anon/authenticated survivent.
-- Preuve inverse : get_job_contact (20260828a) révoquait explicitement
-- anon/authenticated et répond bien 42501 en anonyme.
--
-- CORRECTIF : révoquer anon + authenticated sur toutes les fonctions admin_*
-- présentes en base (balayage pg_proc : couvre aussi celles qu'on aurait
-- oubliées ou qui seraient créées entre l'écriture et l'exécution de ce fichier).
-- service_role conserve EXECUTE — c'est le seul appelant légitime
-- (createSupabaseAdminClient, derrière requireAdmin/getAdminIdentity).
--
-- PÉRIMÈTRE VOLONTAIREMENT LIMITÉ au préfixe admin_ : unlock_lead, is_admin,
-- get_job_contact(s), find_pro_alert_matches, etc. ont chacun leur propre
-- politique de droits, correcte, et ne doivent pas être touchés.
-- ============================================================================

BEGIN;

DO $lock$
DECLARE
    r record;
    v_count int := 0;
BEGIN
    FOR r IN
        SELECT p.oid::regprocedure AS sig
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public'
          AND p.proname LIKE 'admin\_%'
    LOOP
        EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', r.sig);
        EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', r.sig);
        v_count := v_count + 1;
        RAISE NOTICE 'verrouillée : %', r.sig;
    END LOOP;
    RAISE NOTICE '% fonction(s) admin_* verrouillée(s).', v_count;
END $lock$;

COMMIT;

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================
-- 1) Aucune fonction admin_* ne doit plus être exécutable par anon/authenticated :
--      SELECT p.oid::regprocedure AS fonction,
--             has_function_privilege('anon', p.oid, 'EXECUTE')          AS anon_peut,
--             has_function_privilege('authenticated', p.oid, 'EXECUTE') AS auth_peut,
--             has_function_privilege('service_role', p.oid, 'EXECUTE')  AS service_peut
--      FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
--      WHERE n.nspname = 'public' AND p.proname LIKE 'admin\_%';
--      → anon_peut = f, auth_peut = f, service_peut = t sur toutes les lignes.
--
-- 2) De l'extérieur, avec la clé anon (doit renvoyer 42501) :
--      curl -X POST "https://<ref>.supabase.co/rest/v1/rpc/admin_credits_agg" \
--           -H "apikey: <ANON>" -H "Authorization: Bearer <ANON>" \
--           -H "Content-Type: application/json" -d '{}'
--
-- 3) Non-régression : le dashboard /admin doit toujours afficher ses KPIs
--    (fetchOpsStats passe par service_role, non affecté).
-- ============================================================================
