---
paths:
  - 'app/Modules/Translation/**'
  - 'lang/**'
---

# Translations

## Two sources, one overlay

- `lang/{locale}/{group}.php` files hold the default strings. Laravel reads them.
- The `translations` table overlays those files. A row wins over a file entry with the same locale, group and key. `App\Modules\Translation\Support\DatabaseTranslationLoader` does the overlay. `CachingTranslationLoader` caches it.

## Columns and keys

The `translations` table has `lang`, `group`, `table`, `key`, `value`. Keys do not include the group prefix. `__('auth.failed')` reads group `auth`, key `failed`.

`table` is set only when the key prefix is a real table name in the `translations` group (for example `users.title` gives `users`).

## Sync files to the table

Run `docker exec tagler-cms-app php artisan tagler:translations:sync` to copy the file strings of every supported locale folder (`lang/az`, `lang/en`, `lang/ru`) into the table. Pass `--locale=<code>` to sync one folder. Existing rows are kept unless you pass `--force`, which overwrites them. The command clears the translation cache when it finishes.

The lang files `translations.php`, `auth.php`, `pagination.php`, `passwords.php` and `validation.php` for all three locales were imported from `roni_xri`. Edit them in `lang/`, then sync.

Ask the user before deleting rows whose keys no longer exist in the lang files.

## Clear the cache after editing lang files

`docker exec tagler-cms-app php artisan cache:clear` after hand edits, or the change does not show.

## Group names

One group per resource, named after the plural table, for example `translations` for the module UI. Do not split a resource's copy into a singular and a plural group.

Put generic chrome strings (`save`, `edit`, `operation_success`) under `common.*`. Do not repeat them per module.

## Permissions

The translation pages need the permissions `translations.index` (list) and `translations.update` (edit and save). The Translation provider defines a gate for each. Controllers call `Gate::authorize(...)`. Roles that hold them are seeded in `app/Modules/Auth/Database/Seeders/RolesAndPermissionsSeeder.php`. See `.ai/rules/auth.md`.
