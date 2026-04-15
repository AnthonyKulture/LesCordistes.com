-- Fix trigger handle_new_user : lit first_name, last_name, phone, company_name depuis les metadata OTP
-- À exécuter dans le SQL Editor Supabase

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name, first_name, last_name, phone, company_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'pro'),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), ''),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'first_name', ''), ''),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'last_name', ''), ''),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'phone', ''), NULL),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'company_name', ''), NULL)
  )
  ON CONFLICT (id) DO UPDATE SET
    email        = EXCLUDED.email,
    role         = COALESCE(EXCLUDED.role, profiles.role),
    full_name    = COALESCE(NULLIF(EXCLUDED.full_name, ''),    profiles.full_name),
    first_name   = COALESCE(NULLIF(EXCLUDED.first_name, ''),  profiles.first_name),
    last_name    = COALESCE(NULLIF(EXCLUDED.last_name, ''),   profiles.last_name),
    phone        = COALESCE(EXCLUDED.phone,                   profiles.phone),
    company_name = COALESCE(EXCLUDED.company_name,            profiles.company_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
