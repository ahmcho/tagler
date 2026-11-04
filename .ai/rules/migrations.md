---
paths:
  - 'app/Modules/*/Database/Migrations/**'
  - 'database/migrations/**'
---

# Migrations

## Module migrations go in the module

A feature's migrations live in `app/Modules/{Module}/Database/Migrations`. Only the framework base migrations (`0001_01_01_*`) and app-wide tables stay in `database/migrations`. See `.ai/rules/modules.md`.

## Generate with Artisan, then move

Use `php artisan make:migration <name>` on the host (it does not touch the database). Then move the file into the module folder. The timestamp and file name must stay the same, because the `migrations` table stores the name.

## Alter, do not edit, applied migrations

Never change a migration that has already run on the dev database. Add a new migration that reshapes the table. Example: `reshape_translations_table_for_translation_module` changes the old `translations` table.

## Reversible data moves

When a migration changes data as well as columns:

- Write `down()` so that rolling it back restores the previous shape.
- Test both directions on a scratch database first (see `.ai/rules/general.md`).
- Check for duplicate keys before a unique index is added. A row that breaks the new unique constraint stops the migration.

## Use `$table->after()` with a closure for several columns

To add several columns after one column, group them: `$table->after('column_name', function (Blueprint $table) { ... });` instead of chaining `->after()` on each column.
