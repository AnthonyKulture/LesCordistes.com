-- Migration : ajoute 2 nouvelles catégories à l'ENUM job_category :
--   - repair  : Dépannage
--   - pruning : Élagage & Végétaux
--
-- Idempotent — peut être ré-exécuté sans casse.
-- Prérequis : la migration `supabase-add-categories-securing-telecom-inspection.sql`
-- doit avoir été exécutée au préalable (création du type ENUM).

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'job_category'::regtype AND enumlabel = 'repair') THEN
        ALTER TYPE job_category ADD VALUE 'repair';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'job_category'::regtype AND enumlabel = 'pruning') THEN
        ALTER TYPE job_category ADD VALUE 'pruning';
    END IF;
END $$;

-- Vérification : SELECT enum_range(NULL::job_category);
-- → doit contenir 12 valeurs incluant repair et pruning.
