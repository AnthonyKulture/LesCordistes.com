# CLAUDE.md — LesCordistes.com

## Behavior Rules

- Never explain what you are about to do. Just do it.
- No summaries unless explicitly asked.
- No acknowledgment phrases ("Sure!", "Of course!", "Great question!").
- Skip preamble. Start directly with the output.
- If a task is clear, execute it. Do not ask for confirmation on obvious steps.

## Code Rules

- Never rewrite a full file to change 3 lines. Use targeted edits only.
- Always read a file before editing it. Never edit from memory.
- Never add comments to code unless asked.
- Never install a package without stating why and waiting for approval.
- Prefer native Next.js and browser APIs over third-party packages.
- Always use TypeScript. No `any` types for new code. Existing `any` casts are tolerated but not to be spread.

## Output Format

- Code only when code is needed.
- Short diagnosis before a fix, never after.
- If multiple solutions exist, show max 2. No ranked lists.
- No summaries except when a non-obvious decision was made.

## Verification

- Only run preview verification when the change is visually observable in the browser.
- Skip for types, utils, hooks, server-only code, or anything not rendered in the preview.

## Off-limits

- Do not touch .env files.
- Do not refactor files outside the current task scope.
- Do not run npm install without explicit approval.
- Do not commit or push unless explicitly asked.

---

## ⚠️ SETUP OBLIGATOIRE — Première chose à faire dans un worktree

```bash
bash scripts/setup-worktree.sh
```

Ce script crée les symlinks `node_modules` et `.env.local`, et configure `.claude/launch.json` avec le bon `cwd`. Sans ça, le serveur de preview sert le mauvais worktree et les modifications ne sont pas visibles.

**Ne JAMAIS committer/pusher sans validation explicite de l'utilisateur.**

---

## Règles worktrees (CRITIQUE)

- Le `Primary working directory` = le worktree courant. Tous les Read/Edit/Write doivent utiliser CE chemin.
- **CORRECT** : `/Users/anthony/Documents/Anthony/Projet Web/lescordistes/.claude/worktrees/<nom>/src/...`
- **FAUX** : `/Users/anthony/Documents/Anthony/Projet Web/lescordistes/src/...`
- Si un serveur preview tourne depuis un autre worktree → `preview_stop` puis redémarrer.
- Turbopack refuse les symlinks cross-worktrees → toujours `next dev` sans `--turbopack`.
- Le `node_modules` réel (avec Next.js) est dans `bold-ride/node_modules`.

---

## Architecture technique

- **Framework** : Next.js 15 App Router + React 19 + TypeScript
- **Styling** : Tailwind CSS — `#243355` (brand-blue) · `#5B8DDB` (brand-blue-light)
- **Backend** : Supabase (PostgreSQL · Auth · Storage · Edge Functions Deno)
- **Auth SSR** : `@supabase/ssr` — `createBrowserClient` (client) / `createServerClient` par requête (server)
- **State** : TanStack Query v5
- **Icônes** : Lucide React
- **Paiement** : Stripe Checkout + Webhooks
- **Email** : Resend via Edge Function `send-email`
- **Déploiement** : Vercel

---

## Structure du code

```
src/
├── app/
│   ├── layout.tsx                  # Root layout (Providers, Header, Footer)
│   ├── page.tsx                    # Landing SSR + JSON-LD
│   ├── (seo)/                      # 258 pages SSG (generateStaticParams)
│   │   ├── [cityPage]/             # 23 villes
│   │   │   └── [service]/          # 230 ville×service
│   │   └── lexique/                # 5 articles glossaire
│   ├── (protected)/                # Auth guard client-side
│   │   ├── dashboard/              # Tableaux de bord
│   │   ├── credits/                # Achat crédits
│   │   ├── messages/               # Messagerie
│   │   ├── profile/
│   │   └── pro/widget/
│   ├── api/
│   │   ├── create-checkout/route.ts
│   │   └── webhook/route.ts        # Stripe — raw body via req.text()
│   ├── jobs/[slug]/                # Détail mission
│   ├── pros/[id]/                  # Profil public pro
│   ├── connexion/ inscription/     # Auth pages
│   └── post-job/                   # Wizard dépôt mission
├── components/
│   ├── ui/                         # Button, Input, Toast, Card...
│   ├── layout/                     # Header, Footer, ModeSwitcher, ModeTransitionOverlay
│   ├── wizard/                     # Steps 1-5 formulaire mission
│   ├── dashboard/                  # StatCard, JobListItem, JobUnlockers, CompleteJobModal
│   ├── credits/                    # CreditWidget, UnlockLeadButton
│   ├── DashboardLayout.tsx         # Sidebar nav + mode switcher
│   └── Providers.tsx               # QueryClient + Auth + Toast + Dashboard contexts
├── contexts/
│   ├── AuthContext.tsx             # createBrowserClient, user + profile
│   └── DashboardContext.tsx        # mode worker/recruiter — localStorage SSR-safe
├── hooks/                          # useCredits, useNotifications, useMessaging, useReviews
├── lib/
│   ├── supabase-browser.ts         # createSupabaseBrowserClient() — client uniquement
│   ├── supabase-server.ts          # createSupabaseServerClient() — server, new per request
│   └── supabase.ts                 # Legacy singleton (storage SSR-safe)
├── views/                          # Composants page (tous 'use client')
│   └── dashboards/                 # ProDashboard, ClientDashboard, DashboardSelector
├── constants/                      # seoData.ts, seoGlossary.ts
└── types/                          # TypeScript + database.types.ts
```

---

## Règles critiques Next.js

- **Supabase browser** : `createSupabaseBrowserClient()` de `supabase-browser.ts` (jamais singleton sur server)
- **Supabase server** : `createSupabaseServerClient()` de `supabase-server.ts` — new instance par requête
- **`'use client'`** : obligatoire sur tout composant avec hooks/state/window/localStorage
- **`useSearchParams()`** : toujours wrappé dans `<Suspense>` dans le page.tsx parent
- **`localStorage`** : toujours gardé par `typeof window !== 'undefined'`
- **Stripe webhook** : `req.text()` pour le raw body
- **Middleware** : `supabase.auth.getUser()` sur chaque requête (refresh JWT obligatoire)

---

## Business logic & rôles

**Marketplace de mise en relation** fonctionnant via **crédits**.

| Rôle | Description |
|---|---|
| `client` | Poste des missions (wizard 5 étapes). Dashboard mode recruteur uniquement. |
| `pro` | Browse missions gratuit. Déblocage lead = 1 crédit (coordonnées complètes). Dual mode : cordiste / recruteur. |
| `admin` | Modère annonces `pending → live`, gère utilisateurs. |

**Packs crédits** : Starter 5cr/50€ · Pro 10cr/90€ · Business 20cr/160€

**Types de missions** : Standard (particuliers) · Renfort PRO (B2B sous-traitance)

**Dashboard pro** : deux modes via `DashboardContext`
- `worker` → `ProDashboard` (cherche des missions, débloque des leads)
- `recruiter` → `ClientDashboard` (poste des demandes de renfort)

---

## Schéma Supabase

- `profiles` : rôle, bio, certifications, avatar, intervention_zones
- `jobs` : status `pending | live | rejected | completed | cancelled`
- `unlocked_leads` : jointure Pro ↔ Job (accès `client_contact_info`)
- `credits` + `credit_transactions` : solde + historique
- `reviews` : notes clients → pros
- `notifications` : in-app
- `conversations` + `messages` : messagerie interne

**RLS** : `client_contact_info` inaccessible sans lead débloqué (niveau SQL).

---

## Emails (Edge Function)

- Fonction : `supabase/functions/send-email/index.ts`
- Templates HTML natifs (pas react-email — incompatible Deno)
- 8 templates : `welcome-client`, `welcome-pro`, `admin-alert`, `job-status`, `match-job`, `payment-receipt`, `verify-email`, `password-reset`
- Triggers SQL dans `supabase-email-triggers.sql` — ré-exécuter dans SQL Editor après modif
- Déploiement : `npx supabase functions deploy send-email --project-ref esvnvxkbnhvxpnlhyjsw`

---

## SEO programmatique (258 pages SSG)

- 23 villes → `/cordiste-[ville]`
- 230 ville×service → `/cordiste-[ville]/[service]`
- 5 lexique → `/lexique/[slug]`
- JSON-LD : LocalBusiness, FAQPage, Service, DefinedTerm, Organization, WebSite
- 301 redirects WordPress → Next.js dans `next.config.ts`

---

## Références clés

- Supabase project ref : `esvnvxkbnhvxpnlhyjsw`
- Email admin : `anthony@lescordistes.com`
- node/npm : `/Users/anthony/.nvm/versions/node/v22.14.0/bin/`
- Spec mode switcher : `bmad-transition-switcher.md`
