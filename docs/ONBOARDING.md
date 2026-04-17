# Guide de prise en main (Client / Dev)

## 1. Cloner et installer

```bash
git clone <url-du-repo>
cd hackaton
npm install
cp .env.example .env
```

## 2. Configurer `.env`

Renseigner:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_MAKE_WEBHOOK_URL` (optionnel mais recommandé)

Référence: [`docs/SECURITY_AND_CONFIG.md`](./SECURITY_AND_CONFIG.md)

## 3. Initialiser la base Supabase

Exécuter le SQL du projet:

- [`supabase/schema.sql`](../supabase/schema.sql)

Ce script crée:

- tables, types, triggers
- politiques RLS
- permissions (`anon`, `authenticated`)
- seed d'organisations

## 4. Lancer l'application

```bash
npm run dev -- --host
```

Puis ouvrir:

- `http://localhost:5173`

## 5. Vérifier les parcours principaux

1. Parcours public:
- Accueil
- Programme
- Détail d'un événement
- Partenaires
- Contact

2. Parcours auth:
- Inscription
- Connexion
- Profil

3. Parcours admin/organizer:
- `/admin/evenements`
- `/admin/evenements/nouveau`
- `/admin/evenements/:id/modifier`

## 6. Vérifier l'automatisation webhook

Quand un utilisateur s'inscrit à un événement:

- un POST est envoyé vers `VITE_MAKE_WEBHOOK_URL`
- payload documenté dans:
  - [`docs/AUTOMATIONS.md`](./AUTOMATIONS.md)
  - [`automations/make/welcome-registration.payload.example.json`](../automations/make/welcome-registration.payload.example.json)

## 7. Build de production

```bash
npm run build
npm run preview
```

