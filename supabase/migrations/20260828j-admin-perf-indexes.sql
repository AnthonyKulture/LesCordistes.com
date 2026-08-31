-- ============================================================================
-- Index complémentaires ciblés sur les écrans ADMIN
--
-- Chaque index est justifié par une requête RÉELLE du code, citée en commentaire.
-- Complète 20260828c (index applicatifs) : ces tris-là n'y étaient pas couverts.
-- ============================================================================

-- 1) Liste des missions par statut, triée par date
-- Requête : src/app/api/ops/jobs/route.ts — .eq('status', X).order('created_at', desc).limit(100)
--           src/app/admin/missions/jobsQuery.ts — idem côté Server Component
-- Sans index composite, le planner doit matérialiser TOUTES les lignes du statut
-- puis les trier : le LIMIT 100 n'est pas poussé dans le parcours. Avec (status,
-- created_at DESC), le préfixe est une égalité et le tri suit l'ordre de l'index :
-- la lecture s'arrête à la 100e ligne.
CREATE INDEX IF NOT EXISTS idx_jobs_status_created_at
    ON public.jobs (status, created_at DESC);

-- 2) Derniers déblocages du dashboard
-- Requête : src/lib/ops/fetchOpsStats.ts — unlocked_leads.order('unlocked_at', desc).limit(15)
-- Aucun index n'existe sur unlocked_at : Seq Scan complet + top-N heapsort à
-- CHAQUE ouverture du dashboard. C'est la table qui croît le plus vite du projet.
CREATE INDEX IF NOT EXISTS idx_unlocked_leads_unlocked_at
    ON public.unlocked_leads (unlocked_at DESC);

-- 3) Dernières erreurs d'envoi marketing
-- Requête : src/app/admin/marketing/page.tsx — .eq('status','failed').order('created_at', desc).limit(5)
-- Les index existants sont préfixés par campaign_id, qui n'est pas contraint ici :
-- un btree composite n'est descendable que si sa colonne de tête l'est. Index
-- partiel car seul le statut 'failed' est interrogé de cette façon.
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_failed_recent
    ON public.marketing_campaign_recipients (created_at DESC)
    WHERE status = 'failed';

-- 4) Destinataires de test
-- Requête : src/app/api/admin/marketing/contacts/test-recipients/route.ts
--           .eq('metadata->>is_test_recipient', 'true')
-- `metadata` n'a aucun index (ni GIN ni expression) : Seq Scan de marketing_contacts.
CREATE INDEX IF NOT EXISTS idx_marketing_contacts_test
    ON public.marketing_contacts ((metadata ->> 'is_test_recipient'))
    WHERE metadata ->> 'is_test_recipient' = 'true';

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================
--   SELECT indexname FROM pg_indexes WHERE indexname IN (
--     'idx_jobs_status_created_at', 'idx_unlocked_leads_unlocked_at',
--     'idx_campaign_recipients_failed_recent', 'idx_marketing_contacts_test');
--
-- Le plan doit montrer un Index Scan sans Sort :
--   EXPLAIN ANALYZE SELECT * FROM jobs WHERE status='pending'
--   ORDER BY created_at DESC LIMIT 100;
--
-- Usage après quelques jours (idx_scan doit être > 0) :
--   SELECT indexrelname, idx_scan FROM pg_stat_user_indexes
--   WHERE indexrelname LIKE 'idx_jobs_status_created%'
--      OR indexrelname LIKE 'idx_unlocked_leads_unlocked%';
-- ============================================================================
