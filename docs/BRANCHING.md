# Branching Strategy

## Branches principales

- `main`: production stable
- `develop`: intégration continue avant release

## Branches de travail

- `feature/<nom-court>`: nouvelle fonctionnalité
- `hotfix/<nom-court>`: correction urgente production
- `release/<version>`: stabilisation avant merge sur `main`

## Convention de commit

Format recommandé:

- `feat: ...`
- `fix: ...`
- `refactor: ...`
- `docs: ...`
- `chore: ...`

Exemples:

- `feat: add mobile bottom navigation`
- `fix: prevent secret key usage in frontend`
