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
│   │   └── webhook/route.ts           # Stripe Webhook (raw body)
│   ├── jobs/[slug]/            # Détail mission (dynamique)
│   ├── pros/[id]/              # Profil public pro (dynamique)
│   ├── connexion/              # Login
│   ├── inscription/            # Register (sélection rôle)
│   ├── inscription-cordiste/   # Register pro
│   ├── inscription-client/     # Register client
│   ├── post-job/               # Wizard dépôt mission
│   ├── jobs/                   # Job Board
│   ├── cgu/ cgv/ confidentialite/ mentions-legales/
│   └── not-found.tsx
├── components/
│   ├── ui/                     # Button, Input, Toast, etc.
│   ├── layout/                 # Header ('use client'), Footer, AuthLayout
│   ├── wizard/                 # Steps 1-5 du formulaire mission
│   ├── seo/                    # TrustBadges, SEOInternalLinks, SEOLocalReviews
│   ├── map/                    # JobMap (Leaflet/Mapbox)
│   ├── dashboard/              # JobUnlockers, CompleteJobModal
│   ├── credits/                # CreditWidget, UnlockLeadButton
│   ├── reviews/                # ReviewComponents
│   ├── notifications/          # NotificationBell
│   ├── profile/                # ProfileHeader
│   └── Providers.tsx           # 'use client' wrapper (QueryClient, Auth, Toast, Dashboard)
├── contexts/
│   ├── AuthContext.tsx         # 'use client' — createBrowserClient, useEffect
│   └── DashboardContext.tsx    # 'use client' — mode worker/recruiter, localStorage SSR-safe
├── hooks/                      # useCredits, useNotifications, useMessaging, useReviews
├── lib/
│   ├── supabase-browser.ts     # createBrowserClient (@supabase/ssr)
│   ├── supabase-server.ts      # createServerClient par requête (cookies async)
│   └── supabase.ts             # Legacy singleton (storage SSR-safe, pour hooks/views)
├── views/                      # Composants page legacy (tous 'use client')
│   ├── Landing.tsx, JobBoard.tsx, JobDetail.tsx...
│   ├── dashboards/             # ProDashboard, ClientDashboard, DashboardSelector
│   ├── seo/                    # CitySEOPage, CityServiceSEOPage, GlossaryArticle, GlossaryHub
│   └── admin/Dashboard.tsx
├── constants/                  # seoData.ts (PRIORITY_CITIES, SEO_SERVICES), seoGlossary.ts
└── types/                      # TypeScript types + database.types.ts
```

---

## 🔑 Règles critiques Next.js App Router

### Clients Supabase
- **Browser/Client Components** : `createSupabaseBrowserClient()` de `supabase-browser.ts`
- **Server Components** : `createSupabaseServerClient()` de `supabase-server.ts` (appel par requête, pas singleton)
- **Legacy hooks** : `supabase.ts` singleton avec storage SSR-safe (`typeof window` guard)
- **Middleware** : `createServerClient` avec `cookies()` de `next/headers`

### Directives 'use client'
Tous les composants utilisant hooks React, localStorage, window, ou contextes doivent avoir `'use client'` en première ligne.

### useSearchParams
Tout composant utilisant `useSearchParams()` doit être wrappé dans `<Suspense>` dans son page.tsx.

### localStorage
Toujours garder avec `typeof window !== 'undefined'` avant d'accéder à `localStorage` dans les initialiseurs de state ou useEffect.

---

## 💼 Business Logic & Rôles

**LesCordistes.com** est une marketplace fonctionnant via un système de **crédits**.

### Rôles Utilisateurs
1. **Client** : Poste des missions via wizard 5 étapes. Peut poster sans inscription.
2. **Pro (Cordiste)** :
   - Accès gratuit : titre, ville, description
   - Déblocage leads : **1 crédit** = coordonnées complètes
   - Packs : Starter 5cr/50€ · Pro 10cr/90€ · Business 20cr/160€
3. **Admin** : Modère annonces (`pending` → `live`), gère utilisateurs.

### Types de Missions
- **Standard** : Particuliers, copropriétés
- **Renfort PRO** : B2B (sous-traitance/intérim) — tarif journalier, habilitations

---

## 🗄️ Schéma Supabase

- `profiles` : rôle, bio, certifications, avatar
- `jobs` : status `pending | live | rejected | completed | cancelled`
- `unlocked_leads` : jointure Pro ↔ Job débloqué
- `credits` & `credit_transactions` : solde + historique
- `reviews` : notes clients
- `notifications` : notifications in-app
- `conversations` & `messages` : messagerie interne

---

## 🔐 Sécurité

- **RLS Supabase** : `client_contact_info` inaccessible sans lead débloqué au niveau SQL
- **Middleware Next.js** (`middleware.ts`) : refresh session JWT Supabase sur chaque requête (obligatoire)
- **Route `(protected)`** : auth guard client-side via `useAuth` + redirect

---

## 🌐 SEO Programmatique

- **258 pages SSG** générées via `generateStaticParams` :
  - 23 villes prioritaires (`/cordiste-[ville]`)
  - 230 pages ville×service (`/cordiste-[ville]/[service]`)
  - 5 articles lexique (`/lexique/[slug]`)
- **Schémas JSON-LD** : LocalBusiness, FAQPage, Service, DefinedTerm, Organization, WebSite
- **301 redirects** WordPress → Next.js dans `next.config.ts`

---

## 🚀 Commandes

```bash
npm run dev       # Serveur de développement Next.js (port 3000)
npm run build     # Build production (génère 286 pages)
npm run start     # Serveur production local
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

*Dernière mise à jour : 3 Avril 2026 — Migration Vite → Next.js 15 App Router complète*
