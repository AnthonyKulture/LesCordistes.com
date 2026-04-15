-- Fix handle_new_user trigger to read metadata from OTP signInWithOtp options.data
-- Run in Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  meta jsonb;
  v_role text;
  v_first_name text;
  v_last_name text;
  v_full_name text;
  v_phone text;
  v_company_name text;
BEGIN
  meta := NEW.raw_user_meta_data;

  v_role        := COALESCE(NULLIF(meta->>'role', ''), 'client');
  v_first_name  := COALESCE(NULLIF(meta->>'first_name', ''), '');
  v_last_name   := COALESCE(NULLIF(meta->>'last_name', ''), '');
  v_full_name   := COALESCE(NULLIF(meta->>'full_name', ''), NULLIF(TRIM(v_first_name || ' ' || v_last_name), ''), '');
  v_phone       := COALESCE(NULLIF(meta->>'phone', ''), '');
  v_company_name := COALESCE(NULLIF(meta->>'company_name', ''), '');

  INSERT INTO public.profiles (id, role, first_name, last_name, full_name, phone, company_name, created_at, updated_at)
  VALUES (
    NEW.id,
    v_role,
    v_first_name,
    v_last_name,
    v_full_name,
    v_phone,
    v_company_name,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    role         = COALESCE(NULLIF(EXCLUDED.role, ''), profiles.role),
    first_name   = COALESCE(NULLIF(EXCLUDED.first_name, ''), profiles.first_name),
    last_name    = COALESCE(NULLIF(EXCLUDED.last_name, ''), profiles.last_name),
    full_name    = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
    phone        = COALESCE(NULLIF(EXCLUDED.phone, ''), profiles.phone),
    company_name = COALESCE(NULLIF(EXCLUDED.company_name, ''), profiles.company_name),
    updated_at   = NOW();

  RETURN NEW;
END;
$$;
