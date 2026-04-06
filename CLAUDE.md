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
- Never stage or commit files whose absolute path starts with the main repo root when cwd is a worktree.

---

## Session Start — Run This First
```bash
bash scripts/session-init.sh   # prune stale worktrees + stale locks
bash scripts/setup-worktree.sh # symlink node_modules + .env.local + launch.json
```

Both scripts must run before any dev server or file edit.

---

## Worktrees (Critical)

- `Primary working directory` = the current worktree. All Read/Edit/Write use THIS path.
- ✅ `/Users/anthony/Documents/Anthony/Projet Web/lescordistes/.claude/worktrees/<name>/src/...`
- ❌ `/Users/anthony/Documents/Anthony/Projet Web/lescordistes/src/...`
- If a preview server is running from another worktree → `preview_stop`, then restart.
- Always `next dev` — never `next dev --turbopack` (Turbopack rejects cross-worktree symlinks).
- Real `node_modules` lives in `bold-ride/node_modules`.
- `index.lock` error at session start = stale lock. Run `scripts/session-init.sh`. Never `rm` it manually.

---

## Architecture

| Layer | Tech |
|---|---|
| Framework | Next.js 15 App Router + React 19 + TypeScript |
| Styling | Tailwind CSS — `#243355` brand-blue · `#5B8DDB` brand-blue-light |
| Backend | Supabase — PostgreSQL · Auth · Storage · Edge Functions (Deno) |
| Auth SSR | `@supabase/ssr` — `createBrowserClient` (client) · `createServerClient` per request (server) |
| State | TanStack Query v5 |
| Icons | Lucide React |
| Payments | Stripe Checkout + Webhooks |
| Email | Resend via Edge Function `send-email` |
| Deploy | Vercel |

---

## Code Structure
src/
├── app/
│   ├── layout.tsx                  # Root layout — Providers, Header, Footer
│   ├── page.tsx                    # Landing SSR + JSON-LD
│   ├── (seo)/                      # 258 SSG pages (generateStaticParams)
│   │   ├── [cityPage]/             # 23 cities
│   │   │   └── [service]/          # 230 city×service
│   │   └── lexique/                # 5 glossary articles
│   ├── (protected)/                # Client-side auth guard
│   │   ├── dashboard/
│   │   ├── credits/
│   │   ├── messages/
│   │   ├── profile/
│   │   └── pro/widget/
│   ├── api/
│   │   ├── create-checkout/route.ts
│   │   └── webhook/route.ts        # Stripe — raw body via req.text()
│   ├── jobs/[slug]/
│   ├── pros/[id]/
│   ├── connexion/
│   ├── inscription/
│   └── post-job/                   # 5-step mission wizard
├── components/
│   ├── ui/                         # Button, Input, Toast, Card…
│   ├── layout/                     # Header, Footer, ModeSwitcher, ModeTransitionOverlay
│   ├── wizard/                     # Steps 1–5
│   ├── dashboard/                  # StatCard, JobListItem, JobUnlockers, CompleteJobModal
│   ├── credits/                    # CreditWidget, UnlockLeadButton
│   ├── DashboardLayout.tsx
│   └── Providers.tsx               # QueryClient + Auth + Toast + Dashboard contexts
├── contexts/
│   ├── AuthContext.tsx             # createBrowserClient, user + profile
│   └── DashboardContext.tsx        # worker/recruiter mode — localStorage SSR-safe
├── hooks/                          # useCredits, useNotifications, useMessaging, useReviews
├── lib/
│   ├── supabase-browser.ts         # createSupabaseBrowserClient() — client only
│   ├── supabase-server.ts          # createSupabaseServerClient() — server, new per request
│   └── supabase.ts                 # Legacy singleton (storage SSR-safe)
├── views/
│   └── dashboards/                 # ProDashboard, ClientDashboard, DashboardSelector
├── constants/                      # seoData.ts, seoGlossary.ts
└── types/                          # TypeScript interfaces + database.types.ts

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

## Emails (Edge Function)

- Entry: `supabase/functions/send-email/index.ts`
- Native HTML templates — no react-email (incompatible with Deno)
- Templates: `welcome-client` · `welcome-pro` · `admin-alert` · `job-status` · `match-job` · `payment-receipt` · `verify-email` · `password-reset`
- SQL triggers: `supabase-email-triggers.sql` — re-run in SQL Editor after any change
- Deploy: `npx supabase functions deploy send-email --project-ref esvnvxkbnhvxpnlhyjsw`

---

## SEO (258 SSG pages)

- `/cordiste-[ville]` — 23 cities
- `/cordiste-[ville]/[service]` — 230 city×service
- `/lexique/[slug]` — 5 glossary articles
- JSON-LD schemas: LocalBusiness, FAQPage, Service, DefinedTerm, Organization, WebSite
- WordPress → Next.js 301 redirects in `next.config.ts`

---

## References

| Key | Value |
|---|---|
| Supabase project ref | `esvnvxkbnhvxpnlhyjsw` |
| Admin email | `anthony@lescordistes.com` |
| Node/npm | `/Users/anthony/.nvm/versions/node/v22.14.0/bin/` |
| Mode switcher spec | `bmad-transition-switcher.md` |
