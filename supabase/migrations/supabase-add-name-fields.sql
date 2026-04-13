-- Ajoute first_name et last_name à profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Migre les full_name existants vers first_name/last_name si vides
UPDATE public.profiles
SET 
  first_name = split_part(full_name, ' ', 1),
  last_name   = CASE 
    WHEN position(' ' IN full_name) > 0 
    THEN substring(full_name FROM position(' ' IN full_name) + 1)
    ELSE NULL 
  END
WHERE full_name IS NOT NULL
  AND first_name IS NULL;
