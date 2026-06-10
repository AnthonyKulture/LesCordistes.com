# Plan de rédaction — contextes uniques `SERVICE_CITY_CONTEXT`

**Objectif stratégique** : passer de **133 → ~400-450 pages indexables** city × service (pas 1 380, ce serait du gaspillage SEO).
**Levier** : chaque entry rédigée dans `SERVICE_CITY_CONTEXT` (`src/constants/seoData.ts`) bascule automatiquement la page en `index, follow` au build suivant. Aucun changement de code requis.
**Méthodologie** : E-E-A-T appliqué à chaque texte, recherche keywords pré-rédaction, qualité avant quantité.

---

## Inventaire de départ

| Catégorie | Nombre |
|---|---|
| Total cellules possibles (60 villes × 23 services) | 1 380 |
| Cellules avec contexte unique rédigé (= indexables) | **133** |
| Cellules en `noindex` (pages générées mais pas exposées) | 1 247 |
| **Cible finale visée** | **~400-450 indexables** |
| **Contextes à rédiger sur 4 phases** | **~280-320** |
| Pages laissées définitivement en `noindex` | ~930 (faible volume / non-pertinent) |

---

## Cahier des charges qualité (E-E-A-T)

Tout contexte ajouté doit respecter ces 7 critères.

### 1. Structure obligatoire

```ts
'<service-slug>': {
  '<city-slug>': {
    intro: "100-180 mots — voir règles ci-dessous",
    useCases: ["Cas 1 (15-25 mots)", "Cas 2 (15-25 mots)", "Cas 3 (15-25 mots)"]
  },
  // ...
}
```

### 2. Règles intro (100-180 mots, viser 120-150)

L'intro doit contenir **au moins 3 specifics ancrés** dans la ville :

| Type de specific | Exemples |
|---|---|
| **Quartier ou zone nommée** | Vieux-Lille, Île de Nantes, Capucins (Brest), Antigone (Montpellier), Mourillon (Toulon) |
| **Matériau ou type de bâti** | Brique foraine (Toulouse), tuffeau ligérien (Nantes/Angers), basalte de Volvic (Clermont), pierre de Jaumont (Metz), granit gris-bleu (Brest) |
| **Réglementation ou contrainte locale** | ABF, UNESCO, MaPrimeRénov' Copropriété, secteur sauvegardé, RLP, plan colorimétrie, normes ATEX (industriel) |
| **Climat ou contrainte technique locale** | Mistral, embruns Atlantique/Méditerranée, gel-dégel alpin, brouillard de cuvette grenoblois |
| **Économie ou tissu industriel local** | Vallée de la chimie de Lyon, port pétrolier Le Havre, manufactures stéphanoises, sucreries Champagne |

### 3. Mots-clés (sans keyword stuffing)

- **Mot-clé primaire** : `{service} {ville}` ou `{cordiste} {ville}` en tête d'intro (densité ~1%)
- **Variantes longue-traîne** : intégrer naturellement 1-2 variantes ("devis", "entreprise", "tarif", "professionnel certifié")
- **Sémantique LSI** : matériaux, techniques, certifications, normes (= niveau métier)

### 4. Règles useCases (3 cas obligatoires)

Chaque useCase doit avoir cette structure :

```
[Type de bâti spécifique] [zone/quartier] ([technique précise + contrainte])
```

Exemples :
- ✅ "Hôtel particulier en tuffeau quartier Graslin (nettoyage doux pH neutre + biocide)"
- ✅ "Tour de bureaux La Défense (façade rideau 30+ étages)"
- ❌ "Immeuble résidentiel" (générique, swap test échoue)
- ❌ "Bâtiment de bureaux centre-ville" (idem)

### 5. Tone & lexique

- Ton expert mais accessible (B2B + B2C compris)
- Vocabulaire métier précis : noms de matériaux, certifications (CQP, IRATA, GWO, COFREND, ATEX, RC Pro), techniques (CND, UT/VT, micro-gommage, biocide, hydrofuge, chaux aérienne, etc.)
- Aucune hyperbole non vérifiable ("leader incontesté", "n°1 mondial")
- Données chiffrées vérifiables uniquement (ex : "≈250 j/an avec précipitations à Rennes" est vérifiable, "le meilleur cordiste" ne l'est pas)

### 6. Anti-doorway swap test

**Avant validation, faire le test** : remplacer mentalement le nom de la ville par une autre. Si le sens reste cohérent → ÉCHEC, le texte est doorway. Doit être **impossible** de transposer.

### 7. Anti-duplication interne

Avec 60 villes, certains matériaux/architectures se répètent (ex : tuffeau ligérien sur Nantes, Angers, Tours, Orléans). Pour éviter le near-duplicate :
- Varier l'angle d'attaque (pour Nantes : Île de Nantes contemporain ; pour Angers : Cointreau + château ; pour Tours : vallée de la Loire ; pour Orléans : centre piéton)
- Varier les useCases (différents quartiers, différents types de bâti)
- Vérifier la similarité entre 2 textes proches (utiliser un diff lexical si besoin)

---

## Phasing — 4 phases sur 4-6 mois

### Phase 1 — Saturation Tier 1 (top-20 villes × top-12 services)

**Cible** : compléter le **cœur business** = couples ayant le plus fort volume de recherche × plus fort intent commercial.

| Service | Cluster | Villes top-20 manquantes (post-batch d'hier) |
|---|---|---|
| nettoyage-facade | urbain | ✅ 20/20 (100%) |
| lavage-vitres | urbain | ✅ 20/20 (100%) |
| ravalement-facade | urbain | ✅ 20/20 (100%) |
| maintenance-eolienne | industriel | ✅ 20/20 (100%) |
| silos-cheminees | industriel | ✅ 20/20 (100%) |
| pose-enseignes-hauteur | urbain | ✅ 20/20 (100%) |
| **toiture-zinguerie** | urbain | 🔴 0/20 → **20 à rédiger** |
| **nettoyage-toiture** | grand_public | 🔴 1/20 → **19 à rédiger** |
| **securisation-anti-pigeons** | urbain | 🔴 1/20 → **19 à rédiger** |
| **isolation-exterieure** | grand_public | 🔴 1/20 → **19 à rédiger** |
| **cnd-controle-non-destructif** | industriel | 🔴 1/20 → **19 à rédiger** |
| **confortement-falaises** | genie_civil | 🔴 1/20 → **19 à rédiger** |

**Total Phase 1** : **115 contextes à rédiger**
**Délivrable** : **240 pages indexables au total** (133 actuelles + 107 nettes nouvelles, en comptant que certaines villes hors top-20 ont déjà été couvertes mais ne sont pas dans ce périmètre)
**Durée estimée** : **6-8 semaines** (15 contextes/semaine en moyenne)
**Effort** : ~30-40h total

### Phase 2 — Extension villes Tier 2 (villes top-21 à top-40 × top-8 services urbains B2C/B2C-mixte)

**Cible** : capter la demande dans les villes secondaires sur les services à plus haut volume.

**Villes Tier 2 (20 villes)** :
rouen, metz, nancy, orleans, tours, aix-en-provence, perpignan, besancon, pau, cannes, avignon, poitiers, la-rochelle, dunkerque, lorient, annecy, nimes, bayonne, saint-nazaire, mulhouse

**Services Tier 1 urbains (8 services à plus fort volume)** :
nettoyage-facade, lavage-vitres, ravalement-facade, toiture-zinguerie, nettoyage-toiture, securisation-anti-pigeons, isolation-exterieure, pose-enseignes-hauteur

**Cellules cibles** : 20 × 8 = **160 cellules**
**Déjà couvertes** : ~10 (nancy/toiture-zinguerie, orleans/ravalement, metz/lavage-vitres + pose-enseignes-hauteur, etc.)
**À rédiger** : **~150 contextes**
**Délivrable** : **+150 pages indexables** → total ~390
**Durée** : 8-10 semaines
**Effort** : ~50h total

### Phase 3 — Niches B2B sur villes industrielles ciblées

**Cible** : capter la demande B2B niche (CND, éolien, calorifugeage, pylônes télécom) sur les **villes industrielles** où ces services ont du sens.

**Villes industrielles cibles** (10) :
saint-etienne, le-havre, dunkerque, calais, valenciennes, mulhouse, brest, lorient, saint-nazaire, fos-sur-mer (+ ajouter Fos si pertinent au PRIORITY_CITIES — sinon utiliser Marseille pour ce périmètre)

**Services niche B2B** (5) :
- peinture-industrielle (industriel)
- calorifugeage-isolation-tuyauteries (industriel)
- pylones-telecom (industriel)
- inspection-ouvrages (genie_civil)
- travaux-barrages-hydrauliques (genie_civil)

**Cellules cibles** : 10 × 5 = **50 cellules**
**Déjà couvertes** : ~0
**À rédiger** : **~50 contextes**
**Délivrable** : **+50 pages indexables** → total ~440
**Durée** : 4 semaines
**Effort** : ~17h total

### Phase 4 — Long tail conditional (post-GSC analyse)

**Cible** : compléter **uniquement les cellules avec demande prouvée** (impressions GSC ou volume DataForSEO ≥ 30/mois).

**Process** :
1. Attendre 60-90 jours après Phase 1 livraison
2. Extraire les requêtes GSC (`/seo google gsc`) sur les pages déjà indexables : voir quelles requêtes longue-traîne génèrent des impressions
3. Identifier les couples (service, ville) qui apparaissent en search mais n'ont pas encore de page indexable
4. Cross-checker avec DataForSEO pour confirmer le volume

**Délivrable estimé** : **+15-30 pages** selon trouvailles → total ~450-470
**Durée** : continu / opportuniste sur 6-12 mois
**Effort** : 5-15h total

---

## Process de rédaction par batch

### Workflow standard (1 batch = 10-15 contextes)

| Étape | Action | Outils | Durée |
|---|---|---|---|
| 1 | Choisir les cellules du batch | `SERVICE_CITY_CONTEXT` audit | 5 min |
| 2 | Recherche keywords sur 3-5 couples du batch | DataForSEO MCP, Google Keyword Planner | 30 min |
| 3 | Recherche locale (architecture, climat, économie) | Wikipedia, INSEE, Météo France, GoogleMaps | 1-2h pour le batch |
| 4 | Rédaction batch (10-15 contextes) | Inline dans `seoData.ts` | 3-5h |
| 5 | Review qualité (swap test, lecture humaine) | Manuel | 30 min |
| 6 | Commit + push | git | 5 min |
| 7 | Vérif live `<meta robots>` post-deploy | curl | 5 min |

**Total par batch** : 5-8h, livre 10-15 nouvelles pages indexables.

### Cadence recommandée

- **Phase 1** : 1 batch / semaine pendant 8-10 semaines = 80-150 contextes
- **Phase 2** : 1 batch / semaine pendant 10 semaines
- **Phase 3** : 1 batch / 2 semaines pendant 8 semaines
- **Phase 4** : 1 batch ad-hoc / mois selon GSC

---

## Recherche keywords — méthodologie pré-rédaction

Avant chaque batch, valider que les couples ciblés ont du volume :

```bash
# Via DataForSEO MCP (si dispo) :
/seo google volume "nettoyage façade Toulouse, ravalement façade Lyon, ..."

# Via Google Keyword Planner manuel (https://ads.google.com/aw/keywordplanner) :
# 1. Filtrer France
# 2. Seed = service + ville (ex "nettoyage façade Toulouse")
# 3. Récupérer volume mensuel + concurrence + variantes longue-traîne
```

**Seuil de décision** :
- Volume mensuel ≥ 50 → priorité haute (Phase 1 ou 2)
- Volume 10-50 → priorité moyenne (Phase 3 ou 4)
- Volume < 10 → priorité basse (probablement à laisser en noindex)

---

## Templates par cluster de service

Pour accélérer la rédaction et garantir la cohérence, voici un template par cluster :

### Cluster `urbain` (services facade/vitres/toiture/anti-pigeons)

```
À [VILLE], [le service] sur [type de bâti caractéristique local] présente des
spécificités liées à [matériau ou contrainte architecturale]. [Quartier ou zone
nommée] concentre [particularité technique], tandis que [autre quartier]
présente [autre type de bâti]. [Réglementation locale ABF/UNESCO/RLP] impose
[contrainte technique]. [Climat ou pollution locale] exige [adaptation
technique].

useCases:
- [Type bâti 1] [quartier 1] ([technique 1 + contrainte])
- [Type bâti 2] [quartier 2] ([technique 2 + contrainte])
- [Type bâti 3] [quartier 3] ([technique 3 + contrainte])
```

### Cluster `industriel` (CND, éolien, silos, calorifugeage)

```
[Le tissu industriel de VILLE/RÉGION] concentre [sites SEVESO/usines/
infrastructures]. [Site principal] et [autre site] exploitent
[équipements/structures] qui exigent [type d'intervention]. Nos cordistes
[VILLE-adjective] certifiés [ATEX/COFREND/CND/GWO selon service] interviennent
[en arrêt planifié / en milieu confiné / en altitude] avec [protocole
spécifique]. [Climat ou contrainte locale] impose [adaptation].

useCases:
- [Type structure industrielle 1] [zone industrielle nommée] ([technique CND/maintenance])
- [Type structure 2] [autre zone] ([technique + certification])
- [Type structure 3] [3e zone] ([technique + contrainte])
```

### Cluster `grand_public` (ravalement, isolation, nettoyage toiture)

```
À [VILLE], [le service] concerne principalement [type de bâti dominant local]
et bénéficie [aide locale ou nationale type MaPrimeRénov']. Les copropriétés
de [quartier nommé] sont [particularité énergétique]. [Spécificité technique
liée au climat/matériau local] exige [adaptation]. Nos cordistes [VILLE-
adjective] interviennent sans échafaudage dans [contrainte d'accès locale].

useCases:
- [Maison/immeuble type 1] [quartier 1] ([technique + aide financière])
- [Maison/immeuble type 2] [quartier 2] ([technique + matériau])
- [Maison/immeuble type 3] [quartier 3] ([technique + contrainte locale])
```

### Cluster `genie_civil` (falaises, ouvrages d'art, barrages)

```
[VILLE/RÉGION] est traversée par [formation géologique/cours d'eau/réseau
ouvrages d'art]. [Site/voie/ouvrage spécifique] présente [problématique
géotechnique]. Nos cordistes [VILLE-adjective], formés [aux techniques
de purge/clouage/géotextile/inspection IQOA], interviennent pour [collectivités
locales nommées / gestionnaires d'infrastructure]. [Climat ou risque local]
exige [intervention récurrente type].

useCases:
- [Type ouvrage/falaise 1] [voie/site nommé] ([technique + risque])
- [Type ouvrage 2] [autre site] ([technique + gestionnaire])
- [Type ouvrage 3] [3e site] ([technique + contrainte saisonnière])
```

---

## Métriques de suivi

### Indicateurs de progression (mis à jour à chaque batch)

| Indicateur | Baseline (avril 2026) | Cible Phase 1 | Cible Phase 2 | Cible Phase 3 | Cible finale |
|---|---|---|---|---|---|
| Pages indexables city × service | 133 | 240 | 390 | 440 | 450-470 |
| % couverture top-20 × top-12 | 47% | 100% | 100% | 100% | 100% |
| Mots uniques rédigés cumulés | ~22 000 | ~37 000 | ~58 000 | ~65 000 | ~70 000 |

### Indicateurs d'impact SEO (mesurer 60-90 jours après chaque phase)

| Métrique | Source | Fréquence de check |
|---|---|---|
| Pages indexées par Google | GSC > Pages | Mensuel |
| Impressions cumulées pages programmatiques | GSC > Performance > Pages | Mensuel |
| Clics cumulés pages programmatiques | GSC > Performance > Pages | Mensuel |
| Position moyenne sur requêtes city × service | GSC > Performance > Requêtes | Mensuel |
| Conversions générées (post-job + inscription pro) | Plausible/GA4 + Supabase | Mensuel |

### Indicateurs de qualité éditoriale (par batch)

- Taux de réussite swap test : 100% obligatoire
- Vérification orthographe/grammaire : 100% obligatoire (LanguageTool ou Antidote)
- Vérification doublons sémantiques internes : ≥ 80% différenciation lexicale (mesurable par diff)

---

## Risques & mitigations

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Fatigue rédactionnelle (300+ textes c'est long) | Élevée | Élevé | Batchs courts (10-15), variation services × villes par batch |
| Duplication interne sémantique (Tuffeau Nantes/Angers/Tours/Orléans) | Moyenne | Moyen | Varier angles d'attaque (économie/quartier/réglementation) |
| Hallucination factuelle | Moyenne | Moyen | Recherche systématique avant rédaction, sources Wikipedia/INSEE |
| Cannibalization SEO (city pure vs city × service) | Faible | Moyen | Différenciation stricte content angle (city = vue d'ensemble, city×service = expertise pointue) |
| Volume de recherche surestimé sur certains couples | Élevée | Faible (page reste utile) | Recherche keywords pré-rédaction par batch (DataForSEO ou GSC après Phase 1) |
| Impact SEO décevant (pages indexées mais pas de trafic) | Moyenne | Élevé | Ne pas viser 1 380 pages, s'arrêter à ~450 et concentrer l'autorité |

---

## Décision matrix — quels couples ne JAMAIS rédiger ?

Certaines combinaisons n'ont aucun sens métier ou aucun volume :

❌ **Ne pas rédiger** :
- `maintenance-eolienne × Cannes / Nice / Avignon` (peu d'éolien à proximité)
- `confortement-falaises × Lille / Reims / Dijon` (pas de falaises)
- `silos-cheminees × Cannes / Monaco` (pas d'industrie)
- `travaux-barrages-hydrauliques × Calais / Le Havre` (pas de barrages)
- `pylones-telecom × villes < 50k habitants` sans tour majeure

✅ **Toujours pertinent** :
- 4 services urbains de base (nettoyage-facade, lavage-vitres, ravalement-facade, toiture-zinguerie) × toutes les villes top-40

---

## Première action recommandée

Quand tu seras prêt à démarrer Phase 1 (objectif : 115 nouveaux contextes en 6-8 semaines) :

1. **Premier batch suggéré** : `toiture-zinguerie × top-15 villes top-20` (15 contextes)
   - Service à fort volume, pas encore couvert
   - Variations naturelles : ardoise (Bretagne, Champagne), zinc (Paris, Reims), tuile (Méditerranée), tuile vernissée (Bourgogne)
   - Matériaux locaux distincts → faible risque de duplication

2. **Deuxième batch** : `nettoyage-toiture × top-15 villes top-20` (15 contextes)
3. **Troisième batch** : `securisation-anti-pigeons × top-15 villes top-20` (15 contextes)

À chaque batch : commit séparé, push, vérification GSC à J+30.

---

## Estimation totale du programme

- **Effort total** : ~110-150h sur 4-6 mois
- **Délivrable** : ~280-320 nouveaux contextes city × service uniques rédigés selon E-E-A-T
- **Pages indexables au final** : 400-470 (vs 133 aujourd'hui)
- **Mots uniques rédigés** : ~50 000 mots cumulés
- **Pages laissées définitivement en `noindex`** : ~900 (assumé, faible volume / non-pertinent)

---

## Annexe — checklist par contexte rédigé

À utiliser comme grille de validation rapide avant commit.

```
[ ] Intro 100-180 mots
[ ] Mention 1 : quartier ou zone nommée
[ ] Mention 2 : matériau ou type de bâti caractéristique
[ ] Mention 3 : réglementation/climat/économie locale
[ ] Mot-clé primaire {service} {ville} en tête (densité ~1%)
[ ] 3 useCases avec quartier/bâti spécifique nommés
[ ] Aucune phrase générique (swap test passé)
[ ] Aucune hyperbole non vérifiable
[ ] Aucune hallucination factuelle (sources vérifiées)
[ ] Différenciation sémantique vs villes voisines au matériau commun
[ ] Orthographe/grammaire validée
```
