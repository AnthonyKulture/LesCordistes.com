-- LesCordistes.com — pg_cron schedule for jobs freshness
-- 2026-04-27
--
-- ⚠️ À exécuter MANUELLEMENT dans Supabase SQL Editor après avoir :
--   1. Déployé la fonction edge : `npx supabase functions deploy jobs-freshness-cron --project-ref esvnvxkbnhvxpnlhyjsw`
--   2. Configuré les secrets edge : REVALIDATION_SECRET, CRON_SECRET (32+ chars chacun)
--      `npx supabase secrets set REVALIDATION_SECRET=xxx CRON_SECRET=xxx --project-ref esvnvxkbnhvxpnlhyjsw`
--
-- ⚠️ AVANT d'exécuter ce fichier : remplace `__CRON_SECRET__` (ligne ~30) par ta vraie valeur.
--
-- Le cron tape l'edge function chaque jour à 06:00 UTC.
-- Le secret est stocké dans Supabase Vault pour ne pas apparaître en clair dans cron.job.

-- 1) Activer les extensions nécessaires (idempotent)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2) Stocker le CRON_SECRET dans Supabase Vault
--    (idempotent — supprime l'ancien si existe, puis recrée)
DO $$
DECLARE
  v_secret_id UUID;
BEGIN
  SELECT id INTO v_secret_id FROM vault.secrets WHERE name = 'cron_secret';
  IF v_secret_id IS NOT NULL THEN
    PERFORM vault.update_secret(v_secret_id, '1e8a3cbadf9481bc818954ba25d8e3d0995887410667d7b91c380ba66aa51c86', 'cron_secret');
  ELSE
    PERFORM vault.create_secret('1e8a3cbadf9481bc818954ba25d8e3d0995887410667d7b91c380ba66aa51c86', 'cron_secret');
  END IF;
END $$;

-- 3) Nettoyer un éventuel job précédent du même nom
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'jobs-freshness-cron') THEN
    PERFORM cron.unschedule('jobs-freshness-cron');
  END IF;
END $$;

-- 4) Planifier le cron (06:00 UTC quotidien)
SELECT cron.schedule(
  'jobs-freshness-cron',
  '0 6 * * *',
  $$
  SELECT net.http_post(
    url     := 'https://esvnvxkbnhvxpnlhyjsw.supabase.co/functions/v1/jobs-freshness-cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_secret')
    )
  );
  $$
);

-- 5) Vérification
SELECT jobname, schedule, active FROM cron.job WHERE jobname = 'jobs-freshness-cron';
SELECT name, created_at FROM vault.secrets WHERE name = 'cron_secret';
