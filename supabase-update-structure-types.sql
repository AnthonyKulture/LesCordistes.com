-- LesCordistes.com - Update Structure Types constraint
-- Execute this in your Supabase SQL Editor

-- 1. Identify and drop the existing check constraint on structure_type
-- The name is usually jobs_structure_type_check if recreated
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_structure_type_check;

-- 2. (Optional) Update existing data to match new keys if necessary 
-- urbain -> habitat_residentiel
-- industriel -> industrie_energie
-- ouvrage_art -> genie_civil_ouvrages
-- evenementiel -> evenementiel_spectacle
UPDATE jobs SET structure_type = 'habitat_residentiel' WHERE structure_type = 'urbain';
UPDATE jobs SET structure_type = 'industrie_energie' WHERE structure_type = 'industriel';
UPDATE jobs SET structure_type = 'genie_civil_ouvrages' WHERE structure_type = 'ouvrage_art';
UPDATE jobs SET structure_type = 'evenementiel_spectacle' WHERE structure_type = 'evenementiel';

-- 3. Add the new check constraint
ALTER TABLE jobs ADD CONSTRAINT jobs_structure_type_check 
CHECK (structure_type IN (
    'habitat_residentiel', 
    'tertiaire_bureaux', 
    'industrie_energie', 
    'genie_civil_ouvrages', 
    'milieu_naturel_parois', 
    'evenementiel_spectacle'
));
