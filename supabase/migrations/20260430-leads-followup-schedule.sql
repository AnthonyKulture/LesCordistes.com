-- LesCordistes — pg_cron schedule pour leads-followup-cron
-- 2026-04-30
--
-- ⚠️ À exécuter MANUELLEMENT dans Supabase SQL Editor APRÈS avoir :
--   1. Appliqué 20260430-leads-followup.sql (colonnes followup_*)
--   2. Déployé l'edge function avec --no-verify-jwt :
--        npx supabase functions deploy leads-followup-cron --no-verify-jwt --project-ref esvnvxkbnhvxpnlhyjsw
--
-- Schedule : toutes les 5 minutes.
-- Le secret CRON est lu depuis Supabase Vault (créé par
-- 20260427-jobs-freshness-cron-schedule.sql).

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Nettoyer un éventuel job précédent (idempotence)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'leads-followup-cron') THEN
        PERFORM cron.unschedule('leads-followup-cron');
    END IF;
END $$;

-- Planifier toutes les 5 min
SELECT cron.schedule(
    'leads-followup-cron',
    '*/5 * * * *',
    $$
    SELECT net.http_post(
        url     := 'https://esvnvxkbnhvxpnlhyjsw.supabase.co/functions/v1/leads-followup-cron',
        headers := jsonb_build_object(
            'Content-Type',  'application/json',
            'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_secret')
        )
    );
    $$
);

-- Vérification
SELECT jobname, schedule, active FROM cron.job WHERE jobname = 'leads-followup-cron';
