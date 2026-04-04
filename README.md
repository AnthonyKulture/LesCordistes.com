# LesCordistes.com

Marketplace connectant clients et cordistes (techniciens travaux en hauteur).
Stack : **Next.js 15 App Router · TypeScript · Supabase · Stripe · Tailwind CSS**

---

## Tech Stack

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 15 (App Router) + React 19 |
| Styling | Tailwind CSS (`#243355` Brand Blue / `#5B8DDB`) |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Auth SSR | `@supabase/ssr` |
| State | TanStack Query v5 |
| Paiement | Stripe Checkout + Webhooks |
| Email | Resend (via Supabase Edge Functions) |
| Déploiement | Vercel |

---

## Démarrage

### Prérequis

1. Créer un projet Supabase sur [supabase.com](https://supabase.com)
2. Créer `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_pk
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token
STRIPE_SECRET_KEY=your_stripe_sk
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

### Installation

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # Build production (286 pages SSG/SSR)
```

---

## Structure

```
src/
├── app/               # Pages Next.js App Router
│   ├── (seo)/         # 258 pages SEO statiques (SSG)
│   ├── (protected)/   # Routes auth-requises
│   └── api/           # Route Handlers (Stripe)
├── components/        # Composants UI réutilisables
├── views/             # Vues complètes ('use client')
├── contexts/          # AuthContext, DashboardContext
├── lib/               # Clients Supabase (browser/server/legacy)
└── constants/         # Données SEO (villes, services, lexique)
```

---

## Fonctionnalités

### Pour les Clients
- Dépôt de mission via wizard 5 étapes (sans inscription requise)
- Validation par email + modération admin

### Pour les Pros (Cordistes)
- Browse missions gratuit (titre, ville, description)
- **Système Crédits** : 1 crédit = accès coordonnées complètes
- Packs : Starter 5cr/50€ · Pro 10cr/90€ · Business 20cr/160€

### SEO Programmatique
- 23 pages villes (`/cordiste-[ville]`)
- 230 pages ville×service (`/cordiste-[ville]/[service]`)
- 5 articles lexique (`/lexique/[slug]`)
- JSON-LD schemas, 301 redirects depuis l'ancien WordPress

### Admin
- Modération annonces (`pending` → `live` / `rejected`)
- Gestion utilisateurs

---

## Créer un admin

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'votre@email.com';
```

---

## RLS Supabase

- `client_contact_info` : inaccessible sans lead débloqué au niveau SQL
- Middleware Next.js : refresh JWT Supabase sur chaque requête

---

*Dernière mise à jour : 3 Avril 2026*
