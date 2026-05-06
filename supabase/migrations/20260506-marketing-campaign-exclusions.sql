-- Permet d'exclure manuellement des contacts d'une campagne marketing avant l'envoi.
-- La liste est posée par l'admin depuis la page de détail (étape "Prévisualiser") et
-- persistée pour audit. Filtrée par la route /send.

alter table public.marketing_campaigns
    add column if not exists excluded_contact_ids uuid[] not null default '{}';

comment on column public.marketing_campaigns.excluded_contact_ids is
    'Liste des contact_ids exclus manuellement par l''admin avant l''envoi de la campagne.';
