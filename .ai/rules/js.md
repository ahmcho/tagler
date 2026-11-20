---
paths:
    - 'resources/js/**'
---

# Frontend

Visual rules (sizes, spacing, layout, colors, copy style) live in `.ai/rules/design.md`.

## Use the TailGrids components

The UI comes from TailGrids (https://tailgrids.com). Its source is copied into `resources/js/components/tailgrids/core/`. It is not an npm component package. Import components from `@/components/tailgrids/core/...` and use them directly. Do not add wrappers that copy an older API. Do not edit those copies unless the user asks. Local changes to the copies, all documented here:

- `dialog.tsx`: the modal is wrapped in `ModalOverlay` to draw the dimmed backdrop.
- `button.tsx`: the defaults are `variant="primary"`, `appearance="fill"`, `size="sm"`. Outline text buttons use `py-[9px]`, so the border keeps the same height as fill buttons.
- `input.tsx`: `ref` is added to the props type.
- `sidebar.tsx`: `useIsMobile` uses `useSyncExternalStore`.
- `tooltip.tsx`: the `react-hooks/refs` lint rule is disabled for the file.
- `text-field.tsx`: `validationBehavior` defaults to `'aria'`. React Aria's default is `'native'`, which sets a custom validity message from the `invalid` prop. The browser then blocks submit, and the server error is never cleared. With `'aria'`, server errors show on the field without blocking the next submit. Server validation is the only validation, so `required` does not block submit either.
- `pagination.tsx`: the page list logic is in `getPaginationItems`. The optional `summary` prop renders a line above the bar. `DataTable` passes it through `pagination.summary` and shows the bar when there is more than one page or a summary.

TailGrids uses react-aria. Check the source before you use a prop. For example, `Button` takes `onPress`, not `onClick`, and `isDisabled` is `disabled`. `TextField` passes its value to `onChange` as a string. Use `NativeSelect` for native selects. `PasswordField` in `components/password-field.tsx` is a local composition of TailGrids pieces, because TailGrids has no password input.

`SelectField` in `components/select-field.tsx` is the default for a single select with a list of string options. Pass `label`, `value`, `onChange`, `options` and optionally `allOptionLabel`, where `''` means "all". Use the TailGrids `Select` parts from `core/select.tsx` directly only when you need sections, custom items or multiple selection.

`DualListBox` (`components/dual-list-box.tsx`) wraps `react-dual-listbox` for picking many items from one list. Pass `options`, `value` (ids), `onChange` and `hasError`. The package ships no types, so `resources/js/types/react-dual-listbox.d.ts` declares them.

`DataTable` (`components/data-table.tsx`) has optional props: `title` and `subtitle` (string or React node), `search` (controlled, submits on Enter), `filter` (opens a `Dialog` with the children as the body), and `bulkActions` (needs `selection`). Use `downloadCsv` from `utils/download-csv.ts` for CSV exports.

## Resource pages

`components/resource/` holds the shared parts of the resource pages. List pages use three parts:

- `ResourcePage` is the shell. It sets the `Head` title, the status alert and the action bar (pass `actions`, for example "New role", or `false` to hide it). Breadcrumbs stay on the page as `Page.layout`.
- `ResourceIndexContent` is the list. Pass `rows`, `columns`, `getRowId`, `query` (the server `filters` prop), `pagination`, and optionally `search`, `filters`, `rowActions` and `bulkActions`. It uses `DataTable` and shows the row count in the pagination bar.
- `useResourceIndex` (in `use-resource-index.ts`) holds the Inertia requests: sort, page, apply, reset and selection. Reloads use `only: [dataKey, 'filters', 'status']`.

Filters are declared as fields: `select`, `text`, or `searchable` (async, with a `loadOptions` from `useSearch`). Row and bulk actions take `onAction(target, { onSuccess })`. Set `confirm` to show the shared confirm dialog. The dialog closes only when `onSuccess` runs, so a failed request keeps it open. Selection is on only when `bulkActions` is set.

On list pages, put the New button in the `subtitle` prop, guarded by the permission: `subtitle={ability('x.store') ? <Button …/> : undefined}`.

Create and edit pages use the shared form in `components/resource/`:

- `ResourceForm` (`resource-form.tsx`) is the one form. It renders the card, the fields and the Back and submit buttons. The model id decides the mode: `!model.id` means create (POST to `storeUrl`), an id means update (PUT to `updateUrl`). The title, the submit label and any field that differs between the two come from that check. Use the render function `({ isCreating }) => …` for those fields. Do not pass an `isEdit` prop.
- `ResourceCreateContent` and `ResourceEditContent` wrap `ResourceForm` in `ResourcePage`. Use the one that matches the route. Both take the same props.
- Pages pass the model from the controller as the `model` prop. Create sends an empty model (`new Model` with an empty relation, serialized through its Resource). Edit sends the route-bound model. Use `storeUrl` on create pages and `updateUrl` on edit pages. Pass `null` for the other.
- Fields live in the page's feature folder (for example `modules/auth/components/role-form.tsx`). They render fields only. They do not render the `<form>` or the buttons.

Show pages will go in the same folder later.

## Forms

Use Inertia's `useForm` (or `<Form>`), as `resources/js/modules/auth/pages/settings/security.tsx` does. Every `<form>` and `<Form>` gets `noValidate`. The browser then shows no default bubbles, and the server's validation errors appear in the theme through `FieldError`. Do not add zod or react-hook-form. Keep server validation keys aligned with the form state. For example, nested `translations.{code}` errors match `form.data.translations`.

## Do not add dependencies without approval

Do not add a package to `package.json` without the user's approval.

## Pages live in their module

Module pages go in `resources/js/modules/{module}/pages/...`. The page resolver in `resources/js/app.tsx` finds them. `Inertia::render('translations/index')` renders `resources/js/modules/translation/pages/translations/index.tsx`.

## Layouts and breadcrumbs

Set `Page.layout = { breadcrumbs: [...] }` as `security.tsx` does.

## Navigation

Add new admin pages to `resources/js/components/app-sidebar.tsx`.

## Verify

Run `npx tsc --noEmit`, `npx eslint <paths>` and `npx prettier --check <paths>` on the files you touched. Build with `docker exec tagler-cms-app npm run build` when you change UI, because `public/build` is root-owned on the host. Then open the page in a browser before you report it as done. Design checks: see `.ai/rules/design.md`.

## Types

Type-only imports use `import type`.
