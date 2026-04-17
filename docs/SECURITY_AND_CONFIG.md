# Sécurité et configuration

## Variables d'environnement utilisées

### Frontend

- `VITE_SUPABASE_URL`
  - URL du projet Supabase
  - Exemple: `https://<project-ref>.supabase.co`

- `VITE_SUPABASE_ANON_KEY`
  - Clé publishable Supabase (publique, dédiée frontend)
  - Ne pas confondre avec `sb_secret_*`

- `VITE_MAKE_WEBHOOK_URL`
  - Webhook Make appelé à l'inscription événement
  - Optionnelle si automatisation non active

## Règles de sécurité

1. Ne jamais commiter `.env`.
2. Ne jamais exposer les clés serveur (`sb_secret_*`) dans le frontend.
3. Garder les clés/projets Supabase distincts par environnement:
- dev
- staging
- production
4. Revoir les policies RLS après chaque évolution métier.

## Gestion des accès recommandée

- Compte GitHub de projet dédié.
- Projet Supabase dédié (non personnel).
- Workspace Make dédié.
- Accès partagés via gestionnaire de secrets (1Password, Bitwarden, etc.).

## Rotation des clés

Si une clé est suspectée compromise:

1. Regénérer la clé côté fournisseur (Supabase/Make).
2. Mettre à jour `.env`.
3. Redéployer.
4. Vérifier les journaux d'accès.

