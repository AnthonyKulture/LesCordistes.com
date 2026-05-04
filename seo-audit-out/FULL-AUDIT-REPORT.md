# Audit SEO complet — LesCordistes.com

**Date** : 2 mai 2026
**URL auditée** : https://www.lescordistes.com/
**Type business** : Marketplace nationale FR — SAB (Service Area Business) BTP / cordistes
**Stack** : Next.js 15 App Router + Vercel + Supabase
**Crawl** : 8 pages-clés analysées, sitemap 375 URLs, llms.txt + llms-full.txt
**Sous-agents mobilisés** : seo-technical · seo-content · seo-schema · seo-sitemap · seo-geo · seo-local

---

## Score SEO Global : **67 / 100**

| Catégorie | Poids | Score | Pondéré |
|---|---|---|---|
| Technical SEO | 22 % | 74 | 16,3 |
| Content Quality | 23 % | 58 | 13,3 |
| On-Page SEO | 20 % | 75 | 15,0 |
| Schema / Structured Data | 10 % | 78 | 7,8 |
| Performance (CWV) | 10 % | 45 | 4,5 |
| AI Search Readiness (GEO) | 10 % | 61 | 6,1 |
| Images | 5 % | 75 | 3,8 |
| **TOTAL** | **100 %** | | **66,8 → 67** |

Note Local SEO (transverse, score séparé) : **61 / 100**

---

## Executive Summary

### Top 5 problèmes critiques

1. **Drift sitemap : 145 URLs noindex listées comme indexables.** Le filtre `hasUniqueServiceCityContext()` n'est pas appliqué dans `app/sitemap.ts` — 278 pages ville×service présentes dans le sitemap au lieu de 133. Signal contradictoire majeur pour Google (sitemap dit "indexe-moi", meta dit "noindex").
2. **LCP mobile homepage : 4,9 s** (seuil Good = 2,5 s). L'image hero n'a pas `priority` sur le composant `<Image>`. Gain estimé : −1 à −2 s.
3. **TBT mobile /jobs : 979 ms** — fetch TanStack Query côté client au premier rendu. Provoque un INP dégradé (>500 ms = Poor en CrUX).
4. **Aucun `aggregateRating` ni avis visible publiquement.** Trustpilot dans `sameAs` mais sans note exposée → impossible d'obtenir des étoiles dans les SERPs.
5. **Pas de page "À propos" ni d'auteur nommé sur les articles blog.** Signal E-E-A-T rouge pour un site YMYL-adjacent (travaux, sécurité, argent). QRG septembre 2025 exige un "clear author byline".

### Top 5 quick wins (effort < 1 h chacun)

1. **Corriger les URLs `lescordistes.com` → `www.lescordistes.com` dans llms.txt et llms-full.txt** (30 min). Cohérence canonical pour parseurs LLM qui ne suivent pas les redirections.
2. **Supprimer `<changefreq>` et `<priority>` du sitemap** (5 min). Tags ignorés par Google depuis 2023, alourdissent le fichier de ~30 %.
3. **Ajouter `priority` sur le composant `<Image>` du hero homepage** (5 min). Gain LCP mobile estimé −1 à −2 s.
4. **Rendre le téléphone visible dans le footer** (`<a href="tel:+33660501682">`) (10 min). Cohérence NAP + signal de confiance B2B.
5. **Référencer Organization par `{ "@id": "https://www.lescordistes.com/#organization" }` dans les pages city** au lieu de redéclarer inline (15 min). Réduit la duplication et la fragilité.

---

## 1. Technical SEO — 74 / 100

### Wins acquis
- **Robots.txt impeccable** : blocs ciblés (/dashboard, /admin, /api, /pro), Sitemap pointant vers www
- **Sitemap 100 % www** : aucune URL non-www, lastmod réels et variés
- **Stratégie anti-doorway opérationnelle** : `hasUniqueServiceCityContext()` fonctionne sur les pages (404/noindex correctement servis), mais le sitemap n'applique pas le filtre (voir Sitemap)
- **CLS parfait** sur toutes les pages testées (homepage, cordiste-paris, jobs)
- **SSR confirmé** : `x-nextjs-prerender: 1`, HTML complet servi côté serveur
- **HSTS actif** : `max-age=63072000`
- **OG/Twitter cards complets** : 1200×630, title, description, url

### Problèmes par priorité

**CRITICAL**
- **C1 — LCP mobile homepage 4,92 s** : `<link rel="preload">` sur l'image hero mais pas de `fetchPriority="high"` sur le `<img>`. Manque l'attribut `priority` sur le composant `<Image>` Next.js.
- **C2 — TBT /jobs mobile 979 ms** : fetch côté client au premier rendu (TanStack Query). Ratio TBT mobile/desktop 12:1 = main thread bloqué.

**HIGH**
- **H1 — Aucun lien interne homepage → pages ville** : 18 liens, tous vers `/jobs`, `/post-job`, `/inscription`, footer. Les 60 villes et 133 pages ville×service ne reçoivent aucun signal de popularité interne.
- **H2 — TBT cordiste-paris desktop 1241 ms** : anormal pour une page SSG. Probable composant client (carte ?) chargé sans `dynamic({ ssr: false })`.

**MEDIUM**
- **M1 — CSP en `Report-Only`** : passer en enforce après vérification des violations (4 semaines stables en GSC).
- **M2 — Sitemap `priority=0.7` uniforme** sur 152 URLs. Pas d'impact SEO direct mais peu différenciant.

**LOW**
- L1 — Pas de `rel="next"`/`rel="prev"` sur le blog (pas urgent à 10 articles).

---

## 2. Content Quality — 58 / 100 (E-E-A-T)

| Facteur | Score |
|---|---|
| Experience | 45/100 |
| Expertise | 65/100 |
| Authoritativeness | 55/100 |
| Trustworthiness | 62/100 |

### Signaux présents
- Certifications **CQP/IRATA** mentionnées systématiquement
- Références réglementaires précises : art. L6314-1, R4323-58, INRS R408, NF EN 363, art. R421-17 Code urbanisme
- Données chiffrées sourcées : 350-600 €/j, économie 30-50 %, 8-25 €/m²
- SIRET/KBIS + RC Pro déclarés
- CGU/CGV/Mentions légales/Confidentialité accessibles

### Signaux manquants (risque QRG "Who is responsible for this content?")
- **Pas de page À propos** dédiée
- **Aucun auteur nommé** sur les 10 articles de blog
- **Zéro avis client** avec nom/ville/photo public sur le site
- **Pas de portfolio chantiers** ni études de cas
- Compteurs vagues ("+150 % cette année" — 150 % de quoi ?)

### Profondeur de contenu

| Page | Mots utiles | Verdict |
|---|---|---|
| Homepage | ~490 | Limite basse (seuil 500) |
| `/cordiste-paris` | ~1 087 | Solide, swap test réussi |
| `/cordiste-paris/nettoyage-facade` | ~480 | **Sous le seuil 800 pour service** |
| Lexique (par fiche) | 132-188 | **Trop court pour requêtes définitionnelles** |

### Boilerplate ratio

Sur les pages ville×service indexables : **~67 % de boilerplate partagé**, ~33 % unique. Risque de détection "low effort" par Google même si 91 % des 1 380 pages sont noindex.

### 5 actions priorisées
1. Créer `/a-propos` avec fondateur nommé (impact E-E-A-T immédiat)
2. Ajouter byline auteur sur tous les articles blog
3. Porter le contenu unique des pages ville×service de 80 à 250-350 mots
4. Étoffer les 13 fiches lexique de ~150 à 400-500 mots
5. Intégrer 3-5 témoignages clients nominatifs avec ville/type de travaux

---

## 3. On-Page SEO — 75 / 100

- **Title tags** : conformes (`%s · LesCordistes` template, ≤60 c)
- **Meta descriptions** : présentes et différenciées
- **H1/H2** : hiérarchie correcte sur pages city, faible sur homepage
- **Internal linking** : déficit majeur (homepage isolée des deep pages)
- **Canonical** : tous en www, cohérent avec `SEO_BASE_URL`

---

## 4. Schema / Structured Data — 78 / 100

### Schema présent par type de page

| Page | @types détectés |
|---|---|
| Homepage | `WebSite`, `Organization` + `ProfessionalService`, `FAQPage` |
| City | `Service`, `BreadcrumbList`, `FAQPage` |
| City × Service | `Service`, `BreadcrumbList`, `FAQPage` |
| Blog listing | `Blog` (avec `blogPost[]` de type `BlogPosting`) |
| Lexique | `DefinedTermSet`, `BreadcrumbList` |

### Bugs

**CRITIQUE**
- `Offer.priceRange` non standard sur city × service (propriété de `LocalBusiness`, pas `Offer`). Google ignore l'`Offer`. Solution : `priceSpecification: { @type: "UnitPriceSpecification", minPrice, maxPrice, unitText: "jour" }`.
- `FAQPage` city × service manque `mainEntityOfPage` et `@id`.

**HAUTE**
- `BlogPosting` dans le listing manquent `author` + `publisher` → rich results Article impossibles.
- `DefinedTerm` absents du `DefinedTermSet` du lexique → termes individuels non indexables comme entités.

**MOYENNE**
- `WebSite` sans `SearchAction` (Sitelinks Searchbox manqué).
- `Organization` sans `contactPoint`.
- `Service` sur pages city sans `description` ni `category`.

### Cohérence stratégique
- Stratégie 1-Organization correctement appliquée : `@id: .../#organization` cohérent
- Aucun `LocalBusiness` avec `addressLocality` de ville de page → pas de local-spam
- Pages city redéclarent inline toutes les propriétés Organization (redondant, fragile en maintenance) — utiliser `{ "@id": ... }` à la place

---

## 5. Performance (Core Web Vitals) — 45 / 100

Données lab du 25 avril (PSI rate-limité aujourd'hui). À recouper avec CrUX field data si Search Console disponible.

| Page | Device | Perf | LCP | CLS | TBT |
|---|---|---|---|---|---|
| Homepage | mobile | 0,64 | **4,92 s** | 0 | 426 ms |
| Homepage | desktop | 0,74 | 1,31 s | 0,001 | 497 ms |
| /cordiste-paris | mobile | 0,67 | 3,53 s | 0,000 | 517 ms |
| /cordiste-paris | desktop | 0,68 | 0,76 s | 0,005 | **1241 ms** |
| /jobs | mobile | 0,68 | 2,74 s | 0,000 | **979 ms** |
| /jobs | desktop | 0,98 | — | — | — |

### Verdict
- **CLS** : ✓ excellent partout
- **LCP mobile** : ✗ critique sur homepage (4,9 s)
- **TBT** : ✗ TBT élevé sur /jobs mobile et /cordiste-paris desktop → INP probable >500 ms (Poor)

### Leviers
1. `priority` sur `<Image>` hero homepage
2. Prefetch SSR des données /jobs (RSC ou `generateStaticParams` + revalidation)
3. Audit `next build --debug` pour identifier composants client lourds (Map, galerie) à passer en `dynamic({ ssr: false })`

---

## 6. AI Search Readiness (GEO) — 61 / 100

| Plateforme | Score estimé |
|---|---|
| Google AI Overviews | 68/100 |
| ChatGPT | 42/100 |
| Perplexity | 55/100 |
| Bing Copilot | 60/100 |

### Wins
- llms.txt + llms-full.txt **présents** (bonne hygiène GEO)
- 43 paires Q/A dans llms-full.txt
- Données chiffrées avec années et sources
- FAQPage schema sur homepage
- robots.txt n'exclut aucun crawler IA

### Problèmes
- **URLs non-www dans llms.txt** : 6 occurrences `https://lescordistes.com` au lieu de `https://www.lescordistes.com` → incohérence canonical pour parseurs qui ne suivent pas les redirections
- **llms.txt non conforme spec llmstxt.org** : sections `## Docs` et `## Optional` absentes
- **Passages llms-full.txt mal calibrés** : 0 dans la plage optimale 134-167 mots (18 trop courts, 10 trop longs)
- **Pas de Wikipedia / pas de YouTube / pas de Reddit** : signaux d'autorité IA les plus corrélés (r=0,737 YouTube/Wikipedia)
- **H2 homepage non interrogatifs** : préférer `Quel est le prix d'un cordiste ?` à `Comment ça marche ?`
- **Pas de profil auteur Person schema** sur le blog

### 5 actions GEO priorisées
1. Corriger URLs llms.txt (www) — 30 min
2. Ajouter sections `## Docs` et `## Optional` à llms.txt — 1 h
3. Reformuler H2 homepage en questions + réponses 40-60 mots en HTML SSR — 1 h
4. Ouvrir chaîne YouTube + présence Reddit (signal d'autorité IA #1) — 1 semaine
5. Recalibrer 13 fiches lexique sur 134-167 mots — 2 h

---

## 7. Sitemap — drift critique

| Catégorie | Attendu (CLAUDE.md) | Observé | Delta |
|---|---|---|---|
| Institutionnelles | 14 | 13 | −1 |
| Pages ville `/cordiste-[ville]` | 60 | 60 | 0 |
| Pages ville×service | 133 | **278** | **+145** |
| Lexique | 13 | 13 | 0 |
| Blog | 6 | 10 | +4 (CLAUDE.md périmé) |
| **Total** | **226** | **375** | **+149** |

### Anomalies
- **CRITIQUE — 145 pages noindex listées dans le sitemap** : `app/sitemap.ts` n'applique pas `hasUniqueServiceCityContext()`. Signal contradictoire fort pour Google.
- **CRITIQUE — `<changefreq>` et `<priority>` sur 375 URLs** : tags ignorés par Google depuis 2023 (≈750 lignes parasites).
- **MOYEN — lastmod build timestamp uniforme** : 365 URLs avec `2026-05-01T20:11:05.981Z` → Google ignore lastmod si identique sur des centaines d'URLs.
- **MOYEN — `/faq` et `/contact` absentes** du sitemap (à vérifier : existent-elles ?).
- **INFO — Blog 10 articles** : CLAUDE.md mentionne 6, à mettre à jour.

---

## 8. Local SEO (transverse) — 61 / 100

| Dimension | Poids | Score |
|---|---|---|
| GBP Signals | 25 % | 38/100 |
| Reviews & Reputation | 20 % | **20/100** |
| Local On-Page | 20 % | 80/100 |
| NAP Consistency | 15 % | 72/100 |
| Local Schema | 10 % | 85/100 |
| Local Authority | 10 % | 55/100 |

### Diagnostic SAB
- ✓ Stratégie 1-Organization Nice + Service `areaServed: City` correctement implémentée
- ✓ Pas de `LocalBusiness` avec `addressLocality` de la ville visitée → pas de local-spam
- ✓ Page `/cordiste-paris` passe le swap test (calcaire lutétien, ABF 500 m, La Défense, zinc Marais/Montmartre, tarifs +25-35 % vs province)

### NAP — problème
**Téléphone et adresse présents UNIQUEMENT dans le JSON-LD**, absents du DOM visible (footer, contact). Crawlers de citations (Yext, BrightLocal) lisent souvent le texte visible. Le `+33 6 60 50 16 82` doit apparaître en `<a href="tel:...">` dans le footer.

### Reviews — point faible #1
- Pas d'`aggregateRating` dans le schema → pas d'étoiles dans les SERPs
- Aucun widget d'avis visible
- Trustpilot en `sameAs` sans note exposée
- Table `reviews` Supabase existe mais avis non exposés publiquement

### Citations FR à créer (Tier 1 manquantes)
- **Yelp France** (yelp.fr)
- **Kompass.com** (BTP B2B)
- **Habitissimo.fr** (audience cliente travaux)
- **Societe.com** (SIRET/SIREN, confiance juridique)
- **Annuaire FNTP** (institutionnel BTP)

### Signaux BTP manquants
- Pas de mention **OPPBTP** (organisme prévention BTP)
- **SFETH** mentionnée dans lexique mais absente des pages ville
- **Pas de SIRET visible** sur les mentions légales
- **Pas de logo assureur** (RC Pro déclarée mais sans nom d'assureur)
- Pas de page "Comment nous vérifions nos cordistes" (signal trustworthiness)

---

## 9. Images — 75 / 100

- OG image dynamique `/og?title=...&kicker=...` (edge runtime) — ✓
- Image hero homepage présente, format webp — ✓
- **Manque** : `priority` Next.js sur image hero (impact LCP) — voir Performance C1
- Audit alt-text non exécuté en détail (à approfondir si besoin)

---

## Limitations de cet audit

- **PSI quota Google épuisé** aujourd'hui → données performance datées du 25 avril
- **Pas d'accès GSC / GA4 / CrUX field data** → estimations basées sur lab data uniquement
- **Pas d'accès dashboard GBP** → impossible de vérifier l'état réel de la fiche
- **Pas d'accès Trustpilot dashboard** → score réel et nombre d'avis non vérifiables
- **Backlinks non analysés** (nécessite Ahrefs/Majestic/DataForSEO)
- **Audit alt-text images** non détaillé (à compléter)
- **Pages /lexique/[slug] individuelles** non auditées (uniquement la liste)
