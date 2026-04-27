-- LesCordistes.com — Missions freshness system
-- 2026-04-27
--
-- Adds:
--   - 'expired' status (auto-archive at J+15)
--   - revalidation_email_sent_at (cron mark to avoid double-emailing)
--   - last_validated_at (set when client confirms via email link)
--   - expired_at (set by cron when status flips to expired)
--
-- Logic:
--   - J+10 cron sends "still active?" email to client (registered + guest)
--   - Client clicks → /api/jobs/validate?token=xxx → last_validated_at=now()
--   - J+15 without revalidation → status='expired', removed from /jobs listing
--   - Re-revalidation: cron uses coalesce(last_validated_at, created_at) for J+10/J+15 window

-- 1) Étendre l'enum status pour inclure 'expired'
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_status_check;
ALTER TABLE jobs ADD CONSTRAINT jobs_status_check
  CHECK (status IN ('pending','live','rejected','completed','cancelled','expired'));

-- 2) Colonnes de revalidation
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS revalidation_email_sent_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS last_validated_at         TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS expired_at                TIMESTAMPTZ NULL;

-- 3) Index pour le cron (filtre status='live' seulement)
CREATE INDEX IF NOT EXISTS idx_jobs_freshness
  ON jobs (status, created_at)
  WHERE status = 'live';

-- 4) Vérification
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'last_validated_at'
  ) THEN
    RAISE EXCEPTION 'Migration failed: last_validated_at column not created';
  END IF;
END $$;
