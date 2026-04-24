-- ============================================================
-- LesCordistes — Système de codes promo (crédits offerts)
-- À exécuter dans l'éditeur SQL Supabase
-- ============================================================

-- ------------------------------------------------------------
-- 1. Étendre le CHECK constraint credit_transactions.type
--    pour accepter le type 'promo'
-- ------------------------------------------------------------
DO $$
BEGIN
    -- Drop l'ancien check s'il existe (nom auto-généré ou explicite)
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'credit_transactions'::regclass
        AND conname = 'credit_transactions_type_check'
    ) THEN
        ALTER TABLE credit_transactions DROP CONSTRAINT credit_transactions_type_check;
    END IF;

    ALTER TABLE credit_transactions
        ADD CONSTRAINT credit_transactions_type_check
        CHECK (type IN ('purchase', 'spend', 'refund', 'promo'));
END $$;

-- ------------------------------------------------------------
-- 2. Table promo_codes — catalogue des codes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS promo_codes (
    code            TEXT PRIMARY KEY,
    description     TEXT,
    credits_amount  INTEGER NOT NULL CHECK (credits_amount > 0),
    valid_from      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    valid_until     TIMESTAMP WITH TIME ZONE,
    max_redemptions INTEGER,                       -- NULL = illimité (global)
    max_per_user    INTEGER NOT NULL DEFAULT 1,    -- typiquement 1
    audience        JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- audience supporte : {"role": "pro", "no_unlocks_yet": true}
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 3. Table promo_redemptions — historique des activations
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS promo_redemptions (
    id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code             TEXT NOT NULL REFERENCES promo_codes(code) ON DELETE CASCADE,
    pro_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    credits_granted  INTEGER NOT NULL,
    redeemed_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(code, pro_id)
);

CREATE INDEX IF NOT EXISTS idx_promo_redemptions_pro ON promo_redemptions(pro_id);
CREATE INDEX IF NOT EXISTS idx_promo_redemptions_code ON promo_redemptions(code);

-- ------------------------------------------------------------
-- 4. RLS — strictement service_role / RPC SECURITY DEFINER
-- ------------------------------------------------------------
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_redemptions ENABLE ROW LEVEL SECURITY;

-- promo_codes : lecture interdite côté client (les codes ne se devinent pas via SELECT)
-- Tout passe par la RPC. Aucune policy SELECT/INSERT/UPDATE pour authenticated.

-- promo_redemptions : un pro peut voir SES propres activations (utile pour l'UI)
DROP POLICY IF EXISTS "Pro can view own redemptions" ON promo_redemptions;
CREATE POLICY "Pro can view own redemptions"
    ON promo_redemptions FOR SELECT USING (auth.uid() = pro_id);

-- ------------------------------------------------------------
-- 5. RPC check_promo_code(code) — état SANS consommer
--    Utilisé par la bannière + la modale pour afficher le bon message.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION check_promo_code(p_code TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_pro_id UUID := auth.uid();
    v_code   promo_codes%ROWTYPE;
    v_role   TEXT;
    v_already_redeemed BOOLEAN;
    v_global_count INTEGER;
    v_has_unlocks BOOLEAN;
    v_normalized TEXT := upper(trim(p_code));
BEGIN
    IF v_pro_id IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'reason', 'not_authenticated');
    END IF;

    -- Lookup
    SELECT * INTO v_code FROM promo_codes WHERE code = v_normalized;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'reason', 'not_found');
    END IF;

    IF NOT v_code.is_active THEN
        RETURN jsonb_build_object('ok', false, 'reason', 'inactive');
    END IF;

    IF v_code.valid_from > NOW() THEN
        RETURN jsonb_build_object('ok', false, 'reason', 'not_yet_valid');
    END IF;

    IF v_code.valid_until IS NOT NULL AND v_code.valid_until < NOW() THEN
        RETURN jsonb_build_object('ok', false, 'reason', 'expired');
    END IF;

    -- Audience : role
    IF v_code.audience ? 'role' THEN
        SELECT role INTO v_role FROM profiles WHERE id = v_pro_id;
        IF v_role IS DISTINCT FROM (v_code.audience->>'role') THEN
            RETURN jsonb_build_object('ok', false, 'reason', 'wrong_audience');
        END IF;
    END IF;

    -- Audience : no_unlocks_yet (le pro ne doit avoir débloqué aucune mission)
    IF (v_code.audience->>'no_unlocks_yet')::boolean IS TRUE THEN
        SELECT EXISTS(SELECT 1 FROM unlocked_leads WHERE pro_id = v_pro_id) INTO v_has_unlocks;
        IF v_has_unlocks THEN
            RETURN jsonb_build_object('ok', false, 'reason', 'already_active_user');
        END IF;
    END IF;

    -- Déjà utilisé par ce pro ?
    SELECT EXISTS(
        SELECT 1 FROM promo_redemptions
        WHERE code = v_normalized AND pro_id = v_pro_id
    ) INTO v_already_redeemed;
    IF v_already_redeemed THEN
        RETURN jsonb_build_object('ok', false, 'reason', 'already_redeemed');
    END IF;

    -- Limite globale atteinte ?
    IF v_code.max_redemptions IS NOT NULL THEN
        SELECT COUNT(*) INTO v_global_count FROM promo_redemptions WHERE code = v_normalized;
        IF v_global_count >= v_code.max_redemptions THEN
            RETURN jsonb_build_object('ok', false, 'reason', 'limit_reached');
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'ok', true,
        'code', v_code.code,
        'credits_amount', v_code.credits_amount,
        'valid_until', v_code.valid_until
    );
END;
$$;

GRANT EXECUTE ON FUNCTION check_promo_code(TEXT) TO authenticated;

-- ------------------------------------------------------------
-- 6. RPC redeem_promo_code(code) — activation atomique
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION redeem_promo_code(p_code TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_pro_id UUID := auth.uid();
    v_code   promo_codes%ROWTYPE;
    v_role   TEXT;
    v_global_count INTEGER;
    v_has_unlocks BOOLEAN;
    v_new_balance INTEGER;
    v_normalized TEXT := upper(trim(p_code));
BEGIN
    IF v_pro_id IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'reason', 'not_authenticated');
    END IF;

    -- Lock la ligne du code pour éviter une race sur max_redemptions
    SELECT * INTO v_code FROM promo_codes WHERE code = v_normalized FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'reason', 'not_found');
    END IF;

    IF NOT v_code.is_active THEN
        RETURN jsonb_build_object('ok', false, 'reason', 'inactive');
    END IF;

    IF v_code.valid_from > NOW() THEN
        RETURN jsonb_build_object('ok', false, 'reason', 'not_yet_valid');
    END IF;

    IF v_code.valid_until IS NOT NULL AND v_code.valid_until < NOW() THEN
        RETURN jsonb_build_object('ok', false, 'reason', 'expired');
    END IF;

    IF v_code.audience ? 'role' THEN
        SELECT role INTO v_role FROM profiles WHERE id = v_pro_id;
        IF v_role IS DISTINCT FROM (v_code.audience->>'role') THEN
            RETURN jsonb_build_object('ok', false, 'reason', 'wrong_audience');
        END IF;
    END IF;

    IF (v_code.audience->>'no_unlocks_yet')::boolean IS TRUE THEN
        SELECT EXISTS(SELECT 1 FROM unlocked_leads WHERE pro_id = v_pro_id) INTO v_has_unlocks;
        IF v_has_unlocks THEN
            RETURN jsonb_build_object('ok', false, 'reason', 'already_active_user');
        END IF;
    END IF;

    IF v_code.max_redemptions IS NOT NULL THEN
        SELECT COUNT(*) INTO v_global_count FROM promo_redemptions WHERE code = v_normalized;
        IF v_global_count >= v_code.max_redemptions THEN
            RETURN jsonb_build_object('ok', false, 'reason', 'limit_reached');
        END IF;
    END IF;

    -- INSERT redemption (la contrainte UNIQUE(code, pro_id) bloque le double-call concurrent)
    BEGIN
        INSERT INTO promo_redemptions (code, pro_id, credits_granted)
        VALUES (v_normalized, v_pro_id, v_code.credits_amount);
    EXCEPTION WHEN unique_violation THEN
        RETURN jsonb_build_object('ok', false, 'reason', 'already_redeemed');
    END;

    -- Crédite (UPSERT)
    INSERT INTO credits (pro_id, balance)
    VALUES (v_pro_id, v_code.credits_amount)
    ON CONFLICT (pro_id)
    DO UPDATE SET balance = credits.balance + v_code.credits_amount,
                  updated_at = NOW()
    RETURNING balance INTO v_new_balance;

    -- Trace transactionnelle
    INSERT INTO credit_transactions (pro_id, type, amount, description)
    VALUES (v_pro_id, 'promo', v_code.credits_amount,
            'Code promo : ' || v_normalized);

    RETURN jsonb_build_object(
        'ok', true,
        'credits_granted', v_code.credits_amount,
        'new_balance', v_new_balance,
        'code', v_normalized
    );
END;
$$;

GRANT EXECUTE ON FUNCTION redeem_promo_code(TEXT) TO authenticated;

-- ------------------------------------------------------------
-- 7. SEED — code BIENVENUE1 (1 crédit, 14 jours, pros sans unlock)
-- ------------------------------------------------------------
INSERT INTO promo_codes (
    code, description, credits_amount,
    valid_from, valid_until,
    max_redemptions, max_per_user, audience, is_active
)
VALUES (
    'BIENVENUE1',
    'Campagne de réactivation : 1 crédit offert aux pros n''ayant jamais débloqué de mission',
    1,
    NOW(),
    NOW() + INTERVAL '14 days',
    NULL,
    1,
    '{"role": "pro", "no_unlocks_yet": true}'::jsonb,
    true
)
ON CONFLICT (code) DO UPDATE
    SET valid_until = EXCLUDED.valid_until,
        is_active   = EXCLUDED.is_active,
        audience    = EXCLUDED.audience,
        updated_at  = NOW();
