# Agent Ops LesCordistes — Instructions Claude Code

## Contexte du projet

Tu construis le module **Admin Ops** de LesCordistes.com, la marketplace française de travaux sur cordes et accès difficiles. Ce module est une section `/admin` ajoutée directement dans la marketplace Next.js existante.

**Ce que tu construis :** Un dashboard admin avec un assistant IA intégré (sidebar chat) qui permet à Anthony (fondateur, seul admin) de piloter la plateforme — modérer les missions, gérer les profils pros, ajuster les crédits, consulter les KPIs — depuis un navigateur desktop ou mobile (PWA).

**Ce que tu ne construis PAS :** Un agent autonome qui tourne en background. Pas de process Python. Pas de scraping. Pas de prospection. Ça c'est l'agent commercial dans un repo séparé — ne jamais y toucher depuis ici.

---

## Stack technique

- **Framework :** Next.js 15 (App Router, déjà installé)
- **Base de données :** Supabase (PostgreSQL) via `@supabase/ssr` et `@supabase/supabase-js` (déjà installés)
- **Auth :** Supabase Auth — le middleware `updateSession` est déjà en place dans `middleware.ts`
- **Styling :** Tailwind CSS (déjà installé)
- **LLM :** Claude API (Anthropic) via `fetch` direct — modèle `claude-sonnet-4-6` par défaut, `claude-haiku-4-5-20251001` pour les tâches simples (stats, résumés courts)
- **Notifications push :** Telegram Bot API (webhook sortant uniquement — l'admin reçoit des alertes, il ne pilote pas depuis Telegram)
- **Typage :** TypeScript strict, pas de `any`
- **Icônes :** `lucide-react` (déjà installé)

**Packages à ajouter :**
```bash
npm install @anthropic-ai/sdk
```

---

## Variables d'environnement à ajouter dans `.env.local`

```bash
# Déjà présentes (ne pas recréer)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# À ajouter
SUPABASE_SERVICE_ROLE_KEY=          # clé service_role Supabase (jamais exposée côté client)
ANTHROPIC_API_KEY=                   # clé API Anthropic
ADMIN_SECRET=                        # secret arbitraire pour protéger /api/ops/* (ex: openssl rand -hex 32)
TELEGRAM_BOT_TOKEN=                  # token du bot @CordistesOpsBot
TELEGRAM_ADMIN_CHAT_ID=              # ton chat_id Telegram personnel
```

---

## Schéma Supabase — tables de la marketplace

### `profiles` — utilisateurs inscrits (pros et clients)
```typescript
type Profile = {
  id: uuid               // = auth.uid()
  email: string
  role: 'pro' | 'client' | 'admin'
  full_name: string | null
  first_name: string | null
  last_name: string | null
  phone: string | null
  bio: string | null
  company_name: string | null
  siret: string | null
  certifications: string[] | null    // ex: ['CQP Cordiste N2', 'IRATA Level 2']
  skills: string[] | null
  equipment: string[] | null
  intervention_zones: string[] | null
  insurance_info: string | null
  avatar_url: string | null
  portfolio_photos: string[] | null
  latitude: number | null
  longitude: number | null
  client_type: string | null
  created_at: string
  updated_at: string
}
```

### `jobs` — missions déposées par les clients
```typescript
type Job = {
  id: uuid
  title: string
  description: string
  category: string
  status: 'pending' | 'live' | 'rejected' | 'closed' | 'archived'
  client_type: string | null         // 'particulier' | 'syndic' | 'entreprise'
  type: 'standard' | string | null
  location_city: string
  location_address: string | null
  location_department: string | null
  latitude: number | null
  longitude: number | null
  height_meters: number | null
  photos_url: string[] | null
  budget_min: number | null
  budget_max: number | null
  daily_rate: number | null
  deadline: string | null            // date ISO
  start_date: string | null
  duration_days: number | null
  required_level: string[] | null    // ex: ['CQP N2', 'IRATA L2']
  required_habilitations: string[] | null
  secondary_trades: string[] | null
  equipment_management: string | null
  specific_equipment: string | null
  structure_type: string | null
  contract_type: string | null
  work_night_weekend: boolean
  security_plan_confirmed: boolean
  internal_reference: string | null
  credit_cost: number                // défaut 1
  slug: string | null
  rejection_reason: string | null
  created_by: uuid | null
  moderated_at: string | null
  moderated_by: uuid | null
  created_at: string
  updated_at: string
}
```

### `credits` — solde de crédits par pro
```typescript
type Credits = {
  id: uuid
  pro_id: uuid
  balance: number    // solde actuel
  updated_at: string
}
```

### `credit_transactions` — historique des mouvements de crédits
```typescript
type CreditTransaction = {
  id: uuid
  pro_id: uuid
  type: string        // 'purchase' | 'spend' | 'refund' | 'manual_adjustment'
  amount: number      // positif = ajout, négatif = débit
  job_id: uuid | null
  description: string | null
  created_at: string
}
```

### `unlocked_leads` — missions débloquées (crédit dépensé) par un pro
```typescript
type UnlockedLead = {
  id: uuid
  pro_id: uuid
  job_id: uuid
  unlocked_at: string
}
```

### `leads` — formulaire de dépôt incomplet (funnel)
```typescript
type Lead = {
  id: uuid
  email: string
  phone: string | null
  category: string | null
  city: string | null
  step_reached: number   // étape du formulaire atteinte (1-5)
  source: string | null
  created_at: string
  updated_at: string
}
```

### `notifications` — notifications in-app utilisateurs
```typescript
type Notification = {
  id: uuid
  user_id: uuid
  type: string
  title: string
  message: string
  link: string | null
  read: boolean
  created_at: string
}
```

### `reviews`, `conversations`, `messages` — lire uniquement, ne jamais modifier

### Tables agent commercial (prospects, contacts, activities, campaigns, agent_usage) — **READ-ONLY**, ne jamais écrire dedans depuis l'agent ops

---

## RLS — règles critiques à respecter

- **`jobs`** : les admins peuvent tout voir et tout mettre à jour via la policy `Admins can view all jobs` / `Admins can update jobs` — utiliser le client Supabase avec l'auth admin (session utilisateur, pas service_role) pour bénéficier de ces policies.
- **`credits` et `credit_transactions`** : pas de policy admin explicite → utiliser le client **service_role** pour les ajustements de crédits. Ne jamais exposer la clé service_role côté client.
- **`profiles`** : SELECT public pour tous, UPDATE uniquement par le propriétaire → pour les modifications admin, utiliser service_role.
- **`leads`, `prospects`, `contacts`, `campaigns`, `activities`, `agent_usage`** : service_role uniquement.

---

## Architecture des fichiers à créer

```
app/
├── admin/
│   ├── layout.tsx              ← layout admin (sidebar nav + guard auth admin)
│   ├── page.tsx                ← dashboard KPIs temps réel
│   ├── missions/
│   │   ├── page.tsx            ← liste missions (tabs: pending / live / rejected)
│   │   └── [id]/page.tsx       ← fiche mission + sidebar IA
│   └── profils/
│       ├── page.tsx            ← liste pros inscrits
│       └── [id]/page.tsx       ← fiche pro + ajustement crédits
├── api/
│   └── ops/
│       ├── chat/route.ts       ← endpoint POST — chat IA (Claude API)
│       ├── jobs/route.ts       ← GET list, PATCH update/approve/reject
│       ├── users/route.ts      ← GET list/search, PATCH update, POST credits
│       ├── stats/route.ts      ← GET KPIs agrégés
│       └── notify/route.ts     ← POST → envoie message Telegram
components/
└── admin/
    ├── AiSidebar.tsx           ← sidebar chat IA (composant client)
    ├── JobCard.tsx             ← carte mission avec actions inline
    ├── ProfileCard.tsx         ← carte profil pro
    ├── StatsGrid.tsx           ← grille KPIs
    ├── StatusBadge.tsx         ← badge status coloré
    └── ConfirmDialog.tsx       ← dialog confirmation actions critiques
```

---

## Règles de sécurité — JAMAIS déroger

### Côté API Routes (`/api/ops/*`)

Toutes les routes API ops sont protégées par double vérification :

```typescript
// Au début de chaque route handler
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  // 1. Vérifier la session Supabase
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // 2. Vérifier le rôle admin dans profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 })

  // ... logique métier
}
```

### Client service_role — uniquement dans les API Routes server-side

```typescript
import { createClient as createServiceClient } from '@supabase/supabase-js'

const serviceClient = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // jamais dans le code client
)
```

### Actions critiques — confirmation obligatoire côté UI

Les actions suivantes **doivent** passer par `<ConfirmDialog>` avant exécution :
- Ajustement de crédits (positif ou négatif)
- Rejection d'une mission (avec motif obligatoire)
- Modification d'email ou téléphone d'un profil
- Toute action irréversible

### Audit trail — chaque mutation loguée

Créer une table `admin_actions` dans Supabase (migration SQL fournie plus bas). Chaque mutation ops l'alimente :

```typescript
// À appeler après chaque mutation réussie
await serviceClient.from('admin_actions').insert({
  action: 'job_approved',          // snake_case descriptif
  target_table: 'jobs',
  target_id: jobId,
  payload: { before: oldStatus, after: 'live' },
  performed_by: user.id
})
```

---

## Migration SQL à créer en premier

Exécuter dans Supabase SQL Editor avant de commencer le dev :

```sql
-- Table audit trail ops (immuable)
CREATE TABLE IF NOT EXISTS admin_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  target_table text NOT NULL,
  target_id uuid,
  payload jsonb DEFAULT '{}',
  performed_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- RLS : seul le service_role peut lire/écrire
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_actions_service_role_all" ON admin_actions
  FOR ALL USING ((auth.jwt() ->> 'role') = 'service_role');

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_credits_pro_id ON credits(pro_id);
```

---

## Fonctionnalités à implémenter — dans cet ordre

### Sprint 1 — Foundation (jours 1-2)

**1. Guard admin et layout**

`app/admin/layout.tsx` — server component :
- Vérifie la session via `createClient()` de `@/lib/supabase/server`
- Vérifie `profiles.role === 'admin'` pour l'utilisateur connecté
- Redirect vers `/login` si non connecté, vers `/` si connecté mais pas admin
- Affiche une sidebar nav : Dashboard / Missions / Profils
- PWA-ready : viewport meta, `manifest.json`

**2. Dashboard KPIs** — `app/admin/page.tsx`

Appelle `GET /api/ops/stats` qui retourne :
```typescript
type Stats = {
  jobs: {
    pending: number      // status = 'pending'
    live: number         // status = 'live'
    total_week: number   // créées cette semaine
  }
  profiles: {
    total_pros: number   // role = 'pro'
    new_week: number     // créés cette semaine
    with_credits: number // ont balance > 0
  }
  credits: {
    total_sold: number   // somme des transactions type='purchase'
    total_spent: number  // somme abs des transactions type='spend'
  }
  leads: {
    total: number
    step_5: number       // formulaire complet
  }
  top_cities: { city: string; count: number }[]  // top 5 villes
}
```

Affichage : grille de metric cards + tableau top villes.

**3. Morning briefing Telegram**

`/api/ops/notify/route.ts` — appelé par un cron Vercel (ou manuellement) :
- Calcule les stats du jour
- Envoie un message Telegram formaté avec les KPIs et le lien vers `/admin`
- Format du message :
```
☀️ Bonjour Anthony

📋 Missions en attente : {n}
👷 Nouveaux pros cette semaine : {n}
💳 Crédits vendus ce mois : {n}

→ https://lescordistes.com/admin
```

### Sprint 2 — Modération missions (jours 3-4)

**4. Liste missions** — `app/admin/missions/page.tsx`

- Trois onglets : `pending` / `live` / `rejected`
- Chaque mission affiche : titre, ville, catégorie, client_type, date, nb photos, budget
- Calcule et affiche le **Lead Quality Score (LQS)** côté client (jamais en DB) :
  ```typescript
  function computeLQS(job: Job): number {
    let score = 0
    if (job.description?.length > 80) score += 20
    if (job.photos_url && job.photos_url.length > 0) score += 20
    if (job.location_department) score += 15
    if (job.budget_min || job.budget_max || job.daily_rate) score += 20
    if (job.client_type === 'syndic' || job.client_type === 'entreprise') score += 15
    if ((job.client_contact_info as any)?.phone) score += 10
    return Math.min(score, 100)
  }
  ```
- Badge LQS coloré : < 50 rouge, 50-70 orange, > 70 vert
- Actions rapides inline : [Approuver] [Rejeter] [Voir détail]

**5. Fiche mission avec sidebar IA** — `app/admin/missions/[id]/page.tsx`

Layout deux colonnes :
- Gauche (2/3) : détail complet de la mission, toutes les colonnes affichées proprement
- Droite (1/3) : `<AiSidebar>` avec contexte de la mission injecté

`components/admin/AiSidebar.tsx` — client component :
- Chat simple : input + historique de messages
- Appelle `POST /api/ops/chat` avec :
  ```typescript
  {
    message: string,
    context: {
      type: 'job' | 'profile',
      id: string,
      data: Job | Profile   // les données complètes de l'entité
    },
    history: { role: 'user' | 'assistant', content: string }[]
  }
  ```
- Actions rapides pré-définies (boutons au-dessus de l'input) :
  - "Améliore la description"
  - "Suggère un titre"
  - "Résume pour un pro"
  - "Détecte les problèmes"

**6. Endpoint chat IA** — `app/api/ops/chat/route.ts`

```typescript
// System prompt injecté
const SYSTEM_PROMPT = `Tu es l'assistant ops de LesCordistes.com, la marketplace française de travaux sur cordes.
Tu aides Anthony (le fondateur) à modérer les missions et gérer les profils pros.

Contexte métier :
- Les missions (jobs) sont déposées par des clients (particuliers, syndics, entreprises)
- Les pros (cordistes, agences ETC) paient des crédits pour accéder aux coordonnées des clients
- Une mission de qualité a : description > 80 mots, photos, budget indicatif, localisation précise
- Certifications pros : CQP Cordiste (France), IRATA (international), GRETA
- Packs crédits : Starter 60€/3 crédits, Pro 150€/10 crédits, Business 280€/20 crédits

Quand tu proposes une modification de description ou de titre :
- Reste factuel, professionnel, orienté cordiste
- Conserve TOUTES les informations techniques (hauteur, matériaux, contraintes d'accès)
- Améliore la clarté et la précision pour aider les pros à évaluer la mission
- Ne jamais inventer des informations non présentes dans l'original

Format de réponse : direct, concis, sans introduction. Si tu proposes du texte de remplacement, 
mets-le dans un bloc markdown \`\`\` pour faciliter le copier-coller.`

// La route reçoit le contexte de la mission/profil et l'injecte dans le premier message
```

Utiliser le streaming (`stream: true`) pour un retour temps réel dans la sidebar.

**7. Actions modération** — `app/api/ops/jobs/route.ts`

```typescript
// PATCH /api/ops/jobs/[id]
// body: { action: 'approve' | 'reject' | 'update', data?: Partial<Job> }

// approve → status = 'live', moderated_at = now(), moderated_by = user.id
// reject  → status = 'rejected', rejection_reason obligatoire, moderated_at, moderated_by
// update  → champs autorisés: title, description, category, rejection_reason
//           champs INTERDITS à modifier: created_by, credit_cost, client_contact_info, status via update direct
```

Après chaque action : notifier Telegram si action = approve ou reject.

### Sprint 3 — Gestion profils et crédits (jours 5-6)

**8. Liste profils pros** — `app/admin/profils/page.tsx`

- Filtre par : rôle (pro/client/admin), avec/sans crédits, date inscription
- Affiche : nom, email, certifications, solde crédits, date inscription
- Recherche full-text (client-side sur les données chargées)

**9. Fiche profil** — `app/admin/profils/[id]/page.tsx`

- Toutes les infos du profil
- Solde crédits actuel + historique des transactions
- Formulaire d'ajustement crédits :
  - Champ delta (positif = ajout, négatif = déduction)
  - Champ description obligatoire
  - `<ConfirmDialog>` avant validation
- Sidebar IA avec contexte profil

**10. Endpoint ajustement crédits** — `app/api/ops/users/route.ts`

```typescript
// POST /api/ops/users/[id]/credits
// body: { delta: number, description: string }
// Utiliser service_role client (RLS credits ne couvre pas les admins)

// Transaction atomique :
// 1. INSERT credit_transactions { pro_id, type: 'manual_adjustment', amount: delta, description }
// 2. UPDATE credits SET balance = balance + delta WHERE pro_id = id
// 3. INSERT admin_actions { action: 'credits_adjusted', ... }
// Guard : balance résultante ne peut pas être négative sauf si delta explicitement validé
```

### Sprint 4 — PWA et notifications (jour 7)

**11. PWA manifest**

Créer `public/manifest.json` et ajouter dans `app/layout.tsx` :
```json
{
  "name": "LesCordistes Admin",
  "short_name": "LC Admin",
  "start_url": "/admin",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [{ "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" }]
}
```

**12. Notifications temps réel**

Dans `app/admin/layout.tsx`, utiliser Supabase Realtime pour écouter les nouveaux jobs `status = 'pending'` et afficher un badge dans la nav.

---

## Composant `AiSidebar.tsx` — spec détaillée

```typescript
'use client'

interface AiSidebarProps {
  context: {
    type: 'job' | 'profile'
    id: string
    data: Job | Profile
  }
  onApplyText?: (field: string, value: string) => void  // callback pour appliquer un texte suggéré
}
```

- Hauteur : `h-full` avec scroll interne sur l'historique
- Input en bas, sticky
- Messages streamés token par token (SSE ou ReadableStream)
- Quand l'IA retourne un bloc de code markdown, afficher un bouton "Appliquer" à côté qui appelle `onApplyText`
- Stocker l'historique dans `useState` — pas de persistence entre pages
- Afficher un indicateur "En train d'écrire..." pendant le stream

---

## Ce que Claude Code ne doit JAMAIS faire

- Exposer `SUPABASE_SERVICE_ROLE_KEY` dans du code client (composants, hooks, `'use client'`)
- Modifier les tables `prospects`, `contacts`, `activities`, `campaigns`, `agent_usage` — elles appartiennent à l'agent commercial
- Supprimer des jobs ou des profils — seulement `status = 'rejected'` ou `status = 'archived'`
- Bypasser le check `role = 'admin'` dans les API routes
- Créer des endpoints sans audit trail pour les mutations
- Modifier `credit_cost` sur un job existant
- Envoyer des emails directement — uniquement des notifications Telegram
- Utiliser `any` en TypeScript sauf pour `client_contact_info` (jsonb non typé, acceptable avec cast explicite)
- Faire des requêtes Supabase côté client sur des données sensibles (coordonnées clients, transactions)

---

## Workflow de développement

1. **Commencer par la migration SQL** — créer `admin_actions` avant tout
2. **Layout admin + guard** — rien d'autre ne fonctionne sans ça
3. **API routes en premier, UI ensuite** — tester chaque route avec curl avant de brancher l'UI
4. **Un fichier = une responsabilité** — pas de logique métier dans les composants UI
5. **Types TypeScript d'abord** — définir les types dans `lib/types/ops.ts` avant de coder les composants
6. **Tester le guard admin** — se connecter avec un compte non-admin et vérifier la redirection

## Commandes utiles

```bash
# Dev
npm run dev

# Typecheck
npm run typecheck

# Lint
npm run lint

# Tester une API route
curl -X GET http://localhost:3000/api/ops/stats \
  -H "Cookie: [ta session cookie]"
```

---

## Fichier `lib/types/ops.ts` à créer en premier

Avant de toucher à quoi que ce soit d'autre, créer ce fichier avec tous les types TypeScript dérivés du schéma Supabase ci-dessus. Il sera importé par tous les composants et routes API. Inclure aussi :

```typescript
export type AdminAction = {
  id: string
  action: string
  target_table: string
  target_id: string | null
  payload: Record<string, unknown>
  performed_by: string
  created_at: string
}

export type OpsStats = { /* ... */ }

export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type ChatRequest = {
  message: string
  context: { type: 'job' | 'profile'; id: string; data: Job | Profile }
  history: ChatMessage[]
}

// LQS — calculé côté client, jamais stocké en DB
export type JobWithLQS = Job & { lqs: number }
```
