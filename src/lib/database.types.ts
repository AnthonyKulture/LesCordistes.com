export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string
                    role: 'client' | 'pro' | 'admin'
                    full_name: string | null
                    phone: string | null
                    bio: string | null
                    certifications: string[] | null
                    skills: string[] | null
                    avatar_url: string | null
                    client_type: string | null
                    // Phase 3
                    company_name: string | null
                    intervention_zones: string[] | null
                    equipment: string[] | null
                    insurance_info: string | null
                    portfolio_photos: string[] | null
                    siret: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    role?: 'client' | 'pro' | 'admin'
                    full_name?: string | null
                    phone?: string | null
                    bio?: string | null
                    certifications?: string[] | null
                    skills?: string[] | null
                    avatar_url?: string | null
                    company_name?: string | null
                    intervention_zones?: string[] | null
                    equipment?: string[] | null
                    insurance_info?: string | null
                    portfolio_photos?: string[] | null
                    siret?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    role?: 'client' | 'pro' | 'admin'
                    full_name?: string | null
                    phone?: string | null
                    bio?: string | null
                    certifications?: string[] | null
                    skills?: string[] | null
                    avatar_url?: string | null
                    company_name?: string | null
                    intervention_zones?: string[] | null
                    equipment?: string[] | null
                    insurance_info?: string | null
                    portfolio_photos?: string[] | null
                    siret?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            jobs: {
                Row: {
                    id: string
                    slug: string | null
                    title: string
                    description: string
                    category: 'cleaning' | 'construction' | 'masonry' | 'painting' | 'industry' | 'event' | 'other'
                    type: 'standard' | 'renfort_pro' | null
                    client_type: 'particulier' | 'copropriete_syndic' | 'entreprise_tertiaire' | 'industrie_energie' | 'collectivite_public' | 'association_evenementiel' | 'entreprise_travaux_hauteur' | 'entreprise_btp' | 'agence_interim' | 'autre_pro' | null
                    location_city: string
                    location_address: string | null
                    location_department: string | null
                    height_meters: number | null
                    budget_min: number | null
                    budget_max: number | null
                    deadline: string | null
                    photos_url: string[] | null
                    status: 'pending' | 'live' | 'rejected' | 'completed' | 'cancelled'
                    rejection_reason: string | null
                    client_contact_info: Json
                    created_by: string | null
                    // B2B fields
                    internal_reference: string | null
                    structure_type: 'habitat_residentiel' | 'tertiaire_bureaux' | 'industrie_energie' | 'genie_civil_ouvrages' | 'milieu_naturel_parois' | 'evenementiel_spectacle' | null
                    required_level: string[] | null
                    required_habilitations: string[] | null
                    secondary_trades: string[] | null
                    equipment_management: 'pro_brings_all' | 'agency_provides_all' | 'agency_provides_ropes_pro_brings_personal' | null
                    specific_equipment: string | null
                    start_date: string | null
                    duration_days: number | null
                    work_night_weekend: boolean | null
                    contract_type: 'subcontracting' | 'freelance' | null
                    daily_rate: number | null
                    security_plan_confirmed: boolean | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    slug?: string | null
                    title: string
                    description: string
                    category: 'cleaning' | 'construction' | 'masonry' | 'painting' | 'industry' | 'event' | 'other'
                    type?: 'standard' | 'renfort_pro' | null
                    client_type?: 'particulier' | 'copropriete_syndic' | 'entreprise_tertiaire' | 'industrie_energie' | 'collectivite_public' | 'association_evenementiel' | 'entreprise_travaux_hauteur' | 'entreprise_btp' | 'agence_interim' | 'autre_pro' | null
                    location_city: string
                    location_address?: string | null
                    location_department?: string | null
                    height_meters?: number | null
                    budget_min?: number | null
                    budget_max?: number | null
                    deadline?: string | null
                    photos_url?: string[] | null
                    status?: 'pending' | 'live' | 'rejected' | 'completed' | 'cancelled'
                    rejection_reason?: string | null
                    client_contact_info: Json
                    created_by?: string | null
                    // B2B fields
                    internal_reference?: string | null
                    structure_type?: 'habitat_residentiel' | 'tertiaire_bureaux' | 'industrie_energie' | 'genie_civil_ouvrages' | 'milieu_naturel_parois' | 'evenementiel_spectacle' | null
                    required_level?: string[] | null
                    required_habilitations?: string[] | null
                    secondary_trades?: string[] | null
                    equipment_management?: 'pro_brings_all' | 'agency_provides_all' | 'agency_provides_ropes_pro_brings_personal' | null
                    specific_equipment?: string | null
                    start_date?: string | null
                    duration_days?: number | null
                    work_night_weekend?: boolean | null
                    contract_type?: 'subcontracting' | 'freelance' | null
                    daily_rate?: number | null
                    security_plan_confirmed?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    slug?: string | null
                    title?: string
                    description?: string
                    category?: 'cleaning' | 'construction' | 'masonry' | 'painting' | 'industry' | 'event' | 'other'
                    type?: 'standard' | 'renfort_pro' | null
                    client_type?: 'particulier' | 'copropriete_syndic' | 'entreprise_tertiaire' | 'industrie_energie' | 'collectivite_public' | 'association_evenementiel' | 'entreprise_travaux_hauteur' | 'entreprise_btp' | 'agence_interim' | 'autre_pro' | null
                    location_city?: string
                    location_address?: string | null
                    location_department?: string | null
                    height_meters?: number | null
                    budget_min?: number | null
                    budget_max?: number | null
                    deadline?: string | null
                    photos_url?: string[] | null
                    status?: 'pending' | 'live' | 'rejected' | 'completed' | 'cancelled'
                    rejection_reason?: string | null
                    client_contact_info?: Json
                    created_by?: string | null
                    internal_reference?: string | null
                    structure_type?: 'habitat_residentiel' | 'tertiaire_bureaux' | 'industrie_energie' | 'genie_civil_ouvrages' | 'milieu_naturel_parois' | 'evenementiel_spectacle' | null
                    required_level?: string[] | null
                    required_habilitations?: string[] | null
                    secondary_trades?: string[] | null
                    equipment_management?: 'pro_brings_all' | 'agency_provides_all' | 'agency_provides_ropes_pro_brings_personal' | null
                    specific_equipment?: string | null
                    start_date?: string | null
                    duration_days?: number | null
                    work_night_weekend?: boolean | null
                    contract_type?: 'subcontracting' | 'freelance' | null
                    daily_rate?: number | null
                    security_plan_confirmed?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
            }
            credits: {
                Row: {
                    id: string
                    pro_id: string
                    balance: number
                    updated_at: string
                }
                Insert: {
                    id?: string
                    pro_id: string
                    balance?: number
                    updated_at?: string
                }
                Update: {
                    id?: string
                    pro_id?: string
                    balance?: number
                    updated_at?: string
                }
            }
            credit_transactions: {
                Row: {
                    id: string
                    pro_id: string
                    type: 'purchase' | 'spend' | 'refund'
                    amount: number
                    job_id: string | null
                    description: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    pro_id: string
                    type: 'purchase' | 'spend' | 'refund'
                    amount: number
                    job_id?: string | null
                    description?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    pro_id?: string
                    type?: 'purchase' | 'spend' | 'refund'
                    amount?: number
                    job_id?: string | null
                    description?: string | null
                    created_at?: string
                }
            }
            unlocked_leads: {
                Row: {
                    id: string
                    pro_id: string
                    job_id: string
                    unlocked_at: string
                }
                Insert: {
                    id?: string
                    pro_id: string
                    job_id: string
                    unlocked_at?: string
                }
                Update: {
                    id?: string
                    pro_id?: string
                    job_id?: string
                    unlocked_at?: string
                }
            }
            reviews: {
                Row: {
                    id: string
                    job_id: string
                    pro_id: string
                    client_id: string
                    rating: number
                    comment: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    job_id: string
                    pro_id: string
                    client_id: string
                    rating: number
                    comment?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    job_id?: string
                    pro_id?: string
                    client_id?: string
                    rating?: number
                    comment?: string | null
                    created_at?: string
                }
            }
            notifications: {
                Row: {
                    id: string
                    user_id: string
                    type: string
                    title: string
                    message: string
                    link: string | null
                    read: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    type: string
                    title: string
                    message: string
                    link?: string | null
                    read?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    type?: string
                    title?: string
                    message?: string
                    link?: string | null
                    read?: boolean
                    created_at?: string
                }
            }
        }
    }
}
