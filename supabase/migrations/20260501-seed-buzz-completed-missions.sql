-- LesCordistes — Seed missions fictives "Déjà effectuée" (preuve sociale)
-- 2026-05-01
--
-- Objectif : injecter 12 missions variées en status='completed' pour
-- afficher de la preuve sociale (volume + diversité) aux pros et visiteurs
-- sur /jobs.
--
-- Sécurité :
--   • status='completed' → exclu du matching pro-alerts-cron (qui filtre 'live')
--   • admin_created=true → exclu du jobs-freshness-cron (J+5 / J+10)
--   • created_by=NULL → pas de propriétaire client (pas d'email transactionnel)
--   • client_contact_info=placeholder archive (NOT NULL côté schéma) — la
--     UnlockLeadButton bloque de toute façon les missions completed
--   • admin_notes='SEED — buzz/social proof' → permet le rollback ciblé
--
-- ROLLBACK :
--   DELETE FROM jobs WHERE admin_notes = 'SEED — buzz/social proof';
--
-- À exécuter MANUELLEMENT dans Supabase SQL Editor.

-- Placeholder archive utilisé pour client_contact_info (colonne NOT NULL côté
-- schéma). La UnlockLeadButton bloque le déblocage sur status='completed',
-- donc cette donnée n'est jamais exposée à un pro.

INSERT INTO jobs (
    title, slug, description, category, type, status,
    location_city, location_department, height_meters,
    budget_min, budget_max, daily_rate, duration_days,
    contract_type, credit_cost,
    admin_created, admin_notes, client_contact_info,
    created_at, moderated_at
) VALUES

-- 1. Nettoyage façade R+8 — Lyon (mid budget, B2C)
(
    'Nettoyage façade R+8 résidence Tête d''Or',
    'nettoyage-facade-r8-lyon-tete-or',
    'Façade nord d''un immeuble de standing à Lyon 6e (Tête d''Or), 8 niveaux, environ 320 m². Salissures urbaines (pollution, traces de pluie). Intervention sur cordes uniquement, pas de nacelle possible (cour intérieure). Bâche de protection sur le sol obligatoire. Travaux réalisés en mai 2026.',
    'cleaning', 'standard', 'completed',
    'Lyon', '69', 24,
    3200, 4500, NULL, 4,
    NULL, 1,
    TRUE, 'SEED — buzz/social proof', '{"name": "Mission archivée", "email": "archive@lescordistes.com", "phone": ""}'::jsonb,
    NOW() - INTERVAL '52 days', NOW() - INTERVAL '50 days'
),

-- 2. Élagage chêne centenaire — Bordeaux (small budget, B2C)
(
    'Élagage chêne centenaire propriété privée',
    'elagage-chene-centenaire-bordeaux-caudéran',
    'Élagage et démontage partiel d''un chêne pédonculé classé (~150 ans) en limite de propriété, quartier Caudéran. Hauteur ~22 m. Branche maîtresse menaçante côté toiture voisine — démontage par sections, rétention par cordes. Évacuation des branchages incluse.',
    'pruning', 'standard', 'completed',
    'Bordeaux', '33', 22,
    1400, 1800, NULL, 2,
    NULL, 1,
    TRUE, 'SEED — buzz/social proof', '{"name": "Mission archivée", "email": "archive@lescordistes.com", "phone": ""}'::jsonb,
    NOW() - INTERVAL '21 days', NOW() - INTERVAL '20 days'
),

-- 3. Peinture pignon copro — Paris 17 (mid+ budget, copro)
(
    'Peinture pignon aveugle 7 étages copropriété',
    'peinture-pignon-7etages-paris-batignolles',
    'Pignon aveugle de copropriété, Paris 17 (Batignolles). Surface ~210 m², peinture façade I3 sur enduit existant. Préparation : lavage HP + reprise de fissures. Couleur RAL 9001 (cassis). Intervention sur cordes + descenseur, accord ABF non requis (pignon non visible depuis voirie patrimoniale).',
    'painting', 'standard', 'completed',
    'Paris', '75', 28,
    7800, 9500, NULL, 5,
    NULL, 2,
    TRUE, 'SEED — buzz/social proof', '{"name": "Mission archivée", "email": "archive@lescordistes.com", "phone": ""}'::jsonb,
    NOW() - INTERVAL '34 days', NOW() - INTERVAL '32 days'
),

-- 4. Inspection éolienne offshore — Saint-Nazaire (premium, renfort_pro)
(
    'Inspection pales éolienne offshore parc Banc de Guérande',
    'inspection-pales-eolienne-saint-nazaire',
    'Mission renfort PRO : inspection visuelle + ressuage des 3 pales d''une éolienne offshore (parc Banc de Guérande, 12 km au large de Saint-Nazaire). Accès depuis nacelle de l''éolienne, descente sur cordes. Habilitations exigées : GWO BST + BTW + Sea Survival. Reporting photo détaillé.',
    'inspection', 'renfort_pro', 'completed',
    'Saint-Nazaire', '44', 95,
    NULL, NULL, 850, 3,
    'subcontracting', 2,
    TRUE, 'SEED — buzz/social proof', '{"name": "Mission archivée", "email": "archive@lescordistes.com", "phone": ""}'::jsonb,
    NOW() - INTERVAL '14 days', NOW() - INTERVAL '13 days'
),

-- 5. Nettoyage vitres tour bureaux — Marseille (mid+ budget, B2B)
(
    'Nettoyage vitres tour de bureaux R+15 — La Joliette',
    'nettoyage-vitres-tour-bureaux-marseille-joliette',
    'Nettoyage extérieur des vitres d''une tour de bureaux R+15 au quartier d''affaires de La Joliette (Marseille). Façade entièrement vitrée, environ 1 800 m² de surface vitrée. Travail sur cordes (pas de nacelle adaptée à cette hauteur côté mer). Intervention le week-end pour limiter l''impact sur les locataires. Eau osmosée, raclage manuel finition.',
    'cleaning', 'standard', 'completed',
    'Marseille', '13', 52,
    5800, 7400, NULL, 4,
    NULL, 2,
    TRUE, 'SEED — buzz/social proof', '{"name": "Mission archivée", "email": "archive@lescordistes.com", "phone": ""}'::jsonb,
    NOW() - INTERVAL '42 days', NOW() - INTERVAL '40 days'
),

-- 6. Sécurisation falaise — Nice (big budget, public)
(
    'Sécurisation falaise rocheuse littoral — Mont Boron',
    'securisation-falaise-nice-mont-boron',
    'Mission de purge et sécurisation d''une falaise calcaire instable surplombant le boulevard du Mont Boron (Nice). Risque de chutes de blocs sur voirie. Pose de filets pare-blocs ASM + ancrages chimiques. Coordination Mairie + sécurité civile. Intervention de nuit possible pour limiter la gêne. Hauteur cumulée 35 m.',
    'securing', 'renfort_pro', 'completed',
    'Nice', '06', 35,
    18000, 24000, NULL, 8,
    'subcontracting', 3,
    TRUE, 'SEED — buzz/social proof', '{"name": "Mission archivée", "email": "archive@lescordistes.com", "phone": ""}'::jsonb,
    NOW() - INTERVAL '38 days', NOW() - INTERVAL '36 days'
),

-- 7. Maçonnerie joints église classée — Strasbourg (ABF, mid+)
(
    'Reprise joints grès rose façade église classée',
    'reprise-joints-eglise-strasbourg-petite-france',
    'Reprise des joints de la façade ouest d''une église en grès rose, secteur Petite France (Strasbourg). Bâtiment classé MH — accord ABF obtenu. Mortier à la chaux NHL 3.5 + sable de Vosges. Surface ~85 m². Travail par cordes obligatoire (rues piétonnes étroites, pas de nacelle).',
    'masonry', 'standard', 'completed',
    'Strasbourg', '67', 18,
    6500, 8200, NULL, 6,
    NULL, 2,
    TRUE, 'SEED — buzz/social proof', '{"name": "Mission archivée", "email": "archive@lescordistes.com", "phone": ""}'::jsonb,
    NOW() - INTERVAL '64 days', NOW() - INTERVAL '62 days'
),

-- 8. Dépannage gouttière — Lille (small urgent, B2C)
(
    'Dépannage urgent gouttière zinc maison ancienne',
    'depannage-gouttiere-zinc-lille-vauban',
    'Gouttière zinc descellée après tempête, maison de ville Lille (Vauban). Risque d''infiltration en cas de prochain orage. Reprise des fixations + soudure étain sur 4 m. Intervention rapide (J+2). Hauteur 8 m, accès toiture impossible (tuiles fragiles).',
    'repair', 'standard', 'completed',
    'Lille', '59', 9,
    420, 600, NULL, 1,
    NULL, 1,
    TRUE, 'SEED — buzz/social proof', '{"name": "Mission archivée", "email": "archive@lescordistes.com", "phone": ""}'::jsonb,
    NOW() - INTERVAL '11 days', NOW() - INTERVAL '10 days'
),

-- 9. Industrie nettoyage cuves silo — Le Havre (premium, renfort_pro)
(
    'Nettoyage intérieur cuves silo céréalier',
    'nettoyage-cuves-silo-le-havre-port',
    'Mission renfort PRO : nettoyage intérieur de 3 cuves silo (capacité 2000T chacune) sur site céréalier portuaire — Le Havre. Travail en espace confiné + cordes (descente verticale 28 m). Habilitations : ATEX zone 22, CATEC, AIPR. Équipe 2 cordistes minimum. Tonnage poussières évacué.',
    'industry', 'renfort_pro', 'completed',
    'Le Havre', '76', 28,
    NULL, NULL, 920, 5,
    'subcontracting', 3,
    TRUE, 'SEED — buzz/social proof', '{"name": "Mission archivée", "email": "archive@lescordistes.com", "phone": ""}'::jsonb,
    NOW() - INTERVAL '46 days', NOW() - INTERVAL '44 days'
),

-- 10. Nettoyage vitres siège entreprise — Lyon Confluence (mid, B2B)
(
    'Nettoyage vitres siège tertiaire — Lyon Confluence',
    'nettoyage-vitres-siege-lyon-confluence',
    'Nettoyage trimestriel des vitres extérieures d''un siège social tertiaire à Lyon Confluence. Architecture contemporaine, façade verrière inclinée + casquettes en porte-à-faux. ~1 200 m² vitrés. Cordes obligatoires (les casquettes empêchent toute utilisation de nacelle). Eau osmosée alimentée depuis toiture. Intervention en semaine, hors heures de bureau.',
    'cleaning', 'standard', 'completed',
    'Lyon', '69', 32,
    3400, 4200, NULL, 2,
    NULL, 2,
    TRUE, 'SEED — buzz/social proof', '{"name": "Mission archivée", "email": "archive@lescordistes.com", "phone": ""}'::jsonb,
    NOW() - INTERVAL '17 days', NOW() - INTERVAL '16 days'
),

-- 11. Nettoyage verrière hôtel de luxe — Megève (montagne, B2B luxe)
(
    'Nettoyage verrière atrium hôtel 5★ — Mont d''Arbois',
    'nettoyage-verriere-hotel-megeve-mont-arbois',
    'Nettoyage de fin de saison de la grande verrière d''un hôtel 5★ à Megève (Mont d''Arbois). Atrium intérieur ~180 m² + verrières latérales toiture. Travail sur cordes côté extérieur (toiture pentue), équipement spécifique pour intervention sur verre trempé feuilleté. Conditions printanières en altitude — vigilance vent et plaques résiduelles.',
    'cleaning', 'standard', 'completed',
    'Megève', '74', 14,
    4200, 5500, NULL, 3,
    NULL, 2,
    TRUE, 'SEED — buzz/social proof', '{"name": "Mission archivée", "email": "archive@lescordistes.com", "phone": ""}'::jsonb,
    NOW() - INTERVAL '58 days', NOW() - INTERVAL '56 days'
),

-- 12. Élagage palmiers résidence — Cannes (small, B2C luxe)
(
    'Élagage 14 palmiers Phoenix résidence privée',
    'elagage-palmiers-cannes-californie',
    'Élagage saisonnier de 14 palmiers Phoenix canariensis (12 à 16 m) dans une résidence privée de la Californie (Cannes). Coupe des palmes sèches + pollinisation manuelle. Intervention sur cordes (sols fragiles, pas de nacelle). Évacuation des palmes en déchèterie verte incluse.',
    'pruning', 'standard', 'completed',
    'Cannes', '06', 16,
    1900, 2400, NULL, 2,
    NULL, 1,
    TRUE, 'SEED — buzz/social proof', '{"name": "Mission archivée", "email": "archive@lescordistes.com", "phone": ""}'::jsonb,
    NOW() - INTERVAL '24 days', NOW() - INTERVAL '23 days'
)

ON CONFLICT (slug) DO NOTHING;

-- Vérification
SELECT id, title, location_city, location_department, category, status, created_at
FROM jobs
WHERE admin_notes = 'SEED — buzz/social proof'
ORDER BY created_at DESC;
