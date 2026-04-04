export interface CitySEOData {
  name: string;
  slug: string;
  lat: number;
  lng: number;
  region: string;
  department?: string;
  country?: string;
  contextualIntro?: string; // 30% unique content starter
}

export const PRIORITY_CITIES: CitySEOData[] = [
  { name: 'Monaco', slug: 'monaco', lat: 43.7384, lng: 7.4246, region: 'Principauté de Monaco', department: 'MC', country: 'MC' },
  { name: 'Paris', slug: 'paris', lat: 48.8566, lng: 2.3522, region: 'Île-de-France', department: '75', contextualIntro: "haute densité urbaine et la préservation architecturale des bâtiments historiques" },
  { name: 'Marseille', slug: 'marseille', lat: 43.2965, lng: 5.3698, region: 'Provence-Alpes-Côte d\'Azur', department: '13', contextualIntro: "climat méditerranéen exigeant et les infrastructures industrialo-portuaires" },
  { name: 'Lyon', slug: 'lyon', lat: 45.7640, lng: 4.8357, region: 'Auvergne-Rhône-Alpes', department: '69', contextualIntro: "fort tissu industriel et un patrimoine urbain riche nécessitant des accès difficiles" },
  { name: 'Toulouse', slug: 'toulouse', lat: 43.6047, lng: 1.4442, region: 'Occitanie', department: '31', contextualIntro: "bâtiments en briques cuites et les infrastructures aéronautiques imposantes" },
  { name: 'Lille', slug: 'lille', lat: 50.6292, lng: 3.0573, region: 'Hauts-de-France', department: '59', contextualIntro: "tissu urbain dense du Nord et les rénovations de bâtiments industriels reconvertis" },
  { name: 'Bordeaux', slug: 'bordeaux', lat: 44.8378, lng: -0.5792, region: 'Nouvelle-Aquitaine', department: '33', contextualIntro: "façades en pierre de taille emblématiques et son pôle viticole et portuaire" },
  { name: 'Nantes', slug: 'nantes', lat: 47.2184, lng: -1.5536, region: 'Pays de la Loire', department: '44', contextualIntro: "infrastructures navales et le développement massif d'éco-quartiers modernes" },
  { name: 'Nice', slug: 'nice', lat: 43.7102, lng: 7.2620, region: 'Provence-Alpes-Côte d\'Azur', department: '06', contextualIntro: "reliefs escarpés environnants et l'entretien hôtelier sur le front de mer" },
  { name: 'Strasbourg', slug: 'strasbourg', lat: 48.5734, lng: 7.7521, region: 'Grand Est', department: '67', contextualIntro: "façades traditionnelles alsaciennes et les infrastructures institutionnelles européennes" },
  { name: 'Rennes', slug: 'rennes', lat: 48.1173, lng: -1.6778, region: 'Bretagne', department: '35', contextualIntro: "rénovation de bâtiments historiques en pans de bois et les nouvelles tours résidentielles" },
  { name: 'Grenoble', slug: 'grenoble', lat: 45.1885, lng: 5.7245, region: 'Auvergne-Rhône-Alpes', department: '38', contextualIntro: "environnement montagnard imposant la sécurisation de falaises et d'ouvrages alpins" },
  { name: 'Rouen', slug: 'rouen', lat: 49.4432, lng: 1.0999, region: 'Normandie', department: '76', contextualIntro: "présence d'imposants clochers historiques et le vaste réseau industrialo-portuaire de l'axe Seine" },
  { name: 'Toulon', slug: 'toulon', lat: 43.1242, lng: 5.9280, region: 'Provence-Alpes-Côte d\'Azur', department: '83', contextualIntro: "structures navales majeures et l'entretien de façades face aux embruns marins" },
  { name: 'Montpellier', slug: 'montpellier', lat: 43.6108, lng: 3.8767, region: 'Occitanie', department: '34', contextualIntro: "croissance architecturale ultra-moderne et l'entretien d'infrastructures événementielles atypiques" },
  { name: 'Metz', slug: 'metz', lat: 49.1193, lng: 6.1727, region: 'Grand Est', department: '57', contextualIntro: "patrimoine en pierre de Jaumont et les infrastructures industrielles lorraines" },
  { name: 'Nancy', slug: 'nancy', lat: 48.6921, lng: 6.1844, region: 'Grand Est', department: '54', contextualIntro: "architecture Art Nouveau et l'entretien de cheminées d'usines et d'infrastructures d'ingénierie" },
  { name: 'Orléans', slug: 'orleans', lat: 47.9029, lng: 1.9093, region: 'Centre-Val de Loire', department: '45', contextualIntro: "sites de la cosmétique, pharmaceutique et la préservation des toitures historiques ligériennes" },
  { name: 'Saint-Étienne', slug: 'saint-etienne', lat: 45.4397, lng: 4.3872, region: 'Auvergne-Rhône-Alpes', department: '42', contextualIntro: "héritage minier et les nouvelles constructions urbaines sur des reliefs vallonnés" },
  { name: 'Tours', slug: 'tours', lat: 47.3941, lng: 0.6848, region: 'Centre-Val de Loire', department: '37', contextualIntro: "toitures en ardoise caractéristiques et la pérennisation des ouvrages d'art surplombant la Loire" },
  { name: 'Brest', slug: 'brest', lat: 48.3904, lng: -4.4861, region: 'Bretagne', department: '29', contextualIntro: "infrastructures militaires, navales et l'entretien drastique de façades face au climat océanique rude" },
  { name: 'Clermont-Ferrand', slug: 'clermont-ferrand', lat: 45.7772, lng: 3.0870, region: 'Auvergne-Rhône-Alpes', department: '63', contextualIntro: "pierre de Volvic emblématique et la maintenance industrielle liée au bassin manufacturier massif" },
  { name: 'Dijon', slug: 'dijon', lat: 47.3220, lng: 5.0415, region: 'Bourgogne-Franche-Comté', department: '21', contextualIntro: "toits aux tuiles vernissées et les nécessités de maintenance du tissu agroalimentaire local" },
];

export interface SEOServiceCluster {
  id: string;
  slug: string;
  name: string;
  cluster: 'urbain' | 'industriel' | 'genie_civil' | 'grand_public';
  description: string;
  keywords: string[];
  metaTitle?: string;
  metaDesc?: string;
  h1Template?: string;
  introTemplate?: string;
}

export const SEO_SERVICES: SEOServiceCluster[] = [
  // Urbain
  {
    id: 'nettoyage-facade',
    slug: 'nettoyage-facade',
    name: 'Nettoyage de façades',
    cluster: 'urbain',
    description: 'Démoussage, dépollution et lavage haute-pression de façades inaccessibles.',
    keywords: ['nettoyage façade', 'démoussage', 'dépollution', 'lavage haute pression', 'façadier cordiste']
  },
  {
    id: 'lavage-vitres',
    slug: 'lavage-vitres',
    name: 'Lavage de vitres',
    cluster: 'urbain',
    description: 'Entretien des verrières, atriums et façades vitrées de grande hauteur.',
    keywords: ['laveur de vitre cordiste', 'verrières', 'atriums', 'nettoyage vitrerie hauteur']
  },
  {
    id: 'toiture-zinguerie',
    slug: 'toiture-zinguerie',
    name: 'Toiture et Zinguerie',
    cluster: 'urbain',
    description: 'Réparation de chéneaux, remplacement de tuiles et ardoises sur toitures difficiles d\'accès.',
    keywords: ['couvreur cordiste', 'zinguerie', 'réparation chéneaux', 'fuite toiture']
  },
  {
    id: 'securisation-anti-pigeons',
    slug: 'securisation-anti-pigeons',
    name: 'Sécurisation et filets anti-pigeons',
    cluster: 'urbain',
    description: 'Pose de pics anti-volatiles, filets de sécurité et lignes de vie sur les bâtiments.',
    keywords: ['dépigeonnage', 'filet anti-pigeon', 'pose ligne de vie', 'purge façade', 'mise en sécurité']
  },

  // Industriel
  {
    id: 'maintenance-eolienne',
    slug: 'maintenance-eolienne',
    name: 'Maintenance éolienne',
    cluster: 'industriel',
    description: 'Inspection, contrôle et réparation sur pales et mâts d\'éoliennes onshore/offshore.',
    keywords: ['cordiste éolien', 'inspection pales', 'réparation fibre', 'offshore', 'onshore']
  },
  {
    id: 'pylones-telecom',
    slug: 'pylones-telecom',
    name: 'Pylônes et Télécom',
    cluster: 'industriel',
    description: 'Installation et maintenance d\'antennes sur pylônes haute tension et télécoms.',
    keywords: ['monteur pylône', 'maintenance télécom', 'antenne GSM', 'haute tension']
  },
  {
    id: 'cnd-controle-non-destructif',
    slug: 'cnd-controle-non-destructif',
    name: 'Contrôles Non Destructifs (CND)',
    cluster: 'industriel',
    description: 'Inspections UT, MT, PT et VT sur structures industrielles inaccessibles.',
    keywords: ['CND', 'inspection visuelle', 'ressuage', 'magnétoscopie', 'ultrasons', 'cordiste inspecteur']
  },
  {
    id: 'silos-cheminees',
    slug: 'silos-cheminees',
    name: 'Entretien de silos et cheminées',
    cluster: 'industriel',
    description: 'Nettoyage, purge et peinture sur silos agricoles, industriels et cheminées d\'usine.',
    keywords: ['nettoyage silo', 'cheminée industrielle', 'espace confiné', 'fumisterie']
  },

  // Génie Civil
  {
    id: 'inspection-ouvrages',
    slug: 'inspection-ouvrages',
    name: 'Inspection de ponts et viaducs',
    cluster: 'genie_civil',
    description: 'Audits structurels, purges et maçonnerie sur les ouvrages d\'art.',
    keywords: ['inspection pont', 'viaduc', 'ouvrage d\'art', 'purge béton', 'maçonnerie génie civil']
  },
  {
    id: 'confortement-falaises',
    slug: 'confortement-falaises',
    name: 'Confortement de falaises',
    cluster: 'genie_civil',
    description: 'Dévégétalisation, purge rocheuse et pose de grillages de protection.',
    keywords: ['purge falaise', 'grillage pendelé', 'protection chutes de pierres', 'confortement rocheux', 'dévégétalisation']
  },

  // Grand public
  {
    id: 'ravalement-facade',
    slug: 'ravalement-facade',
    name: 'Ravalement de façade',
    cluster: 'grand_public',
    description: 'Rénovation complète de façades : nettoyage, enduits, peinture et traitement des fissures sans échafaudage.',
    keywords: ['ravalement façade', 'devis ravalement', 'entreprise ravalement', 'façade peinture', 'enduit façade', 'nettoyage façade immeuble'],
    metaTitle: 'Ravalement de Façade à {city} — Devis Gratuit Sous 48h',
    metaDesc: 'Ravalement de façade à {city} par des techniciens spécialisés. Intervention sans échafaudage, devis gratuit sous 48h. Certifiés et assurés.',
    h1Template: 'Ravalement de Façade à {city} : Intervention Sans Échafaudage',
    introTemplate: 'Vous cherchez un professionnel pour le ravalement de votre façade à {city} ? Nos techniciens spécialisés en accès difficile interviennent sans nacelle ni échafaudage, ce qui réduit les coûts et les délais.'
  },
  {
    id: 'nettoyage-toiture',
    slug: 'nettoyage-toiture',
    name: 'Nettoyage et démoussage de toiture',
    cluster: 'grand_public',
    description: 'Nettoyage haute pression, traitement antimousse et hydrofuge sur toutes toitures inaccessibles.',
    keywords: ['nettoyage toiture', 'démoussage toit', 'traitement mousse toit', 'hydrofuge toiture', 'nettoyer toit', 'entretien toiture'],
    metaTitle: 'Nettoyage Toiture à {city} — Démoussage & Traitement Hydrofuge',
    metaDesc: 'Nettoyage et démoussage de toiture à {city}. Intervention rapide sans échafaudage. Traitement hydrofuge inclus. Devis gratuit.',
    h1Template: 'Nettoyage & Démoussage de Toiture à {city}',
    introTemplate: 'Votre toit est recouvert de mousse, de lichens ou de dépôts ? Nos spécialistes interviennent à {city} pour nettoyer, démoussage et traiter votre toiture, quelle que soit sa hauteur ou son accessibilité.'
  },
  {
    id: 'couverture-reparation',
    slug: 'couverture-reparation',
    name: 'Couverture et réparation de toiture',
    cluster: 'grand_public',
    description: 'Réparation de fuites, remplacement de tuiles et ardoises sur toitures à forte pente ou inaccessibles.',
    keywords: ['couvreur', 'réparation toiture', 'fuite toit', 'tuiles cassées', 'ardoise toiture', 'réparation charpente'],
    metaTitle: 'Couverture & Réparation Toiture à {city} — Intervention Rapide',
    metaDesc: 'Couvreur à {city} pour réparation de fuites, remplacement de tuiles et ardoises. Intervention rapide sans échafaudage. Devis gratuit.',
    h1Template: 'Couverture & Réparation de Toiture à {city} : Intervention Sans Échafaudage',
    introTemplate: 'Une fuite, des tuiles cassées ou une charpente fragilisée à {city} ? Nos couvreurs spécialisés interviennent en accès difficile pour réparer votre toiture rapidement, sans l\'installation coûteuse d\'un échafaudage.'
  },
  {
    id: 'peinture-facade',
    slug: 'peinture-facade',
    name: 'Peinture de façade',
    cluster: 'grand_public',
    description: 'Application de peintures et traitements de protection sur façades de grande hauteur.',
    keywords: ['peinture façade', 'peintre façadier', 'peinture immeuble', 'traitement façade', 'peinture extérieure hauteur'],
    metaTitle: 'Peinture de Façade à {city} — Peintre Spécialisé Hauteur',
    metaDesc: 'Peinture et ravalement de façade à {city} par des peintres spécialisés en hauteur. Rendu professionnel sans nacelle. Devis gratuit sous 48h.',
    h1Template: 'Peinture de Façade à {city} : Résultat Professionnel en Hauteur',
    introTemplate: 'Pour la peinture de votre façade à {city}, nos peintres spécialisés en travaux en hauteur garantissent un rendu impeccable, même sur des surfaces difficiles d\'accès, sans nacelle ni échafaudage encombrant.'
  },
  {
    id: 'maconnerie-facade',
    slug: 'maconnerie-facade',
    name: 'Maçonnerie et joints de façade',
    cluster: 'grand_public',
    description: 'Reprise de joints, traitement des fissures et consolidation de façades en hauteur.',
    keywords: ['maçonnerie façade', 'joints de façade', 'rejointoiement', 'fissure façade', 'consolidation façade', 'maçon hauteur'],
    metaTitle: 'Maçonnerie & Joints de Façade à {city} — Spécialiste Hauteur',
    metaDesc: 'Reprise de joints, fissures et maçonnerie de façade à {city}. Intervention en hauteur sans échafaudage. Devis gratuit.',
    h1Template: 'Maçonnerie & Rejointoiement de Façade à {city}',
    introTemplate: 'Des joints dégradés ou des fissures sur votre façade à {city} ? Nos maçons spécialisés en travaux en hauteur interviennent pour reprendre les joints, traiter les fissures et consolider vos façades sans nécessiter de structure d\'échafaudage lourde.'
  },
  {
    id: 'isolation-exterieure',
    slug: 'isolation-exterieure',
    name: 'Isolation thermique par l\'extérieur (ITE)',
    cluster: 'grand_public',
    description: 'Pose de systèmes d\'isolation thermique sur bâtiments de grande hauteur sans échafaudage.',
    keywords: ['isolation extérieure', 'ITE', 'isolation façade', 'isolation thermique extérieure', 'économie énergie façade'],
    metaTitle: 'Isolation Extérieure (ITE) à {city} — Sans Échafaudage',
    metaDesc: 'Isolation thermique par l\'extérieur à {city}. Nos spécialistes posent votre ITE sans échafaudage, économisant jusqu\'à 40% sur le budget. Devis gratuit.',
    h1Template: 'Isolation Thermique par l\'Extérieur (ITE) à {city} Sans Échafaudage',
    introTemplate: 'Réduisez vos factures d\'énergie avec une isolation thermique par l\'extérieur à {city}. Nos techniciens spécialisés posent votre ITE sans échafaudage traditionnel, ce qui peut réduire le coût global de votre projet jusqu\'à 40%.'
  }
];

// MVP Algoritmique : Génération aléatoire pseudo-stable pour les E-E-A-T stats
// Basé sur le nom de la ville pour ne pas changer à chaque rechargement de page.
export function generateLocalStats(cityName: string) {
    const seed = cityName.length + cityName.charCodeAt(0) + cityName.charCodeAt(cityName.length - 1);
    const totalPros = (seed % 15) + 8; // Entre 8 et 22 cordistes
    const successJobs = (seed * 13) % 450 + 120; // Entre 120 et 570 missions
    return {
        cordistesCount: totalPros,
        jobsSuccess: successJobs,
        radius: 30 // km 
    };
}

export function getLocalReviews(cityName: string, serviceName?: string) {
    const seed = cityName.length + (serviceName?.length || 0);
    const rating = 4.7 + (seed % 3) / 10;
    const count = 120 + (seed * 7 % 200);

    const reviews = [
        {
            author: "Jean-Marc L.",
            date: "Il y a 2 semaines",
            text: `Intervention très professionnelle. L'équipe a su intervenir rapidement et en toute sécurité au centre de ${cityName} pour nos travaux en hauteur.`,
            rating: 5
        },
        {
            author: "Sophie D. (Syndic)",
            date: "Le mois dernier",
            text: `Devis clair et intervention sécurisée. Le ${serviceName ? serviceName.toLowerCase() : 'chantier'} s'est déroulé parfaitement sans l'encombrement d'une nacelle lourde.`,
            rating: 5
        },
        {
            author: "Entreprise du BTP (" + cityName.slice(0, 3).toUpperCase() + ")",
            date: "Il y a 3 mois",
            text: `Nous faisons appel à la plateforme dès que nous avons besoin de renfort cordiste certifié dans la région. Excellente réactivité des pros.`,
            rating: 4
        }
    ];

    return { reviews, rating: rating.toFixed(1), count };
}
