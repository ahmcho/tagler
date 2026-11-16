---
paths:
  - 'app/Modules/Auth/**'
  - 'app/Models/User.php'
  - 'config/permission.php'
  - 'config/activitylog.php'
  - 'config/database.php'
  - 'database/seeders/**'
---

# Auth, roles and permissions

## Spatie laravel-permission

Roles and permissions use `spatie/laravel-permission` (v8, guard `web`). `App\Models\User` uses the `HasRoles` trait. Do not write your own role tables.

`App\Modules\Auth\Models\Role` and `App\Modules\Auth\Models\Permission` extend the Spatie models. `config/permission.php` points at them.

## Migrations

The package tables come from `app/Modules/Auth/Database/Migrations/2026_11_05_000000_create_permission_tables.php`. Do not edit that file. Add a new migration for a schema change. The `description` column on `permissions` comes from `2026_11_16_100000_add_description_to_permissions_table.php`.

`config/permission.php` is the package config, copied from the vendor package. Only the model entries differ.

## Permissions come from the modules

Each module lists its permissions in its provider's `boot()`, through `App\Modules\Auth\Support\PermissionRegistry`:

```php
app(PermissionRegistry::class)->register([
    ['name' => 'translations.index', 'description' => 'View the translation list'],
]);
```

`RolesAndPermissionsSeeder` reads the registry. It creates each permission with its description, gives Admin every permission, and gives User none. The seeder is idempotent.

Set `ADMIN_EMAIL` in `.env` to give the Admin role to that user when the seeder runs.

## Authorization uses policies

Each model has a policy in `app/Modules/Auth/Policies`. The provider registers it with `Gate::policy()`. Auto-discovery is not used.

- A policy method checks the permission with `holdsPermission()` from `HasPermissionCheck`. That method uses `getAllPermissions()->contains('name', ...)`, so a missing permission returns false and does not throw.
- A denial returns the translated `translations.common.forbidden` message (`HasTranslatedDenialResponse`).
- Controllers call `Gate::authorize('viewAny', Role::class)` or `Gate::authorize('update', $role)`.
- The Translation module still uses `Gate::define` per permission, as its provider defines it. Do not change that unless the user asks.

## The `can` prop

`HandleInertiaRequests` shares `can`. It is built from `AbilityRegistry`. Each module adds its class-level abilities in `boot()`:

```php
app(AbilityRegistry::class)->register([
    'roles.store' => [Role::class, 'create'],
    'translations.index' => 'translations.index', // a Gate ability name
]);
```

The frontend reads it with `useAbility()` from `resources/js/hooks/use-ability.ts`. Row-level rules (for example, the Admin role cannot be deleted) come from the resource's `can` object, which calls the policy.

## Last Admin rule

The system keeps at least one user with the Admin role. These paths enforce it:

- `UserPolicy::delete()` denies deleting the last Admin.
- `UserRequest` rejects an update that removes the Admin role from the last Admin.
- `ProfileController::destroy()` refuses to delete the last Admin's own account.

The `LastAdminGuard` support class holds the check.

The Admin role cannot be edited or deleted (`RolePolicy`).

## Activity log lives in MongoDB

`spatie/laravel-activitylog` writes to MongoDB. The connection is `mongodb` (`config/database.php`, `ACTIVITY_LOGGER_DB_CONNECTION`). The model is `App\Modules\Auth\Models\ActivityLog`, which extends Spatie's `Activity` and uses `MongoDB\Laravel\Eloquent\DocumentModel`. Do not publish Spatie's SQL `activity_log` migration.

Log entries are read by `ActivityLogRepository`, which queries MongoDB directly. Do not join them to SQL tables.

Tests clear the `activity_log` collection in `Tests\TestCase::setUp()`. The test run uses the Mongo database `tagler_test` (`phpunit.xml`), not the dev database.

## Adding a permission

1. Add the name and description to the module's provider in `registerPermissions()` (or the equivalent in `boot()`).
2. Add the name to the policy method that checks it.
3. Add the class-level ability to `AbilityRegistry` if the UI needs one.
4. Run the seeder. Ask the user before running it on `tagler_cms`.
5. Add a test for the allowed case and the denied case.

## Dev database

Seeding and migrations write to the database. Do not run them against `tagler_cms` without the user's approval. The test suite seeds `tagler_test` through `RefreshDatabase`.
