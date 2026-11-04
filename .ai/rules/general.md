---
paths:
  - '**'
---

# General

## The app runs in Docker; run DB-touching commands in the container

The app container is `tagler-cms-app`. The database host `tagler-cms-postgres` only resolves inside Docker. Run artisan, tests and tinker in the container:

`docker exec tagler-cms-app php artisan ...`

Host `php artisan` works only for commands that do not touch the database (for example `make:*`, `route:list`, `wayfinder:generate`, `pint`).

## Never run a rollback or migrate against the dev database without approval

Do not run `migrate:rollback`, `migrate:fresh` or `migrate` against `tagler_cms` on your own. A `migrate:rollback --step=N` removes the most recent batches in migration order. It can drop tables and columns (this happened once: the `translations` table and the `users` two-factor columns were dropped, then restored by re-running the same migrations).

To test a migration on data:

1. Copy the dev schema to a scratch database (`pg_dump tagler_cms | psql` into a new database).
2. Pass the database name inline: `docker exec -e DB_DATABASE=<scratch> tagler-cms-app php artisan migrate`.
3. Roll back with `--path=<migration file>`, never with `--step`.
4. Drop the scratch database when done.

Ask the user before running pending migrations on `tagler_cms`.

## Files created by the container belong to root

The app container writes as root into the mounted project. Files such as `resources/js/actions/**`, `resources/js/routes/**` and `public/build/**` can then be unwritable from the host (`EACCES`). Regenerate these from the container instead of the host, for example `docker exec tagler-cms-app php artisan wayfinder:generate --with-form --no-interaction`, or `docker exec tagler-cms-app npm run build`.

## Editing lang files needs a cache clear

Translations are cached forever by `CachingTranslationLoader`. After editing a `lang/{locale}/*.php` file, run `docker exec tagler-cms-app php artisan cache:clear`, or the change does not show.

## Keep changes small

Match the surrounding code style. Do not refactor unrelated files. Do not add documentation files unless the user asks for them.
