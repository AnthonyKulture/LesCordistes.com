-- ============================================================================
-- 20260901d — KPI 2 : instrumentation (revenus exacts, cycle de vie mission,
-- ROI du crédit, attribution)
--
-- Contenu :
--   a. credit_transactions.amount_cents + backfill des achats Stripe (proxy packs)
--   b. FK credit_transactions.pro_id → ON DELETE SET NULL (décision produit
--      2026-09-01 #3) — nom de contrainte et table cible découverts dynamiquement
--      (les deux définitions du repo divergent : supabase-migrations-mvp.sql
--      référence profiles ON DELETE CASCADE, supabase-stripe-fix.sql référence
--      auth.users sans action — on ignore laquelle a gagné en base)
--   c. type='adjustment' dans la CHECK de credit_transactions.type
--   d. jobs.completed_at / cancelled_at + trigger de première transition
--   e. unlocked_leads.outcome / outcome_at / outcome_email_sent_at (relance J+15)
--   f. profiles.acquisition_source + handle_new_user (copie du metadata)
--   g. admin_analytics_overview / admin_analytics_series : revenu exact via
--      amount_cents, proxy packs en repli
--   + schedule pg_cron du lead-outcome-cron (hors transaction, tolérant)
--
-- Idempotente et relançable. Ordre de déploiement : le code applicatif tourne
-- avant ET après (webhook et route admin ont un repli 42703/23514).
-- ============================================================================

BEGIN;

-- ────────────────────────────────────────────────────────────────────────────
-- a. amount_cents — montant réel encaissé (session.amount_total Stripe)
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.credit_transactions ADD COLUMN IF NOT EXISTS amount_cents INTEGER;

-- Backfill des achats Stripe existants par le mapping packs (Starter 3cr/60€,
-- Pro 10cr/150€, Business 20cr/280€ — src/constants/creditPacks.ts).
-- Un achat d'un montant hors packs reste NULL (le proxy des RPC le comptera 0).
-- Guardé : stripe_session_id n'existe que depuis 20260828f.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'credit_transactions'
          AND column_name = 'stripe_session_id'
    ) THEN
        UPDATE public.credit_transactions
        SET amount_cents = CASE amount WHEN 3 THEN 6000 WHEN 10 THEN 15000 WHEN 20 THEN 28000 END
        WHERE stripe_session_id IS NOT NULL
          AND amount_cents IS NULL
          AND amount IN (3, 10, 20);
    ELSE
        RAISE NOTICE 'stripe_session_id absent (20260828f pas encore appliquée) — backfill amount_cents sauté.';
    END IF;
END $$;

-- ────────────────────────────────────────────────────────────────────────────
-- b. FK pro_id → ON DELETE SET NULL
-- On garde la table cible actuelle (profiles OU auth.users selon la définition
-- qui a gagné) : seul le comportement de suppression change. L'historique des
-- transactions survit à la suppression d'un pro, pro_id devient NULL.
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.credit_transactions ALTER COLUMN pro_id DROP NOT NULL;

DO $$
DECLARE
    v_con record;
    v_found boolean := false;
BEGIN
    FOR v_con IN
        SELECT c.conname,
               c.confrelid::regclass::text AS reftable,
               (SELECT a.attname FROM pg_attribute a
                WHERE a.attrelid = c.confrelid AND a.attnum = c.confkey[1]) AS refcol,
               c.confdeltype
        FROM pg_constraint c
        WHERE c.conrelid = 'public.credit_transactions'::regclass
          AND c.contype = 'f'
          AND (SELECT a.attname FROM pg_attribute a
               WHERE a.attrelid = c.conrelid AND a.attnum = c.conkey[1]) = 'pro_id'
    LOOP
        v_found := true;
        IF v_con.confdeltype <> 'n' THEN
            EXECUTE format('ALTER TABLE public.credit_transactions DROP CONSTRAINT %I', v_con.conname);
            EXECUTE format(
                'ALTER TABLE public.credit_transactions ADD CONSTRAINT %I FOREIGN KEY (pro_id) REFERENCES %s(%I) ON DELETE SET NULL',
                v_con.conname, v_con.reftable, v_con.refcol
            );
            RAISE NOTICE 'FK % recréée : pro_id → %(%) ON DELETE SET NULL', v_con.conname, v_con.reftable, v_con.refcol;
        ELSE
            RAISE NOTICE 'FK % déjà en ON DELETE SET NULL — rien à faire.', v_con.conname;
        END IF;
    END LOOP;

    IF NOT v_found THEN
        ALTER TABLE public.credit_transactions
            ADD CONSTRAINT credit_transactions_pro_id_fkey
            FOREIGN KEY (pro_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
        RAISE NOTICE 'Aucune FK pro_id trouvée — credit_transactions_pro_id_fkey créée vers profiles(id).';
    END IF;
END $$;

-- ────────────────────────────────────────────────────────────────────────────
-- c. type='adjustment' — ajustements admin distincts des achats/dépenses.
-- Nom de la CHECK découvert dynamiquement (mvp : 3 valeurs sans nom explicite,
-- stripe-fix : 4 valeurs avec admin_adjustment). Le nouveau jeu inclut les deux
-- historiques pour ne casser aucune ligne existante.
--
-- Impact vérifié sur les lecteurs de `type` :
--   · admin_sum_transactions(p_type) : les ajustements sortent des sommes
--     'purchase'/'spend' — voulu, un geste admin n'est ni un revenu ni une dépense.
--   · admin_analytics_* : filtrent type='purchase' AND stripe_session_id IS NOT
--     NULL — les ajustements (sans session Stripe) en étaient déjà exclus.
--   · Policies RLS credit_transactions : aucun filtre sur type.
-- ────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
    v_name text;
    v_def  text;
BEGIN
    SELECT conname, pg_get_constraintdef(oid)
    INTO v_name, v_def
    FROM pg_constraint
    WHERE conrelid = 'public.credit_transactions'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%purchase%'
    ORDER BY conname
    LIMIT 1;

    IF v_name IS NULL THEN
        v_name := 'credit_transactions_type_check';
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conrelid = 'public.credit_transactions'::regclass AND conname = v_name
        ) THEN
            EXECUTE format(
                'ALTER TABLE public.credit_transactions ADD CONSTRAINT %I CHECK (type IN (''purchase'',''spend'',''refund'',''admin_adjustment'',''adjustment'')) NOT VALID',
                v_name
            );
            RAISE NOTICE 'Aucune CHECK sur type — % créée.', v_name;
        END IF;
    ELSIF v_def NOT LIKE '%''adjustment''%' THEN
        EXECUTE format('ALTER TABLE public.credit_transactions DROP CONSTRAINT %I', v_name);
        EXECUTE format(
            'ALTER TABLE public.credit_transactions ADD CONSTRAINT %I CHECK (type IN (''purchase'',''spend'',''refund'',''admin_adjustment'',''adjustment'')) NOT VALID',
            v_name
        );
        RAISE NOTICE 'CHECK % étendue avec ''adjustment''.', v_name;
    ELSE
        RAISE NOTICE 'CHECK % contient déjà ''adjustment'' — rien à faire.', v_name;
    END IF;

    -- Validation séparée : si une ligne historique porte un type hors liste,
    -- on garde la contrainte NOT VALID (les nouvelles lignes restent contrôlées)
    -- au lieu de faire échouer la migration.
    BEGIN
        EXECUTE format('ALTER TABLE public.credit_transactions VALIDATE CONSTRAINT %I', v_name);
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'VALIDATE % impossible (%) — contrainte laissée NOT VALID.', v_name, SQLERRM;
    END;
END $$;

-- ────────────────────────────────────────────────────────────────────────────
-- d. Cycle de vie mission : completed_at / cancelled_at.
-- Posés par trigger à la PREMIÈRE transition vers le statut, jamais écrasés.
-- Backfill volontairement absent : updated_at est pollué par des UPDATE sans
-- rapport (revalidation, modération…), toute rétro-datation serait fausse.
-- Les missions terminées/annulées avant cette migration restent à NULL — assumé.
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.set_job_lifecycle_timestamps()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed' AND NEW.completed_at IS NULL THEN
        NEW.completed_at := NOW();
    END IF;
    IF NEW.status = 'cancelled' AND OLD.status IS DISTINCT FROM 'cancelled' AND NEW.cancelled_at IS NULL THEN
        NEW.cancelled_at := NOW();
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_job_lifecycle_timestamps ON public.jobs;
CREATE TRIGGER set_job_lifecycle_timestamps
    BEFORE UPDATE ON public.jobs
    FOR EACH ROW EXECUTE FUNCTION public.set_job_lifecycle_timestamps();

-- Pas de REVOKE nécessaire : fonction trigger (RETURNS trigger), inappelable
-- directement via l'API PostgREST.

-- ────────────────────────────────────────────────────────────────────────────
-- e. Outcome des déblocages (décision produit 2026-09-01 #4) — relance J+15
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.unlocked_leads ADD COLUMN IF NOT EXISTS outcome TEXT;
ALTER TABLE public.unlocked_leads ADD COLUMN IF NOT EXISTS outcome_at TIMESTAMPTZ;
ALTER TABLE public.unlocked_leads ADD COLUMN IF NOT EXISTS outcome_email_sent_at TIMESTAMPTZ;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'public.unlocked_leads'::regclass
          AND conname = 'unlocked_leads_outcome_check'
    ) THEN
        ALTER TABLE public.unlocked_leads
            ADD CONSTRAINT unlocked_leads_outcome_check
            CHECK (outcome IN ('won', 'lost', 'no_response'));
    END IF;
END $$;

-- Index partiel pour la sélection quotidienne du cron (leads sans outcome ni email).
CREATE INDEX IF NOT EXISTS idx_unlocked_leads_outcome_pending
    ON public.unlocked_leads (unlocked_at)
    WHERE outcome IS NULL AND outcome_email_sent_at IS NULL;

-- ────────────────────────────────────────────────────────────────────────────
-- f. Attribution : profiles.acquisition_source, copié depuis le metadata signUp.
--
-- ⚠️ handle_new_user est la fonction la plus critique du projet (l'inscription
-- ne doit JAMAIS casser). Corps repris à L'IDENTIQUE de
-- supabase-fix-handle-new-user.sql (dernière définition en vigueur — aucune
-- migration ultérieure ne l'a re-remplacée, 20260828h n'a fait qu'un ALTER
-- search_path sur les fonctions qui n'en avaient pas, celle-ci en avait déjà un).
-- Seuls ajouts : la colonne acquisition_source dans l'INSERT (NULL si absente
-- du metadata) et sa règle ON CONFLICT (first-touch : jamais écrasée).
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS acquisition_source TEXT;

-- anon n'y a pas accès : 20260828g remplace le SELECT table par un GRANT
-- colonne-par-colonne, une colonne neuve n'y figure pas. Rien à re-poser.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name, first_name, last_name, phone, company_name, acquisition_source)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', ''), 'pro'),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), ''),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'first_name', ''), ''),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'last_name', ''), ''),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'phone', ''), ''),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'company_name', ''), ''),
    NULLIF(NEW.raw_user_meta_data->>'acquisition_source', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email        = EXCLUDED.email,
    role         = COALESCE(NULLIF(EXCLUDED.role, ''), profiles.role),
    full_name    = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
    first_name   = COALESCE(NULLIF(EXCLUDED.first_name, ''), profiles.first_name),
    last_name    = COALESCE(NULLIF(EXCLUDED.last_name, ''), profiles.last_name),
    phone        = COALESCE(NULLIF(EXCLUDED.phone, ''), profiles.phone),
    company_name = COALESCE(NULLIF(EXCLUDED.company_name, ''), profiles.company_name),
    acquisition_source = COALESCE(profiles.acquisition_source, EXCLUDED.acquisition_source),
    updated_at   = NOW();

  RETURN NEW;
END;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- g. RPC analytics : revenu exact dès qu'une transaction porte amount_cents,
-- proxy packs sinon. Corps repris de 20260901b, seule la formule revenue_eur
-- change (les deux fonctions). revenue_eur passe d'int à numeric(2 déc.).
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_analytics_overview(
    p_from timestamptz,
    p_to   timestamptz
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
WITH bounds AS (
    SELECT 'current'::text AS k, p_from AS f, p_to AS t
    UNION ALL
    SELECT 'previous', p_from - (p_to - p_from), p_from
),
per AS (
    SELECT
        b.k,
        jsonb_build_object(
            'revenue_eur', rev.revenue_eur,
            'purchases', rev.purchases,
            'buyers', rev.buyers,
            'arpu_eur', ROUND(rev.revenue_eur::numeric / NULLIF(rev.buyers, 0), 2),
            'missions_moderated', liq.cohort,
            'revenue_per_mission_eur', ROUND(rev.revenue_eur::numeric / NULLIF(liq.cohort, 0), 2),
            'liquidity', jsonb_build_object(
                'cohort', liq.cohort,
                'pct_unlocked', ROUND(liq.unlocked::numeric / NULLIF(liq.cohort, 0), 4),
                'median_hours_to_first_unlock', ROUND(liq.median_hours_first_unlock::numeric, 1),
                'avg_unlocks_per_mission', ROUND(liq.total_unlocks::numeric / NULLIF(liq.cohort, 0), 2),
                'pct_expired_no_unlock', ROUND(liq.expired_no_unlock::numeric / NULLIF(liq.cohort, 0), 4)
            ),
            'supply', jsonb_build_object(
                'new_pros', sup.new_pros,
                'active_pros', act.active_pros
            ),
            'demand', jsonb_build_object(
                'jobs_created', dj.jobs_created,
                'mix_standard', dj.mix_standard,
                'mix_renfort_pro', dj.mix_renfort_pro,
                'wizard_leads', wl.wizard_leads,
                'wizard_completed', wl.wizard_completed,
                'wizard_completion', ROUND(wl.wizard_completed::numeric / NULLIF(wl.wizard_leads, 0), 4),
                'moderated_total', mo.moderated_total,
                'approved', mo.approved,
                'pct_approved', ROUND(mo.approved::numeric / NULLIF(mo.moderated_total, 0), 4),
                'median_hours_moderation', ROUND(mo.median_hours_moderation::numeric, 1)
            ),
            'engagement', jsonb_build_object(
                'conversations', cv.conversations,
                'reviews', rv.reviews
            )
        ) AS metrics
    FROM bounds b
    -- Revenu : exact (amount_cents) avec repli proxy packs (achats Stripe uniquement)
    CROSS JOIN LATERAL (
        SELECT
            ROUND(COALESCE(SUM(COALESCE(
                amount_cents / 100.0,
                CASE amount WHEN 3 THEN 60 WHEN 10 THEN 150 WHEN 20 THEN 280 ELSE 0 END
            )), 0)::numeric, 2) AS revenue_eur,
            COUNT(*)::int AS purchases,
            COUNT(DISTINCT pro_id)::int AS buyers
        FROM public.credit_transactions
        WHERE type = 'purchase'
          AND stripe_session_id IS NOT NULL
          AND created_at >= b.f AND created_at < b.t
    ) rev
    -- Liquidité : cohorte des missions modérées-approuvées dans la période
    -- (moderated_at dans [f, t) et status hors pending/rejected — une mission
    -- rejetée ne peut pas être débloquée, l'inclure fausserait pct_unlocked).
    CROSS JOIN LATERAL (
        SELECT
            COUNT(*)::int AS cohort,
            COUNT(*) FILTER (WHERE u.n > 0)::int AS unlocked,
            COALESCE(SUM(u.n), 0)::int AS total_unlocks,
            COUNT(*) FILTER (WHERE j.status = 'expired' AND u.n = 0)::int AS expired_no_unlock,
            percentile_cont(0.5) WITHIN GROUP (
                ORDER BY EXTRACT(EPOCH FROM (u.first_unlock - j.moderated_at)) / 3600.0
            ) FILTER (WHERE u.first_unlock IS NOT NULL) AS median_hours_first_unlock
        FROM public.jobs j
        CROSS JOIN LATERAL (
            SELECT COUNT(*)::int AS n, MIN(ul.unlocked_at) AS first_unlock
            FROM public.unlocked_leads ul
            WHERE ul.job_id = j.id
        ) u
        WHERE j.moderated_at >= b.f AND j.moderated_at < b.t
          AND j.status NOT IN ('pending', 'rejected')
    ) liq
    -- Modération : toutes les missions modérées dans la période, rejets inclus
    CROSS JOIN LATERAL (
        SELECT
            COUNT(*)::int AS moderated_total,
            COUNT(*) FILTER (WHERE status NOT IN ('pending', 'rejected'))::int AS approved,
            percentile_cont(0.5) WITHIN GROUP (
                ORDER BY EXTRACT(EPOCH FROM (moderated_at - created_at)) / 3600.0
            ) AS median_hours_moderation
        FROM public.jobs
        WHERE moderated_at >= b.f AND moderated_at < b.t
    ) mo
    CROSS JOIN LATERAL (
        SELECT
            COUNT(*)::int AS jobs_created,
            COUNT(*) FILTER (WHERE type = 'renfort_pro')::int AS mix_renfort_pro,
            COUNT(*) FILTER (WHERE COALESCE(type, 'standard') <> 'renfort_pro')::int AS mix_standard
        FROM public.jobs
        WHERE created_at >= b.f AND created_at < b.t
    ) dj
    CROSS JOIN LATERAL (
        SELECT
            COUNT(*)::int AS wizard_leads,
            COUNT(*) FILTER (WHERE step_reached >= 5)::int AS wizard_completed
        FROM public.leads
        WHERE created_at >= b.f AND created_at < b.t
    ) wl
    CROSS JOIN LATERAL (
        SELECT COUNT(*)::int AS new_pros
        FROM public.profiles
        WHERE role = 'pro' AND created_at >= b.f AND created_at < b.t
    ) sup
    CROSS JOIN LATERAL (
        SELECT COUNT(DISTINCT pro_id)::int AS active_pros
        FROM public.unlocked_leads
        WHERE unlocked_at >= b.f AND unlocked_at < b.t
    ) act
    CROSS JOIN LATERAL (
        SELECT COUNT(*)::int AS conversations
        FROM public.conversations
        WHERE created_at >= b.f AND created_at < b.t
    ) cv
    CROSS JOIN LATERAL (
        SELECT COUNT(*)::int AS reviews
        FROM public.reviews
        WHERE created_at >= b.f AND created_at < b.t
    ) rv
)
SELECT jsonb_object_agg(per.k, per.metrics) || jsonb_build_object(
    'all_time', (
        SELECT jsonb_build_object(
            'buyers_total', a.buyers_total,
            'repeat_buyers', a.repeat_buyers,
            'repeat_rate', ROUND(a.repeat_buyers::numeric / NULLIF(a.buyers_total, 0), 4),
            'total_pros', a.total_pros,
            'complete_profiles', a.complete_profiles,
            'pct_complete_profiles', ROUND(a.complete_profiles::numeric / NULLIF(a.total_pros, 0), 4)
        )
        FROM (
            SELECT
                (SELECT COUNT(*)::int FROM (
                    SELECT pro_id FROM public.credit_transactions
                    WHERE type = 'purchase' AND stripe_session_id IS NOT NULL
                    GROUP BY pro_id
                ) s1) AS buyers_total,
                (SELECT COUNT(*)::int FROM (
                    SELECT pro_id FROM public.credit_transactions
                    WHERE type = 'purchase' AND stripe_session_id IS NOT NULL
                    GROUP BY pro_id
                    HAVING COUNT(*) >= 2
                ) s2) AS repeat_buyers,
                (SELECT COUNT(*)::int FROM public.profiles WHERE role = 'pro') AS total_pros,
                (SELECT COUNT(*)::int FROM public.profiles
                 WHERE role = 'pro' AND LENGTH(COALESCE(bio, '')) >= 150) AS complete_profiles
        ) a
    )
)
FROM per;
$$;

CREATE OR REPLACE FUNCTION public.admin_analytics_series(
    p_months int
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
WITH months AS (
    SELECT (date_trunc('month', now() AT TIME ZONE 'UTC') - make_interval(months => g)) AT TIME ZONE 'UTC' AS m_start
    FROM generate_series(GREATEST(COALESCE(p_months, 12), 1) - 1, 0, -1) AS g
)
SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
        'month', to_char(m.m_start AT TIME ZONE 'UTC', 'YYYY-MM'),
        'revenue_eur', rev.revenue_eur,
        'missions_published', pub.missions_published,
        'new_pros', np.new_pros,
        'unlocks', un.unlocks
    ) ORDER BY m.m_start
), '[]'::jsonb)
FROM months m
CROSS JOIN LATERAL (
    SELECT ROUND(COALESCE(SUM(COALESCE(
        amount_cents / 100.0,
        CASE amount WHEN 3 THEN 60 WHEN 10 THEN 150 WHEN 20 THEN 280 ELSE 0 END
    )), 0)::numeric, 2) AS revenue_eur
    FROM public.credit_transactions
    WHERE type = 'purchase'
      AND stripe_session_id IS NOT NULL
      AND created_at >= m.m_start AND created_at < m.m_start + interval '1 month'
) rev
CROSS JOIN LATERAL (
    SELECT COUNT(*)::int AS missions_published
    FROM public.jobs
    WHERE moderated_at >= m.m_start AND moderated_at < m.m_start + interval '1 month'
      AND status NOT IN ('pending', 'rejected')
) pub
CROSS JOIN LATERAL (
    SELECT COUNT(*)::int AS new_pros
    FROM public.profiles
    WHERE role = 'pro'
      AND created_at >= m.m_start AND created_at < m.m_start + interval '1 month'
) np
CROSS JOIN LATERAL (
    SELECT COUNT(*)::int AS unlocks
    FROM public.unlocked_leads
    WHERE unlocked_at >= m.m_start AND unlocked_at < m.m_start + interval '1 month'
) un;
$$;

-- ⚠️ Un CREATE OR REPLACE conserve les ACL (vérifié sur cluster jetable), mais
-- on re-pose quand même les verrous : les DEFAULT PRIVILEGES Supabase accordent
-- EXECUTE à anon/authenticated sur toute NOUVELLE fonction — si ce fichier est
-- un jour rejoué sur une base où 20260901b n'est pas passée, les fonctions
-- naissent ici et doivent être verrouillées ici (leçon 20260828l).
REVOKE EXECUTE ON FUNCTION public.admin_analytics_overview(timestamptz, timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_analytics_overview(timestamptz, timestamptz) TO service_role;

REVOKE EXECUTE ON FUNCTION public.admin_analytics_series(int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_analytics_series(int) TO service_role;

COMMIT;

-- ────────────────────────────────────────────────────────────────────────────
-- Schedule pg_cron : lead-outcome-cron, quotidien 07:30 UTC.
-- Hors transaction et tolérant : sur un cluster sans pg_cron (validation
-- locale), on log et on sort — le reste de la migration est déjà committé.
-- Prérequis prod : edge function déployée avec
--   npx supabase functions deploy lead-outcome-cron --no-verify-jwt --project-ref esvnvxkbnhvxpnlhyjsw
-- Le secret est lu depuis Vault (entrée 'cron_secret', créée par
-- 20260427-jobs-freshness-cron-schedule.sql).
-- ────────────────────────────────────────────────────────────────────────────
DO $sched$
BEGIN
    BEGIN
        EXECUTE 'CREATE EXTENSION IF NOT EXISTS pg_cron';
        EXECUTE 'CREATE EXTENSION IF NOT EXISTS pg_net';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'pg_cron/pg_net indisponibles (%) — poser le schedule manuellement dans le SQL Editor.', SQLERRM;
        RETURN;
    END;

    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'lead-outcome-cron') THEN
        PERFORM cron.unschedule('lead-outcome-cron');
    END IF;

    PERFORM cron.schedule(
        'lead-outcome-cron',
        '30 7 * * *',
        $cron$
        SELECT net.http_post(
            url     := 'https://esvnvxkbnhvxpnlhyjsw.supabase.co/functions/v1/lead-outcome-cron',
            headers := jsonb_build_object(
                'Content-Type',  'application/json',
                'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_secret')
            )
        );
        $cron$
    );
    RAISE NOTICE 'lead-outcome-cron planifié (30 7 * * *).';
END $sched$;

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================
-- 1) Backfill : SELECT amount, amount_cents, COUNT(*) FROM credit_transactions
--    WHERE stripe_session_id IS NOT NULL GROUP BY 1, 2;
-- 2) FK : SELECT conname, confdeltype FROM pg_constraint
--    WHERE conrelid='public.credit_transactions'::regclass AND contype='f';
--    → confdeltype = 'n' pour pro_id.
-- 3) CHECK : SELECT pg_get_constraintdef(oid) FROM pg_constraint
--    WHERE conrelid='public.credit_transactions'::regclass AND contype='c';
-- 4) Trigger : UPDATE jobs SET status='completed' WHERE id='<uuid>';
--    → completed_at posé, puis un second aller-retour ne l'écrase pas.
-- 5) Inscription : créer un compte email+password ET un compte Google →
--    profils créés, welcome email reçu, acquisition_source rempli (ou NULL
--    pour OAuth — le metadata n'y transite pas).
-- 6) ACL : SELECT proacl FROM pg_proc WHERE proname LIKE 'admin_analytics%';
--    → pas d'anon/authenticated.
-- 7) Schedule : SELECT jobname, schedule, active FROM cron.job
--    WHERE jobname = 'lead-outcome-cron';
-- ============================================================================
