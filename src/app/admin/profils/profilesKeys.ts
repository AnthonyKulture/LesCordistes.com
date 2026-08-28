/**
 * Clé de cache TanStack partagée entre la liste (client) et les fiches détail (client).
 *
 * Volontairement isolée de `profilesQuery.ts` : ce dernier importe `supabase-server`,
 * qui tire `next/headers`. Un composant 'use client' important la clé depuis
 * `profilesQuery.ts` ferait remonter du code serveur dans le bundle client.
 */
export const USERS_KEY = ['ops', 'users'] as const
