-- Corrige le trigger handle_new_user
-- Problème: supabase-fix-all.sql avait 5 valeurs pour 4 colonnes → crash 500 à l'inscription
-- Lancer dans Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name, first_name, last_name, phone, company_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', ''), 'pro'),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), ''),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'first_name', ''), ''),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'last_name', ''), ''),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'phone', ''), ''),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'company_name', ''), '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email        = EXCLUDED.email,
    role         = COALESCE(NULLIF(EXCLUDED.role, ''), profiles.role),
    full_name    = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
    first_name   = COALESCE(NULLIF(EXCLUDED.first_name, ''), profiles.first_name),
    last_name    = COALESCE(NULLIF(EXCLUDED.last_name, ''), profiles.last_name),
    phone        = COALESCE(NULLIF(EXCLUDED.phone, ''), profiles.phone),
    company_name = COALESCE(NULLIF(EXCLUDED.company_name, ''), profiles.company_name),
    updated_at   = NOW();

  RETURN NEW;
END;
$$;
