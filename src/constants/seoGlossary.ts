export interface GlossaryTerm {
  slug: string;
  title: string;
  definition: string;
  category: 'certification' | 'materiel' | 'technique' | 'reglementation';
  content: string;
}

export const SEO_GLOSSARY: GlossaryTerm[] = [
  {
    slug: 'cqp-cordiste',
    title: 'CQP Cordiste (Certificat de Qualification Professionnelle)',
    definition: 'Certification nationale obligatoire en France attestant de la capacité à réaliser des travaux sur cordes.',
    category: 'certification',
    content: 'Le CQP Cordiste est le premier niveau de qualification reconnu par le SFETH et l\'État français. Il garantit que le technicien maîtrise parfaitement les techniques de progression sur cordes (ascension, descente, fractionnement), les procédures de sauvetage sur corde (décrochage d\'une victime), et l\'utilisation sécurisée des Équipements de Protection Individuelle (EPI). Ce diplôme est indispensable pour opérer légalement sur le territoire national.'
  },
  {
    slug: 'irata',
    title: 'IRATA (Industrial Rope Access Trade Association)',
    definition: 'Certification internationale reconnue mondialement d\'accès sur cordes, particulièrement prisée dans l\'industrie lourde et l\'offshore.',
    category: 'certification',
    content: 'Créée initialement au Royaume-Uni pour l\'industrie pétrolière offshore, la certification IRATA est la norme d\'excellence internationale. Elle comporte 3 niveaux distincts. Un cordiste certifié IRATA Level 3 (Superviseur) est formé à la gestion complète et à la conception d\'un chantier complexe sur cordes, à l\'audit des risques et au sauvetage médicalisé avancé en milieu périlleux.'
  },
  {
    slug: 'epreuve-arrachement',
    title: 'Épreuve d\'Arrachement (Tests d\'Ancrages)',
    definition: 'Test de traction réglementaire effectué sur les points d\'ancrage structurels à l\'aide d\'un extractomètre pour valider leur résistance avant toute intervention.',
    category: 'technique',
    content: 'Avant toute descente, le cordiste doit sécuriser son équipement (composé d\'une corde de travail et d\'une corde de sécurité) sur des amarrages vérifiés. L\'épreuve d\'arrachement sert à tester un ancrage (qu\'il soit chimique ou mécanique) avec un dynamomètre. L\'objectif est de s\'assurer que le point de fixation fixé dans le béton ou la pierre résiste à la charge minimale en DaN imposée par les réglementations de travail en hauteur. Aucun travail ne débute si l\'ancrage cède ou montre des signes de faiblesse.'
  },
  {
    slug: 'sfeth',
    title: 'SFETH (Syndicat Français des Entreprises de Travail en Hauteur)',
    definition: 'Organisation syndicale nationale et chambre professionnelle définissant les règles et les bonnes pratiques du secteur de l\'accès difficile en France.',
    category: 'reglementation',
    content: 'Le SFETH agit auprès des pouvoirs publics (Ministère du Travail, CARSAT, OPPBTP) pour encadrer la profession de cordiste. Il supervise le contenu des examens du CQP et rédige scrupuleusement les "recommandations de sécurité" appliquées sur le terrain par nos professionnels, afin de garantir le zéro accident sur les chantiers français.'
  },
  {
    slug: 'ligne-de-vie',
    title: 'Ligne de Vie (horizontale ou verticale)',
    definition: 'Dispositif d\'ancrage continu (câble ou rail) permettant à un opérateur de se déplacer en hauteur sans jamais se détacher de sa sécurité.',
    category: 'materiel',
    content: 'La ligne de vie est le dispositif anti-chute par excellence sur les toitures ou les corniches. Elle permet aux cordistes (ou même à des ouvriers classiques) de progresser en toute sécurité. Les techniciens cordistes sont souvent sollicités pour réaliser l\'installation, le carottage et la maintenance annuelle de ces systèmes de sécurité primordiaux pour les immeubles et bâtiments industriels.'
  },
  {
    slug: 'ravalement-facade',
    title: 'Ravalement de Façade',
    definition: 'Ensemble des travaux de rénovation et de protection d\'une façade : nettoyage, réparations, traitement et application d\'un nouveau revêtement.',
    category: 'technique',
    content: 'Le ravalement de façade est une obligation légale en France tous les 10 ans pour les copropriétés (article L132-1 du Code de la construction). Il comprend le nettoyage des salissures, le traitement des fissures et des joints dégradés, l\'application d\'un enduit ou d\'une peinture de protection. L\'accès sur cordes permet de réaliser ces travaux sur des immeubles de grande hauteur à un coût bien inférieur à l\'échafaudage traditionnel : économies de 30 à 50% sur le poste "installation de chantier".'
  },
  {
    slug: 'demossage-toiture',
    title: 'Démoussage de Toiture',
    definition: 'Traitement visant à éliminer les mousses, lichens et algues qui colonisent les toitures, suivi d\'un traitement hydrofuge préventif.',
    category: 'technique',
    content: 'Les mousses et lichens dégradent progressivement les matériaux de couverture (tuiles, ardoises, zinc) en retenant l\'humidité et en favorisant le gel. Le processus se déroule en 3 étapes : brossage mécanique ou nettoyage haute pression à froid, application d\'un biocide (traitement antimousse), puis application d\'un hydrofuge de surface pour prévenir la repousse pendant 3 à 5 ans. Les techniciens en accès difficile réalisent ces interventions sur des toitures à forte pente ou des hauteurs rendant l\'échafaudage prohibitif.'
  },
  {
    slug: 'travaux-sans-echafaudage',
    title: 'Travaux en Hauteur Sans Échafaudage',
    definition: 'Techniques d\'intervention permettant de travailler en hauteur en utilisant des cordes de sécurité ou des nacelles légères, sans monter de structure d\'échafaudage.',
    category: 'technique',
    content: 'L\'accès sur cordes est la principale alternative à l\'échafaudage pour les travaux en hauteur. Ses avantages sont nombreux : déploiement en quelques heures (vs 2 à 5 jours pour un échafaudage), coût 2 à 4 fois inférieur pour les petites surfaces, absence d\'emprise au sol (pas d\'arrêté de voirie nécessaire), et accessibilité à des zones impossibles à atteindre par échafaudage (coupoles, toitures à forte pente, parois verticales). La réglementation française (Code du travail, R4323-58 à R4323-106) encadre strictement ces pratiques.'
  },
  {
    slug: 'ite-isolation-thermique-exterieure',
    title: 'ITE — Isolation Thermique par l\'Extérieur',
    definition: 'Procédé d\'isolation consistant à appliquer un matériau isolant sur la façade extérieure d\'un bâtiment, recouvert d\'un enduit de protection.',
    category: 'technique',
    content: 'L\'ITE est aujourd\'hui la solution de rénovation énergétique la plus efficace pour les bâtiments existants car elle supprime les ponts thermiques. Elle comprend la pose de panneaux isolants (polystyrène, laine de roche ou fibre de bois) directement sur la façade, puis l\'application d\'un système d\'enduit armé. Pour les bâtiments de grande hauteur, les techniciens cordistes représentent une alternative économique à l\'échafaudage : le coût d\'installation de chantier peut être réduit de 40%, ce qui rend le projet globalement plus rentable dans le cadre des aides MaPrimeRénov\' et CEE.'
  },
  {
    slug: 'couvreur-zingueur',
    title: 'Couvreur-Zingueur',
    definition: 'Artisan spécialisé dans la pose, la réparation et l\'entretien des toitures et des éléments en zinc (chéneaux, gouttières, solins, raccords).',
    category: 'technique',
    content: 'Le couvreur-zingueur maîtrise deux corps de métier complémentaires : la couverture (tuiles, ardoises, bac acier, zinc à joints debout) et la zinguerie (évacuation des eaux pluviales, étanchéité des raccords). Pour les bâtiments dont la toiture est difficile d\'accès (faible pente, très haute, position urbaine dense), l\'association cordiste + couvreur est la solution optimale : le cordiste assure la sécurisation et l\'accès, le couvreur-zingueur réalise le travail technique. Cette complémentarité est de plus en plus formalisée sur les chantiers urbains.'
  },
  {
    slug: 'gouttiere-cheneaux',
    title: 'Gouttières et Chéneaux',
    definition: 'Systèmes de collecte et d\'évacuation des eaux de pluie installés en périphérie des toitures.',
    category: 'materiel',
    content: 'Les gouttières (fixées en façade) et les chéneaux (intégrés à la toiture) constituent le réseau d\'évacuation des eaux pluviales. Leur entretien régulier (nettoyage des feuilles, réparation des fissures, remplacement des fixations) est essentiel pour protéger les façades et les fondations du bâtiment. Leur remplacement ou réparation sur des immeubles en hauteur est typiquement réalisé par des cordistes ou des couvreurs équipés de cordes de sécurité, évitant l\'installation d\'un échafaudage complet pour des interventions ponctuelles.'
  },
  {
    slug: 'ppsps',
    title: 'PPSPS — Plan Particulier de Sécurité et de Protection de la Santé',
    definition: 'Document obligatoire rédigé par chaque entreprise intervenante sur un chantier de BTP, décrivant les mesures de prévention contre les risques spécifiques.',
    category: 'reglementation',
    content: 'Le PPSPS est obligatoire dès lors qu\'un chantier dépasse certains seuils (plus de 20 travailleurs simultanément ou plus de 500 hommes-jours). Il est rédigé à partir du Plan Général de Coordination (PGC) établi par le coordonnateur SPS. Pour les entreprises de travail sur cordes, le PPSPS doit détailler : les analyses de risques spécifiques à la technique cordiste, les procédures d\'ancrage et de vérification du matériel, les plans d\'évacuation et de sauvetage en hauteur, et les qualifications des opérateurs (CQP, IRATA). Sa rédaction rigoureuse est un gage de professionnalisme auprès des donneurs d\'ordre.'
  },
  {
    slug: 'acces-difficile',
    title: 'Accès Difficile (ou Accès Spéciaux)',
    definition: 'Terme désignant les zones d\'un bâtiment ou d\'une infrastructure où l\'accès est impossible ou dangereux par les méthodes traditionnelles (échelles, échafaudages).',
    category: 'technique',
    content: 'Un "accès difficile" peut être une façade d\'immeuble de grande hauteur en zone urbaine dense (pas d\'espace pour un échafaudage), une toiture à très forte pente, une structure industrielle suspendue, un ouvrage d\'art ou une paroi rocheuse. La résolution de ces problèmes d\'accès fait appel à trois techniques principales : l\'accès sur cordes (technique cordiste), les plateformes élévatrices (nacelles, PEMP) et les drones pour les inspections visuelles. Le choix de la technique dépend de la durée d\'intervention, du type de travaux à réaliser et des contraintes du site.'
  }
];

export const GLOSSARY_CATEGORIES = {
    certification: "Certifications & Normes",
    technique: "Techniques d'Accès Difficile",
    materiel: "Équipements & Sécurité (EPI)",
    reglementation: "Réglementation Officielle"
};
