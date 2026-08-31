import type { Profile } from '@/types'

/**
 * Un profil pro n'est indexable que s'il porte un contenu RÉDIGÉ.
 *
 * Même doctrine que `hasUniqueServiceCityContext` pour les pages ville × service
 * (cf. CLAUDE.md, « Stratégie anti-doorway ») : la page est TOUJOURS générée et
 * accessible, mais seules celles qui apportent quelque chose entrent dans l'index.
 *
 * POURQUOI UNE BIO OBLIGATOIRE, et pas un simple décompte de champs remplis.
 * Un premier seuil « 3 sections sur 5 » avait été retenu ; mesuré sur la base, il
 * laissait passer 47 profils sur 59, dont 9 SANS AUCUNE BIO et 6 avec moins de
 * 50 caractères. Le wizard d'inscription remplit mécaniquement certifications et
 * zones d'intervention : compter des champs mesure le parcours d'inscription, pas
 * l'effort de présentation. Le gate excluait les profils vides, pas les creux.
 * La bio est le seul champ que personne ne remplit par accident.
 *
 * Périmètre obtenu : 26 profils sur 59 (44 %), tous porteurs d'un texte réel.
 *
 * Le critère est auto-régulé : un cordiste qui rédige sa présentation rend sa
 * page indexable, sans intervention.
 */

/** ~25 mots : en dessous, ce n'est pas une présentation, c'est une mention. */
const MIN_BIO_LENGTH = 150

/** Sections structurées attendues EN PLUS de la bio. */
const MIN_STRUCTURED_SECTIONS = 2

export function isProfileIndexable(profile: Profile | null | undefined): boolean {
    if (!profile) return false
    if (profile.role !== 'pro') return false
    if (!profile.full_name?.trim()) return false

    // Opt-out explicite du professionnel : prioritaire sur tout le reste.
    // `null`/`undefined` = jamais exprimé → on retombe sur les critères de contenu.
    if (profile.seo_indexable === false) return false

    // Condition dure : sans texte rédigé, pas d'indexation.
    if ((profile.bio?.trim().length ?? 0) < MIN_BIO_LENGTH) return false

    const structured = [
        Boolean(profile.skills?.length),
        Boolean(profile.certifications?.length),
        Boolean(profile.intervention_zones?.length),
        Boolean(profile.portfolio_photos?.length),
    ].filter(Boolean).length

    return structured >= MIN_STRUCTURED_SECTIONS
}
