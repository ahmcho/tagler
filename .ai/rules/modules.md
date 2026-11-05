---
paths:
  - 'app/Modules/**'
---

# Modules

Each feature lives in its own module under `app/Modules/{Module}`. The module owns everything it needs. Current modules: `Auth`, `Translation`.

## Layout

```
app/Modules/{Module}/
  Actions/ Concerns/ Console/ Controllers/ Enums/ Models/ Observers/
  Providers/ Repositories/ Requests/ Resources/ Services/ Support/
  Database/Migrations/     module migrations
  routes/settings.php      module routes
```

Create only the folders the module uses. Do not add new folders directly under `app/` or `database/` without approval.

## Module migrations

Every module keeps its own migrations in `app/Modules/{Module}/Database/Migrations`. The module provider loads them, so `php artisan migrate` runs all modules' migrations together with `database/migrations`:

```php
$this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');
```

Do not add a module's migration to `database/migrations`. Moving a file keeps its name, so the `migrations` table still matches it.

## Module routes

Routes live in `app/Modules/{Module}/routes/*.php`. `bootstrap/app.php` loads every module route file automatically inside the web group. Do not load module routes in a provider, or the routes register twice:

```php
web: [
    __DIR__.'/../routes/web.php',
    ...glob(__DIR__.'/../app/Modules/*/routes/*.php'),
],
```

`routes/settings.php` and `routes/web.php` keep only routes that belong to no module.

## Models

A module's models live in `app/Modules/{Module}/Models`. Do not put them in `app/Models`. The only exception is `App\Models\User`, which Fortify and Laravel require.

## Concerns, Contracts and bindings

- Traits go in the module's `Concerns/` folder and are named `Has{Feature}`.
- Interfaces end with `Contract` and live in a `Contracts/` folder.
- Repository and service bindings go in the module provider. Use `Crud\Providers\ModuleServiceProvider` with `$repositories` and `$services` pairs when the module uses the crud package.

## Authorization

Roles and permissions belong to the Auth module (see `.ai/rules/auth.md`). Each module defines its own permission gates in its provider, for example `translations.index` in `TranslationServiceProvider`. Controllers call `Gate::authorize('<permission>')`.
