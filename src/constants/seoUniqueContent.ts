export interface UniqueLocalContent {
    slug: string;
    hubTitle: string;
    paragraph1: string;
    paragraph2: string;
    metaDescription?: string;
    reglementationLocale?: { title: string; content: string };
    tarifsLocaux?: { min: number; max: number; context: string };
    projetsTypes?: { titre: string; description: string }[];
}

export const SEO_EDITORIAL_DB: Record<string, UniqueLocalContent> = {
    'monaco': {
        slug: 'monaco',
        hubTitle: "Discrétion et sécurité absolue : L'accès sur cordes en Principauté",
        paragraph1: "La Principauté de Monaco possède l'une des plus fortes densités d'Immeubles de Grande Hauteur (IGH) et d'infrastructures de luxe au monde. L'utilisation d'échafaudages ou de nacelles y est souvent proscrite pour des raisons esthétiques, de sécurité touristique et d'encombrement des voies.",
        paragraph2: "Nos cordistes hautement certifiés interviennent avec une discrétion totale sur les façades des palaces, les navires de luxe au port Hercule, ou pour la maintenance structurelle des tours résidentielles, tout en respectant les normes souveraines rigoureuses.",
        reglementationLocale: {
            title: "Réglementation en Principauté de Monaco",
            content: "Monaco applique ses propres normes souveraines indépendantes du droit français. La Direction de l'Urbanisme impose des autorisations préalables strictes pour toute intervention en façade sur les bâtiments classés ou en zone de protection. Les travaux sur les tours résidentielles (Odéon, Testimonio) nécessitent une validation par la Mairie et le promoteur. Les cordistes opérant sur des navires au Port Hercule relèvent de la réglementation maritime de l'Administration des Ports."
        },
        tarifsLocaux: {
            min: 600,
            max: 1200,
            context: "Marché ultra-premium : Monaco affiche les tarifs les plus élevés d'Europe pour les travaux en hauteur. Le surcoût (vs province française) s'explique par les contraintes logistiques de la Principauté, les exigences de discrétion des clients et la rareté des cordistes habilités à opérer sur site sensible."
        },
        projetsTypes: [
            { titre: "Façades de palaces et hôtels de luxe", description: "Nettoyage et entretien des façades en pierre naturelle et verre des palaces du Carré d'Or (Hôtel de Paris, Hermitage), sans perturbation visuelle ni fermeture de terrasses." },
            { titre: "Maintenance navires et infrastructures Port Hercule", description: "Inspection et nettoyage des superstructures de yachts de luxe et des quais d'accostage, avec habilitations maritimes et protocoles de sécurité portuaire." },
            { titre: "Tours résidentielles (Odéon, Tour Testimonio)", description: "Entretien des bardages vitrés et nettoyage des terrasses suspendues des tours résidentielles de grande hauteur, en coordination avec les syndics de copropriété." }
        ]
    },
    'paris': {
        slug: 'paris',
        hubTitle: "Excellence sur nacelle impossible : au cœur de l'Île-de-France",
        paragraph1: "Dans une capitale où la densité urbaine et la préservation de l'architecture historique (comme la pierre de taille haussmannienne) rendent l'installation d'échafaudages extrêmement coûteuse et bloquante, le recours aux cordistes parisiens est une nécessité stratégique.",
        paragraph2: "Que ce soit pour les atriums vitrés de La Défense ou la réfection de toitures en zinc dans le Marais, nos équipes interviennent avec discrétion et rapidité, sans empiéter sur l'espace public ni nécessiter de lourdes démarches administratives.",
        metaDescription: "Cordistes certifiés CQP/IRATA à Paris pour façades haussmanniennes, atriums de La Défense et toitures en zinc du Marais. Devis gratuit sous 48h, sans échafaudage.",
        reglementationLocale: {
            title: "Réglementation à Paris (75)",
            content: "Les travaux en façade dans Paris intra-muros sont soumis à l'avis de l'Architecte des Bâtiments de France (ABF) pour tout immeuble situé dans un périmètre de 500 m autour d'un monument historique — ce qui représente la quasi-totalité du centre. Le Service Technique de la Propreté de Paris (STPP) régit les interventions sur voie publique. Les ravalements de façades classées requièrent un permis de construire spécifique (art. R421-17 du Code de l'urbanisme). Les cordistes parisiens doivent être à jour des procédures PPSPS et du plan de prévention de la Mairie."
        },
        tarifsLocaux: {
            min: 450,
            max: 800,
            context: "Marché premium : Paris affiche des tarifs 25 à 35 % supérieurs à la province, en raison du coût de la vie, des contraintes logistiques (stationnement, livraison de matériel) et de la forte demande des copropriétés haussmanniennes et des sièges sociaux de La Défense."
        },
        projetsTypes: [
            { titre: "Nettoyage façades haussmanniennes en pierre de taille", description: "Traitement non-destructif (jet basse pression, nettoyage chimique doux) des façades en pierre de Paris des arrondissements centraux, en conformité avec les prescriptions ABF." },
            { titre: "Entretien verrières et atriums de La Défense", description: "Lavage et maintenance des grandes façades vitrées des tours de bureaux (Areva, Total, La Défense Arena), inaccessibles aux nacelles en raison des contraintes de circulation du CNIT et des parvis." },
            { titre: "Réfection toitures zinc et entretien gouttières (Marais, Montmartre)", description: "Intervention en cordes sur les toitures en zinc à forte pente des immeubles du Marais et de Montmartre, pour remplacement de section de gouttières, noues et solins sans passage par les appartements." }
        ]
    },
    'marseille': {
        slug: 'marseille',
        hubTitle: "Défis méditerranéens et zones industrialo-portuaires",
        paragraph1: "Le climat méditerranéen exigeant, soumis au mistral et aux embruns salins, accélère la dégradation des façades et infrastructures de la cité phocéenne. L'accès sur cordes permet une intervention immédiate pour purger ou sécuriser ces structures fragiles.",
        paragraph2: "Du grand port maritime de Marseille aux calanques inaccessibles, nos techniciens certifiés répondent aux exigences des chantiers navals, des silos céréaliers et des rénovations de copropriétés avec un niveau de sécurité optimal.",
        metaDescription: "Cordistes à Marseille pour façades exposées au mistral, chantiers navals du Grand Port et silos céréaliers. Techniciens CQP/IRATA, devis gratuit 48h.",
        reglementationLocale: {
            title: "Réglementation à Marseille (13)",
            content: "La zone portuaire de Marseille (Grand Port Maritime de Marseille) est soumise à une réglementation de sécurité spécifique : badge GMRF obligatoire pour toute intervention sur les terminaux. Les sites pétrochimiques de Fos-sur-Mer (zona Seveso seuil haut) imposent des plans de prévention et habilitations ATEX. Le PPRI (Plan de Prévention des Risques Inondation) Huveaune et Caravelle contraint les interventions en zones basses. Les travaux sur les bâtiments du secteur sauvegardé (Le Panier) sont soumis à l'avis ABF."
        },
        tarifsLocaux: {
            min: 350,
            max: 620,
            context: "Marché dynamique avec forte demande issue du secteur industrialo-portuaire. Les interventions sur sites classés SEVESO ou en zone portuaire réglementée impliquent un surcoût de 15 à 25 % lié aux habilitations et équipements de protection spécifiques."
        },
        projetsTypes: [
            { titre: "Nettoyage et démoussage façades exposées au mistral et aux embruns", description: "Traitement hydrofuge et démoussage des façades des immeubles des quartiers Malmousque, Endoume et Corniche exposés aux embruns salins, avec produits compatibles classement patrimonial." },
            { titre: "Inspection et maintenance silos céréaliers du Grand Port", description: "Intervention en accès difficile sur les silos verticaux du port autonome (hauteur 30 à 60 m) pour inspection structurelle (CND), remplacement de passerelles et traitement anticorrosion." },
            { titre: "Rénovation façades copropriétés Euroméditerranée", description: "Ravalement et isolation par l'extérieur (ITE) sur les immeubles des quartiers en rénovation Arenc et Joliette, sans fermeture de voie en coordination avec la SEM Euroméditerranée." }
        ]
    },
    'lyon': {
        slug: 'lyon',
        hubTitle: "Pôle industriel dynamique et patrimoine rhodanien",
        paragraph1: "La configuration singulière de Lyon, entre ses collines (Fourvière, Croix-Rousse) et son tissu urbain hyper-dense, favorise l'expertise des travaux en hauteur. Les ruelles étroites empêchent fréquemment l'utilisation de nacelles élévatrices.",
        paragraph2: "De la vallée de la chimie aux tours tertiaires de la Part-Dieu, notre réseau de cordistes lyonnais maîtrise l'ensemble des normes industrielles (CND, risques chimiques) et des contraintes de rénovation du patrimoine protégé de la Presqu'île.",
        metaDescription: "Cordistes à Lyon : travaux en hauteur sur les collines de Fourvière, Croix-Rousse, vallée de la chimie et tours de la Part-Dieu. CQP/IRATA, devis sous 48h.",
        reglementationLocale: {
            title: "Réglementation à Lyon (69)",
            content: "Le site patrimonial de Lyon (Presqu'île, Vieux-Lyon, collines) est classé UNESCO depuis 1998, rendant l'avis ABF obligatoire pour tout ravalement ou modification de façade dans le périmètre. La Vallée de la Chimie (Pierre-Bénite, Saint-Fons) regroupe des sites SEVESO seuil haut exigeant habilitations ATEX et plans de prévention spécifiques. La Métropole de Lyon applique un PLU-H restrictif avec permis de ravalements obligatoires pour toute modification de teinte ou matériau."
        },
        tarifsLocaux: {
            min: 380,
            max: 660,
            context: "Deuxième marché de France par la taille, Lyon présente des tarifs modérément supérieurs à la province standard. Les interventions en milieu industriel (vallée de la chimie) et sur sites classés UNESCO impliquent des majorations liées aux certifications requises."
        },
        projetsTypes: [
            { titre: "Nettoyage traboules et cours intérieures Vieux-Lyon", description: "Intervention sur cordes dans les traboules du Vieux-Lyon (secteur Renaissance classé UNESCO) pour nettoyage de voûtes et façades intérieures inaccessibles aux engins mécaniques, sous supervision ABF." },
            { titre: "Maintenance tuyauteries et structures industrielles Vallée de la Chimie", description: "Calorifugeage, inspection CND et remplacement de sections de tuyauteries sur les installations de Rhodia, Arkema et Solvay, avec habilitations ATEX et procédures PPRT strictes." },
            { titre: "Entretien façades vitrées tours tertiaires Part-Dieu", description: "Lavage et maintenance des surfaces vitrées des tours de bureaux du quartier Part-Dieu (tour Incity, tour Oxygène) par équipes cordistes, sans perturbation des flux piétons." }
        ]
    },
    'bordeaux': {
        slug: 'bordeaux',
        hubTitle: "Restauration Gironde : Pierre de taille et cuveries",
        paragraph1: "Renommée pour ses façades blondes en pierre de taille, Bordeaux impose des interventions de nettoyage et de démoussage méticuleuses. Le travail sur corde permet une action non-destructive idéale pour sauvegarder ce patrimoine UNESCO.",
        paragraph2: "Nos cordistes girondins opèrent également dans le milieu viticole environnant et le secteur maritime, assurant la maintenance sans perturber l'activité économique vitale de la région Nouvelle-Aquitaine.",
        metaDescription: "Cordistes à Bordeaux : nettoyage non-destructif des façades en pierre de taille UNESCO, cuveries viticoles et secteur maritime. Experts CQP/IRATA, devis 48h.",
        reglementationLocale: {
            title: "Réglementation à Bordeaux (33)",
            content: "Le secteur sauvegardé de Bordeaux — classé au Patrimoine Mondial de l'UNESCO depuis 2007 — impose un Plan de Sauvegarde et de Mise en Valeur (PSMV) extrêmement strict. Tout ravalement de façade requiert un permis de construire et l'avis de l'ABF. L'Aire de Mise en Valeur de l'Architecture et du Patrimoine (AVAP) Bordeaux impose des matériaux et techniques spécifiques (pas de nettoyage abrasif). Les travaux dans la zone portuaire Bacalan relèvent de la réglementation du Grand Port Maritime de Bordeaux."
        },
        tarifsLocaux: {
            min: 360,
            max: 630,
            context: "Marché dynamique porté par la forte demande de ravalements et nettoyages de façades en pierre de taille dans le périmètre UNESCO (environ 1 800 ha). Les travaux en vignoble (grands châteaux du Médoc, Saint-Émilion) constituent un segment premium avec des tarifs majorés de 10 à 20 %."
        },
        projetsTypes: [
            { titre: "Ravalement et nettoyage façades en pierre de taille UNESCO", description: "Traitement doux (microgommage, nettoyage basse pression) des façades calcaires blondes du Triangle d'Or et des Chartrons, en conformité stricte avec les prescriptions du PSMV et de l'ABF." },
            { titre: "Maintenance cuves inox et charpentes métalliques chais viticoles", description: "Inspection, nettoyage et traitement anticorrosion des grandes cuves inox et structures métalliques des châteaux viticoles du Médoc et de Pomerol, inaccessibles aux engins au sol." },
            { titre: "Entretien infrastructures portuaires Bassins à Flot", description: "Intervention sur les ouvrages de maçonnerie et de métal du quartier Bacalan (Cité du Vin, pont levant) et des anciens bassins portuaires en réhabilitation." }
        ]
    },
    'toulouse': {
        slug: 'toulouse',
        hubTitle: "L'aéronautique et la brique rose occitane",
        paragraph1: "Dans la Ville Rose, la préservation des façades en briques foraines et des monuments historiques nécessite le savoir-faire précis de maçons-cordistes qualifiés, évitant l'encombrement logistique dans le centre-ville historique.",
        paragraph2: "Parallèlement, l'industrie aéronautique toulousaine sollicite continuellement nos techniciens pour des inspections (CND) ou de la petite maintenance sur des infrastructures colossales impossibles à échafauder.",
        metaDescription: "Cordistes à Toulouse pour la brique rose du centre historique et les infrastructures aéronautiques. Inspections CND, façades, toiture. Devis gratuit 48h.",
        reglementationLocale: {
            title: "Réglementation à Toulouse (31)",
            content: "Le centre historique de Toulouse est protégé par un secteur sauvegardé et une AVAP imposant l'avis ABF pour toute intervention sur les briques foraines caractéristiques. Les zones aéronautiques (Airbus à Blagnac, Colomiers) sont classées Zone de Sécurité Aéroportuaire — les cordistes y interviennent sous badge Airpass et plan de prévention Airbus. Les sites chimiques de la couronne toulousaine (AZF Sud) relèvent des PPRT avec périmètre d'exposition aux risques."
        },
        tarifsLocaux: {
            min: 350,
            max: 590,
            context: "Marché équilibré avec deux segments distincts : façades patrimoniales en centre-ville (tarifs standards) et industrie aéronautique/spatiale (tarifs majorés de 20 à 30 % en raison des habilitations et délais d'accès aux zones sécurisées Airbus/ArianeGroup)."
        },
        projetsTypes: [
            { titre: "Nettoyage et réfection façades en briques foraines centre historique", description: "Traitement non-abrasif des façades en briques foraines des immeubles toulousains (Capitole, quartier Saint-Étienne), avec jointoiement et consolidation ponctuelle sous prescription ABF." },
            { titre: "Inspection CND et maintenance hangars aéronautiques (Airbus, Latécoère)", description: "Contrôle non-destructif par magnétoscopie et ultrasons sur les charpentes métalliques des hangars de production Airbus A320/A350, sous protocole d'accès ZSA avec habilitation aéronautique." },
            { titre: "Entretien ouvrages Canal du Midi et ponts toulousains", description: "Inspection structurelle et traitement des maçonneries des écluses et ponts du Canal du Midi classé UNESCO dans l'agglomération toulousaine, en coordination avec VNF (Voies Navigables de France)." }
        ]
    },
    'lille': {
        slug: 'lille',
        hubTitle: "Métropole industrielle et rénovation du patrimoine flamand",
        paragraph1: "La métropole lilloise concentre un vaste parc immobilier d'architecture flamande — briques rouges, pignons à redents, façades en calcaire — et d'anciens sites industriels reconvertis. Le nettoyage et la rénovation de ces façades atypiques requièrent des techniciens cordistes maîtrisant les matériaux locaux.",
        paragraph2: "De la Grand-Place aux zones logistiques d'Euralille, nos cordistes du Nord interviennent sur les copropriétés, les équipements publics et les infrastructures industrielles avec les habilitations requises pour les environnements à risques chimiques et électriques.",
        metaDescription: "Cordistes à Lille pour façades flamandes en briques, pignons à redents et sites industriels reconvertis. Habilitations chimiques et électriques. Devis 48h.",
        reglementationLocale: {
            title: "Réglementation à Lille (59)",
            content: "Le Vieux-Lille bénéficie d'un périmètre ABF étendu couvrant les façades en briques flamandes et les pignons à redents du 17e siècle. La Métropole Européenne de Lille (MEL) impose des permis de ravalement et une charte couleur stricte pour les interventions en secteur sauvegardé. Les anciens sites industriels reconvertis (Euralille, Roubaix Tourcoing) peuvent présenter des risques amiante/plomb nécessitant une évaluation SS4 préalable. Les zones logistiques de la MEL (Lesquin, Fretin) relèvent du code ICPE pour les entrepôts de grande hauteur."
        },
        tarifsLocaux: {
            min: 340,
            max: 580,
            context: "Marché nordiste avec forte demande de rénovation du bâti industriel reconverti. Les interventions sur sites amiante (nombreux en région Nord) impliquent un surcoût SS4 de 15 à 40 % selon le niveau de confinement requis."
        },
        projetsTypes: [
            { titre: "Nettoyage façades flamandes en briques rouges (Vieux-Lille, Grand-Place)", description: "Traitement doux des briques flamandes et des pierres calcaires des façades du Vieux-Lille par nettoyage basse pression et méthode laser pour les éléments sculptés, sous validation ABF MEL." },
            { titre: "Réhabilitation bâtiments industriels reconvertis (friches textiles Roubaix)", description: "Désamiantage et nettoyage des verrières en shed des anciennes usines textiles du Pays de Laine reconverties en espaces culturels (La Piscine, Condition Publique), avec confinement SS4." },
            { titre: "Maintenance équipements logistiques grande hauteur (Euralille, Lesquin)", description: "Inspection et entretien des structures métalliques des entrepôts de grande hauteur (>10 m) de la zone logistique de Lesquin et du complexe commercial Euralille, conformément aux plans de prévention ICPE." }
        ]
    },
    'nantes': {
        slug: 'nantes',
        hubTitle: "Chantiers navals historiques et laboratoire d'éco-quartiers",
        paragraph1: "Nantes a su transformer son héritage industriel naval en un vivier de compétences pour les travaux en accès difficile. Les anciennes structures des Chantiers de l'Atlantique, les quais de la Loire et les nouvelles architectures audacieuses de l'île de Nantes constituent le terrain d'intervention naturel de nos cordistes nantais.",
        paragraph2: "La croissance démographique soutenue de la métropole génère d'importants besoins en entretien de bâtiments contemporains : façades végétalisées, bardages composites et porte-à-faux architecturaux des éco-quartiers du bord de Loire nécessitent une expertise cordiste que les nacelles conventionnelles ne peuvent pas offrir.",
        reglementationLocale: {
            title: "Réglementation à Nantes (44)",
            content: "L'île de Nantes est soumise à un Secteur de Plan de Référence (SPR) avec prescriptions architecturales spécifiques pour les façades des bâtiments en reconversion. Les chantiers de la zone portuaire (Cheviré) relèvent de la réglementation du Grand Port Maritime de Nantes-Saint-Nazaire. La ZAC Bas-Chantenay impose des protocoles particuliers pour les interventions sur les anciens sites industriels (risques amiante, plomb). Les ouvrages d'art sur la Loire (pont de Cheviré, pont de Bellevue) nécessitent coordination avec la DIR Ouest."
        },
        tarifsLocaux: {
            min: 350,
            max: 590,
            context: "Marché en forte croissance porté par les nombreux chantiers de réhabilitation de l'île de Nantes et les besoins d'entretien des éco-quartiers. Les interventions sur la zone industrielle portuaire (accréditation GPM) impliquent un surcoût d'accès de 10 à 15 %."
        },
        projetsTypes: [
            { titre: "Maintenance structures navales et quais anciens Chantiers de l'Atlantique", description: "Inspection et traitement anticorrosion des structures métalliques des anciens bâtiments de constructions navales et des quais de la zone industrielle portuaire, avec accréditation GPM Nantes-Saint-Nazaire." },
            { titre: "Entretien façades végétalisées et bardages éco-quartiers Île de Nantes", description: "Nettoyage, taille et maintenance des façades végétalisées et des bardages composites des bâtiments contemporains de l'île de Nantes (Quartier de la Création, Pôle Universitaire), inaccessibles aux nacelles en bord de Loire." },
            { titre: "Réhabilitation verrières et patrimoine industriel (LU, Les Machines de l'Île)", description: "Nettoyage et remplacement de vitres des grandes verrières industrielles des bâtiments patrimonioaux reconvertis (Palais des Congrès, Les Machines de l'Île, ancienne biscuiterie LU), avec maintien d'exploitation." }
        ]
    },
    'nice': {
        slug: 'nice',
        hubTitle: "Front de mer Belle Époque et reliefs escarpés des Alpes-Maritimes",
        paragraph1: "La topographie exceptionnelle de Nice — entre mer et premiers contreforts alpins — rend l'accès de nombreuses structures impossible sans travail sur cordes. Les façades des hôtels de la Promenade des Anglais, soumises aux embruns salins et au soleil intense, nécessitent des interventions régulières et précises.",
        paragraph2: "Du Vieux-Nice aux villages perchés de l'arrière-pays, nos cordistes niçois maîtrisent les contraintes du massif préalpin (purges rocheuses, végétalisation agressive) et les exigences esthétiques de l'architecture Belle Époque et baroque protégée aux abords de la Promenade.",
        metaDescription: "Cordistes à Nice : façades Belle Époque de la Promenade des Anglais, purges rocheuses alpines et villages perchés. Devis gratuit sous 48h, sans échafaudage.",
        reglementationLocale: {
            title: "Réglementation à Nice (06)",
            content: "Le secteur de la Promenade des Anglais et du Vieux-Nice est soumis à un ABF Ville d'Art et d'Histoire avec exigences chromies et matériaux stricts pour les façades Belle Époque et baroque. Les purges rocheuses sur les falaises (Colline du Château, Mont Boron, Moyenne Corniche) relèvent de la réglementation DTU 13.11 et nécessitent une étude géotechnique préalable. Les communes du Haut-Pays niçois (villages perchés) peuvent imposer des plans de prévention des risques naturels (PPRN-M, PPRN-I) encadrant les interventions sur falaises."
        },
        tarifsLocaux: {
            min: 390,
            max: 720,
            context: "Marché premium côte d'azur : les tarifs niçois se situent 20 à 30 % au-dessus de la moyenne nationale, portés par la forte demande hôtelière haut de gamme (Hyatt, Negresco, Méridien), le secteur résidentiel de luxe (Cimiez, Mont Boron) et les interventions techniques sur falaises alpines."
        },
        projetsTypes: [
            { titre: "Nettoyage façades hôtelières Belle Époque (Promenade des Anglais)", description: "Traitement respectueux des enduits ocres et blancs des façades Belle Époque des grands hôtels niçois, avec prise en compte de l'exposition aux embruns et des prescriptions colorales ABF Ville d'Art et d'Histoire." },
            { titre: "Purge rocheuse et sécurisation falaises Colline du Château et Corniches", description: "Désherbage mécanique, pose de filets de protection et purge des blocs instables sur les falaises calcaires des Corniches niçoises, avec étude géotechnique, confinement de zone et coordination avec la DSP Voirie." },
            { titre: "Entretien résidences de luxe et immeubles de standing (Cimiez, Mont Boron)", description: "Nettoyage de façades, entretien de terrasses suspendues et lavage de baies vitrées panoramiques pour les résidences de prestige des quartiers collinaires de Nice, sans installation d'échafaudages perturbateurs." }
        ]
    },
    'strasbourg': {
        slug: 'strasbourg',
        hubTitle: "Architecture alsacienne et institutions européennes",
        paragraph1: "Strasbourg cumule des exigences uniques : la préservation des colombages et façades à pans de bois de la Petite France, le nettoyage des cathédrales et bâtiments institutionnels du Conseil de l'Europe, et la maintenance des infrastructures portuaires du Rhin.",
        paragraph2: "Nos cordistes strasbourgeois interviennent sur le patrimoine historique classé UNESCO de l'île, les grandes tours de verre du quartier européen et les ouvrages du Port Autonome, en respectant les normes de protection particulièrement strictes applicables aux bâtiments classés.",
        metaDescription: "Cordistes à Strasbourg : colombages de la Petite France, cathédrale UNESCO, institutions européennes et Port du Rhin. Techniciens certifiés, devis sous 48h.",
        reglementationLocale: {
            title: "Réglementation à Strasbourg (67)",
            content: "L'île de Strasbourg est classée UNESCO depuis 1988 : tout travail en façade sur le secteur sauvegardé est soumis à double instruction (ABF national + Architecte des bâtiments de France local). Le droit local alsacien-mosellan (code civil local) s'applique à certains aspects de droit de propriété et de mitoyenneté. Les bâtiments des institutions européennes (Parlement Européen, Conseil de l'Europe) relèvent de protocoles de sécurité diplomatique avec accréditation préalable. Le Port Autonome de Strasbourg (PAS) impose ses propres règles d'accès aux infrastructures rhénanes."
        },
        tarifsLocaux: {
            min: 360,
            max: 620,
            context: "Marché grand-estien avec demande soutenue sur deux segments : patrimoine historique (île UNESCO) et tertiaire institutionnel européen. Les interventions sur bâtiments diplomatiques (accréditation requise) et les travaux soumis au droit local alsacien-mosellan impliquent des délais administratifs majorant légèrement les coûts."
        },
        projetsTypes: [
            { titre: "Nettoyage colombages et pans de bois Petite France", description: "Entretien délicat des façades à colombages du quartier de la Petite France (bois, enduits à la chaux) par méthodes manuelles et chimiques douces, en conformité ABF et plan de conservation UNESCO." },
            { titre: "Maintenance et nettoyage façades Parlement Européen et Palais des Droits de l'Homme", description: "Lavage des grandes surfaces vitrées et entretien des bardages des bâtiments institutionnels européens (Parlement, Conseil de l'Europe, CEB) avec accréditation sécurité et coordination avec la sécurité diplomatique." },
            { titre: "Inspection ouvrages portuaires et silos Port du Rhin", description: "Contrôle visuel et CND des structures métalliques des silos, grues et infrastructures de quai du Port Autonome de Strasbourg, avec badge d'accès PAS et procédures ICPE fluviales." }
        ]
    },
    'rennes': {
        slug: 'rennes',
        hubTitle: "Pans de bois médiévaux et dynamisme métropolitain breton",
        paragraph1: "Rennes abrite l'un des plus importants parcs de maisons à pans de bois de France, concentrées dans le centre historique. Leur entretien (remplacement de torchis, traitement du bois, reprise d'enduits) impose une approche sur cordes pour éviter l'encombrement des ruelles étroites.",
        paragraph2: "Parallèlement, la forte croissance urbaine rennaise génère de nombreux chantiers de maintenance sur les tours résidentielles et les bâtiments tertiaires en périphérie. Nos techniciens bretons conjuguent respect du patrimoine médiéval et maîtrise des techniques modernes d'accès difficile.",
        reglementationLocale: {
            title: "Réglementation à Rennes (35)",
            content: "Le secteur sauvegardé de Rennes (centre historique) est géré par un Plan de Sauvegarde et de Mise en Valeur (PSMV) avec avis ABF obligatoire pour toutes les interventions en façade sur les pans de bois médiévaux. La ZPPAUP (Zone de Protection du Patrimoine Architectural, Urbain et Paysager) couvre un périmètre élargi. Les bâtiments à pans de bois antérieurs à 1850 peuvent contenir de l'amiante-chrysotile et nécessitent un diagnostic SS4 préalable. Les travaux en hauteur dans les ruelles médiévales (largeur < 5 m) nécessitent souvent une dérogation voirie auprès de Rennes Métropole."
        },
        tarifsLocaux: {
            min: 340,
            max: 570,
            context: "Marché breton en forte croissance avec demande soutenue sur le patrimoine historique et le neuf. Les interventions sur pans de bois médiévaux (techniques spécifiques, matériaux chaux/torchis) impliquent un surcoût artisanal de 15 à 25 %."
        },
        projetsTypes: [
            { titre: "Restauration pans de bois et remplacement torchis (centre médiéval)", description: "Intervention en cordes dans les ruelles du Vieux-Rennes (rue Saint-Georges, place Sainte-Anne) pour remplacement de torchis dégradé, traitement fongicide du bois et reprise d'enduits à la chaux sous prescription PSMV." },
            { titre: "Maintenance façades tours résidentielles (Baud-Chardonnet, Beauregard)", description: "Nettoyage haute pression et traitement hydrofuge des façades béton des tours des quartiers résidentiels nord de Rennes, avec mise en sécurité et inspection des joints de dilatation." },
            { titre: "Entretien bardages et verrières bâtiments tertiaires (Rennes Atalante, Cesson)", description: "Lavage et maintenance des façades vitrées et bardages composites des bâtiments de bureaux du technopôle Rennes Atalante et de la ZAC de Cesson-Sévigné." }
        ]
    },
    'grenoble': {
        slug: 'grenoble',
        hubTitle: "Capitale des Alpes : falaises, industrie et haute technologie",
        paragraph1: "Grenoble est cernée par les massifs de Belledonne, Chartreuse et Vercors. L'entretien des infrastructures de remontées mécaniques, des ouvrages routiers taillés dans la roche et des pylônes haute tension en milieu alpin constitue le cœur de l'activité cordiste locale.",
        paragraph2: "Le tissu industriel grenoblois — chimie, microélectronique, nucléaire au CEA — sollicite régulièrement nos techniciens pour des inspections CND, des travaux d'isolation de tuyauteries industrielles et des interventions dans des espaces confinés en hauteur, au sein de sites soumis à des habilitations spécifiques.",
        reglementationLocale: {
            title: "Réglementation à Grenoble (38)",
            content: "Les interventions en milieu montagnard dans les massifs Chartreuse, Belledonne et Vercors sont soumises aux DTU spécifiques zone neige (charges réglementaires), DTU vent zone III, et aux réglementations du Parc Naturel Régional (PNR) de Chartreuse pour les zones protégées. Le CEA Grenoble et les sites nucléaires requièrent des habilitations spécifiques (N1P/N2P/N3P) et plans Q4 selon la zone d'intervention. Les sites SEVESO de la Métropole (chimie alpine) imposent des plans de prévention et habilitations ATEX. La Métropole Grenobloise réglemente strictement l'accès aux ouvrages d'art."
        },
        tarifsLocaux: {
            min: 380,
            max: 700,
            context: "Marché alpin avec surcoût montagne : les interventions en milieu alpin (accès difficile, météo contraignante, équipements spécifiques neige/glace) majorent les tarifs de 15 à 30 % selon la saison. Les prestations sur sites nucléaires CEA impliquent un surcoût habilitation de 20 à 35 %."
        },
        projetsTypes: [
            { titre: "Sécurisation falaises et purge rocheuse Massif de la Chartreuse et Vercors", description: "Désherbage, purge de blocs instables et pose de filets de protection géotechniques sur les falaises calcaires menaçant les routes et habitations des massifs de Chartreuse et Vercors, avec coordination PPRN et Isère Géologie." },
            { titre: "Maintenance installations nucléaires et industrielles (CEA, Soitec, STMicroelectronics)", description: "Inspection CND, remplacement d'isolants et maintenance de structures en hauteur sur les sites industriels et de recherche du polygone scientifique grenoblois, avec habilitations nucléaires N1P/N2P selon zone." },
            { titre: "Inspection pylônes haute tension et infrastructure RTE Alpes", description: "Contrôle visuel et traitement anticorrosion des pylônes de lignes à haute tension de RTE dans les corridors alpins, avec habilitations H0V/B0V et protocoles de consignation électrique." }
        ]
    },
    'rouen': {
        slug: 'rouen',
        hubTitle: "Flèches gothiques et axe industriel de la Seine",
        paragraph1: "Rouen possède une skyline unique dominée par des clochers et flèches gothiques parmi les plus élevés d'Europe. La maintenance et la restauration de ces édifices — cathédrale, Abbatiale Saint-Ouen, Tour Jeanne d'Arc — mobilisent des cordistes spécialisés en restauration du patrimoine.",
        paragraph2: "L'axe Seine concentre par ailleurs une intense activité pétrochimique et logistique (silos, raffineries, terminaux portuaires) nécessitant des interventions industrielles régulières. Nos techniciens normands sont habilités pour les sites Seveso et maîtrisent les procédures ATEX.",
        reglementationLocale: {
            title: "Réglementation à Rouen (76)",
            content: "Le secteur sauvegardé de Rouen (vieux centre médiéval) est l'un des plus grands de France : l'ABF y exerce un contrôle strict sur tous les travaux en façade. Les sites pétrochimiques de la Vallée de Seine (Gonfreville-l'Orcher, Notre-Dame-de-Gravenchon) sont classés SEVESO seuil haut et nécessitent habilitations ATEX, plans de prévention et formations HSE spécifiques. Le Port de Rouen (HAROPA) impose des badgages portuaires pour toute intervention sur les terminaux et silos céréaliers. Les ouvrages d'art de la RN31 et du viaduc de Brotonne relèvent de la compétence DREAL Normandie."
        },
        tarifsLocaux: {
            min: 340,
            max: 580,
            context: "Marché normand avec deux segments distincts : patrimoine religieux et architectural (tarifs standards avec surcoût techniques spécialisées) et industrie pétrochimique Vallée de Seine (majorations SEVESO/ATEX de 20 à 30 %)."
        },
        projetsTypes: [
            { titre: "Restauration et nettoyage cathédrale Notre-Dame de Rouen et Abbatiale Saint-Ouen", description: "Intervention cordiste spécialisée sur les flèches, pinacles et tympans sculptés gothiques de la Cathédrale de Rouen (la plus haute de France jusqu'en 1876), avec validation DRAC Normandie et respect du chantier de conservation." },
            { titre: "Inspection et maintenance raffineries et silos pétrochimiques (Vallée de Seine)", description: "Contrôle CND, traitement anticorrosion et remplacement d'isolants sur les colonnes de distillation, sphères de stockage et structures élevées des raffineries normandes (Esso, TotalEnergies), avec habilitations ATEX et plans de prévention." },
            { titre: "Entretien infrastructures portuaires et silos céréaliers (Port de Rouen)", description: "Inspection et traitement des structures de quai, des silos céréaliers (hauteur jusqu'à 55 m) et des passerelles de chargement du port de Rouen (3e port de France), avec badge HAROPA et coordination sécurité portuaire." }
        ]
    },
    'toulon': {
        slug: 'toulon',
        hubTitle: "Arsenal naval et façades méditerranéennes face aux embruns",
        paragraph1: "Toulon abrite la principale base navale française et un vaste arsenal militaire. L'entretien des structures navales, des quais et des bâtiments historiques de la rade requiert des cordistes habilités pour les sites sensibles et formés aux contraintes de l'environnement maritime.",
        paragraph2: "Les façades civiles toulonnaises, exposées aux embruns et au sel de la Méditerranée, se dégradent rapidement. Nos techniciens varois interviennent sur les immeubles résidentiels du bord de rade, les équipements touristiques du cap Sicié et les infrastructures industrielles de la zone portuaire ouest.",
        reglementationLocale: {
            title: "Réglementation à Toulon (83)",
            content: "La Base Navale de Toulon est une zone militaire classifiée : toute intervention sur les installations de la Marine Nationale requiert une habilitation Défense Nationale (niveau Confidentiel Défense selon la zone) délivrée après enquête de sécurité. La rade de Toulon est soumise à la réglementation de la Préfecture Maritime Méditerranée. Les zones côtières du Var exposées aux embruns marins imposent des règles de traitement anticorrosion spécifiques (classe de corrosivité C4/C5 selon ISO 12944). Le secteur sauvegardé de la vieille ville est sous contrôle ABF."
        },
        tarifsLocaux: {
            min: 360,
            max: 640,
            context: "Marché varois avec forte demande saisonnière. Les interventions sur sites militaires (habilitation Défense) sont majorées de 25 à 40 % en raison des délais d'habilitation et des contraintes opérationnelles de la Marine Nationale. Les travaux en zone côtière corrosive (C4/C5) nécessitent des revêtements spéciaux majorant le coût matière de 15 à 20 %."
        },
        projetsTypes: [
            { titre: "Maintenance structures navales et quais Arsenal de Toulon", description: "Inspection anticorrosion et travaux de maintenance sur les structures de quais, hangars et bâtiments historiques de l'Arsenal de Toulon, avec habilitation Défense Nationale et coordination avec l'Officier de Sécurité de la Zone Maritime." },
            { titre: "Nettoyage et traitement facades bord de rade (Mourillon, Lazaret)", description: "Démoussage, nettoyage haute pression et application d'hydrofuge sur les façades des immeubles d'habitation du bord de rade (classe corrosivité C4 marine), avec produits adaptés aux embruns méditerranéens." },
            { titre: "Entretien équipements touristiques Cap Sicié et Mont Faron", description: "Maintenance des installations touristiques sur les sites escarpés de Toulon (téléphérique du Mont Faron, sentiers du Cap Sicié), avec cordes de progression en milieu naturel et sécurisation des voies d'accès." }
        ]
    },
    'montpellier': {
        slug: 'montpellier',
        hubTitle: "Croissance architecturale audacieuse et infrastructures événementielles",
        paragraph1: "Montpellier est l'une des villes à la croissance démographique la plus soutenue de France, générant un parc immobilier récent aux architectures audacieuses (façades végétalisées, bardages métalliques, trompe-l'œil géants) qui demandent une expertise cordiste spécifique pour leur entretien.",
        paragraph2: "Le campus universitaire géant, les équipements culturels comme le Corum ou l'Arena, et les infrastructures de la ligne de tramway nécessitent des interventions régulières sur des structures contemporaines innovantes. Nos cordistes héraultais maîtrisent ces matériaux et ces accès complexes.",
        reglementationLocale: {
            title: "Réglementation à Montpellier (34)",
            content: "Le centre historique de Montpellier est soumis au PSMV et à l'avis ABF. La ZAC Port Marianne impose des cahiers des charges architecturaux stricts pour les interventions de maintenance sur les bâtiments contemporains aux formes complexes (Jean Nouvel, Zaha Hadid). Le PPRI du Lez contraint les interventions dans les zones basses du fleuve (Zone A inondable). Les équipements universitaires (CHU, CNRS) relevant du domaine public de l'État sont soumis à des marchés publics et protocoles de sécurité spécifiques. Les interventions sur lignes de tramway nécessitent une autorisation de TAM (Transports de l'Agglomération de Montpellier)."
        },
        tarifsLocaux: {
            min: 345,
            max: 590,
            context: "Marché languedocien en croissance rapide. La forte proportion de bâtiments contemporains récents (post-2000) avec architectures complexes génère une demande spécifique en cordistes formés aux matériaux composites et aux bardages innovants, avec tarifs légèrement supérieurs à la moyenne régionale."
        },
        projetsTypes: [
            { titre: "Nettoyage et entretien façades végétalisées et bardages ZAC Port Marianne", description: "Maintenance des façades végétalisées et bardages de zinc, cuivre et composite des bâtiments contemporains de Port Marianne (Richter, Odysseum), avec taille des végétaux grimpants et remplacement de panneaux de bardage." },
            { titre: "Maintenance équipements Arena Sud de France et Corum", description: "Nettoyage des toitures-membranes tendues et entretien des structures métalliques complexes de l'Arena Sud de France (15 000 places) et du Corum, sans perturbation des plannings événementiels." },
            { titre: "Inspection et entretien toitures campus universitaire (UM, Montpellier Supagro)", description: "Inspection des étanchéités et remplacement de sections de toitures plates des bâtiments universitaires et hospitaliers du campus de Montpellier (plus grand campus de France par superficie), sur marchés publics." }
        ]
    },
    'metz': {
        slug: 'metz',
        hubTitle: "Pierre de Jaumont et reconversion du bassin industriel lorrain",
        paragraph1: "Metz se distingue par son architecture en pierre de Jaumont — calcaire doré extrait localement — qui donne à ses bâtiments une teinte orangée unique. L'entretien de ces façades, particulièrement sensibles à la pollution et aux lichens, est une spécialité de nos techniciens mosellans.",
        paragraph2: "La reconversion des friches industrielles lorraines génère d'importants chantiers de désamiantage, de nettoyage et de réhabilitation de bâtiments industriels difficiles d'accès. Nos cordistes interviennent également sur les grandes infrastructures de la Moselle canalisée et du réseau ferroviaire TGV Est.",
        reglementationLocale: {
            title: "Réglementation à Metz (57)",
            content: "La cathédrale Saint-Étienne de Metz et le cœur historique sont classés Monument Historique avec supervision de la DRAC Grand Est : toute intervention en hauteur sur le bâti classé nécessite une autorisation de travaux et le passage en Commission Régionale du Patrimoine. Le droit local alsacien-mosellan s'applique dans certains aspects (droit de propriété, baux). Les friches industrielles lorraines présentent fréquemment des risques amiante (SS4 obligatoire), plomb et pollution des sols. Les ouvrages de la Moselle canalisée relèvent de VNF (Voies Navigables de France) avec protocoles d'accès aux zones navigables."
        },
        tarifsLocaux: {
            min: 330,
            max: 560,
            context: "Marché lorrain avec demande régulière en réhabilitation industrielle. Les interventions sur sites amiante (nombreux en Lorraine industrielle) impliquent un surcoût SS4 de 15 à 40 %. Les travaux sur ouvrages classés Monuments Historiques nécessitent des artisans qualifiés RGE/Monuments Historiques majorant les tarifs de 10 à 20 %."
        },
        projetsTypes: [
            { titre: "Nettoyage pierre de Jaumont cathédrale et bâtiments historiques messin", description: "Traitement délicat du calcaire doré de la cathédrale Saint-Étienne (façades, contreforts, gargouilles) par nettoyage basse pression et biocide adapté, sous validation DRAC Grand Est et architecte en chef des monuments historiques." },
            { titre: "Désamiantage et réhabilitation friches industrielles lorraines", description: "Confinement, désamiantage et nettoyage des bâtiments industriels désaffectés de la région messine (anciennes usines sidérurgiques, entrepôts ferroviaires), avec certification SS4 niveau 3 et gestion des déchets amiante." },
            { titre: "Inspection et entretien ouvrages Moselle canalisée et viaducs", description: "Contrôle structurel et traitement anticorrosion des ouvrages d'art enjambant la Moselle canalisée (ponts, viaducs ferroviaires), en coordination avec VNF et SNCF Réseau, avec habilitations travail à proximité des voies." }
        ]
    },
    'nancy': {
        slug: 'nancy',
        hubTitle: "Art Nouveau, Place Stanislas et ingénierie industrielle",
        paragraph1: "Nancy possède l'un des patrimoines Art Nouveau les plus riches d'Europe — École de Nancy, vitraux Gallé, façades ornées. La restauration de ces éléments décoratifs fragiles en hauteur exige une maîtrise technique et un soin particulier incompatibles avec l'usage de nacelles lourdes.",
        paragraph2: "La place Stanislas classée UNESCO, les équipements universitaires et les cheminées d'usines héritées du bassin industriel lorrain complètent le tableau d'une ville où nos cordistes naviguent entre exigences patrimoniales strictes et interventions industrielles techniques sur des structures métalliques et maçonnées.",
        reglementationLocale: {
            title: "Réglementation à Nancy (54)",
            content: "La Place Stanislas est classée UNESCO depuis 1983 (avec les Places de la Carrière et Alliance) : tout travail en façade dans ce périmètre est soumis à instruction ABF et DRAC Grand Est. Le quartier Art Nouveau fait l'objet d'une AVAP avec cahier des charges matériaux et techniques. Le droit local alsacien-mosellan (applicable en Moselle, Bas-Rhin, Haut-Rhin) ne s'applique pas à Nancy (Meurthe-et-Moselle), mais la proximité culturelle influence les pratiques. Les cheminées industrielles des anciennes usines lorraines peuvent contenir de l'amiante et relèvent du décret n°2012-639 pour leur démantèlement."
        },
        tarifsLocaux: {
            min: 330,
            max: 560,
            context: "Marché lorrain comparable à Metz, avec une niche spécialisée pour la restauration Art Nouveau (artisans rares, techniques spécifiques sur faïences Émile Gallé et ferronneries Majorelle) justifiant des tarifs majorés de 20 à 30 % sur ce segment."
        },
        projetsTypes: [
            { titre: "Restauration façades Art Nouveau École de Nancy (faïences, ferronneries)", description: "Intervention délicate sur les éléments décoratifs en hauteur des villas Art Nouveau de Nancy (Villa Majorelle, Brasserie Excelsior) : nettoyage de faïences, restauration de ferronneries Majorelle et consolidation d'enduits sculptés." },
            { titre: "Maintenance cheminées industrielles et structures métalliques lorraines", description: "Inspection, mesure d'épaisseur par CND et traitement anticorrosion des cheminées en briques et acier des anciennes usines reconverties de la région nancéienne, avec plans d'intervention sécurisés pour structures hautes (>20 m)." },
            { titre: "Nettoyage et entretien Place Stanislas et Place de la Carrière (UNESCO)", description: "Nettoyage des grilles dorées de Jean Lamour, des fontaines et des façades classées de la Place Stanislas, en coordination avec la Ville de Nancy et la DRAC, sans perturbation des flux touristiques." }
        ]
    },
    'orleans': {
        slug: 'orleans',
        hubTitle: "Toitures ligériennes et industrie cosmétique et pharmaceutique",
        paragraph1: "Orléans s'est imposée comme un pôle majeur de la cosmétique et de la pharmacie en France. Les usines et laboratoires de la zone industrielle de Gidy et du Val-de-Loire requièrent des interventions cordistes pour la maintenance de leurs installations techniques en hauteur et les inspections réglementaires.",
        paragraph2: "Le centre historique orléanais, avec ses toitures en ardoise d'Anjou et ses façades à colombages reconstitués après la Seconde Guerre mondiale, appelle des techniciens capables d'intervenir sur des matériaux et des configurations variés. Nos cordistes du Loiret assurent aussi la maintenance des ouvrages d'art surplombant la Loire.",
        reglementationLocale: {
            title: "Réglementation à Orléans (45)",
            content: "La zone UNESCO du Val de Loire s'étend jusqu'aux abords d'Orléans : les bâtiments visibles depuis les bords de Loire sont soumis à l'avis de l'ABF pour toute modification de façade. Le PPRI Loire (Plan de Prévention des Risques Inondation) contraint les interventions en zones basses. Les zones industrielles de Gidy (cosmétique, pharmacie) relèvent du code ICPE avec plans de prévention obligatoires pour les sites classés A. Les ouvrages d'art sur la Loire (Pont Georges V, pont de l'Europe) relèvent de la compétence de la DIR Centre-Ouest."
        },
        tarifsLocaux: {
            min: 330,
            max: 555,
            context: "Marché ligérien modéré avec demande régulière. Les interventions sur sites ICPE pharmaceutiques ou cosmétiques (Sanofi, LVMH Cosmetics, Sisley) impliquent des habilitations spécifiques et des protocoles de sécurité majorant les tarifs de 10 à 20 %."
        },
        projetsTypes: [
            { titre: "Maintenance couvertures en ardoise demeures historiques Val de Loire", description: "Remplacement de sections de couvertures en ardoise d'Anjou sur les châteaux et demeures classés des bords de Loire (Meung-sur-Loire, Beaugency), sous supervision ABF et coordination avec architectes du patrimoine." },
            { titre: "Inspection et maintenance installations en hauteur sites industriels pharmaceutiques (Gidy)", description: "Contrôle CND, nettoyage de cuves inox et remplacement d'isolants sur les installations techniques des laboratoires cosmétiques et pharmaceutiques de la ZI de Gidy (LVMH, Sanofi), avec plans de prévention ICPE." },
            { titre: "Inspection ouvrages d'art et ponts sur la Loire", description: "Contrôle visuel et magnétoscopique des structures métalliques des ponts orléanais enjambant la Loire (pont Georges V, pont de l'Europe), avec habilitations travail à proximité des voies navigables et coordination VNF." }
        ]
    },
    'saint-etienne': {
        slug: 'saint-etienne',
        hubTitle: "Héritage minier, reliefs vallonnés et renouveau urbain stéphanois",
        paragraph1: "Saint-Étienne porte l'empreinte de son passé minier et sidérurgique : chevalements, cheminées d'usines et bâtiments industriels en briques constituent un patrimoine à maintenir ou à réhabiliter. Ces structures, souvent dépourvues de moyens d'accès modernes, sont le terrain de jeu naturel de nos cordistes stéphanois.",
        paragraph2: "Le relief vallonné de la ville, conjugué à une densité urbaine forte dans le centre, rend fréquemment impraticables les nacelles élévatrices dans les rues en pente. Nos techniciens interviennent sur les façades résidentielles, les équipements publics et les friches en reconversion du Musée d'Art Moderne.",
        reglementationLocale: {
            title: "Réglementation à Saint-Étienne (42)",
            content: "Les anciens sites miniers stéphanois sont soumis au PPRM (Plan de Prévention des Risques Miniers) : les travaux en sous-sol ou à proximité des zones d'affaissement sont réglementés par la DREAL Auvergne-Rhône-Alpes. Les bâtiments industriels antérieurs à 1997 présentent des risques amiante significatifs (diagnostic obligatoire avant tous travaux). Le relief urbain stéphanois (pentes > 10-15 %) complexifie l'installation des nacelles et impose souvent le recours aux cordes. Les friches de reconversion (Manufacture d'Armes, Cité du Design) relèvent de la réglementation des ERP pour les interventions en exploitation."
        },
        tarifsLocaux: {
            min: 320,
            max: 530,
            context: "Marché stéphanois avec des tarifs parmi les plus accessibles des grandes villes françaises, reflétant le tissu économique local. Les interventions en zone PPRM ou sur bâtiments amiante impliquent des surcoûts réglementaires de 10 à 30 %."
        },
        projetsTypes: [
            { titre: "Réhabilitation chevalements miniers et patrimoine industriel (Musée de la Mine)", description: "Inspection, traitement anticorrosion et remise en état des structures métalliques des chevalements de puits de mine du bassin stéphanois, classés patrimoine industriel, en coordination avec les associations de préservation." },
            { titre: "Maintenance façades résidentielles en zones de pente (Montaud, Valbenoîte)", description: "Intervention sur cordes sur les façades et toitures des immeubles résidentiels des quartiers en pente de Saint-Étienne (Montaud, Valbenoîte), où les voies trop étroites et inclinées interdisent le déploiement de nacelles télescopiques." },
            { titre: "Entretien Musée d'Art Moderne et Cité du Design (friches reconverties)", description: "Nettoyage de verrières, maintenance de bardages et entretien des structures complexes des bâtiments reconvertis du quartier créatif stéphanois, avec coordination exploitation et sécurité des ERP." }
        ]
    },
    'tours': {
        slug: 'tours',
        hubTitle: "Ardoises de la Loire et ouvrages d'art du Val de Loire",
        paragraph1: "Tours est au cœur du Val de Loire classé UNESCO, avec ses toitures en ardoise d'Anjou et ses tuiles plates caractéristiques des châteaux et demeures bourgeoises. La restauration et l'entretien de ces couvertures historiques en pente forte représente une part importante de l'activité cordiste locale.",
        paragraph2: "Les viaducs ferroviaires, les ponts routiers sur la Loire et les infrastructures de la LGV Tours-Bordeaux constituent également un terrain d'intervention régulier pour nos techniciens tourangeaux, formés aux procédures d'inspection structurelle et aux travaux de génie civil en milieu fluvial.",
        reglementationLocale: {
            title: "Réglementation à Tours (37)",
            content: "Tours est au cœur de la zone UNESCO Val de Loire, avec une ZPPAUP et l'avis ABF obligatoire pour tout travail en façade dans le secteur sauvegardé (Vieux-Tours, quartier cathédrale). Les toitures en ardoise classées Monuments Historiques nécessitent des couvreurs et des cordistes qualifiés RGE/Monuments Historiques. Le PPRI Loire contraint les interventions en zones basses inondables. Les ouvrages de la LGV SEA Tours-Bordeaux (LISEA) relèvent de protocoles de sécurité ferroviaires stricts (habilitations SNCF Réseau, consignations voie)."
        },
        tarifsLocaux: {
            min: 335,
            max: 565,
            context: "Marché tourangeau avec forte composante patrimoine et tourisme. Les interventions sur châteaux et demeures classés du Val de Loire impliquent des artisans qualifiés MH (Monuments Historiques) avec surcoût de 15 à 25 %. La LGV et le réseau ferroviaire constituent un segment spécialisé avec certifications SNCF obligatoires."
        },
        projetsTypes: [
            { titre: "Restauration toitures en ardoise châteaux et demeures Val de Loire", description: "Remplacement de sections de couvertures en ardoise d'Anjou sur les châteaux classés du Val de Loire (Villandry, Azay-le-Rideau, Amboise), en accès difficile sur toitures à forte pente, sous supervision ABF et DRAC Centre." },
            { titre: "Inspection structurelle viaducs et ponts Loire (pont Wilson, viaduc LGV)", description: "Contrôle visuel et par ultrasons des structures béton et métal des ponts et viaducs tourangeaux, en coordination avec les DIR Centre, SNCF Réseau et les collectivités, avec habilitations travail à proximité des voies ferrées." },
            { titre: "Entretien façades et toitures demeures bourgeoises Tours centre (Cathédrale, Vieux-Tours)", description: "Maintenance préventive des façades en tuffeau et toitures en ardoise des hôtels particuliers du cœur de Tours, en conformité avec les prescriptions du secteur sauvegardé (PSMV) et les recommandations ABF Indre-et-Loire." }
        ]
    },
    'brest': {
        slug: 'brest',
        hubTitle: "Port militaire, climat océanique et infrastructures navales",
        paragraph1: "Brest subit l'un des régimes de pluie et de vent les plus intenses de France métropolitaine. Ce climat océanique brutal accélère considérablement la dégradation des façades, toitures et structures métalliques. L'entretien préventif régulier est indispensable et requiert des professionnels rodés aux conditions d'intervention dégradées.",
        paragraph2: "Le port militaire de Brest, la base de sous-marins et les chantiers navals de Naval Group constituent des sites sensibles où nos cordistes habilités interviennent sous accréditation préfectorale. Les infrastructures portuaires civiles, les phares du Finistère et les éoliennes offshore en développement complètent le panel d'interventions breton.",
        reglementationLocale: {
            title: "Réglementation à Brest (29)",
            content: "La base navale de Brest (BSAM) est une zone de sécurité militaire prioritaire : toute intervention nécessite une habilitation Défense Nationale délivrée après enquête de sécurité auprès du DST (Direction de la Sécurité du Territoire). Les chantiers de Naval Group relèvent de protocoles HSE stricts avec plans de prévention et habilitations spécifiques chantier naval. Les interventions sur les phares du Finistère (relevant du Service des Phares et Balises - DIRM NAMO) nécessitent des autorisations spéciales. Les structures exposées aux vents bretons doivent être dimensionnées selon les DTU zone climatique IV (vent de tempête)."
        },
        tarifsLocaux: {
            min: 345,
            max: 600,
            context: "Marché breton avec surcoût climatique : les vents violents et les pluies fréquentes réduisent les jours d'intervention praticables et majorent les tarifs de 10 à 15 % par rapport à des sites intérieurs équivalents. Les interventions sur base navale (habilitation Défense) sont majorées de 30 à 45 %."
        },
        projetsTypes: [
            { titre: "Maintenance structures et bâtiments Base Navale de Brest (habilitation Défense)", description: "Inspection et entretien des bâtiments, quais et structures métalliques de la base navale de Brest (BSAM), avec habilitation Défense Nationale, coordination OSD (Officier de Sécurité de Défense) et respect des zones de sécurité militaire." },
            { titre: "Nettoyage et traitement façades exposées aux vents océaniques (rade de Brest)", description: "Démoussage intensif et application de produits hydrofuges renforcés sur les façades des bâtiments de la rade de Brest, soumis aux embruns et aux rafales pouvant dépasser 100 km/h, avec traitements anticorrosion renforcés (classe C5-M)." },
            { titre: "Inspection phares Finistère et structures portuaires civiles", description: "Contrôle structurel des maçonneries et lanternes des phares finistériens (phare du Minou, phare de Saint-Mathieu) et maintenance des équipements des ports de plaisance et de commerce brestois, en coordination avec la DIRM NAMO." }
        ]
    },
    'clermont-ferrand': {
        slug: 'clermont-ferrand',
        hubTitle: "Pierre de Volvic, industrie du caoutchouc et Chaîne des Puys",
        paragraph1: "Clermont-Ferrand est la seule grande ville de France construite en grande partie en pierre de Volvic, une lave grise volcanique caractéristique qui lui donne son aspect sombre unique. L'entretien et le nettoyage de ces façades en roche volcanique exige des produits et des techniques spécifiques que maîtrisent nos cordistes auvergnats.",
        paragraph2: "La capitale mondiale du pneumatique abrite les sites Michelin, Limagrain, Thermo Fisher et d'autres géants industriels dont les usines nécessitent régulièrement des interventions cordistes pour la maintenance des toitures, des conduits et des structures métalliques en hauteur inaccessibles autrement.",
        reglementationLocale: {
            title: "Réglementation à Clermont-Ferrand (63)",
            content: "La cathédrale Notre-Dame de l'Assomption et le centre historique clermontois sont soumis à l'avis ABF avec prescriptions spécifiques pour les matériaux en pierre de Volvic. La Chaîne des Puys classée UNESCO (2018) et le Parc Naturel Régional des Volcans d'Auvergne encadrent les interventions en zone naturelle. Les sites industriels Michelin de Clermont-Ferrand (classés SEVESO pour les liquides inflammables du process) relèvent de plans de prévention et habilitations HSE spécifiques. Le CHU de Clermont-Ferrand (Gabriel Montpied) est un ERP de 1re catégorie avec protocoles de sécurité renforcés."
        },
        tarifsLocaux: {
            min: 340,
            max: 575,
            context: "Marché auvergnat avec forte composante industrielle Michelin. Les interventions sur sites SEVESO du groupe Michelin impliquent des habilitations internes (Michelin Safety Passport) et des plans de prévention majorant les tarifs de 20 à 30 %. Les travaux sur pierre de Volvic nécessitent des techniciens formés à ce matériau spécifique."
        },
        projetsTypes: [
            { titre: "Nettoyage pierre de Volvic cathédrale et bâtiments historiques clermontois", description: "Traitement chimique doux et nettoyage basse pression de la pierre de Volvic (basalte phonolithique) de la cathédrale Notre-Dame et des façades historiques du Vieux-Clermont, avec produits compatibles validés par l'INRAP et l'ABF Puy-de-Dôme." },
            { titre: "Maintenance toitures et structures industrielles sites Michelin", description: "Inspection et entretien des toitures industrielles, des charpentes métalliques et des systèmes de ventilation des usines de production Michelin (Cataroux, Carmes), avec Michelin Safety Passport et plans de prévention SEVESO." },
            { titre: "Entretien façades et équipements CHU Gabriel Montpied en exploitation", description: "Intervention sans interruption d'activité sur les façades des bâtiments hospitaliers du CHU de Clermont-Ferrand : nettoyage, traitement hydrofuge et remplacement de joints de façade, avec protocoles ERP 1re catégorie et coordination hôtelière." }
        ]
    },
    'dijon': {
        slug: 'dijon',
        hubTitle: "Toits vernissés bourguignons et filière agroalimentaire",
        paragraph1: "Dijon se reconnaît à ses toits de tuiles vernissées aux motifs géométriques polychromes — une tradition bourguignonne héritée du Moyen Âge, visible sur l'Hôtel-Dieu et les hôtels particuliers du centre historique. La restauration de ces toitures emblématiques est une spécialité de nos cordistes dijonnais, formés à la pose et au remplacement de ces tuiles d'exception.",
        paragraph2: "Le tissu agroalimentaire bourguignon (moutarderies, distilleries, caves viticoles) génère une demande régulière en interventions sur des silos, des cuves inox et des cheminées industrielles. Nos techniciens interviennent également sur les nombreux ouvrages d'art du canal de Bourgogne et du réseau ferroviaire TGV Paris-Lyon.",
        reglementationLocale: {
            title: "Réglementation à Dijon (21)",
            content: "Le secteur sauvegardé de Dijon (le plus grand de France par superficie après Paris) est géré par un PSMV imposant l'avis ABF pour toute intervention sur les façades et toitures du centre historique. Les toits vernissés polychromes sont protégés en tant qu'éléments caractéristiques du patrimoine bourguignon : leur restauration impose l'utilisation de tuiles vernissées fabriquées selon des techniques traditionnelles spécifiques. Le vignoble de Bourgogne classé UNESCO (Climats de Bourgogne depuis 2015) génère des chantiers en zone protégée. Les ouvrages du canal de Bourgogne relèvent de VNF avec protocoles d'accès navigable."
        },
        tarifsLocaux: {
            min: 335,
            max: 560,
            context: "Marché bourguignon avec niche spécialisée en toitures vernissées. La rareté des cordistes formés à la pose des tuiles vernissées polychromes de Bourgogne (fabriquées à Corgoloin ou Paray-le-Monial) justifie des tarifs majorés de 20 à 35 % sur ce segment spécifique."
        },
        projetsTypes: [
            { titre: "Restauration toits vernissés polychromes (Hôtel-Dieu, hôtels particuliers)", description: "Remplacement et repose des tuiles vernissées géométriques polychromes des toitures emblématiques dijonnaises (Hôtel-Dieu, Palais des Ducs, hôtels particuliers de la rue des Forges), sous supervision de la DRAC Bourgogne et de l'ABF Côte-d'Or." },
            { titre: "Maintenance silos et cuves agroalimentaires (moutarderies, distilleries, caves coopératives)", description: "Inspection CND, traitement anticorrosion et nettoyage des cuves inox et des silos des industries agroalimentaires bourguignonnes (Amora-Maille, Gabriel Boudier, caves coopératives des Hautes-Côtes), avec plans de prévention ICPE." },
            { titre: "Inspection ouvrages canal de Bourgogne et viaducs ferroviaires LGV", description: "Contrôle structurel des écluses, ponts-canaux et maçonneries du canal de Bourgogne (VNF), et inspection des viaducs ferroviaires du corridor Paris-Lyon (SNCF Réseau), avec habilitations voies ferrées et zones navigables." }
        ]
    },
    // Fallback générique — ne doit être utilisé que si une ville n'a pas d'entrée dédiée
    'default': {
        slug: 'default',
        hubTitle: "Technicité et flexibilité sur votre agglomération",
        paragraph1: "Les contraintes topographiques et administratives de votre métropole font de l'intervention sur cordes la solution la plus économique et la plus sécurisée. Elle s'affranchit des demandes d'autorisation de voirie (AOT) particulièrement longues.",
        paragraph2: "Forts d'une certification CQP ou IRATA, les techniciens que nous sélectionnons localement assurent un travail de précision, du nettoyage de vitres difficiles d'accès jusqu'à la sécurisation d'ouvrages maçonnés ou industriels.",
        tarifsLocaux: {
            min: 350,
            max: 600,
            context: "Tarifs indicatifs pour une intervention standard en accès difficile. Le devis précis dépend de la complexité d'accès, de la hauteur, du type de prestation et des éventuelles habilitations requises."
        }
    }
};

export function getEditorialContent(citySlug: string): UniqueLocalContent {
    return SEO_EDITORIAL_DB[citySlug] || {
        ...SEO_EDITORIAL_DB['default'],
        slug: citySlug
    };
}
