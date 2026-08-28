-- ============================================================================
-- IDEMPOTENCE STRIPE — colonne dédiée + index UNIQUE partiel
--
-- Scindée de 20260828e (triggers) VOLONTAIREMENT : le garde-fou anti-doublons
-- ci-dessous lève une EXCEPTION si des double-créditations existent déjà. Tant
-- que les deux étaient dans la même transaction, cet échec annulait AUSSI les
-- correctifs de triggers, qui n'ont rien à voir avec Stripe. Séparées, chacune
-- réussit ou échoue pour ses propres raisons.
--
-- Indépendante de 20260828c/d/e : peut être jouée avant ou après, dans
-- n'importe quel ordre.
--
-- POURQUOI : src/app/api/webhook/route.ts déduplique avec
-- `.eq('description', 'Achat Stripe - Session ' + session.id)`. Aucun index ne
-- couvre `description` → Seq Scan sur credit_transactions à CHAQUE webhook,
-- sur le chemin critique du paiement (et Stripe rejoue ses webhooks).
-- Pire : `description` est un champ libre partagé avec les débits de leads et
-- les ajustements admin — l'unicité n'y est pas garantie.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- DIAGNOSTIC À LANCER AVANT (obligatoire — conditionne la réussite)
-- ----------------------------------------------------------------------------
-- Des doublons Stripe existent-ils déjà en base ?
--   SELECT substring(description FROM '^Achat Stripe - Session (.+)$') AS session,
--          COUNT(*) AS n
--   FROM public.credit_transactions
--   WHERE description LIKE 'Achat Stripe - Session %'
--   GROUP BY 1 HAVING COUNT(*) > 1;
--
-- Si cette requête renvoie des lignes, la migration ÉCHOUERA volontairement :
-- ce sont des double-créditations réelles à traiter (rembourser ou annuler la
-- ligne en trop) AVANT de créer l'index UNIQUE. Ne contourne pas ce garde-fou :
-- il révèle un bug de facturation, pas un problème de migration.
-- ----------------------------------------------------------------------------

BEGIN;

-- 1 — Colonne dédiée
ALTER TABLE public.credit_transactions
    ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

COMMENT ON COLUMN public.credit_transactions.stripe_session_id IS
'ID de session Stripe Checkout (cs_...). Clé d''idempotence du webhook. '
'NULL pour toute transaction non-Stripe. Migration 20260828f.';

-- 2 — Backfill depuis l'ancien format de description, pour que la lecture par
-- stripe_session_id retrouve aussi l'historique.
UPDATE public.credit_transactions
SET stripe_session_id = substring(description FROM '^Achat Stripe - Session (.+)$')
WHERE stripe_session_id IS NULL
  AND description LIKE 'Achat Stripe - Session %';

-- 3 — Garde-fou : refuser l'index UNIQUE si des doublons existent.
-- On échoue BRUYAMMENT plutôt que de masquer un double crédit accordé.
DO $$
DECLARE
    v_dups TEXT;
BEGIN
    SELECT string_agg(stripe_session_id || ' (x' || n || ')', ', ')
    INTO v_dups
    FROM (
        SELECT stripe_session_id, COUNT(*) AS n
        FROM public.credit_transactions
        WHERE stripe_session_id IS NOT NULL
        GROUP BY stripe_session_id
        HAVING COUNT(*) > 1
    ) d;

    IF v_dups IS NOT NULL THEN
        RAISE EXCEPTION 'Doublons Stripe detectes, index UNIQUE impossible : %. Traiter ces double-creditations puis relancer cette migration.', v_dups;
    END IF;
END $$;

-- 4 — Index UNIQUE partiel : sert à la fois la déduplication (lookup O(log n))
-- et la garantie d'unicité (le webhook peut s'appuyer sur l'erreur 23505 au
-- lieu d'un SELECT-puis-INSERT, qui est intrinsèquement racé).
-- Le prédicat `WHERE stripe_session_id IS NOT NULL` est indispensable : sans
-- lui, les milliers de lignes non-Stripe (NULL) seraient indexées et surtout
-- soumises à l'unicité.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_credit_transactions_stripe_session
    ON public.credit_transactions (stripe_session_id)
    WHERE stripe_session_id IS NOT NULL;

-- 5 — Index de secours sur `description`, pour la fenêtre de transition pendant
-- laquelle d'anciennes instances Vercel écrivent encore uniquement la description.
--
-- SUBTILITÉ PLANNER : un index partiel n'est utilisé que si le planner peut
-- PROUVER que le WHERE de la requête implique le prédicat de l'index.
-- PostgreSQL sait le faire pour des opérateurs d'une même famille btree, mais
-- PAS pour `~~` (LIKE) : `description = 'Achat Stripe - Session cs_x'`
-- n'implique PAS, pour le prouveur, `description LIKE 'Achat Stripe%'`.
-- => le patch TypeScript DOIT ajouter explicitement `.like('description',
--    'Achat Stripe%')` à côté du `.eq(...)`. Sans ce `.like()`, l'index reste inerte.
CREATE INDEX IF NOT EXISTS idx_credit_transactions_description_stripe
    ON public.credit_transactions (description)
    WHERE description LIKE 'Achat Stripe%';

COMMIT;

-- ============================================================================
-- VÉRIFICATION APRÈS
-- ============================================================================
-- Colonne + index en place :
--   SELECT indexname FROM pg_indexes
--   WHERE tablename = 'credit_transactions'
--     AND indexname IN ('uniq_credit_transactions_stripe_session',
--                       'idx_credit_transactions_description_stripe');
--
-- Backfill effectué :
--   SELECT COUNT(*) FILTER (WHERE stripe_session_id IS NOT NULL) AS backfillees,
--          COUNT(*) FILTER (WHERE description LIKE 'Achat Stripe - Session %') AS attendues
--   FROM public.credit_transactions;
--   (les deux nombres doivent être égaux)
--
-- L'unicité mord :
--   INSERT INTO public.credit_transactions (..., stripe_session_id)
--   VALUES (..., '<un cs_ déjà présent>');   -- doit lever 23505
-- ============================================================================
-- PATCH TypeScript associé (src/app/api/webhook/route.ts) — À APPLIQUER APRÈS.
-- Rétro-compatible : fonctionne avant comme après cette migration.
--   · lecture  : garder le .eq('description', ...) ET ajouter
--                .like('description', 'Achat Stripe%') pour activer l'index,
--                ou basculer sur .eq('stripe_session_id', session.id).
--   · écriture : renseigner stripe_session_id EN PLUS de description
--                pendant toute la fenêtre de transition.
-- ============================================================================
