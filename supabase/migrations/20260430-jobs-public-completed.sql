-- LesCordistes — Étendre la visibilité publique des missions
-- 2026-04-30
--
-- Objectif : afficher aussi les missions 'completed' (terminées explicitement
-- par le client/admin) en plus de 'live' et 'expired'. Renforce la preuve
-- sociale sur /jobs pour les visiteurs anonymes ET les pros.
--
-- L'accès aux coordonnées du client (client_contact_info) reste gated par
-- la table unlocked_leads — pas d'exposition de données privées.
--
-- À exécuter MANUELLEMENT dans Supabase SQL Editor.

DROP POLICY IF EXISTS "Jobs are viewable by everyone" ON jobs;

CREATE POLICY "Jobs are viewable by everyone"
    ON jobs FOR SELECT
    USING (status IN ('live', 'expired', 'completed'));

-- Vérification
SELECT polname, polcmd, pg_get_expr(polqual, polrelid) AS qual
FROM pg_policy
WHERE polrelid = 'jobs'::regclass
  AND polname = 'Jobs are viewable by everyone';
