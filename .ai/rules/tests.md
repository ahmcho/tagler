---
paths:
  - 'tests/**'
---

# Tests

## Pest

Create tests with `php artisan make:test --pest {Name}`. Pass `--unit` for a unit test. Most tests are feature tests. Pest's `tests/Pest.php` extends `TestCase` and `RefreshDatabase` only for `tests/Feature`.

## Run tests in the container

`docker exec tagler-cms-app php artisan test --compact <files>`, or add `--filter=<name>`. The test database is `tagler_test` on PostgreSQL.

## Factories

Use model factories. Check for custom states before you set up a model by hand.

## Every change needs a test

Add or update a test for each behaviour change, then run the affected tests.

## Do not delete or skip tests

Do not delete, skip or mark a test incomplete without approval. When a test fails, say whether the test is outdated or the code is wrong before you change either.

## Migration tests

When you change a migration, test it on a scratch database with data. See `.ai/rules/general.md`.
