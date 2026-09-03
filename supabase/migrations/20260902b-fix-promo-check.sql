-- ============================================================================
-- CORRECTIF URGENT — 'promo' rétabli dans la contrainte credit_transactions.type
--
-- CE QUI S'EST PASSÉ. La migration 20260901d a étendu la contrainte CHECK de
-- `credit_transactions.type` pour y ajouter 'adjustment'. Elle a reconstruit
-- l'énumération à partir du schéma de base — 'purchase', 'spend', 'refund' —
-- sans voir que `supabase-add-promo-codes.sql` y avait déjà ajouté 'promo'.
-- Liste posée : ('purchase','spend','refund','admin_adjustment','adjustment').
--
-- CONSÉQUENCE. `redeem_promo_code` insère une ligne `type = 'promo'` juste
-- après avoir crédité le compte. Depuis l'application de 20260901d, cet INSERT
-- viole la contrainte : la transaction entière est annulée, donc l'activation
-- d'un code promo ÉCHOUE — sans crédit accordé et sans redemption enregistrée.
-- Le NOT VALID de 20260901d n'y change rien : il n'exempte que les lignes
-- existantes, les nouvelles restent contrôlées.
--
-- CORRECTIF : reconstruire la contrainte avec l'énumération COMPLÈTE, établie
-- en recensant les écritures réelles du code et des RPC :
--   purchase          — achat Stripe (webhook) et anciens ajustements admin
--   spend             — déblocage d'un lead (unlock_lead)
--   refund            — remboursement
--   promo             — code promo (redeem_promo_code)          ← rétabli
--   adjustment        — ajustement admin (depuis 20260901d)
--   admin_adjustment  — variante historique (supabase-stripe-fix.sql)
--
-- Idempotente. À exécuter dans Supabase SQL Editor.
-- ============================================================================

DO $$
DECLARE
    v_name TEXT;
    v_def  TEXT;
BEGIN
    SELECT conname, pg_get_constraintdef(oid)
    INTO v_name, v_def
    FROM pg_constraint
    WHERE conrelid = 'public.credit_transactions'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%type%'
    ORDER BY conname
    LIMIT 1;

    IF v_name IS NOT NULL AND v_def LIKE '%''promo''%' THEN
        RAISE NOTICE 'CHECK % contient déjà ''promo'' — rien à faire.', v_name;
        RETURN;
    END IF;

    IF v_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.credit_transactions DROP CONSTRAINT %I', v_name);
    ELSE
        v_name := 'credit_transactions_type_check';
    END IF;

    -- NOT VALID : une ligne historique portant un type hors liste ne doit pas
    -- faire échouer la migration. Les nouvelles lignes restent contrôlées.
    EXECUTE format(
        'ALTER TABLE public.credit_transactions ADD CONSTRAINT %I '
        'CHECK (type IN (''purchase'',''spend'',''refund'',''promo'','
        '''adjustment'',''admin_adjustment'')) NOT VALID',
        v_name
    );
    RAISE NOTICE 'CHECK % reconstruite avec ''promo''.', v_name;

    BEGIN
        EXECUTE format('ALTER TABLE public.credit_transactions VALIDATE CONSTRAINT %I', v_name);
        RAISE NOTICE 'CHECK % validée sur les lignes existantes.', v_name;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'VALIDATE % impossible (%) — contrainte laissée NOT VALID.', v_name, SQLERRM;
    END;
END $$;

-- ----------------------------------------------------------------------------
-- max_per_user — colonne fantôme, documentée comme telle
--
-- promo_codes.max_per_user existe et vaut 1 par défaut, mais AUCUN des deux RPC
-- ne la lit : la limite réelle est portée par UNIQUE(code, pro_id) sur
-- promo_redemptions, qui impose 1 par compte quoi qu'on écrive dans la colonne.
-- Poser max_per_user = 3 ne changerait rien.
--
-- On NE la supprime PAS (elle est référencée par le seed du fichier d'origine)
-- et on ne la câble pas non plus : autoriser N activations par compte est une
-- décision produit qui n'a pas été prise. On la commente pour que personne ne
-- s'y fie.
-- ----------------------------------------------------------------------------
COMMENT ON COLUMN public.promo_codes.max_per_user IS
'NON APPLIQUÉE — la limite réelle est UNIQUE(code, pro_id) sur promo_redemptions, '
'soit 1 activation par compte. Modifier cette colonne n''a aucun effet. '
'Pour autoriser plusieurs activations, il faudrait lever cette contrainte ET '
'câbler la colonne dans check_promo_code et redeem_promo_code.';

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================
-- 1) La contrainte contient bien 'promo' :
--      SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint
--      WHERE conrelid = 'public.credit_transactions'::regclass AND contype = 'c';
--
-- 2) Le code promo est-il encore valide ? (il avait 14 jours de validité)
--      SELECT code, is_active, valid_until, valid_until > NOW() AS encore_valide,
--             credits_amount,
--             (SELECT count(*) FROM promo_redemptions r WHERE r.code = p.code) AS activations
--      FROM promo_codes p;
--
-- 3) Test d'activation de bout en bout, sans rien casser (ROLLBACK) :
--      BEGIN;
--      SET LOCAL role authenticated;
--      SET LOCAL request.jwt.claims TO '{"sub":"<uuid-d-un-pro-sans-unlock>","role":"authenticated"}';
--      SELECT redeem_promo_code('BIENVENUE1');   -- doit renvoyer ok:true
--      SELECT redeem_promo_code('BIENVENUE1');   -- doit renvoyer already_redeemed
--      ROLLBACK;
-- ============================================================================
