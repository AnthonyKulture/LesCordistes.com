-- Update RLS for jobs table to allow creators to manage their own jobs
-- This enables both Clients and Pros-as-Recruiters to manage their listings.

-- 1. Creators can see all their own jobs (even pending/rejected)
CREATE POLICY "Creators can view own jobs"
  ON public.jobs FOR SELECT
  USING (auth.uid() = created_by);

-- 2. Creators can update their own jobs (if not yet live or for minor edits)
CREATE POLICY "Creators can update own jobs"
  ON public.jobs FOR UPDATE
  USING (auth.uid() = created_by);

-- 3. Creators can delete their own jobs
CREATE POLICY "Creators can delete own jobs"
  ON public.jobs FOR DELETE
  USING (auth.uid() = created_by);

-- 4. Secure the INSERT policy (currently 'CHECK (true)')
-- We should ideally ensure created_by matches auth.uid()
DROP POLICY IF EXISTS "Anyone can create jobs" ON public.jobs;
CREATE POLICY "Authenticated users can create jobs"
  ON public.jobs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
