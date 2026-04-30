-- Lead follow-up columns : permettent au cron /api/cron/leads-followup
-- d'envoyer un email de relance 5 minutes après capture si le lead n'a pas
-- été converti en job, et de tracer l'envoi pour ne pas spammer.

ALTER TABLE leads
    ADD COLUMN IF NOT EXISTS followup_sent_at TIMESTAMPTZ NULL,
    ADD COLUMN IF NOT EXISTS followup_status TEXT NULL,    -- sent | skipped | failed
    ADD COLUMN IF NOT EXISTS followup_skip_reason TEXT NULL;

-- Index pour la requête du cron : lignes éligibles (créées il y a > 5 min, pas encore traitées)
CREATE INDEX IF NOT EXISTS idx_leads_followup_pending
    ON leads (created_at)
    WHERE followup_sent_at IS NULL;
