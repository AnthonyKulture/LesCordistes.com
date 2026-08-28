-- ============================================================================
-- ÉTAPE A/2 — Création des RPC d'accès contrôlé aux coordonnées client.
--
-- 100 % NON-CASSANT : cette migration ne fait qu'AJOUTER deux fonctions.
-- Rien n'est révoqué ici, le code déjà en production continue de fonctionner
-- à l'identique. À lancer EN PREMIER, avant le déploiement du front.
--
-- Séquence de déploiement sans coupure :
--   1. Lancer CETTE migration (A)        → les RPC existent
--   2. Déployer le front (git push)      → le front lit les colonnes explicites
--                                          et les coordonnées via les RPC
--   3. Lancer la migration B             → REVOKE, la fuite est fermée
--
-- Faire B avant 2 casserait les pages missions (le front déployé fait encore
-- select('*')). Faire 2 avant A afficherait temporairement les coordonnées en
-- « chargement » pour les pros ayant débloqué un lead.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- Colonne dérivée `client_has_company`
-- ---------------------------------------------------------------------------
-- POURQUOI : `isClientVerified()` (src/lib/missionEnrichment.ts) accorde 12 points
-- de score qualité — et le badge « Client vérifié » — quand
-- `client_contact_info->>'company_name'` est renseigné. Une fois la colonne JSONB
-- révoquée (migration B), ce test renverrait TOUJOURS false côté navigateur :
-- toutes les missions de clients ayant une raison sociale perdraient leur badge,
-- sur le board comme sur la fiche détail. Régression visible et monétisée.
--
-- Une colonne générée expose le seul booléen nécessaire, sans rien révéler du
-- JSONB. Elle est créée ICI (migration additive, avant le déploiement du front)
-- pour que le code déployé puisse la sélectionner dès le premier hit.
ALTER TABLE public.jobs
    ADD COLUMN IF NOT EXISTS client_has_company boolean
    GENERATED ALWAYS AS (
        NULLIF(client_contact_info ->> 'company_name', '') IS NOT NULL
    ) STORED;

COMMENT ON COLUMN public.jobs.client_has_company IS
'Dérivée de client_contact_info->>company_name. Exposée publiquement pour le score '
'qualité, alors que le JSONB source est révoqué (migration 20260828b).';

-- ---------------------------------------------------------------------------
-- Coordonnées d'une mission — autorisé si : propriétaire · admin · lead débloqué
CREATE OR REPLACE FUNCTION public.get_job_contact(p_job_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT j.client_contact_info
    FROM public.jobs j
    WHERE j.id = p_job_id
      AND (
            j.created_by = (select auth.uid())
            OR EXISTS (
                SELECT 1 FROM public.profiles p
                WHERE p.id = (select auth.uid()) AND p.role = 'admin'
            )
            OR EXISTS (
                SELECT 1 FROM public.unlocked_leads ul
                WHERE ul.job_id = j.id AND ul.pro_id = (select auth.uid())
            )
      );
$$;

REVOKE ALL ON FUNCTION public.get_job_contact(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_job_contact(uuid) TO authenticated, service_role;

COMMENT ON FUNCTION public.get_job_contact(uuid) IS
    'Retourne jobs.client_contact_info si l''appelant est propriétaire, admin, ou a débloqué le lead. NULL sinon.';

-- Variante batch — évite un N+1 sur les listes (dashboard pro)
CREATE OR REPLACE FUNCTION public.get_job_contacts(p_job_ids uuid[])
RETURNS TABLE (job_id uuid, contact jsonb)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT j.id, j.client_contact_info
    FROM public.jobs j
    WHERE j.id = ANY(p_job_ids)
      AND (
            j.created_by = (select auth.uid())
            OR EXISTS (
                SELECT 1 FROM public.profiles p
                WHERE p.id = (select auth.uid()) AND p.role = 'admin'
            )
            OR EXISTS (
                SELECT 1 FROM public.unlocked_leads ul
                WHERE ul.job_id = j.id AND ul.pro_id = (select auth.uid())
            )
      );
$$;

REVOKE ALL ON FUNCTION public.get_job_contacts(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_job_contacts(uuid[]) TO authenticated, service_role;

COMMENT ON FUNCTION public.get_job_contacts(uuid[]) IS
    'Version batch de get_job_contact : ne renvoie que les missions autorisées pour l''appelant.';

COMMIT;

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================
-- Les fonctions existent :
--   SELECT proname FROM pg_proc WHERE proname IN ('get_job_contact','get_job_contacts');
--
-- En anon, l'exécution doit être refusée :
--   BEGIN; SET LOCAL role anon;
--   SELECT public.get_job_contact('<uuid-job>');   -- ERROR: permission denied
--   ROLLBACK;
-- ============================================================================
