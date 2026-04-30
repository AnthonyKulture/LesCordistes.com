-- Demandes de contact alternatives au wizard /post-job :
--   - 'quick_message' : mini-formulaire (nom + email + ville + message court)
--   - 'callback'      : être recontacté (téléphone OU email + créneau)
--
-- Permet aux visiteurs qui ne veulent pas remplir le wizard 5-7 étapes
-- de quand même engager. Notification Telegram immédiate à l'admin.

CREATE TABLE IF NOT EXISTS contact_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    request_type TEXT NOT NULL CHECK (request_type IN ('quick_message', 'callback')),
    first_name TEXT,
    email TEXT,
    phone TEXT,
    city TEXT,
    category TEXT,
    message TEXT,
    preferred_channel TEXT CHECK (preferred_channel IN ('email', 'phone')),
    preferred_time_slot TEXT, -- 'morning' | 'afternoon' | 'evening' | null
    source TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
    notes TEXT,
    contacted_at TIMESTAMPTZ,
    contacted_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT contact_requests_has_contact CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at ON contact_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON contact_requests (status) WHERE status = 'new';

ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert a contact request"
    ON contact_requests FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Service role only select"
    ON contact_requests FOR SELECT
    USING (false);

CREATE POLICY "Service role only update"
    ON contact_requests FOR UPDATE
    USING (false);
