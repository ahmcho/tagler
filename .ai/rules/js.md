---
paths:
  - 'resources/js/**'
---

# Frontend

## Use the TailAdmin theme

Build UI from `@ahmcho/tailadmin-react` (`Card`, `CardHeader`, `CardBody`, `Table`, `Header`, `Body`, `Row`, `Cell`, `Button`, `Input`, `Select`, `Pagination`, `Alert`, `Modal`). Check the component's `.d.ts` in `node_modules/@ahmcho/tailadmin-react/dist` before you use a prop. Reuse an existing component before you write one.

## Forms

Use Inertia's `useForm` (or `<Form>`), as `resources/js/modules/auth/pages/settings/security.tsx` does. Do not add zod or react-hook-form. Keep server validation keys aligned with the form state. For example, nested `translations.{code}` errors match `form.data.translations`.

## Do not add dependencies without approval

Do not add a package to `package.json` without the user's approval.

## Pages live in their module

Module pages go in `resources/js/modules/{module}/pages/...`. The page resolver in `resources/js/app.tsx` finds them. `Inertia::render('translations/index')` renders `resources/js/modules/translation/pages/translations/index.tsx`.

## Layouts and breadcrumbs

Set `Page.layout = { breadcrumbs: [...] }` as `security.tsx` does.

## Labels

The existing pages use English labels written in the component. Follow that style for module pages unless the user asks for translated UI labels.

## Navigation

Add new admin pages to `resources/js/components/app-sidebar.tsx`.

## Verify

Run `npx tsc --noEmit`, `npx eslint <paths>` and `npx prettier --check <paths>` on the files you touched. Build with `docker exec tagler-cms-app npm run build` when you change UI, because `public/build` is root-owned on the host. Then open the page in a browser before you report it as done.

## Types

Type-only imports use `import type`.
