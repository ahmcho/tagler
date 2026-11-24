---
paths:
  - 'database/seeders/**'
  - 'app/Modules/*/Database/Seeders/**'
---

# Seeders

## Reset the permission cache inside the seeder, more than once

Spatie's `Permission::findOrCreate()` can cache an empty permission list if its first lookup runs before any rows exist. That stale cache survives within the same process.

Call `app(PermissionRegistrar::class)->forgetCachedPermissions()` at the top of the seeder. Call it again right after the permission-creation loop and before any `syncPermissions()` or `givePermissionTo()` call. `RolesAndPermissionsSeeder` already does this. Keep both calls.

## Settings written by a seeder bypass the cache

`SettingService` caches all settings under one cache key. A seeder that writes `Setting` models directly does not clear that key, so the new values stay hidden until the cache is cleared.

Write settings through `SettingService::setMany()`, which clears the cache. If you must write models directly, call `SettingService::forgetCache()` after the write.

## Read DatabaseSeeder before you run a seeder

`php artisan db:seed` runs `database/seeders/DatabaseSeeder.php`. That file creates a test user (`test@example.com`) and calls the other seeders. Read it first. Run only the seeder you need, with `--class=`, for example `php artisan db:seed --class=RolesAndPermissionsSeeder`.

Ask the user before you run any seeder against a database that holds real data. See `.ai/rules/general.md`.
