/**
 * Clé de cache TanStack partagée entre la liste (client) et les fiches détail (client).
 *
 * Volontairement isolée de `jobsQuery.ts` : ce dernier importe `supabase-server`,
 * qui tire `next/headers`. Un composant 'use client' important la clé depuis
 * `jobsQuery.ts` ferait remonter du code serveur dans le bundle client.
 */
export const JOBS_KEY = ['ops', 'jobs'] as const
