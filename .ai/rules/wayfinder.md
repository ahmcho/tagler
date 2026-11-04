---
paths:
  - 'routes/**'
  - 'app/Modules/*/routes/**'
  - 'app/Modules/*/Controllers/**'
  - 'resources/js/routes/**'
  - 'resources/js/actions/**'
---

# Wayfinder

## Always pass --with-form

The Vite plugin generates with `formVariants: true`. A bare `php artisan wayfinder:generate` regenerates every file without the `.form()` helper, and then `npm run types:check` fails in unrelated pages. Run:

`docker exec tagler-cms-app php artisan wayfinder:generate --with-form --no-interaction`

The generated folders `resources/js/routes` and `resources/js/actions` are gitignored. Regenerate them after you add or change a route.

## Frontend imports

Import generated helpers with `@/routes/{name}` or `@/actions/...`. Use them instead of hard-coded URLs.

Use the function form for named route parameters, for example `update([group, key]).url` or `update.url([group, key])`.
