-- LesCordistes.com - Add Reinforcement (B2B) fields to jobs table
-- Execute this in your Supabase SQL Editor

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'standard' CHECK (type IN ('standard', 'renfort_pro'));
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS internal_reference TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS structure_type TEXT CHECK (structure_type IN ('urbain', 'industriel', 'ouvrage_art', 'evenementiel'));
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS required_level TEXT[];
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS required_habilitations TEXT[];
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS secondary_trades TEXT[];
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS equipment_management TEXT CHECK (equipment_management IN ('pro_brings_all', 'agency_provides_all', 'agency_provides_ropes_pro_brings_personal'));
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS specific_equipment TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS duration_days INTEGER;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS work_night_weekend BOOLEAN DEFAULT FALSE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS contract_type TEXT CHECK (contract_type IN ('subcontracting', 'freelance'));
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS daily_rate INTEGER;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS security_plan_confirmed BOOLEAN DEFAULT FALSE;

-- Create index for type
CREATE INDEX IF NOT EXISTS idx_jobs_type ON jobs(type);
