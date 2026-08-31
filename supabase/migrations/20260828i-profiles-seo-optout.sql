-- ============================================================================
-- Opt-out SEO des profils pro
--
-- CONTEXTE : /pros/[id] est passé d'un rendu 100 % client (Google ne voyait
-- qu'un écran de chargement vide) à un rendu serveur indexable. C'est un
-- CHANGEMENT DE FINALITÉ pour une donnée personnelle : le nom, la photo et la
-- ville d'un professionnel passent d'une visibilité applicative à une diffusion
-- publique référencée par un moteur de recherche.
--
-- Le seuil de contenu (`isProfileIndexable`, bio ≥ 150 caractères + 2 sections)
-- limite déjà la diffusion aux profils réellement rédigés — soit un acte de
-- publication volontaire du pro. Mais il ne remplace pas un droit d'opposition
-- explicite : cette colonne le matérialise.
--
-- DÉFAUT `true` assumé : LesCordistes est un annuaire professionnel, un cordiste
-- s'y inscrit pour être trouvé. Un défaut `false` rendrait la fonctionnalité
-- inerte (personne ne découvrirait le réglage) sans bénéfice réel de protection,
-- puisque le gate de contenu joue déjà ce rôle.
--
-- Reste à faire côté produit, HORS de cette migration :
--   · un interrupteur « Rendre mon profil visible dans les moteurs de recherche »
--     sur la page profil, écrivant dans cette colonne ;
--   · une mention dans la politique de confidentialité.
-- Tant que l'interrupteur n'existe pas, un retrait se traite à la main :
--   UPDATE public.profiles SET seo_indexable = false WHERE id = '<uuid>';
-- ============================================================================

BEGIN;

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS seo_indexable boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.profiles.seo_indexable IS
'Droit d''opposition du pro à l''indexation de sa page publique /pros/{id}. '
'false = jamais indexé ni listé au sitemap, quel que soit le contenu du profil.';

-- Lisible par anon : le sitemap et le rendu serveur de /pros/[id] en ont besoin
-- pour décider de l'indexation. Ne révèle rien de personnel.
GRANT SELECT (seo_indexable) ON public.profiles TO anon;

-- Le pro doit pouvoir modifier son propre réglage (la policy RLS
-- « Users can update own profile » restreint déjà à sa propre ligne).
GRANT UPDATE (seo_indexable) ON public.profiles TO authenticated;

COMMIT;

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================
-- Colonne créée, tous les profils opt-in par défaut :
--   SELECT seo_indexable, count(*) FROM public.profiles GROUP BY 1;
--
-- Lisible en anon :
--   BEGIN; SET LOCAL role anon;
--   SELECT id, seo_indexable FROM public.profiles WHERE role = 'pro' LIMIT 1;
--   ROLLBACK;
--
-- Retrait manuel d'un pro qui le demande :
--   UPDATE public.profiles SET seo_indexable = false WHERE id = '<uuid>';
--   → la page passe en noindex au prochain revalidate (60 s) et sort du
--     sitemap au prochain (≤ 1 h).
-- ============================================================================
