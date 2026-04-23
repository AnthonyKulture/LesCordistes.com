-- ============================================================
-- LesCordistes — Modération des Professionnels (v1)
-- À exécuter dans le SQL Editor de Supabase
-- ============================================================

-- 1. Ajouter le champ de statut de vérification aux profils (par défaut à 'approved')
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS verification_status TEXT 
DEFAULT 'approved' 
CHECK (verification_status IN ('pending', 'approved', 'rejected'));

-- 2. Indexer pour les recherches admin
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON profiles(verification_status);

-- 3. (Optionnel) Restreindre le déblocage de leads aux pros approuvés
-- Nous modifierons la fonction unlock_lead plus tard si nécessaire.

-- 4. Audit de modification pour le statut
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id);

-- 5. Trigger auto-update verified_at quand le statut passe à 'approved'
CREATE OR REPLACE FUNCTION update_verified_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.verification_status = 'approved' AND (OLD.verification_status IS DISTINCT FROM 'approved') THEN
        NEW.verified_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profile_verified ON profiles;
CREATE TRIGGER on_profile_verified
    BEFORE UPDATE OF verification_status ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_verified_at();
