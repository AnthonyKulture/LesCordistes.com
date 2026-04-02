-- Passer l'utilisateur admin@lescordistes.com en rôle admin
-- À exécuter dans l'éditeur SQL de Supabase

UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@lescordistes.com';
