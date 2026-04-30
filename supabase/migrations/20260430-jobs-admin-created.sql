-- LesCordistes — Jobs créés manuellement par l'admin (suite à un appel / mail)
-- 2026-04-30
--
-- Objectif :
--   - Permettre à l'admin de poster un job "au nom" d'un client qui a appelé
--     ou écrit, sans que ce client reçoive les emails automatiques (welcome,
--     freshness J+5, etc.). Le seul mail qu'il recevra : quand un pro débloque
--     son lead.
--   - Lier optionnellement le job créé à un contact_requests source
--     (conversion d'un message rapide / demande de rappel en mission).
--
-- À exécuter MANUELLEMENT dans Supabase SQL Editor.

-- ── jobs.admin_created ──────────────────────────────────────────────────────
ALTER TABLE jobs
    ADD COLUMN IF NOT EXISTS admin_created boolean NOT NULL DEFAULT false;

ALTER TABLE jobs
    ADD COLUMN IF NOT EXISTS admin_notes text;

CREATE INDEX IF NOT EXISTS idx_jobs_admin_created
    ON jobs (admin_created)
    WHERE admin_created = true;

COMMENT ON COLUMN jobs.admin_created IS
    'true si la mission a été postée manuellement depuis l''admin (suite à un appel téléphonique ou un email du client). Ces jobs ne déclenchent pas les emails automatiques au client (welcome, freshness J+5).';

COMMENT ON COLUMN jobs.admin_notes IS
    'Notes internes (qui a passé l''appel, contexte, dispo client). Jamais affiché côté public.';

-- ── contact_requests.converted_to_job_id ────────────────────────────────────
ALTER TABLE contact_requests
    ADD COLUMN IF NOT EXISTS converted_to_job_id uuid REFERENCES jobs(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_contact_requests_converted
    ON contact_requests (converted_to_job_id)
    WHERE converted_to_job_id IS NOT NULL;

COMMENT ON COLUMN contact_requests.converted_to_job_id IS
    'Si la demande a été convertie en mission par l''admin, id du job créé.';

-- ── Vérification ────────────────────────────────────────────────────────────
SELECT
    'jobs.admin_created' AS check, count(*) AS rows
FROM information_schema.columns
WHERE table_name = 'jobs' AND column_name = 'admin_created'
UNION ALL
SELECT 'jobs.admin_notes', count(*)
FROM information_schema.columns
WHERE table_name = 'jobs' AND column_name = 'admin_notes'
UNION ALL
SELECT 'contact_requests.converted_to_job_id', count(*)
FROM information_schema.columns
WHERE table_name = 'contact_requests' AND column_name = 'converted_to_job_id';
