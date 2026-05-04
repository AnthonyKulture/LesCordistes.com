# CLAUDE.md — LesCordistes.com

## Début de session

Quand l'utilisateur envoie "Debut de session" :
1. Lire `graphify-out/GRAPH_REPORT.md` pour la structure du code
2. Charger la mémoire Mulch selon le domaine de la session :
   - Front (composants, UI) → `bash scripts/ml prime --domain nextjs`
   - Supabase / auth / RLS → `bash scripts/ml prime --domain supabase`
   - SEO → `bash scripts/ml prime --domain seo`
   - Si le domaine est inconnu, charger les 3
3. Lire les fichiers mémoire dans `/memory/` **sauf** `project_blog_automation.md`
4. Aucun résumé — être prêt à recevoir la première tâche

---

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

**Credit packs** (source : `src/constants/creditPacks.ts`) — Starter 3cr/60€ (20€/lead) · Pro 10cr/150€ (15€/lead) · Business 20cr/280€ (14€/lead). Coût par chantier : 1 crédit (standard) · 3 crédits (potentiel important) · 5 crédits (gros chantier).

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

## SEO (sitemap dynamique — pages indexables auto-pilotées)

- `/cordiste-[ville]` — 60 villes (toutes indexables) · `/cordiste-[ville]/[service]` — 1 380 pages générées dont **301 indexables** (contexte unique rédigé) et 1 079 en `noindex` · `/lexique/[slug]` — 13 termes · `/blog/[slug]` — 10 articles · 13 pages institutionnelles
- Total sitemap : **~398 URLs** (uniquement pages indexables — c'est ce que Google découvre). Pour vérifier le décompte : `curl -s https://www.lescordistes.com/sitemap.xml | grep -c '<loc>'`
- JSON-LD : Service+provider Organization, FAQPage, BlogPosting (avec `image`), DefinedTerm, DefinedTermSet, BreadcrumbList, Organization, WebSite
- OG image dynamique : `GET /og?title=…&kicker=…` (edge runtime) — utilisée par blog + fallback layout
- llms-full.txt dynamique : `/llms-full.txt` concatène llms.txt + lexique complet + FAQs blog (cache 24 h)
- WordPress → Next.js 301 redirects in `next.config.ts`
- **Canonical rule** : tous les canonicals + URLs JSON-LD utilisent `SEO_BASE_URL = https://www.lescordistes.com` (avec www). Ne **jamais** hardcoder `https://lescordistes.com` (sans www) — Next redirect en `next.config.ts` force la canonicalisation au cas où.
- Title template : `%s · LesCordistes` (15c, dans `layout.tsx`) — cible ≤ 60c total
- CSP en mode report-only — observer les violations dans GSC/console avant d'enforcer

### Stratégie anti-doorway : `noindex` conditionnel sur contexte unique

- **Toutes les 1 380 pages city × service sont générées et accessibles** (200 OK, contenu servi, link equity préservé).
- **Seules les pages avec contexte UNIQUE city-aware rédigé sont indexables** : la fonction `hasUniqueServiceCityContext(serviceSlug, citySlug)` (dans `seoData.ts`) renvoie `true` ssi `SERVICE_CITY_CONTEXT[service][city]` existe (sans tomber sur le `default`).
- **`generateMetadata` pose `robots: { index: false, follow: true }` sur les pages sans contexte unique** → Google ne les indexe pas mais peut suivre les liens internes.
- **Le sitemap ne liste que les pages indexables** : il filtre via `hasUniqueServiceCityContext`. Cohérent avec les `robots`.
- **Pour réactiver une page (la rendre indexable)** : ajouter une entry `SERVICE_CITY_CONTEXT[service][city] = { intro, useCases }` dans `seoData.ts`. Aucun changement de code requis. Le sitemap et les robots metas se mettent à jour automatiquement au build suivant.
- **Périmètre actuellement indexable** : 301 couples (sur 1 380 possibles). À élargir au fur et à mesure de la rédaction de contextes uniques.

### Cahier des charges qualité d'un contexte (E-E-A-T) — pour rédiger une nouvelle entry

Cible 80-160 mots intro + 3 useCases. Chaque texte doit passer le **swap test** (impossible de remplacer la ville par une autre sans casser le sens). Mentionner 3 specifics minimum :
- Quartier ou zone nommée (ex. Vieux-Lille, Île de Nantes, Capucins Brest)
- Matériau/type de bâti caractéristique (ex. brique foraine, granit breton, tuffeau, basalte Volvic)
- Climat/réglementation/économie locale (ABF, UNESCO, MaPrimeRénov', mistral, embruns, etc.)

### Schema LocalBusiness — règles

- **Une seule** `Organization` (homepage `@id: ${SEO_BASE_URL}/#organization`) avec `address: SEO_POSTAL_ADDRESS` (siège Nice)
- Pages city × service : `Service` schema avec `provider: { @id: organization }` + `areaServed: City` (la ville)
- Pages city : idem (`Service`, pas `LocalBusiness`)
- **Ne jamais** déclarer `addressLocality: <ville-de-la-page>` dans le schema d'une city page → assimilable à local-spam pour un SAB national

---

## References

| Key | Value |
|---|---|
| Supabase project ref | `esvnvxkbnhvxpnlhyjsw` |
| Admin email | `anthony@lescordistes.com` |
| Node/npm | `/Users/anthony/.nvm/versions/node/v22.14.0/bin/` |

---

## Graphify — cartographie structurelle

Graphe de 1204 nœuds/1300 arêtes dans `graphify-out/`. Hook actif : rappel automatique avant Glob/Grep.

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

## Fin de session

1. Y a-t-il une découverte (bug, pattern, décision) non documentée dans CLAUDE.md 
   qui vaut la peine d'être mémorisée pour la prochaine session ?
   Si oui, enregistre-la : `bash scripts/ml record <domaine> --type <type> --description "..."`

2. Si tu as modifié des fichiers dans src/, régénère le graphe Graphify :
   `source .venv-tools/bin/activate && python3 -c "from graphify.watch import _rebuild_code; from pathlib import Path; _rebuild_code(Path('.'))"`