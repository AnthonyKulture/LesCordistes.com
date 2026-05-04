-- LesCordistes — Ajout de last_name sur contact_requests
-- 2026-05-04
--
-- Le formulaire "Message rapide" (ContactPathPicker.tsx → QuickMessageForm)
-- ne capturait que le prénom. Pour identifier correctement le contact côté
-- admin (et préparer la conversion en mission via l'admin), on ajoute le nom.
--
-- À exécuter MANUELLEMENT dans Supabase SQL Editor.

ALTER TABLE contact_requests
    ADD COLUMN IF NOT EXISTS last_name TEXT;

COMMENT ON COLUMN contact_requests.last_name IS
    'Nom de famille du contact (saisi sur le formulaire Message rapide).';
