# Solimouv' PWA

Application web progressive (PWA) pour Solimouv', projet sport inclusif porté par Up Sport! et ses associations partenaires.

Ce dépôt est structuré pour un rendu client/dev complet: code source, base de données, automatisations, configuration, sécurité, et guide d'exploitation.

## 1) Ce que fait l'application

- Parcours public: accueil, programme, détail d'événement, partenaires, contact.
- Parcours membre: authentification, profil, points, inscriptions.
- Parcours staff: gestion des événements (`admin` / `organizer`).
- Données: Supabase (Auth + Postgres + RLS).
- Automatisation: webhook Make déclenché à l'inscription.

## 2) Stack technique

- React 18 + Vite 5 + TypeScript
- Tailwind CSS
- React Router
- Supabase JS v2
- vite-plugin-pwa

## 3) Démarrage rapide (local)

### Prérequis

- Node.js 20+ recommandé
- npm 10+
- Un projet Supabase accessible

### Installation

```bash
npm install
cp .env.example .env
```

Renseigner ensuite `.env` avec tes valeurs réelles.

### Base de données

Exécuter le script SQL:

- Fichier: [`supabase/schema.sql`](supabase/schema.sql)
- Objectif: créer tables, types, fonctions, policies RLS, grants, seed minimal

### Lancer l'application

```bash
npm run dev -- --host
```

Accès local:

- `http://localhost:5173`
- (réseau local possible avec `--host`)

## 4) Variables d'environnement

Voir le détail complet dans [`docs/SECURITY_AND_CONFIG.md`](docs/SECURITY_AND_CONFIG.md).

Variables frontend requises:

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-publishable-key>
VITE_MAKE_WEBHOOK_URL=https://hook.eu1.make.com/<webhook-id>
# Optionnel (dev): activer le test d'installation PWA en local
# VITE_ENABLE_PWA_DEV=true
```

Règles de sécurité:

- Ne jamais versionner `.env`.
- Ne jamais utiliser de clé `sb_secret_*` côté frontend.
- Utiliser uniquement la clé publishable (`anon`) dans ce projet.

## 5) Scripts disponibles

```bash
npm run dev
npm run build
npm run preview
```

## 6) Structure du dépôt

```txt
src/
  components/
  contexts/
  hooks/
  layouts/
  lib/
  pages/
  routes/
  services/
  styles/
  types/
  utils/
supabase/
automations/
docs/
```

## 7) Documentation projet (rendu client/dev)

- Guide de prise en main: [`docs/ONBOARDING.md`](docs/ONBOARDING.md)
- Sécurité et configuration: [`docs/SECURITY_AND_CONFIG.md`](docs/SECURITY_AND_CONFIG.md)
- Automatisations et JSON: [`docs/AUTOMATIONS.md`](docs/AUTOMATIONS.md)
- Checklist de rendu: [`docs/DELIVERY_CHECKLIST.md`](docs/DELIVERY_CHECKLIST.md)
- Branching: [`docs/BRANCHING.md`](docs/BRANCHING.md)

## 8) Automatisations

Les fichiers JSON liés à l'automatisation sont stockés dans:

- [`automations/make/welcome-registration.payload.example.json`](automations/make/welcome-registration.payload.example.json)
- [`automations/make/welcome-registration.payload.schema.json`](automations/make/welcome-registration.payload.schema.json)

Le flux est documenté dans [`docs/AUTOMATIONS.md`](docs/AUTOMATIONS.md).

## 9) État fonctionnel actuel

- UI mobile-first avec adaptation desktop
- Auth Supabase + gestion de rôles
- CRUD événements côté admin/organisateur
- Affichage public d'événements publiés
- Inscription utilisateur aux événements
- Déclenchement webhook Make à l'inscription
- PWA installable
