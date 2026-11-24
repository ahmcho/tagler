---
paths:
  - 'app/Modules/*/Controllers/**'
---

# Controllers and authorization

## Do not call Gate::authorize() by hand

Authorize controller actions through the resource map, not with manual `Gate::authorize()` calls in each method.

- Call `$this->authorizeResource(Model::class, 'parameter')` in the constructor.
- For custom actions, list them in `resourceAbilityMap()`. Use the same ability names as the policy:

```php
protected function resourceAbilityMap(): array
{
    return array_merge(parent::resourceAbilityMap(), [
        'publish' => 'publish',
        'unpublish' => 'publish',
    ]);
}
```

The base class attaches a `can:` middleware for each listed method. Check it with `php artisan route:list -v --name=<route>`.

Do not write `Gate::authorize()` in a controller method unless the user asks for it.
Only use a manual check when the authorization depends on data the middleware cannot see, and say so in the code's PHPDoc.

Every custom action that has no route-bound model must also be listed in `resourceMethodsWithoutModels()`. Otherwise the middleware tries to resolve a route parameter that does not exist.

## Any JsonResource in an Inertia prop needs ->resolve()

`JsonResource` implements `Responsable`, not `Arrayable`. Inertia serializes it through `toResponse()`, which wraps the output in `data`. A resource in a prop therefore arrives as `{ data: {...} }`, or double-wrapped when you nest it in your own array. The symptom is a field that is `undefined` in the frontend, or an SSR error such as "Cannot read properties of undefined".

Call `->resolve()` before you pass the value to `Inertia::render()`: `UserResource::make($user)->resolve()` or `UserResource::collection($users)->resolve()`.

## Controllers use service contracts, never repositories

A controller injects the service contract. The service calls the repository. Business logic stays in the service.

## authorizeResource() must get the route parameter name

`Route::resource('object-type', ...)` creates the wildcard `{object_type}`. Pass that exact name as the second argument: `authorizeResource(ObjectType::class, 'object_type')`. The default is the snake-case model name, so a single-word resource needs no second argument. If you rename the parameter with `->parameters([...])`, pass the new name too.

On a mismatch, show, update and destroy return 403 for every user. Index, create and store still work.

## Pass columns: to getAllPaginated()

Do not rely on the `['*']` default. Pass `columns:` with exactly the fields the Resource reads. Relations in `relations:` need no entry in `columns:`. Use named arguments:

```php
$paginator = $this->service->getAllPaginated(
    requestParser: $request->parser(),
    columns: ['id', 'name', 'created_at'],
    relations: ['permissions'],
);
```

## Do not load full option lists for dropdowns

Do not pass a whole lookup table to a page on every request. Add a `search` action that returns one page of `{id, name}` matches, and let the form load options as the user types.

## Do not name an Inertia prop like a shared prop

A page prop with the same name as a key from `HandleInertiaRequests::share()` replaces that shared value on the page. Use a different name, for example `records` instead of `translations`.

React also strips the props `key` and `ref`, so a prop with either name arrives as `undefined`. Use a name such as `translationKey`.

## Name validated data `$payload`

```php
$payload = $request->validated();
```

Use `$payload`, not `$data`, so every controller reads the same way.

## Denials

Policies return a translated denial message through `HasTranslatedDenialResponse`. Denials return 403. Do not return a generic 500 for a permission failure.
