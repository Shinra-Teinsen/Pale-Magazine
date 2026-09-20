# PALE — Plateforme Éditoriale & Magazine Moderne

Plateforme éditoriale indépendante et moderne dédiée aux thématiques **Société**, **Lifestyle**, **Culture** et **Tendances**. Développée avec React, TypeScript, Tailwind CSS et propulsée par **Supabase** pour la persistance des données et l'authentification en production.

---

## 🌟 Fonctionnalités Principales

- **Architecture Cloud-Native (Supabase)** : Base de données PostgreSQL avec politiques de sécurité Row Level Security (RLS).
- **Authentification complète** :
  - Connexion et inscription sécurisées par e-mail et mot de passe.
  - Connexion en un clic avec **Google OAuth**.
  - Récupération de mot de passe par e-mail.
- **Rôle Administrateur automatique** : L'adresse `mesyepyewo@gmail.com` est automatiquement configurée avec les privilèges administrateur complets.
- **Tableau de bord d'administration (CMS)** :
  - Création, édition et suppression d'articles avec éditeur riche.
  - Gestion des catégories et des tags.
  - Modération des signalements et commentaires.
  - Diffusion d'annonces officielles et notifications push.
- **Interactivité Lecteurs** :
  - Like d'articles (règle stricte d'un like par compte).
  - Sauvegarde d'articles en favoris.
  - Espace commentaires avec réponses imbriquées et likes.
  - Signalement de commentaires inappropriés.
  - Partage sur les réseaux sociaux.
- **Expérience utilisateur soignée** :
  - Mode sombre (Dark mode) / clair adaptatif.
  - PWA (Progressive Web App) installable et prête pour mobile.
  - Notifications en temps réel.

---

## 🛠️ Technologies Utilisées

- **Frontend** : React 18, TypeScript, Tailwind CSS, Lucide Icons, Motion.
- **Backend & Données** : Supabase (PostgreSQL, Supabase Auth, Row Level Security).
- **Build Tool** : Vite.

---

## 🚀 Démarrage Rapide

### 1. Cloner le dépôt et installer les dépendances

```bash
git clone <URL_DU_REPO>
cd pale-magazine
npm install
```

### 2. Configuration des variables d'environnement

Créez un fichier `.env` à la racine (en copiant `.env.example`) :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-publique-anon
```

*(Vous pouvez également renseigner ces identifiants directement dans l'interface de l'application via le bouton Supabase).*

### 3. Initialiser la base de données Supabase

1. Rendez-vous sur votre tableau de bord [Supabase](https://supabase.com).
2. Ouvrez le **SQL Editor**.
3. Copiez et exécutez le script SQL fourni dans l'application (ou dans `src/lib/supabase.ts`). Il crée toutes les tables (`profiles`, `articles`, `categories`, `comments`, `notifications`, etc.), active la sécurité RLS, insère les catégories par défaut et configure le déclencheur pour le compte administrateur `mesyepyewo@gmail.com`.

### 4. Lancer le serveur de développement

```bash
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

### 5. Compiler pour la production

```bash
npm run build
```

Les fichiers statiques optimisés seront générés dans le dossier `dist/`.

---

## 🔒 Sécurité & Droits Administrateur

Le projet intègre un déclencheur SQL automatique : dès que le compte `mesyepyewo@gmail.com` s'inscrit ou se connecte (que ce soit via mot de passe ou Google), il reçoit automatiquement le rôle `admin` dans la table `public.profiles`.
