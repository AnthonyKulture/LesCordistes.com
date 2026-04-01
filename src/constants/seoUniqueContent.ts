export interface UniqueLocalContent {
    slug: string;
    hubTitle: string;
    paragraph1: string;
    paragraph2: string;
}

export const SEO_EDITORIAL_DB: Record<string, UniqueLocalContent> = {
    'monaco': {
        slug: 'monaco',
        hubTitle: "Discrétion et sécurité absolue : L'accès sur cordes en Principauté",
        paragraph1: "La Principauté de Monaco possède l'une des plus fortes densités d'Immeubles de Grande Hauteur (IGH) et d'infrastructures de luxe au monde. L'utilisation d'échafaudages ou de nacelles y est souvent proscrite pour des raisons esthétiques, de sécurité touristique et d'encombrement des voies.",
        paragraph2: "Nos cordistes hautement certifiés interviennent avec une discrétion totale sur les façades des palaces, les navires de luxe au port Hercule, ou pour la maintenance structurelle des tours résidentielles, tout en respectant les normes souveraines rigoureuses."
    },
    'paris': {
        slug: 'paris',
        hubTitle: "Excellence sur nacelle impossible : au cœur de l'Île-de-France",
        paragraph1: "Dans une capitale où la densité urbaine et la préservation de l'architecture historique (comme la pierre de taille haussmannienne) rendent l'installation d'échafaudages extrêmement coûteuse et bloquante, le recours aux cordistes parisiens est une nécessité stratégique.",
        paragraph2: "Que ce soit pour les atriums vitrés de La Défense ou la réfection de toitures en zinc dans le Marais, nos équipes interviennent avec discrétion et rapidité, sans empiéter sur l'espace public ni nécessiter de lourdes démarches administratives."
    },
    'marseille': {
        slug: 'marseille',
        hubTitle: "Défis méditerranéens et zones industrialo-portuaires",
        paragraph1: "Le climat méditerranéen exigeant, soumis au mistral et aux embruns salins, accélère la dégradation des façades et infrastructures de la cité phocéenne. L'accès sur cordes permet une intervention immédiate pour purger ou sécuriser ces structures fragiles.",
        paragraph2: "Du grand port maritime de Marseille aux calanques inaccessibles, nos techniciens certifiés répondent aux exigences des chantiers navals, des silos céréaliers et des rénovations de copropriétés avec un niveau de sécurité optimal."
    },
    'lyon': {
        slug: 'lyon',
        hubTitle: "Pôle industriel dynamique et patrimoine rhodanien",
        paragraph1: "La configuration singulière de Lyon, entre ses collines (Fourvière, Croix-Rousse) et son tissu urbain hyper-dense, favorise l'expertise des travaux en hauteur. Les ruelles étroites empêchent fréquemment l'utilisation de nacellesélévatrices.",
        paragraph2: "De la vallée de la chimie aux tours tertiaires de la Part-Dieu, notre réseau de cordistes lyonnais maîtrise l'ensemble des normes industrielles (CND, risques chimiques) et des contraintes de rénovation du patrimoine protégé de la Presqu'île."
    },
    'bordeaux': {
        slug: 'bordeaux',
        hubTitle: "Restauration Gironde : Pierre de taille et cuveries",
        paragraph1: "Renommée pour ses façades blondes en pierre de taille, Bordeaux impose des interventions de nettoyage et de démoussage méticuleuses. Le travail sur corde permet une action non-destructive idéale pour sauvegarder ce patrimoine UNESCO.",
        paragraph2: "Nos cordistes girondins opèrent également dans le milieu viticole environnant et le secteur maritime, assurant la maintenance sans perturber l'activité économique vitale de la région Nouvelle-Aquitaine."
    },
    'toulouse': {
        slug: 'toulouse',
        hubTitle: "L'aéronautique et la brique rose occitane",
        paragraph1: "Dans la Ville Rose, la préservation des façades en briques foraines et des monuments historiques nécessite le savoir-faire précis de maçons-cordistes qualifiés, évitant l'encombrement logistique dans le centre-ville historique.",
        paragraph2: "Parallèlement, l'industrie aéronautique toulousaine sollicite continuellement nos techniciens pour des inspections (CND) ou de la petite maintenance sur des infrastructures colossales impossibles à échafauder."
    },
    // Déploiement générique enrichi pour les autres villes afin d'assurer les 30% uniques
    'default': {
        slug: 'default',
        hubTitle: "Technicité et flexibilité sur votre agglomération",
        paragraph1: "Les contraintes topographiques et administratives de votre métropole font de l'intervention sur cordes la solution la plus économique et la plus sécurisée. Elle s'affranchit des demandes d'autorisation de voirie (AOT) particulièrement longues.",
        paragraph2: "Forts d'une certification CQP ou IRATA, les techniciens que nous sélectionnons localement assurent un travail de précision, du nettoyage de vitres difficiles d'accès jusqu'à la sécurisation d'ouvrages maçonnés ou industriels."
    }
};

export function getEditorialContent(citySlug: string): UniqueLocalContent {
    return SEO_EDITORIAL_DB[citySlug] || {
        ...SEO_EDITORIAL_DB['default'],
        slug: citySlug
    };
}
