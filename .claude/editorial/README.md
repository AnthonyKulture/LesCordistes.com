# Système éditorial du blog

Trois fichiers + un script. Les deux agents (`blog-redacteur`, `blog-redacteur-pros`) s'y plient.

| Fichier | Rôle |
|---|---|
| `taxonomy.json` | Matrice éditoriale : 18 clusters × 12 personas × 8 formats + étiquetage de chaque article publié |
| `faits-verifies.md` | Source unique des chiffres (formation, salaires, TJM, marché). Corrige les erreurs des anciens articles |
| `scripts/blog-audit.mjs` | Calcule la couverture et **impose** le prochain brief (cluster en déficit + persona + format non répétés) |

## Pourquoi

Les 20 premiers articles : 18 « guides » identiques dans la forme, 6 clones « trouver-cordiste-[ville] », 4 articles statut/tarif/assurance quasi jumeaux, et des chiffres de formation faux (CQP1 annoncé 3 500 € / 3 semaines, réel 5 000-8 000 € / 10 semaines). Cause : chaque agent suivait une liste figée de 7-10 angles, sans recherche externe, sans mémoire de ce qui venait d'être publié.

## Comment ça tourne

```bash
node scripts/blog-audit.mjs pro      # brief côté cordistes
node scripts/blog-audit.mjs client   # brief côté clients
node scripts/blog-audit.mjs --json   # sortie machine
```

Règles appliquées par le script :
- **Fenêtre d'exclusion 4** : un cluster, persona ou format des 4 derniers articles est interdit.
- **Clusters gelés** : toute note contenant `GEL` ou `SATUR` dans `taxonomy.json` (`client-geo-ville`, `pro-gestion-business`).
- **Priorité aux clusters vierges**, puis aux moins servis.
- **Format « guide » jamais proposé** tant qu'un autre format est disponible.

Après chaque publication, l'agent **doit** ajouter l'article dans `taxonomy.json` → `articles`. Sans ça, la rotation ne sait pas ce qui vient de sortir.

## Faire évoluer

- **Dégeler un cluster** : retirer `GEL`/`SATUR` de sa `note`.
- **Ajouter un cluster / persona / format** : l'ajouter dans `taxonomy.json`, il est pris en compte au prochain audit.
- **Nouveau chiffre** : `WebSearch`, vérifier, l'inscrire dans `faits-verifies.md` avec la date. Jamais de chiffre « de mémoire » dans un article.
- **Changer la fenêtre** : `RECENT_WINDOW` dans le script.
