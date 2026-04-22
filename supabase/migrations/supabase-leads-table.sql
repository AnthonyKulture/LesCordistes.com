CREATE TABLE IF NOT EXISTS leads (
    id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email        TEXT NOT NULL,
    phone        TEXT,
    category     TEXT,
    city         TEXT,
    step_reached INT NOT NULL DEFAULT 1,
    source       TEXT,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS leads_email_unique ON leads (email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_category ON leads (category);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert a lead"
    ON leads FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Service role only select"
    ON leads FOR SELECT
    USING (false);

CREATE POLICY "Service role only update"
    ON leads FOR UPDATE
    USING (false);
