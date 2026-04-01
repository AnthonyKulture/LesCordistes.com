---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: []
session_topic: 'Refonte de l\'architecture : double profil Pro (Cordiste vs Recruteur)'
session_goals: 'Explorer les possibilités techniques et UX pour permettre à un professionnel (Pro) d\'agir à la fois comme exécutant (postuler à des missions) et comme recruteur (publier des missions pour d\'autres pros), tout en gardant une interface claire.'
selected_approach: 'progressive-flow'
techniques_used: ['First Principles Thinking', 'Morphological Analysis', 'Solution Matrix', 'Decision Tree Mapping']
ideas_generated: 7
context_file: ''
---

## Session Overview

**Topic:** Refonte de l'architecture : double profil Pro (Cordiste vs Recruteur)
**Goals:** Explorer les possibilités techniques et UX pour permettre à un professionnel (Pro) d'agir à la fois comme exécutant (postuler à des missions) et comme recruteur (publier des missions pour d'autres pros), tout en gardant une interface claire.

### Session Setup

L'objectif de cette session est de déterminer la meilleure approche pour gérer ce double rôle :
1. Faut-il un seul compte "Super Pro" ou deux profils séparés sous le même compte ?
2. Comment adapter l'interface (tableaux de bord) et la base de données (table `profiles`) ?
3. Quelles sont les conséquences sur les crédits, abonnements et facturation ?

## Technique Selection

**Approach:** Progressive Technique Flow
**Journey Design:** Développement systématique de l'exploration à l'action.

**Progressive Techniques:**

- **Phase 1 - Exploration:** [First Principles Thinking]
- **Phase 2 - Reconnaissance de modèles:** [Morphological Analysis]
- **Phase 3 - Développement:** [Solution Matrix] pour confronter les approches au nouveau besoin.
- **Phase 4 - Plan d'action:** [Decision Tree Mapping] pour définir l'architecture cible.

## Technique Execution Results

### Phase 1: First Principles Thinking

*   **[Idea #1]**: Le Switcher façon Instagram/LinkedIn (UX). Un seul compte, bouton pour basculer la vue.
*   **[Idea #2]**: Base de données. Role hybride vs Deux lignes.
*   **[Idea #3]**: Séparation des crédits. Le Pro paie pour postuler, pas pour publier.
*   **[Idea #4]**: L'Onboarding unifié. Cocher "Je sous-traite" à l'inscription.

### Phase 2: Morphological Analysis

*   **[Idea #5]**: Option A - Le booléen (1 ligne `profiles`). Facile à coder, mêle infos pros et recruteurs.
*   **[Idea #6]**: Option B - Le détachement (2 lignes `profiles`). Séparation stricte mais refonte totale du RLS.

### Phase 3: Solution Matrix (Confrontation au besoin utilisateur)

**Nouveau besoin crucial :** *"Je veux afficher sur les besoins le fait que ce soit posté par un Pro Cordistes."*

**[Idea #7]**: Le "Super-Pro" avec Rôle Unifié
*Concept*: Dans ce cas, **l'Option A** est de loin la plus logique et la moins chère à produire !
Si on garde 1 seule ligne `profile` avec `role: 'pro'`, quand il publie une mission, le `jobs.created_by` pointe vers ce profil Pro. 
Côté Frontend, quand on charge la mission, si le profil du créateur a `role === 'pro'`, on affiche automatiquement un badge VIP : *"😎 Mission sous-traitée par un de nos Cordistes Pros ({company_name}) !"*
Si on avait choisi l'Option B (créer un profil Client anonyme caché lié au Pro), il aurait été très difficile de relier cette mission au profil Pro public de l'entreprise.

### Phase 4: Action Planning (Decision Tree Mapping)

**Décision Finale Recommandée : OPTION A (Modèle Hybride / Super-Pro)**

**Plan d'Action Architecturale :**

1.  **Base de données (`profiles`) :**
    *   Le Pro garde son rôle `pro`.
    *   On ajoute peut-être juste un flag `is_recruiter: boolean` (ou `is_hybrid: true`) pour lui débloquer l'UI recruteur.
2.  **Base de données (`jobs`) :**
    *   Les RLS de RLS de `jobs` (create/update) qui n'autorisaient que `role === 'client'` doivent être modifiées pour autoriser aussi `role === 'pro'`.
3.  **Expérience Utilisateur (UX) - Le "Switcher" :**
    *   On garde le `ProDashboard`.
    *   On ajoute un bouton en haut : **"Passer en mode Mode Recrutement"**. 
    *   Ce bouton bascule un state React (`currentView = 'client'`). L'interface affiche alors le `ClientDashboard` à la place, avec ses annonces postées, ses messages de candidats, etc.
4.  **Expérience Candidat (UX) :**
    *   Sur la page `JobDetail`, si le créateur du job a le rôle 'pro', on modifie l'UI pour afficher un badge de réassurance très fort "Mission de Confrère : Poste par l'entreprise X".
5.  **Crédits & Paiement :**
    *   Publier un chantier reste gratuit.
    *   Les "Leads Débloqués" n'interfèrent pas avec ses propres annonces, puisqu'il ne paie pas pour ses propres annonces.

**Conclusion BMAD :**
L'Option A est le choix le plus pragmatique, le moins risqué techniquement, et celui qui répond parfaitement à l'objectif de mettre en valeur les Pros qui sous-traitent à d'autres Pros.
