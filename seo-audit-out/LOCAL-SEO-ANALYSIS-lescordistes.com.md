# Local SEO Analysis — lescordistes.com

**Date** : 2026-04-25
**Type business** : Marketplace national / Service Area Business (SAB) multi-villes
**Industrie** : Home Services — Travaux sur corde / en hauteur (B2B + B2C)
**Périmètre indexé** : 1 473 pages (61 villes + 1 380 city×service + 32 institutionnel/blog/lexique)

---

## Score global : **58 / 100**

| Dimension | Pondération | Score | Note |
|---|---|---|---|
| GBP Signals | 25% | 8 / 25 | 🔴 Aucun GBP visible (logique : marketplace national, pas commerce local) |
| Reviews & Reputation | 20% | 4 / 20 | 🔴 Aucun `aggregateRating` schema, pas de système d'avis exposé |
| Local On-Page SEO | 20% | 7 / 20 | 🔴 **Doorway risk critique** sur 1 380 pages (voir §3) |
| NAP Consistency | 15% | 9 / 15 | 🟡 NAP en LegalNotice OK mais absent du footer global |
| Local Schema | 10% | 8 / 10 | 🟢 Bon schéma `Service` + `LocalBusiness` provider, `geo` 5 décimales, `areaServed` |
| Local Authority | 10% | 4 / 10 | 🟡 Trust badges présents, peu de signaux locaux par ville |

---

## 1. Type de business & contexte

LesCordistes.com **n'est pas un commerce local au sens GBP**. C'est :
- Une **plateforme nationale** B2B/B2C (mise en relation client ↔ cordiste)
- Service Area Business à couverture France entière
- Siège : Anthony PROFIT, 2 rue Pierre Pietri, 06000 Nice (micro-entreprise)

→ Conséquence : la concurrence locale dans le map pack n'est **pas la cible**. La cible est l'organique sur requêtes `cordiste [ville]`, `[service] [ville]`, `[service] cordiste`. Les pages city + city×service sont donc **stratégiques**, ce qui rend leur qualité critique (cf §3).

---

## 2. NAP (audit consistance)

| Source | Name | Address | Phone | Email |
|---|---|---|---|---|
| Mentions légales | Anthony PROFIT (LesCordistes.com) | 2 rue Pierre Pietri, 06000 Nice | — | anthony@lescordistes.com |
| Header (mobile menu) | — | — | +33 6 60 50 16 82 | anthony@lescordistes.com |
| Footer | LesCordistes.com (logo) | ❌ absent | ❌ absent (composant `FooterContact` charge en client) | hover only |
| Schema Organization (homepage) | LesCordistes.com | ❌ pas de `address` | `SEO_PHONE` | `SEO_EMAIL` |
| Schema LocalBusiness (city pages) | LesCordistes.com | ❌ `addressLocality` = ville (pas le siège) | `SEO_PHONE` | `SEO_EMAIL` |

**🟡 Issues** :
1. **NAP invisible côté HTML statique** — phone/email injectés via composant client `FooterContact` (donc absents au crawl si JS désactivé/délai). Crawlers texte-only et certains LLMs ne les voient pas.
2. **Pas de `PostalAddress` dans le schema Organization** de la homepage — Google n'a aucun moyen d'identifier le siège.
3. **`addressLocality` = ville de la page** dans le schema LocalBusiness des pages city — techniquement faux pour un SAB qui n'a PAS d'établissement à Paris/Lyon/etc. Risque : Google peut interpréter ça comme tentative de local-spam.

---

## 3. ⚠️ DOORWAY PAGE RISK — Niveau CRITIQUE

C'est **le problème #1 du site**.

### Constat chiffré

| Métrique | Valeur | Source |
|---|---|---|
| Pages programmatiques city × service | **1 380** | sitemap |
| Couples (service, ville) avec contenu unique | **44** | `SERVICE_CITY_CONTEXT` dans `seoData.ts:482` |
| Couples avec fallback `default` (générique) | ~3 services seulement | idem |
| **Pages avec contenu vraiment unique** | **~3,2 %** | 44 / 1 380 |
| **Pages servant un texte interchangeable** | **~96,8 %** | 1 336 / 1 380 |

### Swap test (méthode RicketyRoo) — ÉCHEC

**Live** : `/cordiste-lyon/maintenance-eolienne` (city sans contexte unique pour ce service) :

> "La maintenance éolienne exige des techniciens certifiés GWO. Nos équipes interviennent sur tous types d'éoliennes : onshore, offshore, turbines urbaines."

→ Si tu remplaces "Lyon" par "Marseille" ou "Toulouse" dans le H1 et la meta, **rien d'autre ne change**. C'est le pattern doorway exact.

### Précédent à connaître

Société HVAC américaine (cas Whitespark / Sterling Sky) → **−80 % rankings, −63 % trafic** après le **March 2024 Core Update** pour ce même pattern (pages city × service interchangeables).

### Risque concret pour LesCordistes

- Un Core Update Google 2026 (le prochain peut tomber dans 4-12 semaines) peut désindexer en masse les ~1 336 pages pauvres
- Site Reputation Abuse policy de Google (renforcée 2024-2025) cible explicitement ce type de contenu
- AI Overviews ignorent déjà les pages doorway (citation rate ≈ 0)

---

## 4. Schema (audit)

### ✅ Points forts

- `Service` schema sur city×service avec `provider` LocalBusiness, `offers` Offer (priceRange), `areaServed` City
- `geo` coordinates avec 5 décimales (city pages — conforme recommandation Google)
- `areaServed` GeoCircle 30 km radius
- `BreadcrumbList` + `FAQPage` cohérents
- `@id` Organization référencé en cross-page

### 🟡 Points à corriger

| # | Issue | Fichier | Fix |
|---|---|---|---|
| S1 | Homepage Organization sans `address` | `src/app/page.tsx:33` | Ajouter `PostalAddress` complet du siège Nice |
| S2 | LocalBusiness des city pages déclare `addressLocality: name` (ville de la page) | `src/app/(seo)/[cityPage]/page.tsx:80` | Remplacer par `address` du siège + `areaServed` City + `serviceArea` GeoCircle |
| S3 | Pas d'`aggregateRating` sur Organization | homepage | Ajouter dès qu'un système d'avis client interne existe (ou via Trustpilot/Google Business avec sameAs) |
| S4 | `priceRange: '350€–600€/jour'` dans Offer | `[service]/page.tsx:97` | Format Schema.org : `"€€"` ou `350-600 EUR` (pas de `/jour` parsable) |

---

## 5. Reviews & E-E-A-T

| Signal | Statut |
|---|---|
| `aggregateRating` schema | ❌ Absent |
| Reviews on-page (témoignages clients réels) | ❌ Le composant `SEOLocalReviews` parle de la plateforme, pas d'avis clients |
| Trust badges visibles (CQP, IRATA, RC Pro) | ✅ Composant `TrustBadges` |
| Owner responses, third-party reviews (Google, Trustpilot) | ❌ Aucun lien `sameAs` détecté |
| Statistique BrightLocal 2026 : 31 % des consommateurs n'utilisent que des entreprises 4,5★+ | — |

**Action** : créer une boucle d'avis vérifiables (post-mission) et exposer un `aggregateRating` sur la homepage **dès 10 avis collectés** (seuil magique Sterling Sky).

---

## 6. AI Search Impact

- 45 % des utilisateurs utilisent ChatGPT pour recommandations locales (BrightLocal LCRS 2026)
- ChatGPT convertit à **15,9 %** vs Google organique 1,76 % (Seer Interactive)
- ChatGPT source via Bing → **Bing Places non revendiqué** = invisibilité totale dans ChatGPT/Copilot/Alexa
- llms-full.txt présent (vérifié sur prod) → bon point pour Perplexity/Claude

→ Recommandation : `/seo geo https://www.lescordistes.com/` pour analyse complète AI.

---

## Top 10 actions priorisées

| # | Action | Priorité | Effort | Impact |
|---|---|---|---|---|
| 1 | **Désindexer les ~1 336 pages doorway** ou les fusionner par cluster régional | 🔴 Critique | 2-4 jours | Évite −80 % trafic au prochain Core Update |
| 2 | **Compléter `SERVICE_CITY_CONTEXT`** : minimum top-15 villes × top-10 services = 150 pages avec 200+ mots uniques | 🔴 Critique | 3-5 jours rédaction | Sauve les pages stratégiques |
| 3 | **Ajouter NAP visible dans le footer** (HTML statique, pas en composant client-only) | 🟠 Haut | 30 min | Crawlers texte + LLMs voient le NAP |
| 4 | **Corriger `addressLocality` = ville-de-la-page** dans le schema LocalBusiness des city pages → `address` du siège + `areaServed` | 🟠 Haut | 1 h | Évite signal anti-spam Google |
| 5 | **Ajouter `PostalAddress` dans Organization** schema homepage | 🟠 Haut | 15 min | Identification siège pour Google |
| 6 | **Revendiquer Bing Places** (powers ChatGPT/Copilot/Alexa) | 🟠 Haut | 1 h | Visibilité AI search +45 % audience |
| 7 | **Revendiquer Apple Business Connect** (usage doublé à 27 %) | 🟡 Moyen | 30 min | Apple Maps + Siri |
| 8 | **Mettre en place collecte d'avis vérifiés** + `aggregateRating` dès 10 reviews | 🟡 Moyen | 1-2 j dev | E-E-A-T + rich snippet étoiles |
| 9 | Ajouter signaux d'autorité locaux : Chambre de commerce de Nice, Qualibat, presse cordistes | 🟡 Moyen | hors-site | Backlinks locaux + AI citation |
| 10 | Corriger `priceRange` schema (format `"€€"` ou plage simple) | 🟢 Bas | 5 min | Validation Schema.org propre |

---

## Limites de cette analyse

Ce rapport ne couvre **pas** :
- Geo-grid rank tracking (nécessite DataForSEO `local_pack_serp` payant — voir `/seo maps`)
- Domain Authority / profil de backlinks (DataForSEO Backlinks payant — voir `/seo backlinks`)
- GBP Insights data (le compte GBP n'est pas connecté, et pas pertinent ici car SAB national)
- Local pack position en temps réel sur requêtes spécifiques
- Field data CrUX (Google indique : « insufficient traffic data » → audience encore trop faible pour qu'un dataset CrUX soit constitué — à reconsulter dans 4-6 semaines)

Pour combler ces gaps : DataForSEO MCP (live SERP + backlinks), Search Console (impressions/CTR par requête city/service), Ahrefs/Semrush (DA + competitor gap).

---

## Verdict

Le site est **bien construit techniquement** (schema propre, geo coordinates, breadcrumbs, FAQ, sitemap structuré, /og + /llms-full.txt). Mais il est **massivement exposé au risque doorway** sur 96,8 % de ses pages programmatiques. C'est le seul vrai chantier critique.

Soit on **réduit le périmètre** (fusionner par région : `/cordiste-ile-de-france/`, `/cordiste-paca/` au lieu de 61 city pages × 23 services), soit on **enrichit massivement** (rédiger ~150 contextes uniques service×ville pour les top combos). L'option 1 est 5× plus rapide à exécuter mais sacrifie le potentiel longue traîne ; l'option 2 le préserve mais demande un investissement éditorial.

L'option **hybride** (concentration + qualité) est probablement la bonne voie : ne garder que les top-20 villes × top-12 services = 240 pages bien rédigées + une page régionale fallback pour les villes secondaires. À discuter en stratégie.
