You are a senior software architect. Your task is to fully audit, clean, and refactor this project. Work methodically through each phase below. After each phase, summarize what was done before moving to the next.

---

## PHASE 1 — Project Audit

1. List all files and folders in the project root. Identify:
   - Unused or duplicate files (configs, assets, scripts)
   - Dead code (unused functions, components, variables)
   - Orphaned files not imported anywhere
   - Inconsistent naming conventions (mixed camelCase / kebab-case / snake_case)
   - Oversized files that should be split

2. Read package.json (or equivalent). Identify:
   - Unused dependencies (not imported anywhere in the codebase)
   - Outdated or redundant devDependencies
   - Missing or incorrect scripts

3. Check for:
   - .env files accidentally committed
   - Hardcoded secrets, API keys, or credentials in the code
   - Large binary files or build artifacts that should be in .gitignore

---

## PHASE 2 — File & Folder Structure Cleanup

1. Propose and apply a clean folder structure adapted to this project type.
2. Remove all empty folders.
3. Remove all files that serve no purpose (e.g. *.bak, *.orig, temp files, duplicate configs).
4. Consolidate duplicated logic into shared utilities or services.
5. Ensure .gitignore is complete and correct for this stack. Add any missing entries (node_modules, .env, dist, .DS_Store, etc.).

---

## PHASE 3 — Code Refactoring

1. Rename files and variables to follow a single consistent convention throughout the project.
2. Break down any function or component longer than 80 lines into smaller, focused units.
3. Replace all magic numbers and hardcoded strings with named constants.
4. Remove all commented-out code blocks.
5. Standardize import ordering (external libs → internal modules → relative imports).
6. If a linter config exists (.eslintrc, .prettierrc, etc.), enforce it. If not, create a sensible one for this stack and apply it.

---

## PHASE 4 — GitHub & Git Cleanup

1. Run: `git worktree list` — identify and remove all stale or merged worktrees with `git worktree remove` and `git worktree prune`.
2. Run: `git branch -a` — list all local and remote branches. For each branch:
   - Check if it has been merged into main/master
   - If merged and stale: delete locally with `git branch -d` and remotely with `git push origin --delete`
   - If unmerged but abandoned (no commits in 30+ days): flag it for manual review
3. Run: `git remote prune origin` to clean up remote tracking refs that no longer exist.
4. Check for large files in git history using: `git rev-list --objects --all | sort -k 2 | uniq` — flag anything unexpectedly large.
5. Verify the default branch name and that the remote origin is correctly set.

---

## PHASE 5 — Final Verification

1. Run the project's test suite (if any). All tests must pass.
2. Run the build command. The build must succeed with no errors or warnings.
3. Run the linter. Zero errors, zero warnings.
4. Produce a clean summary report with:
   - Files deleted
   - Files renamed or moved
   - Dependencies removed
   - Branches and worktrees cleaned
   - Remaining TODOs or items requiring manual decision

Do not skip any phase. If you are uncertain about deleting something, ask before proceeding.

Quelques conseils d'utilisation :

Lance-le depuis la racine de ton projet dans Claude Code
Si ton projet a un stack spécifique (Next.js, Laravel, etc.), tu peux ajouter une ligne de contexte au début du prompt du type : "This is a Next.js 14 project using TypeScript and Tailwind."
Pour la Phase 4 Git, assure-toi d'avoir les droits push sur le remote avant de lancer
Le prompt demande confirmation avant toute suppression ambiguë — tu garderas le contrôle
CLAUDE.md — LesCordistes.com
Behavior Rules
Never explain what you are about to do. Just do it.
No summaries unless explicitly asked.
No acknowledgment phrases ("Sure!", "Of course!", "Great question!").
Skip preamble. Start directly with the output.
If a task is clear, execute it. Do not ask for copastedJ'ai aussi un soucis avec les worktrees, a chaque fois que j'ouvre une nouvelle session, il y a un probleme Bashrm "/Users/anthony/Documents/Anthony/Projet Web/lescordistes/.git/worktrees/gallant-davinci/index.lock" && echo "OK"
Exit code 1rm: /Users/anthony/Documents/Anthony/Projet Web/lescordistes/.git/worktrees/gallant-davinci/index.lock: No such file or directoryJ'ai mis des instructions dans claude.md et maintenant il push deux comit différents: Deux commits séparés — worktree (dashboard) + projet principal (CLAUDE.md + script) :18:11Le problème index.lock et les doubles commits viennent de la même cause racine : tes worktrees sont mal nettoyés et ton CLAUDE.md essaie de gérer ça de façon réactive plutôt que préventive.
Voici un prompt ciblé à coller dans Claude Code pour régler ça proprement :

## TASK — Fix worktree cleanup + double-commit issue

### Context
- Recurring error at session start: `rm ".git/worktrees/<name>/index.lock"` fails because the file doesn't exist
- Two separate commits are being created: one in the worktree, one in the project root (CLAUDE.md + scripts)
- CLAUDE.md currently says "Ne JAMAIS committer/pusher sans validation explicite" but doesn't prevent the root from being committed separately

---

### PHASE 1 — Clean current worktree state

Run the following and show me the output before touching anything:
```bash
git worktree list
git branch -a
ls .git/worktrees/
```

For each entry in `.git/worktrees/`:
- Check if the worktree path still exists on disk
- If the path is gone: run `git worktree prune` to remove the stale ref
- If an `index.lock` exists in any worktree metadata folder: remove it only if the corresponding process is no longer running (`lsof | grep index.lock`)

Do NOT delete worktrees that are still in use.

---

### PHASE 2 — Fix the double-commit root cause

The double-commit happens because CLAUDE.md and setup scripts live in the project root (main worktree), while feature work happens in a child worktree. Git sees them as separate working trees = separate commits.

1. Check if `scripts/setup-worktree.sh` and `CLAUDE.md` are tracked in the main worktree or in a child worktree.
2. If they are in the main worktree and being modified during feature work: add a rule in CLAUDE.md to never stage files outside `cwd` (the current worktree path).
3. In `scripts/setup-worktree.sh`, add a guard at the top:
```bash
if [ "$(git rev-parse --show-toplevel)" != "$(pwd)" ]; then
  echo "ERROR: Run this script from the worktree root, not the main repo root."
  exit 1
fi
```

---

### PHASE 3 — Harden CLAUDE.md against this

Add the following rule to the existing "Règles worktrees (CRITIQUE)" section in CLAUDE.md:

Never stage or commit files whose path starts with the main repo root if cwd is a worktree.
Never run git add . from a worktree — always use explicit file paths.
index.lock errors at session start = stale lock. Run git worktree prune first. Never blindly rm the lock.


---

### PHASE 4 — Create a session-init script

Create `scripts/session-init.sh`:
```bash
#!/bin/bash
# Run at the start of each Claude Code session in a worktree
set -e

echo "→ Pruning stale worktrees..."
git worktree prune

echo "→ Checking for stale index.lock files..."
for worktree_meta in .git/worktrees/*/; do
  lock="$worktree_meta/index.lock"
  if [ -f "$lock" ]; then
    # Only remove if no git process is using it
    if ! lsof "$lock" > /dev/null 2>&1; then
      rm "$lock"
      echo "  Removed stale lock: $lock"
    else
      echo "  Lock in use, skipping: $lock"
    fi
  fi
done

echo "→ Worktree status:"
git worktree list

echo "Done. Safe to proceed."
```

Make it executable: `chmod +x scripts/session-init.sh`

Update CLAUDE.md setup section to call `scripts/session-init.sh` BEFORE `scripts/setup-worktree.sh`.

---

Do not commit anything. Show me the output of Phase 1 first, then proceed phase by phase.

Ce que ça règle :
ProblèmeFixindex.lock fantôme au démarragesession-init.sh avec détection lsof avant rmDouble commit root + worktreeGuard dans CLAUDE.md + interdiction de git add .Worktrees stale qui persistentgit worktree prune automatisé# CLAUDE.md — LesCordistes.com

## Behavior Rules

- Never explain what you are about to do. Just do it.
- No summaries unless explicitly asked.
- No acknowledgment phrases ("Sure!", "Of course!", "Great question!").
- Skip preamble. Start directly with the output.
- If a task is clear, execute it. pastedrewritre it completely with your recommendations:18:19Voici ton CLAUDE.md réécrit intégralement :

markdown# CLAUDE.md — LesCordistes.com

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
