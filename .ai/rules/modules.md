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
  config/                  module config, read with config('modules.{module}.key')
  Database/Migrations/     module migrations
  routes/settings.php      module routes
```

Create only the folders the module uses. Do not add new folders directly under `app/` or `database/` without approval. `app/Policies/` was approved for the `User` policy, which is the only policy outside a module. The Auth module also uses `Policies/`, `Support/` and `Requests/` for its authorization and access screens.

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

## Console commands and broadcast channels

Register these in the module provider. Do not add them to `bootstrap/app.php`. `withRouting(commands:)` and `withRouting(channels:)` take one string, not a glob.

- Commands: put the class in `app/Modules/{Module}/Console/Commands` and register it in `boot()`:
  ```php
  $this->commands([SyncFileTranslationsToDatabase::class]);
  ```
- Channels: register them in `boot()` with `Broadcast::channel(...)`. Do not create a `channels.php` file in the module:
  ```php
  Broadcast::channel('translations.{id}', fn (User $user, int $id): bool => ...);
  ```

Do not put a console or channel file in `app/Modules/{Module}/routes/`. The `bootstrap/app.php` glob loads every file in that folder as web routes.

## Models

A module's models live in `app/Modules/{Module}/Models`. Do not put them in `app/Models`. The only exception is `App\Models\User`, which Fortify and Laravel require.

## Module config

A module declares its settings in `app/Modules/{Module}/config/{module}.php`. The provider merges the file in `register()` under the `modules.{module}` key, so the values read with `config('modules.{module}.key')`. Put `env()` defaults in the module file. Do not add module settings to `config/`:

```php
$this->mergeConfigFrom(__DIR__.'/../config/auth.php', 'modules.auth');
```

## Concerns, Contracts and bindings

- Traits go in the module's `Concerns/` folder and are named `Has{Feature}`.
- Interfaces end with `Contract` and live in a `Contracts/` folder.
- Repository and service bindings go in the module provider. Use `Crud\Providers\ModuleServiceProvider` with `$repositories` and `$services` pairs when the module uses the crud package.

## Authorization

Roles and permissions belong to the Auth module (see `.ai/rules/auth.md`). Each module declares its permissions in its provider's `boot()` through `PermissionRegistry`, and its class-level abilities through `AbilityRegistry`. A module with model access puts its policies in `Policies/`, named `{Model}Policy`. Laravel discovers them, so do not call `Gate::policy()`.
