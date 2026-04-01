-- LesCordistes.com - Ajouter la politique d'insertion pour les conversations
-- À exécuter dans l'éditeur SQL Supabase

-- Permettre aux clients et aux professionnels de démarrer (insérer) une conversation
DROP POLICY IF EXISTS "Participants can create their conversations" ON conversations;
CREATE POLICY "Participants can create their conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = client_id OR auth.uid() = pro_id);
