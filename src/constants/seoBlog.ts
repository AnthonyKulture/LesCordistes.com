import { SEO_BASE_URL } from './seoConfig'

export interface BlogSection {
    heading: string
    body: string
    list?: string[]
    listIntro?: string
}

export interface BlogFaq {
    q: string
    a: string
}

export interface BlogArticle {
    slug: string
    title: string
    shortTitle: string
    description: string
    category: string
    readTime: number
    datePublished: string
    dateModified: string
    intro: string
    sections: BlogSection[]
    faqs: BlogFaq[]
    ctaText: string
    ctaHref: string
    relatedLinks: { label: string; href: string }[]
}

export const SEO_BLOG: BlogArticle[] = [
    {
        slug: 'habilitations-cordiste-cqp-irata-sprat',
        title: 'Habilitations cordiste 2025 : CQP, IRATA, SPRAT — tout comprendre',
        shortTitle: 'CQP, IRATA, SPRAT : les habilitations cordiste expliquées',
        description:
            'CQP TPS, IRATA, SPRAT : quelles sont les certifications cordiste qui comptent vraiment ? Guide complet pour comprendre les niveaux, les exigences et ce que doit avoir un technicien qualifié.',
        category: 'Réglementation',
        readTime: 8,
        datePublished: '2025-01-15',
        dateModified: '2026-04-12',
        intro:
            'Avant de confier des travaux en hauteur à un cordiste, une question s\'impose : est-il vraiment qualifié ? En France, le travail sur cordes est réglementé par le Code du travail (articles R. 4323-88 à R. 4323-90), mais les certifications qui font foi sur le terrain sont au nombre de trois : le CQP TPS, l\'IRATA et le SPRAT. Comprendre leurs différences vous permettra d\'évaluer sérieusement le profil d\'un technicien — et d\'éviter les mauvaises surprises.',
        sections: [
            {
                heading: 'Pourquoi les habilitations cordiste sont obligatoires',
                body: 'Le travail sur cordes est une technique d\'accès parmi les plus exigeantes du BTP et de l\'industrie. La réglementation française impose que tout technicien intervenant en suspension soit formé et compétent, avec un encadrant ayant suivi une formation spécifique. Au-delà de l\'obligation légale, les certifications constituent la seule garantie objective pour un donneur d\'ordre que l\'intervenant maîtrise les techniques de sécurité, de secours et de sauvetage.',
            },
            {
                heading: 'Le CQP TPS : la référence française',
                body: 'Le Certificat de Qualification Professionnelle Technicien de la Prévention et de la Sécurité des Travaux sur Cordes (CQP TPS) est le diplôme national délivré par la branche professionnelle des entreprises de prévention et sécurité. Il comprend trois niveaux :\n\n**Niveau 1 — Équipier** : pose et entretien d\'équipements, travaux simples de hauteur. Environ 60 heures de formation minimum.\n\n**Niveau 2 — Technicien** : exécution autonome de travaux complexes, encadrement d\'une équipe de niveau 1. Formation complémentaire de 40 heures.\n\n**Niveau 3 — Technicien Expert** : conception de systèmes d\'accès, conduite de chantiers complexes, formation de cordistes. Réservé aux professionnels expérimentés.\n\nLe CQP est reconnu par les conventions collectives françaises et exigé dans la plupart des appels d\'offres publics. Son renouvellement tous les 3 ans garantit le maintien des compétences.',
            },
            {
                heading: 'L\'IRATA : la certification internationale',
                body: 'L\'Industrial Rope Access Trade Association (IRATA) est la certification de référence à l\'international, née dans l\'industrie pétrolière offshore britannique dans les années 1980. Elle est aujourd\'hui reconnue dans plus de 50 pays et exigée sur les grands chantiers industriels, les plateformes pétrolières et les ouvrages d\'art.\n\n**IRATA Level 1** : travaux supervisés, opérations standardisées. 1 000 heures d\'expérience minimum pour passer au niveau suivant.\n\n**IRATA Level 2** : supervision d\'équipe, évaluation des risques, sauvetage. 1 000 heures supplémentaires requises.\n\n**IRATA Level 3** : direction de chantier, audit, formation. Le niveau 3 exige au minimum 2 000 heures d\'expérience.\n\nL\'IRATA tient à jour un registre mondial des techniciens certifiés, consultable en ligne, ce qui facilite la vérification des qualifications. En France, l\'IRATA est souvent exigé sur les chantiers industriels, pétroliers et les infrastructures d\'énergie (éoliennes, barrages).',
            },
            {
                heading: 'Le SPRAT : la norme nord-américaine',
                body: 'La Society of Professional Rope Access Technicians (SPRAT) est l\'équivalent nord-américain de l\'IRATA. Elle structure les niveaux de compétence en **Level 1, 2 et 3** sur des bases comparables, avec une emphasis particulière sur la documentation des heures travaillées et les rapports d\'incident. En France métropolitaine, le SPRAT reste rare et n\'est généralement requis que pour des missions impliquant des clients ou des standards nord-américains. Il est en revanche courant en Guyane française (projets spatiaux) et dans les DOM-TOM.',
            },
            {
                heading: 'CQP vs IRATA : ce que vous devez retenir',
                body: 'Pour un chantier en France, voici la grille de lecture pratique :',
                listIntro: 'Critère de sélection selon le contexte :',
                list: [
                    'Chantier bâtiment/BTP en France → CQP TPS suffit et est souvent préféré',
                    'Chantier industriel (pétrochimie, énergie, offshore) → IRATA exigé ou fortement recommandé',
                    'Appel d\'offres international → IRATA obligatoire, SPRAT si client nord-américain',
                    'Travaux sur ouvrage d\'art (ponts, viaducs) → CQP ou IRATA selon le maître d\'ouvrage',
                    'Habilitations spécifiques (ATEX, nucléaire, sites Seveso) → vérifier les exigences propres au site',
                ],
            },
            {
                heading: 'Ce qu\'il faut vérifier avant de signer',
                body: 'Un certificat peut être périmé, falsifié ou ne pas correspondre au niveau annoncé. Avant toute intervention, demandez systématiquement :',
                list: [
                    'La copie du certificat avec date d\'expiration (renouvellement tous les 3 ans pour CQP et IRATA)',
                    'Le numéro de registre IRATA si la certification est invoquée (vérifiable sur irata.org)',
                    'L\'attestation de formation aux premiers secours (SST ou équivalent)',
                    'Le plan de prévention et le PPSPS si le chantier dépasse un certain seuil',
                    'L\'attestation d\'assurance RC Pro spécifique aux travaux en hauteur',
                ],
            },
            {
                heading: 'Les habilitations complémentaires à connaître',
                body: 'Au-delà du CQP/IRATA/SPRAT, certains chantiers nécessitent des habilitations supplémentaires qui conditionnent l\'accès au site :',
                list: [
                    'Habilitation électrique (B0, H0, BR, BC) pour travaux à proximité de réseaux',
                    'ATEX (atmosphères explosives) — formation obligatoire en zone pétrolière ou chimique',
                    'Habilitation nucléaire (SCN1/2, RP1/2) pour les centrales EDF',
                    'CACES nacelle (3A, 3B) si combinaison avec équipements de levage',
                    'Permis de feu pour travaux par points chauds en hauteur',
                ],
            },
        ],
        faqs: [
            {
                q: 'Un cordiste sans IRATA peut-il intervenir sur un chantier industriel ?',
                a: 'En France, la loi n\'impose pas spécifiquement l\'IRATA — elle exige la compétence et la formation. Mais de nombreux donneurs d\'ordre industriels l\'imposent contractuellement. Vérifiez le cahier des charges de votre chantier. Le CQP TPS est légalement équivalent pour la réglementation française.',
            },
            {
                q: 'Comment vérifier la validité d\'une certification IRATA ?',
                a: 'Rendez-vous sur le site officiel irata.org, rubrique "Technician Verification". Entrez le nom ou le numéro de registre du technicien pour vérifier le niveau et la date d\'expiration en temps réel.',
            },
            {
                q: 'Quelle est la durée de validité des certifications cordiste ?',
                a: 'Le CQP TPS et l\'IRATA sont valables 3 ans. Au-delà, le technicien doit suivre un recyclage pour maintenir sa certification. L\'IRATA exige en outre la justification d\'un minimum d\'heures pratiquées sur la période.',
            },
            {
                q: 'Un cordiste CQP niveau 1 peut-il travailler seul ?',
                a: 'Non. Le CQP niveau 1 (équipier) implique de travailler sous la supervision d\'un technicien de niveau 2 ou 3. Une équipe complète comprend au minimum un équipier et un superviseur, conformément aux règles de sécurité pour les travaux en suspension.',
            },
        ],
        ctaText: 'Trouver un cordiste certifié',
        ctaHref: '/',
        relatedLinks: [
            { label: 'Prix d\'un cordiste en 2025', href: '/prix-cordiste' },
            { label: 'Cordiste vs échafaudage', href: '/cordiste-vs-echafaudage' },
            { label: 'Trouver un cordiste à Paris', href: '/cordiste-paris' },
        ],
    },
    {
        slug: 'comment-choisir-son-cordiste',
        title: '7 critères pour bien choisir son cordiste — guide 2025',
        shortTitle: 'Comment choisir son cordiste : 7 critères essentiels',
        description:
            'Comment choisir un bon cordiste ? Certifications, assurance RC Pro, devis détaillé, plan de prévention… Les 7 critères indispensables pour ne pas se tromper et sécuriser vos travaux en hauteur.',
        category: 'Guide achat',
        readTime: 7,
        datePublished: '2025-02-01',
        dateModified: '2026-04-12',
        intro:
            'Confier des travaux en hauteur à un cordiste est une décision engageante : la sécurité des intervenants, la qualité du résultat et votre responsabilité civile en dépendent. Pourtant, face à des devis qui varient du simple au triple, il est difficile de distinguer les pros sérieux des opportunistes. Voici les 7 critères concrets pour évaluer un cordiste avant de signer.',
        sections: [
            {
                heading: '1. Vérifier les certifications et habilitations',
                body: 'C\'est le point de départ non négociable. Un cordiste professionnel doit détenir au minimum le CQP TPS (Certificat de Qualification Professionnelle Technicien de la Prévention et Sécurité) ou son équivalent international (IRATA). Demandez la copie des certificats avec leur date d\'expiration : les certifications doivent être renouvelées tous les 3 ans. Pour les chantiers industriels, l\'IRATA est souvent requis. Vérifiez également les habilitations complémentaires liées à votre type de chantier (électrique, ATEX, nucléaire).',
            },
            {
                heading: '2. Exiger l\'assurance RC Pro spécifique',
                body: 'Tous les artisans ont une responsabilité civile professionnelle, mais toutes les RC Pro ne couvrent pas les travaux en hauteur sur cordes. C\'est un point de couverture distinct que les assureurs traitent à part en raison des risques spécifiques. Demandez l\'attestation d\'assurance et vérifiez que la mention "travaux en hauteur par techniques d\'accès sur cordes" ou équivalent figure explicitement dans les garanties couvertes. Sans cela, en cas d\'accident, la couverture pourrait être refusée.',
            },
            {
                heading: '3. Évaluer le devis : détail et transparence',
                body: 'Un bon devis cordiste ne se résume pas à un prix global. Il doit détailler :\n\n- La décomposition main-d\'œuvre / matériaux / équipements\n- Le nombre de techniciens et leur niveau de qualification\n- La durée prévue de l\'intervention\n- Les conditions d\'annulation ou de report (météo, accès)\n- Les éventuels coûts supplémentaires (déplacement, nuitées, location de matériel spécifique)\n\nMéfiez-vous des devis trop vagues ou présentés par téléphone sans visite technique préalable. Un devis sérieux nécessite presque toujours un état des lieux sur site.',
            },
            {
                heading: '4. Demander un plan de prévention',
                body: 'Pour tout chantier de plus de 400 heures ou comportant des travaux dangereux (liste définie par le Code du travail), un plan de prévention est obligatoire entre l\'entreprise utilisatrice et l\'entreprise intervenante. Même en dessous de ce seuil, un cordiste sérieux proposera systématiquement un document d\'analyse des risques adapté au site. Ce document atteste que les risques ont été identifiés et que des mesures de prévention sont en place. Son absence doit être un signal d\'alarme.',
            },
            {
                heading: '5. Contrôler les références et réalisations',
                body: 'Demandez des références récentes comparables à votre projet : même type de prestation, même type de structure, même hauteur approximative. Un cordiste spécialisé dans le nettoyage de vitres n\'a pas forcément l\'expérience requise pour une purge rocheuse ou une inspection industrielle. Les photos de chantier, les témoignages clients et les logos de maîtres d\'ouvrage reconnus sont autant d\'indicateurs de sérieux. Sur des chantiers publics, vous pouvez aussi consulter les marchés passés sur les plateformes de commande publique.',
            },
            {
                heading: '6. Apprécier la réactivité et la communication',
                body: 'La réactivité d\'un prestataire avant la signature préfigure souvent sa qualité d\'exécution. Un cordiste sérieux répond rapidement aux demandes de devis, propose une visite technique dans des délais raisonnables et fournit des documents clairs. Inversement, les lenteurs, les relances nécessaires ou les informations évasives sont des signaux faibles à ne pas ignorer. La qualité de la communication au moment du devis reflète souvent la rigueur du suivi de chantier.',
            },
            {
                heading: '7. Vérifier l\'équipement et les EPI',
                body: 'Les équipements de protection individuelle (EPI) utilisés en travaux sur cordes doivent être certifiés CE et régulièrement vérifiés par un organisme agréé. Un cordiste professionnel peut vous présenter les carnets de vérification de ses EPI (harnais, cordes, descendeurs, bloqueurs). L\'entretien et le remplacement régulier du matériel représentent un coût réel qui doit figurer dans le prix : un devis anormalement bas peut signifier que cette vérification est négligée, ce qui est un risque pour la sécurité des intervenants et votre responsabilité.',
            },
        ],
        faqs: [
            {
                q: 'Combien de devis demander pour des travaux cordiste ?',
                a: 'Demandez au minimum 3 devis pour comparer les prix, le détail des prestations et les profils. Pour des chantiers importants (plus de 5 000 € HT), 4 à 5 devis permettent d\'avoir une vision plus complète du marché local.',
            },
            {
                q: 'Peut-on faire appel à un cordiste auto-entrepreneur ?',
                a: 'Oui, le statut juridique ne détermine pas la qualité. Mais vérifiez que l\'auto-entrepreneur dispose bien d\'une RC Pro couvrant les travaux en hauteur — ce qui est souvent plus difficile à obtenir sous ce statut. Exigez l\'attestation.',
            },
            {
                q: 'Doit-on fournir des informations au cordiste avant l\'intervention ?',
                a: 'Oui. Le donneur d\'ordre doit communiquer tout ce qui est nécessaire à l\'analyse des risques : accès au bâtiment, présence de réseaux, contraintes horaires, caractéristiques structurelles des points d\'ancrage. Cette collaboration est codifiée dans le plan de prévention.',
            },
            {
                q: 'Quelle garantie sur les travaux réalisés par un cordiste ?',
                a: 'Les travaux réalisés par un cordiste sont soumis aux garanties légales : parfait achèvement (1 an), bonne exécution (2 ans pour les éléments d\'équipement), décennale (10 ans pour les travaux affectant la solidité de l\'ouvrage). Demandez l\'attestation d\'assurance décennale si les travaux entrent dans ce cadre.',
            },
        ],
        ctaText: 'Comparer des cordistes certifiés',
        ctaHref: '/',
        relatedLinks: [
            { label: 'Prix d\'un cordiste en 2025', href: '/prix-cordiste' },
            { label: 'Habilitations CQP, IRATA, SPRAT', href: '/blog/habilitations-cordiste-cqp-irata-sprat' },
            { label: 'Cordiste vs échafaudage', href: '/cordiste-vs-echafaudage' },
        ],
    },
    {
        slug: 'travaux-facade-sans-echafaudage',
        title: 'Travaux de façade sans échafaudage : quand choisir le cordiste ?',
        shortTitle: 'Travaux façade sans échafaudage : le guide complet',
        description:
            'Ravalement, nettoyage, réparation de façade sans échafaudage : quand le cordiste est-il la meilleure solution ? Avantages, limites, types de travaux, coûts — tout ce qu\'il faut savoir avant de décider.',
        category: 'Travaux & technique',
        readTime: 9,
        datePublished: '2025-03-01',
        dateModified: '2026-04-12',
        intro:
            'Lorsqu\'il faut intervenir sur une façade en hauteur, deux options s\'affrontent traditionnellement : l\'échafaudage et le travail sur cordes. Le premier est historiquement dominant. Le second, porté par des techniciens cordistes, gagne du terrain depuis les années 1990 grâce à ses avantages économiques et opérationnels. Mais le cordiste n\'est pas universel — comprendre ses forces et ses limites vous permettra de faire le bon choix pour votre chantier.',
        sections: [
            {
                heading: 'Ce que recouvre le "travail sur cordes"',
                body: 'Le travail sur cordes (ou accès sur cordes) est une technique d\'accès réglementée qui permet à un technicien d\'atteindre et d\'intervenir sur des surfaces en hauteur en suspension, sans plateforme de travail fixe. Le cordiste utilise un système à deux cordes indépendantes (corde de travail + corde de sécurité), des EPI certifiés et des points d\'ancrage fixes installés en toiture ou en structure. Cette méthode est encadrée par les articles R. 4323-88 à R. 4323-90 du Code du travail et ne peut être utilisée que si les autres méthodes présentent des risques plus importants ou sont techniquement impossibles.',
            },
            {
                heading: 'Les travaux de façade réalisables par cordiste',
                body: 'Un cordiste qualifié peut réaliser la quasi-totalité des travaux de façade courants :',
                list: [
                    'Nettoyage de façade (haute pression, chimique, laser) — béton, pierre, brique, bardage',
                    'Lavage de vitres et nettoyage de façades vitrées en hauteur',
                    'Ravalement et application d\'enduit, peinture de façade',
                    'Démoussage et traitement hydrofuge de façade ou toiture',
                    'Remplacement ou scellement de joints de façade',
                    'Réparation de fissures, traitement des infiltrations ponctuelles',
                    'Pose et dépose de filets anti-pigeons, pics répulsifs',
                    'Inspection visuelle et diagnostic de façade (avant ou après sinistre)',
                    'Remplacement de vitrages ou de menuiseries en hauteur (avec nacelle combinée)',
                    'Traitement anti-graffiti sur supports verticaux inaccessibles',
                ],
            },
            {
                heading: 'Quand le cordiste est plus avantageux que l\'échafaudage',
                body: 'Le cordiste présente des avantages décisifs dans plusieurs situations :',
                list: [
                    'Façades sur voie publique étroite (Paris, centres historiques) où l\'installation d\'un échafaudage nécessite une autorisation d\'occupation temporaire du domaine public (AOT) coûteuse',
                    'Interventions ponctuelles (réparation d\'une fissure, remplacement d\'un joint) qui ne justifient pas le coût de montage/démontage d\'un échafaudage',
                    'Bâtiments de grande hauteur (R+8 et au-delà) où l\'échafaudage devient prohibitif',
                    'Sites industriels ou portuaires où l\'installation d\'une structure métallique est impossible ou dangereuse',
                    'Travaux urgents nécessitant une intervention rapide (dommages après tempête, inspection post-sinistre)',
                    'Bâtiments classés ou contraintes architecturales interdisant la fixation d\'un échafaudage',
                ],
            },
            {
                heading: 'Les limites du travail sur cordes',
                body: 'Le cordiste n\'est pas toujours la solution optimale. Ses limites à connaître :',
                list: [
                    'Travaux nécessitant une plateforme stable (découpe, assemblage lourd, soudure prolongée) : l\'échafaudage ou la nacelle restent préférables',
                    'Chantiers de longue durée en un point fixe : la productivité horaire en suspension est inférieure à celle sur plateforme',
                    'Travaux en milieu confiné ou à l\'intérieur d\'une structure (cuves, silos) : nécessite un plan de sauvetage spécifique',
                    'Conditions météorologiques : vent > 45 km/h, verglas ou orage suspendent obligatoirement l\'intervention',
                    'Façades sans points d\'ancrage : des ancrages temporaires doivent être installés, ce qui peut nécessiter des travaux préalables et un accord du propriétaire',
                ],
            },
            {
                heading: 'Comparaison des coûts : cordiste vs échafaudage',
                body: 'La comparaison économique dépend fortement de la hauteur du bâtiment, de la durée des travaux et de l\'accessibilité du site. En règle générale :',
                list: [
                    'Bâtiment R+3 à R+5, travaux < 3 jours → cordiste 30 à 50 % moins cher que l\'échafaudage',
                    'Bâtiment R+8 et plus → l\'avantage du cordiste s\'accentue avec la hauteur',
                    'Façade avec AOT sur voie publique parisienne → économie de 1 500 à 4 000 € sur les frais administratifs',
                    'Chantier de ravalement complet (plusieurs semaines) → l\'échafaudage peut redevenir compétitif au-delà de 3 semaines d\'occupation continue',
                ],
            },
            {
                heading: 'Ce que vous devez vérifier avant de choisir',
                body: 'Avant de trancher entre cordiste et échafaudage, posez-vous ces questions :',
                list: [
                    'Quelle est la durée prévue de l\'intervention ? (< 5 jours → avantage cordiste)',
                    'La façade est-elle accessible pour un échafaudage ? (voie étroite, site contraint → cordiste)',
                    'Des points d\'ancrage existent-ils en toiture ? (sinon, vérifiez le coût d\'installation)',
                    'Les travaux nécessitent-ils une stabilité prolongée du technicien ? (soudure, assemblage mécanique → plateforme)',
                    'Y a-t-il des contraintes réglementaires (bâtiment classé, site Seveso, voie publique) ?',
                    'Quel est le délai d\'intervention souhaité ? (cordiste peut démarrer en 48-72h, échafaudage nécessite 1 à 2 semaines de délai)',
                ],
            },
        ],
        faqs: [
            {
                q: 'Un cordiste peut-il intervenir sur un bâtiment classé monument historique ?',
                a: 'Oui, sous réserve de l\'accord des Architectes des Bâtiments de France et de la maîtrise d\'ouvrage. Le travail sur cordes est souvent préféré sur les monuments historiques car il évite les fixations d\'échafaudage sur les façades patrimoniales. Des points d\'ancrage spéciaux non destructifs peuvent être utilisés.',
            },
            {
                q: 'Peut-on peindre une façade entière par technique cordiste ?',
                a: 'Oui, la peinture de façade par cordiste est couramment réalisée, notamment en régie ou en prestation complète. Le cordiste utilise une perche télescopique ou un rouleau de façade depuis sa position en suspension. La productivité est légèrement inférieure à celle sur un échafaudage pour des chantiers de grande superficie, mais l\'économie sur la location compense généralement.',
            },
            {
                q: 'Quelles conditions météorologiques arrêtent un chantier cordiste ?',
                a: 'Le vent est la principale contrainte : au-delà de 45 km/h en rafales, le travail en suspension est interdit par les règles de sécurité. Le verglas, la neige et les orages suspendent également les interventions. Un cordiste sérieux intégrera une clause météorologique dans son devis pour prévoir les éventuels reports.',
            },
            {
                q: 'Faut-il vider l\'immeuble pendant les travaux cordiste en façade ?',
                a: 'Non, dans la grande majorité des cas. Le travail sur cordes ne nécessite pas d\'évacuer les occupants. En revanche, le périmètre de sécurité au sol (zone de protection en cas de chute d\'objet) doit être matérialisé et maintenu pendant toute la durée de l\'intervention.',
            },
        ],
        ctaText: 'Demander un devis cordiste',
        ctaHref: '/post-job',
        relatedLinks: [
            { label: 'Cordiste vs échafaudage — comparatif complet', href: '/cordiste-vs-echafaudage' },
            { label: 'Prix d\'un cordiste en 2025', href: '/prix-cordiste' },
            { label: 'Habilitations cordiste : CQP, IRATA, SPRAT', href: '/blog/habilitations-cordiste-cqp-irata-sprat' },
        ],
    },
]

export const BLOG_CATEGORIES: Record<string, string> = {
    'Réglementation': 'Réglementation',
    'Guide achat': 'Guide achat',
    'Travaux & technique': 'Travaux & technique',
}

export function getBlogArticle(slug: string): BlogArticle | undefined {
    return SEO_BLOG.find((a) => a.slug === slug)
}

export const SEO_BLOG_BASE = `${SEO_BASE_URL}/blog`
