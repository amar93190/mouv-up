# Solimouv' PWA

Application web progressive (PWA) pour Solimouv', le festival de sport inclusif porté par Up Sport! et ses associations partenaires.

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- React Router
- Supabase (Auth + DB)
- vite-plugin-pwa

## Démarrage local

```bash
npm install
cp .env.example .env
npm run dev -- --host
```

## Variables d'environnement

Créer un fichier `.env` à la racine:

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-publishable-key>
```

Important: ne jamais utiliser la clé `sb_secret_*` dans le front.

## Scripts

```bash
npm run dev
npm run build
npm run preview
```

## Structure

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
docs/
```

## Branching (GitFlow léger)

Voir [docs/BRANCHING.md](docs/BRANCHING.md).

## État actuel

- UI mobile-first alignée sur les maquettes Figma (écrans quotidiens)
- Auth Supabase + rôles
- CRUD événements côté admin/organisateur
- Affichage public des événements publiés
- Inscriptions utilisateur aux événements
- Base PWA installable
