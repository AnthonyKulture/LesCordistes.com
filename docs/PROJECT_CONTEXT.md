# LesCordistes.com - Project Context & Architecture

Ce document sert de référence pour les agents IA travaillant sur le projet **LesCordistes.com**. Il résume l'architecture technique, les règles métier et la structure du code pour minimiser la consommation de tokens et faciliter la compréhension immédiate du projet.

---

## 🏗️ Architecture Technique

- **Framework** : Next.js 15 (App Router) + React 19 + TypeScript
- **Styling** : Tailwind CSS — couleurs : `#243355` (Brand Blue), `#5B8DDB` (Brand Blue Light)
- **Backend/BaaS** : Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Auth SSR** : `@supabase/ssr` — `createBrowserClient` (client) / `createServerClient` (server)
- **State Management** : TanStack Query (React Query) v5
- **Icônes** : Lucide React
- **Paiement** : Stripe Checkout + Webhooks (Route Handlers)
- **Email** : Resend (Edge Functions Supabase)
- **Déploiement** : Vercel

---

## 📂 Structure du Code

```
src/
├── app/                        # Next.js App Router (pages et routes)
│   ├── layout.tsx              # Root layout (Providers, Header, Footer)
│   ├── page.tsx                # Landing SSR avec JSON-LD
│   ├── (seo)/                  # Pages SEO — SSG generateStaticParams
│   │   ├── [cityPage]/         # 23 pages ville (cordiste-paris, etc.)
│   │   │   └── [service]/      # 230 pages ville×service
│   │   └── lexique/            # Hub glossaire + 5 articles
│   ├── (protected)/            # Routes nécessitant authentification
│   │   ├── layout.tsx          # Auth guard client-side
│   │   ├── dashboard/          # Tableaux de bord Pro/Client
│   │   ├── credits/            # Achat crédits
│   │   ├── messages/           # Messagerie
│   │   ├── notifications/
│   │   ├── payment-success/
│   │   ├── profile/
│   │   └── pro/widget/
│   ├── api/
│   │   ├── create-checkout/route.ts   # Stripe Checkout Session
│   │   └── webhook/route.ts           # Stripe Webhook (raw body req.text())
│   ├── jobs/[slug]/            # Détail mission (dynamique)
│   ├── pros/[id]/              # Profil public pro (dynamique)
│   └── not-found.tsx
├── components/
│   ├── ui/                     # Button, Input, Toast...
│   ├── layout/                 # Header ('use client'), Footer, AuthLayout
│   ├── wizard/                 # Steps 1-5 du formulaire mission
│   ├── seo/                    # TrustBadges, SEOInternalLinks, SEOLocalReviews
│   └── Providers.tsx           # 'use client' — QueryClient, Auth, Toast, Dashboard
├── contexts/
│   ├── AuthContext.tsx         # 'use client' — createBrowserClient
│   └── DashboardContext.tsx    # 'use client' — localStorage avec guard SSR
├── lib/
│   ├── supabase-browser.ts     # createBrowserClient (@supabase/ssr)
│   ├── supabase-server.ts      # createServerClient par requête
│   └── supabase.ts             # Legacy singleton (storage SSR-safe)
├── views/                      # Composants page (tous 'use client')
├── constants/                  # seoData, seoGlossary, seoUniqueContent
└── types/                      # TypeScript + database.types.ts
```

---

## 🔑 Règles critiques Next.js App Router

- **Clients Supabase** : `supabase-browser.ts` pour client, `supabase-server.ts` (new per request) pour server
- **`'use client'`** : obligatoire sur tout composant avec hooks/state/window/localStorage
- **`useSearchParams()`** : toujours wrappé dans `<Suspense>` dans le page.tsx parent
- **`localStorage`** : toujours gardé par `typeof window !== 'undefined'`
- **Stripe webhook** : `req.text()` pour le raw body (pas de bodyParser:false)
- **Middleware** : `supabase.auth.getUser()` obligatoire sur chaque requête (refresh JWT)

---

## 💼 Business Logic & Rôles

**LesCordistes.com** est une marketplace fonctionnant via un système de **crédits**.

### Rôles
1. **Client** : Poste des missions via wizard 5 étapes. Peut poster sans inscription.
2. **Pro** : Browse missions gratuit · Déblocage lead = **1 crédit** · Packs : 5cr/50€, 10cr/90€, 20cr/160€
3. **Admin** : Modère annonces, gère utilisateurs.

### Types de Missions
- **Standard** : Particuliers, copropriétés
- **Renfort PRO** : B2B sous-traitance/intérim

---

## 🗄️ Schéma Supabase

`profiles` · `jobs` (pending|live|rejected|completed|cancelled) · `unlocked_leads` · `credits` · `credit_transactions` · `reviews` · `notifications` · `conversations` · `messages`

---

## 🌐 SEO Programmatique (258 pages SSG)

- 23 villes → `/cordiste-[ville]`
- 230 ville×service → `/cordiste-[ville]/[service]`
- 5 lexique → `/lexique/[slug]`
- JSON-LD : LocalBusiness, FAQPage, Service, DefinedTerm, Organization, WebSite
- 30 redirects 301 WordPress → Next.js dans `next.config.ts`

---

## 🚀 Commandes

```bash
npm run dev     # Dev server (port 3000)
npm run build   # Production build (286 pages)
npm run start   # Serveur production local
```

### Variables d'environnement (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

---

*Dernière mise à jour : 3 Avril 2026 — Migration Vite → Next.js 15 App Router*
