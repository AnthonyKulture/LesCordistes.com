# Plan d'implémentation — Local SEO 37/100 → 100/100
**Date :** 2026-04-06 | **Objectif :** Score parfait sur les 6 dimensions

---

## Vue d'ensemble

| Phase | Titre | Score gagné | Effort | Fichiers modifiés |
|-------|-------|-------------|--------|-------------------|
| 1 | Fondamentaux : téléphone, Google Maps, NAP | +15 pts | 2h | `Footer.tsx`, `[cityPage]/page.tsx`, `[service]/page.tsx`, `seoData.ts` |
| 2 | Schema JSON-LD complet | +12 pts | 3h | `[cityPage]/page.tsx`, `[service]/page.tsx`, `layout.tsx` |
| 3 | Avis réels / suppression aggregateRating | +10 pts | 2h | `seoData.ts`, `SEOLocalReviews.tsx`, `[cityPage]/page.tsx`, `[service]/page.tsx` |
| 4 | Contenu unique 23 villes | +8 pts | 4h | `seoUniqueContent.ts` |
| 5 | Contenu unique 230 pages services | +6 pts | 4h | `seoData.ts`, `[service]/page.tsx` |
| 6 | FAQ spécifiques par service | +4 pts | 1h | `seoData.ts`, `[service]/page.tsx` |
| 7 | Autorité locale (TrustBadges) | +4 pts | 1h | `TrustBadges.tsx` |
| 8 | Actions manuelles (GBP, Bing, Apple) | +9 pts | 30 min/plateforme | Hors code |

**Score final estimé : 100/100**

---

## Phase 1 — Fondamentaux : téléphone, Google Maps, NAP
**Gain estimé : +15 pts** | **GBP +7, NAP +5, On-Page +3**

### 1.1 — Ajouter le numéro de téléphone dans le Footer

**Fichier :** `src/components/layout/Footer.tsx`

Ajouter dans la colonne "Pour les Clients", avant le premier `<li>` :
```tsx
// Ajouter dans la section "brand" du footer, après le <p> descriptif :
<div className="mt-4 space-y-2">
    <a href="tel:+33XXXXXXXXX" className="flex items-center gap-2 text-slate-300 hover:text-brand-blue-light text-sm transition-colors">
        <Phone size={16} />
        <span>+33 X XX XX XX XX</span>
    </a>
    <a href="mailto:contact@lescordistes.com" className="flex items-center gap-2 text-slate-300 hover:text-brand-blue-light text-sm transition-colors">
        <Mail size={16} />
        <span>contact@lescordistes.com</span>
    </a>
</div>
```
Importer `Phone` depuis `lucide-react`.

> **Pourquoi :** 76% des visites mobile post-"near me" se convertissent en moins de 24h via appel téléphonique. Sans `tel:` link le taux de conversion mobile est quasi nul.

---

### 1.2 — Remplacer OpenStreetMap par Google Maps sur les pages villes

**Fichier :** `src/app/(seo)/[cityPage]/page.tsx` (ligne 144)

Remplacer l'`<iframe>` OpenStreetMap par un embed Google Maps :

```tsx
// AVANT (ligne 144-155) :
<iframe
    src={`https://www.openstreetmap.org/export/embed.html?bbox=...`}
    ...
/>

// APRÈS :
<iframe
    width="100%"
    height="350"
    style={{ border: 0 }}
    loading="lazy"
    allowFullScreen
    referrerPolicy="no-referrer-when-downgrade"
    src={`https://www.google.com/maps/embed/v1/search?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&q=cordiste+${encodeURIComponent(name)}&zoom=11`}
/>
```

Ajouter la variable d'environnement :
```bash
# .env.local
NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIza...
```

> **Note :** Si la clé Maps n'est pas encore disponible, utiliser en fallback l'embed Maps sans API key (plus limité) :
> `https://maps.google.com/maps?q=cordiste+{ville},France&output=embed`

**Même remplacement** dans `src/app/(seo)/[cityPage]/[service]/page.tsx` (ligne 142).

> **Pourquoi :** OpenStreetMap n'envoie aucun signal de localisation à Google. Le Google Maps embed crée un lien direct avec l'index géographique Google et, une fois la fiche GBP créée, peut afficher le pin de la fiche.

---

### 1.3 — Standardiser le `name` du schema LocalBusiness

**Fichier :** `src/app/(seo)/[cityPage]/page.tsx`

Remplacer dans `jsonLd` :
```tsx
// AVANT :
name: `LesCordistes.com - ${name}`,

// APRÈS :
name: 'LesCordistes.com',
```

**Fichier :** `src/app/(seo)/[cityPage]/[service]/page.tsx`

Remplacer dans `jsonLd.provider` :
```tsx
// AVANT :
name: `LesCordistes.com - Spécialiste ${serviceName} à ${name}`,

// APRÈS :
name: 'LesCordistes.com',
```

> **Pourquoi :** Google exige un `name` cohérent entre toutes les occurrences du même business dans les schemas. Les variations de nom sont un signal de NAP incohérent.

---

## Phase 2 — Schema JSON-LD complet
**Gain estimé : +12 pts** | **Schema +3, GBP +5, NAP +4**

### 2.1 — Schema LocalBusiness complet sur les pages villes

**Fichier :** `src/app/(seo)/[cityPage]/page.tsx`

Enrichir l'objet `LocalBusiness` dans `jsonLd` :

```tsx
const PHONE = '+33XXXXXXXXX' // à déplacer dans une constante globale

{
    '@type': 'LocalBusiness',
    '@id': `https://lescordistes.com/cordiste-${citySlug}`,      // ← AJOUTER
    name: 'LesCordistes.com',                                     // ← UNIFORMISÉ (Phase 1.3)
    url: `https://lescordistes.com/cordiste-${citySlug}`,
    telephone: PHONE,                                             // ← AJOUTER
    email: 'contact@lescordistes.com',                           // ← AJOUTER
    image: 'https://lescordistes.com/lescordistes.com-3.webp',
    priceRange: '$$',
    address: {
        '@type': 'PostalAddress',
        addressLocality: name,
        addressRegion: region,
        addressCountry: codeISO,
        // streetAddress omis intentionnellement (SAB sans adresse physique)
    },
    geo: {
        '@type': 'GeoCoordinates',
        latitude: lat.toFixed(5),    // ← 5 décimales (était 4)
        longitude: lng.toFixed(5),   // ← 5 décimales
    },
    areaServed: {
        '@type': 'GeoCircle',
        geoMidpoint: { '@type': 'GeoCoordinates', latitude: lat.toFixed(5), longitude: lng.toFixed(5) },
        geoRadius: '30000',
    },
    openingHoursSpecification: [                                  // ← AJOUTER
        {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '08:00',
            closes: '18:00',
        },
    ],
    sameAs: [                                                      // ← AJOUTER après création GBP
        // 'https://www.google.com/maps/place/?q=place_id:ChIJXXXX',  // GBP place ID
        // 'https://www.linkedin.com/company/lescordistes',
    ],
    // aggregateRating : voir Phase 3
}
```

### 2.2 — Schema Service complet sur les pages service×ville

**Fichier :** `src/app/(seo)/[cityPage]/[service]/page.tsx`

Remplacer le `jsonLd` existant par :

```tsx
const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'Service',
            '@id': `https://lescordistes.com/cordiste-${citySlug}/${serviceSlug}#service`,
            serviceType: serviceName,
            name: `${serviceName} à ${name}`,
            description,
            areaServed: { '@type': 'City', name, '@id': `https://dbpedia.org/resource/${name}` },
            provider: {
                '@type': 'LocalBusiness',
                '@id': `https://lescordistes.com/cordiste-${citySlug}`,  // ← référence le @id de la page ville
                name: 'LesCordistes.com',
                telephone: PHONE,
                url: `https://lescordistes.com/cordiste-${citySlug}`,
            },
            // aggregateRating : voir Phase 3
        },
        {
            '@type': 'BreadcrumbList',                                    // ← AJOUTER
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://lescordistes.com' },
                { '@type': 'ListItem', position: 2, name: `Cordiste ${name}`, item: `https://lescordistes.com/cordiste-${citySlug}` },
                { '@type': 'ListItem', position: 3, name: serviceName, item: `https://lescordistes.com/cordiste-${citySlug}/${serviceSlug}` },
            ],
        },
        {
            '@type': 'FAQPage',
            mainEntity: serviceData.faqs.map(faq => ({               // ← FAQ spécifiques par service (Phase 6)
                '@type': 'Question',
                name: faq.question.replace('{city}', name),
                acceptedAnswer: { '@type': 'Answer', text: faq.answer.replace('{city}', name) },
            })),
        },
    ],
}
```

### 2.3 — Schema ProfessionalService sur la homepage

**Fichier :** `src/app/layout.tsx` (ou `src/app/page.tsx`)

Ajouter dans le `<body>` du layout (juste après `<Providers>`) ou dans le composant page d'accueil :

```tsx
const organizationSchema = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': ['Organization', 'ProfessionalService'],
            '@id': 'https://lescordistes.com/#organization',
            name: 'LesCordistes.com',
            url: 'https://lescordistes.com',
            logo: 'https://lescordistes.com/lescordistes.com-3.webp',
            telephone: PHONE,
            email: 'contact@lescordistes.com',
            description: "Marketplace n°1 pour les travaux en accès difficile. Mise en relation entre cordistes certifiés IRATA/CQP et clients professionnels.",
            areaServed: { '@type': 'Country', name: 'France' },
            serviceType: 'Travaux en hauteur et accès difficile',
            hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: 'Services de travaux en accès difficile',
                itemListElement: SEO_SERVICES.map(s => ({
                    '@type': 'Offer',
                    itemOffered: { '@type': 'Service', name: s.name, description: s.description },
                })),
            },
            sameAs: [
                // Compléter après revendication des profils
                // 'https://www.facebook.com/lescordistes',
                // 'https://www.linkedin.com/company/lescordistes',
                // 'https://www.google.com/maps/place/?q=place_id:ChIJXXXX',
            ],
        },
    ],
}
```

Créer `src/constants/seoConfig.ts` pour centraliser :
```ts
export const SEO_PHONE = '+33XXXXXXXXX'
export const SEO_EMAIL = 'contact@lescordistes.com'
export const SEO_BRAND_NAME = 'LesCordistes.com'
export const SEO_BASE_URL = 'https://lescordistes.com'
```

> **Pourquoi :** Une constante centrale évite les incohérences de NAP entre les 253+ pages. Un seul endroit à modifier.

---

## Phase 3 — Avis : suppression aggregateRating factice
**Gain estimé : +10 pts** | **Reviews +8, Schema +2**

C'est le problème le plus risqué. L'`aggregateRating` hardcodé dans `getLocalReviews()` est basé sur des valeurs calculées (seed), pas sur des avis réels. Google peut le détecter comme trompeur.

### Option A — Supprimer aggregateRating du schema (recommandé à court terme)

**Fichier :** `src/app/(seo)/[cityPage]/page.tsx` et `[service]/page.tsx`

Retirer `aggregateRating` des schemas JSON-LD. Garder les témoignages visuels dans `SEOLocalReviews.tsx` (ils sont acceptables comme social proof UI, sans l'implication d'un compte certifié).

```tsx
// Dans jsonLd, supprimer :
aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: rating,
    reviewCount: count,
},
```

Le composant `SEOLocalReviews.tsx` peut rester tel quel pour le visuel. Retirer uniquement la mention "avis certifiés" dans le texte :

**Fichier :** `src/components/seo/SEOLocalReviews.tsx` (ligne 40-43)
```tsx
// AVANT :
Note moyenne de {rating}/5 basée sur {count} avis certifiés dans la région.

// APRÈS :
Ils ont fait confiance à LesCordistes.com — rejoignez-les.
// (ou supprimer le compteur entièrement)
```

### Option B — Intégrer l'API Google Places pour de vrais avis (recommandé à moyen terme)

Créer `src/lib/googlePlaces.ts` :
```ts
// Récupérer les avis de la fiche GBP via Google Places API
// Place ID à obtenir après création de la fiche GBP (Phase 8)
export async function getGoogleReviews(placeId: string) {
    const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&key=${process.env.GOOGLE_PLACES_API_KEY}&language=fr`,
        { next: { revalidate: 86400 } } // cache 24h (ISR)
    )
    const data = await res.json()
    return data.result
}
```

Utiliser dans `[cityPage]/page.tsx` :
```tsx
// Côté serveur (Server Component) :
const placeData = await getGoogleReviews(GBP_PLACE_ID) // après Phase 8
const aggregateRating = placeData ? {
    '@type': 'AggregateRating',
    ratingValue: placeData.rating,
    reviewCount: placeData.user_ratings_total,
    bestRating: 5,
} : undefined
```

> **Priorité :** Commencer par Option A immédiatement (retrait du schema). Implémenter Option B dès que la fiche GBP est créée et a 10+ avis réels.

---

## Phase 4 — Contenu unique pour les 23 villes
**Gain estimé : +8 pts** | **On-Page +6, Citations +2**

**Fichier :** `src/constants/seoUniqueContent.ts`

17 villes ont actuellement le template `'default'`. Ajouter une entrée spécifique pour chacune. Structure de chaque entrée :

```ts
'lille': {
    slug: 'lille',
    hubTitle: "Métropole industrielle et rénovation du patrimoine flamand",
    paragraph1: "La métropole lilloise concentre un vaste parc immobilier d'architecture flamande (briques, pignons à redents) et d'anciens sites industriels reconvertis. Le nettoyage et la rénovation de ces façades atypiques requiert des techniciens cordistes maîtrisant les matériaux locaux.",
    paragraph2: "De la place du Général de Gaulle aux zones logistiques d'Euralille, nos cordistes du Nord interviennent sur les copropriétés, les équipements publics et les infrastructures d'Euratech avec les certifications requises pour les environnements industriels."
},
'nice': {
    slug: 'nice',
    hubTitle: "Front de mer et reliefs escarpés de l'arrière-pays niçois",
    paragraph1: "La topographie exceptionnelle de Nice — entre mer et Alpes-Maritimes — rend l'accès de nombreuses structures impossible sans travail sur cordes. Les façades des hôtels de la Promenade des Anglais, soumises aux embruns et au sel marin, nécessitent des interventions régulières.",
    paragraph2: "Du Vieux-Nice aux villages perchés de l'arrière-pays, nos cordistes niçois maîtrisent les contraintes du massif préalpin (éboulements, végétalisation agressive) et les exigences esthétiques de l'architecture Belle Époque classée."
},
// ... (16 autres villes)
```

**Les 17 villes à rédiger :** Lille, Nice, Strasbourg, Rennes, Grenoble, Rouen, Toulon, Montpellier, Metz, Nancy, Orléans, Saint-Étienne, Tours, Brest, Clermont-Ferrand, Dijon, + les villes avec `contextualIntro` mais sans entrée `SEO_EDITORIAL_DB`.

**Critère de qualité :** Chaque paragraphe doit mentionner au moins un monument/quartier/industrie réelle propre à la ville. **Test du swap :** Si vous remplacez le nom de la ville et que le texte a encore du sens → réécrire.

---

## Phase 5 — Contenu unique pour les 230 pages service×ville
**Gain estimé : +6 pts** | **On-Page +6**

Actuellement, les pages `/cordiste-{ville}/{service}` réutilisent les paragraphes de la page hub ville. Ce pattern est à risque doorway après Google Core Update 2024.

### Solution : Ajouter un `serviceContextByCluster` dans `seoData.ts`

```ts
// Dans seoData.ts, ajouter :
export interface ServiceCityContext {
    intro: string        // Remplacement du paragraph1 réutilisé du hub
    useCases: string[]   // 3 cas d'usage spécifiques service×ville
}

export const SERVICE_CITY_CONTEXT: Record<string, Record<string, ServiceCityContext>> = {
    'nettoyage-facade': {
        'paris': {
            intro: "À Paris, le nettoyage de façades haussmanniennes en pierre de taille représente une prestation à forte valeur patrimoniale. L'utilisation de produits non-agressifs est impérative pour préserver les calcaires lutetiens.",
            useCases: ["Immeuble haussmannien (5-7 étages)", "Façade vitrée de la Défense", "Mur pignon en briques du Marais"]
        },
        'marseille': {
            intro: "À Marseille, les façades sont confrontées au sel marin et aux micro-organismes favorisés par le climat méditerranéen. Le nettoyage haute pression doit être combiné à un traitement hydrofuge pour garantir la durabilité.",
            useCases: ["Immeuble du Vieux-Port exposé aux embruns", "Entrepôt portuaire en béton", "Villa résidentielle sur les collines"]
        },
        // ... autres villes
        'default': {
            intro: "Le nettoyage de façades par cordiste élimine l'encrassement, les mousses et les moisissures sans nécessiter d'échafaudage. Nos techniciens adaptent la technique (haute pression, gommage, produits spécialisés) à chaque type de matériau.",
            useCases: ["Copropriété résidentielle", "Bâtiment tertiaire", "Équipement industriel"]
        }
    },
    // ... (10 autres services)
}
```

**Modifier `[service]/page.tsx`** pour utiliser ce contenu :
```tsx
import { SERVICE_CITY_CONTEXT } from '@/constants/seoData'

// Dans le composant :
const serviceContext = SERVICE_CITY_CONTEXT[serviceSlug]?.[citySlug]
    ?? SERVICE_CITY_CONTEXT[serviceSlug]?.['default']
    ?? null

// Remplacer le bloc editorial existant par serviceContext.intro
// Remplacer les keywords génériques par serviceContext.useCases pour les villes qui en ont
```

> **Objectif :** Avoir au moins 6/23 villes avec contenu service×ville vraiment unique (les mêmes 6 que le hub). Pour les autres, le `'default'` spécifique au service est déjà bien meilleur que le texte du hub réutilisé.

---

## Phase 6 — FAQ spécifiques par service
**Gain estimé : +4 pts** | **Schema FAQPage +2, On-Page +2**

Actuellement, 100% des pages (villes + services) ont exactement les mêmes 2 FAQ (prix + certifications).

### Ajouter `faqs` dans `SEOServiceCluster`

**Fichier :** `src/constants/seoData.ts`

```ts
export interface FAQ {
    question: string   // {city} sera remplacé dynamiquement
    answer: string     // {city} sera remplacé dynamiquement
}

// Ajouter à l'interface SEOServiceCluster :
faqs?: FAQ[]

// Exemple pour 'nettoyage-facade' :
faqs: [
    {
        question: "Combien coûte un nettoyage de façade par cordiste à {city} ?",
        answer: "Le prix d'un nettoyage de façade par cordiste à {city} varie entre 8€ et 25€/m² selon le niveau d'encrassement, la technique utilisée (haute pression, gommage) et la hauteur. Un devis détaillé est fourni sous 48h."
    },
    {
        question: "Quelles façades peut-on nettoyer par accès sur cordes à {city} ?",
        answer: "Tous types de façades sont accessibles : pierre de taille, béton, brique, bardage métallique, composite. Nos cordistes à {city} interviennent dès le 2ème étage, quelle que soit la configuration architecturale."
    },
    {
        question: "Faut-il une autorisation spéciale pour le nettoyage de façade par cordiste à {city} ?",
        answer: "Dans la plupart des cas à {city}, l'accès sur cordes ne nécessite pas d'autorisation d'occupation du domaine public (AOT), contrairement à un échafaudage. Cela accélère considérablement le démarrage du chantier."
    },
],

// Fallback global (pour services sans faqs spécifiques) :
export const DEFAULT_SERVICE_FAQS: FAQ[] = [
    {
        question: "Quel est le prix d'une intervention à {city} ?",
        answer: "Le tarif d'une intervention sur cordes à {city} dépend de la complexité de l'accès et du type de travaux. En moyenne, comptez entre 350€ et 600€ HT par jour et par cordiste. Un devis gratuit est disponible sous 48h."
    },
    {
        question: "Vos cordistes intervenant à {city} sont-ils certifiés ?",
        answer: "Oui, tous les professionnels inscrits sur notre plateforme possèdent des certifications obligatoires (CQP ou IRATA) garantissant une sécurité maximale lors des travaux en hauteur à {city}."
    },
]
```

**Modifier les pages** pour utiliser `serviceData.faqs ?? DEFAULT_SERVICE_FAQS` dans le schema FAQPage et dans le composant HTML.

---

## Phase 7 — Autorité locale (TrustBadges)
**Gain estimé : +4 pts** | **Links & Authority +4**

**Fichier :** `src/components/seo/TrustBadges.tsx`

Enrichir avec des signaux d'autorité vérifiables et des liens externes crédibles :

```tsx
// Remplacer le contenu par des badges enrichis :

// Badge 1 : Certification IRATA (lien externe vers irata.org)
<a href="https://irata.org" target="_blank" rel="noopener noreferrer" className="...">
    <Award size={24} />
    <div>Certifications CQP / IRATA</div>
    <p>Standards internationaux vérifiés</p>
    <span className="text-xs text-brand-blue">→ irata.org</span>
</a>

// Badge 2 : Référencement OPPBTP / INRS
<div>
    <ShieldCheck size={24} />
    <div>Conformité INRS R408</div>
    <p>Procédures de travail en hauteur selon la réglementation française.</p>
</div>

// Badge 3 : Assurance RC Pro + Décennale
// Badge 4 : Répertoire SIRET vérifié
// Badge 5 : Avis Trustpilot (une fois créé)
<a href="https://fr.trustpilot.com/review/lescordistes.com" target="_blank" rel="noopener noreferrer">
    Vérifier sur Trustpilot →
</a>
```

> **Pourquoi :** Les liens sortants vers des organismes de référence (IRATA, INRS, OPPBTP) sont des signaux d'autorité documentaire. La mention OPPBTP/R408 améliore l'E-E-A-T (Expertise, Experience, Authority, Trust) dans une niche réglementée.

---

## Phase 8 — Actions manuelles (hors code)
**Gain estimé : +9 pts** | **GBP +7, Citations +2**

### 8.1 — Google Business Profile (priorité absolue)

1. Aller sur [business.google.com](https://business.google.com)
2. Créer une fiche avec :
   - **Nom :** LesCordistes.com
   - **Catégorie primaire :** "Prestataire de services de construction" ou "Service en hauteur"
   - **Type :** Service Area Business (pas d'adresse physique)
   - **Zone desservie :** France entière
   - **Téléphone :** +33XXXXXXXXX
   - **Site web :** https://lescordistes.com (**NE PAS** lier vers une page ville — risque Sterling Sky Diversity Update)
   - **Description :** Marketplace de mise en relation pour travaux en accès difficile. Cordistes certifiés CQP/IRATA disponibles dans toute la France. Devis gratuit sous 48h.
3. Vérifier la fiche (SMS ou vidéo)
4. Ajouter 10+ photos de chantiers réels
5. Récupérer le **Place ID** → mettre à jour `sameAs` dans les schemas (Phase 2.1)
6. Remplacer l'embed Maps avec le Place ID dans les pages villes (Phase 1.2)

### 8.2 — Bing Places for Business

1. [bingplaces.com](https://www.bingplaces.com)
2. Importer depuis Google Business Profile (option disponible)
3. Durée estimée : 30 minutes + validation sous 3-5 jours
4. **Impact :** Alimente ChatGPT, Copilot, Alexa directement

### 8.3 — Apple Business Connect

1. [register.apple.com/business-connect](https://register.apple.com/business-connect)
2. Créer le profil avec les mêmes infos que GBP
3. Impact : 27% des recherches locales passent par Apple Maps en 2026

### 8.4 — Citations Tier 1 France

| Annuaire | URL | Priorité | Note |
|----------|-----|----------|------|
| Pages Jaunes | pagesjaunes.fr | ★★★ | Tier 1 FR, alimenté par les données Solocal |
| Kompass | kompass.com | ★★★ | B2B, fort pour les pros du BTP |
| Trustpilot | trustpilot.fr | ★★★ | Avis vérifiables → aggregateRating réelle (Phase 3 Option B) |
| LinkedIn Company | linkedin.com | ★★☆ | `sameAs` dans schema Organization |
| OPPBTP Annuaire | oppbtp.fr | ★★★ | Annuaire sectoriel BTP — fort signal E-E-A-T |
| INRS | inrs.fr | ★★☆ | Organisme référence sécurité travail en hauteur |
| BatiExpo | batiexpo.com | ★★☆ | Annuaire professionnel BTP |

### 8.5 — Stratégie avis : atteindre 10+ avis réels rapidement

1. Envoyer un email à tous les clients existants avec lien direct vers la fiche GBP
2. Intégrer dans l'email post-mission (déjà via Resend) un lien "Laissez-nous un avis Google"
3. Règle des 18 jours (Sterling Sky) : viser 1 nouvel avis Google minimum toutes les 3 semaines

---

## Récapitulatif par fichier

| Fichier | Modifications |
|---------|--------------|
| `src/constants/seoConfig.ts` | **CRÉER** — constantes SEO globales (phone, email, brand name) |
| `src/constants/seoData.ts` | Ajouter `faqs` dans `SEOServiceCluster`, `SERVICE_CITY_CONTEXT`, `DEFAULT_SERVICE_FAQS` |
| `src/constants/seoUniqueContent.ts` | Rédiger 17 entrées villes manquantes |
| `src/app/layout.tsx` | Ajouter schema `ProfessionalService` global |
| `src/app/(seo)/[cityPage]/page.tsx` | Schema complet (`@id`, `telephone`, `geo` 5 décimales, `openingHours`, supprimer `aggregateRating` hardcodé), remplacer OSM par Google Maps |
| `src/app/(seo)/[cityPage]/[service]/page.tsx` | Schema `Service` + `BreadcrumbList` + `FAQPage` dynamique, contenu service×ville, remplacer OSM |
| `src/components/layout/Footer.tsx` | Ajouter téléphone + email avec `tel:` link |
| `src/components/seo/SEOLocalReviews.tsx` | Supprimer mention "avis certifiés" hardcodée |
| `src/components/seo/TrustBadges.tsx` | Enrichir badges avec liens autorité externe |

---

## Ordre d'exécution recommandé

```
Semaine 1 (code) :
├── Phase 1 : Téléphone footer + Google Maps + NAP unifié    [2h]
├── Phase 2 : Schema complet (seoConfig + jsonLd)            [3h]
└── Phase 3 : Supprimer aggregateRating hardcodé             [1h]

Semaine 1 (manuel) :
└── Phase 8 : Créer GBP + Bing Places + Apple Business Connect

Semaine 2 (code) :
├── Phase 4 : Contenu unique 17 villes                       [4h]
├── Phase 5 : Contenu service×ville (6 villes prioritaires)  [4h]
└── Phase 6 : FAQ par service                                [1h]

Semaine 2 (manuel) :
└── Phase 8 : Citations Tier 1 (Pages Jaunes, Kompass, Trustpilot)

Semaine 3 :
├── Phase 7 : TrustBadges enrichis                           [1h]
└── Phase 3 Option B : Intégrer vrais avis Google (après 10+ avis sur GBP)
```

---

## Score projeté par phase

| Après phase | GBP | Reviews | On-Page | NAP/Citations | Schema | Authority | Total |
|-------------|-----|---------|---------|---------------|--------|-----------|-------|
| Baseline | 4 | 8 | 13 | 3 | 7 | 2 | **37** |
| Phase 1 | 11 | 8 | 15 | 6 | 7 | 2 | **49** |
| Phase 2 | 11 | 8 | 15 | 8 | 10 | 2 | **54** |
| Phase 3 | 11 | 14 | 15 | 8 | 10 | 2 | **60** |
| Phase 4 | 11 | 14 | 18 | 8 | 10 | 2 | **63** |
| Phase 5+6 | 11 | 14 | 20 | 8 | 10 | 2 | **65** |
| Phase 7 | 11 | 14 | 20 | 8 | 10 | 6 | **69** |
| Phase 8 (GBP) | 22 | 16 | 20 | 12 | 10 | 6 | **86** |
| Phase 8 complète + Option B | 25 | 20 | 20 | 15 | 10 | 10 | **100** |

> Note : Les phases 1-7 sont 100% dans le code. La phase 8 (GBP + citations) est indispensable pour les 14 derniers points — impossible à simuler côté code.
