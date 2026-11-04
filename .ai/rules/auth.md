---
paths:
  - 'app/Modules/Auth/**'
  - 'app/Models/User.php'
  - 'config/permission.php'
  - 'database/seeders/**'
---

# Auth, roles and permissions

## Spatie laravel-permission

Roles and permissions use `spatie/laravel-permission` (v8, guard `web`). `App\Models\User` uses the `HasRoles` trait. Do not write your own role tables.

## Migrations

The package tables come from `app/Modules/Auth/Database/Migrations/2026_11_05_000000_create_permission_tables.php`. Do not edit that file. Add a new migration for a schema change.

`config/permission.php` is the package config, copied from the vendor package.

## Seeding

`app/Modules/Auth/Database/Seeders/RolesAndPermissionsSeeder.php` owns the permission list and the role map. `database/seeders/DatabaseSeeder.php` calls it. The seeder is idempotent: run it again and nothing is duplicated.

Set `ADMIN_EMAIL` in `.env` to give the Admin role to that user when the seeder runs.

## Adding a permission

1. Add the name to the module's permission list in `RolesAndPermissionsSeeder`, and to the roles that should hold it.
2. Define a gate for it in the module provider. Spatie defines gates only for permissions that exist at boot, and a seeder run after boot does not register them. Use `$user->getAllPermissions()->contains('name', $permissionName)` so a missing permission returns false and does not throw.
3. Check it in the controller with `Gate::authorize('<name>')`.
4. Add a test for the allowed and the denied case.

## Dev database

Seeding writes to the database. Do not run the seeder against `tagler_cms` without the user's approval. The test suite seeds `tagler_test` through `RefreshDatabase`.
