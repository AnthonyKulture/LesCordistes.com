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
  }
];

export const GLOSSARY_CATEGORIES = {
    certification: "Certifications & Normes",
    technique: "Techniques d'Accès Difficile",
    materiel: "Équipements & Sécurité (EPI)",
    reglementation: "Réglementation Officielle"
};
