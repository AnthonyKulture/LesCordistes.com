-- Migration : convert jobs.category from TEXT+CHECK to a proper Postgres ENUM
-- and add 3 new categories : securing, telecom, inspection.
--
-- Why ENUM ? Le Table Editor de Supabase affiche un dropdown natif pour
-- les colonnes de type ENUM, alors qu'avec un CHECK il faut taper la valeur
-- à la main (et la moindre faute = erreur d'insert).
--
-- Idempotent : le bloc DO peut être ré-exécuté sans casse.
-- Ordre des opérations :
--   1. Création (ou complétion) du type ENUM job_category
--   2. Suppression du CHECK constraint historique (si présent)
--   3. Migration de la colonne category vers le type ENUM
--   4. Ré-attribution de la valeur par défaut

DO $$
BEGIN
    -- 1. Créer le type ENUM s'il n'existe pas, sinon ajouter les nouvelles valeurs
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_category') THEN
        CREATE TYPE job_category AS ENUM (
            'cleaning',
            'construction',
            'masonry',
            'painting',
            'industry',
            'event',
            'securing',
            'telecom',
            'inspection',
            'other'
        );
    ELSE
        -- Type déjà créé : ajouter uniquement les valeurs manquantes
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'job_category'::regtype AND enumlabel = 'securing') THEN
            ALTER TYPE job_category ADD VALUE 'securing';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'job_category'::regtype AND enumlabel = 'telecom') THEN
            ALTER TYPE job_category ADD VALUE 'telecom';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'job_category'::regtype AND enumlabel = 'inspection') THEN
            ALTER TYPE job_category ADD VALUE 'inspection';
        END IF;
    END IF;
END $$;

-- 2. Drop l'ancien CHECK constraint s'il existe encore
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_category_check;

-- 3. Migrer la colonne TEXT vers le type ENUM (no-op si déjà ENUM)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'jobs'
          AND column_name = 'category'
          AND data_type = 'text'
    ) THEN
        ALTER TABLE jobs
            ALTER COLUMN category TYPE job_category
            USING category::job_category;
    END IF;
END $$;

-- 4. Réindex (l'index existant est conservé, mais on le rappelle pour mémoire)
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);

-- Vérification rapide :
-- SELECT enum_range(NULL::job_category);
-- → doit retourner 10 valeurs incluant securing, telecom, inspection
