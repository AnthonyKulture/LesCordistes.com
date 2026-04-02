-- LesCordistes.com - Update Client Typology for Professional Recruitment (Renfort)
-- Execute this in your Supabase SQL Editor

-- 1. Update the check constraint for the 'jobs' table
ALTER TABLE jobs 
DROP CONSTRAINT IF EXISTS jobs_client_type_check;

ALTER TABLE jobs
ADD CONSTRAINT jobs_client_type_check 
CHECK (client_type IN (
    'particulier', 
    'copropriete_syndic', 
    'entreprise_tertiaire', 
    'industrie_energie', 
    'collectivite_public', 
    'association_evenementiel',
    'entreprise_travaux_hauteur',
    'entreprise_btp',
    'agence_interim',
    'autre_pro'
));

-- 2. Update the check constraint for the 'profiles' table
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_client_type_check;

ALTER TABLE profiles
ADD CONSTRAINT profiles_client_type_check 
CHECK (client_type IN (
    'particulier', 
    'copropriete_syndic', 
    'entreprise_tertiaire', 
    'industrie_energie', 
    'collectivite_public', 
    'association_evenementiel',
    'entreprise_travaux_hauteur',
    'entreprise_btp',
    'agence_interim',
    'autre_pro'
));
