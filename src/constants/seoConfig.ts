// Constantes SEO globales — source unique de vérité pour NAP et identité de marque
// Modifier ici = mis à jour sur les 253+ pages automatiquement

export const SEO_PHONE = '+33660501682'
export const SEO_PHONE_DISPLAY = '+33 6 60 50 16 82'
export const SEO_EMAIL = 'anthony@lescordistes.com'
export const SEO_BRAND_NAME = 'LesCordistes.com'
export const SEO_BASE_URL = 'https://www.lescordistes.com'
export const SEO_LOGO = `${SEO_BASE_URL}/lescordistes.com-3.webp`

// Siège social (source unique de vérité pour le schema Organization/LocalBusiness)
export const SEO_POSTAL_ADDRESS = {
    '@type': 'PostalAddress',
    streetAddress: '2 rue Pierre Pietri',
    postalCode: '06000',
    addressLocality: 'Nice',
    addressRegion: 'Provence-Alpes-Côte d\'Azur',
    addressCountry: 'FR',
} as const

export const SEO_OPENING_HOURS = [
    {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '18:00',
    },
]

export const SEO_SAME_AS: string[] = [
    'https://www.google.com/maps?cid=15872124307907753477',
    'https://www.linkedin.com/company/lescordistes/',
    'https://www.pagesjaunes.fr/pros/64869308',
    'https://fr.trustpilot.com/review/lescordistes.com',
    // 'https://www.facebook.com/lescordistes',
]

// Badges régionaux par ville — formulés à la main pour éviter les pièges
// d'algorithme sur les gentilés (toulousaine vs toulonnaise vs perpignanaise).
// Si une ville n'a pas de label, fallback "dans la région de [city]" via getCityRegionLabel.
export const CITY_REGION_LABELS: Record<string, string> = {
    monaco: "à Monaco et sur la Riviera",
    paris: "en Île-de-France",
    marseille: "en région marseillaise",
    lyon: "en région lyonnaise",
    toulouse: "en région toulousaine",
    lille: "dans la métropole lilloise",
    bordeaux: "en région bordelaise",
    nantes: "dans la métropole nantaise",
    nice: "sur la Côte d'Azur",
    strasbourg: "dans l'Eurométropole de Strasbourg",
    rennes: "dans la métropole rennaise",
    grenoble: "dans l'agglomération grenobloise",
    rouen: "dans la métropole rouennaise",
    toulon: "dans la rade de Toulon",
    montpellier: "dans la métropole montpelliéraine",
    metz: "dans la métropole de Metz",
    nancy: "dans la métropole du Grand Nancy",
    orleans: "dans la métropole d'Orléans",
    'saint-etienne': "dans la métropole stéphanoise",
    tours: "dans la métropole de Tours",
    brest: "dans la métropole brestoise",
    'clermont-ferrand': "dans la métropole clermontoise",
    dijon: "dans la métropole dijonnaise",
    'aix-en-provence': "dans le pays d'Aix",
    angers: "dans la métropole angevine",
    reims: "dans la métropole rémoise",
    'le-havre': "dans la métropole havraise",
    caen: "dans la métropole caennaise",
    perpignan: "dans l'agglomération de Perpignan",
    besancon: "dans la métropole bisontine",
    pau: "dans l'agglomération paloise",
    cannes: "sur la Côte d'Azur",
    avignon: "dans l'agglomération avignonnaise",
    poitiers: "dans l'agglomération de Poitiers",
    'la-rochelle': "dans l'agglomération rochelaise",
    dunkerque: "dans l'agglomération dunkerquoise",
    lorient: "dans l'agglomération lorientaise",
    annecy: "dans le bassin annécien",
    nimes: "dans l'agglomération nîmoise",
    bayonne: "au Pays Basque",
    'saint-nazaire': "dans l'estuaire de la Loire",
    colmar: "dans le centre Alsace",
    chartres: "dans l'agglomération de Chartres",
    cherbourg: "dans le Cotentin",
    mulhouse: "dans l'agglomération mulhousienne",
    amiens: "dans la métropole amiénoise",
    limoges: "dans l'agglomération de Limoges",
    beziers: "dans le Biterrois",
    'le-mans': "dans la métropole mancelle",
    troyes: "dans l'agglomération troyenne",
    valenciennes: "dans le Hainaut",
    calais: "dans le Calaisis",
    chambery: "dans le bassin chambérien",
    valence: "dans l'agglomération valentinoise",
    montauban: "dans le Tarn-et-Garonne",
    quimper: "dans le Finistère sud",
    ajaccio: "en Corse-du-Sud",
    albi: "dans l'Albigeois",
    angouleme: "dans l'agglomération d'Angoulême",
    arles: "en Camargue",
}

export function getCityRegionLabel(citySlug: string, cityName: string): string {
    return CITY_REGION_LABELS[citySlug] ?? `dans la région de ${cityName}`
}
