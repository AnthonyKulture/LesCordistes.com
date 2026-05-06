import { SEO_BASE_URL } from './seoConfig'

export interface BlogSectionCta {
    text: string
    href: string
    description?: string
    variant?: 'blue' | 'light' | 'outline'
}

export interface BlogSection {
    heading: string
    body: string
    list?: string[]
    listIntro?: string
    cta?: BlogSectionCta
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
    /**
     * Auteur de l'article. Slug d'AUTHORS (cf seoAuthors.ts).
     * Si absent, fallback sur DEFAULT_AUTHOR_SLUG.
     * Convention LesCordistes :
     * - 'benjamin-de-oliveira' pour articles techniques, réglementaires, métier/carrière
     * - 'anthony-profit' pour guides clients (achat, comparatifs, contraintes locales)
     */
    authorSlug?: 'anthony-profit' | 'benjamin-de-oliveira'
    /**
     * URL absolue ou relative d'une image hero/thumbnail (ratio 16:10 conseillé,
     * 1200×750 minimum pour Discover). Si absente, fallback automatique sur
     * l'image OG dynamique générée par /og?title=…&kicker=….
     */
    image?: string
    intro: string
    sections: BlogSection[]
    faqs: BlogFaq[]
    ctaText: string
    ctaHref: string
    relatedLinks: { label: string; href: string }[]
    /**
     * Active un formulaire de capture de lead intégré sous l'intro
     * (variante allégée du hero des city pages). Permet de transformer
     * un article en mini-landing tout en gardant le format BlogArticle.
     */
    leadForm?: {
        title?: string
        subtitle?: string
        defaultCategory?: 'cleaning' | 'masonry' | 'painting' | 'construction' | 'securing' | 'industry' | 'telecom' | 'event' | 'inspection' | 'repair' | 'pruning' | 'other'
        ctaLabel?: string
    }
}

export const SEO_BLOG: BlogArticle[] = [
    {
        slug: 'habilitations-cordiste-cqp-irata-sprat',
        authorSlug: 'benjamin-de-oliveira',
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
        authorSlug: 'anthony-profit',
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
        authorSlug: 'benjamin-de-oliveira',
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
    {
        slug: 'trouver-cordiste-paris',
        authorSlug: 'anthony-profit',
        title: 'Trouver un cordiste à Paris : guide complet 2026',
        shortTitle: 'Trouver un cordiste à Paris',
        description:
            'Comment trouver un cordiste qualifié à Paris ? Réglementation ABF, tarifs 2026, types de travaux en hauteur, zones couvertes — le guide pratique pour vos chantiers parisiens.',
        category: 'Guide achat',
        readTime: 8,
        datePublished: '2026-04-21',
        dateModified: '2026-04-21',
        intro:
            'Paris concentre l\'une des plus fortes densités de demande en travaux en hauteur de France. Bâtiments haussmanniens, verrières de La Défense, toitures en zinc du Marais, façades classées en centre historique : chaque chantier parisien présente des contraintes que l\'on ne retrouve nulle part ailleurs. Trouver le bon cordiste à Paris ne se résume donc pas à comparer des prix — c\'est identifier un professionnel qui connaît les règles locales, les contraintes ABF et les spécificités techniques des immeubles parisiens. Ce guide vous donne les clés pour faire le bon choix.',
        sections: [
            {
                heading: 'Paris, un terrain de jeu à part pour les cordistes',
                body: 'La capitale française réunit toutes les configurations qui rendent les travaux en hauteur complexes : hauteur des immeubles haussmanniens (R+6 à R+8 standard), emprise au sol réduite rendant l\'installation d\'un échafaudage difficile ou coûteuse sur voie publique, et une concentration de monuments historiques sans équivalent en France.\n\nPlus de 180 000 bâtiments parisiens se trouvent à moins de 500 mètres d\'un monument classé, ce qui soumet la quasi-totalité des chantiers de façade intra-muros à l\'avis préalable des Architectes des Bâtiments de France. S\'y ajoutent les contraintes liées à la densité urbaine : périmètres de sécurité stricts, plages horaires encadrées, coordination avec la voirie parisienne.\n\nCes spécificités font de Paris un marché où les cordistes les plus expérimentés — ceux qui connaissent les règles, les matériaux, les points d\'ancrage sur pierre de taille — se distinguent nettement des généralistes.',
            },
            {
                heading: 'Les travaux en hauteur les plus demandés à Paris',
                body: 'Les missions cordiste à Paris couvrent un large spectre, des interventions de quelques heures aux chantiers plurisemaines :',
                list: [
                    'Nettoyage de façades haussmanniennes (pierre calcaire, haute pression ou chimique homologué ABF)',
                    'Lavage de vitres en hauteur : immeubles de bureaux, verrières, façades vitrées de La Défense',
                    'Réfection de toitures en zinc : Marais, Île Saint-Louis, 9e, 16e et 17e arrondissements',
                    'Ravalement de façade sans échafaudage sur voie publique étroite (évite l\'AOT)',
                    'Inspection et diagnostic de façade — avant ou après sinistre, ou dans le cadre d\'un ravalement obligatoire',
                    'Traitement anti-pigeons : pose de filets ou de pics sur corniches, gouttières et ornements',
                    'Réparation de fissures ou joints de façade après mouvements de terrain ou vieillissement',
                    'Nettoyage de verrières et toitures végétalisées sur immeubles tertiaires (La Défense, CBD Paris)',
                ],
                cta: {
                    text: 'Décrire mes travaux en 2 minutes',
                    href: '/post-job',
                    description: 'Façade haussmannienne, verrière de bureau ou toiture zinc — publiez votre besoin gratuitement.',
                    variant: 'light',
                },
            },
            {
                heading: 'Réglementation parisienne : ABF, AOT et contraintes de chantier',
                body: 'Intervenir sur une façade à Paris implique de naviguer dans un cadre réglementaire plus dense qu\'ailleurs.\n\n**L\'avis des Architectes des Bâtiments de France (ABF)** est requis pour toute intervention modifiant l\'aspect extérieur d\'un bâtiment en secteur sauvegardé ou à proximité d\'un monument classé — soit la quasi-totalité du Paris historique. Un cordiste habitué à Paris saura adapter ses méthodes : points d\'ancrage non destructifs, produits de traitement homologués pour la pierre calcaire, respect des teintes et finitions prescrites.\n\n**L\'autorisation d\'occupation temporaire du domaine public (AOT)** est nécessaire si le périmètre de sécurité empiète sur trottoir ou chaussée. La demande se fait auprès de la Mairie de Paris avec un délai de 10 à 21 jours ouvrés. Sur les façades accessibles par cour intérieure ou toiture sans impact sur l\'espace public, le cordiste permet souvent de s\'en affranchir totalement — c\'est l\'un de ses avantages décisifs en zone dense.\n\n**Les horaires d\'intervention** sont encadrés par la Préfecture de Police : en général 7h–20h en semaine, avec des restrictions supplémentaires dans certains arrondissements. Votre prestataire doit en tenir compte dans son planning.',
            },
            {
                heading: 'Tarifs d\'un cordiste à Paris en 2026',
                body: 'Le marché parisien affiche des tarifs sensiblement au-dessus de la moyenne nationale, pour trois raisons : coûts de déplacement et de stationnement en zone dense, surcoût des assurances sur patrimoine classé, et tension sur la main-d\'œuvre qualifiée en Île-de-France.\n\n**Fourchette indicative à Paris (HT) :**',
                list: [
                    'Journée cordiste (8h, 1 technicien) : 450 € à 800 € selon spécialité et type de chantier',
                    'Nettoyage de façade au m² : 8 € à 18 € selon le matériau et le niveau d\'encrassement',
                    'Lavage de vitres en hauteur : 3 € à 7 € par m²',
                    'Inspection avec rapport technique écrit : 600 € à 1 200 € la demi-journée',
                    'Toiture zinc (réfection partielle) : tarif à la surface et à l\'état — devis indispensable',
                ],
                cta: {
                    text: 'Comparer des devis sans engagement',
                    href: '/post-job',
                    description: 'Obtenez plusieurs offres de cordistes certifiés sur Paris pour votre budget réel.',
                    variant: 'outline',
                },
            },
            {
                heading: 'Bien choisir son cordiste à Paris : 5 points de vigilance',
                body: 'Le marché parisien attire aussi des prestataires peu rigoureux. Avant de signer, vérifiez systématiquement :\n\n**1. Certification CQP TPS ou IRATA valide** — exigez la copie du certificat avec date d\'expiration. Pour un chantier de façade classée, préférez un technicien ayant déjà travaillé sur du patrimoine parisien.\n\n**2. RC Pro couvrant explicitement les travaux en hauteur sur patrimoine** — certaines assurances excluent les interventions sur monuments historiques ou bâtiments classés. Lisez l\'attestation ligne par ligne.\n\n**3. Connaissance des contraintes ABF** — un prestataire habitué à Paris saura immédiatement si votre adresse est en secteur protégé et quelles restrictions s\'appliquent.\n\n**4. Gestion de l\'AOT si nécessaire** — certaines entreprises intègrent la demande d\'autorisation dans leur prestation, d\'autres la laissent à votre charge. Clarifiez ce point dès le premier échange.\n\n**5. Références sur des chantiers parisiens similaires** — une intervention sur un hôtel particulier du 7e n\'a rien à voir avec un collectif des années 70. Demandez des adresses ou des photos vérifiables.',
                cta: {
                    text: 'Publier ma mission maintenant',
                    href: '/post-job',
                    description: 'Des cordistes habitués à Paris reçoivent votre demande et répondent sous 48h.',
                    variant: 'blue',
                },
            },
            {
                heading: 'Paris et Île-de-France : zones les plus couvertes',
                body: 'Les cordistes basés en Île-de-France couvrent généralement l\'ensemble des 20 arrondissements intra-muros, ainsi que la première couronne (Hauts-de-Seine, Seine-Saint-Denis, Val-de-Marne). Les arrondissements les plus demandés sont les 1er, 4e, 7e, 8e, 16e et 17e, en raison de la concentration de bâtiments haussmanniens et patrimoniaux. La Défense (92) génère une forte demande en nettoyage de vitrages en hauteur. Neuilly-sur-Seine, Boulogne-Billancourt, Vincennes et Saint-Cloud sont également des zones très actives.\n\nPour la grande couronne (Yvelines, Essonne, Seine-et-Marne, Val-d\'Oise), des cordistes parisiens se déplacent mais des frais kilométriques s\'appliquent généralement au-delà de 50 à 60 km de Paris. Précisez votre commune dès la demande de devis pour obtenir une estimation complète.',
            },
        ],
        faqs: [
            {
                q: 'Combien coûte un cordiste à Paris ?',
                a: 'Comptez entre 450 € et 800 € HT par journée (8h, 1 technicien) selon la spécialité et la complexité du chantier. Paris est 25 à 35 % plus cher que la moyenne nationale en raison des coûts de déplacement en zone dense, des contraintes patrimoniales et de la pression sur la main-d\'œuvre qualifiée. Pour du nettoyage de façade, le tarif au m² oscille entre 8 € et 18 € HT.',
            },
            {
                q: 'Faut-il une autorisation spéciale pour des travaux en hauteur à Paris ?',
                a: 'Cela dépend de la configuration du chantier. Si l\'intervention nécessite un périmètre de sécurité sur trottoir ou voie publique, une AOT (autorisation d\'occupation temporaire du domaine public) est obligatoire — délai 10 à 21 jours ouvrés à la Mairie de Paris. Si l\'accès se fait par cour intérieure ou toiture sans impact sur l\'espace public, aucune AOT n\'est requise. Un cordiste expérimenté à Paris évaluera cette question dès la visite technique.',
            },
            {
                q: 'Quel délai pour trouver un cordiste disponible à Paris ?',
                a: 'Pour des travaux courants (nettoyage, inspection), comptez 1 à 3 semaines entre la prise de contact et le démarrage. En haute saison (mars à octobre), les cordistes parisiens sont souvent complets 3 à 4 semaines à l\'avance. Pour une urgence (post-sinistre, sécurisation), certains prestataires proposent une intervention sous 24 à 72h avec une majoration tarifaire.',
            },
            {
                q: 'Les cordistes parisiens interviennent-ils en banlieue et grande couronne ?',
                a: 'Oui. La petite couronne (92, 93, 94) est généralement couverte sans surcoût notable. Pour la grande couronne (60–100 km de Paris), des frais kilométriques s\'appliquent, en général de 0,50 € à 0,80 € HT/km au-delà d\'un rayon défini. Précisez votre commune dès la demande de devis pour éviter les surprises.',
            },
        ],
        ctaText: 'Trouver mon cordiste à Paris',
        ctaHref: '/post-job',
        relatedLinks: [
            { label: 'Cordistes certifiés à Paris', href: '/cordiste-paris' },
            { label: 'Prix d\'un cordiste en 2026', href: '/prix-cordiste' },
            { label: 'Travaux de façade sans échafaudage', href: '/blog/travaux-facade-sans-echafaudage' },
            { label: 'Comment choisir son cordiste', href: '/blog/comment-choisir-son-cordiste' },
        ],
    },
    {
        slug: 'responsabilite-maitre-ouvrage-chantier-cordiste',
        authorSlug: 'benjamin-de-oliveira',
        title: 'Responsabilité du maître d\'ouvrage sur un chantier cordiste : ce que la loi impose',
        shortTitle: 'Responsabilité maître d\'ouvrage : chantier cordiste',
        description:
            'Plan de prévention, PPSPS, responsabilité pénale, documents obligatoires : ce que la loi impose réellement au donneur d\'ordre avant, pendant et après un chantier de travaux en hauteur sur cordes.',
        category: 'Réglementation',
        readTime: 10,
        datePublished: '2026-04-21',
        dateModified: '2026-04-21',
        intro:
            'Confier des travaux en hauteur à un prestataire cordiste ne vous dégage pas de toute responsabilité. Le Code du travail (articles R. 4511-1 et suivants) impose au donneur d\'ordre — qu\'il soit syndic, gestionnaire de patrimoine, directeur technique ou particulier — des obligations précises avant toute intervention d\'une entreprise extérieure. Les ignorer expose à des sanctions pénales, à l\'invalidation de votre assurance, voire à une mise en cause personnelle en cas d\'accident. Ce guide détaille ce que la loi impose vraiment, sans surestimer ni minimiser votre exposition.',
        sections: [
            {
                heading: 'Maître d\'ouvrage : votre responsabilité est engagée dès la commande',
                body: 'La relation entre un donneur d\'ordre et un prestataire cordiste n\'est pas une simple relation commerciale. Dès qu\'une entreprise extérieure intervient sur votre site ou votre bâtiment, vous devenez **entreprise utilisatrice** au sens du Code du travail — avec les obligations qui s\'y attachent.\n\nCette qualification s\'applique à :\n- Un syndic qui mandate un cordiste pour nettoyer la façade d\'un immeuble\n- Un propriétaire qui commande une inspection de toiture\n- Un directeur technique qui fait intervenir une équipe sur ses installations industrielles\n- Une collectivité qui confie des travaux de zinguerie à un prestataire extérieur\n\nLe principe fondateur est simple : **la sécurité du chantier est une responsabilité partagée** entre l\'entreprise intervenante (le cordiste) et l\'entreprise utilisatrice (vous). Cette co-responsabilité s\'exerce avant l\'intervention, pendant et après. En cas d\'accident du travail d\'un salarié du prestataire — ou de dommage causé à un tiers — votre rôle sera examiné par les autorités, quand bien même vous n\'étiez pas présent sur le chantier.',
            },
            {
                heading: 'Le plan de prévention : dans quels cas est-il obligatoire ?',
                body: 'Le plan de prévention est le document central de la co-activité entre votre site et une entreprise extérieure. Il est régi par les articles R. 4512-1 à R. 4512-16 du Code du travail.\n\nIl est obligatoirement écrit si les travaux dépassent 400 heures sur 12 mois avec le même prestataire, **ou** s\'ils figurent sur la liste des travaux dangereux de l\'arrêté du 19 mars 1993 — ce qui est le cas des travaux en hauteur par accès sur cordes.\n\nEn pratique, **tout chantier cordiste relève de cette seconde condition**, même un nettoyage de vitres d\'une demi-journée. Le plan de prévention écrit est donc systématiquement requis. Ce que vous devez fournir au prestataire avant le démarrage :',
                list: [
                    'Une inspection commune préalable du site (obligatoire pour rédiger le plan)',
                    'Les plans ou schémas des installations utiles à l\'analyse des risques (réseaux, points d\'ancrage existants, accès)',
                    'Les consignes de sécurité applicables sur votre site',
                    'Les informations sur les risques propres à l\'environnement (réseaux électriques, contraintes d\'accès, présence d\'occupants)',
                    'La délimitation des zones de travail et des périmètres de sécurité',
                ],
                cta: {
                    text: 'Publier ma mission avec toutes les infos',
                    href: '/post-job',
                    description: 'Notre formulaire vous guide pour fournir aux cordistes toutes les informations nécessaires à l\'analyse des risques.',
                    variant: 'light',
                },
            },
            {
                heading: 'Le PPSPS : quand s\'applique-t-il à vos travaux ?',
                body: 'Le Plan Particulier de Sécurité et de Protection de la Santé (PPSPS) est distinct du plan de prévention. Il concerne les opérations de bâtiment ou de génie civil soumises à **coordination SPS** (Sécurité et Protection de la Santé), régies par les articles R. 4532-1 et suivants du Code du travail.\n\nLa coordination SPS est obligatoire dès que **deux entreprises au moins interviennent simultanément ou successivement sur un même chantier**. Si vous faites intervenir un cordiste pour le nettoyage de façade pendant qu\'un électricien travaille dans les parties communes ou qu\'une entreprise de ravalement opère en pied d\'immeuble, la coordination SPS peut s\'appliquer.\n\nEn cas de coordination SPS obligatoire, vous devez :\n\n**1. Désigner un coordonnateur SPS** agréé avant l\'ouverture du chantier\n\n**2. Établir le Plan Général de Coordination (PGC)** qui encadre tous les intervenants\n\n**3. Demander à chaque entreprise son PPSPS**, document que le cordiste rédige pour décrire les mesures de prévention spécifiques à sa propre intervention\n\nPour un chantier simple mono-prestataire (un seul cordiste, aucune autre entreprise simultanée), le PPSPS n\'est généralement pas requis — seul le plan de prévention s\'applique.',
            },
            {
                heading: 'Votre responsabilité pénale : les 3 situations à risque',
                body: 'La responsabilité du donneur d\'ordre peut être engagée pénalement dans trois situations distinctes :\n\n**1. Absence de plan de prévention en cas d\'accident**\nSi un accident survient et qu\'aucun plan de prévention n\'a été établi (ou qu\'il est lacunaire), vous pouvez être mis en cause pour mise en danger d\'autrui (article 223-1 du Code pénal) ou pour faute caractérisée. Les sanctions vont de l\'amende à la peine d\'emprisonnement selon la gravité des conséquences.\n\n**2. Chute d\'objet causant des dommages à un tiers**\nSi du matériel ou un débris tombe depuis le chantier et blesse un passant ou endommage un véhicule, la responsabilité civile du donneur d\'ordre peut être engagée conjointement à celle du prestataire — notamment si les mesures de balisage et de protection du périmètre n\'avaient pas été définies dans le plan de prévention.\n\n**3. Non-vérification des habilitations du prestataire**\nLe donneur d\'ordre a une obligation de vérification (article R. 8254-1 du Code du travail) : vérifier que l\'entreprise est à jour de ses obligations légales (Kbis, attestations fiscales et sociales, assurances). Si vous faites intervenir un prestataire non qualifié ou non assuré pour des travaux en hauteur, vous pouvez être tenu co-responsable des dommages.',
                cta: {
                    text: 'Trouver des cordistes qui gèrent la conformité',
                    href: '/post-job',
                    description: 'Sur LesCordistes.com, les prestataires sont vérifiés : certifications, assurances, documents à jour.',
                    variant: 'outline',
                },
            },
            {
                heading: 'Les 5 documents à exiger avant le premier jour de chantier',
                body: 'Avant toute intervention, constituez un dossier de chantier avec ces pièces. Leur absence au moment d\'un contrôle ou d\'un accident serait retenue contre vous :',
                list: [
                    'Le plan de prévention signé par les deux parties — rédigé après l\'inspection commune préalable du site',
                    'L\'attestation d\'assurance RC Pro mentionnant explicitement les travaux en hauteur par techniques d\'accès sur cordes (vérifiez la date de validité)',
                    'Les certificats CQP TPS ou IRATA de chaque technicien intervenant, avec date d\'expiration',
                    'L\'attestation de vigilance URSSAF (ou équivalent) de l\'entreprise prestataire — téléchargeable sur urssaf.fr',
                    'Le Kbis ou extrait d\'immatriculation de l\'entreprise, datant de moins de 3 mois',
                ],
                cta: {
                    text: 'Déposer ma mission maintenant',
                    href: '/post-job',
                    description: 'Décrivez vos travaux en 5 minutes et recevez des offres de cordistes certifiés sous 48h.',
                    variant: 'blue',
                },
            },
            {
                heading: 'Ce que la loi ne vous impose pas (idées reçues)',
                body: 'La réglementation est souvent perçue comme plus lourde qu\'elle ne l\'est réellement. Quelques précisions utiles :\n\n**Vous n\'avez pas à former le cordiste.** La formation et l\'habilitation du technicien relèvent entièrement de l\'entreprise prestataire. Votre rôle se limite à vérifier que les certifications existent et sont valides — pas à en assurer le contenu.\n\n**Vous n\'êtes pas responsable du matériel du prestataire.** L\'entretien des EPI (harnais, cordes, bloqueurs) est sous la seule responsabilité de l\'entreprise intervenante. En revanche, si vous mettez à disposition du matériel (points d\'ancrage, garde-corps), vous devez garantir leur conformité.\n\n**L\'inspection du travail ne vous contrôle pas systématiquement.** Un chantier cordiste n\'entraîne pas automatiquement une visite de l\'inspection du travail. Ce contrôle est déclenché soit par un accident, soit par un signalement, soit dans le cadre d\'une campagne sectorielle. La probabilité de contrôle reste faible pour un chantier de façade courant — mais les sanctions en cas d\'irrégularité constatée sont réelles.',
            },
        ],
        faqs: [
            {
                q: 'En tant que syndic, suis-je personnellement responsable en cas d\'accident ?',
                a: 'La responsabilité pénale peut être personnelle si vous êtes le signataire des actes de gestion (mandat de syndic). En pratique, c\'est la société de syndic qui est visée en premier — mais le gérant peut être mis en cause en cas de faute grave caractérisée, notamment l\'absence totale de plan de prévention ou la non-vérification des assurances. La mise en place d\'un dossier de chantier rigoureux est la meilleure protection.',
            },
            {
                q: 'Un accident engage-t-il ma responsabilité même si le cordiste est auto-entrepreneur ?',
                a: 'Oui. Le statut juridique du prestataire (salarié, auto-entrepreneur, SARL) ne modifie pas vos obligations en tant qu\'entreprise utilisatrice. Les règles sur le plan de prévention et la vérification des qualifications s\'appliquent de la même façon. Avec un auto-entrepreneur, soyez d\'autant plus vigilant sur l\'assurance RC Pro — plus difficile à obtenir sous ce statut pour les travaux en hauteur.',
            },
            {
                q: 'Le plan de prévention est-il obligatoire pour un simple nettoyage de façade ?',
                a: 'Oui, dès lors que le prestataire utilise des techniques d\'accès sur cordes. Les travaux en hauteur par cordes figurent sur la liste des travaux dangereux de l\'arrêté du 19 mars 1993, ce qui rend le plan de prévention écrit obligatoire indépendamment de la durée ou du volume horaire du chantier. Un nettoyage de vitres d\'une demi-journée est donc soumis à cette obligation.',
            },
            {
                q: 'Que risque-t-on concrètement en l\'absence de plan de prévention ?',
                a: 'En cas de contrôle de l\'inspection du travail : une mise en demeure puis une amende de 4e classe (jusqu\'à 750 € par salarié concerné). En cas d\'accident du travail sans plan de prévention : une mise en cause pour manquement aux obligations de sécurité, pouvant conduire à une sanction pénale (jusqu\'à 1 an d\'emprisonnement et 15 000 € d\'amende selon l\'article L. 4741-1 du Code du travail). L\'assurance du donneur d\'ordre peut également se retourner contre lui.',
            },
        ],
        ctaText: 'Trouver des cordistes certifiés et assurés',
        ctaHref: '/post-job',
        relatedLinks: [
            { label: 'Habilitations cordiste : CQP, IRATA, SPRAT', href: '/blog/habilitations-cordiste-cqp-irata-sprat' },
            { label: 'Comment choisir son cordiste', href: '/blog/comment-choisir-son-cordiste' },
            { label: 'Trouver un cordiste à Paris', href: '/blog/trouver-cordiste-paris' },
        ],
    },
    {
        slug: 'trouver-cordiste-lyon',
        authorSlug: 'anthony-profit',
        title: 'Trouver un cordiste à Lyon : tarifs, zones et guide 2026',
        shortTitle: 'Trouver un cordiste à Lyon',
        description:
            'Trouvez un cordiste certifié à Lyon pour vos travaux en hauteur. Tarifs 2026, zones couvertes, Vieux-Lyon, Croix-Rousse et Presqu\'île — le guide pratique.',
        category: 'Guide achat',
        readTime: 8,
        datePublished: '2026-04-21',
        dateModified: '2026-04-21',
        intro:
            'Lyon concentre, après Paris, l\'une des demandes les plus fortes de France en travaux en hauteur. Sa géographie singulière — la Presqu\'île enserrée entre Rhône et Saône, les Pentes de la Croix-Rousse aux rues pavées et traboules, le Vieux-Lyon classé au Patrimoine mondial de l\'UNESCO, les zones industrielles de l\'est — crée des configurations que seul un cordiste à Lyon habitué de ces terrains sait aborder avec rigueur. Trouver le bon prestataire ne se résume pas à obtenir le devis le moins cher : c\'est identifier un technicien capable d\'intervenir rapidement, qui connaît les contraintes patrimoniales locales, les exigences des Architectes des Bâtiments de France et les matériaux spécifiques des façades lyonnaises. Ce guide vous donne les clés pour faire le bon choix en 2026.',
        sections: [
            {
                heading: 'Lyon : pourquoi les travaux cordistes y sont-ils spécifiques ?',
                body: 'La deuxième agglomération de France réunit une diversité architecturale sans équivalent hors de Paris. Les immeubles haussmanniens de la Presqu\'île (R+5 à R+7) côtoient les bâtiments canuts des Pentes de la Croix-Rousse — des constructions du XIXe siècle aux grandes fenêtres caractéristiques et aux coursives intérieures qui compliquent l\'installation d\'un échafaudage traditionnel. Le Vieux-Lyon, inscrit au Patrimoine mondial de l\'UNESCO depuis 1998, rassemble plus de 300 édifices Renaissance dont les façades en tuffeau et les toitures en tuiles canal exigent des interventions millimétrées.\n\nÀ l\'est, les zones industrielles de Vénissieux, Vaulx-en-Velin, Saint-Fons, Feyzin et Gerland génèrent une demande continue en inspection et maintenance sur des installations pétrochimiques, des silos et des structures métalliques. Sur ces chantiers, la certification IRATA est souvent exigée contractuellement, et les techniciens doivent disposer d\'EPI (équipements de protection individuelle) adaptés : harnais anti-chute certifiés, cordes de travail et de sécurité homologuées, bloqueurs et descendeurs à jour de vérification périodique.\n\nCette double réalité — patrimoine historique d\'un côté, industrie lourde de l\'autre — fait de Lyon un marché à part pour les techniques d\'accès sur cordes (TAC). Les cordistes les plus actifs sur la métropole maîtrisent les deux contextes et connaissent les spécificités réglementaires locales. C\'est ce qui distingue les prestataires sérieux des généralistes itinérants.',
            },
            {
                heading: 'Quels travaux un cordiste peut-il réaliser à Lyon ?',
                body: 'Les missions cordiste à Lyon couvrent un spectre large, des bâtiments résidentiels aux équipements industriels en passant par le patrimoine historique. La plupart des interventions en hauteur sans échafaudage ni nacelle sont réalisables par accès sur cordes dès lors que des points d\'ancrage fiables existent ou peuvent être installés en toiture. La productivité en suspension est comparable à celle sur échafaudage pour des chantiers ponctuels, et le démarrage est possible sous 48 à 72 heures contre 1 à 2 semaines pour un montage d\'échafaudage.',
                listIntro: 'Les missions les plus fréquentes à Lyon et dans la métropole :',
                list: [
                    'Nettoyage de façades en tuffeau, calcaire ou enduit (Vieux-Lyon, Presqu\'île) — haute pression adaptée ou produit homologué ABF',
                    'Réfection et réparation de toitures en tuiles canal (Vieux-Lyon, Croix-Rousse, colline de Fourvière)',
                    'Lavage de vitres en hauteur : Tour Part-Dieu, Tour Incity, Tour Oxygène, immeubles tertiaires du quartier Confluence',
                    'Ravalement et application d\'enduit sur immeubles canuts des Pentes, sans échafaudage sur rue étroite',
                    'Traitement anti-pigeons (filets, pics) sur corniches, balcons et ornements de façade',
                    'Inspection et diagnostic de façade après inondations (crue du Rhône ou de la Saône)',
                    'Réparation de fissures et traitement d\'infiltrations ponctuelles sur bâtiment en hauteur',
                    'Travaux industriels (inspection de cheminées, réservoirs, pylônes) dans les zones d\'activité de l\'est lyonnais',
                    'Purge de falaises et sécurisation des zones escarpées du 5e arrondissement, de Caluire et de la colline de Fourvière',
                    'Pose de lignes de vie et systèmes anti-chute permanents sur toitures et structures en hauteur',
                ],
                cta: {
                    text: 'Décrire mes travaux en 2 minutes',
                    href: '/post-job',
                    description: 'Façade Renaissance, immeuble canut ou installation industrielle — publiez votre besoin gratuitement.',
                    variant: 'light',
                },
            },
            {
                heading: 'Vieux-Lyon et secteur ABF : les contraintes à connaître avant de signer',
                body: 'Le Vieux-Lyon constitue l\'un des secteurs sauvegardés les plus stricts de France. Depuis son inscription au Patrimoine mondial de l\'UNESCO en 1998, toute intervention sur une façade — même un simple nettoyage — est soumise à l\'avis des Architectes des Bâtiments de France (ABF) dès lors qu\'elle modifie l\'aspect extérieur du bâtiment.\n\n**Produits et techniques** : les produits de nettoyage chimique puissants sont souvent prohibés sur la pierre de tuffeau ou les façades Renaissance. Seuls les produits homologués par les ABF peuvent être appliqués — le cordiste doit les mentionner explicitement dans son devis et son plan de prévention.\n\n**Points d\'ancrage non destructifs** : percer une façade classée pour installer un ancrage permanent est soumis à autorisation préalable. Pour les interventions ponctuelles, des systèmes d\'ancrage temporaires (lestés, posés sur le faîtage ou fixés sur des huisseries existantes) sont privilégiés. Un cordiste expérimenté sur le patrimoine lyonnais connaît ces systèmes et les met en œuvre sans démarche supplémentaire.\n\n**Délais administratifs** : en dehors du secteur UNESCO, la Presqu\'île et une grande partie des arrondissements centraux (1er, 2e, 4e, 5e et 6e) sont couverts par un périmètre de protection des monuments historiques. Une demande d\'autorisation peut prendre 15 à 30 jours ouvrés — intégrez ce délai dans votre planning.\n\nHors secteur protégé, dans les arrondissements périphériques (7e, 8e, 9e) et les communes de la Métropole, les contraintes ABF ne s\'appliquent généralement pas. Le plan de prévention et la RC Pro suffisent pour démarrer.',
            },
            {
                heading: 'Tarifs d\'un cordiste à Lyon en 2026',
                body: 'Le marché lyonnais se situe dans une fourchette intermédiaire entre Paris et les grandes villes de province. Les tarifs sont en moyenne 15 à 20 % inférieurs à ceux pratiqués en Île-de-France, grâce à des coûts de déplacement plus faibles et une moindre tension sur la main-d\'œuvre qualifiée. Ils restent toutefois supérieurs à des villes comme Grenoble ou Clermont-Ferrand, du fait de la densité de la demande et des compétences spécifiques exigées pour les chantiers patrimoniaux.',
                listIntro: 'Fourchette indicative à Lyon (HT) :',
                list: [
                    'Journée cordiste (8h, 1 technicien) : 380 € à 650 € selon spécialité et type de chantier',
                    'Nettoyage de façade au m² : 7 € à 16 € selon le matériau et le niveau d\'encrassement',
                    'Lavage de vitres en hauteur : 3 € à 6 € par m²',
                    'Inspection technique avec rapport écrit : 500 € à 1 000 € la demi-journée',
                    'Chantier industriel (IRATA niveau 2 ou 3 exigé) : 600 € à 900 € HT/j par technicien',
                    'Réfection de toiture en tuiles canal : tarif à la surface et à l\'état — devis indispensable',
                ],
                cta: {
                    text: 'Comparer des devis sans engagement',
                    href: '/post-job',
                    description: 'Obtenez plusieurs offres de cordistes certifiés sur Lyon pour votre budget réel.',
                    variant: 'outline',
                },
            },
            {
                heading: 'Bien choisir son cordiste à Lyon : 5 critères qui font la différence',
                body: 'Lyon dispose d\'un vivier de cordistes qualifiés, mais la qualité varie fortement d\'un prestataire à l\'autre. Voici les 5 points de vigilance spécifiques au marché lyonnais.\n\n**1. La certification adaptée au chantier** — Pour un bâtiment résidentiel ou du patrimoine, le CQP TPS (niveau 2 minimum pour encadrer une équipe) est la référence française. Pour les chantiers industriels de Vénissieux ou de Saint-Fons, un IRATA niveau 2 ou 3 est souvent exigé contractuellement. Demandez la copie des certificats avec date d\'expiration : le CQP et l\'IRATA sont valables 3 ans.\n\n**2. La connaissance du patrimoine lyonnais** — Un cordiste habitué au Vieux-Lyon ou à la Presqu\'île saura immédiatement si votre adresse est en secteur ABF, quels ancrages non destructifs utiliser et quels produits sont homologués pour la pierre de tuffeau. Cette expertise locale évite des erreurs coûteuses et des délais supplémentaires.\n\n**3. La RC Pro couvrant les travaux en hauteur et le patrimoine** — Vérifiez que l\'attestation mentionne explicitement les techniques d\'accès sur cordes (TAC) et les interventions sur bâtiments classés ou en secteur protégé. Certaines assurances excluent le patrimoine historique.\n\n**4. Le plan de prévention systématique** — Tout chantier cordiste impose un plan de prévention écrit (les travaux en hauteur figurent sur la liste des travaux dangereux de l\'arrêté du 19 mars 1993). Un prestataire sérieux — qu\'il soit membre de la SFETH ou non — le propose spontanément après une inspection commune du site.\n\n**5. Les références sur des chantiers lyonnais comparables** — Une intervention sur les quais de Saône n\'a rien à voir avec une inspection de cheminée à Saint-Fons. Demandez des références vérifiables : adresses, photos ou noms d\'entreprises clientes.',
                cta: {
                    text: 'Trouver mon cordiste à Lyon',
                    href: '/post-job',
                    description: 'Des cordistes habitués à Lyon reçoivent votre demande et répondent sous 48h.',
                    variant: 'blue',
                },
            },
            {
                heading: 'Zones couvertes : Lyon intra-muros et Métropole',
                body: 'Les cordistes basés dans la métropole lyonnaise couvrent généralement l\'ensemble des 9 arrondissements de Lyon, ainsi que les principales communes de la Métropole de Lyon : Villeurbanne, Vénissieux, Caluire-et-Cuire, Bron, Saint-Fons, Feyzin, Gerland, Décines-Charpieu, Rillieux-la-Pape, Tassin-la-Demi-Lune et Oullins-Pierre-Bénite. La grande majorité des prestataires interviennent dans ce périmètre sans facturer de frais kilométriques supplémentaires.\n\nAu-delà de la métropole, les cordistes lyonnais acceptent fréquemment des missions dans les départements limitrophes : Ain (Bourg-en-Bresse, Ambérieu-en-Bugey), Isère (Grenoble, Bourgoin-Jallieu, Vienne), Loire (Saint-Étienne, Roanne) et Savoie. Des frais kilométriques s\'appliquent généralement à partir de 40 à 60 km du centre de Lyon — comptez entre 0,40 € et 0,70 € HT par kilomètre au-delà du périmètre couvert.\n\nLa région Auvergne-Rhône-Alpes est l\'une des plus actives de France en techniques d\'accès difficile (TAC), portée par le secteur industriel, les chantiers sur ouvrages d\'art et une forte demande en montagne. Lyon en est la principale base opérationnelle, ce qui garantit un vivier de prestataires qualifiés disponibles dans des délais raisonnables.',
            },
        ],
        faqs: [
            {
                q: 'Combien coûte un cordiste à Lyon ?',
                a: 'Comptez entre 380 € et 650 € HT par journée à Lyon, selon la spécialité et le type de chantier. C\'est environ 20 % moins cher qu\'à Paris. Le nettoyage de façade oscille entre 7 € et 16 € HT au m² selon le matériau.',
            },
            {
                q: 'Les travaux sur le Vieux-Lyon nécessitent-ils une autorisation des ABF ?',
                a: 'Oui, dans la quasi-totalité des cas. Le secteur Saint-Jean / Saint-Paul / Saint-Georges est classé UNESCO et toute intervention modifiant l\'aspect extérieur d\'un bâtiment requiert l\'avis des Architectes des Bâtiments de France. Un cordiste expérimenté sur ce secteur intégrera le délai administratif (15 à 30 jours ouvrés) dans son planning et proposera les produits et techniques homologués.',
            },
            {
                q: 'Quel délai pour trouver un cordiste disponible à Lyon ?',
                a: 'En dehors de la haute saison, comptez 1 à 3 semaines entre la prise de contact et le démarrage. Au printemps et en été (mars à octobre), les cordistes lyonnais sont souvent complets 3 à 5 semaines à l\'avance pour les travaux de façade. Pour une urgence après sinistre, certains prestataires proposent une intervention sous 24 à 72h avec une majoration tarifaire.',
            },
            {
                q: 'Un cordiste lyonnais peut-il intervenir dans tout le département du Rhône ?',
                a: 'Oui. La Métropole de Lyon est couverte intégralement, généralement sans surcoût. Pour le reste du département (Beaujolais, Tarare, Givors), des frais kilométriques s\'appliquent. Les cordistes basés à Lyon acceptent aussi fréquemment des missions dans l\'Ain, l\'Isère et la Loire, avec des frais de déplacement proportionnels à la distance.',
            },
        ],
        ctaText: 'Trouver mon cordiste à Lyon',
        ctaHref: '/post-job',
        relatedLinks: [
            { label: 'Cordistes certifiés à Lyon', href: '/cordiste-lyon' },
            { label: 'Prix d\'un cordiste en 2026', href: '/prix-cordiste' },
            { label: 'Trouver un cordiste à Paris', href: '/blog/trouver-cordiste-paris' },
            { label: 'Travaux de façade sans échafaudage', href: '/blog/travaux-facade-sans-echafaudage' },
        ],
    },
    {
        slug: 'premier-chantier-cordiste-apres-cqp',
        authorSlug: 'benjamin-de-oliveira',
        title: 'Premier chantier cordiste après le CQP : trouver et facturer',
        shortTitle: 'Premier chantier après le CQP',
        description:
            'Décrochez vos premiers chantiers cordiste après le CQP TPS : où chercher du travail, combien facturer, comment prospecter. Le guide terrain concret 2026.',
        category: 'Métier & Carrière',
        readTime: 8,
        datePublished: '2026-04-26',
        dateModified: '2026-04-26',
        intro:
            'Le CQP TPS niveau 1 en poche, la question arrive vite : comment trouver son premier chantier cordiste ? Le diplôme ouvre les portes, mais il ne signe pas les devis à ta place. Les premières semaines sont souvent le moment le plus difficile de la carrière — pas par manque de compétences, mais par manque de méthode pour prospecter, fixer ses tarifs et convaincre un donneur d\'ordre de parier sur un profil sans références. Ce guide est écrit pour les 0-12 premiers mois : où chercher du travail, combien facturer comme technicien d\'accès en début d\'activité, comment rédiger un devis crédible et éviter les erreurs classiques qui font traîner le démarrage.',
        sections: [
            {
                heading: 'Où trouver ses premiers chantiers cordiste ?',
                body: 'La plupart des fraîchement diplômés font la même erreur : ils attendent que le travail vienne à eux. Le marché des TAC (techniques d\'accès sur cordes) fonctionne peu par les grandes plateformes généralistes. Les chantiers circulent d\'abord dans les réseaux professionnels, par recommandation et bouche-à-oreille entre cordistes.\n\nTrois canaux fonctionnent en priorité pour un profil CQP niveau 1 en début d\'activité.\n\n**Les organismes de formation.** Ton centre CQP TPS ou IRATA entretient des relations avec des entreprises qui recrutent régulièrement des équipiers pour du renfort ponctuel. Demande directement à ton formateur si des prestataires de la région cherchent des profils. C\'est le levier le plus rapide à activer — et souvent le plus fiable pour un premier chantier sans références.\n\n**Les entreprises de travaux spécialisées.** Plutôt que de chercher en direct des clients particuliers ou des syndics — ce qui nécessite une structure juridique, une RC Pro et un minimum de références — commence par travailler en sous-traitance pour une ETT (entreprise de travaux sur cordes) existante. Tu factures à une entreprise, tu constitues ton carnet de références, et tu ne portes pas seul la responsabilité du plan de prévention face au donneur d\'ordre.\n\n**Les plateformes spécialisées.** LesCordistes.com centralise des missions postées par des clients qui ont déjà décidé de faire appel à un cordiste. Les missions sont qualifiées — le client sait ce qu\'il cherche. En tant que professionnel inscrit, tu vois les chantiers disponibles dans ta zone et tu peux candidater directement, sans intermédiaire.',
                listIntro: 'Les six canaux à activer dans les premières semaines :',
                list: [
                    'Formation : demande à ton organisme CQP/IRATA une liste de contacts entreprises régionaux',
                    'Sous-traitance : approche les ETT locales comme équipier avant de prospecter en direct',
                    'LesCordistes.com : inscris-toi, complète ton profil et accède aux missions de ta région',
                    'LinkedIn : contacte les gérants de petites entreprises de travaux en hauteur localement',
                    'SFETH : le syndicat professionnel met en relation adhérents et techniciens',
                    'Marchés publics : surveille les appels d\'offres sur BOAMP — certains cherchent des équipiers supplémentaires',
                ],
                cta: {
                    text: 'Voir les missions ouvertes près de chez moi',
                    href: '/jobs',
                    description: 'Des chantiers cordiste qualifiés, triés par région. Accès libre à l\'inscription.',
                    variant: 'light',
                },
            },
            {
                heading: 'Combien facturer : TJM cordiste débutant en 2026',
                body: 'C\'est la question qui revient le plus souvent — et la plus mal documentée. Les chiffres ci-dessous sont des repères de marché issus des pratiques observées chez les indépendants et ETT françaises en 2026.\n\n**Junior (CQP niveau 1, 0-2 ans) : 280 à 380 €/j HT.** La fourchette réaliste pour démarrer en régions moyennes. À Paris et en IDF, vise plutôt 320-450 €/j.\n\n**Confirmé (CQP niveau 2, 2-5 ans) : 380 à 550 €/j HT.** Accessible après 2-3 ans et un carnet de références étoffé. Ce niveau justifie l\'encadrement d\'un équipier N1.\n\n**Expert (CQP niveau 3 ou IRATA L3) : 550 à 900 €/j HT.** Réservé aux chantiers industriels, à l\'encadrement de chantiers complexes et à la formation. Rare sous 5 ans d\'expérience.\n\nEn micro-entreprise, les charges représentent environ 22 % du chiffre d\'affaires. Sur 300 €/j facturés, tu encaisses environ 234 € nets. Prévois également : déplacements, entretien du matériel, recyclage triennal CQP ou IRATA (600 à 1 200 € tous les 3 ans), RC Pro (400 à 900 €/an) et heures de prospection non facturées.\n\nDeux erreurs classiques en début d\'activité : se brader pour décrocher le premier contrat — tu crées un précédent difficile à corriger — et facturer trop cher sans références pour justifier le prix. Reste dans la fourchette basse de ton niveau, puis fais monter le tarif après 2-3 missions avec retours clients positifs. Un TJM trop bas attire aussi des clients qui négocient sur tout — ce n\'est pas le vivier avec lequel tu veux construire ton activité.',
                list: [
                    'Junior CQP N1 : 280-380 €/j — zone de démarrage réaliste en régions moyennes',
                    'Confirmé CQP N2 : 380-550 €/j — accessible après 2-3 ans et références documentées',
                    'Expert CQP N3 / IRATA L3 : 550-900 €/j — chantiers industriels ou encadrement d\'équipe',
                    'Paris et grandes métropoles : majorer de 15 à 25 % par rapport aux fourchettes nationales',
                    'Chantier ATEX, nucléaire, habilitation électrique : surcote 30 à 50 %',
                    'Astreinte ou travail de nuit : majoration 25-40 % à négocier au contrat',
                ],
            },
            {
                heading: 'Rédiger un devis cordiste crédible dès le premier chantier',
                body: 'Un devis, c\'est ta première carte de visite. Un donneur d\'ordre qui ne te connaît pas va évaluer ton sérieux à travers ce document autant qu\'à travers ta réputation. Un devis vague ou mal structuré, c\'est souvent un contrat perdu — même si ton prix est compétitif.\n\nDès le départ, travaille avec un modèle simple mais complet. Utilise un outil comme Zervant, Henrri ou même un modèle Word avec en-tête. La forme signale le fond : un devis sans logo ni SIRET visible, envoyé en message WhatsApp, te positionne d\'emblée comme un artisan informel.\n\nLa **clause météo** mérite une attention particulière. Le vent au-dessus de 45 km/h interrompt tout chantier en suspension — c\'est une règle de sécurité, pas une excuse. Si tu ne la mentionnes pas dans le devis, un report peut devenir un litige. Prévois également la mention de ton niveau de certification (CQP TPS niveau X ou IRATA L1/L2) et le numéro de ta police RC Pro. Certains donneurs d\'ordre professionnels l\'exigent avant de signer, et ça te distingue d\'un travailleur non déclaré. Sur le plan de prévention, c\'est à toi de le proposer — l\'OPPBTP met des modèles à disposition gratuitement.',
                listIntro: 'Ce qu\'un bon devis cordiste doit contenir :',
                list: [
                    'En-tête complet : SIRET, adresse, contact, assureur et numéro de police',
                    'Description précise : nature des travaux, surface estimée, hauteur, durée',
                    'Nombre de techniciens et leur niveau (CQP N1, N2, IRATA L1…)',
                    'Prix HT, taux de TVA applicable, prix TTC',
                    'Clause météo : report sans frais si vent > 45 km/h ou conditions dangereuses',
                    'Mention de la certification avec date d\'expiration',
                    'Délai de validité (30 jours recommandé)',
                    'Conditions de paiement (30 jours date de facture ou à réception)',
                ],
                cta: {
                    text: 'Créer mon compte cordiste en 2 minutes',
                    href: '/inscription-cordiste',
                    description: 'Profil complet, certifications affichées, accès aux missions en région.',
                    variant: 'outline',
                },
            },
            {
                heading: 'Prospecter sans budget : les 4 leviers qui marchent',
                body: 'La prospection à froid par mail ou téléphone donne peu de résultats dans le secteur des TAC. Le marché repose sur la confiance — et la confiance se construit par la preuve et la recommandation, pas par un message générique envoyé à cent syndics.\n\n**1. Ton réseau de formation.** Tes condisciples de CQP ou d\'IRATA sont tes premiers contacts professionnels. Certains vont rejoindre des ETT, d\'autres vont monter leur activité. Un technicien d\'accès sur cordes qui a trop de travail te fera remonter une mission — et vice versa. Entretiens ces liens dès la fin de formation.\n\n**2. La présence en ligne minimale.** Un profil LinkedIn complet (photo de chantier, certifications mentionnées, zone d\'intervention) et un profil LesCordistes à jour sont la base. Tu n\'as pas besoin d\'un site web en année 1 — mais tu dois être trouvable.\n\n**3. Le porte-à-porte ciblé.** Identifie les syndics de copropriété, les gestionnaires de patrimoine et les responsables maintenance dans ta zone. Un courrier court, professionnel, avec ta certification et ta zone d\'intervention suffit pour créer un premier contact. Cible les bâtiments R+5 et au-delà — ce sont eux qui ont régulièrement besoin de techniciens en suspension.\n\n**4. Les réseaux professionnels.** La SFETH (Syndicat Français des Entreprises de Travaux en Hauteur) relie les acteurs du secteur. Même sans en être adhérent, participe aux événements sectoriels (salons, journées de formation continue, recyclages triennaux) pour te faire connaître des donneurs d\'ordre et des bureaux d\'études prescripteurs. Le CATEC publie également des ressources utiles pour les entreprises qui débutent.',
            },
            {
                heading: 'Les 6 erreurs qui font rater les premières semaines',
                body: 'Ce n\'est pas le manque de compétences techniques qui freine le démarrage d\'une activité cordiste. La formation CQP ou IRATA t\'a préparé aux gestes, aux EPI, aux protocoles de sécurité et aux plans de sauvetage. Ce qui freine en début de carrière, c\'est presque toujours une combinaison d\'erreurs organisationnelles et commerciales — des points sur lesquels aucune formation technique ne t\'a préparé.\n\nLa première année est une phase de rodage. Ce qui compte, c\'est ne pas répéter les erreurs qui laissent des traces durables : une responsabilité engagée sans assurance, un tarif bradé qui devient ta norme de marché, un chantier pris hors de ta portée technique qui ternit ta réputation avant même que tu l\'aies construite. Ces 6 points reviennent systématiquement chez les indépendants dont le démarrage a été difficile. À vérifier avant chaque nouveau chantier en début d\'activité.',
                listIntro: 'À éviter absolument :',
                list: [
                    'Démarrer sans RC Pro — une seule intervention sans assurance engage ta responsabilité personnelle',
                    'Accepter des chantiers hors de ta portée — le CQP N1 travaille sous supervision N2 ou N3, pas en autonome',
                    'Oublier le plan de prévention — obligatoire même pour un nettoyage d\'une demi-journée',
                    'Sous-facturer pour décrocher le client — tu crées un référentiel prix difficile à corriger ensuite',
                    'Négliger le recyclage triennal — une certification expirée t\'exclut de tout chantier formalisé',
                    'Travailler sans contrat écrit — un devis signé vaut bien mieux qu\'un accord verbal',
                ],
                cta: {
                    text: 'Découvrir les chantiers de cette semaine',
                    href: '/jobs',
                    description: 'Missions cordiste qualifiées par région — sans intermédiaire entre toi et le client.',
                    variant: 'blue',
                },
            },
        ],
        faqs: [
            {
                q: 'Combien peut-on facturer comme cordiste débutant après le CQP ?',
                a: 'Après le CQP TPS niveau 1, comptez 280 à 380 €/j en TJM hors taxes selon la région. Les charges en micro-entreprise représentent environ 22 % du CA. Les grandes métropoles permettent de viser le haut de la fourchette.',
            },
            {
                q: 'Peut-on travailler comme cordiste indépendant juste après le CQP niveau 1 ?',
                a: 'Oui, le CQP N1 autorise à exercer en tant qu\'équipier sous supervision d\'un technicien N2 ou N3. Pour travailler en autonomie complète ou encadrer une équipe, le niveau 2 est requis. En micro-entreprise, l\'immatriculation prend 1 à 2 semaines — ensuite tu es opérationnel.',
            },
            {
                q: 'Le plan de prévention est-il obligatoire dès le premier chantier ?',
                a: 'Oui, quelle que soit la durée. Les travaux par techniques d\'accès sur cordes figurent sur la liste des travaux dangereux de l\'arrêté du 19 mars 1993 — le plan de prévention écrit est donc systématiquement obligatoire. Des modèles gratuits sont disponibles sur le site de l\'OPPBTP.',
            },
            {
                q: 'Quelle est la meilleure façon de trouver ses premiers clients cordiste ?',
                a: 'La sous-traitance auprès d\'ETT locales est la voie la plus rapide en début de carrière : tu travailles, tu accumules des références et tu évites la prospection à froid. En parallèle, inscris-toi sur LesCordistes.com pour accéder aux missions qualifiées en direct.',
            },
            {
                q: 'Quels documents faut-il avoir avant de commencer à facturer ?',
                a: 'Au minimum : un numéro SIRET (micro-entreprise ou EURL), une attestation RC Pro couvrant les travaux en hauteur sur cordes, un CQP TPS ou IRATA en cours de validité, et un modèle de devis avec en-tête. Pour les clients professionnels, une attestation URSSAF à jour peut également être demandée.',
            },
        ],
        ctaText: 'Créer mon compte cordiste',
        ctaHref: '/inscription-cordiste',
        relatedLinks: [
            { label: 'Habilitations CQP, IRATA, SPRAT', href: '/blog/habilitations-cordiste-cqp-irata-sprat' },
            { label: 'Comment les clients choisissent leur cordiste', href: '/blog/comment-choisir-son-cordiste' },
            { label: 'Voir les missions disponibles', href: '/jobs' },
            { label: 'Créer mon profil cordiste', href: '/inscription-cordiste' },
        ],
    },
    {
        slug: 'missions-cordiste-independant',
        authorSlug: 'benjamin-de-oliveira',
        title: 'Missions cordiste indépendant : trouver du travail toute l\'année',
        shortTitle: 'Missions cordiste indépendant',
        description:
            'Décrochez des missions cordiste en indépendant sans interruption : types de chantiers disponibles, plateformes spécialisées, prospection ciblée — le guide concret 2026.',
        category: 'Métier & Carrière',
        readTime: 7,
        datePublished: '2026-04-26',
        dateModified: '2026-04-26',
        intro:
            'Trouver des missions cordiste en indépendant régulièrement, sans traverser des semaines creuses qui mangent la trésorerie — c\'est là que se joue la durabilité d\'une activité en TAC. Les techniques d\'accès sur cordes génèrent une demande réelle et croissante en France : façades résidentielles, installations industrielles, ouvrages d\'art, éoliennes, inspection de structures. Mais ce marché ne s\'active pas seul. Les techniciens qui remplissent leur planning le savent : il faut diversifier les canaux, comprendre la saisonnalité et être présent là où les donneurs d\'ordre cherchent. Ce guide fait le tour des types de missions disponibles pour un cordiste indépendant, de ce qui fonctionne pour les décrocher — et comment réduire le temps passé à prospecter.',
        sections: [
            {
                heading: 'Quels types de missions pour un cordiste indépendant ?',
                body: 'Le marché est plus diversifié que beaucoup ne le pensent à la sortie de la formation CQP TPS ou IRATA. Quatre grandes familles de missions coexistent, avec des profils de rentabilité très différents.\n\n**Façade et bâtiment** : le volume le plus important en nombre de missions. Nettoyage, ravalement, traitement hydrofuge, réparation de joints, pose de systèmes anti-pigeons. Durée typique : une demi-journée à 3 jours. TJM : 280-450 €/j selon niveau et région. Ce segment est fortement saisonnier — printemps et début d\'automne concentrent 60 à 70 % des demandes.\n\n**Industrie et ouvrages d\'art** : chantiers plus longs (1 à 3 semaines), TJM plus élevé (450-900 €/j). Pétrochimie, silos, réservoirs, ponts, pylônes, éoliennes. L\'IRATA niveau 2 ou 3 est souvent exigé contractuellement. Ce segment est moins saisonnier — les arrêts techniques industriels se programment hors haute saison.\n\n**Inspection et diagnostic** : missions courtes (demi-journée à 1 jour), à haute valeur ajoutée. Rapport technique écrit, photographies, préconisations de travaux. Facturé à la mission ou au tarif journalier majoré (450-800 €/j). Accessible dès le CQP niveau 2.\n\n**Travaux spécialisés** : purge de falaise, travaux en montagne, espaces naturels, sites classés. Missions rares mais bien valorisées, souvent pour des collectivités ou des gestionnaires de parcs naturels. Requièrent des compétences complémentaires (secourisme spécialisé, habilitations spécifiques, EPI adaptés au milieu naturel).',
                listIntro: 'Les six types de missions accessibles en indépendant :',
                list: [
                    'Façade résidentielle et tertiaire (nettoyage, ravalement, joints) : 280-450 €/j',
                    'Lavage de vitres en hauteur : immeubles de bureaux, centres commerciaux, façades vitrées',
                    'Industrie et ouvrages d\'art (pétrochimie, ponts, silos, éoliennes) : 450-900 €/j',
                    'Inspection et diagnostic de structure avec rapport écrit : demi-journée à 1 jour',
                    'Traitement anti-pigeons, végétation sur bâti, urgences post-sinistre',
                    'Milieu naturel (falaise, barrage, site classé) : missions spécialisées bien valorisées',
                ],
                cta: {
                    text: 'Voir les missions ouvertes près de chez moi',
                    href: '/jobs',
                    description: 'Missions cordiste qualifiées par région et type de chantier — accès libre à l\'inscription.',
                    variant: 'light',
                },
            },
            {
                heading: 'Où trouver des missions cordiste indépendant en 2026 ?',
                body: 'Aucun canal unique ne suffit. Les cordistes indépendants qui remplissent leur planning activent plusieurs sources en parallèle.\n\n**LesCordistes.com** agrège des missions postées directement par des clients — syndics, gestionnaires de patrimoine, industriels, collectivités — qui ont déjà décidé de faire appel à un technicien sur cordes. Contrairement à un appel d\'offres classique, tu accèdes à la mission sans intermédiaire commercial. La plateforme filtre par région : tu vois ce qui est disponible dans ta zone, tu décides de postuler.\n\n**La sous-traitance auprès d\'ETT** te garantit un flux régulier sans avoir à prospecter. Inconvénient : les tarifs sont négociés en amont et tu travailles sous la responsabilité d\'une autre structure. Avantage : la relation client est entièrement gérée. Idéal pour combler les creux entre missions en direct.\n\n**Les marchés publics.** Sur BOAMP et les plateformes régionales, des collectivités et gestionnaires d\'ouvrages lancent des consultations pour des travaux sur cordes. L\'accès est plus complexe (DC1, DC2, RC Pro adaptée) mais les missions sont souvent longues et mieux valorisées que le marché privé.\n\n**Le réseau professionnel.** Un cordiste satisfait qui ne peut pas prendre une mission te la transmet. Une ETT qui cherche un équipier te contacte. Ce canal est lent à construire — 12 à 24 mois — mais il devient ensuite le plus productif et le moins chronophage.',
                list: [
                    'LesCordistes.com : missions qualifiées, filtrées par région, sans intermédiaire',
                    'Sous-traitance ETT : flux régulier, tarifs négociés en amont',
                    'Marchés publics (BOAMP, plateformes régionales) : missions longues, accès administratif',
                    'Réseau professionnel : canal le plus efficace à long terme, lent à construire',
                    'LinkedIn et profil en ligne : visibilité passive, génère des demandes entrantes',
                    'Syndics et gestionnaires de patrimoine : prospection directe, relation récurrente',
                ],
                cta: {
                    text: 'Créer mon compte cordiste en 2 minutes',
                    href: '/inscription-cordiste',
                    description: 'Profil visible, certifications affichées, accès immédiat aux missions de ta région.',
                    variant: 'outline',
                },
            },
            {
                heading: 'Optimiser son profil pour que les missions viennent à toi',
                body: 'La prospection active prend du temps non facturé. L\'objectif à moyen terme, c\'est d\'inverser la logique : que les donneurs d\'ordre te trouvent, pas l\'inverse. Ça se construit avec quelques leviers simples.\n\n**Les certifications visibles.** Un profil complet — niveau CQP TPS, date de validité, zone d\'intervention précise (département ou rayon kilométrique), types de missions acceptées — génère des demandes entrantes. Les clients qui cherchent un cordiste ne veulent pas écrire à dix prestataires : ils choisissent le profil le plus complet et le plus réactif.\n\n**La rapidité de réponse.** Sur LesCordistes, les missions sont souvent attribuées au premier profil pertinent qui répond. Un délai de réponse de moins de 2 heures te positionne avant les techniciens moins réactifs. Active les alertes pour les nouvelles missions dans ta zone.\n\n**Les photos de chantier.** Avant/après, mise en situation en suspension, résultats obtenus — une galerie de 8 à 12 photos de chantiers réels vaut plus qu\'un long texte. Elle prouve ce que tu sais faire et rassure un donneur d\'ordre sans référence préalable sur toi. Harnais cuissard visible, longe double, point d\'ancrage identifiable : ça parle immédiatement au client professionnel qui sait ce qu\'il commande.\n\n**Les avis clients.** Après chaque mission, demande un retour écrit au client. Une note et deux phrases sur la qualité d\'exécution, la ponctualité et le plan de prévention constituent ta crédibilité accumulée. Chaque avis supplémentaire réduit le frein du prochain client à te confier une mission sans références.',
            },
            {
                heading: 'Saisonnalité des missions cordiste : combler les creux',
                body: 'La haute saison pour les travaux de façade va de mars à octobre, avec des pics en avril-mai et septembre. L\'hiver est la période la plus difficile pour les indépendants dont l\'activité se concentre sur la façade résidentielle. Mais la saisonnalité est gérable si tu l\'anticipes.\n\n**Le segment industriel est peu saisonnier.** Les arrêts techniques et les maintenances préventives se programment souvent en hiver (novembre à février), quand la production est réduite. Si tu as l\'IRATA ou une expérience en pétrochimie, cible ce segment dès l\'automne pour remplir le creux hivernal. Un seul chantier de 10 jours à 550 €/j compense 3 semaines de façade creuse.\n\n**Les missions d\'inspection et de diagnostic** se font toute l\'année. Les bailleurs sociaux, les collectivités et les assureurs commandent des états des lieux de façade indépendamment des saisons — souvent après un sinistre (tempête, gel) ou en préparation d\'un ravalement obligatoire.\n\n**La diversification géographique** complète le dispositif. Un cordiste basé en Bretagne peut compléter son planning hivernal sur des missions industrielles dans les zones pétrochimiques du Grand Ouest (Saint-Nazaire, Donges, Lorient) — des chantiers qui ne souffrent pas des conditions côtières et qui cherchent des techniciens certifiés IRATA à moins de 3 heures de déplacement.',
                listIntro: 'Les 4 types de missions disponibles même en basse saison :',
                list: [
                    'Arrêts techniques industriels : pétrochimie, énergie, agroalimentaire (novembre à février)',
                    'Inspection et diagnostic de structure pour bailleurs sociaux et collectivités',
                    'Travaux urgents post-tempête : la Toussaint et les épisodes venteux génèrent des demandes',
                    'Maintenance préventive d\'ouvrages d\'art : programmée hors saison de navigation ou de trafic',
                ],
                cta: {
                    text: 'Découvrir les chantiers de cette semaine',
                    href: '/jobs',
                    description: 'Missions disponibles en temps réel, toute l\'année, filtrées par région.',
                    variant: 'blue',
                },
            },
            {
                heading: 'Sur LesCordistes.com : comment les missions arrivent concrètement',
                body: 'LesCordistes est une marketplace qui connecte des clients ayant un besoin de travaux en hauteur avec des cordistes indépendants ou des entreprises. Le modèle est conçu pour réduire le temps de prospection côté pro.\n\n**Le client décrit son chantier** — localisation, type de travaux, urgence, contraintes de site. La mission est qualifiée avant d\'être publiée : les demandes floues ou hors périmètre ne sont pas diffusées, ce qui garantit la pertinence de ce que tu reçois.\n\n**Tu consultes les missions disponibles** dans ta zone sans frais. Le descriptif, la localisation approximative et le type de travaux sont accessibles librement depuis ton espace pro. Tu évalues si la mission correspond à ton profil et ta disponibilité avant d\'engager quoi que ce soit.\n\n**Tu débloques les coordonnées du client** pour te positionner sur la mission. Chaque chantier coûte 1, 3 ou 5 crédits selon son potentiel (standard / important / gros chantier). Les packs : Starter 3 crédits/60 € (20 €/contact), Pro 10 crédits/150 € (15 €/contact, le plus populaire), Business 20 crédits/280 € (14 €/contact). L\'accès aux coordonnées complètes te permet de contacter le client directement, sans intermédiaire.\n\nPour un cordiste actif qui convertit 2 prises de contact sur 5 à un TJM moyen de 380 €/j, un contact à 15 € est rentabilisé sur la première heure de la première mission décrochée. C\'est une logique d\'investissement, pas un abonnement à l\'aveugle.',
            },
        ],
        faqs: [
            {
                q: 'Comment trouver des missions cordiste en indépendant ?',
                a: 'Pour trouver des missions cordiste en indépendant, activez plusieurs canaux : plateformes spécialisées (LesCordistes.com), sous-traitance auprès d\'ETT locales, marchés publics et réseau professionnel. Aucun canal unique ne suffit — la combinaison garantit un flux régulier.',
            },
            {
                q: 'Combien de jours facturés par mois peut-on réaliser en indépendant ?',
                a: 'En haute saison (avril à septembre), un cordiste indépendant actif peut enchaîner 12 à 18 jours facturés par mois selon les types de missions. En basse saison concentrée sur la façade résidentielle, descendre à 6-8 jours est courant. Le segment industriel permet de lisser cet écart.',
            },
            {
                q: 'Les missions cordiste sont-elles disponibles toute l\'année ?',
                a: 'La façade résidentielle est saisonnière (mars à octobre). En revanche, les missions industrielles, les inspections de structure et les arrêts techniques se programment toute l\'année. Diversifier les segments couvre l\'essentiel des creux hivernaux.',
            },
            {
                q: 'Faut-il un statut particulier pour accéder aux missions sur LesCordistes ?',
                a: 'Non, tout statut juridique est accepté : micro-entreprise, EURL, SASU, ETT. L\'important est d\'avoir un SIRET actif, une attestation RC Pro couvrant les travaux en hauteur sur cordes, et une certification CQP TPS ou IRATA valide.',
            },
            {
                q: 'Peut-on cumuler plusieurs types de missions cordiste en indépendant ?',
                a: 'Oui, et c\'est recommandé pour lisser la saisonnalité. Un cordiste CQP niveau 2 peut enchaîner missions de façade au printemps, chantier industriel en automne, et missions d\'inspection en hiver. La diversité des segments réduit la dépendance à un seul flux de demande.',
            },
        ],
        ctaText: 'Créer mon compte cordiste',
        ctaHref: '/inscription-cordiste',
        relatedLinks: [
            { label: 'Premier chantier après le CQP', href: '/blog/premier-chantier-cordiste-apres-cqp' },
            { label: 'Habilitations CQP, IRATA, SPRAT', href: '/blog/habilitations-cordiste-cqp-irata-sprat' },
            { label: 'Voir les missions disponibles', href: '/jobs' },
            { label: 'Créer mon profil cordiste', href: '/inscription-cordiste' },
        ],
    },
    {
        slug: 'trouver-cordiste-marseille',
        authorSlug: 'anthony-profit',
        title: 'Trouver un cordiste à Marseille : tarifs, zones et guide 2026',
        shortTitle: 'Trouver un cordiste à Marseille',
        description:
            'Trouvez un cordiste certifié à Marseille pour vos travaux en hauteur. Tarifs 2026, zones couvertes, contraintes mistral et patrimoine — le guide pratique.',
        category: 'Guide achat',
        readTime: 8,
        datePublished: '2026-04-28',
        dateModified: '2026-04-28',
        intro:
            'Marseille concentre, après Paris et Lyon, l\'une des demandes les plus intenses de France en travaux en hauteur. Sa géographie singulière — le Vieux-Port aux façades calcaires, le quartier du Panier aux ruelles étroites impossibles à mécaniser, les grandes barres des années 1970 du Plan d\'Aou ou de Frais-Vallon, et le Grand Port Maritime de Marseille (GPMM) avec ses silos et ses terminaux — crée des situations que seul un cordiste à Marseille habitué de ces terrains sait aborder. À quoi s\'ajoute la contrainte locale la plus imprévisible : le mistral. Trouver le bon prestataire ne se résume pas à obtenir le devis le moins cher : c\'est identifier un technicien qui connaît les fenêtres météo locales, les matériaux des façades marseillaises — pierre de Cassis, enduit à la chaux, béton brut — et les exigences des Architectes des Bâtiments de France sur les secteurs classés. Ce guide vous donne les clés pour faire le bon choix en 2026.',
        sections: [
            {
                heading: 'Marseille : pourquoi les travaux cordistes y sont-ils spécifiques ?',
                body: 'La troisième agglomération de France présente un profil architectural et climatique sans équivalent en Europe du Sud. Le Vieux-Port et ses quais côtoient les tours de la Joliette dans l\'Euroméditerranée, les immeubles de La Canebière jouxtent les cités des années 1960 des quartiers Nord — et tout cela surplombe la mer. Ce contexte maritime impose une contrainte permanente : les embruns salins dégradent les enduits, les ferronneries et les fixations métalliques deux à trois fois plus vite qu\'à l\'intérieur des terres. Un cordiste à Marseille doit sélectionner des EPI (équipements de protection individuelle) et des matériaux de traitement certifiés pour environnement marin — harnais avec sangles anti-sel, cordes traitées UV, produits hydrofuges compatibles avec le calcaire local.\n\nLe mistral représente l\'autre spécificité majeure. Ce vent de nord-ouest peut dépasser 80 à 100 km/h en rafales et interdit tout travail en suspension dès que la vitesse moyenne atteint 50 km/h. Les cordistes marseillais expérimentés calent leurs plannings sur les fenêtres météo de 3 à 5 jours consécutifs sans vent fort — ce qui peut décaler un chantier de plusieurs semaines en hiver. Ce facteur doit être anticipé dès la signature du devis et intégré dans les délais contractuels.\n\nÀ ces réalités s\'ajoute la densité industrielle du Grand Port Maritime de Marseille (GPMM), deuxième port de Méditerranée, et des zones pétrochimiques de Fos-sur-Mer et de l\'étang de Berre. Sur ces chantiers, la certification IRATA (niveau 2 ou 3) est souvent exigée contractuellement, et les intervenants travaillent avec des plans de prévention spécifiques aux risques chimiques.',
            },
            {
                heading: 'Quels travaux un cordiste peut-il réaliser à Marseille ?',
                body: 'Les missions cordiste à Marseille couvrent un spectre très large, du bâtiment résidentiel aux ouvrages industriels. La technique d\'accès sur cordes (TAC) permet d\'intervenir sur n\'importe quelle façade ou structure en hauteur dès lors que des points d\'ancrage fiables existent ou peuvent être installés en toiture — sans échafaudage ni nacelle, sans occupation de la voie publique. Le démarrage est possible sous 48 à 72 heures sur un chantier simple, contre 1 à 2 semaines pour un montage d\'échafaudage complet.',
                listIntro: 'Les missions les plus fréquentes à Marseille et dans la métropole :',
                list: [
                    'Nettoyage de façades en calcaire ou en pierre de Cassis — produits adaptés aux embruns et à la végétation marine',
                    'Ravalement et réfection d\'enduit sur immeubles haussmanniens et Art déco du 6e et du 8e arrondissement',
                    'Lavage de vitres en hauteur : tours de la Joliette, Euroméditerranée, immeubles tertiaires du 2e arrondissement',
                    'Réparation de toitures en tuiles romanes sur les villas des arrondissements Sud (8e, 9e, 12e)',
                    'Traitement anti-pigeons (filets, pics, répulsifs) sur corniches, balcons et façades du Vieux-Port',
                    'Inspection et diagnostic structurel de façade après mistral ou épisode méditerranéen (fissures, décrochements)',
                    'Hydrofugation et traitement imperméabilisant sur façades exposées aux embruns salins',
                    'Travaux industriels sur silos, terminaux portuaires, cheminées et structures métalliques du GPMM',
                    'Pose et vérification de lignes de vie et systèmes anti-chute permanents sur toitures et quais',
                    'Purge et sécurisation de falaises calcaires dans les secteurs de La Treille, La Valentine et aux abords des Calanques',
                ],
                cta: {
                    text: 'Décrire mes travaux en 2 minutes',
                    href: '/post-job',
                    description: 'Façade calcaire, immeuble de la Canebière ou installation portuaire — publiez votre besoin gratuitement.',
                    variant: 'light',
                },
            },
            {
                heading: 'Le Panier et les secteurs ABF : contraintes patrimoniales à anticiper',
                body: 'Le quartier du Panier, perché sur la colline qui surplombe le Vieux-Port, est le plus ancien quartier de Marseille. Son tissu urbain médiéval — ruelles en pente, façades en calcaire ocre, escaliers millénaires — est classé en secteur sauvegardé et placé sous le contrôle étroit des Architectes des Bâtiments de France (ABF). Toute intervention modifiant l\'aspect extérieur d\'un bâtiment, même un simple nettoyage de façade, requiert un avis préalable dès lors que le bâtiment est situé dans le périmètre de protection d\'un monument historique.\n\n**Pierre de Cassis** : ce calcaire blanc-jaune, extrait depuis l\'Antiquité dans les carrières de Cassis à 30 km de Marseille, constitue le matériau de construction historique de la ville. Il est extrêmement sensible aux produits de nettoyage chimiques acides. Seuls les produits alcalins doux ou les techniques de micro-gommage homologués ABF peuvent être utilisés — un cordiste expérimenté sur le patrimoine marseillais les maîtrise et les mentionne explicitement dans son devis.\n\n**Points d\'ancrage non destructifs** : dans le secteur sauvegardé, percer une façade pour installer un ancrage permanent est soumis à autorisation préalable. Les cordistes expérimentés utilisent des systèmes temporaires posés sur le faîtage ou fixés sur des structures existantes. Cette contrainte doit être évaluée lors d\'une visite préalable systématique du site.\n\n**Euroméditerranée** : le nouveau quartier d\'affaires autour de la Joliette (2e arrondissement) échappe aux contraintes ABF mais impose ses propres exigences de sécurité, notamment pour les façades vitrées double peau des immeubles tertiaires récents. Les délais d\'autorisation en secteur protégé peuvent atteindre 15 à 30 jours ouvrés — intégrez-les dans votre planning.',
            },
            {
                heading: 'Tarifs d\'un cordiste à Marseille en 2026',
                body: 'Le marché marseillais se situe légèrement en dessous de Lyon, avec des tarifs environ 20 à 25 % inférieurs à ceux pratiqués en Île-de-France. La disponibilité d\'un vivier de cordistes qualifiés en région PACA et la moindre tension sur la main-d\'œuvre qualifiée contribuent à des prix compétitifs. Toutefois, les chantiers industriels du GPMM ou de l\'étang de Berre, qui requièrent des compétences IRATA spécialisées et des plans de prévention renforcés, affichent des tarifs proches des standards parisiens.',
                listIntro: 'Fourchette indicative à Marseille (HT) :',
                list: [
                    'Journée cordiste (8h, 1 technicien) : 350 € à 600 € selon spécialité et type de chantier',
                    'Nettoyage de façade au m² : 7 € à 15 € selon le matériau et le niveau d\'encrassement',
                    'Lavage de vitres en hauteur : 3 € à 6 € par m²',
                    'Inspection technique avec rapport écrit : 450 € à 900 € la demi-journée',
                    'Chantier industriel GPMM (IRATA niveau 2 ou 3 exigé) : 580 € à 850 € HT/j par technicien',
                    'Traitement hydrofuge sur façade maritime : tarif à la surface — devis indispensable selon exposition',
                ],
                cta: {
                    text: 'Comparer des devis sans engagement',
                    href: '/post-job',
                    description: 'Obtenez plusieurs offres de cordistes certifiés sur Marseille pour votre budget réel.',
                    variant: 'outline',
                },
            },
            {
                heading: 'Bien choisir son cordiste à Marseille : 5 critères qui font la différence',
                body: 'Marseille dispose d\'un vivier de cordistes qualifiés, mais la qualité varie considérablement d\'un prestataire à l\'autre. Voici les 5 points de vigilance spécifiques au marché marseillais.\n\n**1. La gestion du mistral intégrée au contrat** — Un cordiste professionnel mentionne explicitement les conditions météo d\'annulation et de report dans son devis. Vérifiez que le contrat précise les seuils de vent (généralement 50 km/h en rafales) et les modalités de report sans pénalité. Un prestataire qui n\'aborde pas ce point sous-estime les contraintes locales.\n\n**2. La certification adaptée au chantier** — Pour un bâtiment résidentiel ou du patrimoine, le CQP TPS (niveau 2 minimum pour encadrer une équipe) est la référence française. Pour les chantiers du GPMM ou de Fos-sur-Mer, un IRATA niveau 2 ou 3 est souvent exigé contractuellement. Demandez la copie des certificats avec date d\'expiration : CQP et IRATA sont valables 3 ans.\n\n**3. La connaissance des matériaux locaux** — Un cordiste habitué au Panier ou aux villas du 8e sait immédiatement quel produit utiliser sur la pierre de Cassis et quels ancrages temporaires ne risquent pas de dégrader une corniche en calcaire. Cette expertise évite des erreurs coûteuses et des conflits avec les ABF.\n\n**4. La RC Pro couvrant l\'environnement marin** — Vérifiez que l\'attestation mentionne explicitement les techniques d\'accès sur cordes (TAC) et les interventions en milieu maritime. Certaines polices excluent les dommages liés à la corrosion par embruns.\n\n**5. Le plan de prévention systématique** — Les travaux en hauteur figurent dans la liste des travaux dangereux de l\'arrêté du 19 mars 1993. Sur les chantiers industriels du port, un plan de prévention spécifique aux risques chimiques est obligatoire. Un prestataire sérieux — qu\'il soit membre de la SFETH ou non — le propose spontanément après une visite commune du site.',
                cta: {
                    text: 'Trouver mon cordiste à Marseille',
                    href: '/post-job',
                    description: 'Des cordistes habitués à Marseille et à ses contraintes reçoivent votre demande et répondent sous 48h.',
                    variant: 'blue',
                },
            },
            {
                heading: 'Zones couvertes : Marseille intra-muros et Métropole Aix-Marseille-Provence',
                body: 'Les cordistes basés dans la région marseillaise couvrent généralement l\'ensemble des 16 arrondissements de Marseille, de La Canebière (1er) aux calanques de Sormiou et Morgiou (9e) en passant par les quartiers Nord (13e à 16e) et les collines de Plan de Cuques et de La Treille (11e, 12e). La grande majorité des prestataires interviennent dans ce périmètre sans facturer de frais kilométriques supplémentaires.\n\nAu-delà de la ville, les cordistes marseillais couvrent les principales communes de la Métropole Aix-Marseille-Provence : Aix-en-Provence, Aubagne, Cassis, La Ciotat, Vitrolles, Marignane, Martigues, Istres, Salon-de-Provence et les communes de l\'étang de Berre (Port-de-Bouc, Fos-sur-Mer). Pour les chantiers industriels du complexe pétrochimique, des cordistes IRATA locaux sont disponibles avec des délais courts.\n\nAu-delà de la métropole, des frais kilométriques s\'appliquent généralement à partir de 50 à 70 km du centre de Marseille — comptez entre 0,40 € et 0,70 € HT par kilomètre. Les cordistes marseillais acceptent fréquemment des missions dans le Var (Toulon, Hyères, La Seyne-sur-Mer) et dans le Vaucluse (Avignon, Arles, Tarascon). La région PACA concentre un vivier important de techniciens d\'accès difficile (TAC), en partie alimenté par la demande industrielle continue du port et des zones pétrochimiques.',
            },
        ],
        faqs: [
            {
                q: 'Combien coûte un cordiste à Marseille ?',
                a: 'Comptez entre 350 € et 600 € HT par journée à Marseille selon la spécialité et le type de chantier. Le nettoyage de façade oscille entre 7 € et 15 € HT au m². C\'est environ 20 % moins cher qu\'à Paris.',
            },
            {
                q: 'Le mistral peut-il annuler un chantier cordiste à Marseille ?',
                a: 'Oui. Dès que les rafales dépassent 50 km/h, le travail en suspension est interrompu pour des raisons de sécurité. Un cordiste sérieux intègre cette contrainte dans le contrat : seuils d\'annulation et modalités de report sans pénalité. En hiver, le mistral peut décaler un chantier de 1 à 3 semaines.',
            },
            {
                q: 'Quel délai pour trouver un cordiste disponible à Marseille ?',
                a: 'En dehors des pics saisonniers, comptez 1 à 3 semaines entre la prise de contact et le démarrage. Au printemps et en début d\'été (avril à juillet), les cordistes de la région PACA sont souvent complets 3 à 5 semaines à l\'avance. Pour une urgence post-mistral, certains prestataires interviennent sous 24 à 72 heures avec une majoration tarifaire.',
            },
            {
                q: 'Un cordiste marseillais peut-il intervenir à Aix-en-Provence ou dans l\'étang de Berre ?',
                a: 'Oui. La Métropole Aix-Marseille-Provence est couverte intégralement, souvent sans surcoût kilométrique. Pour les chantiers industriels de l\'étang de Berre et de Fos-sur-Mer, des cordistes IRATA locaux sont disponibles. Des frais de déplacement s\'appliquent au-delà de 50 à 70 km du centre de Marseille.',
            },
        ],
        ctaText: 'Trouver mon cordiste à Marseille',
        ctaHref: '/post-job',
        relatedLinks: [
            { label: 'Cordistes certifiés à Marseille', href: '/cordiste-marseille' },
            { label: 'Prix d\'un cordiste en 2026', href: '/prix-cordiste' },
            { label: 'Trouver un cordiste à Lyon', href: '/blog/trouver-cordiste-lyon' },
            { label: 'Travaux de façade sans échafaudage', href: '/blog/travaux-facade-sans-echafaudage' },
        ],
    },
    {
        slug: 'elagage-abattage-grande-hauteur-cordiste',
        authorSlug: 'benjamin-de-oliveira',
        title: 'Élagage et abattage de grande hauteur : quand le cordiste s\'impose',
        shortTitle: 'Élagage et abattage grande hauteur',
        description:
            'Élagage et abattage de grande hauteur : pourquoi recourir à un cordiste-élagueur, tarifs 2026, contraintes urbaines et démêlés réglementaires.',
        category: 'Travaux & technique',
        readTime: 9,
        datePublished: '2026-04-30',
        dateModified: '2026-04-30',
        intro:
            'Au-delà de 25 mètres, l\'élagage et l\'abattage de grande hauteur sortent du périmètre de l\'élagueur-grimpeur traditionnel. Platanes d\'alignement parisiens, pins parasols battus par le mistral, séquoias de parcs urbains, chênes centenaires fragilisés par la sécheresse : ce sont des arbres qui touchent les bâtiments, surplombent la voie publique ou côtoient des lignes électriques. Le cordiste-élagueur, formé aux techniques d\'accès sur cordes industrielles, est alors le seul intervenant capable d\'opérer en sécurité, par démontage progressif, sans endommager l\'environnement immédiat. Ce guide explique quand y recourir, comment se déroule le chantier, ce que coûte l\'intervention en 2026 et où la demande est la plus forte en France.',
        leadForm: {
            title: 'Élagage ou abattage en grande hauteur ?',
            subtitle: 'Recevez 3 devis cordistes-élagueurs sous 48h · gratuit, sans engagement',
            defaultCategory: 'pruning',
            ctaLabel: 'Recevoir mes devis cordiste-élagueur',
        },
        sections: [
            {
                heading: 'Pourquoi l\'élagage de grande hauteur exige un cordiste, pas un élagueur classique',
                body: 'L\'élagueur-grimpeur traditionnel travaille avec une corde unique, des griffes (pour les abattages) et une nacelle quand l\'arbre est accessible par la voirie. Sa zone de confort se situe entre 8 et 20 mètres, dans des configurations où la cime est saine et où l\'arbre n\'est pas adossé à un bâti.\n\nAu-delà de 25 mètres, ou lorsque l\'arbre surplombe une toiture, une voie publique, des lignes haute tension ou un monument classé, le cordiste-élagueur prend le relais. Il intervient avec une **double corde de sécurité** (corde de travail + corde de secours indépendante), des **points d\'ancrage redondants** (généralement deux par étage de descente) et les techniques de **rope rigging** issues de l\'industrie : descente contrôlée par moufle, billon retenu, plateforme suspendue ponctuelle.\n\nLes profils qui combinent les deux compétences sont rares. Un cordiste élagueur dispose au minimum du **CQP TPS niveau 1** ou de l\'**IRATA Level 1**, doublé d\'un **CS Arboriste élagueur** ou d\'un **CSE** (Certificat de Spécialisation Élagage et Soin aux Arbres). Sur les grands sujets remarquables, l\'European Tree Worker (ETW) est un plus. Cette double qualification justifie un surcoût de 30 à 50 % par rapport à un élagueur classique, mais elle rend possible des chantiers que personne d\'autre ne peut prendre en charge.',
            },
            {
                heading: 'Les situations où l\'abattage par démontage est la seule option viable',
                body: 'L\'abattage classique au pied — qui consiste à faire tomber l\'arbre d\'un bloc dans une zone de chute — est interdit dès que l\'environnement n\'est pas dégagé sur 1,5 fois la hauteur de l\'arbre. En contexte urbain ou semi-urbain, c\'est presque toujours le cas. L\'abattage par démontage devient alors obligatoire.',
                listIntro: 'Le démontage en hauteur s\'impose dans les configurations suivantes :',
                list: [
                    'Arbre à moins de 30 mètres d\'un bâtiment habité, d\'un mur de clôture ou d\'une véranda',
                    'Sujet en bord de voie publique (voirie, trottoir, parking de copropriété)',
                    'Arbre à proximité de lignes électriques BT/MT — la sécurisation impose la coordination avec Enedis',
                    'Arbre malade ou fragilisé (chancre, pourriture du collet, fissures de tronc) — la chute serait imprévisible',
                    'Sujet remarquable ou protégé en Espace Boisé Classé (EBC), où la zone de chute est interdite',
                    'Arbre adossé à une falaise, un talus ou un cours d\'eau, où la billonnaison conventionnelle n\'est pas sécurisable',
                    'Sujet dans une cour intérieure d\'immeuble, sans accès possible pour une nacelle',
                ],
                cta: {
                    text: 'Décrire mon arbre dangereux en 2 minutes',
                    href: '/post-job',
                    description: 'Plusieurs cordistes-élagueurs reçoivent votre demande et vous transmettent un devis sous 48h.',
                    variant: 'light',
                },
            },
            {
                heading: 'Comment se déroule un chantier d\'abattage par démontage en hauteur',
                body: 'Un démontage propre suit une séquence rigoureuse. Tout écart compromet la sécurité du chantier et peut rendre l\'arbre instable au mauvais moment.',
                listIntro: 'Les étapes-clés d\'un démontage en grande hauteur :',
                list: [
                    '1. **Reconnaissance** — diagnostic phytosanitaire, mesure de hauteur, identification des points faibles, analyse de l\'environnement (bâti, voirie, réseaux aériens)',
                    '2. **Plan de prévention** et déclaration de travaux à proximité de réseaux (DT-DICT) si lignes électriques ou télécoms à moins de 5 m',
                    '3. **Sécurisation au sol** — périmètre de protection, balisage voirie, coordination avec gestionnaire de réseau si nécessaire',
                    '4. **Pose des points d\'ancrage** — sangles arborico-larges sur fourches saines, anneau d\'ancrage haut, contrôle de tenue',
                    '5. **Démontage progressif** — coupe des branches charpentières par sections, descente en rétention via moufle ou treuil',
                    '6. **Billonnage du tronc** — abattage du fût par segments d\'1,5 à 3 mètres, retenue par corde dynamique, dépose contrôlée au sol',
                    '7. **Dessouchage** — broyage de souche ou rognage selon contrainte du site (souvent en sous-traitance)',
                    '8. **Évacuation et broyage** — bois en filière biomasse ou paillage, branches en compostage municipal',
                ],
            },
            {
                heading: 'Tarifs 2026 d\'un cordiste-élagueur en France',
                body: 'Les fourchettes ci-dessous correspondent à la moyenne nationale observée chez les cordistes-élagueurs certifiés. Le coût final dépend de la hauteur réelle de l\'arbre, de l\'accessibilité du site, des contraintes de circulation et de l\'évacuation des bois.\n\n**Fourchettes indicatives HT en 2026 :**',
                list: [
                    'Journée cordiste-élagueur (équipe de 2, 8h) : **800 € à 1 500 € HT** — surcoût d\'environ 30 à 50 % vs élagueur grimpeur classique',
                    'Élagage de couronne sur grand sujet (platane, séquoia, pin parasol) : **600 € à 2 200 € HT** par arbre selon hauteur',
                    'Abattage par démontage d\'un arbre de 20 à 30 m en milieu urbain : **1 200 € à 3 500 € HT**',
                    'Abattage d\'un sujet de plus de 30 m avec coordination Enedis ou ABF : **3 000 € à 8 000 € HT**',
                    'Sécurisation d\'urgence après tempête (24-72h) : majoration de 30 à 60 % sur tarif de base',
                    'Dessouchage par rognage : **150 € à 600 € HT** selon diamètre et accessibilité',
                ],
                cta: {
                    text: 'Comparer plusieurs devis d\'élagage cordiste',
                    href: '/post-job',
                    description: 'Publiez votre demande gratuitement, recevez 3 devis détaillés de cordistes-élagueurs vérifiés.',
                    variant: 'outline',
                },
            },
            {
                heading: 'Réglementation et responsabilités : ce qui change quand l\'arbre est dangereux',
                body: 'Avant tout abattage, il faut vérifier que l\'arbre n\'est pas protégé. Plusieurs régimes coexistent et leur méconnaissance expose le donneur d\'ordre à des sanctions allant jusqu\'à 300 000 € d\'amende et la replantation imposée.\n\n**Espace Boisé Classé (EBC)** — défini au PLU local, l\'EBC interdit tout changement d\'affectation et soumet l\'abattage à déclaration préalable en mairie (délai 1 mois). En cas d\'arbre dangereux, une dérogation est possible mais l\'urgence doit être documentée par expertise phytosanitaire.\n\n**Alignements protégés** — depuis la loi du 8 août 2016 (article L. 350-3 du Code de l\'environnement), les alignements d\'arbres bordant les voies publiques sont protégés. Toute coupe nécessite une autorisation préfectorale, sauf danger imminent attesté.\n\n**Abords de monument historique** — dans les 500 m d\'un MH classé, l\'avis des Architectes des Bâtiments de France (ABF) est requis. Délai 2 à 3 mois en moyenne.\n\n**Code du travail** — pour l\'employeur ou le donneur d\'ordre : le **plan de prévention** (R. 4513-1) est obligatoire dès qu\'il y a coactivité, et le **PPSPS** dès que le chantier dépasse 30 jours ou 500 hommes-jours. Pour le travail sur cordes, l\'article R. 4323-89 impose deux supports indépendants — le cordiste-élagueur respecte cette règle nativement, l\'élagueur classique non.',
                cta: {
                    text: 'Publier ma mission d\'élagage maintenant',
                    href: '/post-job',
                    description: 'Des cordistes-élagueurs disponibles dans votre département reçoivent votre demande sous 24h.',
                    variant: 'blue',
                },
            },
            {
                heading: 'Spécificités locales : où la grande hauteur est la norme',
                body: 'La demande en cordiste-élagueur n\'est pas répartie uniformément en France. Certaines villes concentrent un patrimoine arboré atypique qui rend la double qualification quasi-obligatoire.',
                listIntro: 'Cinq zones où l\'élagage de grande hauteur structure le marché :',
                list: [
                    '**Paris et Île-de-France** — alignements de platanes (jusqu\'à 35 m) sur les grands boulevards, marronniers du jardin du Luxembourg, séquoias des parcs Monceau et Buttes-Chaumont. Contraintes ABF systématiques en intra-muros, AOT obligatoire pour neutralisation de voirie.',
                    '**Marseille et Côte d\'Azur (Nice, Toulon, Cannes)** — pins parasols et pins d\'Alep fragilisés par les épisodes mistral à 100 km/h, palmiers Phoenix décimés par le charançon rouge nécessitant abattage sanitaire en urgence, embruns marins exigeant des EPI et points d\'ancrage en inox AISI 316L marine-grade.',
                    '**Bordeaux et Sud-Ouest** — chênes pédonculés bicentenaires des parcs (Jardin Public, Chartrons) fragilisés par la sécheresse récurrente, pins maritimes du Médoc en zone urbaine côtière, contraintes patrimoniales sur le centre UNESCO.',
                    '**Lyon et région lyonnaise** — platanes du parc de la Tête d\'Or (certains > 30 m), arbres remarquables des berges du Rhône classés au patrimoine local, pression réglementaire forte sur les EBC de la Métropole.',
                    '**Nantes, Brest, façade atlantique** — sécurisation post-tempête (Ciaran 2023, Domingos 2023) sur grands sujets fragilisés, chênes têtards du Marais breton, sapins Douglas des parcs reconvertis en arboretums.',
                ],
            },
            {
                heading: 'Cordiste, élagueur grimpeur ou nacelle : comment choisir',
                body: 'Trois solutions coexistent pour les travaux d\'élagage. Aucune n\'est universelle. Le choix se fait sur trois critères : hauteur, accessibilité, complexité de la chute.\n\n**Nacelle élévatrice** — la solution la moins coûteuse quand l\'accès véhicule est possible jusqu\'au pied de l\'arbre. Limitée à 18-25 m de hauteur de travail pour les modèles courants. Inutilisable sur sol meuble, en cour intérieure, ou si la voirie ne supporte pas le poids. Tarif journée : 350 à 700 € HT selon modèle.\n\n**Élagueur grimpeur classique** — adapté aux sujets sains de 8 à 20 m, dans des environnements dégagés ou semi-dégagés. Il utilise une corde unique avec descendeur, des griffes pour l\'abattage, et abat l\'arbre d\'un bloc quand la zone de chute est sécurisable. Tarif journée : 400 à 900 € HT selon expérience.\n\n**Cordiste-élagueur** — au-delà de 25 m, ou en présence de bâti, voirie, lignes ou réglementation patrimoniale. Double corde, ancrages redondants, démontage progressif par billons retenus. Tarif journée : 800 à 1 500 € HT en équipe de 2.\n\nLa règle pratique : si la zone de chute fait moins de 1,5 fois la hauteur de l\'arbre dans toutes les directions, ou si l\'arbre dépasse 25 m, ne sollicitez que des cordistes-élagueurs.',
            },
        ],
        faqs: [
            {
                q: 'Quel est le prix d\'un abattage par démontage en grande hauteur en 2026 ?',
                a: 'Comptez entre 1 200 € et 3 500 € HT pour un arbre de 20 à 30 mètres en milieu urbain, et 3 000 € à 8 000 € HT pour un sujet de plus de 30 m avec coordination Enedis ou avis ABF. Les facteurs de variation : hauteur réelle, accessibilité, contraintes de voirie, gestion du bois et du dessouchage.',
            },
            {
                q: 'Faut-il une autorisation pour abattre un arbre de plus de 20 mètres ?',
                a: 'Pas systématiquement, mais souvent. Vérifier d\'abord le PLU communal : si l\'arbre est en Espace Boisé Classé, l\'abattage est soumis à déclaration préalable en mairie (1 mois). En alignement de voie publique (loi du 8 août 2016), une autorisation préfectorale est requise sauf danger imminent attesté. À moins de 500 m d\'un monument historique, l\'avis ABF est obligatoire (2 à 3 mois).',
            },
            {
                q: 'Cordiste-élagueur ou élagueur grimpeur traditionnel : quelle différence concrète ?',
                a: 'L\'élagueur grimpeur travaille avec une corde unique et des griffes, sur des sujets sains de 8 à 20 mètres dans des environnements dégagés. Le cordiste-élagueur ajoute une seconde corde de sécurité indépendante, des ancrages redondants et les techniques de rope rigging industriel : il intervient au-delà de 25 m, sur arbres adossés au bâti, en bord de voirie ou sous lignes électriques. La double certification CQP TPS + CS Arboriste justifie un surcoût de 30 à 50 %.',
            },
            {
                q: 'Combien de temps faut-il pour abattre un arbre de 30 mètres en milieu urbain ?',
                a: 'Une équipe de deux cordistes-élagueurs traite un sujet de 30 m par démontage en 1 à 2 jours selon densité du houppier et complexité d\'évacuation. Ajouter une demi-journée pour le dessouchage et 1 à 3 mois en amont si le dossier nécessite une autorisation ABF, EBC ou alignement protégé. Pour une urgence post-tempête sur sujet dangereux, certains cordistes interviennent sous 24 à 72 heures avec une majoration de 30 à 60 %.',
            },
            {
                q: 'Que devient le bois après abattage par démontage ?',
                a: 'Le bois de fût des grands sujets sains (chêne, platane, châtaignier) part généralement en filière scierie ou bois de chauffage : certains cordistes-élagueurs déduisent la valeur du bois de leur devis. Les rémanents (branches, cimes) sont broyés sur place ou évacués pour compostage municipal ou paillage paysager. Le dessouchage par rognage pulvérise la souche jusqu\'à 30 cm sous le sol pour permettre une replantation ou un réaménagement.',
            },
        ],
        ctaText: 'Trouver un cordiste-élagueur disponible',
        ctaHref: '/post-job',
        relatedLinks: [
            { label: 'Habilitations cordiste : CQP, IRATA, SPRAT', href: '/blog/habilitations-cordiste-cqp-irata-sprat' },
            { label: 'Comment choisir son cordiste', href: '/blog/comment-choisir-son-cordiste' },
            { label: 'Responsabilité du maître d\'ouvrage', href: '/blog/responsabilite-maitre-ouvrage-chantier-cordiste' },
            { label: 'Prix d\'un cordiste en 2026', href: '/prix-cordiste' },
        ],
    },
    {
        slug: 'trouver-cordiste-bordeaux',
        title: 'Trouver un cordiste à Bordeaux : tarifs, zones et guide 2026',
        shortTitle: 'Trouver un cordiste à Bordeaux',
        description:
            'Trouvez un cordiste certifié à Bordeaux pour vos travaux en hauteur. Tarifs 2026, zones couvertes, contraintes patrimoine UNESCO et pierres calcaires — le guide pratique.',
        category: 'Guide achat',
        readTime: 7,
        datePublished: '2026-05-04',
        dateModified: '2026-05-04',
        intro:
            'Trouver un cordiste à Bordeaux, c\'est naviguer dans l\'une des villes les plus exigeantes de France pour les travaux en hauteur. Avec 18 km² de centre historique classés au Patrimoine mondial de l\'UNESCO depuis 2007 — le plus grand ensemble urbanistique du XVIIIe siècle au monde —, chaque intervention sur une façade impose de connaître la pierre calcaire à astéries, les contraintes des Architectes des Bâtiments de France et les ruelles du quartier Saint-Pierre où une nacelle ne peut tout simplement pas circuler. Loin du centre, les zones industrielles de Bassens et le Port de Bordeaux génèrent une demande continue en techniciens certifiés IRATA. Ce guide vous donne les clés pour identifier, évaluer et mandater le bon prestataire en 2026.',
        sections: [
            {
                heading: 'Bordeaux : pourquoi les travaux cordistes y sont-ils spécifiques ?',
                body: 'La "Port de la Lune" concentre des contraintes architecturales et logistiques que rares villes françaises réunissent au même degré. Le centre historique classé UNESCO rassemble plus de 350 édifices remarquables en pierre calcaire à astéries — une roche dorée et microforée qui absorbe les polluants et l\'humidité de l\'estuaire, et qui exige des techniques de nettoyage millimétrées pour ne pas éclater les alvéoles en surface.\n\nDans les quartiers Saint-Pierre, Saint-Éloi, Chartrons et Capucins, les rues médiévales atteignent parfois 4 à 6 mètres de largeur. Une nacelle articulée y est souvent impossible à déployer sans autorisation de voirie exceptionnelle, sans occulter la circulation et sans endommager les pavés protégés. L\'accès sur cordes (TAC) résout ce problème structurellement : le cordiste descend depuis la toiture, élimine les arrêtés de circulation et réduit le délai de démarrage à 48-72 heures contre 2 à 3 semaines pour un montage d\'échafaudage.\n\nPar ailleurs, le climat océanique de la Gironde — humidité chronique, précipitations fréquentes, vent d\'ouest chargé d\'embruns — accélère la colonisation biologique des façades (mousses, lichens, algues) et impose un traitement hydrofuge régulier tous les 8 à 12 ans. Cette spécificité climatique génère une demande constante en nettoyage et protection de façades, toute l\'année, même en dehors de la haute saison.',
            },
            {
                heading: 'Quels travaux un cordiste peut-il réaliser à Bordeaux ?',
                body: 'Les cordistes bordelais interviennent sur un spectre très large, du résidentiel classé au bâtiment industriel. Dès lors qu\'un point d\'ancrage solide existe en toiture — ou peut être posé temporairement sans dénaturer la couverture — la quasi-totalité des travaux en hauteur est réalisable en suspension. La productivité est comparable à celle sur échafaudage pour les interventions ciblées, avec un avantage de rapidité de mobilisation décisif dans le centre historique.',
                listIntro: 'Les interventions les plus fréquentes à Bordeaux et en Gironde :',
                list: [
                    'Nettoyage de pierres calcaires à astéries (centre historique) — biocide doux + eau à basse pression, produits homologués ABF',
                    'Application d\'hydrofuge et de consolidants sur façades poreuses (protection anti-infiltrations, 8-12 ans d\'efficacité)',
                    'Ravalement et réfection d\'enduits sur immeubles néoclassiques XVIIIe — Chartrons, Victoire, Saint-Michel',
                    'Lavage de vitres en hauteur : Cité du Vin, immeubles Euratlantique, tours Mériadeck',
                    'Démoussage et traitement anti-lichen sur toitures tuiles plates (climat humide atlantique)',
                    'Traitement anti-pigeons (filets, pics, câbles) sur corniches et ornements classiques',
                    'Inspection et diagnostic de façade après tempête ou épisode de submersion (estuaire Gironde)',
                    'Travaux industriels (cheminées, réservoirs, pylônes) dans la zone pétrochimique de Bassens et le Port de Bordeaux',
                ],
                cta: {
                    text: 'Décrire mes travaux en 2 minutes',
                    href: '/post-job',
                    description: 'Pierre calcaire, immeuble haussmannien ou installation industrielle — publiez votre besoin gratuitement.',
                    variant: 'light',
                },
            },
            {
                heading: 'Centre historique classé : les contraintes ABF à anticiper',
                body: 'Bordeaux dispose depuis 2013 d\'un Plan de Sauvegarde et de Mise en Valeur (PSMV) qui définit précisément ce qui est autorisé sur les bâtiments du périmètre UNESCO. Au-delà, l\'intégralité de la commune est couverte par une Zone de Protection du Patrimoine Architectural, Urbain et Paysager (ZPPAUP) convertie en Aire de mise en Valeur de l\'Architecture et du Patrimoine (AVAP). En pratique, cela signifie :\n\n**Produits de nettoyage stricts** — La pierre calcaire à astéries est sensible aux acides forts et à la vapeur haute pression : un nettoyage mal exécuté peut pulvériser la surface en quelques secondes. Seuls les produits neutres à légèrement alcalins, validés par les ABF, peuvent être employés. Un cordiste expérimenté à Bordeaux les connaît et les référence dans son devis.\n\n**Ancrages non destructifs** — Percer la pierre de taille d\'une façade classée pour poser un ancrage permanent requiert une autorisation préalable de travaux. Pour les interventions ponctuelles, les cordistes utilisent des systèmes provisoires : poids lestés en toiture, cadres posés sur le faîtage ou crochets sur éléments de charpente existants. Aucun marquage, aucune dégradation.\n\n**Délais administratifs** — Dans le périmètre PSMV, une demande d\'autorisation de travaux (AT) peut prendre 4 à 6 semaines pour obtenir l\'accord formel des ABF. Intégrez ce délai dans votre planning. Hors périmètre UNESCO, dans les quartiers périphériques comme Bacalan, Bastide, Floirac ou Mérignac, les contraintes patrimoniales ne s\'appliquent généralement pas — un plan de prévention et une RC Pro suffisent pour démarrer.',
            },
            {
                heading: 'Tarifs d\'un cordiste à Bordeaux en 2026',
                body: 'Le marché bordelais se situe dans une fourchette légèrement inférieure à celle de Lyon, avec des coûts de déplacement modérés et un vivier de prestataires qualifiés en croissance depuis la vague de rénovation thermique (MaPrimeRénov\') et la dynamique Euratlantique. Les chantiers patrimoniaux commandent en revanche une prime de spécialité par rapport aux façades standard : un cordiste habitué à la pierre calcaire à astéries facture 10 à 15 % de plus qu\'un généraliste, ce qui reste bien en dessous du surcoût d\'un montage d\'échafaudage sur rue étroite.',
                listIntro: 'Fourchette indicative à Bordeaux (HT, 2026) :',
                list: [
                    'Journée cordiste (8h, 1 technicien) : 350 € à 600 € selon spécialité et type de chantier',
                    'Nettoyage de façade pierre calcaire au m² : 7 € à 15 € selon encrassement et produits requis',
                    'Application d\'hydrofuge en hauteur : 4 € à 8 € au m²',
                    'Lavage de vitres en hauteur : 3 € à 5 € par m²',
                    'Inspection technique avec rapport écrit : 450 € à 900 € la demi-journée',
                    'Chantier industriel Bassens / Port (IRATA niveau 2 ou 3) : 580 € à 850 € HT/j par technicien',
                ],
                cta: {
                    text: 'Comparer des devis sans engagement',
                    href: '/post-job',
                    description: 'Obtenez plusieurs offres de cordistes certifiés sur Bordeaux pour votre budget réel.',
                    variant: 'outline',
                },
            },
            {
                heading: 'Bien choisir son cordiste à Bordeaux : 5 critères décisifs',
                body: 'Bordeaux dispose d\'un marché de cordistes actif, mais la spécificité du patrimoine local et la diversité des chantiers — du centre classé à la zone pétrochimique — appellent une sélection rigoureuse. Voici les cinq critères à examiner avant de signer.\n\n**1. La certification adaptée au chantier** — Pour un bâtiment résidentiel ou patrimonial, le CQP TPS niveau 2 est la référence française : il atteste de la capacité à encadrer une équipe et à gérer les équipements de protection individuelle (EPI). Pour les installations industrielles de Bassens ou du Port, un IRATA niveau 2 ou 3 est souvent exigé contractuellement. Vérifiez systématiquement la date d\'expiration des certificats : CQP et IRATA sont valables 3 ans.\n\n**2. La connaissance de la pierre calcaire bordelaise** — Un cordiste habitué au centre de Bordeaux saura immédiatement si votre bâtiment est en secteur PSMV, quels produits de nettoyage sont autorisés, et comment poser un ancrage temporaire sans percer la pierre. Cette expertise locale épargne des erreurs coûteuses et des délais de refus ABF.\n\n**3. La RC Pro couvrant les TAC et le patrimoine classé** — Vérifiez que l\'attestation d\'assurance mentionne explicitement les techniques d\'accès sur cordes (TAC) et les interventions sur bâtiments classés ou en secteur protégé. Certaines polices excluent les chantiers patrimoniaux ou les interventions à moins d\'un mètre de la façade.\n\n**4. Le plan de prévention systématique** — Les travaux en hauteur figurent sur la liste des travaux dangereux (arrêté du 19 mars 1993). Un plan de prévention écrit, rédigé après inspection commune du site, est une obligation légale. Un prestataire sérieux — qu\'il soit membre de la SFETH ou non — le propose avant de chiffrer.\n\n**5. Les références sur des chantiers bordelais comparables** — Un nettoyage de façade classée à Saint-Pierre n\'a rien à voir avec une inspection de réservoir à Bassens. Demandez des références vérifiables : adresses, photos ou noms d\'entreprises clientes sur des chantiers récents dans votre type de bâtiment.',
                cta: {
                    text: 'Trouver mon cordiste à Bordeaux',
                    href: '/post-job',
                    description: 'Des cordistes habitués au patrimoine bordelais reçoivent votre demande et répondent sous 48h.',
                    variant: 'blue',
                },
            },
            {
                heading: 'Zones couvertes : Bordeaux Métropole et département de la Gironde',
                body: 'Les cordistes basés en Gironde couvrent l\'ensemble des 28 communes de Bordeaux Métropole : Bordeaux intra-muros, Mérignac, Pessac, Talence, Gradignan, Bègles, Floirac, Lormont, Cenon, Bruges, Eysines, Le Bouscat, Blanquefort, Parempuyre, Ambarès-et-Lagrave, Bassens et Ambès. Ce périmètre est généralement couvert sans frais kilométriques supplémentaires par la majorité des prestataires actifs sur la métropole.\n\nAu-delà, les cordistes bordelais acceptent des missions dans l\'ensemble de la Gironde : Arcachon et le Bassin (résidences secondaires, maisons de bois sur pilotis, balcons en hauteur), Libourne et Saint-Émilion (toitures de châteaux viticoles, clochers classés), Langon (Sauternes, structures agricoles), et la zone de Pauillac (chais de grande hauteur, cuves inox). Des frais kilométriques s\'appliquent généralement à partir de 40 à 60 km de Bordeaux — comptez 0,40 € à 0,65 € HT par kilomètre.\n\nCertains prestataires girondins couvrent également les départements voisins : Dordogne (Périgueux, Bergerac, Sarlat), Lot-et-Garonne (Agen, Marmande) et Charente-Maritime (Saintes, Rochefort, Royan). La coordination avec un cordiste régional évite souvent les déplacements longue distance, pour un résultat identique et un délai plus court.',
            },
        ],
        faqs: [
            {
                q: 'Combien coûte un cordiste à Bordeaux ?',
                a: 'Comptez entre 350 € et 600 € HT par journée à Bordeaux selon la spécialité. Le nettoyage de façade calcaire oscille entre 7 € et 15 € HT au m². Un chantier industriel (IRATA) atteint 580 à 850 € HT/j par technicien.',
            },
            {
                q: 'Ai-je besoin d\'une autorisation ABF pour nettoyer ma façade dans le centre de Bordeaux ?',
                a: 'Oui, si votre bâtiment est situé dans le périmètre PSMV (Plan de Sauvegarde et de Mise en Valeur) ou à proximité d\'un monument historique. Un nettoyage modifiant l\'aspect extérieur requiert l\'accord des Architectes des Bâtiments de France. Un cordiste expérimenté sur Bordeaux centre vous indique le régime applicable à votre adresse, les produits validés et le délai administratif à prévoir (4 à 6 semaines).',
            },
            {
                q: 'Quel délai pour trouver un cordiste disponible à Bordeaux ?',
                a: 'En basse saison (novembre à février), comptez 1 à 2 semaines entre la demande et le démarrage. Au printemps et en été (mars à octobre), les cordistes bordelais sont souvent complets 3 à 6 semaines à l\'avance pour les façades. Pour une urgence après tempête ou sinistre, certains prestataires interviennent sous 24 à 72 heures avec une majoration tarifaire.',
            },
            {
                q: 'Un cordiste bordelais peut-il intervenir hors de la Gironde ?',
                a: 'Oui. La plupart des prestataires acceptent des missions dans les départements limitrophes — Dordogne, Lot-et-Garonne, Charente-Maritime, Landes — avec des frais kilométriques proportionnels à la distance. Au-delà de 80 à 100 km, il est souvent plus économique de solliciter un cordiste local via LesCordistes.',
            },
        ],
        ctaText: 'Trouver mon cordiste à Bordeaux',
        ctaHref: '/post-job',
        relatedLinks: [
            { label: 'Cordistes certifiés à Bordeaux', href: '/cordiste-bordeaux' },
            { label: 'Prix d\'un cordiste en 2026', href: '/prix-cordiste' },
            { label: 'Trouver un cordiste à Lyon', href: '/blog/trouver-cordiste-lyon' },
            { label: 'Travaux de façade sans échafaudage', href: '/blog/travaux-facade-sans-echafaudage' },
        ],
    },
    {
        slug: 'devenir-cordiste-2026',
        authorSlug: 'benjamin-de-oliveira',
        title: 'Devenir cordiste en 2026 : parcours, formation, premier salaire',
        shortTitle: 'Devenir cordiste : parcours et formation',
        description:
            'Devenez cordiste en 2026 : formation CQP TPS ou IRATA, coût réel, prérequis physiques, premier salaire — le guide complet pour se lancer dans le métier.',
        category: 'Métier & Carrière',
        readTime: 10,
        datePublished: '2026-05-06',
        dateModified: '2026-05-06',
        intro:
            'Devenir cordiste en 2026, c\'est choisir un métier de technicien d\'accès difficile en plein essor. La demande en TAC (techniques d\'accès sur cordes) progresse en France depuis dix ans : vieillissement du bâti, développement des énergies renouvelables, maintenance industrielle. Mais le parcours pour s\'y lancer reste mal documenté. CQP TPS ou IRATA ? Formation à financer soi-même ou via le CPF ? Salarié ou indépendant dès le départ ? Ce guide compile les données concrètes dont tu as besoin avant de t\'inscrire : coût réel de la formation, prérequis physiques, premier salaire, délai pour décrocher ta première mission. Que tu sois en reconversion, issu du BTP ou attiré par un travail manuel exigeant avec une vraie progression — voilà le parcours réaliste pour 2026.',
        sections: [
            {
                heading: 'Le métier de cordiste en 2026 : ce que tu fais concrètement',
                body: 'Le cordiste — officiellement **technicien sur cordes**, **technicien d\'accès difficile** ou **spécialiste TAC** — intervient en hauteur grâce à un système de deux cordes indépendantes : une corde de travail et une corde de sécurité. Ce n\'est pas de l\'escalade récréative, c\'est un travail de technicien soumis à une réglementation précise (articles R. 4323-88 à R. 4323-90 du Code du travail) et à des certifications obligatoires : le CQP TPS en France, l\'IRATA à l\'international.\n\nLes secteurs d\'intervention sont variés. Le bâtiment concentre la majorité des missions : nettoyage de façades, ravalement, traitement hydrofuge, réparation de joints, pose de systèmes anti-pigeons, inspection de toitures. L\'industrie ouvre des chantiers plus longs et mieux payés : réservoirs, silos, ponts, pylônes, éoliennes, installations pétrochimiques. La purge de falaise, l\'inspection d\'ouvrages d\'art et les travaux en milieu naturel constituent une niche spécialisée bien valorisée.\n\nEn France, environ 15 000 techniciens détiennent un CQP TPS ou un IRATA en cours de validité. Le SFETH (Syndicat Français des Entreprises de Travaux en Hauteur) recense chaque année une demande de techniciens supérieure à l\'offre disponible — notamment dans les grandes métropoles, les zones industrielles et les régions à fort potentiel de chantiers renouvelables. C\'est un métier pénurique dans plusieurs bassins d\'emploi, ce qui donne de la marge aux profils sérieux pour négocier leurs tarifs et choisir leurs chantiers.',
            },
            {
                heading: 'Prérequis pour devenir cordiste : ce qu\'on te demande vraiment',
                body: 'Aucun diplôme n\'est exigé pour s\'inscrire à une formation CQP TPS ou IRATA. C\'est l\'un des rares métiers techniques où la reconversion s\'opère sans pré-requis académique — un certificat médical d\'aptitude et la majorité légale suffisent.\n\nConcrètement, trois conditions sont vérifiées avant le début de la formation. La première est physique : il faut être en bonne condition générale sans pathologie incompatible avec le travail en suspension. Ton médecin généraliste rédige une attestation d\'aptitude. Les contre-indications absolues sont rares : acrophobie pathologique (peur irrationnelle des hauteurs), certaines insuffisances respiratoires, troubles non traités de l\'équilibre, épilepsie non stabilisée.\n\nLa deuxième condition est la résistance au vertige fonctionnel. Attention à la nuance : un léger malaise en hauteur est normal et ne contre-indique pas le métier. Ce qui compte, c\'est de pouvoir travailler efficacement en suspension sur une durée soutenue. Les premières séances de pratique sur cordes lèvent rapidement le doute.\n\nLa troisième, souvent sous-estimée, est l\'aptitude à la gestion administrative de base dans le cadre de l\'indépendance : devis, facturation, relances, déclarations de chiffre d\'affaires. Le travail lui-même s\'apprend en formation et sur le terrain. Mais trouver ces chantiers, rédiger un devis crédible, encaisser et relancer — ça ne s\'improvise pas et aucune formation CQP ne t\'y prépare.',
            },
            {
                heading: 'CQP TPS ou IRATA : quelle formation choisir pour devenir cordiste ?',
                body: 'La question revient chez tous les candidats. La réponse dépend de l\'environnement dans lequel tu veux exercer et de ton niveau de mobilité.\n\nLe **CQP TPS** (Certificat de Qualification Professionnelle Technicien de la Prévention et Sécurité des Travaux sur Cordes) est la référence française. Délivré par la branche professionnelle, il est reconnu par les conventions collectives et exigé dans la quasi-totalité des appels d\'offres publics en France. Le niveau 1 (Équipier) se prépare en 3 à 4 semaines (80 à 120 heures). Il autorise à travailler sous supervision d\'un technicien N2 ou N3. Le niveau 2 permet de travailler en autonomie et d\'encadrer un équipier N1. Le niveau 3, réservé aux experts, autorise la formation d\'autres cordistes et la direction de chantiers complexes. Renouvellement tous les 3 ans.\n\nL\'**IRATA** (Industrial Rope Access Trade Association) est la certification internationale, née dans l\'industrie pétrolière offshore. Elle est exigée sur les chantiers industriels (pétrochimie, éoliennes offshore, grands ouvrages d\'art) et sur les projets dans 50+ pays. Le niveau L1 se prépare en 5 jours. Passer au L2 exige 1 000 heures d\'expérience documentées en suspension après le L1.\n\nEn pratique, beaucoup de cordistes obtiennent les deux certifications au fil du temps. Si tu démarres sans savoir encore où tu veux aller, le CQP TPS N1 est la meilleure porte d\'entrée pour le marché français.',
                listIntro: 'Choisir rapidement selon ton projet :',
                list: [
                    'Bâtiment et façade en France → CQP TPS N1, référence des appels d\'offres publics',
                    'Industrie et pétrochimie → IRATA L1, exigé contractuellement sur sites industriels',
                    'Travaux internationaux → IRATA, reconnu dans 50+ pays',
                    'Éoliennes et énergie → IRATA + GWO Basic Safety (2 jours complémentaires)',
                    'Tu ne sais pas encore → CQP TPS N1 : porte d\'entrée la plus polyvalente en France',
                ],
            },
            {
                heading: 'Combien coûte la formation cordiste en 2026 ?',
                body: 'Avant de s\'inscrire, il faut avoir une vision claire de l\'investissement total — pas seulement du coût de la formation. La première année de mise en activité coûte entre 5 500 et 10 000 € en comptant tout.\n\n**La formation :** Un CQP TPS niveau 1 est facturé entre 3 500 et 5 500 € selon l\'organisme et la région. Une IRATA L1 coûte entre 1 200 et 1 800 €. Le recyclage triennal (CQP ou IRATA, tous les 3 ans) revient entre 600 et 1 200 €.\n\n**Le kit EPI :** Pour travailler sur cordes, tu as besoin d\'un équipement personnel certifié CE. Un kit complet de débutant — harnais cuissard, longe double, descendeur autobloquant, bloqueur ventral, casque, gants — coûte entre 1 500 et 2 500 €. L\'EPI n\'est pas une variable d\'ajustement : c\'est une question de sécurité.\n\n**L\'assurance :** La RC pro cordiste coûte entre 400 et 900 €/an. Certains assureurs spécialisés proposent des formules adaptées aux micro-entreprises en démarrage.\n\n**Financement disponible :** Le CQP TPS est éligible au CPF — consulte ton solde sur moncompteformation.gouv.fr avant de payer quoi que ce soit. Si tu es salarié, l\'OPCO de ton secteur peut couvrir tout ou partie. En reconversion via France Travail, l\'AIF (Aide Individuelle à la Formation) peut financer jusqu\'à 100 % du coût pédagogique. L\'IRATA est moins systématiquement référencé CPF : vérifier directement avec l\'organisme choisi.',
                listIntro: 'Budget indicatif première année :',
                list: [
                    'CQP TPS niveau 1 : 3 500 - 5 500 € (finançable CPF, OPCO, France Travail)',
                    'IRATA L1 : 1 200 - 1 800 € (éligibilité CPF à vérifier selon organisme)',
                    'Kit EPI débutant : 1 500 - 2 500 € (harnais cuissard, longe, descendeur autobloquant, bloqueur ventral)',
                    'RC Pro première année : 400 - 900 €/an',
                    'Recyclage triennal (à prévoir dès l\'an 3) : 600 - 1 200 €',
                ],
                cta: {
                    text: 'Créer mon compte cordiste en 2 minutes',
                    href: '/inscription-cordiste',
                    description: 'Profil complet, certifications affichées, accès aux missions en région.',
                    variant: 'light',
                },
            },
            {
                heading: 'Quel salaire espérer comme cordiste débutant en 2026 ?',
                body: 'La question qui mobilise — et les réponses vagues qui circulent ne t\'aident pas à planifier. Voilà les données réelles du marché en 2026, selon que tu commences en salariat ou en indépendant.\n\n**En salariat**, un équipier CQP niveau 1 en début de carrière gagne entre 1 700 et 2 200 € nets par mois selon la région, la taille de l\'entreprise et les paniers repas ou frais de déplacement inclus. Le niveau 2, accessible après 2 à 3 ans d\'expérience, permet de viser 2 200 à 2 800 € nets. Le niveau 3 (expert, chef de chantier, formateur) atteint 2 800 à 4 000 € nets selon le profil. Les chantiers ATEX, nucléaires ou avec habilitation électrique sont généralement mieux rémunérés — surcote de 30 à 50 %.\n\n**En micro-entreprise**, le TJM (tarif journalier moyen) d\'un cordiste débutant CQP N1 se situe entre 280 et 380 €/j hors taxes en régions moyennes, 320 à 450 €/j sur Paris et grandes métropoles. Les charges en micro-entreprise représentent environ 22 % du chiffre d\'affaires. Sur 320 €/j facturés, tu encaisses environ 250 € nets. Il faut ensuite déduire : entretien des EPI, déplacements, RC Pro, recyclage triennal et heures de prospection non facturées.\n\nDans les deux cas, la progression est réelle et rapide : un technicien qui passe du N1 au N2 en 3 ans voit son revenu bondir de 30 à 50 %. C\'est un métier où l\'ancienneté certifiée a une valeur marchande directe.',
                list: [
                    'CQP N1 salarié (0-2 ans) : 1 700 - 2 200 € nets/mois',
                    'CQP N2 salarié (2-5 ans) : 2 200 - 2 800 € nets/mois',
                    'CQP N3 / IRATA L3 salarié : 2 800 - 4 000 € nets/mois',
                    'Indépendant CQP N1 (micro-entreprise) : 280 - 380 €/j HT → ~230-310 € nets/j après charges',
                    'Indépendant CQP N2 : 380 - 550 €/j HT',
                    'Surcote chantiers ATEX, nucléaire, habilitation électrique : +30 à +50 %',
                ],
                cta: {
                    text: 'Voir les missions ouvertes près de chez moi',
                    href: '/jobs',
                    description: 'Missions cordiste qualifiées par région et type de chantier.',
                    variant: 'outline',
                },
            },
            {
                heading: 'Le parcours pour devenir cordiste indépendant : de la formation à la première mission',
                body: 'La majorité des cordistes qui travaillent aujourd\'hui en indépendant ont suivi le même schéma : une ou deux années en salariat pour constituer un carnet de références, puis le passage à l\'indépendance une fois que la demande est là. Se lancer directement en micro-entreprise après le CQP N1 est possible — mais les premières semaines sans références sont difficiles à gérer commercialement.\n\nVoici la feuille de route la plus réaliste pour 2026.\n\n**Mois 1-3 :** Formation CQP TPS N1 ou IRATA L1. Acquisition du kit EPI de base. Immatriculation micro-entreprise si tu pars en indépendant direct — cela prend 1 à 2 semaines via le guichet unique. Souscription à la RC Pro : certains assureurs activent la couverture sous 48h.\n\n**Mois 3-12 :** Premières missions en sous-traitance pour une ETT (entreprise de travaux en hauteur) locale, ou en salariat. Tu accumules entre 150 et 300 heures d\'expérience, tu constitues un carnet de photos de chantiers, tu commences à comprendre où sont les donneurs d\'ordre dans ta zone.\n\n**An 2-3 :** Premières missions en direct. Passage CQP N2 ou montée vers l\'IRATA L2 selon le profil de missions. À ce stade, un cordiste bien installé dans sa région décroche 150 à 200 jours facturés par an.\n\n**An 3-5 :** Consolidation du TJM, diversification vers l\'industrie ou les spécialités (inspection, milieu naturel, ouvrages d\'art). Recyclage triennal — budget prévu depuis le démarrage.\n\nLe timing dépend de ta région, de ton réseau de départ et de ta capacité à prospecter. Mais la courbe est constante : les cordistes qui ont joué le long terme — formation solide, références documentées, réseau entretenu — ne cherchent plus de travail au bout de trois ans.',
                cta: {
                    text: 'Créer mon compte cordiste',
                    href: '/inscription-cordiste',
                    description: 'Profil public, certifications visibles, accès direct aux missions.',
                    variant: 'blue',
                },
            },
            {
                heading: 'Les 6 erreurs qui retardent le lancement',
                body: 'Un seul article ne peut pas anticiper toutes les situations. Mais six erreurs reviennent systématiquement chez les cordistes qui ont eu du mal à démarrer — indépendamment de leur niveau technique. Elles ne sont jamais fatales, mais elles coûtent du temps et parfois de l\'argent.\n\nLa première, et de loin la plus fréquente : **attendre d\'être prêt**. La formation CQP N1 t\'autorise à travailler en tant qu\'équipier sous supervision d\'un technicien N2 ou N3. Tu n\'as pas besoin du N2 pour décrocher ta première mission. Chaque semaine d\'attente est une semaine de revenus et de références perdus.\n\nLa deuxième : **négliger le financement**. Beaucoup paient de leur poche une formation finançable à 100 % via le CPF ou France Travail. Avant de débourser quoi que ce soit, consulte ton compte sur moncompteformation.gouv.fr et contacte ton OPCO. Le gain potentiel est de 3 500 à 5 500 €.\n\nTroisième : **oublier le plan de prévention**. L\'OPPBTP met à disposition des modèles gratuits, mais encore faut-il savoir qu\'il est obligatoire dès la première demi-journée de chantier — y compris pour un nettoyage simple. L\'ignorer engage ta responsabilité personnelle.',
                listIntro: 'Les 6 erreurs à éviter :',
                list: [
                    'Attendre le niveau 2 pour se lancer — le CQP N1 suffit pour commencer en équipier',
                    'Payer sa formation sans vérifier le CPF et les aides OPCO / France Travail',
                    'Oublier le plan de prévention dès la première mission (obligatoire même pour une demi-journée)',
                    'Vouloir être indépendant direct sans références — passe par la sous-traitance ou le salariat d\'abord',
                    'Négliger le budget EPI : 1 500 - 2 500 € à intégrer dès le départ dans ton plan de financement',
                    'Manquer son recyclage triennal — une certification expirée t\'exclut de tout chantier formalisé',
                ],
            },
        ],
        faqs: [
            {
                q: 'Combien de temps faut-il pour devenir cordiste ?',
                a: 'Pour le CQP TPS niveau 1, comptez 3 à 4 semaines de formation (80-120 heures). Pour l\'IRATA L1, une semaine suffit. Entre inscription, formation et première mission, prévoyez 1 à 3 mois. La montée au niveau 2 prend ensuite 2 à 3 ans d\'expérience terrain.',
            },
            {
                q: 'Faut-il un diplôme pour devenir cordiste ?',
                a: 'Non. Le CQP TPS et l\'IRATA n\'exigent aucun diplôme préalable. Un certificat médical d\'aptitude et la majorité légale suffisent. Les formations accueillent des profils très variés : reconversions depuis le BTP, l\'industrie, le secteur militaire ou des domaines complètement différents.',
            },
            {
                q: 'Peut-on financer sa formation cordiste avec le CPF ?',
                a: 'Oui. Le CQP TPS est éligible au CPF — vérifiez votre solde sur moncompteformation.gouv.fr avant de vous inscrire. Si vous êtes salarié, votre OPCO peut prendre en charge le reste à charge. En reconversion via France Travail, l\'AIF peut couvrir jusqu\'à 100 % du coût pédagogique. L\'IRATA est moins systématiquement référencé CPF : vérifiez avec l\'organisme de formation.',
            },
            {
                q: 'Quel salaire espérer comme cordiste débutant ?',
                a: 'En salariat avec un CQP niveau 1, comptez 1 700 à 2 200 € nets par mois selon la région. En micro-entreprise, un TJM de 280 à 380 €/j HT est réaliste en début d\'activité — soit environ 230 à 310 € nets par jour après charges (22 % en micro-entreprise). Le passage au niveau 2 permet de viser 2 200 à 2 800 € nets en salariat ou 380 à 550 €/j en indépendant.',
            },
            {
                q: 'Faut-il commencer en salariat ou en indépendant ?',
                a: 'Le salariat est recommandé en première année : il permet d\'accumuler des références sans supporter seul les coûts d\'EPI et de prospection, et l\'employeur gère le plan de prévention face au donneur d\'ordre. Le passage en indépendant est plus viable à partir du niveau 2 et d\'un réseau constitué. Les deux statuts peuvent être combinés — certains cordistes commencent en micro-entreprise tout en travaillant régulièrement pour une ETT.',
            },
        ],
        ctaText: 'Créer mon compte cordiste',
        ctaHref: '/inscription-cordiste',
        relatedLinks: [
            { label: 'Habilitations CQP, IRATA, SPRAT', href: '/blog/habilitations-cordiste-cqp-irata-sprat' },
            { label: 'Premier chantier après le CQP', href: '/blog/premier-chantier-cordiste-apres-cqp' },
            { label: 'Missions cordiste indépendant', href: '/blog/missions-cordiste-independant' },
            { label: 'Voir les missions disponibles', href: '/jobs' },
        ],
    },
]

export const BLOG_CATEGORIES: Record<string, string> = {
    'Réglementation': 'Réglementation',
    'Guide achat': 'Guide achat',
    'Travaux & technique': 'Travaux & technique',
    'Métier & Carrière': 'Métier & Carrière',
}

export function getBlogArticle(slug: string): BlogArticle | undefined {
    return SEO_BLOG.find((a) => a.slug === slug)
}

export const SEO_BLOG_BASE = `${SEO_BASE_URL}/blog`

/**
 * Retourne l'URL d'image à utiliser pour un article (hero + thumbnail).
 * Préfère `article.image` si défini, sinon fallback sur l'OG dynamique.
 * Toujours renvoie une URL relative pour rester compatible Next/Image local.
 *
 * Le param `v` casse le cache CDN Vercel (max-age 7 jours sur /og) à chaque
 * refonte du visuel. Bumper cette constante après modification de /og/route.tsx.
 */
const OG_VERSION = '3'

export function getBlogImage(article: BlogArticle): string {
    if (article.image) return article.image
    return `/og?title=${encodeURIComponent(article.shortTitle)}&kicker=${encodeURIComponent(article.category)}&v=${OG_VERSION}`
}
