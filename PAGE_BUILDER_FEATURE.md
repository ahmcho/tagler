# Page Builder: Status and Remaining Work

Local planning note. It stays out of git. Add it to `.gitignore` if you want it hidden.
Last updated: 2026-11-24.

---

## 1. Status

| Area | Status |
|---|---|
| Slice 1: pages, routing, homepage, admin list and forms | Done |
| Slice 2: sections, elements, registry, validation, public rendering | Done (image, video, gallery deferred) |
| Slice 3: section editor, drag and drop, TipTap rich text, schema-driven fields, date picker, flags | Done (see 3.2 for limits) |
| Multilingual pages (per-locale slugs, titles, content, URLs) | Done |
| Public pages: plain HTML, no admin styles, plain 404 | Done |
| Slice 4: theme system (default theme: home and page templates) | Done. Dev site seeded, default theme active. The `theme_layout` migration is run on `tagler_cms`. |
| Slice 5: functional components and lifecycle | Done (first component: `child-pages`; see 4) |
| Slice 6: preview, revisions, caching, scheduled command | Done. Migration `2026_11_23_100000` run on `tagler_cms`. |

Tests: full PHP suite passes (470 tests, 2 skipped, checked 2026-11-24). Vitest passes (30 tests).

---

## 2. Decisions

| Topic | Decision |
|---|---|
| Module | `app/Modules/Pages` |
| Admin routes | All module routes live under `/admin`. Fortify uses the same prefix. The public site stays at the root. |
| Database | PostgreSQL. |
| Translations | `page_translations`, one row per locale: title, subtitle, slug, path, SEO fields, content (`jsonb`). Not `model_translations`, because per-locale paths need a unique index and that table falls back to another locale. |
| URLs | `/` is the default-locale homepage. `/{locale}` is the locale homepage. `/{locale}/{path}` is any other page. No fallback between locales. Locale codes are reserved slugs. |
| Homepage | Partial unique index on `pages.is_homepage WHERE is_homepage`. The homepage path is `/`. Unpublishing keeps the flag, and `/` returns 404 until the page is live again. |
| Child pages | A child is served only when it and every ancestor are live in that locale. A child needs a translation in each locale its parent has. |
| Publish date and time | `publish_date` (date) and `publish_time` (time) in the app timezone (UTC). Replaces `published_at`. Scheduled pages must be later than now. |
| Content | One `jsonb` document per locale, `version: 1`. Sections and elements have UUIDs. Unknown top-level and element keys are kept. |
| Element types | Registry of classes listed in `config/pages.php`. The database stores only the type key. |
| Raw HTML | Needs `pages.html`. Sanitised with `symfony/html-sanitizer` on save and on output. |
| Public rendering | Plain semantic HTML with `data-layout` and `data-background` on sections. Every page uses the active theme unless `theme_layout` is off (Slice 4). |
| Themes | Packages in `app/Modules/Theme/themes/{slug}`, read from `theme.json` only. The active theme is the settings key `active_theme`. |
| Public cache | Render props only, per page and locale. Invalidated by observers and by theme activation. |
| Authorization | Controllers use `authorizeResource()` and `resourceAbilityMap()`. No manual `Gate::authorize()` (see `.ai/rules/controllers.md`). |

---

## 3. What is built

### 3.1 Pages and translations

- `pages`: locale-independent data. Status (`PageStatus` enum), `is_homepage`, `parent_id`, `layout`, `theme_layout`, `publish_date` (date) and `publish_time` (time).
- `page_translations`: per-locale fields and content.
- Publication: `published` and `scheduled` are live when `publish_date` is empty, or when `publish_date` plus `publish_time` (midnight if empty) is not after now. `draft` is never live. The same rule is in `Page::publishAt()` / `Page::isLive()` and in the repository SQL (`whereLiveAt`).
- Publish date and time use the app timezone (UTC).
- Scheduled pages need a publish date and time later than now. The server checks this in `PageRequest` (error on `publish_time`). The form repeats the check and disables past days in the calendar while the status is Scheduled. Drafts may keep past dates.
- Delete is blocked while a page has children.
- Reshape migration `2026_11_21_100000_reshape_pages_for_translations` moved per-locale fields out of `pages`. It was tested in both directions.
- Split migration `2026_11_23_121614_split_published_at_into_date_and_time_on_pages_table` replaced `published_at` with `publish_date` and `publish_time`. It backfills both columns, and `down()` rebuilds `published_at`. It was tested in both directions on a scratch copy and run on `tagler_cms`.
- Revisions saved before the split still open correctly: the form reads their old `published_at` value.

### 3.2 Admin editor

- List: sortable by title and updated date. Shows flags for languages and status badges. Row actions: View online, Edit, Publish or Unpublish, Set as homepage (only when live), Delete.
- Create and edit:
  - Parent, status (Tailgrids select, with an info button that explains scheduling), publish date (Tailgrids date picker) and publish time (`TimePicker`, a Tailgrids-style popover with hour, minute and AM/PM columns, stored as `HH:mm`), layout key.
  - Language tabs with flags. Each locale has its own title, subtitle, slug, SEO fields and sections.
  - Section editor: layout, show or hide, move, duplicate, remove, drag and drop.
  - Element editor: add, move, remove, drag and drop. Fields come from each element's schema.
  - TipTap rich text for paragraphs, with bold, italic, strike, lists, quote, link, undo and redo.
- Limits:
  - Elements cannot move between sections.
  - Keyboard drag and drop does not work in the browser (tested 2026-11-23). Space and the arrow keys do not move sections or elements. The grips are pointer only. Use the up and down buttons.
  - Section background: a select beside Layout. Keys are `none`, `light`, `dark`, `primary` (`modules.pages.backgrounds`).

### 3.3 Content elements

| Type | Data | Notes |
|---|---|---|
| `heading` | `text`, `level` (1 to 6) | Level error message is readable. |
| `paragraph` | `html` | TipTap output, sanitised. |
| `markdown` | `source` | Raw HTML escaped. Links limited to http, https, mailto, relative. |
| `html` | `source` | Needs `pages.html`. Sanitised. |
| `button` | `label`, `url`, `target` | Refuses `javascript:` and other unsafe schemes. |
| `spacer` | `height` (sm, md, lg) | Renders an empty element with `data-height`. Size comes from the theme. |
| `divider` | none | Renders `<hr>`. |
| `quote` | `text`, `cite` | Renders `<blockquote>`. |
| `child-pages` | `title`, `limit` (5, 10, 20), `order` (`title`, `updated`) | Functional component. Lists live child pages in the current locale, resolved on every render. See 4. |

Not built: `image`, `video`, `gallery`. Waiting for the media library.

### 3.4 Public pages

- Served at `/`, `/{locale}` and `/{locale}/{path}`.
- Every page uses the active theme. The homepage uses the `home` template and other pages use `page`. A page with `theme_layout` off uses the plain view. A missing theme also gives the plain view. Not-found pages use the theme's `not-found` template, with the same props shape (`page` and no sections).
- Root view `public.blade.php` loads only `resources/js/public.tsx`. No admin stylesheet, font or progress bar.
- Missing or unpublished pages return a plain 404 page.
- Title and description come from the page through Inertia `Head`.
- Unknown section layouts and element types are skipped and logged.

### 3.5 Tests

- `tests/Unit/Pages`: path value object, URL check, HTML sanitiser.
- `tests/Feature/Pages`: admin CRUD, validation, homepage hand-over, public routing, content documents, registry, public rendering, admin list and forms, scheduled publishing, revisions, preview, public page cache, functional components and render events.
- `tests/Feature/Theme`: theme registry, activation and permissions, public rendering of the theme homepage.
- `resources/js/theme/*.test.ts(x)`: vitest, Node environment. Runtime name parsing, lazy loading, and the default theme's exports and home template.
- `resources/js/modules/pages/elements/child-pages.test.tsx`: the child-pages renderer.
- `tests/Feature/AdminRoutesTest.php`: `/admin` prefix and logout redirect.

---

## 4. Remaining work

### Slice 4: theme system (complete, 2026-11-23)
- Module `app/Modules/Theme`. Themes are folders in `app/Modules/Theme/themes/{slug}`. The folder name must equal the slug.
- The registry reads `theme.json` only, validated with `opis/json-schema` against `config/theme-manifest.schema.json`. It checks the slug, the entry module, each template file, and Tagler and PHP compatibility. Invalid themes are logged and skipped. The scan is cached as plain arrays (`theme.registry.v2`).
- The active theme is the setting `active_theme`. `SettingServiceContract::setString()` writes it. It is not in `SettingKeyEnum`, so it stays off the settings page.
- Activation needs `themes.activate`, runs in a transaction, and flushes the public page cache. Permissions: `themes.index`, `themes.activate`.
- Every public page (including previews) uses the active theme. The homepage uses `home` and other pages use `page`. Component name `theme/{slug}/{key}`. A page with `theme_layout` off, or a missing or invalid active theme, uses `pages/public/show`.
- Per-page flag `theme_layout` (boolean, default on), set by the toggle on the page form. Added by migration `2026_11_23_110000_add_theme_layout_to_pages_table`.
- Frontend: `resources/js/theme/` holds the contract, the `@/theme/api` module (the only CMS import a theme may use), and a lazy runtime. `public.tsx` resolves theme names asynchronously. Each theme is its own chunk, and its CSS loads only when it is used.
- The default theme provides `home` and `page`, sharing one layout. Its stylesheet is `resources/css/theme.css` in the theme.
- Meta tags are sent in the HTML response by `resources/views/public.blade.php`, from the page props: `<title>`, `description` (when set), `og:type`, `og:locale` (for example `en_GB`, from the locale country config), `og:title`, `og:description` (when set), `canonical` and `og:url`. Not-found pages get a `<title>` in the request language, from the URL's locale segment. The client `Head` (`PageHead`, shared by the theme and the plain page) uses the same `data-inertia` / `head-key` keys, so each tag appears once.
- Canonical and `og:url` point to the default-locale translation. The address is `APP_URL` plus `/{default}/{path}`, or `APP_URL/` for the homepage. It does not depend on the request host, because the props are cached. A page with no default-locale translation has no canonical link.
- SSR is off for public pages (`PagesServiceProvider`). The dev server's SSR head replaced the view's tags, and `public.tsx` has no SSR entry.
- `app.default_locale` (from `APP_LOCALE`) is the site default. `app.locale` changes on each request, so `LocaleEnum::default()` does not use it.
- Tests: `tests/Feature/Theme` (registry, activation, public rendering). `resources/js/theme/*.test.ts(x)` run with `npm test` (vitest, Node environment, no DOM).
- Deviations from the spec, for this slice only:
  - No ZIP installer, no `themes` table, no install history. The list comes from disk.
  - Templates are built into the app at build time, not loaded at runtime.
  - No theme settings, tokens or customisation, no export, no theme preview page, no theme commands.
  - Not-found pages use the theme's `not-found` template (default theme: yes). A theme without it gets the plain 404 view.
- `@testing-library/react` was installed with the approved packages, but no test uses it. A DOM environment was not approved.
- Dev site (`tagler_cms`, 2026-11-23): `RolesAndPermissionsSeeder` was run for `themes.*`. The default theme was activated in the admin. Checked in the browser on the homepage (before all pages were themed): `/`, `/en` and the homepage preview used the theme.
- Fixed during the check: the theme registry cache now stores plain arrays under `theme.registry.v2`. Objects in the cache could not be read back.
- Changing `theme.json` or a theme's templates needs the registry cache cleared, for example `php artisan tinker --execute 'app(\App\Modules\Theme\Contracts\ThemeRegistryContract::class)->forget();'`. A theme command is still to come.
- Theme abilities are registered in `AbilityRegistry` so the admin list can show the Activate action.

### Slice 5: functional components (complete, 2026-11-24)
- A functional component is a dynamic content element. It implements `DynamicContentElement` and is listed in `modules.pages.components`. It is also registered in `ContentElementRegistry` (the provider checks the interface at boot).
- Stored data is config only (flat fields, so the editor needs no change). `present()` must not read live data.
- `resolve()` runs on every request, after the cache read, in `PageRenderer::finalize()`. Preview uses it too. A component that throws is logged and renders without its extra props.
- Events in `app/Modules/Pages/Events/`: `PageResolving` (public requests, before resolve), `PageRendering` and `PageRendered` (every render, with `isPreview`). Listeners observe only.
- First component: `child-pages` (title, number of pages 5/10/20, order by title or last updated). Lists live children with a translation in the current locale. Renders in `resources/js/modules/pages/elements/child-pages.tsx`.
- Tests: `tests/Feature/Pages/FunctionalComponentTest.php`, `child-pages.test.tsx`. Full PHP suite: 470 passed, 2 skipped. Vitest: 30 passed.
- Browser (dev site): element added and saved, public page and preview list the live child with `/en/services/web`. Only English was tested. Azerbaijani and Russian were not. Dev data was restored after the check.
- Not built: a second component; a component editor for nested config; caching the component output (by design, output is per request).

### Slice 6: production features (done 2026-11-23)
- Preview: admin link per locale opens a signed link (`modules.pages.preview.minutes`, default 30). Shows the saved version, with `noindex` and `no-store`.
- Revisions: one saved on each create and update, pruned to `modules.pages.revisions.keep` (default 50). Restore opens the revision in the edit form. Nothing changes until the user saves.
- Scheduled command `tagler:pages:publish-scheduled` runs every minute. It publishes due `scheduled` pages. Visitors see no change, because live status already uses the publish time.
- Public page cache: render props only, one key per page and locale. Invalidated by model observers and by `PublicPageCache::flushAll()`. The live check runs on every request.
- The cache version hook (`PublicPageCache::flushAll()`) is used by theme activation.
- Revisions UI checked in the browser on the dev site: history list, open-a-version notice, preview link.

### Smaller gaps in slices 1 to 3
- Image, video and gallery elements. Needs the media library.
- Section settings: `background` is validated on save and has an editor (done 2026-11-23). Other setting keys are kept but not validated.
- Element `version`: stored, but no upgrade path is implemented.
- Moving elements between sections.
- Keyboard drag and drop: tested in the browser, does not work. Grips are pointer only. Keyboard users use the up and down buttons. Cause not found. Pointer drag was not tested.

---

## 5. Changes from the original design

- Services are `PageService`, `PageResolver` and `PagePath`. The original names `PagePathService` and `HomepageService` were not used.
- The repository methods are `findByLocalizedPath`, `countLiveByLocalizedPaths`, `findHomepage` and others. The original `findPublishedByPath` was not used.
- Reserved paths live in `config/pages.php`, not `config/modules.php`.
- Unknown layouts are rejected on save. The original design kept them and showed a warning.
- Element classes implement `schema()`, `present()`, `normalize()`, `messages()` and `requiresPermission()`.
- `quote` was built, although the original design deferred it.
- The paragraph element stores HTML from TipTap, not plain text.
- Functional components implement `DynamicContentElement`, which adds `resolve()`. `present()` stays cache-safe: config only.

---

## 6. Open decisions (answered)

1. Unpublished homepage: `/` returns 404 until a page is live again. Flag kept.
2. Child of a non-live parent: 404.
3. Element output: props for React, sanitised on the server.
4. Dependencies: approved and installed (TipTap, dnd-kit, country flag icons, Tailgrids date picker and calendar, `@internationalized/date`, `symfony/html-sanitizer`).
5. Database: PostgreSQL.
6. Migrations on `tagler_cms`: approved for testing. Rollbacks and fresh migrations need approval.
