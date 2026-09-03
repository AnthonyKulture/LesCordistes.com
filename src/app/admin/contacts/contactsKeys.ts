/**
 * Clé de cache TanStack et taille de page de la liste des contacts.
 *
 * Isolée du Server Component pour la même raison que `jobsKeys.ts` : un
 * composant 'use client' qui importerait la clé depuis un module tirant
 * `supabase-server` ferait remonter du code serveur dans le bundle client.
 */
export const CONTACTS_KEY = ['ops', 'contacts'] as const

/**
 * La liste charge un jeu unique et filtre côté client (même parti pris que
 * MissionsList). Le dimensionnement du back-office est d'un opérateur pour
 * ~500 contacts à douze mois : un aller-retour serveur par frappe ou par
 * changement de filtre coûterait plus cher qu'il ne rapporte, et priverait les
 * onglets de leurs compteurs exacts. Les filtres serveur du RPC restent
 * exposés par /api/ops/contacts pour le jour où ce plafond sera atteint.
 */
export const CONTACTS_LIST_LIMIT = 500
