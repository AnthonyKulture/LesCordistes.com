-- ============================================================
-- 🛠️ SCRIPT DE RÉPARATION GLOBALE (LesCordistes)
-- À exécuter dans le SQL Editor de Supabase
-- ============================================================

-- 1. EXTENSIONS & SCHEMA
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- S'assurer que les colonnes existent sur profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS intervention_zones TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS equipment TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS insurance_info TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS portfolio_photos TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS siret TEXT;

-- S'assurer que les colonnes existent sur jobs
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS site_access TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS budget_min INTEGER;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS budget_max INTEGER;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS deadline DATE;

-- 2. RÉINITIALISATION DES COMPTES DE TEST (MOTS DE PASSE)
-- On nettoie d'abord les dépendances pour éviter les erreurs FK
DELETE FROM jobs WHERE created_by IN (SELECT id FROM profiles WHERE email IN ('client-test@lescordistes.com', 'pro-test@lescordistes.com', 'pro-premium@lescordistes.com', 'admin@lescordistes.com'));
DELETE FROM profiles WHERE email IN ('client-test@lescordistes.com', 'pro-test@lescordistes.com', 'pro-premium@lescordistes.com', 'admin@lescordistes.com');
DELETE FROM auth.users WHERE email IN ('client-test@lescordistes.com', 'pro-test@lescordistes.com', 'pro-premium@lescordistes.com', 'admin@lescordistes.com');

-- Recréation propre
-- Passwords: Test1234! (Pro/Client) et Admin123! (Admin)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
VALUES 
('11111111-1111-1111-1111-111111111111', 'client-test@lescordistes.com', crypt('Test1234!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Jean Client"}', 'authenticated', 'authenticated'),
('22222222-2222-2222-2222-222222222222', 'pro-test@lescordistes.com', crypt('Test1234!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Marc Pro"}', 'authenticated', 'authenticated'),
('00000000-0000-0000-0000-000000000000', 'admin@lescordistes.com', crypt('Admin123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Admin"}', 'authenticated', 'authenticated');

-- Les profils seront auto-créés par le trigger (voir étape 4)

-- 3. POLITIQUES RLS (SÉCURITÉ & PERMISSIONS)
-- Permettre aux utilisateurs de TOUT faire sur leur propre profil
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Permettre aux créateurs de missions de les modifier (IMPORTANT pour la sauvegarde)
DROP POLICY IF EXISTS "Users can update own jobs" ON jobs;
CREATE POLICY "Users can update own jobs" ON jobs FOR UPDATE USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Anyone can create jobs" ON jobs;
CREATE POLICY "Anyone can create jobs" ON jobs FOR INSERT WITH CHECK (true);

-- 4. TRIGGER DE CRÉATION DE PROFIL (VERSION ROBUSTE)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'pro'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    role = COALESCE(EXCLUDED.role, profiles.role);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- S'assurer que le trigger est bien là
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. FINALISATION DES RÔLES TEST
UPDATE profiles SET role = 'client' WHERE email = 'client-test@lescordistes.com';
UPDATE profiles SET role = 'admin' WHERE email = 'admin@lescordistes.com';
UPDATE profiles SET role = 'pro' WHERE email = 'pro-test@lescordistes.com';
