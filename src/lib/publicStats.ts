/**
 * publicStats — compteurs publics lus en base, pour le site vitrine.
 *
 * POURQUOI. Les pages publiques affichaient des chiffres écrits en dur
 * (« des dizaines d'offres chaque mois », « 50 cordistes », « des milliers de
 * professionnels ») qu'aucune requête ne validait. Un visiteur qui arrive sur un
 * tableau presque vide constate l'écart : l'argument gonflé se retourne contre le
 * site. On garde l'argument commercial, on le rend vérifiable.
 *
 * GARDE-FOU. Un chiffre réel trop petit dessert autant qu'un chiffre inventé.
 * Chaque compteur a un plancher (`MIN_*_TO_SHOW`) sous lequel les composants
 * doivent basculer sur une formulation SANS chiffre, toujours vraie. Les helpers
 * `showable*` centralisent cet arbitrage : aucun composant ne compare de seuil
 * lui-même.
 *
 * CONFIDENTIALITÉ. Cette fonction ne renvoie que des agrégats. Aucune donnée
 * personnelle (email, nom, coordonnées) ne sort d'ici.
 *
 * ⚠️ Import serveur uniquement — utilise la clé de service.
 */

import { unstable_cache } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { FRENCH_DEPARTMENTS } from '@/constants/departments'

export type PublicStats = {
    missionsLive: number
    missionsCompleted: number
    prosTotal: number
    departmentsCovered: number
}

/** Sous 10 missions ouvertes, le chiffre démoralise plus qu'il ne vend. */
export const MIN_MISSIONS_TO_SHOW = 10

/** Sous 20 pros, « X cordistes certifiés » sonne comme un site vide. */
export const MIN_PROS_TO_SHOW = 20

/** Sous 10 départements, « couverture nationale » n'est plus tenable. */
export const MIN_DEPARTMENTS_TO_SHOW = 10

const CACHE_SECONDS = 3600

/**
 * `FRENCH_DEPARTMENTS` embarque Monaco ('98') pour le confort du sélecteur de
 * zones : ce n'est pas un département français. Sans ce retrait le compteur
 * affichait 102, soit un de plus que les 101 départements existants — un chiffre
 * juste au sens de la base, mais qui se lit comme une erreur.
 */
const NON_DEPARTMENT_CODES = new Set(['98'])

const KNOWN_DEPARTMENT_CODES = new Set(
    FRENCH_DEPARTMENTS.map(d => d.code).filter(code => !NON_DEPARTMENT_CODES.has(code))
)

async function loadPublicStats(): Promise<PublicStats> {
    const admin = createSupabaseAdminClient()

    const [live, completed, pros, zones] = await Promise.all([
        admin.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'live'),
        admin.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
        admin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'pro'),
        admin.from('profiles').select('intervention_zones').eq('role', 'pro'),
    ])

    const failure = live.error ?? completed.error ?? pros.error ?? zones.error
    if (failure) throw new Error(failure.message)

    // `intervention_zones` stocke des codes département ('06', '2A', '971') —
    // cf. ZoneManagement.tsx. Le dédoublonnage se fait ici plutôt qu'en SQL pour
    // éviter une vue dédiée : le volume de pros se compte en dizaines.
    // Le type `Database` écrit à la main ne porte pas la clé `Relationships`
    // attendue par supabase-js : l'inférence des lignes retombe sur `never`.
    // Même contournement que `sitemap.ts`.
    const zoneRows = (zones.data ?? []) as unknown as Array<{ intervention_zones: string[] | null }>

    const departments = new Set<string>()
    for (const row of zoneRows) {
        for (const zone of row.intervention_zones ?? []) {
            const code = zone.trim()
            if (KNOWN_DEPARTMENT_CODES.has(code)) departments.add(code)
        }
    }

    return {
        missionsLive: live.count ?? 0,
        missionsCompleted: completed.count ?? 0,
        prosTotal: pros.count ?? 0,
        departmentsCovered: departments.size,
    }
}

export async function fetchPublicStats(): Promise<PublicStats | null> {
    const cached = unstable_cache(loadPublicStats, ['public-stats'], { revalidate: CACHE_SECONDS })
    try {
        return await cached()
    } catch (e) {
        console.warn('[public-stats] lecture Supabase en échec :', e instanceof Error ? e.message : String(e))
        return null
    }
}

/** Nombre de missions ouvertes, ou `null` si l'afficher dessert le site. */
export function showableMissions(stats: PublicStats | null | undefined): number | null {
    return stats && stats.missionsLive >= MIN_MISSIONS_TO_SHOW ? stats.missionsLive : null
}

/** Nombre de cordistes inscrits, ou `null` si l'afficher dessert le site. */
export function showablePros(stats: PublicStats | null | undefined): number | null {
    return stats && stats.prosTotal >= MIN_PROS_TO_SHOW ? stats.prosTotal : null
}

/** Nombre de départements couverts, ou `null` si l'afficher dessert le site. */
export function showableDepartments(stats: PublicStats | null | undefined): number | null {
    return stats && stats.departmentsCovered >= MIN_DEPARTMENTS_TO_SHOW ? stats.departmentsCovered : null
}
