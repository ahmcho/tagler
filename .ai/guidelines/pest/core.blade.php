@php
/** @var \Laravel\Boost\Install\GuidelineAssist $assist */
@endphp
@scoped(['tests/**'])
# Pest

- This project uses Pest. Create tests with `{{ $assist->artisanCommand('make:test --pest {name}') }}`. Pass `--unit` for a unit test. Most tests are feature tests.
- Do not include the test suite directory in `{name}`. Use `SomeFeatureTest`, not `Feature/SomeFeatureTest`.
- Read the `testing-best-practices` skill for coverage, naming, structure and dependency isolation.
- Tests run on PostgreSQL (`tagler_test`) in the container: `docker exec tagler-cms-app php artisan test --compact <files>`, or add `--filter=testName`. See `.ai/rules/tests.md`.
- Run the narrowest set of tests that covers the change. Rerun a test after each change to it.
- Do not delete, skip or mark a test incomplete without approval. When a test fails, say whether the test is outdated or the code is wrong before you change either.
- Run the full suite before you close an issue that changed permissions, policies or shared services (see `.ai/rules/tests.md`).
@endscoped
