-- ============================================================================
-- 20260904c — Marqueur d'envoi de l'email d'expiration de mission
-- 2026-09-04
--
-- CONSTAT : `supabase/functions/jobs-freshness-cron/index.ts` relance le client
-- à J+5 (« votre mission est-elle toujours d'actualité ? ») puis bascule la
-- mission en `status = 'expired'` à J+15 SANS AUCUN EMAIL. Un client dont la
-- mission meurt n'apprend jamais rien : il ne republie pas, ne revient pas, et
-- ne recommande pas la plateforme.
--
-- CE FICHIER ne fait qu'ouvrir la place en base. L'envoi lui-même est ajouté
-- dans le cron (étape C) + le template `job-expired` de la Edge Function
-- send-email. Les deux sont inertes tant que cette colonne n'existe pas :
-- LANCER CETTE MIGRATION AVANT de déployer le cron.
--
-- Idempotent et rejouable.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Marqueur d'envoi — garantit « au plus un email d'expiration par mission »
-- ---------------------------------------------------------------------------
-- Même convention que `revalidation_email_sent_at` (migration 20260427) : le
-- cron pose l'horodatage APRÈS un envoi réussi, et aussi quand la mission n'a
-- aucune adresse exploitable — sinon la ligne serait re-sélectionnée à chaque
-- run jusqu'à la fin des temps.
ALTER TABLE public.jobs
    ADD COLUMN IF NOT EXISTS expiration_email_sent_at TIMESTAMPTZ NULL;

COMMENT ON COLUMN public.jobs.expiration_email_sent_at IS
'Horodatage de l''email « mission archivée » (cron jobs-freshness, étape C). '
'NULL = jamais envoyé. Posé même sans destinataire exploitable, pour ne pas '
'ré-élire la ligne à chaque run. Migration 20260904c.';

-- ---------------------------------------------------------------------------
-- 2. Backfill défensif — aucun email rétroactif
-- ---------------------------------------------------------------------------
-- Sans ce backfill, le premier run du cron enverrait un « votre mission a été
-- archivée » à TOUTES les missions expirées depuis avril 2026. On neutralise
-- l'historique en le marquant comme déjà traité.
-- (Le cron applique en plus une fenêtre de fraîcheur de 7 jours sur
-- `expired_at` — ceinture et bretelles, et filet si cette migration est jouée
-- sur une base restaurée.)
-- Fenêtre FIXE, pas « toutes les expirées à ce jour » : rejouée dans un mois,
-- la seconde forme neutraliserait les missions expirées entre-temps, que le cron
-- n'aurait alors jamais notifiées. Avec une borne datée, un rejeu est sans effet.
UPDATE public.jobs
SET    expiration_email_sent_at = COALESCE(expired_at, updated_at, NOW())
WHERE  status = 'expired'
  AND  expiration_email_sent_at IS NULL
  AND  COALESCE(expired_at, updated_at, created_at) < TIMESTAMPTZ '2026-09-05 00:00:00+00';

-- ---------------------------------------------------------------------------
-- 3. Index partiel — le cron ne lit que les expirées jamais notifiées
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_jobs_expiration_email_pending
    ON public.jobs (expired_at)
    WHERE status = 'expired' AND expiration_email_sent_at IS NULL;

-- ---------------------------------------------------------------------------
-- 4. Grants — cohérence avec les colonnes sœurs
-- ---------------------------------------------------------------------------
-- 20260828b a remplacé le SELECT table-level par des grants colonne par
-- colonne ; `revalidation_email_sent_at`, `last_validated_at` et `expired_at`
-- y figurent. On aligne la nouvelle colonne (aucune donnée personnelle).
-- Redondant mais inoffensif si 20260828b n'a jamais été jouée.
GRANT SELECT (expiration_email_sent_at) ON public.jobs TO anon, authenticated;

COMMIT;

-- ============================================================================
-- VÉRIFICATION (après COMMIT)
-- ============================================================================
-- 1) La colonne existe et l'historique est neutralisé :
--
--   SELECT COUNT(*) FILTER (WHERE expiration_email_sent_at IS NULL) AS a_notifier,
--          COUNT(*)                                                 AS expirees
--   FROM public.jobs WHERE status = 'expired';
--   -- attendu juste après la migration : a_notifier = 0.
--
-- 2) L'index partiel est bien là :
--
--   SELECT indexname FROM pg_indexes
--   WHERE tablename = 'jobs' AND indexname = 'idx_jobs_expiration_email_pending';
--
-- 3) Après le prochain run du cron (missions expirées du jour) :
--
--   SELECT id, title, expired_at, expiration_email_sent_at
--   FROM public.jobs WHERE status = 'expired'
--   ORDER BY expired_at DESC LIMIT 10;
-- ============================================================================
