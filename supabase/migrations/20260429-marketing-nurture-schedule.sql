-- LesCordistes — pg_cron schedule pour marketing-nurture-cron
-- 2026-04-29
--
-- ⚠️ À exécuter MANUELLEMENT dans Supabase SQL Editor APRÈS avoir :
--   1. Appliqué 20260429-marketing.sql et 20260429-marketing-nurture.sql
--   2. Déployé l'edge function avec --no-verify-jwt :
--        npx supabase functions deploy marketing-nurture-cron --no-verify-jwt --project-ref esvnvxkbnhvxpnlhyjsw
--   3. Configuré les secrets edge (CRON_SECRET réutilise celui existant ;
--      MARKETING_UNSUBSCRIBE_SECRET déjà en place sur Vercel — le copier sur Supabase) :
--        npx supabase secrets set MARKETING_UNSUBSCRIBE_SECRET=xxx --project-ref esvnvxkbnhvxpnlhyjsw
--
-- Schedule : tous les jours à 09:00 UTC (= 11h Paris été / 10h hiver).
-- Le secret CRON est lu depuis Supabase Vault (créé par
-- 20260427-jobs-freshness-cron-schedule.sql).

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Nettoyer un éventuel job précédent
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'marketing-nurture-cron') THEN
        PERFORM cron.unschedule('marketing-nurture-cron');
    END IF;
END $$;

-- Planifier (09:00 UTC quotidien)
SELECT cron.schedule(
    'marketing-nurture-cron',
    '0 9 * * *',
    $$
    SELECT net.http_post(
        url     := 'https://esvnvxkbnhvxpnlhyjsw.supabase.co/functions/v1/marketing-nurture-cron',
        headers := jsonb_build_object(
            'Content-Type',  'application/json',
            'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_secret')
        )
    );
    $$
);

-- Vérification
SELECT jobname, schedule, active FROM cron.job WHERE jobname = 'marketing-nurture-cron';
