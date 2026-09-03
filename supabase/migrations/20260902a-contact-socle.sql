-- ============================================================================
-- 20260902a — Socle du CONTACT UNIFIÉ (CRM)
--
-- Doctrine (tranchée, ne pas rediscuter) : on RELIE, on ne fusionne pas.
--   · marketing_contacts devient le PIVOT (identité = un email en minuscules).
--   · leads, contact_requests, pro_alert_subscriptions restent des tables de
--     CAPTURE et reçoivent une FK contact_id (nullable, ON DELETE SET NULL).
--   · contact_events est le journal unique — système (posé par trigger) et
--     manuel (note / appel / changement de stage posé par l'admin).
--
-- Contenu :
--   a. marketing_contacts : lifecycle_stage, lifecycle_manual, last_activity_at,
--      email_status, full_name, phone, city, sources[] + index
--   b. FK contact_id sur leads / contact_requests / pro_alert_subscriptions
--   c. ensure_marketing_contact() — upsert par lower(email), n'écrase rien,
--      ne réactive JAMAIS un unsubscribed_at
--   d. contact_events + log_contact_event()
--   e. triggers produit (leads, contact_requests, profiles, jobs, unlocked_leads,
--      credit_transactions, pro_alert_subscriptions, marketing_contacts)
--   f. recompute_contact_lifecycle() + trigger sur contact_events
--   g. backfill idempotent (contacts, contact_id, événements rétroactifs)
--   h. RPC de lecture admin_contacts_list / admin_contact_detail
--      + RPC d'écriture admin_add_contact_event / admin_set_contact_stage
--
-- INVARIANT DE SÛRETÉ : aucun trigger de ce fichier ne peut faire échouer son
-- opération métier. Chaque corps est enveloppé dans BEGIN … EXCEPTION WHEN
-- OTHERS THEN RAISE WARNING … END (motif 20260901a : une inscription, une
-- capture de lead ou un déblocage ne casse jamais pour une raison marketing).
--
-- Idempotente et relançable. Le code applicatif tourne avant ET après :
-- fetchContacts.ts replie sur PGRST202/42883 (RPC absents).
-- ============================================================================

BEGIN;

-- ────────────────────────────────────────────────────────────────────────────
-- a. marketing_contacts — le pivot
-- ────────────────────────────────────────────────────────────────────────────
-- Colonnes déjà présentes (20260429-marketing) : id, user_id, email, first_name,
-- last_name, audience_type, marketing_opt_in, unsubscribed_at, source, metadata,
-- created_at, updated_at. Tout ce qui suit est un ajout.
ALTER TABLE public.marketing_contacts
    ADD COLUMN IF NOT EXISTS full_name        TEXT,
    ADD COLUMN IF NOT EXISTS phone            TEXT,
    ADD COLUMN IF NOT EXISTS city             TEXT,
    ADD COLUMN IF NOT EXISTS lifecycle_stage  TEXT NOT NULL DEFAULT 'nouveau',
    ADD COLUMN IF NOT EXISTS lifecycle_manual BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS email_status     TEXT NOT NULL DEFAULT 'valid',
    ADD COLUMN IF NOT EXISTS sources          TEXT[] NOT NULL DEFAULT '{}'::text[];

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'public.marketing_contacts'::regclass
          AND conname = 'marketing_contacts_lifecycle_stage_check'
    ) THEN
        ALTER TABLE public.marketing_contacts
            ADD CONSTRAINT marketing_contacts_lifecycle_stage_check
            CHECK (lifecycle_stage IN
                ('nouveau', 'engage', 'converti', 'actif', 'dormant', 'desinscrit'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'public.marketing_contacts'::regclass
          AND conname = 'marketing_contacts_email_status_check'
    ) THEN
        ALTER TABLE public.marketing_contacts
            ADD CONSTRAINT marketing_contacts_email_status_check
            CHECK (email_status IN ('valid', 'bounced', 'complained'));
    END IF;
END $$;

COMMENT ON COLUMN public.marketing_contacts.lifecycle_stage IS
'Stage CRM recalculé par recompute_contact_lifecycle(). Un stage posé à la main '
'(lifecycle_manual = true) n''est jamais écrasé par le recalcul, sauf par un '
'désabonnement qui force ''desinscrit''.';

COMMENT ON COLUMN public.marketing_contacts.sources IS
'Toutes les origines de capture connues pour ce contact (wizard, city-hero, '
'callback, jobs_page, profile_sync…). Enrichi sans écrasement par '
'ensure_marketing_contact().';

CREATE INDEX IF NOT EXISTS idx_marketing_contacts_lifecycle
    ON public.marketing_contacts (lifecycle_stage);
CREATE INDEX IF NOT EXISTS idx_marketing_contacts_last_activity
    ON public.marketing_contacts (last_activity_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_marketing_contacts_sources
    ON public.marketing_contacts USING GIN (sources);

-- Recherche plein-texte du champ `q` — TRANCHÉ : PAS de pg_trgm.
--   · Volumétrie cible : 1 opérateur, ~500 contacts à 12 mois. Un seq scan sur
--     500 lignes coûte < 1 ms ; un index GIN trigram n'apporterait rien de
--     mesurable et ajouterait une extension à maintenir.
--   · Le prédicat de recherche est un ILIKE '%q%' (joker en tête) : SEUL un
--     index trigram pourrait le servir — un btree sur lower(email) est
--     inutilisable ici. Donc soit trigram, soit rien : rien.
--   · idx_marketing_contacts_email_lower (unique, 20260429) sert déjà les
--     lookups par égalité, qui sont le chemin chaud réel (réconciliation).
--   → Seuil de révision : au-delà de ~50 000 contacts, ajouter
--     CREATE EXTENSION pg_trgm + un index GIN sur (email, full_name).

-- ────────────────────────────────────────────────────────────────────────────
-- b. FK contact_id sur les tables de capture
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.leads
    ADD COLUMN IF NOT EXISTS contact_id UUID;
ALTER TABLE public.contact_requests
    ADD COLUMN IF NOT EXISTS contact_id UUID;
ALTER TABLE public.pro_alert_subscriptions
    ADD COLUMN IF NOT EXISTS contact_id UUID;

DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY['leads', 'contact_requests', 'pro_alert_subscriptions']
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conrelid = format('public.%I', t)::regclass
              AND conname  = format('%s_contact_id_fkey', t)
        ) THEN
            EXECUTE format(
                'ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (contact_id) '
                || 'REFERENCES public.marketing_contacts(id) ON DELETE SET NULL',
                t, format('%s_contact_id_fkey', t)
            );
        END IF;
        EXECUTE format(
            'CREATE INDEX IF NOT EXISTS %I ON public.%I (contact_id)',
            format('idx_%s_contact_id', t), t
        );
    END LOOP;
END $$;

-- ────────────────────────────────────────────────────────────────────────────
-- c. ensure_marketing_contact() — upsert par lower(email)
--
-- Invariants (repris de upsert_marketing_contact, 20260901a) :
--   · email toujours stocké en minuscules ;
--   · marketing_opt_in / unsubscribed_at JAMAIS modifiés — un opt-out reste un
--     opt-out, on se contente d'enrichir la fiche ;
--   · les champs déjà renseignés ne sont jamais écrasés, seuls les vides sont
--     remplis ;
--   · audience_type n'est jamais dégradé : on ne promeut que depuis 'unknown'.
-- Les paramètres p_city / p_audience sont optionnels : l'appel contractuel à
-- 4 arguments ensure_marketing_contact(email, full_name, phone, source) reste
-- valide.
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.ensure_marketing_contact(
    p_email     TEXT,
    p_full_name TEXT DEFAULT NULL,
    p_phone     TEXT DEFAULT NULL,
    p_source    TEXT DEFAULT NULL,
    p_city      TEXT DEFAULT NULL,
    p_audience  TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_email_lc  TEXT := lower(trim(coalesce(p_email, '')));
    v_full      TEXT := nullif(trim(coalesce(p_full_name, '')), '');
    v_phone     TEXT := nullif(trim(coalesce(p_phone, '')), '');
    v_city      TEXT := nullif(trim(coalesce(p_city, '')), '');
    v_source    TEXT := nullif(trim(coalesce(p_source, '')), '');
    v_audience  TEXT := CASE WHEN p_audience IN ('client', 'pro') THEN p_audience END;
    v_id        UUID;
BEGIN
    -- Identité = un email. Pas d'email valide → pas de fiche (une demande de
    -- rappel « téléphone seul » reste dans contact_requests, contact_id NULL).
    IF v_email_lc = '' OR v_email_lc !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' THEN
        RETURN NULL;
    END IF;

    SELECT mc.id INTO v_id
    FROM public.marketing_contacts mc
    WHERE lower(mc.email) = v_email_lc
    LIMIT 1;

    IF v_id IS NULL THEN
        INSERT INTO public.marketing_contacts
            (email, full_name, phone, city, audience_type, source, sources)
        VALUES (
            v_email_lc,
            v_full,
            v_phone,
            v_city,
            coalesce(v_audience, 'unknown'),
            v_source,
            CASE WHEN v_source IS NULL THEN '{}'::text[] ELSE ARRAY[v_source] END
        )
        ON CONFLICT ((lower(email))) DO NOTHING
        RETURNING id INTO v_id;

        -- Course concurrente (deux captures simultanées du même email).
        IF v_id IS NULL THEN
            SELECT mc.id INTO v_id
            FROM public.marketing_contacts mc
            WHERE lower(mc.email) = v_email_lc
            LIMIT 1;
        ELSE
            RETURN v_id;
        END IF;
    END IF;

    -- Enrichissement sans écrasement.
    UPDATE public.marketing_contacts mc SET
        full_name = coalesce(nullif(trim(coalesce(mc.full_name, '')), ''), v_full),
        phone     = coalesce(nullif(trim(coalesce(mc.phone, '')), ''), v_phone),
        city      = coalesce(nullif(trim(coalesce(mc.city, '')), ''), v_city),
        -- first_name / last_name alimentent les templates marketing existants
        -- ({{prenom}}) : on les dérive du full_name uniquement s'ils sont vides.
        first_name = CASE
            WHEN nullif(trim(coalesce(mc.first_name, '')), '') IS NOT NULL THEN mc.first_name
            WHEN v_full IS NULL THEN mc.first_name
            ELSE split_part(v_full, ' ', 1)
        END,
        last_name = CASE
            WHEN nullif(trim(coalesce(mc.last_name, '')), '') IS NOT NULL THEN mc.last_name
            WHEN v_full IS NULL OR position(' ' IN v_full) = 0 THEN mc.last_name
            ELSE substring(v_full FROM position(' ' IN v_full) + 1)
        END,
        audience_type = CASE
            WHEN mc.audience_type IN ('client', 'pro') THEN mc.audience_type
            WHEN v_audience IS NOT NULL THEN v_audience
            ELSE mc.audience_type
        END,
        source  = coalesce(mc.source, v_source),
        sources = CASE
            WHEN v_source IS NULL OR v_source = ANY(mc.sources) THEN mc.sources
            ELSE mc.sources || v_source
        END,
        updated_at = NOW()
    WHERE mc.id = v_id;

    RETURN v_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.ensure_marketing_contact(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_marketing_contact(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT)
    TO service_role;

-- ────────────────────────────────────────────────────────────────────────────
-- d. contact_events — le journal unique
--
-- `kind` reste un TEXT libre (pas de CHECK) : une CHECK sur un vocabulaire
-- appelé à s'étendre transforme chaque nouveau type d'événement en migration
-- bloquante, et un kind inconnu se dégrade proprement côté UI. Vocabulaire :
--   Système : lead_captured · wizard_progress · contact_request · signup ·
--             job_posted · job_moderated · lead_unlocked · credits_purchased ·
--             credits_exhausted · outcome_reported · alert_subscribed ·
--             unsubscribed
--   Manuel  : note · call · status_change
--
-- `dedupe_key` porte l'identité de la ligne source (id du lead, du job, …) :
-- c'est ce qui rend le backfill ET les triggers rejouables sans doublon.
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contact_events (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id   UUID NOT NULL REFERENCES public.marketing_contacts(id) ON DELETE CASCADE,
    kind         TEXT NOT NULL,
    occurred_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    title        TEXT NOT NULL,
    detail       TEXT,
    payload      JSONB NOT NULL DEFAULT '{}'::jsonb,
    actor        TEXT,                -- NULL = système, sinon email de l'admin
    dedupe_key   TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_events_contact
    ON public.contact_events (contact_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_events_kind
    ON public.contact_events (kind, occurred_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_contact_events_dedupe
    ON public.contact_events (contact_id, kind, dedupe_key)
    WHERE dedupe_key IS NOT NULL;

ALTER TABLE public.contact_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contact_events_service_role_all" ON public.contact_events;
CREATE POLICY "contact_events_service_role_all" ON public.contact_events
    FOR ALL USING ((auth.jwt() ->> 'role') = 'service_role')
    WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');

DROP POLICY IF EXISTS "contact_events_admin_select" ON public.contact_events;
CREATE POLICY "contact_events_admin_select" ON public.contact_events
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ));

-- Ceinture + bretelles : les DEFAULT PRIVILEGES Supabase accordent des droits
-- table à anon/authenticated sur toute table neuve du schéma public. La RLS
-- suffirait, mais la leçon 20260828l est qu'on ne fait pas confiance à un
-- privilège qu'on n'a pas révoqué nommément.
REVOKE ALL ON TABLE public.contact_events FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
    ON TABLE public.contact_events FROM authenticated;
GRANT SELECT ON TABLE public.contact_events TO authenticated;   -- filtré par RLS admin
GRANT ALL    ON TABLE public.contact_events TO service_role;

CREATE OR REPLACE FUNCTION public.log_contact_event(
    p_contact_id  UUID,
    p_kind        TEXT,
    p_title       TEXT,
    p_detail      TEXT        DEFAULT NULL,
    p_payload     JSONB       DEFAULT '{}'::jsonb,
    p_actor       TEXT        DEFAULT NULL,
    p_occurred_at TIMESTAMPTZ DEFAULT NULL,
    p_dedupe_key  TEXT        DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_id UUID;
BEGIN
    IF p_contact_id IS NULL OR nullif(trim(coalesce(p_kind, '')), '') IS NULL THEN
        RETURN NULL;
    END IF;

    INSERT INTO public.contact_events
        (contact_id, kind, occurred_at, title, detail, payload, actor, dedupe_key)
    VALUES (
        p_contact_id,
        p_kind,
        coalesce(p_occurred_at, NOW()),
        coalesce(nullif(trim(coalesce(p_title, '')), ''), p_kind),
        nullif(trim(coalesce(p_detail, '')), ''),
        coalesce(p_payload, '{}'::jsonb),
        nullif(trim(coalesce(p_actor, '')), ''),
        p_dedupe_key
    )
    ON CONFLICT (contact_id, kind, dedupe_key) WHERE dedupe_key IS NOT NULL
    DO NOTHING
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.log_contact_event(UUID, TEXT, TEXT, TEXT, JSONB, TEXT, TIMESTAMPTZ, TEXT)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_contact_event(UUID, TEXT, TEXT, TEXT, JSONB, TEXT, TIMESTAMPTZ, TEXT)
    TO service_role;

-- ────────────────────────────────────────────────────────────────────────────
-- f. recompute_contact_lifecycle()
--
-- Ordre de décision (le premier qui répond gagne) :
--   1. unsubscribed_at posé                            → desinscrit  (fait dur)
--   2. lifecycle_manual = true                         → on ne touche à RIEN
--   3. déblocage ou achat < 90 j                       → actif
--   4. aucun événement                                 → nouveau
--   5. dernière activité > 90 j                        → dormant
--   6. mission publiée ou compte créé                  → converti
--   7. wizard avancé / demande de rappel / alerte      → engage
--   8. sinon                                           → nouveau
--
-- (1) passe AVANT (2) : un désabonnement est un fait juridique, il écrase un
-- stage posé à la main. C'est la seule exception à l'override manuel.
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.recompute_contact_lifecycle(p_contact_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_unsub    TIMESTAMPTZ;
    v_manual   BOOLEAN;
    v_current  TEXT;
    v_last     TIMESTAMPTZ;
    v_has_any  BOOLEAN;
    v_active   BOOLEAN;
    v_converti BOOLEAN;
    v_engage   BOOLEAN;
    v_stage    TEXT;
BEGIN
    SELECT mc.unsubscribed_at, mc.lifecycle_manual, mc.lifecycle_stage
    INTO v_unsub, v_manual, v_current
    FROM public.marketing_contacts mc
    WHERE mc.id = p_contact_id;

    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    IF v_unsub IS NOT NULL THEN
        v_stage := 'desinscrit';
    ELSIF v_manual THEN
        RETURN v_current;
    ELSE
        SELECT
            max(e.occurred_at),
            count(*) > 0,
            bool_or(e.kind IN ('lead_unlocked', 'credits_purchased')
                    AND e.occurred_at > NOW() - INTERVAL '90 days'),
            bool_or(e.kind IN ('job_posted', 'signup')),
            bool_or(
                e.kind IN ('contact_request', 'alert_subscribed')
                OR (e.kind IN ('wizard_progress', 'lead_captured')
                    AND coalesce(e.payload ->> 'step', '') ~ '^[0-9]+$'
                    AND (e.payload ->> 'step')::int >= 3)
            )
        INTO v_last, v_has_any, v_active, v_converti, v_engage
        FROM public.contact_events e
        WHERE e.contact_id = p_contact_id;

        v_stage := CASE
            WHEN coalesce(v_active, FALSE)                       THEN 'actif'
            WHEN NOT coalesce(v_has_any, FALSE)                  THEN 'nouveau'
            WHEN v_last < NOW() - INTERVAL '90 days'             THEN 'dormant'
            WHEN coalesce(v_converti, FALSE)                     THEN 'converti'
            WHEN coalesce(v_engage, FALSE)                       THEN 'engage'
            ELSE 'nouveau'
        END;
    END IF;

    UPDATE public.marketing_contacts mc
    SET lifecycle_stage  = v_stage,
        last_activity_at = GREATEST(coalesce(v_last, mc.last_activity_at), mc.last_activity_at),
        updated_at       = NOW()
    WHERE mc.id = p_contact_id
      AND (mc.lifecycle_stage IS DISTINCT FROM v_stage
           OR mc.last_activity_at IS DISTINCT FROM
              GREATEST(coalesce(v_last, mc.last_activity_at), mc.last_activity_at));

    RETURN v_stage;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.recompute_contact_lifecycle(UUID)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.recompute_contact_lifecycle(UUID) TO service_role;

-- Trigger sur contact_events : met à jour last_activity_at et recalcule le stage.
-- Le GUC lescordistes.skip_contact_recompute permet au backfill d'insérer en
-- masse puis de recalculer une seule fois — sans lui, N événements = N recalculs.
CREATE OR REPLACE FUNCTION public.contact_events_after_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    BEGIN
        -- Un status_change écrit directement (sans passer par
        -- admin_set_contact_stage) verrouille quand même le stage : le socle ne
        -- dépend pas de la discipline de l'appelant.
        IF NEW.kind = 'status_change'
           AND coalesce(NEW.payload ->> 'stage', '') IN
               ('nouveau', 'engage', 'converti', 'actif', 'dormant', 'desinscrit') THEN
            UPDATE public.marketing_contacts
            SET lifecycle_stage  = NEW.payload ->> 'stage',
                lifecycle_manual = TRUE,
                last_activity_at = GREATEST(coalesce(last_activity_at, NEW.occurred_at), NEW.occurred_at),
                updated_at       = NOW()
            WHERE id = NEW.contact_id
              AND unsubscribed_at IS NULL;
            RETURN NEW;
        END IF;

        UPDATE public.marketing_contacts
        SET last_activity_at = GREATEST(coalesce(last_activity_at, NEW.occurred_at), NEW.occurred_at),
            updated_at       = NOW()
        WHERE id = NEW.contact_id;

        IF coalesce(current_setting('lescordistes.skip_contact_recompute', TRUE), 'off') <> 'on' THEN
            PERFORM public.recompute_contact_lifecycle(NEW.contact_id);
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'contact_events_after_insert: échec pour event % : %', NEW.id, SQLERRM;
    END;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_contact_events_after_insert ON public.contact_events;
CREATE TRIGGER trg_contact_events_after_insert
    AFTER INSERT ON public.contact_events
    FOR EACH ROW EXECUTE FUNCTION public.contact_events_after_insert();

-- ────────────────────────────────────────────────────────────────────────────
-- e. Triggers produit — alimentation automatique du pivot et du journal
--
-- Règle absolue : chaque corps est enveloppé. Un échec CRM produit un WARNING,
-- jamais un rollback de l'inscription / de la capture / du déblocage.
-- ────────────────────────────────────────────────────────────────────────────

-- e.1 leads — INSERT = lead_captured, UPDATE de step_reached = wizard_progress.
--
-- DEUX triggers, et c'est structurel — pas un raffinement :
--
-- ⚠️ PIÈGE 1 (ON CONFLICT). /api/leads écrit avec
--    .upsert(payload, { onConflict: 'email' }), et `leads` porte un index
--    unique sur email : chaque étape du wizard rejoue le MÊME INSERT.
--    Postgres déclenche les triggers BEFORE INSERT sur la ligne PROPOSÉE,
--    AVANT l'arbitrage du conflit. Quand la ligne est redirigée vers
--    DO UPDATE, `NEW` est jeté — mais PAS les écritures déjà faites par le
--    trigger. Un journal d'événements posé en BEFORE INSERT écrit donc un
--    'lead_captured' par étape, chacun avec un dedupe_key = NEW.id tiré du
--    DEFAULT de la ligne jamais persistée : l'index d'unicité ne peut rien
--    dédupliquer, et payload.lead_id désigne un lead inexistant.
--    → Les événements passent en AFTER : un AFTER INSERT ne se déclenche PAS
--      sur une ligne redirigée vers DO UPDATE, seul l'AFTER UPDATE le fait.
--
-- ⚠️ PIÈGE 2 (résurrection RGPD). leads.contact_id est ON DELETE SET NULL :
--    supprimer une fiche déclenche un UPDATE interne sur `leads`. Si le
--    trigger BEFORE UPDATE appelle ensure_marketing_contact, il RECRÉE la
--    fiche à partir de l'email/téléphone/ville du lead — la suppression est
--    annulée, le journal (CASCADE) est perdu, les données personnelles
--    restent. → Sur UPDATE on ne CRÉE jamais de fiche, on se contente d'en
--    chercher une. Les contact_id orphelins sont réparés au backfill suivant.
--
-- BEFORE : résolution de NEW.contact_id uniquement, aucune écriture de journal.
-- ⚠️ PIÈGE 3 : un bloc BEGIN … EXCEPTION est une sous-transaction. Si le corps
--    échoue, la fiche créée par ensure_marketing_contact est ANNULÉE — mais
--    NEW.contact_id, simple variable plpgsql, garde l'uuid mort et la ligne
--    métier part avec une FK invalide : la capture échoue, exactement ce que le
--    filet devait empêcher. D'où la restauration explicite dans le handler.
CREATE OR REPLACE FUNCTION public.crm_feed_from_lead()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_contact  UUID;
    v_original UUID := NEW.contact_id;
BEGIN
    BEGIN
        IF TG_OP = 'INSERT' THEN
            v_contact := public.ensure_marketing_contact(
                NEW.email, NULL, NEW.phone, NEW.source, NEW.city, 'client'
            );
        ELSE
            -- Lecture seule (cf. PIÈGE 2) : on ne ressuscite pas une fiche
            -- supprimée par l'action référentielle qui nous a réveillés.
            SELECT mc.id INTO v_contact
            FROM public.marketing_contacts mc
            WHERE lower(mc.email) = lower(trim(coalesce(NEW.email, '')))
            LIMIT 1;
        END IF;

        NEW.contact_id := coalesce(NEW.contact_id, v_contact);
    EXCEPTION WHEN OTHERS THEN
        NEW.contact_id := v_original;
        RAISE WARNING 'crm_feed_from_lead: échec pour lead % : %', NEW.id, SQLERRM;
    END;
    RETURN NEW;
END;
$$;

-- AFTER : le journal. Ne se déclenche pas sur un INSERT redirigé (PIÈGE 1).
CREATE OR REPLACE FUNCTION public.crm_log_from_lead()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    BEGIN
        IF NEW.contact_id IS NULL THEN
            RETURN NULL;
        END IF;

        IF TG_OP = 'INSERT' THEN
            PERFORM public.log_contact_event(
                NEW.contact_id, 'lead_captured',
                'Lead capturé',
                nullif(concat_ws(' · ', NEW.category, NEW.city), ''),
                jsonb_build_object(
                    'lead_id', NEW.id, 'step', NEW.step_reached,
                    'category', NEW.category, 'city', NEW.city, 'source', NEW.source
                ),
                NULL, coalesce(NEW.created_at, NOW()), NEW.id::text
            );
        ELSIF NEW.step_reached IS DISTINCT FROM OLD.step_reached THEN
            PERFORM public.log_contact_event(
                NEW.contact_id, 'wizard_progress',
                format('Wizard — étape %s', NEW.step_reached),
                nullif(concat_ws(' · ', NEW.category, NEW.city), ''),
                jsonb_build_object(
                    'lead_id', NEW.id, 'step', NEW.step_reached,
                    'category', NEW.category, 'city', NEW.city
                ),
                NULL, NOW(), NEW.id::text || ':' || NEW.step_reached::text
            );
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'crm_log_from_lead: échec pour lead % : %', NEW.id, SQLERRM;
    END;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_crm_feed_from_lead ON public.leads;
CREATE TRIGGER trg_crm_feed_from_lead
    BEFORE INSERT OR UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.crm_feed_from_lead();

DROP TRIGGER IF EXISTS trg_crm_log_from_lead ON public.leads;
CREATE TRIGGER trg_crm_log_from_lead
    AFTER INSERT OR UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.crm_log_from_lead();

-- e.2 contact_requests — INSERT = contact_request.
CREATE OR REPLACE FUNCTION public.crm_feed_from_contact_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_contact  UUID;
    v_name     TEXT;
    v_original UUID := NEW.contact_id;   -- cf. piège documenté sur crm_feed_from_lead
BEGIN
    BEGIN
        v_name := nullif(trim(concat_ws(' ', NEW.first_name, NEW.last_name)), '');
        v_contact := public.ensure_marketing_contact(
            NEW.email, v_name, NEW.phone, NEW.source, NEW.city, 'client'
        );
        NEW.contact_id := coalesce(NEW.contact_id, v_contact);

        IF v_contact IS NOT NULL THEN
            PERFORM public.log_contact_event(
                v_contact, 'contact_request',
                CASE NEW.request_type
                    WHEN 'callback' THEN 'Demande de rappel'
                    ELSE 'Message rapide'
                END,
                nullif(concat_ws(' · ', NEW.city, NEW.category, NEW.message), ''),
                jsonb_build_object(
                    'contact_request_id', NEW.id,
                    'request_type', NEW.request_type,
                    'preferred_channel', NEW.preferred_channel,
                    'preferred_time_slot', NEW.preferred_time_slot,
                    'city', NEW.city, 'category', NEW.category
                ),
                NULL, coalesce(NEW.created_at, NOW()), NEW.id::text
            );
        END IF;
    EXCEPTION WHEN OTHERS THEN
        NEW.contact_id := v_original;
        RAISE WARNING 'crm_feed_from_contact_request: échec pour demande % : %', NEW.id, SQLERRM;
    END;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_crm_feed_from_contact_request ON public.contact_requests;
CREATE TRIGGER trg_crm_feed_from_contact_request
    BEFORE INSERT ON public.contact_requests
    FOR EACH ROW EXECUTE FUNCTION public.crm_feed_from_contact_request();

-- e.3 pro_alert_subscriptions — INSERT = alert_subscribed.
-- Kind AJOUTÉ au vocabulaire du cahier des charges : sans lui, la règle
-- « engage = wizard avancé, demande de rappel, ALERTE » n'a aucune donnée
-- sur laquelle s'appuyer.
CREATE OR REPLACE FUNCTION public.crm_feed_from_pro_alert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_contact  UUID;
    v_original UUID := NEW.contact_id;   -- cf. piège documenté sur crm_feed_from_lead
BEGIN
    BEGIN
        v_contact := public.ensure_marketing_contact(
            NEW.email, NULL, NULL, NEW.source, NULL, 'pro'
        );
        NEW.contact_id := coalesce(NEW.contact_id, v_contact);

        IF v_contact IS NOT NULL THEN
            PERFORM public.log_contact_event(
                v_contact, 'alert_subscribed',
                'Alerte missions activée',
                array_to_string(NEW.departments, ', '),
                jsonb_build_object(
                    'subscription_id', NEW.id,
                    'departments', to_jsonb(NEW.departments),
                    'source', NEW.source
                ),
                NULL, coalesce(NEW.created_at, NOW()), NEW.id::text
            );
        END IF;
    EXCEPTION WHEN OTHERS THEN
        NEW.contact_id := v_original;
        RAISE WARNING 'crm_feed_from_pro_alert: échec pour souscription % : %', NEW.id, SQLERRM;
    END;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_crm_feed_from_pro_alert ON public.pro_alert_subscriptions;
CREATE TRIGGER trg_crm_feed_from_pro_alert
    BEFORE INSERT ON public.pro_alert_subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.crm_feed_from_pro_alert();

-- e.4 profiles — INSERT = signup.
-- AFTER : le trigger d'alimentation marketing existant (trg_marketing_contact_
-- autofeed, 20260901a) est lui aussi AFTER — il a déjà créé/mis à jour la fiche
-- quand celui-ci s'exécute (ordre alphabétique des noms de trigger :
-- trg_crm_… < trg_marketing_…, donc on ne peut PAS compter dessus → on rappelle
-- ensure_marketing_contact, qui est idempotent).
CREATE OR REPLACE FUNCTION public.crm_feed_from_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_contact UUID;
    v_name    TEXT;
BEGIN
    BEGIN
        IF NEW.role NOT IN ('client', 'pro') THEN
            RETURN NEW;
        END IF;

        v_name := coalesce(
            nullif(trim(coalesce(NEW.full_name, '')), ''),
            nullif(trim(concat_ws(' ', NEW.first_name, NEW.last_name)), '')
        );

        v_contact := public.ensure_marketing_contact(
            NEW.email, v_name, NEW.phone,
            coalesce(NEW.acquisition_source, 'signup'), NULL, NEW.role
        );

        IF v_contact IS NOT NULL THEN
            -- Rattache le compte à la fiche (une personne = une fiche : le
            -- visiteur devenu inscrit garde son historique de leads).
            UPDATE public.marketing_contacts
            SET user_id = NEW.id, updated_at = NOW()
            WHERE id = v_contact
              AND user_id IS NULL
              AND NOT EXISTS (
                  SELECT 1 FROM public.marketing_contacts o
                  WHERE o.user_id = NEW.id AND o.id <> v_contact
              );

            PERFORM public.log_contact_event(
                v_contact, 'signup',
                format('Compte %s créé', NEW.role),
                nullif(NEW.company_name, ''),
                jsonb_build_object(
                    'user_id', NEW.id, 'role', NEW.role,
                    'acquisition_source', NEW.acquisition_source
                ),
                NULL, coalesce(NEW.created_at, NOW()), NEW.id::text
            );
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'crm_feed_from_profile: échec pour profil % : %', NEW.id, SQLERRM;
    END;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_crm_feed_from_profile ON public.profiles;
CREATE TRIGGER trg_crm_feed_from_profile
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.crm_feed_from_profile();

-- e.5 jobs — INSERT = job_posted, UPDATE de status = job_moderated.
-- Le contact d'une mission est son CLIENT : created_by s'il est inscrit, sinon
-- l'email porté par client_contact_info (wizard anonyme, mission créée par
-- l'admin après un appel).
CREATE OR REPLACE FUNCTION public.crm_feed_from_job()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_contact UUID;
    v_email   TEXT;
    v_name    TEXT;
    v_phone   TEXT;
BEGIN
    BEGIN
        SELECT p.email, coalesce(nullif(trim(coalesce(p.full_name, '')), ''),
                                 nullif(trim(concat_ws(' ', p.first_name, p.last_name)), '')),
               p.phone
        INTO v_email, v_name, v_phone
        FROM public.profiles p
        WHERE p.id = NEW.created_by;

        IF v_email IS NULL THEN
            v_email := NEW.client_contact_info ->> 'email';
            v_name  := coalesce(NEW.client_contact_info ->> 'name',
                                NEW.client_contact_info ->> 'company_name');
            v_phone := NEW.client_contact_info ->> 'phone';
        END IF;

        v_contact := public.ensure_marketing_contact(
            v_email, v_name, v_phone,
            CASE WHEN NEW.admin_created THEN 'admin_job' ELSE 'job_wizard' END,
            NEW.location_city, 'client'
        );

        IF v_contact IS NULL THEN
            RETURN NULL;
        END IF;

        IF TG_OP = 'INSERT' THEN
            PERFORM public.log_contact_event(
                v_contact, 'job_posted',
                format('Mission déposée — %s', NEW.title),
                nullif(concat_ws(' · ', NEW.category, NEW.location_city), ''),
                jsonb_build_object(
                    'job_id', NEW.id, 'title', NEW.title, 'status', NEW.status,
                    'category', NEW.category, 'city', NEW.location_city,
                    'admin_created', NEW.admin_created
                ),
                NULL, coalesce(NEW.created_at, NOW()), NEW.id::text
            );
        ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
            PERFORM public.log_contact_event(
                v_contact, 'job_moderated',
                format('Mission %s — %s', NEW.status, NEW.title),
                NEW.rejection_reason,
                jsonb_build_object(
                    'job_id', NEW.id, 'title', NEW.title,
                    'status', NEW.status, 'previous_status', OLD.status
                ),
                NULL, coalesce(NEW.moderated_at, NOW()), NEW.id::text || ':' || NEW.status
            );
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'crm_feed_from_job: échec pour mission % : %', NEW.id, SQLERRM;
    END;
    RETURN NULL;   -- AFTER trigger : la valeur de retour est ignorée
END;
$$;

DROP TRIGGER IF EXISTS trg_crm_feed_from_job ON public.jobs;
CREATE TRIGGER trg_crm_feed_from_job
    AFTER INSERT OR UPDATE OF status ON public.jobs
    FOR EACH ROW EXECUTE FUNCTION public.crm_feed_from_job();

-- e.6 unlocked_leads — INSERT = lead_unlocked, UPDATE de outcome = outcome_reported.
-- Le contact est le PRO : c'est lui dont le cycle de vie bascule en « actif ».
CREATE OR REPLACE FUNCTION public.crm_feed_from_unlock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_contact UUID;
    v_email   TEXT;
    v_name    TEXT;
    v_title   TEXT;
BEGIN
    BEGIN
        SELECT p.email, coalesce(nullif(trim(coalesce(p.full_name, '')), ''),
                                 nullif(trim(concat_ws(' ', p.first_name, p.last_name)), ''))
        INTO v_email, v_name
        FROM public.profiles p
        WHERE p.id = NEW.pro_id;

        v_contact := public.ensure_marketing_contact(v_email, v_name, NULL, 'unlock', NULL, 'pro');
        IF v_contact IS NULL THEN
            RETURN NULL;
        END IF;

        SELECT j.title INTO v_title FROM public.jobs j WHERE j.id = NEW.job_id;

        IF TG_OP = 'INSERT' THEN
            PERFORM public.log_contact_event(
                v_contact, 'lead_unlocked',
                coalesce(format('Lead débloqué — %s', v_title), 'Lead débloqué'),
                NULL,
                jsonb_build_object('unlock_id', NEW.id, 'job_id', NEW.job_id, 'title', v_title),
                NULL, coalesce(NEW.unlocked_at, NOW()), NEW.id::text
            );
        ELSIF NEW.outcome IS DISTINCT FROM OLD.outcome AND NEW.outcome IS NOT NULL THEN
            PERFORM public.log_contact_event(
                v_contact, 'outcome_reported',
                format('Issue déclarée : %s', NEW.outcome),
                v_title,
                jsonb_build_object('unlock_id', NEW.id, 'job_id', NEW.job_id, 'outcome', NEW.outcome),
                NULL, coalesce(NEW.outcome_at, NOW()), NEW.id::text || ':' || NEW.outcome
            );
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'crm_feed_from_unlock: échec pour déblocage % : %', NEW.id, SQLERRM;
    END;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_crm_feed_from_unlock ON public.unlocked_leads;
CREATE TRIGGER trg_crm_feed_from_unlock
    AFTER INSERT OR UPDATE OF outcome ON public.unlocked_leads
    FOR EACH ROW EXECUTE FUNCTION public.crm_feed_from_unlock();

-- e.7 credit_transactions — INSERT purchase = credits_purchased.
-- credits_exhausted est émis depuis le même trigger, sur une dépense qui laisse
-- le solde à zéro : c'est le moment produit intéressant (le pro ne peut plus
-- débloquer). unlock_lead() débite credits AVANT d'insérer la transaction, le
-- solde lu ici est donc déjà à jour.
CREATE OR REPLACE FUNCTION public.crm_feed_from_credit_tx()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_contact UUID;
    v_email   TEXT;
    v_name    TEXT;
    v_balance INTEGER;
BEGIN
    BEGIN
        IF NEW.type NOT IN ('purchase', 'spend') THEN
            RETURN NULL;
        END IF;

        SELECT p.email, coalesce(nullif(trim(coalesce(p.full_name, '')), ''),
                                 nullif(trim(concat_ws(' ', p.first_name, p.last_name)), ''))
        INTO v_email, v_name
        FROM public.profiles p
        WHERE p.id = NEW.pro_id;

        v_contact := public.ensure_marketing_contact(v_email, v_name, NULL, 'credits', NULL, 'pro');
        IF v_contact IS NULL THEN
            RETURN NULL;
        END IF;

        IF NEW.type = 'purchase' THEN
            PERFORM public.log_contact_event(
                v_contact, 'credits_purchased',
                format('Achat de %s crédit(s)', NEW.amount),
                NEW.description,
                jsonb_build_object(
                    'transaction_id', NEW.id, 'credits', NEW.amount,
                    'amount_cents', NEW.amount_cents
                ),
                NULL, coalesce(NEW.created_at, NOW()), NEW.id::text
            );
        ELSE
            SELECT c.balance INTO v_balance FROM public.credits c WHERE c.pro_id = NEW.pro_id;
            IF coalesce(v_balance, -1) = 0 THEN
                PERFORM public.log_contact_event(
                    v_contact, 'credits_exhausted',
                    'Solde de crédits épuisé',
                    NULL,
                    jsonb_build_object('transaction_id', NEW.id, 'job_id', NEW.job_id),
                    NULL, coalesce(NEW.created_at, NOW()), NEW.id::text
                );
            END IF;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'crm_feed_from_credit_tx: échec pour transaction % : %', NEW.id, SQLERRM;
    END;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_crm_feed_from_credit_tx ON public.credit_transactions;
CREATE TRIGGER trg_crm_feed_from_credit_tx
    AFTER INSERT ON public.credit_transactions
    FOR EACH ROW EXECUTE FUNCTION public.crm_feed_from_credit_tx();

-- e.8 marketing_contacts — désabonnement = unsubscribed.
-- Kind AJOUTÉ (présent dans le vocabulaire du cahier des charges mais sans
-- trigger listé) : sans lui, 'desinscrit' n'apparaîtrait jamais dans le journal.
CREATE OR REPLACE FUNCTION public.crm_feed_unsubscribe()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    BEGIN
        IF OLD.unsubscribed_at IS NULL AND NEW.unsubscribed_at IS NOT NULL THEN
            PERFORM public.log_contact_event(
                NEW.id, 'unsubscribed',
                'Désinscription marketing', NULL,
                jsonb_build_object('unsubscribed_at', NEW.unsubscribed_at),
                NULL, NEW.unsubscribed_at, NEW.id::text
            );
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'crm_feed_unsubscribe: échec pour contact % : %', NEW.id, SQLERRM;
    END;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_crm_feed_unsubscribe ON public.marketing_contacts;
CREATE TRIGGER trg_crm_feed_unsubscribe
    AFTER UPDATE OF unsubscribed_at ON public.marketing_contacts
    FOR EACH ROW EXECUTE FUNCTION public.crm_feed_unsubscribe();

-- ────────────────────────────────────────────────────────────────────────────
-- g. BACKFILL — idempotent (dedupe_key + ON CONFLICT DO NOTHING)
--
-- Un second passage ne crée AUCUN doublon : chaque événement rétroactif porte
-- l'id de sa ligne source comme dedupe_key, protégé par idx_contact_events_dedupe.
-- ────────────────────────────────────────────────────────────────────────────
DO $backfill$
DECLARE
    r         RECORD;
    v_contact UUID;
    v_email   TEXT;
    v_name    TEXT;
    v_n       INTEGER := 0;
BEGIN
    -- Recalcul différé : on insère des milliers d'événements, on recalcule une
    -- seule fois à la fin.
    PERFORM set_config('lescordistes.skip_contact_recompute', 'on', TRUE);

    -- g.1 profiles (le pivot pour les comptes existe déjà via 20260901a, mais on
    --     repasse pour renseigner full_name / phone / sources, neufs ici).
    FOR r IN
        SELECT p.id, p.email, p.role, p.phone, p.company_name, p.created_at,
               p.acquisition_source,
               coalesce(nullif(trim(coalesce(p.full_name, '')), ''),
                        nullif(trim(concat_ws(' ', p.first_name, p.last_name)), '')) AS name
        FROM public.profiles p
        WHERE p.role IN ('client', 'pro')
    LOOP
        v_contact := public.ensure_marketing_contact(
            r.email, r.name, r.phone, coalesce(r.acquisition_source, 'signup'), NULL, r.role
        );
        IF v_contact IS NULL THEN CONTINUE; END IF;

        UPDATE public.marketing_contacts
        SET user_id = r.id, updated_at = NOW()
        WHERE id = v_contact AND user_id IS NULL
          AND NOT EXISTS (SELECT 1 FROM public.marketing_contacts o
                          WHERE o.user_id = r.id AND o.id <> v_contact);

        PERFORM public.log_contact_event(
            v_contact, 'signup', format('Compte %s créé', r.role),
            nullif(r.company_name, ''),
            jsonb_build_object('user_id', r.id, 'role', r.role,
                               'acquisition_source', r.acquisition_source),
            NULL, coalesce(r.created_at, NOW()), r.id::text
        );
        v_n := v_n + 1;
    END LOOP;
    RAISE NOTICE 'backfill · profils traités : %', v_n;

    -- g.2 leads
    v_n := 0;
    FOR r IN SELECT * FROM public.leads LOOP
        v_contact := public.ensure_marketing_contact(
            r.email, NULL, r.phone, r.source, r.city, 'client'
        );
        IF v_contact IS NULL THEN CONTINUE; END IF;

        UPDATE public.leads SET contact_id = v_contact
        WHERE id = r.id AND contact_id IS DISTINCT FROM v_contact;

        PERFORM public.log_contact_event(
            v_contact, 'lead_captured', 'Lead capturé',
            nullif(concat_ws(' · ', r.category, r.city), ''),
            jsonb_build_object('lead_id', r.id, 'step', r.step_reached,
                               'category', r.category, 'city', r.city, 'source', r.source),
            NULL, coalesce(r.created_at, NOW()), r.id::text
        );

        -- Un lead arrivé à l'étape N a franchi les étapes intermédiaires, mais
        -- on n'invente pas leurs horodatages : un seul wizard_progress, à
        -- l'étape atteinte, daté de updated_at.
        IF coalesce(r.step_reached, 1) > 1 THEN
            PERFORM public.log_contact_event(
                v_contact, 'wizard_progress',
                format('Wizard — étape %s', r.step_reached),
                nullif(concat_ws(' · ', r.category, r.city), ''),
                jsonb_build_object('lead_id', r.id, 'step', r.step_reached,
                                   'category', r.category, 'city', r.city),
                NULL, coalesce(r.updated_at, r.created_at, NOW()),
                r.id::text || ':' || r.step_reached::text
            );
        END IF;
        v_n := v_n + 1;
    END LOOP;
    RAISE NOTICE 'backfill · leads traités : %', v_n;

    -- g.3 contact_requests
    v_n := 0;
    FOR r IN SELECT * FROM public.contact_requests LOOP
        v_contact := public.ensure_marketing_contact(
            r.email,
            nullif(trim(concat_ws(' ', r.first_name, r.last_name)), ''),
            r.phone, r.source, r.city, 'client'
        );
        IF v_contact IS NULL THEN CONTINUE; END IF;

        UPDATE public.contact_requests SET contact_id = v_contact
        WHERE id = r.id AND contact_id IS DISTINCT FROM v_contact;

        PERFORM public.log_contact_event(
            v_contact, 'contact_request',
            CASE r.request_type WHEN 'callback' THEN 'Demande de rappel' ELSE 'Message rapide' END,
            nullif(concat_ws(' · ', r.city, r.category, r.message), ''),
            jsonb_build_object('contact_request_id', r.id, 'request_type', r.request_type,
                               'preferred_channel', r.preferred_channel,
                               'preferred_time_slot', r.preferred_time_slot,
                               'city', r.city, 'category', r.category),
            NULL, coalesce(r.created_at, NOW()), r.id::text
        );
        v_n := v_n + 1;
    END LOOP;
    RAISE NOTICE 'backfill · demandes de contact traitées : %', v_n;

    -- g.4 pro_alert_subscriptions
    v_n := 0;
    FOR r IN SELECT * FROM public.pro_alert_subscriptions LOOP
        v_contact := public.ensure_marketing_contact(r.email, NULL, NULL, r.source, NULL, 'pro');
        IF v_contact IS NULL THEN CONTINUE; END IF;

        UPDATE public.pro_alert_subscriptions SET contact_id = v_contact
        WHERE id = r.id AND contact_id IS DISTINCT FROM v_contact;

        PERFORM public.log_contact_event(
            v_contact, 'alert_subscribed', 'Alerte missions activée',
            array_to_string(r.departments, ', '),
            jsonb_build_object('subscription_id', r.id,
                               'departments', to_jsonb(r.departments), 'source', r.source),
            NULL, coalesce(r.created_at, NOW()), r.id::text
        );
        v_n := v_n + 1;
    END LOOP;
    RAISE NOTICE 'backfill · souscriptions alertes traitées : %', v_n;

    -- g.5 jobs (job_posted + job_moderated)
    v_n := 0;
    FOR r IN
        SELECT j.id, j.title, j.status, j.category, j.location_city, j.created_at,
               j.moderated_at, j.admin_created, j.client_contact_info, j.created_by,
               p.email AS profile_email, p.phone AS profile_phone,
               coalesce(nullif(trim(coalesce(p.full_name, '')), ''),
                        nullif(trim(concat_ws(' ', p.first_name, p.last_name)), '')) AS profile_name
        FROM public.jobs j
        LEFT JOIN public.profiles p ON p.id = j.created_by
    LOOP
        v_email := coalesce(r.profile_email, r.client_contact_info ->> 'email');
        v_name  := coalesce(r.profile_name, r.client_contact_info ->> 'name',
                            r.client_contact_info ->> 'company_name');

        v_contact := public.ensure_marketing_contact(
            v_email, v_name,
            coalesce(r.profile_phone, r.client_contact_info ->> 'phone'),
            CASE WHEN r.admin_created THEN 'admin_job' ELSE 'job_wizard' END,
            r.location_city, 'client'
        );
        IF v_contact IS NULL THEN CONTINUE; END IF;

        PERFORM public.log_contact_event(
            v_contact, 'job_posted', format('Mission déposée — %s', r.title),
            nullif(concat_ws(' · ', r.category, r.location_city), ''),
            jsonb_build_object('job_id', r.id, 'title', r.title, 'status', r.status,
                               'category', r.category, 'city', r.location_city,
                               'admin_created', r.admin_created),
            NULL, coalesce(r.created_at, NOW()), r.id::text
        );

        IF r.moderated_at IS NOT NULL THEN
            PERFORM public.log_contact_event(
                v_contact, 'job_moderated', format('Mission %s — %s', r.status, r.title),
                NULL,
                jsonb_build_object('job_id', r.id, 'title', r.title, 'status', r.status),
                NULL, r.moderated_at, r.id::text || ':' || r.status
            );
        END IF;
        v_n := v_n + 1;
    END LOOP;
    RAISE NOTICE 'backfill · missions traitées : %', v_n;

    -- g.6 unlocked_leads (lead_unlocked + outcome_reported)
    v_n := 0;
    FOR r IN
        SELECT ul.id, ul.job_id, ul.unlocked_at, ul.outcome, ul.outcome_at,
               p.email, j.title,
               coalesce(nullif(trim(coalesce(p.full_name, '')), ''),
                        nullif(trim(concat_ws(' ', p.first_name, p.last_name)), '')) AS name
        FROM public.unlocked_leads ul
        JOIN public.profiles p ON p.id = ul.pro_id
        LEFT JOIN public.jobs j ON j.id = ul.job_id
    LOOP
        v_contact := public.ensure_marketing_contact(r.email, r.name, NULL, 'unlock', NULL, 'pro');
        IF v_contact IS NULL THEN CONTINUE; END IF;

        PERFORM public.log_contact_event(
            v_contact, 'lead_unlocked',
            coalesce(format('Lead débloqué — %s', r.title), 'Lead débloqué'), NULL,
            jsonb_build_object('unlock_id', r.id, 'job_id', r.job_id, 'title', r.title),
            NULL, coalesce(r.unlocked_at, NOW()), r.id::text
        );

        IF r.outcome IS NOT NULL THEN
            PERFORM public.log_contact_event(
                v_contact, 'outcome_reported', format('Issue déclarée : %s', r.outcome), r.title,
                jsonb_build_object('unlock_id', r.id, 'job_id', r.job_id, 'outcome', r.outcome),
                NULL, coalesce(r.outcome_at, r.unlocked_at, NOW()),
                r.id::text || ':' || r.outcome
            );
        END IF;
        v_n := v_n + 1;
    END LOOP;
    RAISE NOTICE 'backfill · déblocages traités : %', v_n;

    -- g.7 credit_transactions (achats uniquement — credits_exhausted dépend d'un
    --     solde instantané qu'on ne peut pas reconstituer a posteriori sans
    --     rejouer tout l'historique : on ne fabrique pas cet événement).
    v_n := 0;
    FOR r IN
        SELECT ct.id, ct.amount, ct.amount_cents, ct.description, ct.created_at,
               p.email,
               coalesce(nullif(trim(coalesce(p.full_name, '')), ''),
                        nullif(trim(concat_ws(' ', p.first_name, p.last_name)), '')) AS name
        FROM public.credit_transactions ct
        JOIN public.profiles p ON p.id = ct.pro_id
        WHERE ct.type = 'purchase'
    LOOP
        v_contact := public.ensure_marketing_contact(r.email, r.name, NULL, 'credits', NULL, 'pro');
        IF v_contact IS NULL THEN CONTINUE; END IF;

        PERFORM public.log_contact_event(
            v_contact, 'credits_purchased', format('Achat de %s crédit(s)', r.amount),
            r.description,
            jsonb_build_object('transaction_id', r.id, 'credits', r.amount,
                               'amount_cents', r.amount_cents),
            NULL, coalesce(r.created_at, NOW()), r.id::text
        );
        v_n := v_n + 1;
    END LOOP;
    RAISE NOTICE 'backfill · achats de crédits traités : %', v_n;

    -- g.8 désinscriptions déjà posées
    FOR r IN SELECT id, unsubscribed_at FROM public.marketing_contacts
             WHERE unsubscribed_at IS NOT NULL
    LOOP
        PERFORM public.log_contact_event(
            r.id, 'unsubscribed', 'Désinscription marketing', NULL,
            jsonb_build_object('unsubscribed_at', r.unsubscribed_at),
            NULL, r.unsubscribed_at, r.id::text
        );
    END LOOP;

    -- g.9 last_activity_at + created_at + recalcul global (une seule passe).
    -- created_at est ramené à la date du premier événement connu : sans cela, le
    -- backfill daterait TOUTES les fiches du jour de la migration et la colonne
    -- « contact depuis » mentirait sur trois ans d'historique. Idempotent
    -- (LEAST converge vers un point fixe).
    UPDATE public.marketing_contacts mc
    SET last_activity_at = agg.last_at,
        created_at       = LEAST(mc.created_at, agg.first_at)
    FROM (
        SELECT contact_id, max(occurred_at) AS last_at, min(occurred_at) AS first_at
        FROM public.contact_events GROUP BY contact_id
    ) agg
    WHERE agg.contact_id = mc.id
      AND (mc.last_activity_at IS DISTINCT FROM agg.last_at
           OR mc.created_at > agg.first_at);

    PERFORM set_config('lescordistes.skip_contact_recompute', 'off', TRUE);

    FOR r IN SELECT id FROM public.marketing_contacts LOOP
        PERFORM public.recompute_contact_lifecycle(r.id);
    END LOOP;

    RAISE NOTICE 'backfill · terminé.';
END $backfill$;

-- ────────────────────────────────────────────────────────────────────────────
-- h. RPC de lecture (service_role uniquement)
--
-- open_actions = demandes de contact encore à traiter (contact_requests.status
-- = 'new') rattachées à la fiche.
-- ⚠️ La seconde moitié du besoin — « rappels dus » — n'a AUCUN support de
-- persistance : le contrat d'API des écrans ne transporte pas de date
-- d'échéance (POST /events reçoit {kind, title, detail}). Plutôt que d'inventer
-- une table de rappels que personne ne peut alimenter, open_actions ne compte
-- aujourd'hui que les demandes non traitées. Ajouter un champ `due_at` au
-- contrat des événements suffira à compléter le calcul ici, sans migration
-- de données.
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_contacts_list(
    p_q           TEXT    DEFAULT NULL,
    p_stage       TEXT    DEFAULT NULL,
    p_audience    TEXT    DEFAULT NULL,
    p_has_account BOOLEAN DEFAULT NULL,
    p_source      TEXT    DEFAULT NULL,
    p_limit       INTEGER DEFAULT 200
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
WITH base AS (
    SELECT
        mc.id,
        lower(mc.email) AS email,
        coalesce(
            nullif(trim(coalesce(mc.full_name, '')), ''),
            nullif(trim(concat_ws(' ', mc.first_name, mc.last_name)), '')
        ) AS full_name,
        nullif(trim(coalesce(mc.phone, '')), '') AS phone,
        CASE WHEN mc.audience_type IN ('client', 'pro') THEN mc.audience_type
             ELSE 'unknown' END AS audience_type,
        mc.lifecycle_stage,
        mc.last_activity_at,
        mc.created_at,
        (mc.user_id IS NOT NULL) AS has_account,
        (mc.marketing_opt_in AND mc.unsubscribed_at IS NULL) AS marketing_opt_in,
        (SELECT coalesce(array_agg(DISTINCT s ORDER BY s), '{}'::text[])
         FROM unnest(mc.sources || CASE WHEN mc.source IS NULL THEN '{}'::text[]
                                        ELSE ARRAY[mc.source] END) AS s
         WHERE nullif(trim(s), '') IS NOT NULL) AS sources,
        (SELECT count(*) FROM public.contact_requests cr
         WHERE cr.contact_id = mc.id AND cr.status = 'new') AS open_actions
    FROM public.marketing_contacts mc
)
SELECT coalesce(jsonb_agg(to_jsonb(f) ORDER BY f.last_activity_at DESC NULLS LAST,
                                              f.created_at DESC), '[]'::jsonb)
FROM (
    SELECT b.*
    FROM base b
    WHERE (p_stage       IS NULL OR b.lifecycle_stage = p_stage)
      AND (p_audience    IS NULL OR b.audience_type   = p_audience)
      AND (p_has_account IS NULL OR b.has_account     = p_has_account)
      AND (p_source      IS NULL OR p_source = ANY(b.sources))
      AND (
            nullif(trim(coalesce(p_q, '')), '') IS NULL
            OR b.email              ILIKE '%' || trim(p_q) || '%'
            OR coalesce(b.full_name, '') ILIKE '%' || trim(p_q) || '%'
            OR coalesce(b.phone, '')     ILIKE '%' || trim(p_q) || '%'
      )
    ORDER BY b.last_activity_at DESC NULLS LAST, b.created_at DESC
    LIMIT GREATEST(1, LEAST(coalesce(p_limit, 200), 1000))
) f;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_contacts_list(TEXT, TEXT, TEXT, BOOLEAN, TEXT, INTEGER)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_contacts_list(TEXT, TEXT, TEXT, BOOLEAN, TEXT, INTEGER)
    TO service_role;

CREATE OR REPLACE FUNCTION public.admin_contact_detail(p_contact_id UUID)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
WITH c AS (
    SELECT
        mc.id,
        lower(mc.email) AS email,
        coalesce(
            nullif(trim(coalesce(mc.full_name, '')), ''),
            nullif(trim(concat_ws(' ', mc.first_name, mc.last_name)), '')
        ) AS full_name,
        nullif(trim(coalesce(mc.phone, '')), '') AS phone,
        CASE WHEN mc.audience_type IN ('client', 'pro') THEN mc.audience_type
             ELSE 'unknown' END AS audience_type,
        mc.lifecycle_stage,
        mc.last_activity_at,
        mc.created_at,
        (mc.user_id IS NOT NULL) AS has_account,
        (mc.marketing_opt_in AND mc.unsubscribed_at IS NULL) AS marketing_opt_in,
        (SELECT coalesce(array_agg(DISTINCT s ORDER BY s), '{}'::text[])
         FROM unnest(mc.sources || CASE WHEN mc.source IS NULL THEN '{}'::text[]
                                        ELSE ARRAY[mc.source] END) AS s
         WHERE nullif(trim(s), '') IS NOT NULL) AS sources,
        (SELECT count(*) FROM public.contact_requests cr
         WHERE cr.contact_id = mc.id AND cr.status = 'new') AS open_actions,
        nullif(trim(coalesce(mc.city, '')), '') AS city,
        p.company_name,
        mc.user_id,
        mc.unsubscribed_at,
        cons.consent_at
    FROM public.marketing_contacts mc
    LEFT JOIN public.profiles p ON p.id = mc.user_id
    LEFT JOIN LATERAL (
        SELECT max(l.consent_at) AS consent_at
        FROM public.leads l
        WHERE l.contact_id = mc.id
    ) cons ON TRUE
    WHERE mc.id = p_contact_id
)
SELECT jsonb_build_object(
    'contact', to_jsonb(c),
    'events', coalesce((
        SELECT jsonb_agg(jsonb_build_object(
            'id', e.id, 'contact_id', e.contact_id, 'kind', e.kind,
            'occurred_at', e.occurred_at, 'title', e.title, 'detail', e.detail,
            'payload', e.payload, 'actor', e.actor
        ) ORDER BY e.occurred_at DESC, e.created_at DESC)
        FROM public.contact_events e
        WHERE e.contact_id = c.id
    ), '[]'::jsonb),
    'jobs', coalesce((
        SELECT jsonb_agg(jsonb_build_object(
            'id', j.id, 'title', j.title, 'status', j.status,
            'created_at', j.created_at, 'slug', j.slug
        ) ORDER BY j.created_at DESC)
        FROM public.jobs j
        WHERE (c.user_id IS NOT NULL AND j.created_by = c.user_id)
           OR lower(coalesce(j.client_contact_info ->> 'email', '')) = c.email
    ), '[]'::jsonb),
    'credits', CASE
        WHEN c.audience_type <> 'pro' OR c.user_id IS NULL THEN NULL
        ELSE jsonb_build_object(
            'balance', coalesce((SELECT cr.balance FROM public.credits cr
                                 WHERE cr.pro_id = c.user_id), 0),
            'purchased_cents', coalesce((
                SELECT sum(coalesce(ct.amount_cents,
                    CASE ct.amount WHEN 3 THEN 6000 WHEN 10 THEN 15000
                                   WHEN 20 THEN 28000 ELSE 0 END))
                FROM public.credit_transactions ct
                WHERE ct.pro_id = c.user_id AND ct.type = 'purchase'), 0),
            'unlocks', coalesce((SELECT count(*) FROM public.unlocked_leads ul
                                 WHERE ul.pro_id = c.user_id), 0)
        )
    END
)
FROM c;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_contact_detail(UUID)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_contact_detail(UUID) TO service_role;

-- ────────────────────────────────────────────────────────────────────────────
-- h bis. RPC d'écriture pour les deux routes du contrat.
-- Fournies ici plutôt que laissées à des UPDATE directs côté route : le stage
-- manuel et sa trace dans le journal doivent être posés ENSEMBLE ou pas du tout.
--   POST /api/ops/contacts/[id]/events → admin_add_contact_event
--   POST /api/ops/contacts/[id]/stage  → admin_set_contact_stage
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_add_contact_event(
    p_contact_id UUID,
    p_kind       TEXT,
    p_title      TEXT,
    p_detail     TEXT DEFAULT NULL,
    p_actor      TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_id UUID;
BEGIN
    IF p_kind NOT IN ('note', 'call', 'email_sent', 'meeting') THEN
        RETURN jsonb_build_object('ok', FALSE, 'error', 'invalid_kind');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.marketing_contacts WHERE id = p_contact_id) THEN
        RETURN jsonb_build_object('ok', FALSE, 'error', 'contact_not_found');
    END IF;

    v_id := public.log_contact_event(
        p_contact_id, p_kind, p_title, p_detail, '{}'::jsonb, p_actor, NOW(), NULL
    );
    RETURN jsonb_build_object('ok', TRUE, 'event_id', v_id);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_add_contact_event(UUID, TEXT, TEXT, TEXT, TEXT)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_add_contact_event(UUID, TEXT, TEXT, TEXT, TEXT)
    TO service_role;

CREATE OR REPLACE FUNCTION public.admin_set_contact_stage(
    p_contact_id UUID,
    p_stage      TEXT,
    p_actor      TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_old TEXT;
BEGIN
    IF p_stage NOT IN ('nouveau', 'engage', 'converti', 'actif', 'dormant', 'desinscrit') THEN
        RETURN jsonb_build_object('ok', FALSE, 'error', 'invalid_stage');
    END IF;

    SELECT lifecycle_stage INTO v_old
    FROM public.marketing_contacts WHERE id = p_contact_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', FALSE, 'error', 'contact_not_found');
    END IF;

    -- Un désabonnement est un fait juridique : recompute_contact_lifecycle et
    -- contact_events_after_insert refusent tous deux d'écraser 'desinscrit'.
    -- Sans ce refus explicite, le RPC renverrait ok:true sur un no-op complet
    -- et l'écran afficherait un stage que la base n'a jamais posé.
    IF EXISTS (
        SELECT 1 FROM public.marketing_contacts
        WHERE id = p_contact_id AND unsubscribed_at IS NOT NULL
    ) THEN
        RETURN jsonb_build_object('ok', FALSE, 'error', 'contact_unsubscribed');
    END IF;

    -- Le trigger contact_events_after_insert pose lifecycle_stage +
    -- lifecycle_manual à partir du payload : une seule source de vérité.
    PERFORM public.log_contact_event(
        p_contact_id, 'status_change',
        format('Stage : %s → %s', v_old, p_stage), NULL,
        jsonb_build_object('stage', p_stage, 'previous_stage', v_old),
        p_actor, NOW(), NULL
    );

    RETURN jsonb_build_object('ok', TRUE, 'previous_stage', v_old, 'stage', p_stage);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_set_contact_stage(UUID, TEXT, TEXT)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_contact_stage(UUID, TEXT, TEXT) TO service_role;

COMMIT;

-- ────────────────────────────────────────────────────────────────────────────
-- Verrouillage final — filet de sécurité.
-- Les DEFAULT PRIVILEGES Supabase accordent EXECUTE à anon/authenticated sur
-- TOUTE nouvelle fonction du schéma public ; un REVOKE FROM PUBLIC seul ne les
-- retire pas (leçon 20260828l). On rebalaie par nom, hors transaction, pour
-- couvrir aussi une fonction ajoutée après coup.
-- ────────────────────────────────────────────────────────────────────────────
DO $lock$
DECLARE
    r record;
BEGIN
    FOR r IN
        SELECT p.oid::regprocedure AS sig
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public'
          AND p.proname IN (
              'ensure_marketing_contact', 'log_contact_event',
              'recompute_contact_lifecycle', 'contact_events_after_insert',
              'crm_feed_from_lead', 'crm_log_from_lead',
              'crm_feed_from_contact_request',
              'crm_feed_from_pro_alert', 'crm_feed_from_profile',
              'crm_feed_from_job', 'crm_feed_from_unlock',
              'crm_feed_from_credit_tx', 'crm_feed_unsubscribe',
              'admin_contacts_list', 'admin_contact_detail',
              'admin_add_contact_event', 'admin_set_contact_stage'
          )
    LOOP
        EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', r.sig);
        EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', r.sig);
    END LOOP;
END $lock$;

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================
-- 1) Idempotence : rejouer ce fichier en entier → aucun événement dupliqué.
--      SELECT contact_id, kind, dedupe_key, count(*) FROM contact_events
--      GROUP BY 1,2,3 HAVING count(*) > 1;   → 0 ligne
-- 2) Verrous (clé anon, doit renvoyer 42501) :
--      SELECT has_function_privilege('anon', 'public.admin_contacts_list(text,text,text,boolean,text,integer)', 'EXECUTE');
--      → false
-- 3) Robustesse : ALTER TABLE contact_events RENAME TO contact_events_ko;
--    puis INSERT INTO leads(...) → l'insertion PASSE avec un WARNING.
--    (remettre le nom ensuite)
-- 4) Stage manuel : SELECT admin_set_contact_stage('<uuid>', 'converti', 'anthony@…');
--    puis SELECT recompute_contact_lifecycle('<uuid>');  → toujours 'converti'.
-- 5) Lecture : SELECT jsonb_pretty(admin_contacts_list(NULL,NULL,NULL,NULL,NULL,5));
--              SELECT jsonb_pretty(admin_contact_detail('<uuid>'));
-- ============================================================================
