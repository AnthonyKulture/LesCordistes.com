-- LesCordistes — pg_cron schedule pour pro-alerts-cron
-- 2026-05-01
--
-- ⚠️ À exécuter MANUELLEMENT dans Supabase SQL Editor APRÈS avoir :
--   1. Appliqué 20260501-pro-alert-subscriptions.sql
--   2. Déployé l'edge function avec --no-verify-jwt :
--        npx supabase functions deploy pro-alerts-cron --no-verify-jwt --project-ref esvnvxkbnhvxpnlhyjsw
--   3. Vérifié que CRON_SECRET et MARKETING_UNSUBSCRIBE_SECRET sont configurés
--      dans les secrets de l'edge runtime.
--
-- Schedule : toutes les 30 minutes (cohérent avec un délai d'alerte acceptable
-- pour les pros, sans bombarder Resend ni la base).

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'pro-alerts-cron') THEN
        PERFORM cron.unschedule('pro-alerts-cron');
    END IF;
END $$;

SELECT cron.schedule(
    'pro-alerts-cron',
    '*/30 * * * *',
    $$
    SELECT net.http_post(
        url     := 'https://esvnvxkbnhvxpnlhyjsw.supabase.co/functions/v1/pro-alerts-cron',
        headers := jsonb_build_object(
            'Content-Type',  'application/json',
            'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_secret')
        )
    );
    $$
);

SELECT jobname, schedule, active FROM cron.job WHERE jobname = 'pro-alerts-cron';
