# LesCordistes.com - Project Context & Architecture

Ce document sert de référence pour les agents IA travaillant sur le projet **LesCordistes.com**. Il résume l'architecture technique, les règles métier et la structure du code pour minimiser la consommation de tokens et faciliter la compréhension immédiate du projet.

---

## 🏗️ Architecture Technique

- **Frontend** : React 19 + TypeScript + Vite
- **Styling** : Tailwind CSS (Thème principal : Safety Orange / Brand Blue)
- **Backend/BaaS** : Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **State Management** : TanStack Query (React Query) v5
- **Routing** : React Router v7
- **Icônes** : Lucide React

---

## 💼 Business Logic & Roles

**LesCordistes.com** est une marketplace fonctionnant via un système de **crédits** connectant des clients avec des techniciens de travaux sur cordes (cordistes).

### Rôles Utilisateurs
1. **Client** :
   - Poste des missions via un wizard en 5 étapes (`src/components/wizard/`).
   - Peut poster sans être inscrit (validation par email).
2. **Professionnel (Pro)** :
   - Parcourt les missions sur le `JobBoard`.
   - **Accès Gratuit** : Voit le titre, la ville et la description. Les coordonnées sont masquées.
   - **Déblocage (Leads)** : Pour voir les coordonnées d'un client (nom, tel, adresse, email), le Pro doit utiliser **1 crédit**.
   - **Packs de Crédits** :
     - **Starter** : 5 crédits pour 50€ (10€ / lead)
     - **Pro** : 10 crédits pour 90€ (9€ / lead)
     - **Business** : 20 crédits pour 160€ (8€ / lead)
   - Les crédits n'ont pas de date d'expiration.
3. **Admin** :
   - Modère les annonces (Passage de `pending` à `live`).
   - Gère les utilisateurs.

### Types de Missions
- **Standard** : Missions pour particuliers, copropriétés, etc.
- **Renfort PRO** : Missions B2B entre entreprises de travaux en hauteur (sous-traitance/intérim). Champs spécifiques : tarif journalier, habilitations requises, etc.

---

## 🗄️ Schéma de Données (Supabase)

### Tables Principales
- `profiles` : Stocke les informations des utilisateurs (rôle, statut d'abonnement, bio, certifications).
- `jobs` : Toutes les missions postées. Status: `pending`, `live`, `rejected`, `completed`, `cancelled`.
- `unlocked_leads` : Table de jointure entre un Pro et un Job qu'il a débloqué via crédit ou abonnement.
- `credits` & `credit_transactions` : Gestion du solde et historique des crédits.
- `reviews` : Notes et commentaires laissés par les clients après une mission.
- `notifications` : Système de notifications in-app.
- `conversations` & `messages` : Messagerie interne entre clients et pros.

---

## 📂 Structure du Code Source (`src/`)

- `components/` : 
    - `ui/` : Composants de base réutilisables (Button, Input, etc.).
    - `layout/` : Header, Footer, navigation.
    - `wizard/` : Logique du formulaire de dépôt de mission multi-étapes.
- `pages/` : Vues principales (`Landing`, `JobBoard`, `JobDetail`, `Profile`, `Admin/Dashboard`, etc.).
- `hooks/` : Logique de données réutilisable (`useAuth`, `useCredits`, `useMessaging`, `useNotifications`).
- `lib/` : Clients tiers (`supabase.ts`).
- `types/` : Définitions TypeScript globales et types générés par la base de données.
- `constants/` : Données statiques (catégories, types de structures, etc.).

---

## 🔐 Sécurité & RLS
La sécurité est principalement gérée via les **Row Level Security (RLS)** de Supabase :
- Les données sensibles (`client_contact_info` dans `jobs`) ne sont pas sélectionnables par les utilisateurs non autorisés au niveau SQL.
- Le frontend vérifie également via `useAuth` et `useCredits` si un utilisateur peut voir les contacts avant d'afficher les composants.

---

## 🚀 Commandes Utiles
- `npm run dev` : Lance le serveur de développement.
- `npm run build` : Compile le projet pour la production.
- `npm run lint` : Vérifie la qualité du code.

---

*Dernière mise à jour : 23 Mars 2026*
