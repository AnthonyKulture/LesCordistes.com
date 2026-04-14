# .mulch/

Mémoire opérationnelle de [LesCordistes.com](https://lescordistes.com) gérée par [Mulch](https://github.com/jayminwest/mulch).

## Domaines

- `nextjs` — gotchas Next.js 15 spécifiques à ce repo (Turbopack, Suspense, Stripe)
- `supabase` — patterns Supabase (split client/serveur, RLS)
- `seo` — architecture SSG et contraintes SEO

## Commandes rapides

```bash
ml prime                          # charger toute la mémoire en contexte
ml prime --domain nextjs          # domaine ciblé
ml query nextjs "turbopack"       # recherche dans un domaine
ml record nextjs --type failure --description "..." # enregistrer
ml status                         # santé des domaines
```

## Prérequis

Mulch requiert [Bun](https://bun.sh) :
```bash
curl -fsSL https://bun.sh/install | bash
```
Puis utiliser le wrapper : `bash scripts/ml <commande>`
