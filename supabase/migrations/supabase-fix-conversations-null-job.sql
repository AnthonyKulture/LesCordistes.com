-- LesCordistes.com - Support pour conversations générales (sans mission)
-- À exécuter dans l'éditeur SQL Supabase

-- 1. Autoriser une seule conversation "générale" entre un client et un pro
-- (Postgres permet plusieurs NULL dans une contrainte UNIQUE classique, 
-- donc on ajoute un index partiel pour garantir l'unicité du couple client/pro quand job_id est NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_general 
ON conversations (client_id, pro_id) 
WHERE job_id IS NULL;

-- 2. Note: La table conversations permet déjà job_id NULL par défaut 
-- car il n'y a pas de contrainte NOT NULL sur cette colonne.
