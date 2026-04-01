-- ============================================================
-- LesCordistes.com — SQL Migrations MVP
-- À exécuter dans l'ordre dans l'éditeur SQL Supabase
-- ============================================================

-- ============================================================
-- PHASE 1 — Formulaire enrichi (champs supplémentaires)
-- ============================================================

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS budget_min INTEGER;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS budget_max INTEGER;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS deadline DATE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS site_access TEXT CHECK (site_access IN ('easy', 'difficult', 'rope_only'));
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_jobs_slug ON jobs(slug);

-- ============================================================
-- PHASE 3 — Profil professionnel détaillé
-- ============================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS intervention_zones TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS equipment TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS insurance_info TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS portfolio_photos TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS siret TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS latitude FLOAT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longitude FLOAT;

-- ============================================================
-- PHASE 4 — Système de crédits & achat de leads
-- ============================================================

-- Portefeuille de crédits par pro
CREATE TABLE IF NOT EXISTS credits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pro_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Historique des transactions de crédits
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pro_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'spend', 'refund')),
  amount INTEGER NOT NULL,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads débloqués (évite les doublons d'achat)
CREATE TABLE IF NOT EXISTS unlocked_leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pro_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(pro_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_pro ON credit_transactions(pro_id);
CREATE INDEX IF NOT EXISTS idx_unlocked_leads_pro ON unlocked_leads(pro_id);
CREATE INDEX IF NOT EXISTS idx_unlocked_leads_job ON unlocked_leads(job_id);

-- RLS pour les nouvelles tables
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE unlocked_leads ENABLE ROW LEVEL SECURITY;

-- Policies credits : chaque pro voit son solde
DROP POLICY IF EXISTS "Pro can view own credits" ON credits;
CREATE POLICY "Pro can view own credits"
  ON credits FOR SELECT USING (auth.uid() = pro_id);

DROP POLICY IF EXISTS "Pro can insert own credits" ON credits;
CREATE POLICY "Pro can insert own credits"
  ON credits FOR INSERT WITH CHECK (auth.uid() = pro_id);

DROP POLICY IF EXISTS "Pro can update own credits" ON credits;
CREATE POLICY "Pro can update own credits"
  ON credits FOR UPDATE USING (auth.uid() = pro_id);

-- Policies transactions : chaque pro voit ses transactions
DROP POLICY IF EXISTS "Pro can view own transactions" ON credit_transactions;
CREATE POLICY "Pro can view own transactions"
  ON credit_transactions FOR SELECT USING (auth.uid() = pro_id);

DROP POLICY IF EXISTS "Service role can insert transactions" ON credit_transactions;
CREATE POLICY "Service role can insert transactions"
  ON credit_transactions FOR INSERT WITH CHECK (true);

-- Policies unlocked_leads
DROP POLICY IF EXISTS "Pro can view own unlocked leads" ON unlocked_leads;
CREATE POLICY "Pro can view own unlocked leads"
  ON unlocked_leads FOR SELECT USING (auth.uid() = pro_id);

DROP POLICY IF EXISTS "Pro can unlock leads" ON unlocked_leads;
CREATE POLICY "Pro can unlock leads"
  ON unlocked_leads FOR INSERT WITH CHECK (auth.uid() = pro_id);

-- ============================================================
-- PHASE 6 — Géolocalisation des missions
-- ============================================================

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS latitude FLOAT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS longitude FLOAT;

-- ============================================================
-- PHASE 7 — Modération avancée
-- ============================================================

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES profiles(id);

-- ============================================================
-- PHASE 8 — Avis clients
-- ============================================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  pro_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, pro_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_pro_id ON reviews(pro_id);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviews are publicly viewable" ON reviews;
CREATE POLICY "Reviews are publicly viewable"
  ON reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Clients can submit reviews" ON reviews;
CREATE POLICY "Clients can submit reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = client_id);

-- ============================================================
-- PHASE 9 — Notifications
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can insert notifications" ON notifications;
CREATE POLICY "Service role can insert notifications"
  ON notifications FOR INSERT WITH CHECK (true);

-- ============================================================
-- PHASE 10 — Messagerie interne
-- ============================================================

CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  pro_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, pro_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachments TEXT[],
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_client ON conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_pro ON conversations(pro_id);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can view their conversations" ON conversations;
CREATE POLICY "Participants can view their conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = client_id OR auth.uid() = pro_id);

DROP POLICY IF EXISTS "Participants can view messages" ON messages;
CREATE POLICY "Participants can view messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND (conversations.client_id = auth.uid() OR conversations.pro_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Participants can send messages" ON messages;
CREATE POLICY "Participants can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND (conversations.client_id = auth.uid() OR conversations.pro_id = auth.uid())
    )
  );
