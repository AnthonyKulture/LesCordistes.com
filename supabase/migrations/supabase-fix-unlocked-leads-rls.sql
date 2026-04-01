-- ============================================================
-- 🔓 FIX: RLS Policies for unlocked_leads
-- Permet aux admins et clients de voir les déblocage
-- ============================================================

-- 1. Supprimer les anciennes politiques restrictives si elles existent
DROP POLICY IF EXISTS "Pro can view own unlocked leads" ON unlocked_leads;
DROP POLICY IF EXISTS "Admins can view all unlocked leads" ON unlocked_leads;
DROP POLICY IF EXISTS "Clients can view leads for their own jobs" ON unlocked_leads;

-- 2. Nouvelle politique : Archivage des déblocages visible par :
--    - Le pro qui a débloqué
--    - Le client qui a créé la mission
--    - L'administrateur
CREATE POLICY "View lead activations"
  ON unlocked_leads FOR SELECT
  USING (
    auth.uid() = pro_id -- Le pro voit ses déblocages
    OR EXISTS ( -- L'admin voit tout
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
    OR EXISTS ( -- Le client voit qui a débloqué SA mission
      SELECT 1 FROM jobs 
      WHERE jobs.id = job_id AND jobs.created_by = auth.uid()
    )
  );

-- Note : L'insertion reste réservée au pro via la politique existante ou via RPC (SECURITY DEFINER)
DROP POLICY IF EXISTS "Pro can unlock leads" ON unlocked_leads;
CREATE POLICY "Pro can unlock leads"
  ON unlocked_leads FOR INSERT
  WITH CHECK (auth.uid() = pro_id);
