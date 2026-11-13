---
paths:
  - 'resources/js/**'
---

# Frontend

## Use the TailGrids components

The UI comes from TailGrids (https://tailgrids.com). Its source is copied into `resources/js/components/tailgrids/core/`. It is not an npm component package. Import components from `@/components/tailgrids/core/...` and use them directly. Do not add wrappers that copy an older API. Do not edit those copies unless the user asks. Local changes to the copies, all documented here:
- `dialog.tsx`: the modal is wrapped in `ModalOverlay` to draw the dimmed backdrop.
- `button.tsx`: the defaults are `variant="primary"`, `appearance="fill"`, `size="md"`.
- `input.tsx`: `ref` is added to the props type.
- `sidebar.tsx`: `useIsMobile` uses `useSyncExternalStore`.
- `tooltip.tsx`: the `react-hooks/refs` lint rule is disabled for the file.

TailGrids uses react-aria. Check the source before you use a prop. For example, `Button` takes `onPress`, not `onClick`, and `isDisabled` is `disabled`. `TextField` passes its value to `onChange` as a string. Use `NativeSelect` for native selects. `PasswordField` in `components/password-field.tsx` is a local composition of TailGrids pieces, because TailGrids has no password input.

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
