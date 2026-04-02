# BMAD Design - Transition Premium de Mode (Switcher)

Ce document définit l'architecture UX/UI pour le basculement entre les modes Cordiste et Recruteur, incluant un "force refresh" visuel.

## 1. Objectifs
- **Fiabilité :** Garantir que l'interface se recharge complètement pour éviter les bugs d'affichage.
- **WOW Effect :** Créer une transition haut de gamme qui renforce l'aspect professionel de la plateforme.
- **Feedback :** Donner à l'utilisateur une confirmation visuelle claire du changement de contexte.

## 2. Spécifications du "Premium Loader"
L'interface de chargement pendant la transition utilisera les codes du "Glassmorphism" et des animations fluides :
- **Fond :** Overlay sombre avec un flou gaussien (backdrop-blur) très prononcé.
- **Animation :** Un "Pulse" ou un morphing d'icône passant de la Mallette (Cordiste) au Groupe (Recruteur).
- **Texte :** Message dynamique : "Initialisation de votre espace Cordiste..." ou "Préparation de vos outils Recruteur...".
- **Durée :** Artificiellement fixée à 1.5s pour permettre une transition fluide sans être frustrante.

## 3. Architecture Technique

### [Component] Logic & Context
- **`isTransitioning` state :** Ajout d'un booléen dans le `DashboardContext`.
- **`switchEffect` :** Une fonction qui déclenche l'animation, invalide les caches React-Query, et change le mode.

### [Component] UI
- **`ModeTransitionOverlay.tsx` :** Nouveau composant plein écran géré par `Framer Motion` (si dispo) ou CSS pur.
- **Integration :** Placé à la racine du `DashboardLayout`.

## 4. Plan d'Implémentation

### Étape 1 : Amélioration du Context
Mise à jour de `DashboardContext` pour gérer l'asynchronisme de la transition.

### Étape 2 : Création de la Vibe
Design du composant `TransitionLoader` (style Apple/Stripe).

### Étape 3 : Intégration Layout
Injection du loader dans le `DashboardLayout` pour qu'il recouvre tout le contenu utile pendant le switch.

## 5. Succès
- Plus aucun décalage entre le bouton de switch et le contenu du dashboard.
- Sentiment de "solidité" technique lors du changement de rôle.
