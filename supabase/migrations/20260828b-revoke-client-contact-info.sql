-- ============================================================================
-- ÉTAPE B/2 — SÉCURITÉ : fermeture de la fuite `jobs.client_contact_info`
--
-- ⚠ PRÉREQUIS : la migration 20260828a (RPC) doit être passée ET le front
--   correspondant déployé en production. Lancer ce fichier avant le déploiement
--   du front casserait les pages missions (le code en prod fait encore
--   select('*') sur jobs, qui échouera avec "permission denied for column").
--
-- Constat (28/08/2026) : la colonne était lisible par n'importe quel visiteur
-- via l'API REST (`/rest/v1/jobs?select=client_contact_info`) avec la clé anon.
-- La RLS filtre les LIGNES, jamais les COLONNES : la policy publique sur `jobs`
-- donnait donc accès aux nom/email/téléphone de tous les clients.
-- Le gating existant (`canViewContact` dans JobDetail/JobSidebar) était purement
-- cosmétique — les données transitaient toujours jusqu'au navigateur.
--
-- Correctif : révoquer le SELECT au niveau colonne pour anon/authenticated, et
-- exposer les coordonnées uniquement via un RPC qui vérifie l'autorisation
-- (propriétaire de la mission · admin · pro ayant débloqué le lead).
--
-- Non-cassant : `service_role` (routes API serveur, crons, Edge Functions)
-- conserve un accès complet — il contourne de toute façon RLS et grants.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Révoquer la lecture des colonnes sensibles pour les rôles publics
-- ---------------------------------------------------------------------------
-- Postgres n'a pas de "REVOKE SELECT sur une colonne" tant qu'un grant
-- table-level existe : il faut retirer le SELECT global puis le re-accorder
-- colonne par colonne.

REVOKE SELECT ON public.jobs FROM anon, authenticated;

GRANT SELECT (
    id, slug, title, description, category, type, client_type,
    location_city, location_address, location_department,
    height_meters, budget_min, budget_max, deadline, photos_url,
    status, rejection_reason, latitude, longitude,
    created_by, admin_created,
    internal_reference, structure_type, required_level, required_habilitations,
    secondary_trades, equipment_management, specific_equipment,
    start_date, duration_days, work_night_weekend, contract_type,
    daily_rate, security_plan_confirmed,
    moderated_at, moderated_by, credit_cost,
    revalidation_email_sent_at, last_validated_at, expired_at,
    created_at, updated_at,
    -- Dérivée de client_contact_info (migration 20260828a) : expose le seul
    -- booléen nécessaire au score qualité, sans révéler le JSONB source.
    client_has_company
) ON public.jobs TO anon, authenticated;

-- `client_contact_info` et `admin_notes` sont volontairement exclus.

-- Les écritures restent inchangées (le wizard insère client_contact_info).
GRANT INSERT, UPDATE ON public.jobs TO authenticated;
GRANT INSERT ON public.jobs TO anon;

-- Les RPC d'accès contrôlé (get_job_contact / get_job_contacts) sont créées
-- par la migration 20260828a — vérifier qu'elles existent avant de continuer :
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_job_contact')
    OR NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_job_contacts') THEN
        RAISE EXCEPTION
            'Migration 20260828a manquante : lancer d''abord 20260828a-add-job-contact-rpc.sql';
    END IF;
END $$;

COMMIT;

-- ============================================================================
-- VÉRIFICATION (à lancer après le COMMIT)
-- ============================================================================
-- 1) En anon, la colonne doit être refusée :
--      BEGIN; SET LOCAL role anon;
--      SELECT client_contact_info FROM jobs LIMIT 1;   -- ERROR: permission denied
--      ROLLBACK;
--
-- 2) Les colonnes publiques doivent continuer de passer :
--      BEGIN; SET LOCAL role anon;
--      SELECT id, title, location_city FROM jobs WHERE status = 'live' LIMIT 1;  -- OK
--      ROLLBACK;
--
-- 3) Depuis l'extérieur (doit renvoyer une erreur 42501, plus les coordonnées) :
--      curl "https://<ref>.supabase.co/rest/v1/jobs?select=client_contact_info&limit=1" \
--           -H "apikey: <ANON_KEY>" -H "Authorization: Bearer <ANON_KEY>"
--
-- ROLLBACK d'urgence (réouvre la faille — uniquement si le front casse) :
--      GRANT SELECT ON public.jobs TO anon, authenticated;
-- ============================================================================
