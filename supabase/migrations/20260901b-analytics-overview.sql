-- ============================================================================
-- 20260901b — Analytics investisseur : deux RPC calculés à la demande
--
-- admin_analytics_overview(p_from, p_to) : toutes les tuiles de /admin/analytics
-- pour [p_from, p_to) ET la période précédente (même durée, décalée) en un seul
-- aller-retour. Zéro migration de données : tout est agrégé sur le schéma actuel.
--
-- admin_analytics_series(p_months) : série mensuelle (UTC) pour les graphiques.
--
-- HONNÊTETÉ DES CHIFFRES :
--   · Le revenu € est un PROXY : reconstruit depuis les packs de crédits
--     (3cr→60€, 10cr→150€, 20cr→280€ — source src/constants/creditPacks.ts),
--     seuls les achats Stripe comptent (stripe_session_id IS NOT NULL).
--     Un achat d'un montant hors packs compte 0 € (visible via `purchases`).
--   · Les bornes de mois de la série sont en UTC, épinglées explicitement
--     (AT TIME ZONE 'UTC') pour être indépendantes du fuseau de session.
--
-- Divisions par zéro : NULLIF partout — un ratio sans dénominateur vaut NULL
-- (JSON null), jamais une erreur ni un Infinity.
-- ============================================================================

BEGIN;

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
    -- Revenus proxy packs (achats Stripe uniquement)
    CROSS JOIN LATERAL (
        SELECT
            COALESCE(SUM(CASE amount WHEN 3 THEN 60 WHEN 10 THEN 150 WHEN 20 THEN 280 ELSE 0 END), 0)::int AS revenue_eur,
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
    SELECT COALESCE(SUM(CASE amount WHEN 3 THEN 60 WHEN 10 THEN 150 WHEN 20 THEN 280 ELSE 0 END), 0)::int AS revenue_eur
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

-- ⚠️ Les DEFAULT PRIVILEGES Supabase accordent EXECUTE à anon/authenticated sur
-- toute nouvelle fonction : révoquer PUBLIC seul ne suffit PAS (leçon 20260828l).
REVOKE EXECUTE ON FUNCTION public.admin_analytics_overview(timestamptz, timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_analytics_overview(timestamptz, timestamptz) TO service_role;

REVOKE EXECUTE ON FUNCTION public.admin_analytics_series(int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_analytics_series(int) TO service_role;

COMMIT;

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================
-- SELECT jsonb_pretty(public.admin_analytics_overview(now() - interval '30 days', now()));
-- SELECT jsonb_pretty(public.admin_analytics_series(12));
-- Une période sans donnée doit renvoyer des compteurs à 0 et des ratios null,
-- jamais une erreur de division par zéro.
-- ============================================================================
