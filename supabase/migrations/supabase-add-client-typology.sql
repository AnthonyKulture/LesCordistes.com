-- LesCordistes.com - Add Client Typology to Jobs
-- Execute this in your Supabase SQL Editor

-- 1. Add the column with a check constraint
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS client_type TEXT 
CHECK (client_type IN (
    'particulier', 
    'copropriete_syndic', 
    'entreprise_tertiaire', 
    'industrie_energie', 
    'collectivite_public', 
    'association_evenementiel'
));

-- 2. (Optional) Set a default for existing rows if needed
-- UPDATE jobs SET client_type = 'entreprise_tertiaire' WHERE client_type IS NULL;
