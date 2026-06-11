-- ============================================================
-- MIGRATION : Fonctions PostgreSQL pour l'optimisation back office
-- À exécuter dans : Supabase > SQL Editor
-- Date : 2026-06-10
-- ============================================================
--
-- Ces 3 fonctions remplacent des requêtes pleine-table côté JavaScript.
-- Elles sont appelées via .rpc() depuis la route /api/ops/stats.
-- Impact : ~-60% de données transférées DB → serveur Next.js.
-- ============================================================

-- ------------------------------------------------------------
-- 1. admin_credits_agg
--    Remplace : admin.from('credits').select('balance')
--    Retourne : un seul objet avec sum, avg, et count > 0
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_credits_agg()
RETURNS TABLE (
    sum_balance       NUMERIC,
    avg_balance       NUMERIC,
    count_with_credits BIGINT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
    SELECT
        COALESCE(SUM(balance), 0)                               AS sum_balance,
        COALESCE(ROUND(AVG(balance)::NUMERIC, 2), 0)            AS avg_balance,
        COUNT(*) FILTER (WHERE balance > 0)                     AS count_with_credits
    FROM public.credits;
$$;

-- Droits : accessible uniquement via service_role (admin)
REVOKE ALL ON FUNCTION public.admin_credits_agg() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_credits_agg() TO service_role;


-- ------------------------------------------------------------
-- 2. admin_sum_transactions
--    Remplace :
--      admin.from('credit_transactions').select('amount').eq('type','purchase').gte('created_at', monthAgo)
--      admin.from('credit_transactions').select('amount').eq('type','spend')
--    Paramètres :
--      p_type  : 'purchase' | 'spend'
--      p_since : ISO timestamp ou NULL pour cumulé toutes dates
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_sum_transactions(
    p_type  TEXT,
    p_since TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (total_amount NUMERIC)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
    SELECT COALESCE(SUM(ABS(amount)), 0) AS total_amount
    FROM public.credit_transactions
    WHERE type = p_type
      AND (p_since IS NULL OR created_at >= p_since);
$$;

REVOKE ALL ON FUNCTION public.admin_sum_transactions(TEXT, TIMESTAMPTZ) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_sum_transactions(TEXT, TIMESTAMPTZ) TO service_role;


-- ------------------------------------------------------------
-- 3. admin_top_live_cities
--    Remplace : admin.from('jobs').select('location_city').eq('status','live').limit(500)
--               + calcul JS (Map + sort + slice)
--    Paramètres :
--      p_limit : nombre de villes à retourner (défaut 5)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_top_live_cities(p_limit INT DEFAULT 5)
RETURNS TABLE (city TEXT, count BIGINT)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
    SELECT
        location_city                   AS city,
        COUNT(*)                        AS count
    FROM public.jobs
    WHERE status = 'live'
      AND location_city IS NOT NULL
      AND TRIM(location_city) <> ''
    GROUP BY location_city
    ORDER BY count DESC
    LIMIT p_limit;
$$;

REVOKE ALL ON FUNCTION public.admin_top_live_cities(INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_top_live_cities(INT) TO service_role;

-- ============================================================
-- VÉRIFICATION (optionnel, à exécuter manuellement après)
-- ============================================================
-- SELECT * FROM public.admin_credits_agg();
-- SELECT * FROM public.admin_sum_transactions('purchase', NOW() - INTERVAL '30 days');
-- SELECT * FROM public.admin_sum_transactions('spend', NULL);
-- SELECT * FROM public.admin_top_live_cities(5);
