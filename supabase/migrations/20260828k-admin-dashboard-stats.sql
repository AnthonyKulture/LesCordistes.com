-- ============================================================================
-- RPC unique pour les stats du dashboard admin
--
-- POURQUOI : fetchOpsStats (et son miroir /api/ops/stats) émettait 16 requêtes
-- HTTP parallèles vers PostgREST (12 counts/selects + 4 RPC). Le coût n'est pas
-- dans Postgres — chaque agrégat est trivial à cette volumétrie — mais dans les
-- 16 connexions simultanées : négociation TLS sur instance froide, 16 sessions
-- concurrentes côté pooler, et un TTFB égal à la PLUS LENTE des 16.
--
-- Ce RPC fait tout en UN aller-retour. La sortie reproduit à l'identique la
-- sémantique des requêtes remplacées, y compris les 3 RPC 20260610 (leurs
-- expressions sont copiées telles quelles). Les anciens RPC restent en place :
-- le code applicatif garde un repli dessus tant que cette migration n'est pas
-- appliquée (déploiement sûr dans les deux ordres).
-- ============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.admin_dashboard_stats(
    p_week_ago  timestamptz,
    p_month_ago timestamptz
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
SELECT jsonb_build_object(
    'jobs', (
        SELECT jsonb_build_object(
            'pending',    COUNT(*) FILTER (WHERE status = 'pending'),
            'live',       COUNT(*) FILTER (WHERE status = 'live'),
            'rejected',   COUNT(*) FILTER (WHERE status = 'rejected'),
            'total_week', COUNT(*) FILTER (WHERE created_at >= p_week_ago)
        ) FROM public.jobs
    ),
    'profiles', (
        SELECT jsonb_build_object(
            'total_pros',    COUNT(*) FILTER (WHERE role = 'pro'),
            'total_clients', COUNT(*) FILTER (WHERE role = 'client'),
            'new_week',      COUNT(*) FILTER (WHERE role = 'pro' AND created_at >= p_week_ago)
        ) FROM public.profiles
    ),
    -- Même sémantique que admin_credits_agg()
    'credits_agg', (
        SELECT jsonb_build_object(
            'sum_balance',        COALESCE(SUM(balance), 0),
            'avg_balance',        COALESCE(ROUND(AVG(balance)::numeric, 2), 0),
            'count_with_credits', COUNT(*) FILTER (WHERE balance > 0)
        ) FROM public.credits
    ),
    -- Même sémantique que admin_sum_transactions('purchase', p_month_ago)
    -- et admin_sum_transactions('spend', NULL)
    'transactions', (
        SELECT jsonb_build_object(
            'purchases_month', COALESCE(SUM(ABS(amount)) FILTER (WHERE type = 'purchase' AND created_at >= p_month_ago), 0),
            'spends_total',    COALESCE(SUM(ABS(amount)) FILTER (WHERE type = 'spend'), 0)
        ) FROM public.credit_transactions
    ),
    'leads', (
        SELECT jsonb_build_object(
            'total',     COUNT(*),
            'step_5',    COUNT(*) FILTER (WHERE step_reached >= 5),
            'last_week', COUNT(*) FILTER (WHERE created_at >= p_week_ago)
        ) FROM public.leads
    ),
    -- Même sémantique que admin_top_live_cities(5)
    'top_cities', COALESCE((
        SELECT jsonb_agg(t) FROM (
            SELECT location_city AS city, COUNT(*) AS count
            FROM public.jobs
            WHERE status = 'live'
              AND location_city IS NOT NULL
              AND TRIM(location_city) <> ''
            GROUP BY location_city
            ORDER BY count DESC
            LIMIT 5
        ) t
    ), '[]'::jsonb),
    'recent_actions', COALESCE((
        SELECT jsonb_agg(a) FROM (
            SELECT id, action, target_table, target_id, payload, performed_by, created_at
            FROM public.admin_actions
            ORDER BY created_at DESC
            LIMIT 10
        ) a
    ), '[]'::jsonb),
    'recent_unlocks', COALESCE((
        SELECT jsonb_agg(u) FROM (
            SELECT ul.id,
                   ul.unlocked_at,
                   jsonb_build_object(
                       'id', p.id, 'full_name', p.full_name,
                       'company_name', p.company_name, 'avatar_url', p.avatar_url
                   ) AS pro,
                   jsonb_build_object(
                       'id', j.id, 'title', j.title,
                       'location_city', j.location_city, 'status', j.status
                   ) AS job
            FROM public.unlocked_leads ul
            LEFT JOIN public.profiles p ON p.id = ul.pro_id
            LEFT JOIN public.jobs     j ON j.id = ul.job_id
            ORDER BY ul.unlocked_at DESC
            LIMIT 15
        ) u
    ), '[]'::jsonb)
);
$$;

REVOKE ALL ON FUNCTION public.admin_dashboard_stats(timestamptz, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_dashboard_stats(timestamptz, timestamptz) TO service_role;

COMMIT;

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================
-- SELECT jsonb_pretty(public.admin_dashboard_stats(now() - interval '7 days',
--                                                  now() - interval '30 days'));
-- Comparer avec les valeurs de l'écran /admin avant migration : chaque compteur
-- doit être identique.
-- ============================================================================
