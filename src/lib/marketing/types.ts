// Types partagés pour le système marketing.

export type AudienceType = 'client' | 'pro' | 'mixed' | 'unknown'
export type AudienceTypeWritable = 'client' | 'pro' | 'mixed'
export type CampaignStatus =
    | 'draft'
    | 'scheduled'
    | 'sending'
    | 'sent'
    | 'failed'
    | 'cancelled'
export type RecipientStatus =
    | 'pending'
    | 'sent'
    | 'failed'
    | 'skipped'
    | 'unsubscribed'

export type SegmentPreset =
    | 'all_clients_opt_in'
    | 'all_pros_opt_in'
    | 'pros_zero_unlocks'
    | 'pros_profile_incomplete'
    | 'pros_verified_inactive'
    | 'clients_inactive'
    | 'recent_contacts_30d'

export interface SegmentFilter {
    kind: 'preset' | 'custom'
    preset?: SegmentPreset
    rules?: unknown
}

export interface MarketingTemplateRow {
    id: string
    template_key: string
    name: string
    description: string | null
    audience_type: AudienceTypeWritable
    edge_template_id: string
    subject_default: string | null
    preview_text_default: string | null
    react_template_path: string | null
    metadata: Record<string, unknown>
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface MarketingSegmentRow {
    id: string
    name: string
    description: string | null
    audience_type: AudienceTypeWritable
    filters: SegmentFilter
    is_system: boolean
    created_at: string
    updated_at: string
}

export interface MarketingCampaignRow {
    id: string
    name: string
    subject: string
    preview_text: string | null
    template_key: string
    template_data: Record<string, unknown>
    audience_type: AudienceTypeWritable
    segment_id: string | null
    status: CampaignStatus
    scheduled_at: string | null
    sending_started_at: string | null
    sent_at: string | null
    created_by: string | null
    stats: CampaignStats
    created_at: string
    updated_at: string
}

export interface CampaignStats {
    targeted?: number
    sent?: number
    failed?: number
    skipped?: number
    unsubscribed?: number
    last_error?: string
}

export interface MarketingContactRow {
    id: string
    user_id: string | null
    email: string
    first_name: string | null
    last_name: string | null
    audience_type: AudienceType
    marketing_opt_in: boolean
    unsubscribed_at: string | null
    source: string | null
    metadata: Record<string, unknown>
    created_at: string
    updated_at: string
}

export interface ResolvedRecipient {
    contact_id: string
    email: string
    first_name: string | null
    last_name: string | null
    audience_type: AudienceType
}
