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

## Eager load the relations a Resource reads

A Resource that reads a relation needs that relation loaded in the query. Otherwise each row runs its own query (N+1). Reuse the child Resource when its fields fit the parent. When the child has fields the parent does not need, create a slimmer Resource. Use the `laravel-best-practices` skill when you write or review Resources.

## Validation rules look up their own data

Do not pass data that a custom rule can look up itself (a closure, an id list or a repository) into the rule's constructor. The rule resolves what it needs. The Request passes only the subject, for example the bound model.
