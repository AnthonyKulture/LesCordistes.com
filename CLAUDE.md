# CLAUDE.md — LesCordistes.com

## Behavior

- Never explain what you're about to do. Execute.
- No acknowledgment phrases. No preamble. No summaries unless asked.
- If the task is clear, do it. No confirmation on obvious steps.
- Short diagnosis before a fix. Never after.
- If multiple solutions exist, show max 2. No ranked lists.

---

## Code

- Read a file before editing it. Never edit from memory.
- Targeted edits only. Never rewrite a full file to change a few lines.
- No comments unless asked.
- No packages without stating why and waiting for approval.
- Prefer native Next.js and browser APIs over third-party packages.
- TypeScript always. No `any` in new code. Existing casts tolerated, not extended.

---

## Verification

- Run preview only when the change is visually observable in the browser.
- Skip for types, utils, hooks, server-only code.

---

## Off-limits

- Do not touch `.env` files.
- Do not refactor outside the current task scope.
- Do not run `npm install` without explicit approval.
- Do not stage, commit, or push anything without explicit user instruction.
- Never `git add .` — always stage explicit file paths.
- Never stage or commit without explicit user instruction.

---

## Architecture

| Layer | Tech |
|---|---|
| Framework | Next.js 15 App Router + React 19 + TypeScript |
| Styling | Tailwind CSS — `#243355` brand-blue · `#5B8DDB` brand-blue-light |
| Backend | Supabase — PostgreSQL · Auth · Storage · Edge Functions (Deno) |
| Auth SSR | `@supabase/ssr` — `createBrowserClient` (client) · `createServerClient` per request (server) |
| State | TanStack Query v5 |
| Payments | Stripe Checkout + Webhooks |
| Email | Resend via Edge Function `send-email` |
| Deploy | Vercel |

**Structure** : Pour la structure des fichiers, consulter Graphify (`graphify-out/GRAPH_REPORT.md` ou `graphify query "<question>"`).

---

## Next.js Rules

- **Supabase client** → `createSupabaseBrowserClient()` from `supabase-browser.ts`. Never on server.
- **Supabase server** → `createSupabaseServerClient()` from `supabase-server.ts`. New instance per request.
- **`'use client'`** → required on any component using hooks, state, window, or localStorage.
- **`useSearchParams()`** → always wrapped in `<Suspense>` in the parent `page.tsx`.
- **`localStorage`** → always guarded by `typeof window !== 'undefined'`.
- **Stripe webhook** → `req.text()` for raw body. Never `req.json()`.
- **Middleware** → `supabase.auth.getUser()` on every request. JWT refresh is mandatory.

---

## Business Logic

Marketplace connecting clients and rope-access professionals, credit-gated.

| Role | Access |
|---|---|
| `client` | Posts missions via 5-step wizard. Recruiter dashboard only. |
| `pro` | Browses missions for free. Unlocking a lead costs 1 credit (reveals full contact info). Dual mode: worker / recruiter. |
| `admin` | Moderates `pending → live`, manages users. |

**Credit packs** — Starter 5cr/50€ · Pro 10cr/90€ · Business 20cr/160€

**Mission types** — Standard (individuals) · Renfort PRO (B2B subcontracting)

**Pro dashboard modes** via `DashboardContext`:
- `worker` → `ProDashboard` (browse missions, unlock leads)
- `recruiter` → `ClientDashboard` (post subcontracting requests)

---

## Supabase Schema

| Table | Purpose |
|---|---|
| `profiles` | role, bio, certifications, avatar, intervention_zones |
| `jobs` | status: `pending › live › rejected › completed › cancelled` |
| `unlocked_leads` | Pro ↔ Job join — gates access to `client_contact_info` |
| `credits` + `credit_transactions` | balance + history |
| `reviews` | client → pro ratings |
| `notifications` | in-app |
| `conversations` + `messages` | internal messaging |

**RLS** : `client_contact_info` is inaccessible at SQL level without an unlocked lead row.

---

## Auth

- **Flow** : email+password (`signUp`) uniquement — pas de magic link ni `signInWithOtp`
- **Confirm email** : doit être **désactivé** dans Supabase Dashboard → Auth → Providers → Email
  (sinon `signUp` retourne `session: null` et l'utilisateur ne peut pas se connecter)
- **Google OAuth** : actif, rôle choisi via `RoleSelectionModal` au premier login
- `handle_new_user` trigger (PostgreSQL) crée le profil immédiatement avec tous les metadata
- Fichier de référence : `supabase/migrations/supabase-fix-handle-new-user.sql`

---

## Emails (Edge Function)

- Entry: `supabase/functions/send-email/index.ts`
- Native HTML templates — no react-email (incompatible avec Deno)
- Templates: `welcome-client` · `welcome-pro` · `admin-alert` · `job-status` · `match-job` · `payment-receipt` · `verify-email` · `password-reset`
- SQL triggers: `supabase-email-triggers.sql` — re-run in SQL Editor after any change
- Deploy: `npx supabase functions deploy send-email --project-ref esvnvxkbnhvxpnlhyjsw`

**Architecture welcome email** (source unique = SQL trigger, pas client-side) :
- Flow email+password → `handle_new_user` INSERT avec `full_name` → TRIGGER 1 (INSERT) → email
- Flow Google OAuth → INSERT avec `full_name = ''` → RoleSelectionModal UPDATE → TRIGGER 1b (UPDATE) → email
- Condition UPDATE : `(OLD.full_name IS NULL OR OLD.full_name = '') AND NEW.full_name != ''`
- Ne pas ajouter de `functions.invoke('send-email')` côté client pour les welcome emails — le trigger SQL suffit

---

## Geocoding

- **API** : `api-adresse.data.gouv.fr/search/?q=<query>&limit=5` — gouvernementale FR, gratuite, sans clé
- Retourne `properties.postcode`, `properties.city`, `properties.context` pour tous les types (ville, adresse, CP)
- Numéro de département : `properties.context.split(', ')[0]` → gère `2A`, `2B`, `971`–`976` nativement
- Composant : `src/components/wizard/Step1Location.tsx`

---

## SEO (258 SSG pages)

- `/cordiste-[ville]` — 23 cities · `/cordiste-[ville]/[service]` — 230 city×service · `/lexique/[slug]` — 5 articles
- JSON-LD: LocalBusiness, FAQPage, Service, DefinedTerm, Organization, WebSite
- WordPress → Next.js 301 redirects in `next.config.ts`

---

## References

| Key | Value |
|---|---|
| Supabase project ref | `esvnvxkbnhvxpnlhyjsw` |
| Admin email | `anthony@lescordistes.com` |
| Node/npm | `/Users/anthony/.nvm/versions/node/v22.14.0/bin/` |
| Mode switcher spec | `bmad-transition-switcher.md` |

---

## Graphify — cartographie structurelle

Graphe de 1068 nœuds/1145 arêtes dans `graphify-out/`. Hook actif : rappel automatique avant Glob/Grep.

- Avant toute question d'architecture ou de dépendances : `graphify-out/GRAPH_REPORT.md`
- Requête ciblée : `source .venv-tools/bin/activate && graphify query "<question>"`
- Après modifications de fichiers src/ : `source .venv-tools/bin/activate && python3 -c "from graphify.watch import _rebuild_code; from pathlib import Path; _rebuild_code(Path('.'))"`

---

## Mulch — mémoire opérationnelle

Mémoire structurée dans `.mulch/` (domaines : `nextjs`, `supabase`, `seo`). Wrapper : `bash scripts/ml <cmd>`. Prérequis : Bun (`curl -fsSL https://bun.sh/install | bash`).

**Graphify vs Mulch** : Graphify = structure statique du code. Mulch = décisions, patterns, bugs connus (mémoire persistante inter-sessions).

**Charger** (si la tâche touche un domaine connu) :
```bash
bash scripts/ml prime --domain nextjs   # ou supabase · seo
```

**Interroger** avant d'improviser sur un pattern connu :
```bash
bash scripts/ml query supabase "client"
```

**Enregistrer** uniquement après une découverte réelle non déjà dans CLAUDE.md :
```bash
bash scripts/ml record <domaine> --type <convention|pattern|failure|decision> --description "..."
```

Ne pas enregistrer : ce qui est déjà ici, des hypothèses, des états temporaires.
