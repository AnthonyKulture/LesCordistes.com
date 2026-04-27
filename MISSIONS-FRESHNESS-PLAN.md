# Plan d'intégration — Fraîcheur des missions

**Objectif** : supprimer le frein "mission ancienne" pour les pros, créer un signal de fraîcheur honnête, et auto-archiver les missions vraiment mortes après J+15.

---

## 1. Logique cible (UX)

| Âge mission | Badge sur card publique `/jobs` | Date `created_at` visible |
|---|---|---|
| 0-7 jours | `Nouveau` (vert, urgence positive) | ❌ cachée |
| 8-15 jours, non revalidée | aucun badge d'âge | ❌ cachée |
| 8-15 jours, revalidée par client | `Mission relancée` (bleu, validation client) | ❌ cachée |
| > 15 jours, non revalidée | **status passe à `expired` → retirée du listing** | n/a |
| Tout âge, **post-unlock** (lead débloqué) | (tous badges) | ✅ visible (utile pour le pro) |
| Vue client (`/dashboard`, `/admin`) | (tous badges) | ✅ visible (historique perso) |

**Principe** : le badge `Mission relancée` est posé **uniquement si le client a confirmé** par clic email à J+10. Pas de FOMO artificiel — c'est une preuve réelle de validité.

---

## 2. Schema DB

### Migration : `supabase/migrations/2026XXXX-jobs-freshness.sql`

```sql
-- 1. Étendre l'enum status pour inclure 'expired'
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_status_check;
ALTER TABLE jobs ADD CONSTRAINT jobs_status_check
  CHECK (status IN ('pending','live','rejected','completed','cancelled','expired'));

-- 2. Colonnes de revalidation
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS revalidation_email_sent_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS last_validated_at         TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS expired_at                TIMESTAMPTZ NULL;

-- 3. Index pour le cron
CREATE INDEX IF NOT EXISTS idx_jobs_freshness
  ON jobs (status, created_at)
  WHERE status = 'live';
```

### Mulch / Graphify
Pas de note Mulch nécessaire — la logique vit dans la migration + le cron, pas dans un pattern récurrent.

---

## 3. Backend

### 3.1 Cron edge function — `supabase/functions/jobs-freshness-cron/index.ts`

Schedule : **quotidien 06:00 UTC** (via Supabase pg_cron ou Vercel Cron).

```ts
// Pseudo-code
async function handler() {
  // A. Envoi des emails de revalidation à J+10
  const { data: toRevalidate } = await admin
    .from('jobs')
    .select('id, slug, title, location_city, created_by')
    .eq('status', 'live')
    .is('revalidation_email_sent_at', null)
    .lt('created_at', tenDaysAgo())

  for (const job of toRevalidate ?? []) {
    const token = signRevalidationToken(job.id, job.created_by)
    await sendEmail('job-revalidation-request', { job, token })
    await admin.from('jobs').update({ revalidation_email_sent_at: now() }).eq('id', job.id)
  }

  // B. Auto-archive J+15 si jamais revalidée
  await admin
    .from('jobs')
    .update({ status: 'expired', expired_at: now() })
    .eq('status', 'live')
    .is('last_validated_at', null)
    .lt('created_at', fifteenDaysAgo())
}
```

### 3.2 Email template — `supabase/functions/send-email/index.ts`

Nouveau template `job-revalidation-request` :
- Sujet : *"Votre mission « {title} » est-elle toujours d'actualité ?"*
- Corps : explication courte + bouton CTA `Oui, je cherche toujours un cordiste`
- Lien : `${SEO_BASE_URL}/api/jobs/validate?token=${signedToken}`
- Mention : *"Sans réponse sous 5 jours, votre mission sera automatiquement archivée."*

### 3.3 Token de revalidation — `src/lib/revalidation-token.ts`

```ts
import { createHmac, timingSafeEqual } from 'crypto'

const SECRET = process.env.REVALIDATION_SECRET! // 32+ chars, à ajouter dans .env / Vercel
const TTL_MS = 14 * 24 * 60 * 60 * 1000 // 14 jours

export function sign(jobId: string, clientId: string): string {
  const exp = Date.now() + TTL_MS
  const payload = `${jobId}.${clientId}.${exp}`
  const sig = createHmac('sha256', SECRET).update(payload).digest('hex')
  return Buffer.from(`${payload}.${sig}`).toString('base64url')
}

export function verify(token: string): { jobId: string; clientId: string } | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString()
    const [jobId, clientId, exp, sig] = decoded.split('.')
    if (Date.now() > Number(exp)) return null
    const expected = createHmac('sha256', SECRET).update(`${jobId}.${clientId}.${exp}`).digest('hex')
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
    return { jobId, clientId }
  } catch { return null }
}
```

### 3.4 Route API — `src/app/api/jobs/validate/route.ts`

```ts
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token')
  if (!token) return redirect('/?revalidation=invalid')

  const decoded = verify(token)
  if (!decoded) return redirect('/?revalidation=expired')

  const admin = createSupabaseAdminClient()
  await admin
    .from('jobs')
    .update({ last_validated_at: new Date().toISOString() })
    .eq('id', decoded.jobId)
    .eq('created_by', decoded.clientId)
    .eq('status', 'live') // ne pas réactiver une expired

  return redirect(`/dashboard?revalidation=ok&job=${decoded.jobId}`)
}
```

---

## 4. Frontend

### 4.1 `src/components/JobCard.tsx` (vue publique `/jobs`)

**Remplacer** ligne 48 + 123-125 :

```tsx
// AVANT (à supprimer)
const daysAgo = Math.floor((Date.now() - new Date(job.created_at).getTime()) / 86400000);
// ...
<span className="ml-auto text-slate-400">
  {daysAgo === 0 ? "Aujourd'hui" : daysAgo === 1 ? "Hier" : `Il y a ${daysAgo}j`}
</span>

// APRÈS
const freshness = getFreshnessBadge(job)  // helper dans missionEnrichment.ts
// ...
{freshness && (
  <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold ${freshness.className}`}>
    {freshness.label}
  </span>
)}
```

**Helper** dans `src/lib/missionEnrichment.ts` :

```ts
export function getFreshnessBadge(job: Pick<Job, 'created_at' | 'last_validated_at'>) {
  const created = new Date(job.created_at).getTime()
  const validated = job.last_validated_at ? new Date(job.last_validated_at).getTime() : null
  const now = Date.now()
  const DAY = 86400000

  if (now - created < 7 * DAY) {
    return { label: '🆕 Nouveau', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' }
  }
  if (validated && now - validated < 5 * DAY) {
    return { label: '✓ Mission relancée', className: 'bg-blue-50 text-blue-700 border border-blue-200' }
  }
  return null
}
```

### 4.2 `src/components/job-detail/JobHeader.tsx` (page mission `/jobs/[slug]`)

Date `Publiée le DD/MM/YYYY` doit être :
- ❌ cachée si visiteur anonyme ou pro non-débloqué
- ✅ visible si `canViewContact` (owner, lead débloqué, admin)

Passer `canViewContact: boolean` en prop depuis `[slug]/page.tsx` et conditionner ligne 40-43.

### 4.3 `src/components/dashboard/JobListItem.tsx` (dashboards client/pro)

**Aucun changement** — la date reste visible côté dashboard (historique perso pour client, infos post-unlock pour pro).

### 4.4 Filtre query `/jobs` — `src/app/jobs/page.tsx` ligne 41

Déjà `eq('status', 'live')` → filtre nativement les `expired`. ✅ Rien à changer.

### 4.5 `src/views/JobBoard.tsx` (composant client interactif)

Vérifier que la query Supabase côté client filtre aussi `status='live'`. Si oui, rien à changer.

### 4.6 Sitemap — `src/app/sitemap.ts`

Vérifier que la query jobs filtre `status='live'`. Sinon ajouter le filtre.

---

## 5. Variables d'environnement

À ajouter dans Vercel + `.env.local` :
- `REVALIDATION_SECRET` — string aléatoire 32+ chars (générer via `openssl rand -hex 32`)

---

## 6. Tests à passer

### Manuel (post-déploiement)
- [ ] Mission créée aujourd'hui → badge `🆕 Nouveau` visible sur `/jobs`
- [ ] Mission créée il y a 8 jours → aucun badge d'âge sur `/jobs`
- [ ] Cron simulé sur mission J+10 → email reçu, lien fonctionne, badge `✓ Mission relancée` apparaît
- [ ] Mission J+16 sans revalidation → status `expired`, retirée de `/jobs`
- [ ] Token expiré (>14j) → redirect `/?revalidation=expired`
- [ ] Token tampered → rejet
- [ ] Vue post-unlock → date `created_at` visible
- [ ] Vue client dashboard → date toujours visible
- [ ] Sitemap.xml → ne contient pas les jobs `expired`

### Cas limites
- Mission avec `last_validated_at` ancien (>15j) — comportement : non revalidée récemment → pas de badge, mais toujours `live`. À J+15 du dernier `last_validated_at` ? **Décision** : pour la v1, le compteur d'expiration repart de `created_at` uniquement. Si on revalide une 2e fois, on enverra un nouveau email à J+10 du **dernier** `last_validated_at`. **Adaptation cron** : `coalesce(last_validated_at, created_at) < tenDaysAgo()`.

---

## 7. Rollout

### Phase 1 — Schema (5 min)
1. Créer + appliquer migration `2026XXXX-jobs-freshness.sql` (Supabase SQL Editor)
2. Vérifier : `SELECT column_name FROM information_schema.columns WHERE table_name='jobs'`

### Phase 2 — Backend (1h)
3. Ajouter helper `src/lib/revalidation-token.ts`
4. Ajouter env `REVALIDATION_SECRET` dans Vercel
5. Créer route `src/app/api/jobs/validate/route.ts`
6. Ajouter template email `job-revalidation-request`
7. Déployer edge function : `npx supabase functions deploy send-email`
8. Tester : `curl /api/jobs/validate?token=<token-fait-main>`

### Phase 3 — Frontend (45 min)
9. Helper `getFreshnessBadge()` dans `missionEnrichment.ts`
10. Modifier `JobCard.tsx` (retirer `daysAgo`, brancher badge)
11. Modifier `JobHeader.tsx` (date post-unlock seulement)
12. Lancer `npm run dev`, vérifier les 3 vues : `/jobs`, `/jobs/[slug]` anonyme, `/jobs/[slug]` post-unlock

### Phase 4 — Cron (30 min)
13. Créer `supabase/functions/jobs-freshness-cron/index.ts`
14. Déployer : `npx supabase functions deploy jobs-freshness-cron`
15. Configurer schedule via Supabase Dashboard → Edge Functions → Cron
   - Pattern : `0 6 * * *` (06:00 UTC quotidien)
16. Trigger manuel pour test : `curl -X POST <url-fonction>`

### Phase 5 — Validation (15 min)
17. Insérer mission test avec `created_at = now() - 11 days`
18. Trigger cron → vérifier email reçu + `revalidation_email_sent_at` set
19. Cliquer le lien → vérifier `last_validated_at` set + redirect dashboard
20. Insérer mission test avec `created_at = now() - 16 days, last_validated_at = null`
21. Trigger cron → vérifier `status='expired'` + retrait de `/jobs`

### Phase 6 — Communication
22. Email aux clients existants : *"Petit changement côté affichage..."* (optionnel, transparence)
23. FAQ pro mise à jour : *"Pourquoi je ne vois plus la date des missions ?"*

---

## 8. Estimation totale

| Phase | Durée |
|---|---|
| 1. Schema | 5 min |
| 2. Backend | 60 min |
| 3. Frontend | 45 min |
| 4. Cron | 30 min |
| 5. Validation | 15 min |
| 6. Communication | optionnelle |
| **Total dev** | **~2h30** |

---

## 9. Décisions ouvertes (à valider avant Phase 2)

- **Q1** : Schedule cron — Supabase pg_cron ou Vercel Cron ? → **Reco : Supabase pg_cron** (plus simple, pas de cold start, gratuit illimité)
- **Q2** : Email de revalidation envoyé à `created_by` (uid du client) ou aux guest clients (sans compte, email dans `jobs.client_email`) ? → **Reco : aux deux** (utiliser `coalesce(profiles.email, jobs.client_email)`)
- **Q3** : Faut-il afficher au pro un compteur "X missions revalidées cette semaine" pour valoriser la fraîcheur globale du board ? → **Reco : v2** (pas critique pour cette release)
