-- LesCordistes.com - Add client_type to Profiles
-- Execute this in your Supabase SQL Editor

-- 1. Add the column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS client_type text;

-- 2. Add check constraint (same as in jobs table)
ALTER TABLE profiles
ADD CONSTRAINT profiles_client_type_check 
CHECK (client_type IN ('particulier', 'copropriete_syndic', 'entreprise_tertiaire', 'industrie_energie', 'collectivite_public', 'association_evenementiel'));
