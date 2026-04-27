-- LesCordistes.com — unlock_lead : refuser les missions non 'live'
-- 2026-04-27
--
-- Contexte : on rend visibles sur /jobs les missions 'expired' (J+15 sans
-- revalidation) sous le label "Déjà effectuée". Elles ne doivent PAS être
-- débloquables (gaspillage crédit + mauvaise UX).
--
-- Cette migration ajoute un check status='live' dans la RPC unlock_lead.
--
-- ⚠️  À exécuter manuellement dans Supabase Dashboard → SQL Editor.

CREATE OR REPLACE FUNCTION unlock_lead(p_pro_id UUID, p_job_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_balance INTEGER;
    v_already_unlocked BOOLEAN;
    v_unlock_count INTEGER;
    v_credit_cost INTEGER;
    v_status TEXT;
BEGIN
    -- 0. Vérifier que l'appelant est bien le pro concerné
    IF auth.uid() != p_pro_id THEN
        RAISE EXCEPTION 'Accès non autorisé' USING ERRCODE = '42501';
    END IF;

    -- 1. Vérifier si déjà débloqué (évite le double débit)
    SELECT EXISTS(
        SELECT 1 FROM unlocked_leads
        WHERE pro_id = p_pro_id AND job_id = p_job_id
    ) INTO v_already_unlocked;

    IF v_already_unlocked THEN
        RETURN jsonb_build_object('already_unlocked', true);
    END IF;

    -- 1.5 Vérifier que la mission est encore active.
    -- Les missions 'expired' (J+15) restent visibles publiquement comme
    -- "Déjà effectuée" mais ne doivent pas être débloquables.
    SELECT status INTO v_status FROM jobs WHERE id = p_job_id;

    IF v_status IS NULL THEN
        RAISE EXCEPTION 'Mission introuvable' USING ERRCODE = 'P0004';
    END IF;

    IF v_status != 'live' THEN
        RAISE EXCEPTION 'Cette mission n''est plus active (statut : %)', v_status USING ERRCODE = 'P0005';
    END IF;

    -- 2. Vérifier le Numerus Clausus (Limite de 5 pros par mission)
    SELECT COUNT(*) INTO v_unlock_count
    FROM unlocked_leads
    WHERE job_id = p_job_id;

    IF v_unlock_count >= 5 THEN
        RAISE EXCEPTION 'Cette mission a déjà atteint sa limite de 5 professionnels.' USING ERRCODE = 'P0003';
    END IF;

    -- 2.5 Récupérer le coût en crédits de la mission
    SELECT credit_cost INTO v_credit_cost
    FROM jobs
    WHERE id = p_job_id;

    IF v_credit_cost IS NULL THEN
        RAISE EXCEPTION 'Mission introuvable' USING ERRCODE = 'P0004';
    END IF;

    -- 3. Déduire les crédits avec un verrou
    SELECT balance INTO v_balance
    FROM credits
    WHERE pro_id = p_pro_id
    FOR UPDATE;

    IF v_balance IS NULL THEN
        RAISE EXCEPTION 'Compte de crédits introuvable' USING ERRCODE = 'P0001';
    END IF;

    IF v_balance < v_credit_cost THEN
        RAISE EXCEPTION 'Solde insuffisant : % crédit(s) disponible(s) pour un coût de %', v_balance, v_credit_cost USING ERRCODE = 'P0002';
    END IF;

    UPDATE credits
    SET balance = balance - v_credit_cost,
        updated_at = NOW()
    WHERE pro_id = p_pro_id;

    INSERT INTO credit_transactions (pro_id, type, amount, job_id, description)
    VALUES (p_pro_id, 'spend', -v_credit_cost, p_job_id, 'Déblocage d''un lead (' || v_credit_cost || ' crédits)');

    -- 4. Enregistrer le déblocage
    INSERT INTO unlocked_leads (pro_id, job_id)
    VALUES (p_pro_id, p_job_id)
    ON CONFLICT (pro_id, job_id) DO NOTHING;

    RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION unlock_lead(UUID, UUID) TO authenticated;
