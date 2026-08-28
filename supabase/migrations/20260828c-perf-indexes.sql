-- ============================================================================
-- 20260828c — INDEX : ajout des index manquants, suppression des redondants
--
-- Portée : PERFORMANCE UNIQUEMENT. Aucune policy, aucun grant, aucune colonne,
-- aucune fonction n'est touchée. La sémantique d'accès (RLS + column grants
-- posés par 20260828b) est strictement préservée : un index ne filtre rien,
-- il ne fait que changer le chemin d'accès choisi par le planificateur.
--
-- Idempotent : tout est en CREATE INDEX IF NOT EXISTS / DROP INDEX IF EXISTS,
-- et les suppressions sont gardées par un DO $$ qui vérifie que le remplaçant
-- existe réellement. Le fichier peut être rejoué autant de fois que voulu.
-- ============================================================================


-- ============================================================================
-- ⚠ MODE D'EMPLOI — À LIRE AVANT DE COLLER QUOI QUE CE SOIT
-- ============================================================================
--
-- POURQUOI CE FICHIER N'A NI « BEGIN » NI « COMMIT » :
--
--   `CREATE INDEX CONCURRENTLY` (et `DROP INDEX CONCURRENTLY`) est interdit
--   dans un bloc de transaction — Postgres renvoie :
--       ERROR: CREATE INDEX CONCURRENTLY cannot run inside a transaction block
--   Mécanisme : la construction concurrente se déroule en trois phases
--   séparées par des attentes de fin des transactions concurrentes
--   (indisready → deux scans de table → indisvalid). Chaque phase doit être
--   visible des autres sessions, donc committée : elle ne peut pas vivre dans
--   une transaction unique.
--
--   L'éditeur SQL de Supabase enveloppe un script multi-instructions dans UNE
--   transaction implicite. Coller tout ce fichier d'un bloc échouerait donc
--   dès la première instruction CONCURRENTLY. C'est la raison pour laquelle :
--     - la variante NON-CONCURRENTE est active (§1) ;
--     - la variante CONCURRENTE est fournie en commentaire (§1 bis), à lancer
--       UNE INSTRUCTION À LA FOIS, chacune seule dans l'éditeur.
--
-- QUELLE VARIANTE CHOISIR :
--
--   ┌──────────────────────────┬───────────────────────────────────────────┐
--   │ Volumétrie de la table   │ Variante                                  │
--   ├──────────────────────────┼───────────────────────────────────────────┤
--   │ < ~100 000 lignes        │ NON-CONCURRENTE (§1). Le verrou SHARE dure │
--   │                          │ quelques dizaines/centaines de ms.        │
--   │ > ~500 000 lignes, ou    │ CONCURRENTE (§1 bis), une instruction à   │
--   │ table écrite en continu  │ la fois, hors heure de pointe.            │
--   └──────────────────────────┴───────────────────────────────────────────┘
--
--   Différence de verrou :
--     - CREATE INDEX          → ShareLock : les LECTURES passent, toute
--                               ÉCRITURE (INSERT/UPDATE/DELETE) est bloquée
--                               pendant la construction.
--     - CREATE INDEX CONCURRENTLY → ShareUpdateExclusiveLock : lectures ET
--                               écritures passent, mais la construction est
--                               ~2× plus lente (deux passes de table) et peut
--                               échouer en laissant un index INVALIDE.
--
--   Mesurer avant de choisir (à lancer seul, c'est du SELECT pur) :
--     SELECT relname, n_live_tup
--     FROM pg_stat_user_tables
--     WHERE relname IN ('jobs','messages','notifications',
--                       'credit_transactions','reviews','profiles',
--                       'unlocked_leads')
--     ORDER BY n_live_tup DESC;
--
--   Sur LesCordistes aujourd'hui, ces tables sont très en dessous du seuil :
--   la variante NON-CONCURRENTE de §1 est le choix par défaut. Passer à
--   §1 bis uniquement si le SELECT ci-dessus contredit cette hypothèse.
--
-- SI UN « CONCURRENTLY » ÉCHOUE (timeout, deadlock, Ctrl-C) :
--   Postgres laisse un index en état INVALIDE — il n'est pas utilisé par le
--   planificateur mais il continue d'être maintenu à chaque écriture (le pire
--   des deux mondes). Le détecter et le nettoyer :
--     SELECT ic.relname
--     FROM pg_index i JOIN pg_class ic ON ic.oid = i.indexrelid
--     WHERE NOT i.indisvalid;
--     -- puis, pour chacun :  DROP INDEX CONCURRENTLY IF EXISTS <nom>;
--
-- PIÈGE `IF NOT EXISTS` :
--   `CREATE INDEX IF NOT EXISTS` compare le NOM, jamais la DÉFINITION. Un
--   index équivalent portant un autre nom ne sera pas détecté et un doublon
--   sera créé. L'inventaire des .sql du dépôt a été fait pour éviter ça
--   (cf. §3 pour les redondances déjà présentes) ; le bloc de vérification
--   final (§4) permet de contrôler qu'aucun doublon ne subsiste.
-- ============================================================================


-- ============================================================================
-- §0 — DIAGNOSTIC PRÉALABLE (optionnel, SELECT pur, à lancer séparément)
-- ============================================================================
-- Photographie de l'existant avant modification. À garder pour comparer après.
--
--   SELECT tablename, indexname, indexdef,
--          pg_size_pretty(pg_relation_size(indexname::regclass)) AS size
--   FROM pg_indexes
--   WHERE schemaname = 'public'
--     AND tablename IN ('jobs','messages','notifications','credit_transactions',
--                       'reviews','profiles','unlocked_leads')
--   ORDER BY tablename, indexname;


-- ============================================================================
-- §1 — INDEX MANQUANTS — VARIANTE NON-CONCURRENTE (ACTIVE)
--       Peut être collée d'un seul bloc : aucune instruction CONCURRENTLY ici.
-- ============================================================================

-- ── 1.1 jobs (created_by, created_at DESC) ──────────────────────────────────
-- POURQUOI : `jobs.created_by` est une clé étrangère vers profiles(id) et
-- n'était couverte par AUCUN index (le schéma ne crée que status, category,
-- location_department, created_at, slug, type, admin_created, freshness).
-- Deux mécanismes Postgres distincts en souffrent :
--   a) Chemin d'accès applicatif : ClientDashboard / ProDashboard / PublicProfile
--      /api/ops/users/[id] font tous `WHERE created_by = $1 ORDER BY created_at
--      DESC`. Sans index sur created_by, le planificateur n'a le choix qu'entre
--      un Seq Scan + Sort et un parcours complet de idx_jobs_created_at avec
--      filtre — les deux coûtent O(table) à chaque affichage de dashboard.
--   b) Vérification d'intégrité référentielle : `jobs.created_by REFERENCES
--      profiles(id)` est en NO ACTION. À chaque DELETE d'un profil, Postgres
--      exécute `SELECT 1 FROM jobs WHERE created_by = $1 FOR KEY SHARE`. Sans
--      index côté enfant, c'est un Seq Scan de `jobs` par ligne parente
--      supprimée. Idem pour `/api/delete-account` qui fait
--      `UPDATE jobs SET created_by = NULL WHERE created_by = $1`.
--   c) Quatre policies RLS filtrent sur cette colonne :
--      "Creators can view own jobs" (SELECT), "Creators can update own jobs"
--      (UPDATE), "Creators can delete own jobs" (DELETE) et "Users can update
--      own jobs" (UPDATE). Une policy est un qual ajouté à la requête : elle
--      bénéficie exactement du même index.
-- NOTE sur le DESC : sur un préfixe en égalité, un btree (created_by,
-- created_at) suffirait — Postgres sait le parcourir à l'envers. Le DESC est
-- écrit pour rendre l'intention lisible et éviter un nœud « Backward Index
-- Scan » dans les plans ; il n'a pas de coût.
CREATE INDEX IF NOT EXISTS idx_jobs_created_by_created_at
    ON public.jobs (created_by, created_at DESC);

-- ── 1.2 messages (conversation_id, created_at) ──────────────────────────────
-- POURQUOI : l'index existant `idx_messages_conversation_id` est mono-colonne.
-- Le fil de discussion se lit toujours en `WHERE conversation_id = $1 ORDER BY
-- created_at` : avec un index mono-colonne, le planificateur n'a AUCUN chemin
-- ordonné disponible — il est obligé de matérialiser toutes les lignes de la
-- conversation puis d'ajouter un nœud Sort (Sort sur disque dès que le fil
-- dépasse work_mem).
-- Le composite rend possible un parcours DÉJÀ TRIÉ. Nuance honnête sur ce que
-- fait réellement le planificateur (vérifié en EXPLAIN) :
--   - avec un LIMIT (fil paginé, chargement initial) → « Index Scan using
--     idx_messages_conversation_created_at », plus aucun Sort : le LIMIT
--     devient un arrêt anticipé du parcours. C'est le gain visé.
--   - sans LIMIT et sur un fil court → le planificateur peut continuer de
--     préférer Bitmap Heap Scan + Sort, qui reste moins cher sur peu de lignes.
--     Ce n'est pas une régression : il choisit alors le vrai moins-disant.
-- Le composite couvre par ailleurs tous les usages de l'ancien mono-colonne,
-- qui devient strictement redondant (supprimé en §3.3).
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created_at
    ON public.messages (conversation_id, created_at);

-- ── 1.3 messages (conversation_id) WHERE read_at IS NULL ────────────────────
-- POURQUOI : deux chemins réels dans le code (vérifiés en source) :
--   - `markAsRead` (src/hooks/useMessaging.ts:143) fait
--     `.eq('conversation_id', convId).is('read_at', null).neq('sender_id', me)`
--     → `WHERE conversation_id = $1 AND read_at IS NULL AND sender_id <> $2`,
--     qui correspond exactement à cet index (vérifié : Index Scan using
--     idx_messages_unread_by_conversation).
--   - `useUnreadCount` (src/hooks/useUnreadCount.ts:62) ne filtre PAS sur
--     conversation_id : il fait `count(*) WHERE read_at IS NULL AND
--     sender_id <> $1` et laisse la policy RLS « Participants can view
--     messages » poser le semi-join sur conversations. L'index sert alors de
--     côté interne du Nested Loop (Index Cond: conversation_id = c.id).
-- Les messages non lus sont une fraction minuscule de la table : un index
-- PARTIEL n'indexe que ces lignes-là, donc il reste petit et tient en cache.
-- Le prédicat `read_at IS NULL` est littéralement celui de la requête, donc
-- `predicate_implied_by` le prouve trivialement et l'index est éligible.
-- Effet de bord bénéfique : quand un message est marqué lu (read_at passe de
-- NULL à une date), la ligne SORT de l'index — l'index rétrécit tout seul.
CREATE INDEX IF NOT EXISTS idx_messages_unread_by_conversation
    ON public.messages (conversation_id)
    WHERE read_at IS NULL;

-- ── 1.4 messages (sender_id) ────────────────────────────────────────────────
-- POURQUOI : `sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE` sans
-- index côté enfant. La cascade n'est pas magique : à chaque suppression d'un
-- profil, Postgres exécute `DELETE FROM messages WHERE sender_id = $1`. Sans
-- index, c'est un Seq Scan complet de `messages`, sous verrou, pour chaque
-- profil supprimé (suppression de compte RGPD, purge admin). Le coût est
-- invisible au quotidien et brutal le jour où il se déclenche.
CREATE INDEX IF NOT EXISTS idx_messages_sender_id
    ON public.messages (sender_id);

-- ── 1.5 notifications (user_id, created_at DESC) ────────────────────────────
-- POURQUOI : useNotifications fait `WHERE user_id = $1 ORDER BY created_at
-- DESC LIMIT 20` (pagination par tranches de 20). L'index existant
-- `idx_notifications_user_id` localise les lignes mais n'apporte aucun ordre :
-- le planificateur doit lire TOUTES les notifications de l'utilisateur puis
-- trier pour n'en garder que 20. Avec le composite, la clause LIMIT devient un
-- simple arrêt anticipé du parcours d'index — coût O(20) au lieu de O(n).
-- ATTENTION : `idx_notifications_read (user_id, read)` n'est PAS redondant
-- avec celui-ci (deuxième colonne différente) et est conservé tel quel.
CREATE INDEX IF NOT EXISTS idx_notifications_user_created_at
    ON public.notifications (user_id, created_at DESC);

-- ── 1.6 credit_transactions (type, created_at DESC) ─────────────────────────
-- POURQUOI : le RPC `admin_sum_transactions(p_type, p_since)` (migration
-- 20260610) fait `WHERE type = $1 AND (p_since IS NULL OR created_at >= $2)`.
-- Deux index mono-colonnes existent (`idx_credit_transactions_type` et
-- `idx_credit_transactions_created_at`) : le planificateur ne peut alors que
-- choisir l'un des deux et filtrer le reste, ou tenter un BitmapAnd qui relit
-- deux index entiers. Le composite (type, created_at) permet une seule
-- descente d'arbre : égalité sur type, puis intervalle sur created_at.
-- Conséquence : `idx_credit_transactions_type` devient un préfixe redondant
-- de ce nouvel index (voir §3.5, laissé volontairement en commentaire).
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type_created_at
    ON public.credit_transactions (type, created_at DESC);

-- ── 1.7 credit_transactions (job_id) ────────────────────────────────────────
-- POURQUOI : `job_id UUID REFERENCES jobs(id) ON DELETE SET NULL` sans index.
-- Le SET NULL déclenche `UPDATE credit_transactions SET job_id = NULL WHERE
-- job_id = $1` à chaque suppression de mission → Seq Scan de tout l'historique
-- de crédits. C'est le chemin exact emprunté par une purge admin de missions.
CREATE INDEX IF NOT EXISTS idx_credit_transactions_job_id
    ON public.credit_transactions (job_id);

-- ── 1.8 reviews (client_id) ─────────────────────────────────────────────────
-- POURQUOI : `reviews` n'a que `idx_reviews_pro_id`. `client_id UUID
-- REFERENCES profiles(id) ON DELETE CASCADE` est la deuxième FK vers profiles
-- et n'est pas indexée → Seq Scan de `reviews` à chaque suppression de compte
-- client, en plus de rendre coûteux tout listing « mes avis déposés ».
CREATE INDEX IF NOT EXISTS idx_reviews_client_id
    ON public.reviews (client_id);

-- ── 1.9 jobs (moderated_by) WHERE moderated_by IS NOT NULL ──────────────────
-- POURQUOI : `moderated_by UUID REFERENCES profiles(id)` (NO ACTION) n'est pas
-- indexée → la vérification d'intégrité à la suppression d'un profil admin
-- scanne toute la table `jobs`. Le script `supabase-cleanup-admin.sql` fait en
-- plus explicitement `DELETE FROM jobs WHERE created_by = $1 OR moderated_by
-- = $1`.
-- Pourquoi PARTIEL : la très grande majorité des missions n'a jamais été
-- modérée manuellement (moderated_by NULL). Un index partiel exclut ces lignes
-- et ne stocke que la minorité utile. Il reste utilisable pour
-- `moderated_by = $1` : l'opérateur `=` est STRICT, donc Postgres prouve que
-- la clause implique `moderated_by IS NOT NULL` et autorise l'index partiel.
CREATE INDEX IF NOT EXISTS idx_jobs_moderated_by
    ON public.jobs (moderated_by)
    WHERE moderated_by IS NOT NULL;

-- ── 1.10 profiles (lower(email)) ────────────────────────────────────────────
-- POURQUOI : le RPC `find_pro_alert_matches` (version courante :
-- 20260504-pro-alerts-auto-from-profile-zones.sql) joint `profiles` et
-- `pro_alert_subscriptions` sur `lower(s.email) = lower(p.email)` — deux fois :
--   - étape 1, dans le NOT EXISTS de l'auto-création de souscriptions ;
--   - étape 2, dans `UPDATE pro_alert_subscriptions s ... FROM profiles p
--     WHERE lower(s.email) = lower(p.email)`.
-- Côté souscriptions, `idx_pro_alert_subs_email_lower` existe déjà. Côté
-- profils, RIEN : la contrainte `email TEXT UNIQUE` crée bien un index, mais
-- sur l'expression brute `email`, PAS sur `lower(email)`. Un index btree ne
-- sert que si l'expression indexée est syntaxiquement celle de la requête —
-- `lower(email)` ne peut donc pas l'utiliser, et le cron retombe sur un Seq
-- Scan de `profiles` avec calcul de lower() ligne à ligne à chaque exécution.
-- NON-UNIQUE volontairement : `email` est unique en sensible à la casse. Deux
-- profils 'A@x.fr' et 'a@x.fr' sont légaux aujourd'hui ; un index UNIQUE sur
-- lower(email) échouerait à la création dans ce cas et changerait la sémantique
-- d'écriture. On indexe, on ne contraint pas.
CREATE INDEX IF NOT EXISTS idx_profiles_email_lower
    ON public.profiles (lower(email));


-- ============================================================================
-- §1 bis — MÊMES INDEX — VARIANTE CONCURRENTE
--
--   À utiliser SEULEMENT si §0 montre une table volumineuse ou fortement
--   écrite. Dans ce cas : ne PAS lancer §1, décommenter ci-dessous et exécuter
--   LES INSTRUCTIONS UNE PAR UNE, chacune seule dans l'éditeur SQL Supabase
--   (sinon : « cannot run inside a transaction block »).
--   Les deux variantes produisent des index de nom identique : elles sont
--   mutuellement exclusives, pas cumulatives (le IF NOT EXISTS protège de
--   toute façon d'un double passage).
-- ============================================================================
--
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_created_by_created_at
--     ON public.jobs (created_by, created_at DESC);
--
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation_created_at
--     ON public.messages (conversation_id, created_at);
--
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_unread_by_conversation
--     ON public.messages (conversation_id) WHERE read_at IS NULL;
--
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_sender_id
--     ON public.messages (sender_id);
--
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_created_at
--     ON public.notifications (user_id, created_at DESC);
--
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_credit_transactions_type_created_at
--     ON public.credit_transactions (type, created_at DESC);
--
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_credit_transactions_job_id
--     ON public.credit_transactions (job_id);
--
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_client_id
--     ON public.reviews (client_id);
--
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_moderated_by
--     ON public.jobs (moderated_by) WHERE moderated_by IS NOT NULL;
--
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_email_lower
--     ON public.profiles (lower(email));


-- ============================================================================
-- §2 — INDEX ÉTUDIÉ PUIS ÉCARTÉ : listing public de /jobs
-- ============================================================================
--
--   Candidat :
--     CREATE INDEX idx_jobs_public_listing ON public.jobs (created_at DESC)
--       WHERE status IN ('live','expired','completed');
--
--   Ce qu'il ferait techniquement : la policy « Jobs are viewable by everyone »
--   (20260430-jobs-public-completed.sql) injecte exactement le qual
--   `status IN ('live','expired','completed')` dans toute lecture anon /
--   authenticated. Écrit à l'identique, ce prédicat serait prouvé par
--   `predicate_implied_by` (égalité structurelle du ScalarArrayOpExpr) et
--   l'index servirait le `ORDER BY created_at DESC LIMIT n` de /jobs.
--
--   POURQUOI ON L'ÉCARTE — l'argument est la SÉLECTIVITÉ :
--   un index partiel n'a d'intérêt que si son prédicat élimine une grosse part
--   de la table. Ici il conserve 'live' + 'expired' + 'completed' et n'exclut
--   que 'pending', 'rejected' et 'cancelled' — soit une minorité résiduelle sur
--   une marketplace où l'écrasante majorité des missions finit publiée. On
--   paierait donc :
--     - un second index quasi de la taille de `idx_jobs_created_at` (déjà
--       présent, `(created_at DESC)` sur toute la table) ;
--     - une écriture de plus par INSERT de mission ;
--     - et surtout des entrées d'index à insérer/supprimer à CHAQUE transition
--       de statut (pending → live, live → expired), là où un index non partiel
--       n'aurait rien à faire. C'est aussi un frein aux mises à jour HOT.
--   Pour un gain marginal : `idx_jobs_created_at` fournit déjà l'ordre, et le
--   filtre sur status élimine peu de lignes en cours de parcours.
--
--   QUAND LE RECONSIDÉRER — critère chiffré, à re-tester plus tard :
--     EXPLAIN (ANALYZE, BUFFERS)
--     SELECT id, title, created_at FROM public.jobs
--     WHERE status IN ('live','expired','completed')
--     ORDER BY created_at DESC LIMIT 24;
--   Le créer si, et seulement si, `jobs` dépasse ~100 000 lignes ET que ce plan
--   montre un « Rows Removed by Filter » du même ordre que le nombre de lignes
--   renvoyées (signe que le statut non public est devenu significatif).
--   Volontairement laissé NON CRÉÉ ici.


-- ============================================================================
-- §3 — SUPPRESSION DES INDEX REDONDANTS
--
--   Mécanisme : un index btree sur (a) est strictement inclus dans un index
--   btree sur (a, b) — le planificateur sait descendre dans le composite en ne
--   contraignant que sa première colonne. Le mono-colonne n'apporte alors rien
--   qu'un peu moins de pages à lire, au prix d'une écriture d'index de plus à
--   chaque INSERT/UPDATE et d'un objet de plus à VACUUM.
--
--   Chaque DROP est gardé par un DO $$ qui vérifie que le remplaçant existe
--   ET est valide : si §1 n'a pas été joué, ou si un CONCURRENTLY a échoué,
--   rien n'est supprimé et un NOTICE l'explique. Aucun risque de dégrader.
--   DROP INDEX (non concurrent) prend un AccessExclusiveLock très bref sur la
--   table ; sur une table chaude, préférer `DROP INDEX CONCURRENTLY IF EXISTS
--   <nom>;` lancé seul (interdit lui aussi en transaction, donc hors DO $$).
-- ============================================================================

-- ── 3.1 idx_unlocked_leads_pro ──────────────────────────────────────────────
-- Redondant avec l'index implicite de la contrainte `UNIQUE(pro_id, job_id)`
-- déclarée à la création de `unlocked_leads` : cet index unique commence par
-- pro_id, il couvre donc toutes les recherches `WHERE pro_id = $1`.
-- La contrainte, elle, n'est pas touchée — on ne supprime que l'index en
-- doublon (supprimer l'index de contrainte serait impossible sans DROP
-- CONSTRAINT, ce que ce fichier ne fait jamais).
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_index i
        WHERE i.indrelid = 'public.unlocked_leads'::regclass
          AND i.indisunique
          AND i.indisvalid
          AND pg_get_indexdef(i.indexrelid) LIKE '%(pro_id, job_id)%'
    ) THEN
        DROP INDEX IF EXISTS public.idx_unlocked_leads_pro;
        RAISE NOTICE 'idx_unlocked_leads_pro supprimé (couvert par UNIQUE(pro_id, job_id)).';
    ELSE
        RAISE NOTICE 'idx_unlocked_leads_pro CONSERVÉ : aucun index unique (pro_id, job_id) trouvé.';
    END IF;
END $$;

-- ── 3.2 idx_jobs_slug ───────────────────────────────────────────────────────
-- Redondant avec l'index implicite de `ALTER TABLE jobs ADD COLUMN slug TEXT
-- UNIQUE` (supabase-migrations-mvp.sql), qui crée `jobs_slug_key`.
-- PRUDENCE : `supabase-fix-all.sql` contient aussi `ADD COLUMN IF NOT EXISTS
-- slug TEXT` SANS le UNIQUE. Selon l'ordre réel d'exécution manuelle de ces
-- deux scripts, la contrainte unique peut ne jamais avoir été posée. On ne
-- supprime donc l'index QUE si un index unique sur (slug) est effectivement
-- présent — sinon `idx_jobs_slug` est le seul chemin d'accès par slug (pages
-- /missions/[slug]) et le supprimer serait cassant.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_index i
        JOIN pg_class ic ON ic.oid = i.indexrelid
        WHERE i.indrelid = 'public.jobs'::regclass
          AND i.indisunique
          AND i.indisvalid
          AND ic.relname <> 'idx_jobs_slug'
          AND pg_get_indexdef(i.indexrelid) LIKE '%(slug)%'
    ) THEN
        DROP INDEX IF EXISTS public.idx_jobs_slug;
        RAISE NOTICE 'idx_jobs_slug supprimé (couvert par la contrainte UNIQUE sur slug).';
    ELSE
        RAISE NOTICE 'idx_jobs_slug CONSERVÉ : aucun index UNIQUE sur jobs(slug) détecté — c''est le seul accès par slug.';
    END IF;
END $$;

-- ── 3.3 idx_messages_conversation_id ────────────────────────────────────────
-- Préfixe strict de idx_messages_conversation_created_at créé en §1.2.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_index i ON i.indexrelid = c.oid
        WHERE c.relname = 'idx_messages_conversation_created_at'
          AND c.relnamespace = 'public'::regnamespace
          AND i.indisvalid
    ) THEN
        DROP INDEX IF EXISTS public.idx_messages_conversation_id;
        RAISE NOTICE 'idx_messages_conversation_id supprimé (préfixe du composite).';
    ELSE
        RAISE NOTICE 'idx_messages_conversation_id CONSERVÉ : le composite (conversation_id, created_at) est absent ou invalide.';
    END IF;
END $$;

-- ── 3.4 idx_notifications_user_id ───────────────────────────────────────────
-- Préfixe strict de idx_notifications_user_created_at créé en §1.5 (et aussi
-- de idx_notifications_read (user_id, read), déjà présent avant ce fichier).
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_index i ON i.indexrelid = c.oid
        WHERE c.relname = 'idx_notifications_user_created_at'
          AND c.relnamespace = 'public'::regnamespace
          AND i.indisvalid
    ) THEN
        DROP INDEX IF EXISTS public.idx_notifications_user_id;
        RAISE NOTICE 'idx_notifications_user_id supprimé (préfixe du composite).';
    ELSE
        RAISE NOTICE 'idx_notifications_user_id CONSERVÉ : le composite (user_id, created_at) est absent ou invalide.';
    END IF;
END $$;

-- ── 3.5 idx_credit_transactions_type — REDONDANCE SIGNALÉE, NON SUPPRIMÉE ───
-- `idx_credit_transactions_type (type)` devient un préfixe strict de
-- `idx_credit_transactions_type_created_at (type, created_at DESC)` créé en
-- §1.6, donc techniquement supprimable au même titre que 3.3 et 3.4.
-- Laissé ACTIF volontairement : cette suppression ne figurait pas au périmètre
-- validé de la migration. À décommenter dans une passe ultérieure, après avoir
-- constaté en §4 que le composite est bien utilisé (idx_scan qui progresse).
--
-- DO $$
-- BEGIN
--     IF EXISTS (
--         SELECT 1 FROM pg_class c
--         JOIN pg_index i ON i.indexrelid = c.oid
--         WHERE c.relname = 'idx_credit_transactions_type_created_at'
--           AND c.relnamespace = 'public'::regnamespace
--           AND i.indisvalid
--     ) THEN
--         DROP INDEX IF EXISTS public.idx_credit_transactions_type;
--     END IF;
-- END $$;


-- ============================================================================
-- §4 — VÉRIFICATION (SELECT purs — à lancer après coup, séparément)
-- ============================================================================

-- 4.1 — Les 10 index attendus existent-ils, et sont-ils VALIDES ?
--       `valid = false` = CONCURRENTLY interrompu → à DROP puis recréer.
SELECT
    expected.name                                        AS index_attendu,
    (c.oid IS NOT NULL)                                  AS cree,
    COALESCE(i.indisvalid, false)                        AS valide,
    COALESCE(pg_size_pretty(pg_relation_size(c.oid)), '-') AS taille
FROM (VALUES
    ('idx_jobs_created_by_created_at'),
    ('idx_messages_conversation_created_at'),
    ('idx_messages_unread_by_conversation'),
    ('idx_messages_sender_id'),
    ('idx_notifications_user_created_at'),
    ('idx_credit_transactions_type_created_at'),
    ('idx_credit_transactions_job_id'),
    ('idx_reviews_client_id'),
    ('idx_jobs_moderated_by'),
    ('idx_profiles_email_lower')
) AS expected(name)
LEFT JOIN pg_class c
       ON c.relname = expected.name
      AND c.relnamespace = 'public'::regnamespace
LEFT JOIN pg_index i ON i.indexrelid = c.oid
ORDER BY cree, expected.name;

-- 4.2 — Les 4 index redondants ont-ils bien disparu ?
--       Toute ligne renvoyée = suppression non effectuée (voir les NOTICE de §3).
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname IN (
      'idx_unlocked_leads_pro',
      'idx_jobs_slug',
      'idx_messages_conversation_id',
      'idx_notifications_user_id'
  );

-- 4.3 — Usage réel des nouveaux index.
--       pg_stat_user_indexes.idx_scan = nombre de fois où le PLANIFICATEUR a
--       effectivement choisi l'index. Les compteurs partent de 0 : les relire
--       après quelques jours de trafic réel. Un idx_scan qui reste à 0 après
--       une semaine = index à supprimer (il ne fait que ralentir les écritures).
SELECT
    relname                AS nom_table,
    indexrelname           AS nom_index,
    idx_scan               AS parcours,
    idx_tup_read           AS lignes_lues,
    idx_tup_fetch          AS lignes_recuperees,
    pg_size_pretty(pg_relation_size(indexrelid)) AS taille
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND relname IN ('jobs','messages','notifications','credit_transactions',
                  'reviews','profiles','unlocked_leads')
ORDER BY idx_scan ASC, pg_relation_size(indexrelid) DESC;

-- 4.4 — Aucun index invalide (résidu d'un CONCURRENTLY interrompu) ?
SELECT ic.relname AS index_invalide, t.relname AS sur_table
FROM pg_index i
JOIN pg_class ic ON ic.oid = i.indexrelid
JOIN pg_class t  ON t.oid  = i.indrelid
WHERE NOT i.indisvalid
  AND ic.relnamespace = 'public'::regnamespace;

-- 4.5 — Contrôle avant/après sur les plans les plus sensibles.
--
--       (a) Dashboard client/pro. Attendu : le nœud le plus bas cite
--       idx_jobs_created_by_created_at (Index Scan ou Bitmap Index Scan) au lieu
--       d'un « Seq Scan on jobs ». C'est LE point à vérifier : la disparition du
--       Seq Scan. Un « Bitmap Heap Scan + Sort » au-dessus reste un bon plan
--       quand le client a peu de missions — le tri de quelques dizaines de
--       lignes coûte moins qu'un parcours d'index ordonné.
-- EXPLAIN (ANALYZE, BUFFERS)
-- SELECT id, title, status, created_at FROM public.jobs
-- WHERE created_by = '<uuid-client>' ORDER BY created_at DESC;
--
--       (b) Fil de discussion. ⚠ La requête réelle de l'app
--       (src/hooks/useMessaging.ts:74) n'a AUCUN `LIMIT` :
--         .eq('conversation_id', id).order('created_at', { ascending: true })
--       Sur un fil court le planificateur garde donc « Bitmap Index Scan using
--       idx_messages_conversation_created_at → Sort » — c'est le vrai
--       moins-disant, PAS une régression (vérifié sur 40 000 messages / fils de
--       80 : le Sort subsiste et coûte ~0,1 ms). Attendu ici : le nœud d'accès
--       cite bien le composite. Le Sort ne disparaît (« Limit → Index Scan »)
--       que si un LIMIT est un jour ajouté côté app — c'est ce que teste la
--       deuxième requête, à ne pas confondre avec le comportement actuel.
-- EXPLAIN (ANALYZE, BUFFERS)
-- SELECT * FROM public.messages
-- WHERE conversation_id = '<uuid-conv>' ORDER BY created_at ASC;
-- -- variante prospective (si un LIMIT est ajouté au front un jour) :
-- EXPLAIN (ANALYZE, BUFFERS)
-- SELECT id, content, created_at FROM public.messages
-- WHERE conversation_id = '<uuid-conv>' ORDER BY created_at LIMIT 50;
--
--       (c) Cloche de notifications. Même forme que (b) : le LIMIT 20 doit
--       produire un Index Scan sur idx_notifications_user_created_at, sans Sort.
-- EXPLAIN (ANALYZE, BUFFERS)
-- SELECT * FROM public.notifications
-- WHERE user_id = '<uuid-user>' ORDER BY created_at DESC LIMIT 20;

-- ============================================================================
-- FIN — 20260828c
-- ============================================================================
