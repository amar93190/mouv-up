# Automatisations (DCX / intégration)

## Vue d'ensemble

Le projet déclenche une automatisation via webhook lors de l'inscription d'un utilisateur à un événement.

Code source:

- [`src/services/automations.ts`](../src/services/automations.ts)

Points d'appel:

- [`src/pages/EventDetailPage.tsx`](../src/pages/EventDetailPage.tsx)
- [`src/components/ProgramEventModal.tsx`](../src/components/ProgramEventModal.tsx)

## Fichiers JSON livrés

Dossier:

- [`automations/make/`](../automations/make)

Fichiers:

1. [`welcome-registration.payload.example.json`](../automations/make/welcome-registration.payload.example.json)
- exemple réel de payload envoyé
- utile pour test manuel webhook

2. [`welcome-registration.payload.schema.json`](../automations/make/welcome-registration.payload.schema.json)
- schéma JSON du payload
- utile pour validation / documentation contrat

## Contrat du webhook sortant

Méthode:

- `POST`

Headers:

- `Content-Type: application/json`

Body:

- `user_id`
- `event_id`
- `registration_id`
- `registration_status`
- `event_title`
- `event_slug`
- `event_start_date`
- `event_end_date`
- `event_location`
- `source` (`event-detail` ou `program-modal`)
- `sent_at`

## Configuration requise

Dans `.env`:

```env
VITE_MAKE_WEBHOOK_URL=https://hook.eu1.make.com/<webhook-id>
```

Si la variable est absente:

- aucune requête n'est envoyée
- le flux d'inscription utilisateur continue normalement

## Import / test côté Make (recommandé)

1. Créer un scénario Make avec module `Custom webhook`.
2. Coller l'URL dans `VITE_MAKE_WEBHOOK_URL`.
3. Envoyer le JSON exemple (`welcome-registration.payload.example.json`) pour capter la structure.
4. Ajouter les actions métier (email, CRM, logs, etc.).
5. Activer le scénario.

