# Local SEO Analysis — lescordistes.com
**Date :** 2026-04-06 | **URL analysée :** https://lescordistes.vercel.app/ (env. test)
**Analysé par :** skill seo-local (March 2026 edition)

---

## Local SEO Score : 37/100

| Dimension | Poids | Score | Détail |
|-----------|-------|-------|--------|
| GBP Signals | 25% | 4/25 | Aucune fiche GBP visible, pas de Maps Google, pas de téléphone |
| Reviews & Réputation | 20% | 8/20 | Avis affichés mais données statiques/hardcodées, aucun lien vers plateforme réelle |
| On-Page SEO Local | 20% | 13/20 | Bon title/H1 avec ville, pages services existantes, mais pas de NAP et 17/23 villes = contenu générique |
| NAP & Citations | 15% | 3/15 | Aucun NAP sur aucune page, aucune citation Tier 1 détectable |
| Local Schema | 10% | 7/10 | LocalBusiness + geo + FAQPage présents ; champs manquants (tel, postal code) ; précision geo insuffisante |
| Links & Autorité Locale | 10% | 2/10 | Aucun signal chambre de commerce, BBB, presse locale visible |

---

## Type de business détecté

**SAB (Service Area Business)** — Marketplace de mise en relation.
Pas d'adresse physique intentionnellement omise. Zones desservies = toute la France (23 villes ciblées SEO).
Secteur : **Travaux spécialisés en hauteur / Home Services B2B+B2C**.

---

## 1. GBP Signals — 4/25

| Signal | Statut |
|--------|--------|
| Fiche Google Business Profile revendiquée | ❌ Non détecté |
| Google Maps embed | ❌ Absent (OpenStreetMap utilisé à la place) |
| Catégorie primaire GBP alignée | ❓ Impossible à vérifier |
| Horaires d'ouverture visibles | ❌ Absents |
| Photos/vidéos sur GBP | ❓ Non évaluable |
| Posts GBP actifs | ❓ Non évaluable |
| Numéro de téléphone visible | ❌ Absent sur toutes les pages |
| Click-to-call (`tel:` link) | ❌ Absent |

**Problème majeur :** OpenStreetMap est utilisé à la place de Google Maps sur les 23 pages villes + 230 pages services. Google ne reçoit aucun signal géographique via Maps embed. De plus, sans numéro de téléphone visible, le click-to-call est impossible (les 76% d'utilisateurs mobile qui visitent dans les 24h ne peuvent pas appeler).

---

## 2. Reviews & Réputation — 8/20

| Signal | Statut |
|--------|--------|
| Avis visibles sur les pages | ✅ Oui (3 témoignages par page) |
| aggregateRating en schema | ✅ Présent (Paris: 4.9/155, nettoyage-facade Paris: 4.8/295) |
| Source des avis = données réelles | ❌ **Données hardcodées/statiques** (fonction `getLocalReviews()`) |
| Lien vers plateforme d'avis Google | ❌ Absent |
| Réponses propriétaire visibles | ❌ Absentes |
| Présence multi-plateforme (Yelp, Trustpilot...) | ❌ Non détectée |
| Cadence de nouveaux avis (règle des 18 jours) | ❓ N/A — avis statiques |
| Seuil magique 10+ avis Google réels | ❓ Non évaluable sans GBP réel |

**Risque critique :** L'`aggregateRating` en schema pointe vers des données inventées. Google peut détecter et ignorer (voire pénaliser) les notes agrégées sans source vérifiable. Les "295 avis" pour nettoyage-facade Paris ne correspondent à aucune plateforme réelle.

---

## 3. Local On-Page SEO — 13/20

### Pages hub villes (23 pages)

| Signal | Statut |
|--------|--------|
| Ville dans le title tag | ✅ "Cordiste Paris : Travaux en Hauteur & Accès Difficiles" |
| Ville dans le H1 | ✅ "Entreprise de Travaux sur Cordes à Paris : Experts en Accès Difficiles" |
| Carte embed | ✅ OpenStreetMap (zone 30km) |
| Contenu éditorial unique | ⚠️ **6/23 villes** ont du contenu vraiment unique (Paris, Marseille, Lyon, Toulouse, Bordeaux, Monaco) |
| Contenu des 17 autres villes | ❌ Template générique "Technicité et flexibilité sur votre agglomération" — **test de swap réussi = risque doorway** |
| NAP visible (adresse, téléphone) | ❌ Absent |
| Pages services dédiées | ✅ 10 services × 23 villes = 230 pages |
| Liens internes hub→spoke | ✅ Bonne architecture hub-and-spoke |
| Click-to-call | ❌ Absent |

### Pages service×ville (230 pages)

| Signal | Statut |
|--------|--------|
| Ville + service dans title/H1 | ✅ "Nettoyage de façades à Paris : Intervention sur Cordes" |
| Contenu éditorial unique par service | ⚠️ Réutilise les paragraphes de la page ville hub |
| FAQs uniques par service | ❌ Mêmes 2 questions (prix + certifications) sur toutes les pages |
| Schema complet LocalBusiness | ❌ Schema `Service` seulement (pas LocalBusiness complet) |
| **Test doorway (Rickety Roo)** | ❌ **Swap Bordeaux→Nantes sur 90% des pages services = contenu identique** |

---

## 4. NAP Consistency & Citations — 3/15

### Audit NAP croisé

| Source | Nom | Adresse | Téléphone |
|--------|-----|---------|-----------|
| HTML page (footer/contact) | LesCordistes.com | ❌ Absent | ❌ Absent |
| Schema JSON-LD | LesCordistes.com - Paris | Ville seulement (pas rue/CP) | ❌ Absent |
| GBP visible | ❌ Non détecté | — | — |

**Incohérence :** Aucun NAP unifié. Le nom varie selon la page ("LesCordistes.com" vs "LesCordistes.com - Paris" vs "LesCordistes.com - Spécialiste Nettoyage de façades à Paris").

### Citations Tier 1

| Annuaire | Statut |
|----------|--------|
| Google Business Profile | ❌ Non revendiqué / non visible |
| Bing Places | ❌ Non revendiqué (critique : source de ChatGPT/Copilot) |
| Apple Business Connect | ❌ Non revendiqué (usage x2 en 2026) |
| Pages Jaunes / Kompass | ❓ Non vérifiable via analyse page |
| BBB / équivalent FR (Trustpilot) | ❌ Non détecté |

---

## 5. Local Schema — 7/10

### Pages villes (LocalBusiness)

```json
{
  "@type": "LocalBusiness",               ✅ Type générique (acceptable pour marketplace SAB)
  "name": "LesCordistes.com - Paris",     ⚠️ Nom incohérent (varie par page)
  "aggregateRating": { ... },             ⚠️ Données hardcodées — risque
  "address": {
    "addressLocality": "Paris",           ✅
    "addressRegion": "Île-de-France",     ✅
    "addressCountry": "FR"                ✅
    // "streetAddress": MANQUANT          ❌ (SAB acceptable mais priceRange sans adresse = schema incomplet)
    // "postalCode": MANQUANT             ❌
  },
  "geo": { "latitude": 48.8566, "longitude": 2.3522 },  ⚠️ 4 décimales (recommandé: 5+)
  "areaServed": { "@type": "GeoCircle", "geoRadius": "30000" },  ✅
  "telephone": MANQUANT,                  ❌
  "openingHoursSpecification": MANQUANT  ❌
}
```

### Pages services (Service schema)

- Schema `Service` uniquement — manque le `LocalBusiness` complet avec `address` et `geo`
- `aggregateRating` présent mais données statiques différentes de la page hub (Paris ville: 4.9/155, Paris nettoyage: 4.8/295 — incohérence)

### Homepage

- Schemas présents : `WebSite` + `Organization` + `FAQPage`
- Manque : `LocalBusiness` ou `ProfessionalService` national

---

## 6. Local Link & Authority — 2/10

| Signal | Statut |
|--------|--------|
| Mention Chambre de Commerce | ❌ Non détecté |
| Badge/accréditation BBB/Trustpilot | ❌ Non détecté |
| Presse locale / médias | ❌ Non détecté |
| Implication communautaire | ❌ Non détecté |
| Listes "Best of" / annuaires sectoriels | ❌ Non détecté |
| Mentions de marque (brand mentions) | ❓ Non évaluable via analyse page |

---

## Top 10 Actions Prioritaires

### CRITIQUE

**1. Ajouter un numéro de téléphone avec `tel:` link sur toutes les pages**
Sans numéro, le taux de conversion mobile s'effondre. Même un numéro virtuel/Stripe Phone suffit pour démarrer. Ajouter dans le header ou footer, et dans le schema (`"telephone": "+33XXXXXXXXX"`).

**2. Revendiquer et optimiser la fiche Google Business Profile**
Catégorie primaire suggérée : "Entreprise de travaux en hauteur" ou "Prestataire de services de bâtiment". Sans GBP, le local pack est inaccessible. Lier la fiche à la homepage (pas aux pages villes pour éviter la Sterling Sky Diversity Update).

**3. Remplacer `aggregateRating` hardcodé par des données réelles — ou le supprimer**
Les avis statiques (getLocalReviews()) violent la politique Google sur les données structurées trompeuses. Options : (a) intégrer une vraie API d'avis (Google, Trustpilot), (b) afficher les avis sans schema aggregateRating jusqu'à avoir des données réelles, (c) au minimum, indiquer la source dans le schema (`"itemReviewed"` avec source).

### HAUTE PRIORITÉ

**4. Créer du contenu éditorial unique pour les 17 villes avec template générique**
Les villes : Lille, Nice, Strasbourg, Rennes, Grenoble, Rouen, Toulon, Montpellier, Metz, Nancy, Orléans, Saint-Étienne, Tours, Brest, Clermont-Ferrand, Dijon, + toutes les villes avec `contextualIntro` défini mais sans entrée dans `SEO_EDITORIAL_DB`.
Solution : enrichir `seoUniqueContent.ts` avec du contenu vraiment spécifique (économie locale, industrie dominante, contraintes topographiques réelles).

**5. Revendiquer Bing Places for Business**
Bing alimente ChatGPT, Copilot et Alexa. 45% des utilisateurs utilisent maintenant ChatGPT pour les recommandations locales (BrightLocal 2026). Gratuit et rapide.

**6. Revendiquer Apple Business Connect**
Usage doublé à 27% en 2026. Gratuit, 30 min de setup.

### PRIORITÉ MOYENNE

**7. Remplacer OpenStreetMap par Google Maps embed sur les pages villes**
Le OSM embed n'envoie aucun signal à Google. Un embed Google Maps (avec place_id de la fiche GBP une fois créée) renforce le signal géographique. Utiliser `loading="lazy"` pour l'impact performance.

**8. Différencier le contenu des 230 pages service×ville**
Les pages `/cordiste-{ville}/{service}` partagent les mêmes paragraphes éditoriaux que leur page hub. Ajouter au minimum : (a) une description spécifique au service dans la ville (ex. pour nettoyage-facade Paris : "façades haussmanniennes en pierre de taille"), (b) des FAQ différentes par service (pas le même doublon prix/certifications).

**9. Uniformiser le `name` dans tous les schemas**
Actuellement : "LesCordistes.com", "LesCordistes.com - Paris", "LesCordistes.com - Spécialiste Nettoyage de façades à Paris". Utiliser un `@id` cohérent et un `name` stable ("LesCordistes.com") avec `serviceType` pour différencier.

**10. Ajouter `telephone`, `postalCode` et précision geo 5 décimales dans le schema**
Même pour un SAB sans adresse physique, un numéro national est nécessaire. Précision geo : passer de `48.8566` à `48.85660` (5 décimales — signal de localisation plus fort selon confirmation Google).

---

## Positifs existants

- Geo meta tags (`geo.region`, `geo.placename`, `geo.position`) sur chaque page ✅
- Canonical URLs correctement définis (pointent vers lescordistes.com) ✅
- Title + H1 avec ville sur toutes les pages ✅
- `areaServed` GeoCircle 30km dans le schema ✅
- FAQPage schema présent ✅
- Architecture hub-and-spoke (hub ville → spokes services) ✅
- Pages SSG (bon pour le crawl/indexation) ✅
- OpenGraph et metadata complètes ✅
- Breadcrumb navigation sur pages services ✅
- 6 villes avec contenu éditorial vraiment unique ✅

---

## Limitations de cette analyse

Ce rapport **ne peut PAS évaluer** :
- **Positions réelles dans le local pack** (requiert outil de rank tracking géo-localisé : BrightLocal, Local Falcon, Search Atlas)
- **Domain Authority / Trust Flow** (requiert Moz, Majestic, Ahrefs)
- **Profil de backlinks complet** (requiert Ahrefs, SEMrush ou DataForSEO)
- **GBP Insights** (impressions, clics, appels — accès interne uniquement)
- **Citations exhaustives** (audit complet via BrightLocal ou Whitespark Citation Finder)
- **Performance réelle des avis** (nécessite accès aux plateformes)
- **Positions ChatGPT/Perplexity** (lancer `/seo geo https://lescordistes.com` pour l'analyse GEO complète)
