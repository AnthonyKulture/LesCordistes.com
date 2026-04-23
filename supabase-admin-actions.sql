-- Audit trail des actions admin ops (immuable, lu via service_role)
CREATE TABLE IF NOT EXISTS admin_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  target_table text NOT NULL,
  target_id uuid,
  payload jsonb DEFAULT '{}'::jsonb,
  performed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_actions_service_role_all" ON admin_actions;
CREATE POLICY "admin_actions_service_role_all" ON admin_actions
  FOR ALL USING ((auth.jwt() ->> 'role') = 'service_role');

DROP POLICY IF EXISTS "admin_actions_admin_select" ON admin_actions;
CREATE POLICY "admin_actions_admin_select" ON admin_actions
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target ON admin_actions (target_table, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_performed_by ON admin_actions (performed_by);

-- Index utiles pour les KPIs admin (si absents)
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs (status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles (role);
CREATE INDEX IF NOT EXISTS idx_credits_pro_id ON credits (pro_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions (type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions (created_at DESC);
