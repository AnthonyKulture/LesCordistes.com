-- ============================================================================
-- 20260904a — COMPTEUR DE DÉBLOCAGES D'UNE MISSION (get_job_unlock_count)
--
-- ── CONSTAT ────────────────────────────────────────────────────────────────
-- La fiche mission affiche « X/5 pros ont déjà débloqué ce lead ». Le chiffre
-- venait d'un COUNT côté navigateur :
--     supabase.from('unlocked_leads').select('*', { count: 'exact', head: true })
--             .eq('job_id', …)
-- Or la policy de SELECT « View lead activations » (20260828d) ne rend que :
--   · les lignes du pro appelant           (auth.uid() = pro_id)
--   · toutes les lignes pour un admin      (is_admin())
--   · les lignes des missions du client    (job_id IN (missions créées par lui))
-- Un pro qui n'a PAS encore débloqué la mission ne voit donc AUCUNE ligne :
-- le compteur affichait invariablement 0/5 — un signal de confiance faux,
-- affiché précisément au moment de la décision d'achat.
--
-- Conséquence en cascade : `isFull` (JobDetail) valant toujours false, l'état
-- « Mission saturée » de JobSidebar était INATTEIGNABLE. Le plafond de 5 pros
-- ne se manifestait qu'au clic, sous forme d'exception SQL brute levée par
-- unlock_lead (ERRCODE P0003) — après que le pro a cru pouvoir acheter.
--
-- ── CORRECTIF ──────────────────────────────────────────────────────────────
-- Une fonction SECURITY DEFINER qui traverse la RLS pour rendre LE NOMBRE, et
-- rien d'autre : aucun pro_id, aucune date, aucune identité. La surface
-- d'information ajoutée se limite à un entier borné par le plafond métier.
--
-- POURQUOI `SET search_path = public, pg_temp` : obligatoire sur toute fonction
-- SECURITY DEFINER. Si `pg_temp` n'est pas listé explicitement, Postgres le
-- parcourt quand même — et EN PREMIER. Un appelant disposant du droit TEMPORARY
-- (accordé à PUBLIC par défaut) pourrait créer `CREATE TEMP TABLE
-- unlocked_leads (job_id uuid)` et détourner la résolution du nom. Listé en
-- DERNIER + table schéma-qualifiée `public.unlocked_leads` dans le corps :
-- double protection, même doctrine que 20260828d et 20260828h.
--
-- ── DROITS — LE PIÈGE SUPABASE ─────────────────────────────────────────────
-- `REVOKE ... FROM PUBLIC` seul NE VERROUILLE RIEN : Supabase pose des DEFAULT
-- PRIVILEGES qui accordent EXECUTE à anon, authenticated et service_role sur
-- toute nouvelle fonction du schéma public. Ces grants explicites survivent au
-- REVOKE du pseudo-rôle PUBLIC (constat de 20260828l, vérifié en base : 4 RPC
-- admin répondaient 200 à la clé anon). On révoque donc NOMMÉMENT anon et
-- authenticated, puis on ré-accorde explicitement à authenticated.
--
-- Pourquoi anon reste exclu : le compteur n'est affiché qu'à un pro connecté,
-- et une clé anon publique permettrait de balayer toutes les missions pour
-- reconstituer le volume de déblocages du site. Le front n'appelle pas la
-- fonction tant qu'il n'y a pas de session (voir JobDetail.tsx).
--
-- ── IDEMPOTENCE ────────────────────────────────────────────────────────────
-- CREATE OR REPLACE + REVOKE/GRANT (déclaratifs) : rejouable à volonté.
-- 100 % ADDITIVE — aucune policy, aucune table, aucun grant existant touché.
-- Le front fonctionne AVANT (repli sur le COUNT direct) comme APRÈS.
-- ============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.get_job_unlock_count(p_job_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT count(*)::int
    FROM public.unlocked_leads ul
    WHERE ul.job_id = p_job_id;
$$;

REVOKE EXECUTE ON FUNCTION public.get_job_unlock_count(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_job_unlock_count(uuid) TO authenticated, service_role;

COMMENT ON FUNCTION public.get_job_unlock_count(uuid) IS
    'Nombre de pros ayant débloqué une mission (0..N). Traverse la RLS de unlocked_leads, '
    'qui ne rend au pro appelant que ses propres lignes. Ne renvoie AUCUNE identité. '
    'Alimente le compteur « X/5 » et l''état « Mission saturée » de la fiche mission. '
    'Réservé à authenticated + service_role (anon exclu : évite le balayage du volume global).';

COMMIT;

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================
-- 1) Droits effectifs (attendu : anon = f, authenticated = t, service_role = t)
--      SELECT has_function_privilege('anon',          p.oid, 'EXECUTE') AS anon_peut,
--             has_function_privilege('authenticated', p.oid, 'EXECUTE') AS auth_peut,
--             has_function_privilege('service_role',  p.oid, 'EXECUTE') AS service_peut
--      FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
--      WHERE n.nspname = 'public' AND p.proname = 'get_job_unlock_count';
--
-- 2) De l'extérieur, avec la clé ANON (doit renvoyer 42501 « permission denied ») :
--      curl -X POST "https://<ref>.supabase.co/rest/v1/rpc/get_job_unlock_count" \
--           -H "apikey: <ANON>" -H "Authorization: Bearer <ANON>" \
--           -H "Content-Type: application/json" -d '{"p_job_id":"<uuid>"}'
--
-- 3) Le chiffre est bien le total, pas la vue RLS de l'appelant :
--      BEGIN;
--        SELECT public.get_job_unlock_count('<uuid-job>');            -- total réel
--        SET LOCAL role authenticated;
--        SET LOCAL request.jwt.claims = '{"sub":"<uuid-pro-sans-deblocage>"}';
--        SELECT public.get_job_unlock_count('<uuid-job>');            -- MÊME chiffre
--        SELECT count(*) FROM public.unlocked_leads WHERE job_id = '<uuid-job>'; -- 0 (RLS)
--      ROLLBACK;
--
-- 4) Non-régression front :
--    · pro sans déblocage sur une mission déjà prise par 5 pros → « Mission saturée »
--      s'affiche AVANT le clic, le bouton de déblocage n'est plus proposé
--    · pro sur une mission à 0 déblocage → formulation sans chiffre
--      (« Vous seriez le premier… »), jamais « 0/5 »
--    · visiteur anonyme → aucun appel à la fonction, aucune erreur console
-- ============================================================================
