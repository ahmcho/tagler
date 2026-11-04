---
paths:
  - 'app/Modules/*/Requests/**'
  - 'app/Modules/*/Resources/**'
---

# Requests and resources

## Requests extend AppFormRequest

Use `Crud\Requests\AppFormRequest`. Set the scenario through the HTTP method: `PUT`/`PATCH` gives `SCENARIO_UPDATE`. Call `$request->parser()` to get automatic filters for `getAllPaginated`.

## Filters echoed to the page

Use the module's `Concerns/FiltersQuery` trait for the Inertia `filters` prop. Its `sortable()` method lists allowed sort columns.

## Resources shape the data

Return a `JsonResource` subclass from `Resources/`. Keep the shape stable so the frontend types match. Pass paginated data as an explicit array: `data`, `current_page`, `last_page`, `total`.
