-- ============================================================
-- LesCordistes — RPC Atomique : Déblocage de Lead
-- À exécuter dans l'éditeur SQL Supabase
-- ============================================================

-- Fonction RPC pour débloquer un lead de manière atomique
-- Vérifie le solde, débloque, débite et enregistre la transaction
-- en une seule transaction SQL (évite les race conditions)

CREATE OR REPLACE FUNCTION unlock_lead(p_pro_id UUID, p_job_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_balance INTEGER;
    v_already_unlocked BOOLEAN;
    v_unlock_count INTEGER;
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

    -- 2. Vérifier le Numerus Clausus (Limite de 5 pros par mission)
    SELECT COUNT(*) INTO v_unlock_count
    FROM unlocked_leads
    WHERE job_id = p_job_id;

    IF v_unlock_count >= 5 THEN
        RAISE EXCEPTION 'Cette mission a déjà atteint sa limite de 5 professionnels.' USING ERRCODE = 'P0003';
    END IF;

    -- 3. Déduire un crédit
    -- Lire le solde avec un verrou
    SELECT balance INTO v_balance
    FROM credits
    WHERE pro_id = p_pro_id
    FOR UPDATE;

    IF v_balance IS NULL THEN
        RAISE EXCEPTION 'Compte de crédits introuvable' USING ERRCODE = 'P0001';
    END IF;

    IF v_balance < 1 THEN
        RAISE EXCEPTION 'Solde insuffisant : % crédit(s) disponible(s)', v_balance USING ERRCODE = 'P0002';
    END IF;

    -- Débiter le crédit
    UPDATE credits
    SET balance = balance - 1,
        updated_at = NOW()
    WHERE pro_id = p_pro_id;

    -- Enregistrer la transaction
    INSERT INTO credit_transactions (pro_id, type, amount, job_id, description)
    VALUES (p_pro_id, 'spend', -1, p_job_id, 'Déblocage d''un lead');

    -- 4. Enregistrer le déblocage
    INSERT INTO unlocked_leads (pro_id, job_id)
    VALUES (p_pro_id, p_job_id)
    ON CONFLICT (pro_id, job_id) DO NOTHING;

    RETURN jsonb_build_object(
        'success', true
    );
END;
$$;

-- Accorder les droits d'exécution aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION unlock_lead(UUID, UUID) TO authenticated;
