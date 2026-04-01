-- LesCordistes.com - Add 'cancelled' status to jobs table
-- Execute this in your Supabase SQL Editor

-- 1. Drop the old constraint
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_status_check;

-- 2. Add the new constraint with 'cancelled' included
ALTER TABLE jobs ADD CONSTRAINT jobs_status_check 
CHECK (status IN ('pending', 'live', 'rejected', 'completed', 'cancelled'));
