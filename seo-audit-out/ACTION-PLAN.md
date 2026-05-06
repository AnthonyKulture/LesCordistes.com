# Plan d'action SEO — LesCordistes.com

**Date** : 2 mai 2026
**Score actuel** : 67/100 → Objectif réaliste 12 semaines : **82/100**
**Sur-thème** : remettre la stack en cohérence (sitemap ↔ noindex), débloquer LCP mobile, combler E-E-A-T (auteur, avis, À propos)

---

## CRITIQUE — à traiter sous 7 jours

### 1. Corriger le drift sitemap (145 URLs noindex listées)
**Fichier** : `src/app/sitemap.ts` (ou équivalent)
**Action** : appliquer `hasUniqueServiceCityContext(serviceSlug, citySlug)` dans le générateur sitemap. Filtrer les pages dont le contexte unique n'existe pas. Cible : passer de 375 URLs à ~226.
**Bonus** : retirer `<changefreq>` et `<priority>` (ignorés par Google depuis 2023, gain 30 % taille fichier).
**Impact** : élimine le signal contradictoire "sitemap dit indexe / meta dit noindex". Économise du crawl budget.
**Effort** : 1 h.

### 2. LCP mobile homepage — ajouter `priority` sur image hero
**Fichier** : composant hero homepage (probablement `src/app/page.tsx` ou `src/components/Hero.tsx`)
**Action** : sur le `<Image>` Next.js du hero, ajouter `priority` (génère automatiquement `fetchPriority="high"` + supprime `loading="lazy"`). Vérifier que le logo SVG ne lutte pas pour le préload.
**Impact** : LCP mobile **−1 à −2 s** (objectif < 2,5 s "Good"). Score Performance estimé +15 points.
**Effort** : 5 min.

### 3. TBT /jobs mobile — prefetch SSR des données
**Fichiers** : `src/app/jobs/page.tsx` et hook TanStack Query associé
**Action** : prefetcher les missions côté serveur (RSC ou `generateStaticParams` + revalidate), passer les données initiales en props plutôt qu'un fetch client au premier rendu. Différer filtres/pagination avec `startTransition`.
**Impact** : TBT **−400 à −600 ms** sur mobile, INP repassé sous le seuil Good.
**Effort** : 3-4 h.

### 4. Fix `Offer.priceRange` schema sur pages city × service
**Fichier** : générateur de schema des pages `[cityPage]/[service]`
**Action** : remplacer
```json
"offers": { "@type": "Offer", "priceRange": "350€–600€/jour", "priceCurrency": "EUR" }
```
par
```json
"offers": {
  "@type": "Offer",
  "priceCurrency": "EUR",
  "priceSpecification": {
    "@type": "UnitPriceSpecification",
    "minPrice": 350, "maxPrice": 600,
    "priceCurrency": "EUR", "unitText": "jour"
  },
  "availability": "https://schema.org/InStock"
}
```
**Impact** : débloque l'`Offer` ignoré actuellement par Google.
**Effort** : 30 min.

### 5. Page À propos avec fondateur nommé (`/a-propos`)
**Action** : créer `src/app/a-propos/page.tsx`. Contenu : nom du fondateur, background (cordiste/BTP), mission, date de création, nb de pros vérifiés, nb de missions publiées. Schema `Person` + lien vers `Organization`. 600-800 mots.
**Impact** : signal E-E-A-T trustworthiness le plus impactant manquant. QRG septembre 2025 attendu.
**Effort** : 2-3 h (rédaction).

---

## HAUTE — à traiter sous 1 mois

### 6. Auteur nommé sur tous les articles blog
**Fichiers** : `src/data/blogArticles.ts` + composant `BlogPostHeader`
**Action** : ajouter `author: { name, role, slug }` sur chaque article. Créer page auteur minimale `/auteur/[slug]`. Mettre à jour le schema `BlogPosting` avec `author` (Person) + `publisher` (Organization).
**Impact** : débloque rich results Article + comble le gap QRG "Who is responsible for this content?".
**Effort** : 2-3 h pour 10 articles.

### 7. Téléphone visible dans footer + page contact
**Fichier** : `src/components/Footer.tsx`
**Action** : ajouter `<a href="tel:+33660501682" className="...">06 60 50 16 82</a>`. Vérifier la présence aussi sur `/contact` si la page existe (sinon la créer).
**Impact** : cohérence NAP pour crawlers de citations + signal de confiance B2B.
**Effort** : 10 min.

### 8. AggregateRating + témoignages clients visibles
**Action** :
1. Ajouter `aggregateRating` au schema Organization homepage (depuis avis Trustpilot ou avis internes table `reviews`).
2. Créer composant témoignages avec 3-5 avis nominatifs (prénom + ville + type travaux + note). Afficher sur homepage et pages ville.
**Impact** : étoiles dans les SERPs + signal Experience E-E-A-T.
**Effort** : 4-6 h (composant + intégration + sélection avis).

### 9. Liens internes homepage → pages ville stratégiques
**Fichier** : `src/app/page.tsx`
**Action** : section "Nos villes principales" avec 8-12 liens (Paris, Marseille, Lyon, Toulouse, Nice, Bordeaux, Lille, Nantes, Strasbourg, Rennes, Montpellier, Grenoble) avant le footer.
**Impact** : distribution d'equity vers les 60 pages ville + 133 pages service (qui n'en reçoivent aucune actuellement).
**Effort** : 30 min.

### 10. Corriger URLs llms.txt + llms-full.txt (www)
**Fichiers** : `src/app/llms.txt/route.ts` et `src/app/llms-full.txt/route.ts` (ou équivalents)
**Action** : remplacer toutes les occurrences `https://lescordistes.com` par `https://www.lescordistes.com`. Source unique : `SEO_BASE_URL`.
**Impact** : cohérence canonical pour parseurs LLM (qui ne suivent pas toujours les redirections 301).
**Effort** : 30 min.

### 11. Ajouter `## Docs` et `## Optional` à llms.txt (conformité spec)
**Fichier** : `src/app/llms.txt/route.ts`
**Action** : ajouter
```
## Docs

- [Lexique complet](https://www.lescordistes.com/lexique): Dictionnaire de 13 termes clés du travail sur cordes
- [Blog guides](https://www.lescordistes.com/blog): 10 articles avec FAQs sur tarifs, certifications et réglementation
- [Cordiste Paris](https://www.lescordistes.com/cordiste-paris): Guide local IDF avec tarifs et FAQ

## Optional

- [Publier un besoin](https://www.lescordistes.com/post-job): Formulaire de mise en relation gratuit
- [Inscription cordiste](https://www.lescordistes.com/inscription-cordiste): Espace pro
```
**Effort** : 1 h.

### 12. TBT cordiste-paris desktop (1241 ms)
**Action** : `next build --debug` + analyse des chunks. Identifier le composant client qui pèse (carte ? galerie ? ExitIntentModal ?). Le passer en `dynamic(() => import('./X'), { ssr: false })`.
**Effort** : 2-3 h.

---

## MOYENNE — à traiter sous 3 mois

### 13. Étoffer contenu unique pages ville × service (80 → 250-350 mots)
**Fichier** : `src/data/seoData.ts` — section `SERVICE_CITY_CONTEXT`
**Action** : pour chaque entry des 133 pages indexables, développer `intro` (paragraphe 80-120 mots) + `useCases` (3 cas développés sur 50-70 mots chacun, pas en bullets d'une ligne). Ajouter spécificités locales (matériau, climat, réglementation, économie).
**Impact** : ratio boilerplate descend de 67 % → <40 %, sécurise contre détection "low effort" Google.
**Effort** : 30 min × 133 pages = ~70 h. À étaler sur 4-6 semaines, prioriser top 30 villes × top 5 services.

### 14. Étoffer fiches lexique (150 → 400-500 mots, cible 134-167 mots citables)
**Action** : pour chaque terme : définition courte (134-167 mots — plage optimale citation IA), contexte d'utilisation, exemple chantier, références normatives, lien vers service associé.
**Impact** : sécurise les 13 pages contre risque thin content + augmente citabilité IA.
**Effort** : 1 h × 13 = 13 h.

### 15. Page "Comment nous vérifions nos cordistes"
**Action** : page `/verification-pros` détaillant le workflow (CQP/IRATA, RC Pro, documents administratifs, contrôles périodiques). Backlink interne depuis pages ville et homepage.
**Impact** : signal Trustworthiness fort pour marketplace B2B.
**Effort** : 2-3 h.

### 16. Reformuler H2 homepage en questions + réponses 40-60 mots SSR
**Action** : remplacer "Cordistes et travaux en hauteur : Tout ce que vous devez savoir" par 3-4 H2 interrogatifs : "Quel est le prix d'un cordiste en France ?", "Quelles certifications exiger d'un cordiste qualifié ?", "En combien de temps recevoir des devis ?". Réponse directe 40-60 mots sous chaque H2, **rendue en HTML pas en JS**.
**Impact** : citabilité IA (passages extractibles) + densité éditoriale homepage.
**Effort** : 2 h.

### 17. Schemas manquants (ContactPoint, SearchAction, DefinedTerm)
**Actions** :
- Ajouter `contactPoint` au schema Organization (telephone, contactType, areaServed FR, availableLanguage French)
- Ajouter `SearchAction` au schema WebSite (Sitelinks Searchbox)
- Ajouter `DefinedTerm` sur chaque page `/lexique/[slug]` avec `inDefinedTermSet` et `termCode`
- Ajouter `mainEntityOfPage` + `@id` au FAQPage city × service
- Ajouter `description` + `category` au Service sur pages city
**Effort** : 2-3 h cumulé.

### 18. Citations FR Tier 1 (Yelp, Kompass, Habitissimo, Societe.com)
**Action** : créer/revendiquer les fiches sur Yelp.fr, Kompass.com, Habitissimo.fr, Societe.com, FNTP.fr. NAP strictement identique au schema.
**Impact** : autorité locale + signal d'autorité IA (3 des 5 facteurs AI visibility sont citation-related selon Whitespark 2026).
**Effort** : 1 h × 5 fiches.

### 19. Signaux BTP manquants
**Action** : sur homepage et pages ville, ajouter mentions OPPBTP, SFETH, art. R.4323-58 du Code du travail. Afficher SIRET sur mentions légales. Logo + nom d'assureur RC Pro.
**Effort** : 1-2 h.

### 20. Programme de collecte d'avis Google + Trustpilot
**Action** : email post-mission automatique (template `send-email`) demandant un avis Google ou Trustpilot. Cible : 1 nouvel avis tous les 18 jours minimum (règle Sterling Sky pour éviter le "cliff" GBP).
**Effort** : 2-3 h (template + trigger SQL).

---

## BASSE — backlog

### 21. CSP en mode enforce
Après 4 semaines stables sans violations majeures en GSC. Modifier le header dans `next.config.ts` ou `vercel.json`.

### 22. Présence YouTube + Reddit (signal d'autorité IA)
Chaîne YouTube avec 3-5 vidéos courtes (CQP, démo devis, témoignage cordiste). Réponses Reddit pertinentes sur r/bricolage, r/travaux, r/artisans.

### 23. Calculateur coût indicatif (outil interactif)
Façade X m² à Paris = Y €. Outil interactif + texte autour = signal E-E-A-T expérientiel.

### 24. Comparateur certifications CQP vs IRATA
Tableau structuré, citabilité IA maximale, contenu réutilisé dans lexique et pages service.

### 25. Vérifier `/lexique/[slug]` (13 pages individuelles)
Pas auditées dans cette passe. Extraire le HTML d'une fiche, vérifier schema `DefinedTerm`, profondeur de contenu, internal linking.

---

## Roadmap synthétique

| Sprint | Durée | Focus | Score visé |
|---|---|---|---|
| **S1 (sem 1)** | 1 sem | Critiques 1-5 (sitemap, LCP, TBT jobs, schema Offer, page À propos) | 67 → 73 |
| **S2 (sem 2-4)** | 3 sem | Hautes 6-12 (auteur blog, NAP, AggregateRating, liens internes, llms.txt, TBT desktop) | 73 → 78 |
| **S3 (mois 2-3)** | 8 sem | Moyennes 13-20 (contexte ville×service ×30, lexique ×13, page vérification, H2, schemas, citations FR, BTP, avis) | 78 → 82 |
| **Backlog** | continu | CSP enforce, YouTube/Reddit, calculateur, comparateur CQP/IRATA | 82 → 86+ |

---

## Suivi

- Re-run `/seo-audit` dans 4 semaines pour mesurer l'effet S1 + début S2
- Surveiller GSC : Couverture (pages indexées), Core Web Vitals (CrUX), Performance (clics, impressions)
- Surveiller Trustpilot : nombre d'avis publiés
- Vérifier mensuellement le drift sitemap (régression possible si nouveau code touche `app/sitemap.ts`)
