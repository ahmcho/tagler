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

## Denials

Policies return a translated denial message through `HasTranslatedDenialResponse`. Denials return 403. Do not return a generic 500 for a permission failure.
