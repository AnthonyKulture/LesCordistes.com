---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-12-complete']
inputDocuments: ['_bmad-output/brainstorming/brainstorming-session-2026-03-20-00-05.md']
workflowType: 'prd'
---

# Product Requirements Document - Double Profil Pro (Recruteur)

**Author:** Anthony
**Date:** 2026-03-20

## Executive Summary

Transformer *LesCordistes* en plateforme de pair à pair en permettant aux Pros de sous-traiter des missions. Cette fonctionnalité lève les barrières de l'anonymat dans un secteur à haut risque où la cooptation est primordiale.

### Vision & Différenciateur
- **Compte Unifié :** Switcher fluide entre les vues "Worker" et "Recruteur" (modèle Upwork).
- **Badge de Confiance :** Réassurance immédiate via le badge "Mission postée par un Confrère Pro".

## Project Classification

- **Type :** Web App & B2B SaaS (Brownfield)
- **Domaine :** BTP / Services Spécialisés
- **Complexité :** Moyenne (Sessions hybrides & RLS)

## Success Criteria

### Objectifs Utilisateurs
- **Aha! Moment :** Publication d'une mission en mode Recruteur sans friction depuis un compte Pro existant.
- **Conversion :** X% des Pros actifs publient au moins 1 mission sous 30 jours après utilisation du switcher.

### Objectifs Business
- **Volume :** Augmentation de X% des annonces globales grâce à l'apport de la sous-traitance.
- **Confiance :** Taux de réponse supérieur sur les annonces badgées "Confrère Pro".

### Objectifs Techniques
- Zéro régression sur les comptes clients existants.
- Transition de permissions frontend/backend immédiate lors du switch.

## Product Scope

### Phase 1 : MVP (Essentiel)
- Switcher UX dans la navigation ProDashboard.
- Autorisation RLS Supabase pour le rôle Pro sur la table `jobs`.
- Intégration des vues ClientDashboard dans le contexte Pro.
- Affichage du badge "Confrère Pro" sur le JobBoard.

### Phase 2 : Croissance (Post-MVP)
- Préférences de notifications granulaires (Jobs vs Candidatures).
- Portefeuille de facturation unifié avec distinction des flux.
- Onboarding optionnel ("Je sous-traite") lors de l'inscription Pro.

### Phase 3 : Vision (Futur)
- Système de notation pair à pair.
- Gestion multi-entités juridiques par compte.

## User Journeys

### 1. Le Pro Débordé (Success Path)
Julien, chef d'entreprise, manque de bras. Il switche en mode Recruteur, publie son offre pré-remplie avec ses infos Pro, et reçoit des candidatures de confrères fiables en moins d'une heure.

### 2. Le Pro Candidat (Réassurance)
Sarah, indépendante, privilégie les annonces badgées "Confrère Pro". Elle sait que le cahier des charges sera techniquement réaliste et sécurisé car rédigé par un pair.

### 3. La Réouverture Express (Edge Case)
Julien subit un désistement de dernière minute. Il rouvre sa mission instantanément depuis son dashboard Recruteur, sans frais supplémentaire, sauvant ainsi son chantier.

### 4. Modération Prioritaire (Admin)
L'administrateur identifie les missions créées par les Pros. Il les valide prioritairement car les pré-requis techniques sont naturellement maîtrisés par l'émetteur.

## Spécifications Techniques

### Permissions & RBAC
- **Supabase RLS :** Extension des droits `INSERT`/`UPDATE` on `jobs` to the `pro` role.
- **View Context :** Gestion d'un `dashboardMode` ('worker'|'recruiter') persisté pour dicter le rendu React.

### Modèle de Facturation
- **Publication gratuite :** Gratuité maintenue pour tous (Pros et Clients) pour maximiser le volume.
- **Crédits Leads :** Le système de crédits existant reste réservé aux actions du mode "Worker".

### Tenant Model
- **Mapping 1:1 :** 1 Compte = 1 Profil = 1 Entreprise (MVP).

## Functional Requirements

### 1. Switcher UX
- **FR1 :** L'utilisateur Pro peut basculer de mode via un sélecteur dans la navigation.
- **FR2 :** Le système persiste le mode actif (localStorage/URL) entre les sessions.
- **FR3 :** Le changement de mode met à jour dynamiquement la sidebar et le Dashboard.

### 2. Mode Recruteur
- **FR4 :** Le Pro peut accéder au formulaire `PostJob`.
- **FR5 :** Le formulaire auto-complète les champs de contact via le profil Pro.
- **FR6 :** Le Pro gère ses annonces et expose les candidatures reçues via les vues ClientDashboard adaptées.
- **FR7 :** Le Pro peut rouvrir une mission clôturée sans frais.

### 3. JobBoard & Confiance
- **FR8 :** Affichage d'un badge "Posté par un Confrère" sur les annonces émises par des Pros.
- **FR9 :** Affichage de l'identité Pro de l'émetteur dans `JobDetail`.

### 4. Admin
- **FR10 :** Identification visuelle du créateur Pro dans le back-office de modération.

## Non-Functional Requirements

### 1. Performance
- **NFR1 :** Switch de Dashboard en moins de 500ms via le state React.
- **NFR2 :** Affichage des badges sur le JobBoard sans impact sur le temps de chargement de la liste.

### 2. Sécurité
- **NFR3 :** Isolation stricte : Un Pro ne modifie que ses propres missions (RLS).
- **NFR4 :** Étanchéité fonctionnelle entre les actions "Recruteur" et "Worker".

### 3. Fiabilité
- **NFR5 :** Message d'erreur explicite et repli sécurisé en cas d'échec du switch.
