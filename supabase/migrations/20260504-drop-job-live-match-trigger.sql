-- LesCordistes — Suppression du trigger SQL on_job_live_match_email
-- 2026-05-04
--
-- Contexte : private.trigger_on_job_live_match() (défini dans
-- supabase-email-triggers.sql) envoyait un email 'match-job' à chaque pro
-- dont le département matchait, lors d'un UPDATE status pending→live.
--
-- Problèmes :
--   1. Ne fire QUE sur UPDATE pending→live → les missions admin créées
--      directement en 'live' (INSERT) ne déclenchent rien.
--   2. Pas de déduplication : si une mission est ré-approuvée plusieurs
--      fois (rejected→pending→live), spam garanti.
--   3. Pas de batch : N missions = N emails par pro.
--   4. Pas d'unsubscribe RGPD-compliant.
--   5. Doublons garantis avec pro-alerts-cron (qui couvre maintenant les 2
--      sources : souscriptions explicites /jobs + auto depuis
--      profiles.intervention_zones via la migration
--      20260504-pro-alerts-auto-from-profile-zones.sql).
--
-- Décision : source unique = pro-alerts-cron (toutes les 30 min).
-- - Délai max 30 min vs instantané (acceptable pour des alertes mission).
-- - Dédup native via pro_alert_sends (subscription_id, job_id).
-- - Batch : 1 email avec N missions max par pro.
-- - Unsubscribe RGPD via token HMAC signé.
-- - Couvre INSERT direct (admin) ET UPDATE pending→live (client).
--
-- À exécuter MANUELLEMENT dans Supabase SQL Editor.

DROP TRIGGER IF EXISTS on_job_live_match_email ON jobs;
DROP FUNCTION IF EXISTS private.trigger_on_job_live_match();

-- Vérification : ne doit retourner aucune ligne
SELECT tgname, tgrelid::regclass AS table
FROM pg_trigger
WHERE tgname = 'on_job_live_match_email';

SELECT proname
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'private' AND p.proname = 'trigger_on_job_live_match';
