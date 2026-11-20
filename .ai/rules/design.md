---
paths:
    - 'resources/js/**'
    - 'resources/css/**'
---

# Design

Visual rules for the admin UI. Code rules live in `.ai/rules/js.md`.

## Buttons

- Every button is the TailGrids `Button` from `@/components/tailgrids/core/button`. Text and icon buttons both use size `sm`. This is the default in the core copy.
- Icon-only buttons take `iconOnly`. They become square, 40px (`size-10`).
- Outline text buttons use `py-[9px]` in the core copy. The 1px border then gives the same 40px height as fill buttons.
- Do not set `size` on a button in a page unless the user asks. Do not set button height or width in px. Size comes from the Button props.
- Row action triggers: `<Button variant="ghost" iconOnly aria-label="Actions for row …">`.
- Account menu pill in `app-header.tsx`: `h-10`, to match the 40px buttons.
- Dual-list move buttons (`.rdl-btn` in `resources/css/app.css`): 2.5rem (40px).

Known exceptions, not yet aligned to 40px. Fix them when the user asks:

- Settings tabs: 44px (Profile, Security, Application settings, Appearance) and 36px (General).
- Table sort headers (Name, Email, Status): text buttons, 16px tall.
- Sidebar navigation items: 32px.
- Inline "or you can…" text link on the two-factor challenge page.
- Pagination page buttons: raw `<button>` in `core/pagination.tsx`, 40px.

## Cards and layout

- Use `CardHeader` with `CardTitle` and `CardDescription`, `CardContent` for the body, and `CardFooter` for actions.
- Do not write headings with `text-gray-800` or `text-gray-500`. Those are old TailAdmin classes. Use theme tokens such as `text-title-50` and `text-text-50`.
- Do not nest bordered containers. `TabRoot` has a border and padding by default. The settings layout removes them with `className="gap-10 border-0 p-0"`.
- Do not cap the width of content that fills a panel. Remove `max-w-*`.
- Use `FieldGroup` to stack fields. Put helper text in `FieldDescription` and validation text in `FieldError`. Do not write raw `<label>` or `<p>` for these.

## Dialogs

- The modal card is 400px wide with a centered header.
- It can show a `DialogIcon` badge with `tone` `success` or `danger`.
- Footer buttons share the width.

## Pagination

- Up to 10 pages: show all pages.
- From page 1 to 10: pages 1–10, then the last 2 pages.
- In the middle: 1, 2, a window of 5 around the current page, then the last 2 pages.
- In the last 10 pages: 1, 2, then the last 10 pages.
- Gaps show an ellipsis. The logic is in `getPaginationItems`.
- With more than 10 pages, a "Go to page" input and Go button sit in the bar. Out-of-range input is ignored.
- Below `xl`, the page list and "Go to page" wrap onto a second row under Previous and Next. From `xl`, they sit between the arrows.
- The `summary` line is centered above the bar, for example "Showing 1627 entries".

## Data table toolbar

- Toolbar shows `title` and `subtitle`. The toolbar wraps them on narrow screens.
- Search is full width. Its buttons sit on the row below until `lg`.
- Filter is a button that opens a dialog.
- Bulk actions: a vertical 3-dot menu for the checked rows. It appears only with selection.
- Row actions: a horizontal 3-dot menu.
- The New button sits in the page `subtitle`, guarded by its permission.

## Dual list box

- Used for many-to-many picks, for example role permissions.
- Icons are lucide.
- Styles are the `.react-dual-listbox` and `.rdl-*` rules in `resources/css/app.css`. Their tokens must exist in the `.dark` block.

## Dark mode and color

- Token names come from `resources/css/app.css`. Some core copies are missing theme tokens. The CLI gives light values only. Add dark values by hand in `resources/css/app.css`.
- Tailwind drops a class silently when its token is missing. Check the rendered result.
- Use the theme tokens in `app.css`. Do not use raw `gray-*` palette classes.

## Labels

- Existing pages write English labels in the component. Follow that style for module pages unless the user asks for translated UI labels.

## Review checklist for UI changes

- Check light mode and dark mode, with a screenshot of each.
- Check 390px and 1280px widths.
- Check the keyboard focus ring.
- Measure button heights in the browser. They must match the sizes above.
- Save screenshots only under the project root or `.playwright-mcp/`.

## TailGrids blocks

Source: https://tailgrids.com/blocks. Use blocks as visual reference only. Build the page from the core copies in `resources/js/components/tailgrids/core/`. Do not copy block code. Do not add block files or dependencies.

Blocks that fit this CMS:

- Setting Pages: profile header, then sections with an Edit action. Use for settings and profile pages.
- Forms Layout: field spacing and footer button placement.
- Sidebar, Horizontal Navbar, Mega Menu: app shell and navigation.
- Page Titles: page header with breadcrumbs. Pairs with `Page.layout`.
- Tables: style reference for `ResourceIndexContent`. Use the `components/resource/` parts, not block markup.
- Data Stats, Widget, Charts: dashboard cards and charts.
- Modals, Drawers, Notification, Steps: dialogs, side panels, toasts and wizards.
- Profiles, Select Box, File Upload: profile cards and form widgets.
- Login Signup, Auth: visual reference only. Fortify owns the auth flow.

Not relevant: Marketing, eCommerce, AI, Blog, Cookies and Paywall.

## Adding a core component

- Run `npx @tailgrids/cli@latest add <id> < /dev/null` in a scratch directory outside the project. Then copy the files from `components/tailgrids/core/` into the project.
- Do not run `npx @tailgrids/cli init` in the project. It is interactive and writes config files.
- The `get_component_code` MCP tool fails outside the TailGrids monorepo. Read the docs page with Firecrawl instead, for example `https://tailgrids.com/docs/components/field`.
- `class-variance-authority` and `tailwind-merge` are already in `package.json`. Do not add them again.
