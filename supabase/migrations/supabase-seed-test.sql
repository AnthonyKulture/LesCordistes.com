-- ============================================================
-- SEED : Comptes de test LesCordistes
-- À exécuter dans Supabase > SQL Editor
-- ============================================================
-- ⚠️  Exécutez d'abord supabase-migrations-mvp.sql si ce n'est pas fait

-- ============================================================
-- 1. Créer les utilisateurs Auth (avec mots de passe hachés)
-- ============================================================

-- Compte CLIENT test
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'client-test@lescordistes.com',
  crypt('Test1234!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Jean Dupont (Client)"}',
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Compte PRO test (non abonné)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'pro-test@lescordistes.com',
  crypt('Test1234!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Marc Leroy (Pro)"}',
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Compte PRO ABONNÉ test
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'pro-premium@lescordistes.com',
  crypt('Test1234!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Sophie Martin (Pro Premium)"}',
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. Créer les profils correspondants
-- ============================================================

-- Profil CLIENT
INSERT INTO profiles (
  id, email, role, full_name, phone, created_at, updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'client-test@lescordistes.com',
  'client',
  'Jean Dupont',
  '0612345678',
  'free',
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  role = 'client',
  full_name = 'Jean Dupont',

-- Profil PRO (gratuit, non abonné)
INSERT INTO profiles (
  id, email, role, full_name, phone, bio, subscription_status,
  certifications, skills, company_name, intervention_zones, insurance_info,
  created_at, updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'pro-test@lescordistes.com',
  'pro',
  'Marc Leroy',
  '0687654321',
  'Cordiste professionnel avec 8 ans d''expérience en travaux sur cordes. Spécialiste nettoyage de façades et inspection d''ouvrages d''art.',
  'free',
  ARRAY['CQP Cordiste N2', 'IRATA Level 2', 'SST'],
  ARRAY['Nettoyage façade', 'Inspection structure', 'Travaux en hauteur'],
  'Leroy Cordistes SARL',
  ARRAY['75', '92', '93', '94', '91', '78', '77'],
  'AXA RC Pro N°12345678',
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  role = 'pro',
  full_name = 'Marc Leroy',
  certifications = ARRAY['CQP Cordiste N2', 'IRATA Level 2', 'SST'],
  skills = ARRAY['Nettoyage façade', 'Inspection structure', 'Travaux en hauteur'];

-- Profil PRO ABONNÉ (premium)
INSERT INTO profiles (
  id, email, role, full_name, phone, bio, subscription_status,
  certifications, skills, company_name, siret, intervention_zones, insurance_info,
  created_at, updated_at
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'pro-premium@lescordistes.com',
  'pro',
  'Sophie Martin',
  '0699887766',
  'Cordiste experte depuis 12 ans. IRATA Level 3, spécialiste industrie et énergie éolienne. Certifiée pour interventions en milieux confinés et grandes hauteurs.',
  'active',
  ARRAY['CQP Cordiste N2', 'IRATA Level 3', 'SPRAT Level 3', 'SST', 'Habilitation électrique'],
  ARRAY['Éolien offshore', 'Pétrochimie', 'Inspection ponts', 'Nettoyage façade', 'Peinture industrielle'],
  'Martin Hauteurs Expertises',
  '12345678901234',
  ARRAY['33', '40', '64', '65', '09', '31', '34'],
  'MAIF RC Pro Expert N°98765432 – 2M€',
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  role = 'pro',
  full_name = 'Sophie Martin',
  certifications = ARRAY['CQP Cordiste N2', 'IRATA Level 3', 'SPRAT Level 3', 'SST', 'Habilitation électrique'];

-- ============================================================
-- 3. Ajouter des crédits au compte PRO test (non abonné)
-- ============================================================

INSERT INTO credits (pro_id, balance, updated_at)
VALUES ('22222222-2222-2222-2222-222222222222', 5, now())
ON CONFLICT (pro_id) DO UPDATE SET balance = 5;

INSERT INTO credit_transactions (pro_id, type, amount, description, created_at)
VALUES ('22222222-2222-2222-2222-222222222222', 'purchase', 5, 'Bonus de bienvenue – 5 crédits offerts', now());

-- ============================================================
-- 4. Créer des missions de test (publiées)
-- ============================================================

INSERT INTO jobs (
  id, title, slug, description, category,
  location_city, location_address, location_department,
  height_meters, difficulty, site_access,
  budget_min, budget_max, deadline,
  status,
  client_contact_info,
  created_by, created_at, updated_at
) VALUES
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Nettoyage façade immeuble haussmannien Paris 8e',
  'nettoyage-facade-haussmannien-paris',
  'Nettoyage complet de la façade d''un immeuble haussmannien de 7 étages situé rue du Faubourg Saint-Honoré. Façade en pierre de taille, présence de sculptures ornementales. Accès par la cour intérieure. Le bâtiment est classé, il sera donc nécessaire d''utiliser des produits respectueux. Délai : avant le 1er avril pour les travaux de printemps.',
  'cleaning',
  'Paris',
  '42 rue du Faubourg Saint-Honoré',
  '75',
  22,
  'medium',
  'difficult',
  3500,
  6000,
  '2026-03-31',
  'live',
  '{"name":"Jean Dupont","email":"jean.dupont@gmail.com","phone":"0612345678"}',
  '11111111-1111-1111-1111-111111111111',
  now() - interval '2 days',
  now()
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'Inspection structure pont autoroutier – A9 Montpellier',
  'inspection-pont-autoroute-a9-montpellier',
  'Mission d''inspection visuelle et contrôle non-destructif des appuis et tablier du pont. Durée prévue : 3 jours. Le cordiste doit être IRATA ou SPRAT minimum Level 2. Rapport d''inspection complet requis à l''issue de la mission. Dates flexibles selon météo.',
  'industry',
  'Montpellier',
  'Pont A9 sortie 29',
  '34',
  35,
  'hard',
  'rope_only',
  2000,
  4000,
  '2026-04-15',
  'live',
  '{"name":"Direction Infrastructure Sud","email":"infra@vinci-autoroutes.fr","phone":"0467891234"}',
  '11111111-1111-1111-1111-111111111111',
  now() - interval '1 day',
  now()
),
(
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'Peinture anti-corrosion pylônes industriels – Zone portuaire Bordeaux',
  'peinture-anticorrosion-pylones-bordeaux',
  'Application de peinture anti-corrosion sur 4 pylônes métalliques de 18m sur la zone portuaire de Bordeaux. Travaux en milieu industriel classé. EPI obligatoires. Possibilité de travailler en week-end. Budget négociable selon profil.',
  'painting',
  'Bordeaux',
  'Quai de Bacalan – Zone portuaire',
  '33',
  18,
  'medium',
  'easy',
  1800,
  3200,
  '2026-04-30',
  'live',
  '{"name":"Port Atlantique","email":"contact@port-bordeaux.fr","phone":"0556901234"}',
  '11111111-1111-1111-1111-111111111111',
  now() - interval '3 hours',
  now()
),
(
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'Maçonnerie restauration clocher église médiévale – Lyon',
  'maconnerie-clocher-eglise-lyon',
  'Travaux de restauration maçonnerie sur le clocher d''une église du 13e siècle classée Monument Historique. Joints à refaire, 3 pierres de remplacement nécessaires. L''entreprise devra avoir l''agrément Monuments Historiques. Contact avec l''architecte des Bâtiments de France requis.',
  'masonry',
  'Lyon',
  'Place Bellecour – Eglise Saint-Bonaventure',
  '69',
  28,
  'hard',
  'rope_only',
  5000,
  9000,
  '2026-05-01',
  'live',
  '{"name":"Mairie de Lyon – Service Patrimoine","email":"patrimoine@mairie-lyon.fr","phone":"0472100800"}',
  '11111111-1111-1111-1111-111111111111',
  now() - interval '5 hours',
  now()
),
(
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'Rigging et sécurité événement festival – festival Nantes',
  'rigging-securite-festival-nantes',
  'Prestation de rigging pour un festival de musique : installation et sécurisation des structures scéniques, éclairages et toiles aériennes. Du 12 au 15 juin. Équipe de 2 cordistes minimum. Expérience event obligatoire, certification IRATA ou équivalent.',
  'event',
  'Nantes',
  'Île de Nantes – Hangar à bananes',
  '44',
  12,
  'easy',
  'easy',
  2400,
  3600,
  '2026-06-10',
  'live',
  '{"name":"Festival Production SARL","email":"tech@festival-nantes.fr","phone":"0240123456"}',
  '11111111-1111-1111-1111-111111111111',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 5. Ajouter quelques avis test sur le profil PRO Premium
-- ============================================================

INSERT INTO reviews (id, job_id, pro_id, client_id, rating, comment, created_at)
VALUES
(
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  5,
  'Travail impeccable, très professionnel. Sophie a respecté tous les délais et le rendu est parfait. Je recommande vivement !',
  now() - interval '10 days'
),
(
  gen_random_uuid(),
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  4,
  'Très bon travail technique, rapport d''inspection clair et détaillé. Légère difficulté de communication au démarrage mais tout s''est bien passé ensuite.',
  now() - interval '25 days'
),
(
  gen_random_uuid(),
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  5,
  'Excellente prestation, équipement de qualité et travail soigné. Aucune mauvaise surprise, je ferai appel à nouveau pour nos prochains chantiers.',
  now() - interval '5 days'
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- RÉCAPITULATIF
-- ============================================================
-- 🟦 CLIENT TEST
--    Email    : client-test@lescordistes.com
--    MDP      : Test1234!
--    Rôle     : client
--
-- 🟧 PRO TEST (gratuit, 5 crédits)
--    Email    : pro-test@lescordistes.com
--    MDP      : Test1234!
--    Rôle     : pro (non abonné)
--    Crédits  : 5
--
-- 🟩 PRO PREMIUM TEST (abonné)
--    Email    : pro-premium@lescordistes.com
--    MDP      : Test1234!
--    Rôle     : pro (abonné actif)
--    Accès    : coordonnées illimitées
-- ============================================================
