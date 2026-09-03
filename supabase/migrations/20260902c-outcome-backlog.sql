-- ============================================================================
-- Neutralisation du passif de relance outcome (avant la 1re exécution du cron)
--
-- CONTEXTE. `lead-outcome-cron` n'a jamais tourné (déployé en version 1 le
-- 2026-09-02 à 12:52 UTC, planifié à 07:30 UTC). Sa requête sélectionne TOUT
-- déblocage de plus de 15 jours dont `outcome_email_sent_at` est NULL, trié du
-- plus ancien au plus récent. Au premier passage, elle ramène donc l'intégralité
-- de l'historique, pas seulement les déblocages récents.
--
-- Mesuré avant correctif : 9 lignes éligibles, la plus ancienne du 2026-04-23,
-- dont 6 de plus de 60 jours.
--
-- DÉCISION. Un cordiste ne se souvient pas d'un chantier débloqué il y a quatre
-- mois : sa réponse serait du bruit, pas du signal, et la sollicitation est
-- gênante. On neutralise donc les déblocages antérieurs au seuil ci-dessous en
-- posant `outcome_email_sent_at`, ce qui les exclut définitivement de la
-- sélection du cron SANS toucher à `outcome` (qui reste NULL = « non mesuré »,
-- et non une réponse inventée).
--
-- Les déblocages plus récents que le seuil partent normalement : la formulation
-- du gabarit a été rendue indépendante de l'âge (send-email, gabarit
-- 'lead-outcome') — À REDÉPLOYER avant 07:30 UTC :
--   npx supabase functions deploy send-email --project-ref esvnvxkbnhvxpnlhyjsw
--
-- Idempotente : un second passage ne trouve plus rien (la colonne est renseignée).
-- ============================================================================

DO $$
DECLARE
    -- Seuil d'ancienneté au-delà duquel on renonce à interroger le pro.
    -- 60 jours : au-delà, le souvenir du chantier n'est pas fiable.
    v_seuil   INTERVAL := INTERVAL '60 days';
    v_touched INT;
    v_restant INT;
BEGIN
    UPDATE public.unlocked_leads
    SET    outcome_email_sent_at = NOW()
    WHERE  outcome IS NULL
      AND  outcome_email_sent_at IS NULL
      AND  unlocked_at < NOW() - v_seuil;

    GET DIAGNOSTICS v_touched = ROW_COUNT;

    SELECT count(*) INTO v_restant
    FROM   public.unlocked_leads
    WHERE  outcome IS NULL
      AND  outcome_email_sent_at IS NULL
      AND  unlocked_at < NOW() - INTERVAL '15 days';

    RAISE NOTICE '% déblocage(s) de plus de % neutralisé(s).', v_touched, v_seuil;
    RAISE NOTICE '% déblocage(s) partiront à la prochaine exécution (07:30 UTC).', v_restant;
END $$;

-- ============================================================================
-- VÉRIFICATION — à relancer après coup
-- ============================================================================
-- SELECT count(*) AS partiront_demain,
--        min(unlocked_at)::date AS plus_ancien_retenu
-- FROM   unlocked_leads
-- WHERE  outcome IS NULL AND outcome_email_sent_at IS NULL
--   AND  unlocked_at < NOW() - INTERVAL '15 days';
-- Attendu : 3 lignes, aucune antérieure à ~2026-07-04.
