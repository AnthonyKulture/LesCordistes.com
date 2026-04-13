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
  // Villes satellites — Axe 2
  { name: 'Aix-en-Provence', slug: 'aix-en-provence', lat: 43.5297, lng: 5.4474, region: 'Provence-Alpes-Côte d\'Azur', department: '13', contextualIntro: "patrimoine haussmannien de la cité du Roi René et les campus universitaires de grande envergure" },
  { name: 'Angers', slug: 'angers', lat: 47.4784, lng: -0.5632, region: 'Pays de la Loire', department: '49', contextualIntro: "château médiéval et le dynamisme économique de la capitale de la douceur angevine" },
  { name: 'Reims', slug: 'reims', lat: 49.2583, lng: 4.0317, region: 'Grand Est', department: '51', contextualIntro: "cathédrale gothique classée UNESCO et les caves de champagne creusées dans la craie champenoise" },
  { name: 'Le Havre', slug: 'le-havre', lat: 49.4938, lng: 0.1077, region: 'Normandie', department: '76', contextualIntro: "architecture Le Corbusier classée UNESCO et le premier port conteneurs de France" },
  { name: 'Caen', slug: 'caen', lat: 49.1829, lng: -0.3707, region: 'Normandie', department: '14', contextualIntro: "architecture de reconstruction d'après-guerre et le complexe universitaire normand" },
  { name: 'Perpignan', slug: 'perpignan', lat: 42.6976, lng: 2.8954, region: 'Occitanie', department: '66', contextualIntro: "influences catalanes et les infrastructures logistiques du premier marché de gros maraîcher d'Europe" },
  { name: 'Besançon', slug: 'besancon', lat: 47.2378, lng: 6.0241, region: 'Bourgogne-Franche-Comté', department: '25', contextualIntro: "citadelle Vauban classée UNESCO et la haute horlogerie franc-comtoise" },
  { name: 'Pau', slug: 'pau', lat: 43.2951, lng: -0.3708, region: 'Nouvelle-Aquitaine', department: '64', contextualIntro: "patrimoine royal du château de Pau et l'industrie pétrolière et gazière du bassin de Lacq" },
  { name: 'Cannes', slug: 'cannes', lat: 43.5528, lng: 7.0174, region: 'Provence-Alpes-Côte d\'Azur', department: '06', contextualIntro: "hôtellerie de luxe du palais des festivals et les résidences de standing de la Croisette" },
  { name: 'Avignon', slug: 'avignon', lat: 43.9493, lng: 4.8055, region: 'Provence-Alpes-Côte d\'Azur', department: '84', contextualIntro: "palais des Papes et remparts médiévaux classés UNESCO du patrimoine mondial" },
  { name: 'Poitiers', slug: 'poitiers', lat: 46.5802, lng: 0.3404, region: 'Nouvelle-Aquitaine', department: '86', contextualIntro: "baptistère paléochrétien et la ville universitaire historique du centre-ouest français" },
  { name: 'La Rochelle', slug: 'la-rochelle', lat: 46.1591, lng: -1.1520, region: 'Nouvelle-Aquitaine', department: '17', contextualIntro: "port de plaisance et tours médiévales face à l'Atlantique et aux embruns salins" },
  { name: 'Dunkerque', slug: 'dunkerque', lat: 51.0344, lng: 2.3768, region: 'Hauts-de-France', department: '59', contextualIntro: "port industriel majeur et les sites sidérurgiques et pétrochimiques du littoral flamand" },
  { name: 'Lorient', slug: 'lorient', lat: 47.7488, lng: -3.3601, region: 'Bretagne', department: '56', contextualIntro: "base navale et le port de pêche sous les assauts du climat océanique breton" },
  { name: 'Annecy', slug: 'annecy', lat: 45.8992, lng: 6.1294, region: 'Auvergne-Rhône-Alpes', department: '74', contextualIntro: "vieille ville médiévale et les résidences alpines face aux massifs de la Haute-Savoie" },
  { name: 'Nîmes', slug: 'nimes', lat: 43.8367, lng: 4.3601, region: 'Occitanie', department: '30', contextualIntro: "monuments romains classés (arènes, Maison Carrée) et le tissu industriel gardois" },
  { name: 'Bayonne', slug: 'bayonne', lat: 43.4933, lng: -1.4750, region: 'Nouvelle-Aquitaine', department: '64', contextualIntro: "remparts Vauban et le bâti basque traditionnel face aux vents atlantiques du Pays Basque" },
  { name: 'Saint-Nazaire', slug: 'saint-nazaire', lat: 47.2736, lng: -2.2133, region: 'Pays de la Loire', department: '44', contextualIntro: "chantiers navals et la base de sous-marins classée monument historique de l'estuaire de la Loire" },
  { name: 'Colmar', slug: 'colmar', lat: 48.0793, lng: 7.3585, region: 'Grand Est', department: '68', contextualIntro: "colombages alsaciens de la Petite Venise et le patrimoine viticole des collines sous-vosgiennes" },
  { name: 'Chartres', slug: 'chartres', lat: 48.4469, lng: 1.4877, region: 'Centre-Val de Loire', department: '28', contextualIntro: "cathédrale gothique classée UNESCO et le tissu industriel du Beauce centré sur l'agroalimentaire" },
  { name: 'Cherbourg', slug: 'cherbourg', lat: 49.6333, lng: -1.6167, region: 'Normandie', department: '50', contextualIntro: "arsenal nucléaire DCNS et les infrastructures portuaires face aux tempêtes de la Manche" },
  { name: 'Mulhouse', slug: 'mulhouse', lat: 47.7508, lng: 7.3359, region: 'Grand Est', department: '68', contextualIntro: "reconversion du tissu industriel textile et pétrochimique alsacien et les cités-jardins ouvrières" },
  { name: 'Amiens', slug: 'amiens', lat: 49.8942, lng: 2.2958, region: 'Hauts-de-France', department: '80', contextualIntro: "cathédrale gothique la plus vaste de France et l'industrie automobile Stellantis du bassin picard" },
  { name: 'Limoges', slug: 'limoges', lat: 45.8315, lng: 1.2578, region: 'Nouvelle-Aquitaine', department: '87', contextualIntro: "porcelaine et émaux cloisonnés des manufactures et le tissu industriel de la haute-Vienne" },
  { name: 'Béziers', slug: 'beziers', lat: 43.3442, lng: 3.2193, region: 'Occitanie', department: '34', contextualIntro: "cathédrale fortifiée et les ouvrages du Canal du Midi classé UNESCO dans le Biterrois" },
  { name: 'Le Mans', slug: 'le-mans', lat: 48.0061, lng: 0.1996, region: 'Pays de la Loire', department: '72', contextualIntro: "industrie automobile et le circuit des 24 Heures générant d'importantes infrastructures sportives" },
  { name: 'Troyes', slug: 'troyes', lat: 48.2973, lng: 4.0744, region: 'Grand Est', department: '10', contextualIntro: "maisons à colombages médiévales de la capitale champenoise et le bassin de l'Aube" },
  { name: 'Valenciennes', slug: 'valenciennes', lat: 50.3579, lng: 3.5238, region: 'Hauts-de-France', department: '59', contextualIntro: "reconversion post-minière et l'industrie automobile Toyota du Hainaut français" },
  { name: 'Calais', slug: 'calais', lat: 50.9513, lng: 1.8587, region: 'Hauts-de-France', department: '62', contextualIntro: "port transmanche et les terminaux du tunnel sous la Manche soumis aux embruns de la mer du Nord" },
  { name: 'Chambéry', slug: 'chambery', lat: 45.5646, lng: 5.9178, region: 'Auvergne-Rhône-Alpes', department: '73', contextualIntro: "carrefour alpin et le bâti savoyard face aux contraintes climatiques de montagne" },
  { name: 'Valence', slug: 'valence', lat: 44.9334, lng: 4.8924, region: 'Auvergne-Rhône-Alpes', department: '26', contextualIntro: "infrastructure rhodanienne et le tissu industriel et agro-industriel de la Drôme" },
  { name: 'Montauban', slug: 'montauban', lat: 44.0179, lng: 1.3541, region: 'Occitanie', department: '82', contextualIntro: "briques roses tarn-et-garonnaises et les infrastructures agricoles et logistiques du Quercy-blanc" },
  { name: 'Quimper', slug: 'quimper', lat: 47.9965, lng: -4.0979, region: 'Bretagne', department: '29', contextualIntro: "faïences bretonnes et la cathédrale gothique sous les pluies du Finistère" },
  { name: 'Ajaccio', slug: 'ajaccio', lat: 41.9267, lng: 8.7369, region: 'Corse', department: '2A', contextualIntro: "patrimoine napoléonien et les infrastructures touristiques de la capitale de la Corse" },
  { name: 'Albi', slug: 'albi', lat: 43.9277, lng: 2.1480, region: 'Occitanie', department: '81', contextualIntro: "cathédrale-forteresse et palais episcopal classés UNESCO dans la cité épiscopale albigeoise" },
  { name: 'Angoulême', slug: 'angouleme', lat: 45.6489, lng: 0.1566, region: 'Nouvelle-Aquitaine', department: '16', contextualIntro: "remparts médiévaux en surplomb de la Charente et le tissu industriel de l'imprimerie charentaise" },
  { name: 'Arles', slug: 'arles', lat: 43.6767, lng: 4.6278, region: 'Provence-Alpes-Côte d\'Azur', department: '13', contextualIntro: "monuments romains et monuments médiévaux classés UNESCO dans la Camargue provençale" },
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
  faqs?: FAQ[];
}

export interface FAQ {
  question: string  // {city} remplacé dynamiquement
  answer: string    // {city} remplacé dynamiquement
}

export const DEFAULT_SERVICE_FAQS: FAQ[] = [
  {
    question: "Quel est le prix d'une intervention cordiste à {city} ?",
    answer: "Le tarif d'une intervention sur cordes à {city} dépend de la complexité de l'accès, de la hauteur et du type de prestation. En moyenne, comptez entre 350 € et 600 € HT par jour et par technicien. Pour un nettoyage de façade, le prix oscille entre 8 et 25 €/m² selon la surface et la salissure. Obtenez un devis gratuit et personnalisé sous 48h via notre plateforme.",
  },
  {
    question: "Vos cordistes intervenant à {city} sont-ils certifiés ?",
    answer: "Oui. Tout professionnel inscrit sur LesCordistes.com doit justifier d'une certification CQP Cordiste (obligatoire en France selon le code du travail) ou IRATA (norme internationale reconnue dans l'industrie lourde), et présenter une attestation RC Pro valide. Ces documents sont vérifiés par notre équipe avant toute mise en relation à {city}.",
  },
  {
    question: "Combien de temps pour obtenir un devis à {city} ?",
    answer: "Grâce à notre réseau de cordistes certifiés présents dans l'agglomération de {city} et dans un rayon de 30 km, vous recevez vos premiers devis sous 48h après publication de votre besoin. Pour les interventions urgentes — sécurisation de site, sinistre, purge de façade — une mise en relation express sous 24h est possible sur demande.",
  },
  {
    question: "Comment trouver un cordiste près de {city} ?",
    answer: "Publiez votre besoin en 3 minutes sur LesCordistes.com : décrivez les travaux, la localisation et vos contraintes d'accès. Notre système identifie automatiquement les cordistes certifiés disponibles dans un rayon de 30 km autour de {city} et leur transmet votre demande. Vous comparez les devis et choisissez librement, sans commission prélevée sur la transaction.",
  },
]

export const SEO_SERVICES: SEOServiceCluster[] = [
  // Urbain
  {
    id: 'nettoyage-facade',
    slug: 'nettoyage-facade',
    name: 'Nettoyage de façades',
    cluster: 'urbain',
    description: 'Démoussage, dépollution et lavage haute-pression de façades inaccessibles.',
    keywords: ['nettoyage façade', 'démoussage', 'dépollution', 'lavage haute pression', 'façadier cordiste'],
    faqs: [
      { question: "Combien coûte un nettoyage de façade par cordiste à {city} ?", answer: "Le prix d'un nettoyage de façade à {city} varie entre 8€ et 25€/m² selon le niveau d'encrassement, la technique (haute pression, gommage, produits chimiques) et la hauteur. Devis gratuit sous 48h." },
      { question: "Quelles façades peut-on nettoyer par accès sur cordes à {city} ?", answer: "Tous types : pierre de taille, béton, brique, bardage métallique ou composite. Nos cordistes à {city} interviennent dès le 2ème étage, quelle que soit la configuration architecturale." },
      { question: "Faut-il une autorisation pour le nettoyage de façade par cordiste à {city} ?", answer: "Dans la plupart des cas à {city}, l'accès sur cordes ne nécessite pas d'autorisation d'occupation du domaine public (AOT), contrairement à un échafaudage. Cela accélère considérablement le démarrage." },
    ],
  },
  {
    id: 'lavage-vitres',
    slug: 'lavage-vitres',
    name: 'Lavage de vitres',
    cluster: 'urbain',
    description: 'Entretien des verrières, atriums et façades vitrées de grande hauteur.',
    keywords: ['laveur de vitre cordiste', 'verrières', 'atriums', 'nettoyage vitrerie hauteur'],
    faqs: [
      { question: "Quel est le prix du lavage de vitres en hauteur à {city} ?", answer: "Le tarif du lavage de vitres par cordiste à {city} dépend de la surface vitrée et de la hauteur. Comptez entre 3€ et 10€ par m² de vitre. Un devis précis est fourni sous 48h." },
      { question: "Quelle fréquence d'entretien pour les vitres en hauteur à {city} ?", answer: "Pour les bâtiments tertiaires à {city}, 2 à 4 passages annuels sont recommandés. Pour les façades proches d'axes routiers ou en milieu industriel, une fréquence trimestrielle est conseillée." },
      { question: "Le lavage de vitres par cordiste est-il adapté aux verrières et atriums à {city} ?", answer: "Oui, c'est même la solution idéale pour les verrières et atriums à {city} inaccessibles par les méthodes traditionnelles. Nos cordistes utilisent des perches spécifiques et des produits adaptés au verre traité." },
    ],
  },
  {
    id: 'toiture-zinguerie',
    slug: 'toiture-zinguerie',
    name: 'Toiture et Zinguerie',
    cluster: 'urbain',
    description: 'Réparation de chéneaux, remplacement de tuiles et ardoises sur toitures difficiles d\'accès.',
    keywords: ['couvreur cordiste', 'zinguerie', 'réparation chéneaux', 'fuite toiture'],
    faqs: [
      { question: "Peut-on réparer une toiture sans échafaudage à {city} ?", answer: "Oui. Nos couvreurs-cordistes interviennent à {city} sans échafaudage ni nacelle pour remplacer des tuiles isolées, réparer des chéneaux ou traiter des fissures, réduisant ainsi les délais et le coût global." },
      { question: "Quel est le tarif d'une réparation de toiture par cordiste à {city} ?", answer: "Le coût dépend de la nature de l'intervention : remplacement de tuiles (à partir de 150€), réparation de chéneau (200-600€), traitement complet de toiture sur devis. Intervention sous 48h à {city}." },
      { question: "Les cordistes peuvent-ils intervenir sur tous types de toitures à {city} ?", answer: "Oui : tuiles, ardoises, zinc, bac acier, shingle. La technique sur cordes est particulièrement adaptée aux toitures à forte pente à {city}, inaccessibles en sécurité par d'autres moyens." },
    ],
  },
  {
    id: 'securisation-anti-pigeons',
    slug: 'securisation-anti-pigeons',
    name: 'Sécurisation et filets anti-pigeons',
    cluster: 'urbain',
    description: 'Pose de pics anti-volatiles, filets de sécurité et lignes de vie sur les bâtiments.',
    keywords: ['dépigeonnage', 'filet anti-pigeon', 'pose ligne de vie', 'purge façade', 'mise en sécurité'],
    faqs: [
      { question: "Quel est le prix d'une installation anti-pigeons par cordiste à {city} ?", answer: "La pose de pics ou de filets anti-pigeons à {city} varie entre 15€ et 60€ par mètre linéaire selon le dispositif choisi. Pour un immeuble standard, comptez entre 500€ et 2 500€ pour un traitement complet." },
      { question: "Quelle solution anti-pigeons est la plus efficace à {city} ?", answer: "Les filets de protection sont la solution la plus durable à {city}, combinés à des pics inox pour les corniches et appuis de fenêtres. Nos cordistes évaluent gratuitement le meilleur dispositif selon votre bâtiment." },
      { question: "Le dépigeonnage par cordiste est-il respectueux des animaux à {city} ?", answer: "Oui. Les dispositifs posés par nos cordistes à {city} sont dissuasifs et non nuisibles : ils éloignent les pigeons sans les blesser, conformément à la réglementation sur la protection des animaux." },
    ],
  },
  {
    id: 'nettoyage-panneaux-solaires',
    slug: 'nettoyage-panneaux-solaires',
    name: 'Nettoyage de panneaux solaires',
    cluster: 'urbain',
    description: 'Démoussage et nettoyage de panneaux photovoltaïques sur toitures inaccessibles pour maximiser le rendement.',
    keywords: ['nettoyage panneaux solaires', 'entretien photovoltaïque', 'démoussage panneaux', 'rendement solaire', 'cordiste photovoltaïque'],
    metaTitle: 'Nettoyage Panneaux Solaires à {city} — Cordiste Certifié',
    metaDesc: 'Nettoyage et entretien de panneaux photovoltaïques à {city} par cordiste. Restaurez le rendement de vos panneaux solaires. Devis gratuit sous 48h.',
    h1Template: 'Nettoyage de Panneaux Solaires à {city} : Rendement Optimal Garanti',
    introTemplate: 'Des panneaux solaires encrassés perdent jusqu\'à 30% de leur rendement. Nos cordistes interviennent à {city} pour nettoyer vos panneaux photovoltaïques en toute sécurité, sans endommager les cellules ni les câblages.',
    faqs: [
      { question: "Pourquoi faire nettoyer ses panneaux solaires par un cordiste à {city} ?", answer: "Des panneaux encrassés (mousse, lichens, pollution) perdent jusqu'à 30% de rendement. À {city}, un nettoyage annuel par cordiste est la solution la plus sûre sur les toitures inaccessibles sans endommager les panneaux." },
      { question: "Quel est le prix du nettoyage de panneaux solaires à {city} ?", answer: "Le nettoyage de panneaux photovoltaïques par cordiste à {city} coûte entre 3€ et 8€ par panneau selon leur accessibilité et leur encrassement. Pour une installation de 20 panneaux, comptez entre 80€ et 200€." },
      { question: "À quelle fréquence nettoyer ses panneaux solaires à {city} ?", answer: "Un nettoyage annuel est recommandé dans la majorité des régions. À {city}, si votre installation est proche d'axes routiers ou en zone de forte pollution, un entretien semestriel optimise le rendement." },
    ],
  },
  {
    id: 'etancheite-infiltrations',
    slug: 'etancheite-infiltrations',
    name: 'Étanchéité et traitement des infiltrations',
    cluster: 'urbain',
    description: 'Traitement des fuites, application de membranes d\'étanchéité et hydrofuge sur toitures-terrasses et façades.',
    keywords: ['étanchéité toiture terrasse', 'traitement infiltration', 'hydrofuge façade', 'fuite terrasse', 'membrane étanchéité'],
    metaTitle: 'Étanchéité & Infiltrations à {city} — Cordiste Spécialisé',
    metaDesc: 'Traitement des infiltrations et étanchéité de toiture-terrasse à {city} sans échafaudage. Diagnostic gratuit, intervention rapide. Cordistes certifiés.',
    h1Template: 'Étanchéité & Traitement des Infiltrations à {city} Sans Échafaudage',
    introTemplate: 'Une infiltration non traitée peut causer des dégâts considérables. Nos cordistes à {city} diagnostiquent et traitent les fuites de toitures-terrasses, acrotères et façades en accès difficile, sans l\'installation coûteuse d\'un échafaudage.',
    faqs: [
      { question: "Comment détecter une infiltration sur toiture-terrasse à {city} ?", answer: "Les signes d'alerte sont : taches d'humidité sur les plafonds, cloques sur les revêtements, végétation sur la terrasse. Nos cordistes à {city} réalisent un diagnostic complet pour localiser précisément la source." },
      { question: "Quel est le coût d'un traitement d'étanchéité par cordiste à {city} ?", answer: "Une réparation localisée à {city} démarre à partir de 300€. Un traitement complet de toiture-terrasse (20-50m²) se situe entre 800€ et 3 000€ selon l'état et la technique utilisée. Devis gratuit sous 48h." },
      { question: "L'accès sur cordes est-il adapté pour les toitures-terrasses à {city} ?", answer: "Oui, notamment pour les immeubles de plus de 3 étages à {city} où les toitures-terrasses sont inaccessibles sans nacelle. Le travail sur cordes permet une intervention ciblée sans mobiliser de matériel lourd." },
    ],
  },
  {
    id: 'pose-enseignes-hauteur',
    slug: 'pose-enseignes-hauteur',
    name: 'Pose et maintenance d\'enseignes en hauteur',
    cluster: 'urbain',
    description: 'Installation, remplacement et maintenance d\'enseignes lumineuses, banderoles et signalétique sur façades inaccessibles.',
    keywords: ['pose enseigne hauteur', 'enseigne lumineuse cordiste', 'signalétique façade', 'banderole hauteur', 'lettrage façade'],
    metaTitle: 'Pose d\'Enseignes en Hauteur à {city} — Cordiste Spécialisé',
    metaDesc: 'Installation et maintenance d\'enseignes et signalétiques en hauteur à {city} par cordiste certifié. Intervention sans nacelle. Devis sous 48h.',
    h1Template: 'Pose d\'Enseignes & Signalétique en Hauteur à {city}',
    introTemplate: 'L\'installation d\'enseignes sur des façades de grande hauteur à {city} exige une précision et une sécurité maximales. Nos cordistes spécialisés posent, remplacent et entretiennent vos enseignes lumineuses et signalétiques sans contraindre votre activité.',
    faqs: [
      { question: "Quel est le prix de la pose d'une enseigne en hauteur à {city} ?", answer: "La pose d'une enseigne par cordiste à {city} dépend de la hauteur, du poids et du type d'enseigne. Comptez entre 300€ et 1 500€ pour une intervention standard. Devis gratuit sous 48h." },
      { question: "Les cordistes peuvent-ils poser des enseignes lumineuses à {city} ?", answer: "Oui, nos cordistes à {city} travaillent en binôme avec des électriciens pour la pose d'enseignes lumineuses : caissons lumineux, lettres découpées rétroéclairées, néons ou enseignes LED." },
      { question: "Combien de temps dure la pose d'une enseigne en hauteur à {city} ?", answer: "Une pose standard à {city} prend généralement 2 à 4 heures. Pour les enseignes volumineuses ou nécessitant des travaux électriques, une demi-journée à une journée complète est à prévoir." },
    ],
  },

  // Industriel
  {
    id: 'maintenance-eolienne',
    slug: 'maintenance-eolienne',
    name: 'Maintenance éolienne',
    cluster: 'industriel',
    description: 'Inspection, contrôle et réparation sur pales et mâts d\'éoliennes onshore/offshore.',
    keywords: ['cordiste éolien', 'inspection pales', 'réparation fibre', 'offshore', 'onshore'],
    faqs: [
      { question: "Quelles interventions les cordistes éoliens réalisent-ils à {city} ?", answer: "Nos techniciens éoliens à {city} et sa région réalisent : inspections visuelles de pales, réparations de fissures en fibre de verre, remplacement de composants de nacelle, nettoyage et peinture de mâts." },
      { question: "Quelle certification est requise pour la maintenance éolienne à {city} ?", answer: "Outre la certification IRATA ou CQP, nos techniciens possèdent les habilitations GWO (Global Wind Organisation) — Basic Safety Training et spécialisations métier — indispensables sur les parcs éoliens proches de {city}." },
      { question: "Combien coûte une inspection de pale d'éolienne à {city} ?", answer: "L'inspection visuelle d'une éolienne par cordiste (3 pales + nacelle) se situe entre 800€ et 2 500€ selon l'accessibilité du site. Une réparation de pale composite est facturée sur devis selon l'étendue des dégâts." },
    ],
  },
  {
    id: 'pylones-telecom',
    slug: 'pylones-telecom',
    name: 'Pylônes et Télécom',
    cluster: 'industriel',
    description: 'Installation et maintenance d\'antennes sur pylônes haute tension et télécoms.',
    keywords: ['monteur pylône', 'maintenance télécom', 'antenne GSM', 'haute tension'],
    faqs: [
      { question: "Quelles habilitations sont nécessaires pour travailler sur pylônes à {city} ?", answer: "Nos techniciens pylônes disposent de l'habilitation électrique B0/H0 ou HE (selon la tension), de la certification IRATA ou CQP Travaux en Hauteur, et des formations spécifiques aux opérateurs télécom (Bouygues, SFR, Orange) présents à {city}." },
      { question: "Quel est le coût d'une intervention sur pylône télécom à {city} ?", answer: "Une intervention standard sur pylône télécom à {city} (inspection ou remplacement d'antenne) se situe entre 600€ et 2 000€ selon la hauteur du pylône et la complexité des travaux. Devis sous 48h." },
      { question: "Les cordistes peuvent-ils intervenir sur pylônes haute tension à {city} ?", answer: "Oui, nos techniciens habilités HE à {city} interviennent sur les ouvrages de transport d'énergie RTE avec des distances de sécurité strictes, dans le cadre de protocoles définis avec le gestionnaire de réseau." },
    ],
  },
  {
    id: 'cnd-controle-non-destructif',
    slug: 'cnd-controle-non-destructif',
    name: 'Contrôles Non Destructifs (CND)',
    cluster: 'industriel',
    description: 'Inspections UT, MT, PT et VT sur structures industrielles inaccessibles.',
    keywords: ['CND', 'inspection visuelle', 'ressuage', 'magnétoscopie', 'ultrasons', 'cordiste inspecteur'],
    faqs: [
      { question: "Quelles méthodes CND vos techniciens maîtrisent-ils à {city} ?", answer: "Nos inspecteurs-cordistes à {city} réalisent : contrôle visuel (VT), ressuage (PT), magnétoscopie (MT), ultrasons (UT) et thermographie infrarouge sur structures industrielles inaccessibles." },
      { question: "Dans quels secteurs industriels intervenez-vous pour du CND à {city} ?", answer: "Pétrochimie, énergie (nucléaire, éolien), ponts et ouvrages d'art, aéronautique, navires. Nos techniciens certifiés COFREND niveau 2 ou 3 s'adaptent aux normes de chaque secteur industriel autour de {city}." },
      { question: "Un rapport certifié est-il fourni après inspection CND à {city} ?", answer: "Oui. Chaque intervention CND à {city} donne lieu à un rapport de contrôle normé, signé par un technicien certifié COFREND, accepté par les organismes d'inspection et les donneurs d'ordre industriels." },
    ],
  },
  {
    id: 'silos-cheminees',
    slug: 'silos-cheminees',
    name: 'Entretien de silos et cheminées',
    cluster: 'industriel',
    description: 'Nettoyage, purge et peinture sur silos agricoles, industriels et cheminées d\'usine.',
    keywords: ['nettoyage silo', 'cheminée industrielle', 'espace confiné', 'fumisterie'],
    faqs: [
      { question: "Peut-on entretenir une cheminée industrielle par cordiste à {city} ?", answer: "Oui. Nos techniciens à {city} interviennent sur les cheminées d'usines jusqu'à 120m pour : inspection visuelle, peinture anticorrosion, réfection des joints et purge des bétons dégradés." },
      { question: "Quel est le coût du nettoyage d'un silo par cordiste à {city} ?", answer: "L'entretien d'un silo par cordiste à {city} dépend de sa hauteur et de son état. Un nettoyage standard se situe entre 1 500€ et 6 000€. Un devis est établi après inspection préalable gratuite." },
      { question: "Vos cordistes sont-ils formés au travail en espace confiné à {city} ?", answer: "Oui. En complément de leur certification cordiste, nos techniciens intervenant sur silos et cuves à {city} sont formés et habilités travail en espace confiné (ATEX si nécessaire) selon la norme NF EN 60079." },
    ],
  },
  {
    id: 'peinture-industrielle',
    slug: 'peinture-industrielle',
    name: 'Peinture industrielle et anticorrosion',
    cluster: 'industriel',
    description: 'Application de peintures anticorrosion et de protection sur structures métalliques, charpentes et ouvrages d\'art.',
    keywords: ['peinture industrielle', 'anticorrosion', 'peinture charpente métallique', 'traitement rouille', 'peinture pont', 'cordiste peintre industriel'],
    metaTitle: 'Peinture Industrielle & Anticorrosion à {city} — Cordiste Spécialisé',
    metaDesc: 'Peinture industrielle et traitement anticorrosion à {city} sur structures métalliques inaccessibles. Cordistes certifiés IRATA. Devis gratuit.',
    h1Template: 'Peinture Industrielle & Anticorrosion à {city} : Structures Métalliques',
    introTemplate: 'La corrosion des structures métalliques inaccessibles représente un risque structurel majeur. Nos cordistes spécialisés à {city} appliquent des systèmes de peinture anticorrosion haute performance sur charpentes, passerelles, silos et ouvrages d\'art, sans arrêt de l\'activité industrielle.',
    faqs: [
      { question: "Sur quelles structures métalliques intervenez-vous à {city} ?", answer: "Charpentes industrielles, passerelles, ponts, pylônes, silos, réservoirs, structures portuaires. Nos cordistes peintres industriels à {city} maîtrisent les systèmes anticorrosion certifiés ISO 12944 pour tous types de structures." },
      { question: "Quelle est la durabilité d'un traitement anticorrosion par cordiste à {city} ?", answer: "Un système anticorrosion haute durabilité (C4-C5) appliqué par nos techniciens à {city} garantit une protection de 10 à 25 ans selon les conditions d'exposition. Le coût est largement amorti par rapport au remplacement de la structure." },
      { question: "Faut-il arrêter l'activité industrielle pour une peinture par cordiste à {city} ?", answer: "Généralement non. L'accès sur cordes permet d'intervenir par zones successives sans arrêt complet de la production à {city}. Nos équipes s'adaptent aux contraintes d'exploitation de votre site." },
    ],
  },
  {
    id: 'calorifugeage-isolation-tuyauteries',
    slug: 'calorifugeage-isolation-tuyauteries',
    name: 'Calorifugeage et isolation de tuyauteries',
    cluster: 'industriel',
    description: 'Pose et réfection d\'isolations thermiques sur tuyauteries et réseaux industriels en hauteur.',
    keywords: ['calorifugeage', 'isolation tuyauterie', 'calorifugeur cordiste', 'isolation thermique industrielle', 'réfection calorifuge'],
    metaTitle: 'Calorifugeage & Isolation Tuyauteries à {city} — Cordiste',
    metaDesc: 'Calorifugeage et isolation de tuyauteries industrielles en hauteur à {city}. Réduction des pertes thermiques. Cordistes certifiés. Devis sous 48h.',
    h1Template: 'Calorifugeage & Isolation de Tuyauteries en Hauteur à {city}',
    introTemplate: 'Les tuyauteries industrielles mal isolées génèrent des pertes thermiques considérables. Nos techniciens cordistes à {city} réalisent le calorifugeage et la réfection d\'isolations sur tous types de réseaux en hauteur, sans interruption prolongée de la production.',
    faqs: [
      { question: "Qu'est-ce que le calorifugeage par cordiste à {city} ?", answer: "Le calorifugeage par cordiste à {city} consiste à poser ou remplacer les isolations thermiques (laine de roche, mousse PIR, coquilles) sur des tuyauteries en hauteur ou en zone confinée inaccessibles par des méthodes conventionnelles." },
      { question: "Dans quels secteurs pratiquez-vous le calorifugeage à {city} ?", answer: "Pétrochimie, industrie agroalimentaire, pharmacie, énergie, papeterie. Nos techniciens à {city} interviennent sur tous types de réseaux : vapeur, eau chaude, air comprimé, fluides frigorigènes." },
      { question: "Quel est le coût d'un calorifugeage par cordiste à {city} ?", answer: "Le prix dépend de la longueur de réseau, du type d'isolant et de la difficulté d'accès. Comptez entre 30€ et 120€ par mètre linéaire à {city}. Devis gratuit après relevé sur site." },
    ],
  },

  // Génie Civil
  {
    id: 'inspection-ouvrages',
    slug: 'inspection-ouvrages',
    name: 'Inspection de ponts et viaducs',
    cluster: 'genie_civil',
    description: 'Audits structurels, purges et maçonnerie sur les ouvrages d\'art.',
    keywords: ['inspection pont', 'viaduc', 'ouvrage d\'art', 'purge béton', 'maçonnerie génie civil'],
    faqs: [
      { question: "Quelle réglementation s'applique à l'inspection de ponts à {city} ?", answer: "Les ouvrages d'art routiers à {city} sont soumis à la circulaire 82-40 et à l'IQOA (Image Qualité des Ouvrages d'Art). Nos techniciens réalisent les inspections détaillées périodiques (IDP) conformément à ces textes." },
      { question: "Quels types de ponts vos cordistes inspectent-ils à {city} ?", answer: "Ponts en béton armé et précontraint, ponts métalliques, viaducs, passerelles piétonnes, ponts ferroviaires. Nos équipes à {city} interviennent sous circulation ou en fermeture selon les contraintes de sécurité." },
      { question: "Un rapport d'inspection certifié est-il remis après l'intervention à {city} ?", answer: "Oui. Chaque inspection d'ouvrage à {city} donne lieu à un rapport IQOA détaillé avec photographies, cotation des désordres et préconisations de travaux, transmis au maître d'ouvrage sous 15 jours." },
    ],
  },
  {
    id: 'confortement-falaises',
    slug: 'confortement-falaises',
    name: 'Confortement de falaises',
    cluster: 'genie_civil',
    description: 'Dévégétalisation, purge rocheuse et pose de grillages de protection.',
    keywords: ['purge falaise', 'grillage pendelé', 'protection chutes de pierres', 'confortement rocheux', 'dévégétalisation'],
    faqs: [
      { question: "Quand faut-il conforter une falaise ou un talus à {city} ?", answer: "L'intervention est nécessaire dès qu'apparaissent des fissures actives, des blocs désolidarisés, une végétation envahissante en paroi ou après des épisodes de gel-dégel ou de fortes pluies dans les secteurs rocheux proches de {city}." },
      { question: "Quelles techniques utilisez-vous pour le confortement de falaises à {city} ?", answer: "Nos géotechniciens-cordistes à {city} utilisent : purge manuelle des blocs instables, clouage par boulons de roche, pose de grillages plaqués ou pendus, gunitage de béton projeté et filets pare-blocs dynamiques." },
      { question: "Quel est le coût d'un confortement de falaise à {city} ?", answer: "Le coût dépend de l'étendue de la falaise, de son accessibilité et des techniques requises. Un linéaire de 10m se situe généralement entre 3 000€ et 15 000€. Un diagnostic préalable gratuit est proposé à {city}." },
    ],
  },
  {
    id: 'travaux-barrages-hydrauliques',
    slug: 'travaux-barrages-hydrauliques',
    name: 'Travaux sur barrages et ouvrages hydrauliques',
    cluster: 'genie_civil',
    description: 'Inspection, réparation et maintenance des barrages, digues et ouvrages hydrauliques en accès difficile.',
    keywords: ['barrage cordiste', 'inspection barrage', 'maintenance digue', 'ouvrage hydraulique', 'réparation béton barrage'],
    metaTitle: 'Travaux sur Barrages & Ouvrages Hydrauliques à {city} — Cordiste',
    metaDesc: 'Inspection et maintenance de barrages et ouvrages hydrauliques à {city} par cordistes spécialisés. Habilitations spécifiques. Devis sur demande.',
    h1Template: 'Travaux sur Barrages & Ouvrages Hydrauliques à {city}',
    introTemplate: 'Les barrages et ouvrages hydrauliques requièrent des inspections régulières imposées par la réglementation française. Nos cordistes spécialisés à {city} réalisent les contrôles périodiques et les travaux de réparation sur des structures soumises à des contraintes d\'accès extrêmes.',
    faqs: [
      { question: "Quelle réglementation s'applique à l'inspection de barrages à {city} ?", answer: "Les barrages de classe A, B et C sont soumis à des visites techniques approfondies (VTA) réglementaires selon le décret du 11 décembre 2007. Nos cordistes réalisent ces inspections pour les gestionnaires d'ouvrages proches de {city}." },
      { question: "Vos cordistes interviennent-ils sous eau sur les barrages à {city} ?", answer: "Non, nous intervenons sur les parties aériennes inaccessibles des ouvrages. Pour les inspections subaquatiques, nous coordonnons nos interventions avec des équipes de plongeurs professionnels partenaires." },
      { question: "Quels types de réparations réalisez-vous sur barrages à {city} ?", answer: "Injection de fissures en béton, reprise d'étanchéité des joints de dilatation, remplacement d'organes de vidange, nettoyage et peinture anticorrosion des structures métalliques, inspection et maintenance des vannes." },
    ],
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
    introTemplate: 'Vous cherchez un professionnel pour le ravalement de votre façade à {city} ? Nos techniciens spécialisés en accès difficile interviennent sans nacelle ni échafaudage, ce qui réduit les coûts et les délais.',
    faqs: [
      { question: "Quel est le prix d'un ravalement de façade sans échafaudage à {city} ?", answer: "Le ravalement par cordiste à {city} coûte entre 20€ et 60€/m² selon l'état de la façade et les travaux requis (nettoyage, enduit, peinture). C'est en moyenne 30 à 40% moins cher qu'avec un échafaudage traditionnel." },
      { question: "Un ravalement de façade sans échafaudage est-il aussi qualitatif à {city} ?", answer: "Oui. Nos cordistes à {city} utilisent les mêmes matériaux et procédés qu'un ravalement traditionnel. La technique sur cordes est d'ailleurs recommandée pour les façades classées ou les bâtiments difficiles d'accès." },
      { question: "Le ravalement de façade est-il obligatoire à {city} ?", answer: "En France, le ravalement est obligatoire tous les 10 ans dans les communes de plus de 5 000 habitants. À {city}, un arrêté préfectoral peut imposer des délais d'exécution. Nos cordistes assurent la conformité réglementaire." },
    ],
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
    introTemplate: 'Votre toit est recouvert de mousse, de lichens ou de dépôts ? Nos spécialistes interviennent à {city} pour nettoyer, démoussage et traiter votre toiture, quelle que soit sa hauteur ou son accessibilité.',
    faqs: [
      { question: "Quel est le prix du démoussage de toiture à {city} ?", answer: "Le nettoyage et démoussage d'une toiture à {city} coûte entre 2€ et 8€/m² selon l'état d'encrassement. Pour une maison individuelle de 100m² de toiture, comptez entre 200€ et 800€, traitement hydrofuge inclus." },
      { question: "Le traitement hydrofuge est-il inclus dans le démoussage à {city} ?", answer: "Oui, nos cordistes à {city} appliquent systématiquement un traitement hydrofuge après le démoussage pour prévenir la repousse des mousses et lichens pendant 3 à 5 ans selon le produit utilisé." },
      { question: "Mon toit est-il accessible par cordiste à {city} ?", answer: "Tous types de toitures sont accessibles : tuiles, ardoises, bac acier, fibrociment. Nos cordistes à {city} s'adaptent aux toitures à forte pente (> 45°) inaccessibles sans équipement spécialisé." },
    ],
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
    introTemplate: 'Une fuite, des tuiles cassées ou une charpente fragilisée à {city} ? Nos couvreurs spécialisés interviennent en accès difficile pour réparer votre toiture rapidement, sans l\'installation coûteuse d\'un échafaudage.',
    faqs: [
      { question: "Puis-je faire réparer quelques tuiles sans échafaudage à {city} ?", answer: "Oui, c'est l'avantage principal de l'intervention cordiste à {city} : réparer 2 ou 3 tuiles cassées sans monter un échafaudage complet. L'intervention ciblée démarre à partir de 150€ et se fait en quelques heures." },
      { question: "Comment détecter une fuite de toiture avant d'appeler à {city} ?", answer: "Taches brunes sur les plafonds, odeur d'humidité, moisissures en combles, gonflement des lambris. Nos couvreurs-cordistes à {city} réalisent un diagnostic complet pour localiser la source exacte avant intervention." },
      { question: "Intervenez-vous en urgence pour les fuites de toiture à {city} ?", answer: "Oui. Notre réseau de couvreurs-cordistes à {city} propose des interventions express sous 24-48h pour les fuites actives. Un bâchage provisoire peut être posé en attendant la réparation définitive." },
    ],
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
    introTemplate: 'Pour la peinture de votre façade à {city}, nos peintres spécialisés en travaux en hauteur garantissent un rendu impeccable, même sur des surfaces difficiles d\'accès, sans nacelle ni échafaudage encombrant.',
    faqs: [
      { question: "Quel est le prix de la peinture de façade par cordiste à {city} ?", answer: "La peinture de façade par cordiste à {city} coûte entre 15€ et 40€/m² selon la préparation requise (rebouchage, primaire) et le nombre de couches. C'est moins cher qu'avec un échafaudage grâce à l'absence de montage/démontage." },
      { question: "Quelles peintures utilisez-vous pour les façades à {city} ?", answer: "Nos peintres-cordistes à {city} utilisent des peintures spécifiques façade : acryliques, minérales, siloxanes selon le substrat (béton, enduit, brique). Toutes sont certifiées pour la résistance aux UV et aux intempéries." },
      { question: "La peinture de façade nécessite-t-elle une déclaration de travaux à {city} ?", answer: "Un changement de couleur de façade peut nécessiter une déclaration préalable à la mairie de {city}, notamment en secteur sauvegardé ou ABF. Nos équipes vous informent des démarches selon votre adresse." },
    ],
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
    introTemplate: 'Des joints dégradés ou des fissures sur votre façade à {city} ? Nos maçons spécialisés en travaux en hauteur interviennent pour reprendre les joints, traiter les fissures et consolider vos façades sans nécessiter de structure d\'échafaudage lourde.',
    faqs: [
      { question: "Comment savoir si les joints de ma façade doivent être refaits à {city} ?", answer: "Les joints dégradés se reconnaissent à leur effritement, aux infiltrations d'eau qui en découlent ou aux mousses qui y prolifèrent. Nos maçons-cordistes à {city} réalisent un diagnostic visuel gratuit avant toute intervention." },
      { question: "Quel est le prix d'un rejointoiement de façade par cordiste à {city} ?", answer: "Le rejointoiement par cordiste à {city} coûte entre 15€ et 35€/m² selon la profondeur des joints et le type de mortier requis. Pour une façade de 50m², comptez entre 750€ et 1 750€, pose et matériaux inclus." },
      { question: "Les fissures de façade sont-elles dangereuses à {city} ?", answer: "Les microfissures sont généralement esthétiques. Les fissures actives (qui s'élargissent) ou traversantes indiquent un problème structurel. Nos maçons-cordistes à {city} évaluent la gravité et proposent le traitement adapté." },
    ],
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
    introTemplate: 'Réduisez vos factures d\'énergie avec une isolation thermique par l\'extérieur à {city}. Nos techniciens spécialisés posent votre ITE sans échafaudage traditionnel, ce qui peut réduire le coût global de votre projet jusqu\'à 40%.',
    faqs: [
      { question: "Peut-on poser une ITE sans échafaudage à {city} ?", answer: "Oui. Pour les bâtiments de 3 étages et plus à {city}, l'ITE par cordiste évite le montage d'un échafaudage coûteux. La technique sur cordes représente une économie de 30 à 40% sur le poste installation." },
      { question: "L'ITE est-elle éligible aux aides MaPrimeRénov' à {city} ?", answer: "Oui, l'isolation thermique par l'extérieur est éligible à MaPrimeRénov' et aux CEE à {city}, sous conditions de ressources et de recours à un artisan RGE. Nos partenaires RGE à {city} vous accompagnent dans les démarches." },
      { question: "Combien coûte une ITE par cordiste à {city} ?", answer: "Une ITE par cordiste à {city} revient entre 80€ et 200€/m² selon le système isolant (laine de roche, PSE, fibre de bois) et la finition choisie. Après aides MaPrimeRénov', le reste à charge peut être réduit de 25 à 75%." },
    ],
  },
  {
    id: 'nettoyage-gouttières',
    slug: 'nettoyage-gouttieres',
    name: 'Nettoyage de gouttières et chéneaux',
    cluster: 'grand_public',
    description: 'Débouchage, nettoyage et vérification de l\'étanchéité des gouttières et chéneaux sur maisons et immeubles.',
    keywords: ['nettoyage gouttières', 'débouchage gouttière', 'chéneau bouché', 'entretien gouttière', 'gouttière inaccessible'],
    metaTitle: 'Nettoyage de Gouttières à {city} — Débouchage Sans Échafaudage',
    metaDesc: 'Nettoyage et débouchage de gouttières à {city} par cordiste. Intervention rapide sur maisons et immeubles. Devis gratuit sous 48h.',
    h1Template: 'Nettoyage & Débouchage de Gouttières à {city}',
    introTemplate: 'Des gouttières bouchées peuvent causer d\'importants dégâts des eaux. Nos cordistes à {city} nettoient et débouchent vos gouttières et chéneaux en toute sécurité, sans pose d\'échafaudage, même sur les façades les plus hautes.',
    faqs: [
      { question: "Quel est le prix du nettoyage de gouttières par cordiste à {city} ?", answer: "Le nettoyage de gouttières par cordiste à {city} démarre à partir de 80€ pour une maison individuelle. Pour un immeuble de plusieurs étages, comptez entre 200€ et 600€ selon la longueur et l'état des chéneaux." },
      { question: "À quelle fréquence faire nettoyer ses gouttières à {city} ?", answer: "Un nettoyage annuel en automne est recommandé après la chute des feuilles. À {city}, si votre propriété est entourée d'arbres à proximité, un entretien biannuel (printemps et automne) est conseillé." },
      { question: "Le cordiste peut-il réparer une gouttière percée à {city} ?", answer: "Oui. En plus du nettoyage, nos cordistes à {city} diagnostiquent les fuites, soudures défaillantes et fixations lâches. Les petites réparations de gouttières sont réalisées lors de la même intervention." },
    ],
  },
];

// Contenu spécifique service×ville pour les 6 villes prioritaires
// Évite le pattern doorway (même texte hub réutilisé sur la page service)
export interface ServiceCityContext {
  intro: string
  useCases: string[]
}

export const SERVICE_CITY_CONTEXT: Record<string, Record<string, ServiceCityContext>> = {
  'nettoyage-facade': {
    'paris': { intro: "À Paris, les façades haussmanniennes en pierre de taille calcaire nécessitent des produits non-agressifs et une technique adaptée pour préserver le calcaire lutétien classé. Le nettoyage sans produits acides est impératif dans les secteurs ABF.", useCases: ["Immeuble haussmannien (5-7 étages) en pierre de taille", "Façade vitrée de la Défense (démoussage + sablage léger)", "Mur pignon en briques du Marais (traitement anti-graffitis)"] },
    'marseille': { intro: "À Marseille, les façades sont agressées par les embruns salins et le mistral. Le nettoyage doit être suivi d'un traitement hydrofuge spécifique milieu maritime pour garantir la durabilité sur les bâtiments du Vieux-Port et du littoral.", useCases: ["Immeuble résidentiel face au Vieux-Port (embruns + sel)", "Entrepôt portuaire en béton (dépôts calcaires + pollution)", "Villa calanques (démoussage roches + traitement lichens)"] },
    'lyon': { intro: "Lyon présente une grande variété de matériaux de façade : travertin de la Presqu'île, mâchefer de la Croix-Rousse, béton des tours de la Part-Dieu. Chaque type demande une technique et des produits adaptés que maîtrisent nos techniciens lyonnais.", useCases: ["Immeuble Presqu'île en travertin (nettoyage eau chaude)", "Façade tour tertiaire Part-Dieu (démoussage + polissage)", "Mur en mâchefer Croix-Rousse (nettoyage haute pression douce)"] },
    'bordeaux': { intro: "Bordeaux est mondialement reconnue pour ses façades blondes en pierre de taille girondine. Le nettoyage de ces calcaires coquilliers est une intervention patrimoniale délicate qui requiert des produits biocides spécifiques et une pression eau maîtrisée.", useCases: ["Hôtel particulier en pierre blonde centre historique UNESCO", "Façade de chai viticole en pierre et métal", "Immeuble résidentiel Chartrons (nettoyage + rejointoiement)"] },
    'toulouse': { intro: "La Ville Rose doit sa couleur aux briques foraines cuites localement. Leur nettoyage requiert des techniques douces (jet d'eau basse pression, savons pH neutre) pour ne pas abraser la surface et altérer la teinte caractéristique protégée aux abords des monuments.", useCases: ["Façade en briques foraines centre historique", "Bâtiment tertiaire en brique contemporain", "Mur mitoyen briques apparentes Capitole"] },
    'monaco': { intro: "En Principauté, les façades des résidences de luxe et palaces exigent une discrétion absolue et des produits haut de gamme. L'intervention doit être réalisée en dehors des heures de visibilité touristique pour les bâtiments emblématiques du Rocher.", useCases: ["Résidence de standing façade en marbre ou pierre polie", "Façade hôtel de luxe bord de mer (embruns + pollution)", "Immeuble résidentiel standing face au Port Hercule"] },
    'lille': { intro: "À Lille, les façades en briques rouges flamandes et en calcaire blanc du Nord accumulent mousses et lichens dans le climat humide des Hauts-de-France. Le nettoyage par cordiste est indispensable sur les pignons à redents inaccessibles aux nacelles.", useCases: ["Immeuble en briques flamandes Grand-Place (démoussage doux)", "Façade en calcaire blanc secteur Vieux-Lille (nettoyage eau froide)", "Bâtiment industriel reconverti (dépôts noirs + graffitis)"] },
    'nice': { intro: "À Nice, l'architecture Belle Époque de la Promenade des Anglais et du Vieux-Nice concentre des ornements en staff et des enduits colorés méditerranéens fragiles. Le nettoyage doit respecter ces matériaux tout en éliminant les efflorescences salines.", useCases: ["Hôtel Belle Époque Promenade des Anglais (staff + embruns)", "Façade baroque colorée Vieux-Nice (enduit ocre délicat)", "Immeuble résidentiel front de mer (dépôts salins + pollution)"] },
    'strasbourg': { intro: "Strasbourg allie façades à colombages de la Petite France, pierres de grès rose de la cathédrale et immeubles en béton du quartier européen. Chaque matériau requiert une approche technique différente maîtrisée par nos cordistes alsaciens.", useCases: ["Maison à colombages Petite France (nettoyage bois + torchis)", "Bâtiment institutionnel en grès rose (nettoyage délicat classé)", "Tour de verre quartier européen (façade rideau)"] },
  },
  'lavage-vitres': {
    'paris': { intro: "Paris concentre les plus grandes façades vitrées d'Europe : tours La Défense, atriums des galeries Haussmann, verrières des gares. Nos laveurs de vitres-cordistes parisiens maîtrisent les systèmes d'accès de chaque bâtiment.", useCases: ["Tour de bureaux La Défense (façade rideau 30+ étages)", "Atrium centre commercial (verrière intérieure)", "Façade vitrée immeuble haussmannien réhabilité"] },
    'marseille': { intro: "Les vitres marseillaises sont soumises aux dépôts salins des embruns méditerranéens et à la pollution portuaire. Un produit désincrustant spécifique est nécessaire avant le lavage standard pour éliminer les efflorescences salines.", useCases: ["Immeuble bord de mer Corniche Kennedy (dépôts salins)", "Bâtiment tertiaire Euroméditerranée (vitrages haute performance)", "Centre commercial Grand Littoral (verrière intérieure)"] },
    'lyon': { intro: "Lyon concentre de nombreuses tours tertiaires en façade rideau autour de la Part-Dieu et des verrières industrielles reconverties en lofts à la Confluence. Nos cordistes lyonnais interviennent en toute sécurité même sur les vitrages inclinés ou complexes.", useCases: ["Tour tertiaire Part-Dieu (façade rideau vitrée)", "Verrière loft Confluence (vitrage incliné et structure acier)", "Atrium immeuble de bureaux Gerland"] },
    'toulouse': { intro: "L'agglomération toulousaine accueille de nombreux campus aéronautiques et technologiques dotés de grandes facades vitrées. Nos cordistes interviennent sans perturber l'activité industrielle sur les sites Airbus, CNES et les zones tertiaires de la Cartoucherie.", useCases: ["Façade vitrée campus aéronautique (accès technique)", "Centre de R&D technologique (vitrage haute performance)", "Bâtiment tertiaire Cartoucherie (baies vitrées toutes faces)"] },
    'lille': { intro: "Lille et Euralille concentrent les plus grandes surfaces vitrées du Nord : tours WTC, Euralille, Eurosante. Le climat humide génère des dépôts de pollution urbaine et de condensation qui nécessitent un entretien régulier par cordistes.", useCases: ["Tour WTC Lille (façade rideau haute)", "Centre commercial Euralille (verrière intérieure)", "CHU Eurosante (vitrage médical propre réglementé)"] },
    'bordeaux': { intro: "La Rive Droite et les nouvelles ZAC bordelaaises (Bastide Niel, Darwin) concentrent une architecture contemporaine à large usage de verre. Nos cordistes interviennent sur ces immeubles récents tout en respectant les contraintes ABF du secteur UNESCO voisin.", useCases: ["Immeuble contemporain Bastide Niel (vitrage architectural)", "Entrepôt Darwin réhabilité (verrière béton-verre)", "Tour résidentielle rive droite (baies panoramiques)"] },
    'nice': { intro: "Nice possède un parc hôtelier et résidentiel de standing unique sur la Côte d'Azur. Les baies vitrées des palaces et des résidences de luxe nécessitent un lavage fréquent du fait des dépôts salins et des pollutions liées à la densité touristique.", useCases: ["Palace 5 étoiles Promenade des Anglais (baies panoramiques)", "Résidence de luxe vue mer Cap de Nice (vitrage grand format)", "Immeuble tertiaire aéroport Nice Côte d'Azur (façade rideau)"] },
    'strasbourg': { intro: "Le quartier européen de Strasbourg regroupe le Parlement, la Cour européenne des droits de l'homme et des dizaines d'immeubles diplomatiques aux exigences d'entretien très strictes. Nos cordistes interviennent selon les protocoles de sécurité spécifiques à ces sites.", useCases: ["Bâtiment institutionnel européen (protocole sécurité renforcé)", "Tour de verre quartier Wacken (façade rideau)", "Centre hospitalier universitaire (vitrage médical réglementé)"] },
    'metz': { intro: "Metz dispose d'un parc immobilier culturel et institutionnel remarquable : le Centre Pompidou-Metz avec ses vastes verrières en shingles de bois, la gare de Metz de style Jugendstil et les nombreux bâtiments tertiaires récents du quartier de l'Amphithéâtre. Nos cordistes messins assurent un lavage régulier sur ces vitrages architecturaux complexes et sur les façades vitrées de la Technopole de Metz.", useCases: ["Verrières Centre Pompidou-Metz (vitrage architectural complexe, accès spécifique)", "Façade vitrée bâtiment tertiaire Technopole de Metz (lavage régulier)", "Bâtiments institutionnels et culturels messins (vitrage patrimonial)"] },
    'default': { intro: "Le lavage de vitres en hauteur par cordiste est la solution idéale pour les bâtiments de plus de 3 étages. Nos techniciens utilisent des perches télescopiques et des produits certifiés pour un résultat impeccable sans trace.", useCases: ["Immeuble de bureaux (façade vitrée standard)", "Centre commercial (verrière et atriums)", "Résidence de standing (baies vitrées toutes faces)"] },
  },
  'ravalement-facade': {
    'paris': { intro: "À Paris, le ravalement de façade est encadré par l'arrêté municipal qui oblige les propriétaires à ravaler leur immeuble tous les 10 ans. Dans les secteurs protégés (75% de Paris), les matériaux et teintes sont imposés par les ABF, ce qui rend indispensable l'intervention de cordistes spécialisés en patrimoine.", useCases: ["Immeuble haussmannien (ravalement pierre + rejointoiement)", "Façade en béton des années 70 (traitement fissures + peinture)", "Copropriété secteur ABF (enduit à la chaux + teinte imposée)"] },
    'marseille': { intro: "À Marseille, le ravalement doit impérativement intégrer un traitement anti-sel pour contrer l'agression permanente des embruns. Les immeubles du Vieux-Port et du 13e arrondissement nécessitent des enduits de façade spécifiques aux conditions méditerranéennes.", useCases: ["Immeuble résidentiel bord de mer (enduit hydrofuge marin)", "Bâtiment haussmannien Vieux-Port (ravalement pierre + hydrofuge)", "Copropriété secteur industrial Nord (béton + peinture anticorrosion)"] },
    'lyon': { intro: "Lyon impose ses propres règles de ravalement sur les 500 ans de patrimoine bâti de la Presqu'île classée UNESCO. Le travertin, le granit et les façades à meneaux du Vieux-Lyon demandent des artisans-cordistes capables d'allier technique et respect patrimonial.", useCases: ["Immeuble travertin Presqu'île (ravalement pierre douce)", "Façade Renaissance Vieux-Lyon (enduit chaux + teinté)", "Tour béton Part-Dieu (ragréage + peinture façade)"] },
    'bordeaux': { intro: "Bordeaux entretient son label UNESCO grâce à des ravalements stricts encadrés par les ABF. La pierre de taille girondine, poreuse et sensible aux mousses, nécessite un nettoyage préalable, un traitement biocide, puis un rejointoiement à la chaux naturelle.", useCases: ["Hôtel particulier pierre de taille (nettoyage + rejointoiement chaux)", "Immeuble résidentiel Chartrons (ravalement complet + hydrofuge)", "Entrepôt Bacalan réhabilité (façade mixte pierre-métal)"] },
    'toulouse': { intro: "Le ravalement des briques foraines toulousaines est une spécialité locale : les joints doivent être refaits à la chaux aérienne pour respirer, et la teinte rose caractéristique préservée selon les exigences des Bâtiments de France du centre historique.", useCases: ["Immeuble en briques foraines centre (rejointoiement chaux aérienne)", "Façade mixte brique-béton périphérie (ravalement complet)", "Monument historique aux abords Capitole (restauration brique)"] },
    'lille': { intro: "À Lille, le ravalement des façades flamandes en briques rouges est une opération délicate : les joints anciens à la chaux ne doivent pas être remplacés par du ciment (risque de remontées d'humidité). Nos cordistes lillois maîtrisent les techniques de réfection à l'ancienne.", useCases: ["Maison flamande briques rouges (rejointoiement chaux naturelle)", "Immeuble haussmannien lillois (ravalement calcaire + enduit)", "Bâtiment industriel reconverti (façade mixte brique-acier)"] },
    'nice': { intro: "À Nice, les façades colorées du Vieux-Nice et de la Belle Époque sont protégées par un plan de colorimétrie stricte. Le ravalement doit respecter les teintes ocres, roses et jaune-sable imposées, appliquées en enduit à la chaux taloché traditionnel.", useCases: ["Façade baroque Vieux-Nice (enduit chaux taloché + teinte imposée)", "Immeuble Belle Époque Promenade (staff + corniche restaurée)", "Résidence contemporaine bord de mer (enduit monocouche hydrofuge)"] },
    'strasbourg': { intro: "Strasbourg encadre strictement le ravalement dans son périmètre UNESCO de la Grande-Île. Le grès rose des Vosges des façades historiques requiert des techniques de nettoyage spécifiques et des enduits compatibles avec la chaux de Bourgogne traditionnellement utilisée.", useCases: ["Maison à colombages (ravalement torchis + badigeon chaux)", "Façade en grès rose (nettoyage micro-gommage + consolidation)", "Immeuble Art Nouveau (restauration staff + peinture minérale)"] },
    'orleans': { intro: "Orléans se distingue par l'omniprésence du tuffeau, une craie calcaire tendre extraite des falaises ligériennes, caractéristique de l'architecture de la vallée de la Loire classée UNESCO. Ce matériau poreux accumule les mousses et les lichens rapidement. Le ravalement par cordiste permet d'accéder aux façades des hôtels particuliers du centre-ville historique sans échafaudage dans les rues piétonnes.", useCases: ["Hôtel particulier en tuffeau centre-ville Orléans (ravalement + traitement biocide compatible)", "Immeuble résidentiel patrimoine ligérien (rejointoiement chaux + hydrofuge)", "Bâtiment tertiaire ou universitaire Orléans (façade béton + peinture extérieure)"] },
    'default': { intro: "Le ravalement de façade par cordiste permet d'intervenir sans échafaudage sur les immeubles de 3 étages et plus. Nos techniciens réalisent le diagnostic, le nettoyage, le traitement des fissures, l'application d'enduit et la peinture extérieure.", useCases: ["Immeuble résidentiel (enduit monocouche + peinture)", "Bâtiment tertiaire (ravalement béton + résine)", "Copropriété (réfection complète joints + enduit)"] },
  },
  'maintenance-eolienne': {
    'paris': { intro: "L'Île-de-France développe des parcs éoliens en grande couronne et des éoliennes urbaines en toiture. Nos techniciens éoliens interviennent sur les turbines onshore de Seine-et-Marne, de l'Essonne et du Val-d'Oise.", useCases: ["Éolienne onshore parc Seine-et-Marne", "Turbine urbaine toiture bâtiment tertiaire", "Éolienne de démonstration site industriel"] },
    'nantes': { intro: "La Loire-Atlantique est à la pointe de l'éolien en France : le parc offshore de Saint-Nazaire, premier parc en mer français, est visible depuis Nantes, et les parcs onshore du bocage vendéen et du pays de Retz représentent une part croissante de la production régionale. Nos techniciens certifiés GWO interviennent sur les turbines onshore et coordonnent les interventions sur les machines offshore avec les opérateurs maritimes.", useCases: ["Éolienne onshore parc pays de Retz ou bocage vendéen (inspection pales + nacelle)", "Turbine en zone littorale (traitement anticorrosion mât et nacelle)", "Coordination maintenance éolien offshore Saint-Nazaire (pales composites)"] },
    'default': { intro: "La maintenance éolienne exige des techniciens certifiés GWO (Global Wind Organisation) en plus de leur certification cordiste. Nos équipes interviennent sur tous types d'éoliennes : onshore, offshore, turbines urbaines.", useCases: ["Inspection de pales composite (fissures, délaminage)", "Réparation naisselle et changement de composants", "Peinture anticorrosion de mât"] },
  },
  'silos-cheminees': {
    'tours': { intro: "La Touraine est l'une des premières régions céréalières du Centre-Val de Loire. Les silos agricoles de l'agglomération tourangelle — blé tendre, maïs, tournesol — sont des structures métalliques imposantes nécessitant des inspections régulières pour prévenir la corrosion et les risques ATEX. Nos cordistes interviennent également sur les cheminées des anciennes usines de la vallée de la Loire et les installations thermiques des bâtiments publics tourangeaux.", useCases: ["Silo céréalier agricole Indre-et-Loire (inspection parois + purge résidus)", "Cheminée industrielle site de la vallée de la Loire (inspection + peinture anticorrosion)", "Silo de centrale à béton (nettoyage + étanchéité couverture)"] },
    'brest': { intro: "L'économie de Brest repose sur la Marine Nationale et un tissu industriel naval important. Les cheminées des installations de chauffage de l'Arsenal, les silos des coopératives agricoles du Finistère et les structures tubulaires des ports de pêche constituent les interventions les plus fréquentes. Le climat océanique breton accélère la corrosion des structures métalliques, rendant les inspections préventives indispensables.", useCases: ["Cheminée industrielle Arsenal de Brest (inspection + rejointoiement)", "Silo coopérative agricole Finistère (nettoyage intérieur espace confiné + purge)", "Tour de ventilation port de commerce (inspection CND + peinture anticorrosion)"] },
    'grenoble': { intro: "La région grenobloise abrite d'importantes installations industrielles : CEA de Cadarache, STMicroelectronics, chimie de spécialité. Les cheminées de leurs unités de production et les silos des coopératives agricoles du Grésivaudan nécessitent une expertise particulière en milieu alpin, où les cycles gel-dégel et la neige accélèrent la dégradation des structures. Nos cordistes grenoblois sont formés à l'intervention sur structures métalliques en conditions hivernales.", useCases: ["Cheminée d'usine chimique ou électronique (inspection + revêtement anticorrosion)", "Silo de malterie ou coopérative agricole Isère (nettoyage + consolidation structure)", "Tour aéraulique industrielle zone Crolles/Meylan (inspection technique réglementaire)"] },
  },
  'pose-enseignes-hauteur': {
    'metz': { intro: "Metz est une ville-étape commerciale majeure du Grand Est, avec un hyper-centre structuré autour de la Porte Serpenoise et du Centre Saint-Jacques. La pose d'enseignes sur les façades en pierre de Jaumont, un calcaire doré typique de la Moselle, requiert des techniques de fixation douces pour préserver ce matériau classé. Nos cordistes interviennent également sur les grandes enseignes commerciales des zones périphériques et la signalétique du Centre Pompidou-Metz.", useCases: ["Enseigne sur façade pierre de Jaumont centre-ville (fixation non-invasive)", "Grand format commercial zone Metz Nord / Actisud (installation en hauteur)", "Signalétique institutionnelle (Centre Pompidou-Metz, bâtiments publics)"] },
    'rouen': { intro: "Rouen est une place commerciale historique de Normandie avec un cœur ancien dense en colombages et un tissu industriel et logistique développé le long de la vallée de la Seine. La pose d'enseignes en milieu patrimonial requiert des techniques de fixation adaptées aux pans de bois et façades historiques classées. Nos cordistes normands interviennent également sur les zones d'activités de la couronne rouennaise.", useCases: ["Enseigne sur colombage Vieux-Rouen (fixation patrimoniale non-invasive)", "Grand format commercial axe Seine (zone logistique Rouen)", "Signalétique industrielle zone portuaire (hauteur + accessibilité restreinte)"] },
  },
  'couverture-reparation': {
    'nantes': { intro: "Nantes est marquée par les toitures en ardoise d'Anjou, caractéristiques du patrimoine ligérien classé UNESCO. Les éco-quartiers récents de l'Île de Nantes et les réhabilitations d'entrepôts industriels génèrent aussi des interventions sur matériaux contemporains (zinc, bac acier, toiture-terrasse). Le climat océanique nantais, humide et venté, fragilise les joints et tuiles en rive, entraînant des fuites récurrentes.", useCases: ["Toiture ardoise immeuble haussmannien nantais (remplacement ponctuel + rejointoiement)", "Étanchéité toiture-terrasse éco-quartier Île de Nantes (réparation joints + relevés)", "Couverture zinc entrepôt réhabilité Chantenay (soudures, solins et noues)"] },
  },
  'nettoyage-toiture': {
    'clermont-ferrand': { intro: "Clermont-Ferrand se distingue par ses immeubles en pierre de Volvic, une lave volcanique sombre et poreuse qui accumule les mousses et lichens deux fois plus vite que les pierres calcaires. Le nettoyage de ces toitures requiert des produits biocides compatibles avec la pierre volcanique pour ne pas éroder sa surface. Nos cordistes clermontois interviennent également sur les toitures industrielles des usines du bassin manufacturier auvergnate.", useCases: ["Toiture en pierre de Volvic (nettoyage doux + traitement biocide compatible lave)", "Toiture industrielle usine bassin auvergnate (démoussage haute pression)", "Couverture ardoise patrimoine clermontois (nettoyage eau froide + hydrofuge durable)"] },
  },
  'isolation-exterieure': {
    'lille': { intro: "Lille et sa métropole concentrent un parc immobilier dense en briques rouges du XIXe et XXe siècle, énergivore et prioritaire dans les programmes de rénovation thermique des Hauts-de-France. L'ITE par cordiste évite le montage d'échafaudages dans les rues étroites du Vieux-Lille et des courées, et s'impose pour les immeubles collectifs de 5 étages et plus où les aides MaPrimeRénov' sont accessibles.", useCases: ["Immeuble en briques rouges Vieux-Lille (ITE sans échafaudage en rues étroites)", "Copropriété 5+ étages Hellemmes / Roubaix (isolation PSE + enduit de finition)", "Bâtiment collectif métropole lilloise (audit thermique + ITE subventionnée CEE)"] },
  },
  'confortement-falaises': {
    'montpellier': { intro: "La périphérie de Montpellier est traversée par les gorges du Hérault et les causses du Larzac, des formations calcaires fragmentées par les cycles de sécheresse et de pluies méditerranéennes. Les propriétaires de maisons en pied de falaise, les gestionnaires de voies départementales et les communes de l'Hérault font régulièrement appel à nos cordistes pour sécuriser talus et parois rocheuses menaçantes.", useCases: ["Paroi calcaire gorges de l'Hérault (purge rocheuse + pose grillage plaqué)", "Talus routier RD34 / RD986 héraultais (confortement + clouage de roche)", "Falaise résidentielle secteur causse montpelliérain (filet pare-blocs dynamiques)"] },
  },
  'cnd-controle-non-destructif': {
    'lille': { intro: "La métropole lilloise concentre un tissu industriel dense : Stellantis à Douvrin, ArcelorMittal et Total sur le littoral Nord, sans oublier les infrastructures ferroviaires du TGV Nord et les ouvrages d'art du réseau autoroutier. Nos inspecteurs-cordistes certifiés COFREND interviennent sur ces structures inaccessibles par voie conventionnelle, notamment charpentes acier, réservoirs de stockage et viaducs.", useCases: ["Charpente métallique site industriel métropole lilloise (contrôle UT + VT)", "Réservoir de stockage chimique zone Nord (inspection CND complète)", "Ouvrage d'art viaduc A25 Lille (inspection visuelle + magnétoscopie surfaces)"] },
  },
  'toiture-zinguerie': {
    'nancy': { intro: "Nancy est la capitale mondiale de l'Art Nouveau, avec un patrimoine de toitures en zinc, cuivre et ardoise d'une richesse exceptionnelle. L'entretien des couvertures des hôtels particuliers de la place Stanislas, des immeubles de l'École de Nancy et des cheminées d'usines lorraines constitue le cœur de l'activité de nos cordistes nancéens, formés aux techniques de la zinguerie patrimoniale.", useCases: ["Toiture cuivre ou zinc hôtel particulier secteur Stanislas (réfection + soudures à l'étain)", "Cheminée industrielle lorraine (inspection + rejointoiement + traitement anticorrosion)", "Couverture ardoise immeuble Art Nouveau (remplacement ponctuel + noues étanchées)"] },
  },
  'securisation-anti-pigeons': {
    'marseille': { intro: "Marseille subit une prolifération de pigeons parmi les plus importantes de France, favorisée par le relief, la chaleur et la densité du bâti ancien. Les abords du Vieux-Port, du Panier et de la Canebière sont les plus exposés. Nos cordistes marseillais posent des systèmes anti-pigeon (pics inox, filets, câbles tendus) sur corniches, toitures et façades en accès difficile, sans endommager les ornements architecturaux.", useCases: ["Façade ornementée secteur Vieux-Port (pics inox sur corniches inaccessibles aux nacelles)", "Toiture immeuble Panier (filet anti-pigeon + collecteurs fientes)", "Bâtiment tertiaire Euroméditerranée (câbles tendus en toiture-terrasse)"] },
  },
}

export function getServiceCityContext(serviceSlug: string, citySlug: string): ServiceCityContext | null {
  return SERVICE_CITY_CONTEXT[serviceSlug]?.[citySlug]
    ?? SERVICE_CITY_CONTEXT[serviceSlug]?.['default']
    ?? null
}

