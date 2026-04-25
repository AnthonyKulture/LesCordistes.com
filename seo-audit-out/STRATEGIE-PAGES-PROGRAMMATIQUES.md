# Stratégie pages programmatiques city × service

**Contexte** : 1 380 pages city × service indexées · 44 (3,2 %) ont du contenu unique · 1 336 (96,8 %) servent un fallback générique. Risque doorway = critique.

---

## 3 options stratégiques

| Critère | A. Réduction agressive | B. Enrichissement total | **C. Hybride (recommandé)** |
|---|---|---|---|
| **Pages city×service finales** | ~30 (10 villes × 3 services prioritaires) | 1 380 | ~240 (top-20 villes × top-12 services) |
| **Pages désindexées** | 1 350 (→ 410 redirect vers /cordiste-[ville]) | 0 | 1 140 |
| **Effort rédactionnel** | ~30 contextes uniques à compléter (déjà 44 → on en a assez) | ~1 336 contextes à rédiger (≈300 jours-rédaction) | ~196 contextes à rédiger (≈40 jours-rédaction) |
| **Risque Core Update** | 🟢 Quasi nul | 🔴 Reste élevé pendant 12+ mois (rédaction longue) | 🟢 Faible dès la phase 1 livrée |
| **Couverture longue traîne** | 🔴 Sacrifice 99 % du potentiel SEO local | 🟢 Maximale | 🟡 ~70 % du potentiel (top combos couverts) |
| **Time-to-safety** | 1 semaine | 9-12 mois | 4-6 semaines |
| **Coût** | Faible (dev only) | Élevé (rédacteur SEO + dev) | Modéré (rédacteur sur priorisation) |

---

## Option C détaillée — la voie pragmatique

### Top-20 villes (par population × densité concurrentielle cordistes)

Paris · Marseille · Lyon · Toulouse · Nice · Nantes · Montpellier · Strasbourg · Bordeaux · Lille · Rennes · Reims · Saint-Étienne · Toulon · Le Havre · Grenoble · Dijon · Angers · Clermont-Ferrand · Brest

→ Couvre 80 % du PIB urbain français + zones à forte demande cordistes (Paris haussmannien, Marseille embruns, Lyon tertiaire, Bordeaux UNESCO, etc.)

### Top-12 services (intent commercial × volume search)

| # | Service | Cluster | Justification |
|---|---|---|---|
| 1 | nettoyage-facade | urbain | Volume +++ |
| 2 | lavage-vitres | urbain | Volume +++, intent récurrent |
| 3 | ravalement-facade | urbain | Volume ++, panier élevé |
| 4 | toiture-zinguerie | urbain | Volume ++ |
| 5 | nettoyage-toiture | grand_public | Demande B2C forte |
| 6 | securisation-anti-pigeons | urbain | Pic recherche printemps |
| 7 | isolation-exterieure | urbain | MaPrimeRénov' driver |
| 8 | maintenance-eolienne | industriel | Faible volume mais panier élevé B2B |
| 9 | cnd-controle-non-destructif | industriel | B2B premium |
| 10 | confortement-falaises | genie_civil | Niche mais peu de concurrence |
| 11 | silos-cheminees | industriel | B2B |
| 12 | pose-enseignes-hauteur | urbain | Panier moyen, demande continue |

### Phasage proposé

| Phase | Durée | Livrable |
|---|---|---|
| **P0** | 1 semaine | Désindexer (410 + sitemap) les 1 140 pages hors top-20×top-12 |
| **P1** | 2 semaines | Rédiger 100 contextes uniques pour les couples top-10 villes × top-10 services manquants |
| **P2** | 4 semaines | Compléter les 96 contextes restants (villes 11-20 × services 11-12) |
| **P3** | continu | Page régionale fallback (`/cordiste-region-[slug]`) pour les 40 villes secondaires |

### Pages préservées en P0

- 60 city pages `/cordiste-[ville]` (déjà éditorialisées via `getEditorialContent`)
- 240 city×service top-20 × top-12
- + 1 page régionale par région française (~13 pages)
- = **~313 pages indexables** (vs 1 473 actuellement)

---

## Mécanisme technique de désindexation

Trois leviers en parallèle (pour un effet rapide) :

1. **`generateStaticParams`** : retirer les couples hors-périmètre (les pages ne sont plus générées en build → 404 statique)
2. **`robots.txt` Disallow** par pattern (insuffisant seul, mais bloque le re-crawl)
3. **Sitemap** : retirer les URLs concernées + soumettre nouveau sitemap dans GSC

Optionnel : redirect 301 `/cordiste-[ville]/[service]` → `/cordiste-[ville]#service-[slug]` pour préserver le link equity et l'historique des liens entrants.

---

## Décision attendue

**Question pour l'arbitrage** :
- Option A (réduction agressive 30 pages) : valide si tu privilégies vitesse + sécurité, et tu peux perdre la longue traîne
- Option C (hybride 240 pages) : valide si tu peux investir 40-50 jours de rédaction sur 6 semaines
- Option B : à éviter — l'horizon de rédaction (~9 mois) dépasse le risque Core Update

→ Si tu valides l'option C, je peux :
1. Implémenter P0 (désindexation top-périmètre) cette session
2. Préparer un plan de rédaction structuré pour les 196 contextes restants (template + ordre de priorité par volume)
