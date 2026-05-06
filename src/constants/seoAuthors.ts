import { SEO_BASE_URL } from './seoConfig'

export interface Author {
    slug: string
    name: string
    givenName: string
    familyName: string
    /** Titre court affiché en byline ("Fondateur", "Conseiller expert métier") */
    role: string
    /** Bio courte pour la page auteur (~80-120 mots, citation-ready LLM) */
    bio: string
    /** Domaines d'expertise pour `knowsAbout` schema Person */
    expertise: string[]
    /** Profil LinkedIn → sameAs */
    linkedin: string
    /** Image avatar publiée dans /public, optionnelle */
    avatar?: string
}

export const AUTHORS: Record<string, Author> = {
    'anthony-profit': {
        slug: 'anthony-profit',
        name: 'Anthony Profit',
        givenName: 'Anthony',
        familyName: 'Profit',
        role: 'Fondateur LesCordistes.com',
        bio: "Anthony Profit est le fondateur et CEO de LesCordistes.com, plateforme française dédiée aux cordistes certifiés. Entrepreneur et développeur full-stack basé à Nice (Alpes-Maritimes), il a fondé la société en 2025 et a repris pleinement la direction du projet en mars 2026 pour refondre la plateforme et structurer le réseau national. Il rédige les guides destinés aux clients particuliers, copropriétés et entreprises qui cherchent à comprendre le marché du travail sur cordes : tarifs, certifications à exiger, contraintes locales par ville et critères de choix d'un professionnel.",
        expertise: [
            'Marketplace BTP',
            'SEO local',
            'Travail sur cordes',
            'CQP cordiste',
            'IRATA',
            'Stratégie produit',
        ],
        linkedin: 'https://www.linkedin.com/in/anthonyprofit/',
    },
    'benjamin-de-oliveira': {
        slug: 'benjamin-de-oliveira',
        name: 'Benjamin De Oliveira',
        givenName: 'Benjamin',
        familyName: 'De Oliveira',
        role: 'Conseiller expert métier — cordiste CQP/IRATA, formateur',
        bio: "Benjamin De Oliveira est cordiste depuis plus de dix ans, titulaire des certifications CQP Cordiste et IRATA, et formateur professionnel reconnu du métier. Il accompagne LesCordistes.com en tant que conseiller expert métier : il valide toutes les décisions produit liées au travail sur cordes et rédige les contenus techniques, réglementaires et carrière à destination des cordistes professionnels et de leurs clients. Sur le terrain, il intervient sur des chantiers de façade, d'industrie, d'élagage en grande hauteur et d'inspection d'ouvrages d'art. Sa double casquette praticien-formateur garantit la justesse technique et réglementaire de chaque article publié.",
        expertise: [
            'Cordiste CQP',
            'IRATA International',
            'Formation travail sur cordes',
            'Sécurité hauteur',
            'Réglementation R.4323-58 Code du travail',
            'Inspection ouvrages d\'art',
            'Élagage grande hauteur',
        ],
        linkedin: 'https://www.linkedin.com/in/benjamin-de-oliveira-62b38695/',
    },
}

export const DEFAULT_AUTHOR_SLUG = 'anthony-profit'

export function getAuthor(slug: string | undefined): Author {
    return AUTHORS[slug ?? DEFAULT_AUTHOR_SLUG] ?? AUTHORS[DEFAULT_AUTHOR_SLUG]!
}

/** @id schema.org Person — pointe vers la page auteur (source de vérité Person) */
export function authorPersonId(author: Author): string {
    return `${SEO_BASE_URL}/auteur/${author.slug}#person`
}

/** URL absolue de la page auteur */
export function authorUrl(author: Author): string {
    return `${SEO_BASE_URL}/auteur/${author.slug}`
}
