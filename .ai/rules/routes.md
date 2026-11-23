---
paths:
  - 'routes/**'
  - 'app/Modules/*/routes/**'
  - 'app/Modules/*/Controllers/**'
---

# Routes

## Module routes stay in the module

A module's routes go in `app/Modules/{Module}/routes/settings.php`. `bootstrap/app.php` loads every `app/Modules/*/routes/*.php` file in the web group. Do not load them in a provider. Do not put console or channel files there either. Register commands and `Broadcast::channel` in the module provider. See `.ai/rules/modules.md`.

## Named routes

Use named routes and `route()`. Name new routes `{resource}.{action}`, for example `translations.index`.

## Everything is under /admin

The CMS admin owns every module. Each module route group starts with the prefix on the group itself:

```php
Route::prefix('admin')->middleware(['auth', 'verified'])->group(function () {
    // module routes
});
```

Do not add the prefix in `bootstrap/app.php`. That glob loads every module file into one group, and the public page routes (Pages module) must stay at the root. Fortify uses `admin` through `config/fortify.php` (`prefix`, `home`). Only the public site stays outside `/admin`.

## Admin pages

Admin pages that edit shared data use `password.confirm` in the middleware group, as in `app/Modules/Translation/routes/settings.php`.

## Check the routes

`php artisan route:list --name=<prefix>` on the host is safe. It does not touch the database.
