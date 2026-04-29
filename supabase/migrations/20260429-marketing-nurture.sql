-- ============================================================
-- LesCordistes — Marketing Nurturing automatisé (Phase 2)
-- À exécuter dans le SQL Editor de Supabase (idempotent)
--
-- Prérequis : 20260429-marketing.sql déjà appliqué (fournit les
-- tables marketing_*, RPC resolve_segment_contacts, sendMarketingEmail).
--
-- Concept : un "playbook" est une règle déclarative
--   "audience X (segment) reçoit le template Y avec délai Z entre
--   deux envois, plafonné à N envois par run cron".
-- L'edge function marketing-nurture-cron tourne chaque jour, évalue
-- chaque playbook actif, et envoie aux contacts éligibles.
-- ============================================================

-- ------------------------------------------------------------
-- 1. marketing_playbooks — règles de nurturing
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS marketing_playbooks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            TEXT NOT NULL,
    description     TEXT,
    audience_type   TEXT NOT NULL DEFAULT 'mixed'
                    CHECK (audience_type IN ('client', 'pro', 'mixed')),
    segment_id      UUID NOT NULL REFERENCES marketing_segments(id) ON DELETE RESTRICT,
    template_key    TEXT NOT NULL REFERENCES marketing_email_templates(template_key),
    template_data   JSONB NOT NULL DEFAULT '{}'::jsonb,
    subject         TEXT NOT NULL,
    preview_text    TEXT,
    -- trigger_kind : pour le MVP, seul 'cron_daily' est supporté.
    -- Plus tard : 'event_inscription_plus_n_days', 'event_first_unlock', etc.
    trigger_kind    TEXT NOT NULL DEFAULT 'cron_daily'
                    CHECK (trigger_kind IN ('cron_daily', 'manual_only')),
    -- cooldown_days : délai minimum AVANT le premier envoi à un contact.
    -- Permet de ne pas spammer les nouveaux inscrits ; ex: 7 = "n'envoie
    -- ce playbook qu'aux contacts créés il y a au moins 7 jours".
    cooldown_days   INTEGER NOT NULL DEFAULT 0 CHECK (cooldown_days >= 0),
    -- max_per_run : safety cap par exécution cron (anti-burst).
    max_per_run     INTEGER NOT NULL DEFAULT 200 CHECK (max_per_run > 0),
    is_active       BOOLEAN NOT NULL DEFAULT FALSE,
    last_run_at     TIMESTAMPTZ,
    stats           JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketing_playbooks_active
    ON marketing_playbooks (is_active, trigger_kind);
CREATE INDEX IF NOT EXISTS idx_marketing_playbooks_segment
    ON marketing_playbooks (segment_id);

-- ------------------------------------------------------------
-- 2. marketing_playbook_runs — ledger d'envois (1 ligne / playbook / contact)
-- ------------------------------------------------------------
-- Garde anti-doublon : un contact ne reçoit le même playbook qu'une
-- seule fois (UNIQUE (playbook_id, contact_id)).
CREATE TABLE IF NOT EXISTS marketing_playbook_runs (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    playbook_id       UUID NOT NULL REFERENCES marketing_playbooks(id) ON DELETE CASCADE,
    contact_id        UUID REFERENCES marketing_contacts(id) ON DELETE SET NULL,
    email             TEXT NOT NULL,
    status            TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'sent', 'failed', 'skipped', 'unsubscribed')),
    skip_reason       TEXT,
    resend_email_id   TEXT,
    error_message     TEXT,
    sent_at           TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_playbook_runs_unique
    ON marketing_playbook_runs (playbook_id, contact_id);
CREATE INDEX IF NOT EXISTS idx_playbook_runs_email
    ON marketing_playbook_runs (lower(email));
CREATE INDEX IF NOT EXISTS idx_playbook_runs_status
    ON marketing_playbook_runs (playbook_id, status, created_at DESC);

-- ------------------------------------------------------------
-- 3. RLS — service_role + admin authentifié en lecture
-- ------------------------------------------------------------
ALTER TABLE marketing_playbooks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_playbook_runs  ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN SELECT unnest(ARRAY['marketing_playbooks', 'marketing_playbook_runs']) LOOP
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

-- updated_at trigger
DROP TRIGGER IF EXISTS update_marketing_playbooks_updated_at ON marketing_playbooks;
CREATE TRIGGER update_marketing_playbooks_updated_at
    BEFORE UPDATE ON marketing_playbooks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------
-- 4. RPC resolve_playbook_recipients — contacts ÉLIGIBLES pour un
-- playbook donné = (segment ∩ pas-déjà-reçu ∩ ancienneté ≥ cooldown_days).
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION resolve_playbook_recipients(
    p_playbook_id UUID,
    p_max         INTEGER DEFAULT 200
)
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
    v_segment_id    UUID;
    v_cooldown_days INTEGER;
BEGIN
    SELECT pb.segment_id, pb.cooldown_days
    INTO v_segment_id, v_cooldown_days
    FROM marketing_playbooks pb
    WHERE pb.id = p_playbook_id;

    IF v_segment_id IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT s.contact_id, s.email, s.first_name, s.last_name, s.audience_type
    FROM resolve_segment_contacts(v_segment_id) AS s
    JOIN marketing_contacts mc ON mc.id = s.contact_id
    WHERE mc.created_at <= NOW() - (v_cooldown_days || ' days')::INTERVAL
      AND NOT EXISTS (
          SELECT 1 FROM marketing_playbook_runs r
          WHERE r.playbook_id = p_playbook_id
            AND r.contact_id  = s.contact_id
      )
    LIMIT GREATEST(p_max, 1);
END;
$$;

REVOKE ALL ON FUNCTION resolve_playbook_recipients(UUID, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION resolve_playbook_recipients(UUID, INTEGER) TO service_role;

-- ------------------------------------------------------------
-- 5. RPC list_active_playbooks — utilisée par le cron
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION list_active_playbooks()
RETURNS TABLE (
    id            UUID,
    name          TEXT,
    audience_type TEXT,
    segment_id    UUID,
    template_key  TEXT,
    edge_template_id TEXT,
    template_data JSONB,
    subject       TEXT,
    preview_text  TEXT,
    cooldown_days INTEGER,
    max_per_run   INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT pb.id, pb.name, pb.audience_type, pb.segment_id, pb.template_key,
           t.edge_template_id, pb.template_data, pb.subject, pb.preview_text,
           pb.cooldown_days, pb.max_per_run
    FROM marketing_playbooks pb
    JOIN marketing_email_templates t ON t.template_key = pb.template_key
    WHERE pb.is_active = TRUE
      AND pb.trigger_kind = 'cron_daily'
      AND t.is_active = TRUE;
END;
$$;

REVOKE ALL ON FUNCTION list_active_playbooks() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION list_active_playbooks() TO service_role;

-- ------------------------------------------------------------
-- 6. Seed — playbooks de référence (inactifs par défaut, l'admin
-- les active via l'UI quand il est prêt).
-- ------------------------------------------------------------
DO $$
DECLARE
    v_seg_pros_zero      UUID;
    v_seg_pros_incomplete UUID;
    v_seg_clients_inactive UUID;
BEGIN
    SELECT id INTO v_seg_pros_zero       FROM marketing_segments WHERE filters->>'preset' = 'pros_zero_unlocks'       LIMIT 1;
    SELECT id INTO v_seg_pros_incomplete FROM marketing_segments WHERE filters->>'preset' = 'pros_profile_incomplete' LIMIT 1;
    SELECT id INTO v_seg_clients_inactive FROM marketing_segments WHERE filters->>'preset' = 'clients_inactive'       LIMIT 1;

    IF v_seg_pros_zero IS NOT NULL THEN
        INSERT INTO marketing_playbooks
            (name, description, audience_type, segment_id, template_key, subject, preview_text,
             trigger_kind, cooldown_days, max_per_run, is_active)
        VALUES (
            'Pro · Zéro unlock J+8 → BIENVENUE1',
            'Offre 1 crédit gratuit aux pros sans aucun unlock après 8 jours. Reproduit la campagne BIENVENUE1.',
            'pro',
            v_seg_pros_zero,
            'mkt-pro-credit-offer',
            'Votre crédit offert vous attend',
            'Découvrez gratuitement la qualité des missions LesCordistes.',
            'cron_daily',
            8,
            100,
            FALSE
        )
        ON CONFLICT DO NOTHING;
    END IF;

    IF v_seg_pros_incomplete IS NOT NULL THEN
        INSERT INTO marketing_playbooks
            (name, description, audience_type, segment_id, template_key, subject, preview_text,
             trigger_kind, cooldown_days, max_per_run, is_active, template_data)
        VALUES (
            'Pro · Profil incomplet J+5',
            'Relance pros dont la bio, les zones d''intervention ou les certifications sont vides.',
            'pro',
            v_seg_pros_incomplete,
            'mkt-admin-custom',
            'Complétez votre profil — 3× plus de matchs',
            'Les profils complets reçoivent en moyenne 3 fois plus de contacts clients.',
            'cron_daily',
            5,
            150,
            FALSE,
            jsonb_build_object(
                'body', E'Votre profil est presque prêt. Il manque encore quelques informations qui font la différence pour les clients qui choisissent un cordiste.\n\n• Une bio claire (qui vous êtes, vos spécialités)\n• Vos zones d''intervention (pour recevoir les bonnes alertes)\n• Vos certifications (CQP, IRATA, habilitations)\n\nLes profils complets reçoivent en moyenne 3 fois plus de contacts clients. 5 minutes pour finir, et vous êtes visible sur Google.',
                'link', 'https://www.lescordistes.com/profile',
                'linkText', 'Compléter mon profil'
            )
        )
        ON CONFLICT DO NOTHING;
    END IF;

    IF v_seg_clients_inactive IS NOT NULL THEN
        INSERT INTO marketing_playbooks
            (name, description, audience_type, segment_id, template_key, subject, preview_text,
             trigger_kind, cooldown_days, max_per_run, is_active, template_data)
        VALUES (
            'Client · Inactif >30j — réactivation',
            'Clients sans mission live qui ne se sont pas connectés depuis plus de 30 jours.',
            'client',
            v_seg_clients_inactive,
            'mkt-admin-custom',
            'On a des cordistes près de chez vous',
            'Un nouveau projet en tête ?',
            'cron_daily',
            30,
            100,
            FALSE,
            jsonb_build_object(
                'body', E'Cela fait un moment qu''on ne s''est pas vus. Le réseau s''est étoffé : aujourd''hui, des centaines de cordistes certifiés interviennent dans toute la France pour des chantiers de toutes tailles — ravalement, démoussage, vitrerie en hauteur, dépose de pollution, sécurisation, événementiel.\n\nSi vous avez un projet en tête, publier votre demande prend 3 minutes et vous recevez vos premiers devis sous 24h.',
                'link', 'https://www.lescordistes.com/post-job',
                'linkText', 'Publier un projet'
            )
        )
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- ============================================================
-- FIN — vérifier :
--   SELECT name, is_active, trigger_kind, cooldown_days FROM marketing_playbooks;
--   SELECT * FROM list_active_playbooks();
--   SELECT * FROM resolve_playbook_recipients('<id>', 10);
-- ============================================================
