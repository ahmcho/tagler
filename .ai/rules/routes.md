---
paths:
  - 'routes/**'
  - 'app/Modules/*/routes/**'
  - 'app/Modules/*/Controllers/**'
---

# Routes

## Module routes stay in the module

A module's routes go in `app/Modules/{Module}/routes/settings.php`. The module provider loads them with `Route::middleware('web')->group(...)`. See `.ai/rules/modules.md`.

## Named routes

Use named routes and `route()`. Name new routes `{resource}.{action}`, for example `translations.index`.

## Admin pages

Admin pages that edit shared data use `password.confirm` in the middleware group, as in `app/Modules/Translation/routes/settings.php`.

## Check the routes

`php artisan route:list --name=<prefix>` on the host is safe. It does not touch the database.
