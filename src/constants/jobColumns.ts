/**
 * Colonnes de `jobs` lisibles par les rôles anon/authenticated.
 *
 * `client_contact_info` et `admin_notes` en sont volontairement absents :
 * le SELECT sur ces colonnes est révoqué au niveau SQL pour anon/authenticated
 * (migration 20260828-revoke-client-contact-info.sql). Les coordonnées client
 * s'obtiennent uniquement via le RPC `get_job_contact(job_id)`, qui vérifie
 * propriétaire / admin / lead débloqué.
 *
 * Tout `select('*')` sur `jobs` depuis le navigateur ou un client serveur
 * porteur de la session utilisateur échouera : utiliser ces constantes.
 */
export const JOB_PUBLIC_COLUMNS = [
    'id',
    'slug',
    'title',
    'description',
    'category',
    'type',
    'client_type',
    'location_city',
    'location_address',
    'location_department',
    'height_meters',
    'budget_min',
    'budget_max',
    'deadline',
    'photos_url',
    'status',
    'rejection_reason',
    'latitude',
    'longitude',
    'created_by',
    'admin_created',
    'internal_reference',
    'structure_type',
    'required_level',
    'required_habilitations',
    'secondary_trades',
    'equipment_management',
    'specific_equipment',
    'start_date',
    'duration_days',
    'work_night_weekend',
    'contract_type',
    'daily_rate',
    'security_plan_confirmed',
    'moderated_at',
    'moderated_by',
    'credit_cost',
    'revalidation_email_sent_at',
    'last_validated_at',
    'expired_at',
    'created_at',
    'updated_at',
    'client_has_company',
].join(', ')

/**
 * Colonnes de `profiles` sérialisables dans du HTML PUBLIC (payload RSC d'une
 * page rendue côté serveur pour un visiteur anonyme).
 *
 * `email`, `phone`, `siret`, `insurance_info` et `welcome_email_sent_at` en sont
 * exclus : l'UI de /pros/[id] les réserve déjà aux utilisateurs connectés
 * (PublicProfile.tsx), les inclure dans le rendu serveur les exposerait à tous
 * dans le source de la page.
 *
 * La requête CLIENT (porteuse de la session) peut, elle, demander plus.
 */
export const PROFILE_PUBLIC_COLUMNS = [
    'id',
    'role',
    'full_name',
    'first_name',
    'last_name',
    'company_name',
    'bio',
    'avatar_url',
    'skills',
    'certifications',
    'equipment',
    'intervention_zones',
    'portfolio_photos',
    'client_type',
    'latitude',
    'longitude',
    'created_at',
    'updated_at',
    'seo_indexable',
].join(', ')

/**
 * Sous-ensemble pour les listings (cartes) : pas de champs B2B détaillés ni de
 * métadonnées de modération. Réduit nettement le payload sur /jobs.
 */
export const JOB_CARD_COLUMNS = [
    'id',
    'slug',
    'title',
    'description',
    'category',
    'type',
    'client_type',
    'location_city',
    'location_department',
    'height_meters',
    'budget_min',
    'budget_max',
    'deadline',
    'photos_url',
    'status',
    'latitude',
    'longitude',
    'created_by',
    'admin_created',
    'credit_cost',
    'daily_rate',
    'start_date',
    'duration_days',
    'contract_type',
    'secondary_trades',
    'created_at',
    'expired_at',
    // Lues par getLeadQuality() : sans elles le badge qualité d'une carte serait
    // inférieur à celui de la fiche détail de la même mission.
    'location_address',
    'required_level',
    'required_habilitations',
    'last_validated_at',
    'client_has_company',
].join(', ')
