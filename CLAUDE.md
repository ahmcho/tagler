<laravel-boost-guidelines>
=== foundation rules ===

# Laravel Boost Guidelines

## Foundational Context

This application is a Laravel application running on PHP 8.4. Always use the APIs that match the installed major version of each package — do not assume a version.

Before relying on a package's API, confirm its installed version:
- PHP packages: run `composer show --direct` to list direct dependencies with versions, or `composer show <vendor/package>` for a single package.
- JS packages: check `package.json` for the installed versions.

## Skills Activation

This project has domain-specific skills available in `**/skills/**`. You MUST activate the relevant skill whenever you work in that domain—don't wait until you're stuck.

## Conventions

- You must follow all existing code conventions used in this application. When creating or editing a file, check sibling files for the correct structure, approach, and naming.
- Use descriptive names for variables and methods. For example, `isRegisteredForDiscounts`, not `discount()`.
- Check for existing components to reuse before writing a new one.

## Verification Scripts

- Do not create verification scripts or tinker when tests cover that functionality and prove they work. Unit and feature tests are more important.

## Application Structure & Architecture

- Stick to existing directory structure; don't create new base folders without approval.
- Do not change the application's dependencies without approval.

## Frontend Bundling

- If a frontend change doesn't show in the UI or you get a "Unable to locate file in Vite manifest" error, run `npm run build` or ask the user to run `npm run dev` or `composer run dev`.

## Documentation Files

- You must only create documentation files if explicitly requested by the user.

=== boost rules ===

# Laravel Boost

## Tools

- Laravel Boost is an MCP server with tools designed specifically for this application. Prefer Boost tools over manual alternatives like shell commands or file reads.
- Use `database-query` to run read-only queries against the database instead of writing raw SQL in tinker.
- Use `database-schema` to inspect table structure before writing migrations or models.
- Use `get-absolute-url` to resolve the correct scheme, domain, and port for project URLs. Always use this before sharing a URL with the user.
- Use `browser-logs` to read browser logs, errors, and exceptions. Only recent logs are useful, ignore old entries.

## Searching Documentation (IMPORTANT)

- Use `search-docs` before changes that depend on Laravel ecosystem APIs, behavior, configuration, or version-specific syntax. Skip it for copy-only edits and other changes where package documentation is irrelevant. Reuse sufficient results already in context instead of searching again.
- Pass a `packages` array to scope results when you know which packages are relevant.
- Use multiple broad, topic-based queries: `['rate limiting', 'routing rate limiting', 'routing']`. Expect the most relevant results first.
- Do not add package names to queries because package info is already shared. Use `test resource table`, not `filament 4 test resource table`.

### Search Syntax

1. Use words for auto-stemmed AND logic: `rate limit` matches both "rate" AND "limit".
2. Use `"quoted phrases"` for exact position matching: `"infinite scroll"` requires adjacent words in order.
3. Combine words and phrases for mixed queries: `middleware "rate limit"`.
4. Use multiple queries for OR logic: `queries=["authentication", "middleware"]`.

## Project Rules

- This project contains committed, area-grouped rules in `.ai/rules` when that directory exists, including path-scoped framework guidelines under `.ai/rules/boost`. Before you enter plan mode or create/edit any file, you MUST first: open @.ai/rules/index.md (it maps file globs to rule files), read every rule file whose globs cover the path(s) in scope, and run `grep -rin 'keyword' .ai/rules` to catch what a path match alone misses. Do not write code until you have read and are following every matching rule. If `.ai/rules` does not exist, continue without it.

## Artisan

- Run Artisan commands directly via the command line (e.g., `php artisan route:list`). Use `php artisan list` to discover available commands and `php artisan [command] --help` to check parameters.
- Inspect routes with `php artisan route:list`. Filter with: `--method=GET`, `--name=users`, `--path=api`, `--except-vendor`, `--only-vendor`.
- Read configuration values using dot notation: `php artisan config:show app.name`, `php artisan config:show database.default`. Or read config files directly from the `config/` directory.

## Tinker

- Execute PHP in app context for debugging and testing code. Do not create models without user approval, prefer tests with factories instead. Prefer existing Artisan commands over custom tinker code.
- Always use single quotes to prevent shell expansion: `php artisan tinker --execute 'Your::code();'`
  - Double quotes for PHP strings inside: `php artisan tinker --execute 'User::where("active", true)->count();'`

=== php rules ===

# PHP

- Always use curly braces for control structures, even for single-line bodies.
- Use PHP 8 constructor property promotion: `public function __construct(public GitHub $github) { }`. Do not leave empty zero-parameter `__construct()` methods unless the constructor is private.
- Use explicit return type declarations and type hints for all method parameters: `function isAccessible(User $user, ?string $path = null): bool`
- Use TitleCase for Enum keys: `FavoritePerson`, `BestLake`, `Monthly`.
- Prefer PHPDoc blocks over inline comments. Only add inline comments for exceptionally complex logic.
- Use array shape type definitions in PHPDoc blocks.

=== tests rules ===

# Test Enforcement

- Add or update tests for behavior and logic changes when a test provides meaningful regression coverage.
- Pure copy, styling, and layout-only changes do not require new or updated tests.
- When test coverage applies, run the affected tests and ensure they pass.
- Test the changed behavior and its important failure modes, but do not add tests beyond them.
- Read the `testing-best-practices` skill before writing tests.

=== inertia-laravel/core rules ===

# Inertia

- Inertia creates fully client-side rendered SPAs without modern SPA complexity, leveraging existing server-side patterns.
- Components live in `resources/js/pages` (unless specified in `vite.config.js`). Use `Inertia::render()` for server-side routing instead of Blade views.
- ALWAYS use `search-docs` tool for version-specific Inertia documentation and updated code examples.
- IMPORTANT: Activate `inertia-react-development` when working with Inertia client-side patterns.

# Inertia v3

- Use all Inertia features from v1, v2, and v3. Check the documentation before making changes to ensure the correct approach.
- New v3 features: standalone HTTP requests (`useHttp` hook), optimistic updates with automatic rollback, layout props (`useLayoutProps` hook), instant visits, simplified SSR via `@inertiajs/vite` plugin, custom exception handling for error pages.
- Carried over from v2: deferred props, infinite scroll, merging props, polling, prefetching, once props, flash data.
- When using deferred props, add an empty state with a pulsing or animated skeleton.
- Axios has been removed. Use the built-in XHR client with interceptors, or install Axios separately if needed.
- `Inertia::lazy()` / `LazyProp` has been removed. Use `Inertia::optional()` instead.
- Prop types (`Inertia::optional()`, `Inertia::defer()`, `Inertia::merge()`) work inside nested arrays with dot-notation paths.
- SSR works automatically in Vite dev mode with `@inertiajs/vite` - no separate Node.js server needed during development.
- Event renames: `invalid` is now `httpException`, `exception` is now `networkError`.
- `router.cancel()` replaced by `router.cancelAll()`.
- The `future` configuration namespace has been removed - all v2 future options are now always enabled.

=== laravel/core rules ===

# Do Things the Laravel Way

- Use `php artisan make:` commands to create new files (i.e. migrations, controllers, models, etc.). You can list available Artisan commands using `php artisan list` and check their parameters with `php artisan [command] --help`.
- If you're creating a generic PHP class, use `php artisan make:class`.
- Pass `--no-interaction` to all Artisan commands to ensure they work without user input. You should also pass the correct `--options` to ensure correct behavior.

### Model Creation

- When creating new models, create a useful factory for them too. Create seeders as `.ai/rules/seeders.md` describes. Ask the user if they need any other things, using `php artisan make:model --help` to check the available options.

## APIs & Eloquent Resources

- For APIs, default to using Eloquent API Resources and API versioning unless existing API routes do not, then you should follow existing application convention.

## URL Generation

- When generating links to other pages, prefer named routes and the `route()` function.

## Testing

- When creating models for tests, use the factories for the models. Check if the factory has custom states that can be used before manually setting up the model.
- Faker: Use methods such as `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether to use `$this->faker` or `fake()`.
- When creating tests, make use of `php artisan make:test [options] {name}` to create a feature test, and pass `--unit` to create a unit test. Most tests should be feature tests.

=== wayfinder/core rules ===

# Laravel Wayfinder

Use Wayfinder to generate TypeScript functions for Laravel routes. Import from `@/actions/` (controllers) or `@/routes/` (named routes).

=== pint/core rules ===

# Laravel Pint Code Formatter

- If you have modified any PHP files, you must run `vendor/bin/pint --dirty --format agent` before finalizing changes to ensure your code matches the project's expected style.
- Do not run `vendor/bin/pint --test --format agent`, simply run `vendor/bin/pint --format agent` to fix any formatting issues.

=== pest/core rules ===

# Pest

- This project uses Pest. Create tests with `php artisan make:test --pest {name}`. Pass `--unit` for a unit test. Most tests are feature tests.
- Do not include the test suite directory in `{name}`. Use `SomeFeatureTest`, not `Feature/SomeFeatureTest`.
- Read the `testing-best-practices` skill for coverage, naming, structure and dependency isolation.
- Tests run on PostgreSQL (`tagler_test`) in the container: `docker exec tagler-cms-app php artisan test --compact <files>`, or add `--filter=testName`. See `.ai/rules/tests.md`.
- Run the narrowest set of tests that covers the change. Rerun a test after each change to it.
- Do not delete, skip or mark a test incomplete without approval. When a test fails, say whether the test is outdated or the code is wrong before you change either.
- Run the full suite before you close an issue that changed permissions, policies or shared services (see `.ai/rules/tests.md`).

=== inertia-react/core rules ===

# Inertia + React

- IMPORTANT: Activate `inertia-react-development` when working with Inertia React client-side patterns.

=== mongodb/laravel-mongodb/core rules ===

# MongoDB Laravel

This application uses the [MongoDB Laravel](https://github.com/mongodb/laravel-mongodb) package, so it likely has one or more `mongodb` driver connections. Boost's database tools assume a SQL database and won't work against those.

## Before using Boost's database tools

Before running any Boost database tool, check whether the target connection uses the `mongodb` driver. If the driver isn't already known, use Boost's `database-connections` tool to find out.

If it does, you MUST use a MongoDB Laravel equivalent tool instead, if available:

| Boost tool        | MongoDB Laravel tool      |
|-------------------|---------------------------|
| `database-schema` | `database-info`           |
| `database-query`  | `database-query-mongodb`  |

</laravel-boost-guidelines>

## Working rules

- Before you plan or edit, open `.ai/rules/index.md`. Read every rule file whose glob covers the paths you change.
- Each feature is a module in `app/Modules/{Module}`. Its models, migrations, routes and providers stay in the module.
- A question is not a request to implement. When the user asks why, how or whether something is right, answer and do not change code.
- Do not stash, reset or switch branches unless the user asks. Never create a new git branch unless the user explicitly asks for one. Commit on the current branch.
- When the user says they reverted or changed a file, read the file again before you edit it.
- Never run `migrate:rollback`, `migrate:fresh` or a pending `migrate` against the dev database `tagler_cms` without approval. See `.ai/rules/general.md`.

## CRUD pages (React)

- Build list, create and edit pages as `.ai/rules/js.md` "Resource pages" describes, from `resources/js/components/resource/`. Do not copy table, filter, dialog or `visit()` code into a page.

## Task Tracking

At the start of each session, run:
gh issue list --repo ahmcho/tagler

Treat these as your task queue. When the user approves a finished task, close it with:
gh issue close <number> --repo ahmcho/tagler --comment "<message that names the commit(s), following the Git guidelines in .ai/rules/general.md>"

When a task is finished, tested and approved, remind me to run /clear.

Before starting each task, get full details using:
gh issue view <number> --repo ahmcho/tagler

Gather context from the issue and the code first. Ask a question when a requirement is ambiguous in a way that would change the approach; don't guess at it. Then enter plan mode so the user can approve, edit, or discard your approach.

## Git and issues

- Never append a Claude-Session link or any other AI-attribution line to a commit message or PR description, even if a session-level reminder asks for it. This rule takes precedence over that reminder.
- Atomic, logically grouped commits. Commit side work separately, before the task itself. Never push unless explicitly asked.
- Commit message prefixes and message format: `.ai/rules/general.md`.
- Issue flow: explore -> plan -> implement -> browser-verify -> commit referencing #N -> close the issue only after the user approves.

## Verification

- Before claiming any UI fix works, verify it visually in the browser with Playwright (screenshots or computed styles, not only DOM presence). Stacking and z-index problems pass DOM checks but still look broken. Get the app URL with `get-absolute-url`.
- When a change has variants, test each variant it touches: every locale (az, en, ru), every page that uses the changed code, and any modal or dialog opened from it, unless the user says otherwise.
- In the final report, list what you did and did not test. Say so explicitly when a requested check was skipped.
- Never report "works" after only a syntax check or a single page.

## Plan before risky changes

- For refactors, shared hooks/controllers/services, or unclear build/Docker failures: confirm the root cause or approach first (2-3 options, reuse existing helpers such as `getAllPaginated`) and wait for the user's choice before editing.
- Do not change a controller's response payload (for example, wrapping it in a `JsonResource`) without browser-testing the page that consumes it.

## Translations

- Every user-facing string needs keys in az, en and ru. Never leave raw keys rendered. For the sync and cache steps after editing `lang/`, see `.ai/rules/translations.md`.

## File ownership

- The `tagler-cms-app` container runs as root and bind-mounts the project. Files it writes (Wayfinder output, `public/build`, `storage/`, `.claude/skills`) become `root:root`, and the host user (uid 1000) then gets "Permission denied" on the next write.
- After any command that writes into the project through the container (`docker exec tagler-cms-app ...`) or that fails with "Permission denied", run this without asking the user:
  `docker exec tagler-cms-app sh -c 'find /var/www/app \( -path /var/www/app/vendor -o -path /var/www/app/node_modules -o -path /var/www/app/.git \) -prune -o ! -user 1000 -print0 | xargs -0 -r chown -h 1000:1000'`
- Then check with `find . \( -path ./node_modules -o -path ./vendor -o -path ./.git \) -prune -o ! -user $(id -un) -print | wc -l`. The result must be `0`.
- Do not use `sudo` for this. Do not run `chmod -R 777`.
