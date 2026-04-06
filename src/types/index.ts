export interface Profile {
    id: string;
    email: string;
    role: 'client' | 'pro' | 'admin';
    first_name?: string;
    last_name?: string;
    full_name?: string;
    phone?: string;
    bio?: string;
    certifications?: string[];
    skills?: string[];
    avatar_url?: string;
    client_type?: ClientType;
    // Phase 3 fields
    company_name?: string;
    intervention_zones?: string[];
    equipment?: string[];
    insurance_info?: string;
    portfolio_photos?: string[];
    siret?: string;
    created_at: string;
    updated_at: string;
}
export type ClientType = 
    | 'particulier' 
    | 'copropriete_syndic' 
    | 'entreprise_tertiaire' 
    | 'industrie_energie' 
    | 'collectivite_public' 
    | 'association_evenementiel'
    | 'entreprise_travaux_hauteur'
    | 'entreprise_btp'
    | 'agence_interim'
    | 'autre_pro';

export interface Job {
    id: string;
    title: string;
    slug?: string;
    description: string;
    category: 'cleaning' | 'construction' | 'masonry' | 'painting' | 'industry' | 'event' | 'other';
    type?: 'standard' | 'renfort_pro';
    client_type?: ClientType;
    location_city: string;
    location_address?: string;
    location_department?: string;
    height_meters?: number;
    budget_min?: number;
    budget_max?: number;
    deadline?: string; // ISO date string
    photos_url?: string[];
    status: 'pending' | 'live' | 'rejected' | 'completed' | 'cancelled';
    rejection_reason?: string;
    latitude?: number;
    longitude?: number;
    client_contact_info: {
        first_name: string;
        last_name: string;
        name: string; // full name (first + last), conservé pour la rétro-compatibilité
        email: string;
        phone: string;
        company_name?: string;
    };
    created_by?: string;
    unlocked_leads_count?: number;
    creator?: { role: 'client' | 'pro' | 'admin' };
    credit_cost?: number; // Cost to unlock (default 1)
    // Reinforcement (B2B) specific fields
    internal_reference?: string;
    structure_type?: 'habitat_residentiel' | 'tertiaire_bureaux' | 'industrie_energie' | 'genie_civil_ouvrages' | 'milieu_naturel_parois' | 'evenementiel_spectacle';
    required_level?: string[];
    required_habilitations?: string[];
    secondary_trades?: string[];
    equipment_management?: 'pro_brings_all' | 'agency_provides_all' | 'agency_provides_ropes_pro_brings_personal';
    specific_equipment?: string;
    start_date?: string;
    duration_days?: number;
    work_night_weekend?: boolean;
    contract_type?: 'subcontracting' | 'freelance';
    daily_rate?: number;
    security_plan_confirmed?: boolean;
    created_at: string;
    updated_at: string;
}

export interface JobFormData {
    location_city: string;
    location_address?: string;
    location_department?: string;
    category: Job['category'];
    type?: Job['type'];
    client_type?: ClientType;
    title: string;
    description: string;
    height_meters?: number;
    budget_min?: number;
    budget_max?: number;
    deadline?: string;
    photos?: File[];
    latitude?: number;
    longitude?: number;
    contact_first_name: string;
    contact_last_name: string;
    contact_company_name?: string;
    is_auto_entrepreneur?: boolean;
    contact_email: string;
    contact_phone: string;
    credit_cost?: number;
    // B2B Reinforcement
    internal_reference?: string;
    structure_type?: Job['structure_type'];
    required_level?: string[];
    required_habilitations?: string[];
    secondary_trades?: string[];
    equipment_management?: Job['equipment_management'];
    specific_equipment?: string;
    start_date?: string;
    duration_days?: number;
    work_night_weekend?: boolean;
    contract_type?: Job['contract_type'];
    daily_rate?: number;
    security_plan_confirmed?: boolean;
    consent_sharing: boolean;
}

// Credit system types (Phase 4)
export interface CreditTransaction {
    id: string;
    pro_id: string;
    type: 'purchase' | 'spend' | 'refund';
    amount: number;
    job_id?: string;
    description?: string;
    created_at: string;
}

export interface UnlockedLead {
    id: string;
    pro_id: string;
    job_id: string;
    unlocked_at: string;
}

// Review types (Phase 8)
export interface Review {
    id: string;
    job_id: string;
    pro_id: string;
    client_id: string;
    rating: number;
    comment?: string;
    created_at: string;
}

export type JobCategory = Job['category'];
export type JobStatus = Job['status'];
export type UserRole = Profile['role'];
