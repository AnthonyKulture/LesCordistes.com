-- Diagnostic pourquoi find_pro_alert_matches retourne 0 lignes.
-- À exécuter dans Supabase Dashboard → SQL Editor.

-- 1. Vérifier que la mission existe, est live, et a un département
SELECT id, title, status, location_department, admin_created, created_at
FROM jobs
ORDER BY created_at DESC
LIMIT 5;

-- 2. Combien de souscriptions actives existent ?
SELECT COUNT(*) AS total_subs,
       COUNT(*) FILTER (WHERE unsubscribed_at IS NULL AND marketing_opt_in) AS active_subs
FROM pro_alert_subscriptions;

-- 3. Les souscriptions actives + leurs départements suivis
SELECT id, email, departments, confirmed_at, unsubscribed_at, marketing_opt_in, total_alerts_sent
FROM pro_alert_subscriptions
WHERE unsubscribed_at IS NULL AND marketing_opt_in
ORDER BY created_at DESC
LIMIT 20;

-- 4. Test direct du RPC (ce que le cron voit)
SELECT * FROM find_pro_alert_matches(12);

-- 5. Bonus : pros qui ont le dpt dans leur profil (mais sans avoir souscrit)
-- Remplacer 'XX' par le code dpt de ta mission (ex. '06', '75', '69')
SELECT p.id, p.email, p.intervention_zones,
       EXISTS (SELECT 1 FROM pro_alert_subscriptions s WHERE lower(s.email) = lower(p.email) AND s.unsubscribed_at IS NULL) AS has_alert_sub
FROM profiles p
WHERE 'XX' = ANY(p.intervention_zones)
  AND p.role = 'pro';
