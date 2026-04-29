-- ============================================================
-- LesCordistes — Système Marketing Email (Phase 1)
-- À exécuter dans le SQL Editor de Supabase (idempotent)
--
-- Principe : tables marketing_* dédiées, RLS service_role + admin
-- only, séparées strictement des emails transactionnels existants.
-- Aucune table existante n'est modifiée de manière destructive.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- 1. marketing_contacts — source unique des destinataires
-- ------------------------------------------------------------
-- Un user → un contact (sync depuis profiles via RPC).
-- Permet aussi d'accueillir plus tard des contacts non-users (ex.
-- table leads) sans toucher profiles.
CREATE TABLE IF NOT EXISTS marketing_contacts (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id           UUID UNIQUE REFERENCES profiles(id) ON DELETE SET NULL,
    email             TEXT NOT NULL,
    first_name        TEXT,
    last_name         TEXT,
    audience_type     TEXT NOT NULL DEFAULT 'unknown'
                      CHECK (audience_type IN ('client', 'pro', 'mixed', 'unknown')),
    marketing_opt_in  BOOLEAN NOT NULL DEFAULT TRUE,
    unsubscribed_at   TIMESTAMPTZ,
    source            TEXT,                -- 'profile_sync', 'manual_import', 'lead_import', etc.
    metadata          JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_marketing_contacts_email_lower
    ON marketing_contacts (lower(email));
CREATE INDEX IF NOT EXISTS idx_marketing_contacts_audience
    ON marketing_contacts (audience_type) WHERE marketing_opt_in = TRUE;
CREATE INDEX IF NOT EXISTS idx_marketing_contacts_unsub
    ON marketing_contacts (unsubscribed_at) WHERE unsubscribed_at IS NOT NULL;

-- ------------------------------------------------------------
-- 2. marketing_email_templates — catalogue de templates utilisables
-- ------------------------------------------------------------
-- Le `template_key` est libre côté admin (ex: 'mkt-pro-credit-offer').
-- Le `edge_template_id` mappe vers un template existant dans la
-- edge function send-email (ex: 'pro-credit-offer', 'admin-custom',
-- 'marketing-generic'). Cela permet de réutiliser TOUS les templates
-- existants comme building blocks marketing.
CREATE TABLE IF NOT EXISTS marketing_email_templates (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_key        TEXT NOT NULL UNIQUE,
    name                TEXT NOT NULL,
    description         TEXT,
    audience_type       TEXT NOT NULL DEFAULT 'mixed'
                        CHECK (audience_type IN ('client', 'pro', 'mixed')),
    edge_template_id    TEXT NOT NULL,           -- ex: 'admin-custom', 'pro-credit-offer', 'marketing-generic'
    subject_default     TEXT,
    preview_text_default TEXT,
    react_template_path TEXT,                    -- pour traçabilité (chemin du fichier template si réact-style)
    metadata            JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketing_templates_active
    ON marketing_email_templates (audience_type) WHERE is_active = TRUE;

-- Seed — réutilisation des templates Edge déjà déployés.
INSERT INTO marketing_email_templates
    (template_key, name, description, audience_type, edge_template_id,
     subject_default, preview_text_default, react_template_path, metadata)
VALUES
    (
        'mkt-pro-credit-offer',
        'Pro · Crédit offert (BIENVENUE1)',
        'Offre 1 crédit gratuit pour les pros sans aucun unlock. Code BIENVENUE1, valable 14 jours.',
        'pro',
        'pro-credit-offer',
        'Votre crédit offert sur LesCordistes.com',
        'Découvrez gratuitement la qualité des missions LesCordistes.',
        'supabase/functions/send-email/index.ts:proCreditOffer',
        jsonb_build_object('variables', ARRAY['prenom', 'unsubscribeUrl'])
    ),
    (
        'mkt-admin-custom',
        'Custom · Message libre + CTA',
        'Template générique : titre, corps texte (paragraphes), bouton CTA optionnel. Idéal pour annonces et campagnes ad-hoc.',
        'mixed',
        'admin-custom',
        NULL,
        NULL,
        'supabase/functions/send-email/index.ts:adminCustom',
        jsonb_build_object('variables', ARRAY['name', 'subject', 'body', 'link', 'linkText'])
    ),
    (
        'mkt-generic-html',
        'Générique · HTML libre',
        'Template marketing avec footer obligatoire (lien désinscription). Permet d''injecter du HTML personnalisé.',
        'mixed',
        'marketing-generic',
        NULL,
        NULL,
        'supabase/functions/send-email/index.ts:marketingGeneric',
        jsonb_build_object('variables', ARRAY['name', 'subject', 'previewText', 'html', 'unsubscribeUrl'])
    )
ON CONFLICT (template_key) DO NOTHING;

-- ------------------------------------------------------------
-- 3. marketing_segments — listes de filtres réutilisables
-- ------------------------------------------------------------
-- `filters` jsonb : { "kind": "preset", "preset": "pro_zero_unlocks" }
-- ou { "kind": "custom", "rules": [...] } pour plus tard.
CREATE TABLE IF NOT EXISTS marketing_segments (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          TEXT NOT NULL,
    description   TEXT,
    audience_type TEXT NOT NULL DEFAULT 'mixed'
                  CHECK (audience_type IN ('client', 'pro', 'mixed')),
    filters       JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_system     BOOLEAN NOT NULL DEFAULT FALSE,   -- segments seedés par le système
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketing_segments_audience
    ON marketing_segments (audience_type);

-- Seed — segments système (ne pas supprimer en UI).
INSERT INTO marketing_segments (name, description, audience_type, filters, is_system) VALUES
    ('Tous les clients (opt-in)',           'Clients avec marketing_opt_in = true',
     'client', jsonb_build_object('kind','preset','preset','all_clients_opt_in'), TRUE),
    ('Tous les pros (opt-in)',              'Pros avec marketing_opt_in = true',
     'pro',    jsonb_build_object('kind','preset','preset','all_pros_opt_in'), TRUE),
    ('Pros sans aucun unlock',              'Pros inscrits qui n''ont jamais débloqué de mission',
     'pro',    jsonb_build_object('kind','preset','preset','pros_zero_unlocks'), TRUE),
    ('Pros profil incomplet',               'Pros avec bio OR intervention_zones OR certifications vides',
     'pro',    jsonb_build_object('kind','preset','preset','pros_profile_incomplete'), TRUE),
    ('Pros validés inactifs (>21j)',        'verification_status=verified, dernière auth > 21j',
     'pro',    jsonb_build_object('kind','preset','preset','pros_verified_inactive'), TRUE),
    ('Clients inactifs (>30j)',             'Clients sans mission live et sign-in > 30j',
     'client', jsonb_build_object('kind','preset','preset','clients_inactive'), TRUE),
    ('Inscrits dans les 30 derniers jours', 'Tous les contacts créés < 30j',
     'mixed',  jsonb_build_object('kind','preset','preset','recent_contacts_30d'), TRUE)
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- 4. marketing_campaigns — état d'une campagne
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            TEXT NOT NULL,                 -- nom interne
    subject         TEXT NOT NULL,
    preview_text    TEXT,
    template_key    TEXT NOT NULL REFERENCES marketing_email_templates(template_key),
    template_data   JSONB NOT NULL DEFAULT '{}'::jsonb,  -- variables injectées dans le template
    audience_type   TEXT NOT NULL DEFAULT 'mixed'
                    CHECK (audience_type IN ('client', 'pro', 'mixed')),
    segment_id      UUID REFERENCES marketing_segments(id),
    status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled')),
    scheduled_at    TIMESTAMPTZ,
    sending_started_at TIMESTAMPTZ,
    sent_at         TIMESTAMPTZ,
    created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
    stats           JSONB NOT NULL DEFAULT '{}'::jsonb,  -- { targeted, sent, failed, skipped, unsubscribed }
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status
    ON marketing_campaigns (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_audience
    ON marketing_campaigns (audience_type);

-- ------------------------------------------------------------
-- 5. marketing_campaign_recipients — 1 ligne / destinataire / campagne
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS marketing_campaign_recipients (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id       UUID NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
    contact_id        UUID REFERENCES marketing_contacts(id) ON DELETE SET NULL,
    email             TEXT NOT NULL,
    status            TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'sent', 'failed', 'skipped', 'unsubscribed')),
    skip_reason       TEXT,                        -- 'no_opt_in', 'unsubscribed', 'invalid_email', 'duplicate'
    resend_email_id   TEXT,
    error_message     TEXT,
    sent_at           TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Garde anti-double-envoi (1 destinataire ne reçoit la campagne qu'une fois).
CREATE UNIQUE INDEX IF NOT EXISTS idx_campaign_recipients_unique
    ON marketing_campaign_recipients (campaign_id, lower(email));
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_status
    ON marketing_campaign_recipients (campaign_id, status);

-- ------------------------------------------------------------
-- 6. marketing_unsubscribes — audit trail des désinscriptions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS marketing_unsubscribes (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       TEXT NOT NULL,
    contact_id  UUID REFERENCES marketing_contacts(id) ON DELETE SET NULL,
    campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE SET NULL,
    reason      TEXT,
    user_agent  TEXT,
    ip_hash     TEXT,                              -- IP hashée (RGPD : pas d'IP en clair)
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketing_unsubscribes_email
    ON marketing_unsubscribes (lower(email));

-- ------------------------------------------------------------
-- 7. RLS — service_role en écriture, admin authentifié en lecture
-- ------------------------------------------------------------
ALTER TABLE marketing_contacts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_email_templates      ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_segments             ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns            ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaign_recipients  ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_unsubscribes         ENABLE ROW LEVEL SECURITY;

-- Helper: tout ce qui passe par service_role (API admin Next.js, RPC SECURITY DEFINER) a tous les droits.
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN SELECT unnest(ARRAY[
        'marketing_contacts',
        'marketing_email_templates',
        'marketing_segments',
        'marketing_campaigns',
        'marketing_campaign_recipients',
        'marketing_unsubscribes'
    ])
    LOOP
        EXECUTE format($f$
            DROP POLICY IF EXISTS "%1$s_service_role_all" ON %1$s;
            CREATE POLICY "%1$s_service_role_all" ON %1$s
                FOR ALL USING ((auth.jwt() ->> 'role') = 'service_role')
                WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');

            DROP POLICY IF EXISTS "%1$s_admin_select" ON %1$s;
            CREATE POLICY "%1$s_admin_select" ON %1$s
                FOR SELECT TO authenticated
                USING (EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                      AND profiles.role = 'admin'
                ));
        $f$, t);
    END LOOP;
END $$;

-- ------------------------------------------------------------
-- 8. updated_at triggers (réutilise la fonction du schéma initial)
-- ------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $f$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $f$ LANGUAGE plpgsql;
    END IF;
END $$;

DROP TRIGGER IF EXISTS update_marketing_contacts_updated_at ON marketing_contacts;
CREATE TRIGGER update_marketing_contacts_updated_at
    BEFORE UPDATE ON marketing_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_marketing_email_templates_updated_at ON marketing_email_templates;
CREATE TRIGGER update_marketing_email_templates_updated_at
    BEFORE UPDATE ON marketing_email_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_marketing_segments_updated_at ON marketing_segments;
CREATE TRIGGER update_marketing_segments_updated_at
    BEFORE UPDATE ON marketing_segments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_marketing_campaigns_updated_at ON marketing_campaigns;
CREATE TRIGGER update_marketing_campaigns_updated_at
    BEFORE UPDATE ON marketing_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------
-- 9. RPC sync_marketing_contacts() — populate / refresh contacts
-- depuis profiles. À appeler depuis l'admin (bouton "Synchroniser").
-- ------------------------------------------------------------
-- IMPORTANT : Si un contact a unsubscribed_at != NULL, on ne le réactive
-- jamais via sync. Sinon on respecte l'opt_in implicite (TRUE par défaut).
CREATE OR REPLACE FUNCTION sync_marketing_contacts()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_inserted INTEGER := 0;
    v_updated  INTEGER := 0;
    v_total    INTEGER := 0;
BEGIN
    WITH src AS (
        SELECT
            p.id          AS user_id,
            lower(p.email) AS email_lc,
            p.email       AS email_raw,
            p.first_name,
            p.last_name,
            CASE p.role
                WHEN 'client' THEN 'client'
                WHEN 'pro'    THEN 'pro'
                ELSE 'unknown'
            END AS audience_type
        FROM profiles p
        WHERE p.email IS NOT NULL AND p.email <> ''
          AND p.role IN ('client', 'pro')
    ),
    upsert AS (
        INSERT INTO marketing_contacts AS mc
            (user_id, email, first_name, last_name, audience_type, source)
        SELECT user_id, email_raw, first_name, last_name, audience_type, 'profile_sync'
        FROM src
        ON CONFLICT (user_id) DO UPDATE SET
            email          = EXCLUDED.email,
            first_name     = EXCLUDED.first_name,
            last_name      = EXCLUDED.last_name,
            audience_type  = EXCLUDED.audience_type,
            updated_at     = NOW()
        RETURNING (xmax = 0) AS is_insert
    )
    SELECT
        COUNT(*) FILTER (WHERE is_insert),
        COUNT(*) FILTER (WHERE NOT is_insert),
        COUNT(*)
    INTO v_inserted, v_updated, v_total
    FROM upsert;

    RETURN jsonb_build_object(
        'inserted', v_inserted,
        'updated',  v_updated,
        'total',    v_total
    );
END;
$$;

REVOKE ALL ON FUNCTION sync_marketing_contacts() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION sync_marketing_contacts() TO service_role;

-- ------------------------------------------------------------
-- 10. RPC resolve_segment_emails(segment_id) — retourne les emails
-- ciblés par un segment. Utilisé pour preview + envoi.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION resolve_segment_contacts(p_segment_id UUID)
RETURNS TABLE (
    contact_id    UUID,
    email         TEXT,
    first_name    TEXT,
    last_name     TEXT,
    audience_type TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_filters JSONB;
    v_preset  TEXT;
BEGIN
    SELECT filters INTO v_filters
    FROM marketing_segments
    WHERE id = p_segment_id;

    IF v_filters IS NULL THEN
        RETURN;
    END IF;

    v_preset := v_filters->>'preset';

    -- Tous les "preset" filtrent automatiquement les opt-out + emails manquants.
    IF v_preset = 'all_clients_opt_in' THEN
        RETURN QUERY
        SELECT mc.id, mc.email, mc.first_name, mc.last_name, mc.audience_type
        FROM marketing_contacts mc
        WHERE mc.audience_type = 'client'
          AND mc.marketing_opt_in = TRUE
          AND mc.unsubscribed_at IS NULL;

    ELSIF v_preset = 'all_pros_opt_in' THEN
        RETURN QUERY
        SELECT mc.id, mc.email, mc.first_name, mc.last_name, mc.audience_type
        FROM marketing_contacts mc
        WHERE mc.audience_type = 'pro'
          AND mc.marketing_opt_in = TRUE
          AND mc.unsubscribed_at IS NULL;

    ELSIF v_preset = 'pros_zero_unlocks' THEN
        RETURN QUERY
        SELECT mc.id, mc.email, mc.first_name, mc.last_name, mc.audience_type
        FROM marketing_contacts mc
        WHERE mc.audience_type = 'pro'
          AND mc.marketing_opt_in = TRUE
          AND mc.unsubscribed_at IS NULL
          AND mc.user_id IS NOT NULL
          AND NOT EXISTS (
              SELECT 1 FROM unlocked_leads ul WHERE ul.pro_id = mc.user_id
          );

    ELSIF v_preset = 'pros_profile_incomplete' THEN
        RETURN QUERY
        SELECT mc.id, mc.email, mc.first_name, mc.last_name, mc.audience_type
        FROM marketing_contacts mc
        JOIN profiles p ON p.id = mc.user_id
        WHERE mc.audience_type = 'pro'
          AND mc.marketing_opt_in = TRUE
          AND mc.unsubscribed_at IS NULL
          AND (
                COALESCE(p.bio, '') = ''
             OR p.intervention_zones IS NULL OR array_length(p.intervention_zones, 1) IS NULL
             OR p.certifications IS NULL OR array_length(p.certifications, 1) IS NULL
          );

    ELSIF v_preset = 'pros_verified_inactive' THEN
        RETURN QUERY
        SELECT mc.id, mc.email, mc.first_name, mc.last_name, mc.audience_type
        FROM marketing_contacts mc
        JOIN profiles p ON p.id = mc.user_id
        LEFT JOIN auth.users u ON u.id = p.id
        WHERE mc.audience_type = 'pro'
          AND mc.marketing_opt_in = TRUE
          AND mc.unsubscribed_at IS NULL
          AND p.verification_status = 'verified'
          AND (u.last_sign_in_at IS NULL OR u.last_sign_in_at < NOW() - INTERVAL '21 days');

    ELSIF v_preset = 'clients_inactive' THEN
        RETURN QUERY
        SELECT mc.id, mc.email, mc.first_name, mc.last_name, mc.audience_type
        FROM marketing_contacts mc
        JOIN profiles p ON p.id = mc.user_id
        LEFT JOIN auth.users u ON u.id = p.id
        WHERE mc.audience_type = 'client'
          AND mc.marketing_opt_in = TRUE
          AND mc.unsubscribed_at IS NULL
          AND (u.last_sign_in_at IS NULL OR u.last_sign_in_at < NOW() - INTERVAL '30 days')
          AND NOT EXISTS (
              SELECT 1 FROM jobs j
              WHERE j.created_by = mc.user_id AND j.status = 'live'
          );

    ELSIF v_preset = 'recent_contacts_30d' THEN
        RETURN QUERY
        SELECT mc.id, mc.email, mc.first_name, mc.last_name, mc.audience_type
        FROM marketing_contacts mc
        WHERE mc.marketing_opt_in = TRUE
          AND mc.unsubscribed_at IS NULL
          AND mc.created_at > NOW() - INTERVAL '30 days';

    ELSE
        -- Aucun preset reconnu → segment vide (safe par défaut).
        RETURN;
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION resolve_segment_contacts(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION resolve_segment_contacts(UUID) TO service_role;

-- ------------------------------------------------------------
-- 11. RPC mark_unsubscribed(email, reason, campaign_id) — endpoint
-- public unsubscribe écrit ici via service_role.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION mark_marketing_unsubscribed(
    p_email      TEXT,
    p_reason     TEXT DEFAULT NULL,
    p_campaign_id UUID DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_ip_hash    TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_email_lc TEXT := lower(trim(p_email));
    v_contact_id UUID;
BEGIN
    IF v_email_lc IS NULL OR v_email_lc = '' THEN
        RETURN jsonb_build_object('ok', false, 'error', 'invalid_email');
    END IF;

    SELECT id INTO v_contact_id
    FROM marketing_contacts
    WHERE lower(email) = v_email_lc
    LIMIT 1;

    IF v_contact_id IS NULL THEN
        -- Le contact n'existe pas en base : on enregistre quand même la
        -- demande pour audit, et on créera un contact "ghost" opt-out
        -- pour bloquer toute future sync.
        INSERT INTO marketing_contacts (email, audience_type, marketing_opt_in, unsubscribed_at, source)
        VALUES (p_email, 'unknown', FALSE, NOW(), 'unsubscribe_link')
        ON CONFLICT ((lower(email))) DO UPDATE SET
            marketing_opt_in = FALSE,
            unsubscribed_at = COALESCE(marketing_contacts.unsubscribed_at, NOW())
        RETURNING id INTO v_contact_id;
    ELSE
        UPDATE marketing_contacts
        SET marketing_opt_in = FALSE,
            unsubscribed_at = COALESCE(unsubscribed_at, NOW()),
            updated_at = NOW()
        WHERE id = v_contact_id;
    END IF;

    INSERT INTO marketing_unsubscribes
        (email, contact_id, campaign_id, reason, user_agent, ip_hash)
    VALUES
        (p_email, v_contact_id, p_campaign_id, p_reason, p_user_agent, p_ip_hash);

    RETURN jsonb_build_object(
        'ok', true,
        'contact_id', v_contact_id,
        'email', v_email_lc
    );
END;
$$;

REVOKE ALL ON FUNCTION mark_marketing_unsubscribed(TEXT, TEXT, UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION mark_marketing_unsubscribed(TEXT, TEXT, UUID, TEXT, TEXT) TO service_role;

-- ============================================================
-- FIN — vérifier en dashboard Supabase :
--   SELECT * FROM marketing_email_templates;
--   SELECT * FROM marketing_segments;
--   SELECT sync_marketing_contacts();
-- ============================================================
