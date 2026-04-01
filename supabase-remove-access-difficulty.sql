-- LesCordistes.com - Remove site_access and difficulty from Jobs
-- Execute this in your Supabase SQL Editor

-- 1. Drop the columns
ALTER TABLE jobs 
DROP COLUMN IF EXISTS site_access,
DROP COLUMN IF EXISTS difficulty;
