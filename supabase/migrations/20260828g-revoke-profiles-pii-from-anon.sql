-- ============================================================================
-- SÉCURITÉ — Fermeture de la fuite PII sur `profiles`
--
-- Constat (28/08/2026) : avec la seule clé anon publique (embarquée dans le
-- bundle front, donc récupérable par n'importe qui), l'API REST renvoyait :
--   curl ".../rest/v1/profiles?select=email,phone,siret,insurance_info"
--   → [{"email":"…","phone":"+336…","siret":"893 152 900 00013", …}, …]
-- soit l'email, le téléphone, le SIRET et l'assurance de TOUS les
-- professionnels inscrits. Même cause que la fuite `jobs.client_contact_info` :
-- la RLS filtre les LIGNES, jamais les COLONNES, et la policy `profiles` est
-- `USING (true)`.
--
-- L'UI réservait déjà ces champs aux connectés (PublicProfile.tsx :
-- `user && (profile?.role === 'client' || profile?.role === 'pro')`) — la
-- protection était purement cosmétique.
--
-- ---------------------------------------------------------------------------
-- CHOIX : révoquer pour `anon` UNIQUEMENT, pas pour `authenticated`.
-- ---------------------------------------------------------------------------
-- Les droits colonne s'appliquent au RÔLE, pas à la ligne : révoquer `email`
-- pour `authenticated` empêcherait aussi chaque utilisateur de lire SON PROPRE
-- email (AuthContext.tsx charge le profil complet au montage), et casserait les
-- jointures des dashboards. Le périmètre retenu reproduit donc exactement
-- l'intention déjà exprimée par l'UI : anonyme = pas de contact, connecté = contact.
--
-- INVENTAIRE DES CHEMINS ANONYMES (vérifié fichier par fichier) :
--   · src/app/pros/[id]/page.tsx — SEUL accès anon à `profiles` (client public
--     sans cookies). Sélectionne déjà PROFILE_PUBLIC_COLUMNS, aucune des
--     colonnes révoquées ici. Aucune autre page publique/SEO ne lit `profiles`.
--   · Le wizard invité (PostJob.tsx) fait des UPDATE, pas des SELECT — non affecté.
--   · Les jointures qui sélectionnent `email` (ClientDashboard, CompleteJobModal)
--     sont toutes en contexte connecté.
--   · Tout le back-office passe par service_role, qui ignore ces grants.
--
-- Indépendante des migrations 20260828a-f : jouable dans n'importe quel ordre.
-- ============================================================================

BEGIN;

REVOKE SELECT ON public.profiles FROM anon;

GRANT SELECT (
    id, role, full_name, first_name, last_name, company_name,
    bio, avatar_url, skills, certifications, equipment,
    intervention_zones, portfolio_photos, client_type,
    latitude, longitude, created_at, updated_at
) ON public.profiles TO anon;

-- Volontairement EXCLUS pour anon : email, phone, siret, insurance_info,
-- welcome_email_sent_at.
-- `authenticated` conserve l'accès complet — inchangé.

COMMIT;

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================
-- 1) En anon, les colonnes sensibles doivent être refusées :
--      BEGIN; SET LOCAL role anon;
--      SELECT email FROM profiles LIMIT 1;      -- ERROR: permission denied
--      ROLLBACK;
--
-- 2) Les colonnes publiques doivent continuer de passer :
--      BEGIN; SET LOCAL role anon;
--      SELECT id, full_name, skills FROM profiles WHERE role = 'pro' LIMIT 1;  -- OK
--      ROLLBACK;
--
-- 3) Un connecté doit garder l'accès complet :
--      BEGIN; SET LOCAL role authenticated;
--      SELECT email, phone FROM profiles LIMIT 1;  -- OK
--      ROLLBACK;
--
-- 4) Depuis l'extérieur, avec la clé anon (doit renvoyer une erreur 42501) :
--      curl "https://<ref>.supabase.co/rest/v1/profiles?select=email&limit=1" \
--           -H "apikey: <ANON_KEY>" -H "Authorization: Bearer <ANON_KEY>"
--
-- 5) Non-régression front : /pros/<id> en navigation anonyme doit toujours
--    afficher nom, ville, compétences et photos ; connecté, le téléphone et le
--    lien mailto doivent réapparaître.
--
-- ROLLBACK d'urgence (réouvre la fuite — uniquement si le front casse) :
--      GRANT SELECT ON public.profiles TO anon;
--
-- ---------------------------------------------------------------------------
-- LIMITE ASSUMÉE : tout utilisateur CONNECTÉ peut encore lire l'email et le
-- téléphone de tous les pros via l'API. C'est cohérent avec l'UI actuelle, mais
-- si l'on veut restreindre davantage (par exemple : contact visible seulement
-- après une mise en relation), il faudra passer par un RPC gated sur le modèle
-- de `get_job_contact`, et retirer ces colonnes des lectures navigateur.
-- ---------------------------------------------------------------------------
