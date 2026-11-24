---
paths:
  - 'app/**'
---

# App

## Service and Repository are the default patterns

Put business logic in a service and database access in a repository. Before you add another design pattern, propose it and wait for approval.

## Traits live in Concerns

First-party traits go in a `Concerns/` folder of the namespace they support, for example `App\Modules\Translation\Concerns\HasTranslations`. Do not create `Traits/` folders.

## Interfaces end with Contract

Interfaces end with `Contract` and live in a `Contracts/` folder. An interface never uses the `Has{Feature}` prefix, because that prefix is for traits.

## Use the crud base classes

Modules that need paged CRUD extend `Crud\Services\BaseCrudService` and `Crud\Repositories\EloquentRepository` from `packages/crud`. Form requests extend `Crud\Requests\AppFormRequest`. The `Crud` namespace is a local path package (`tagler/crud`).

## Blocked actions

Return a `Response::deny(...)` or call `Gate::authorize(...)`. Do not return a generic 500 for a permission failure.

## Blocked deletes throw ModelHasRelationsException

A model that other records depend on cannot be deleted. Its delete guard throws `Crud\Exceptions\ModelHasRelationsException`, an `HttpException` with a translated message. `EloquentRepository::deleteById()` throws the same exception on a foreign-key violation. Do not throw a bare `RuntimeException` or call `abort()` in a repository for this.

In a controller's `destroy()`, catch `ModelHasRelationsException` before a generic `Exception`. Otherwise every failure is reported as "has relations".

## Use ConditionallyLoadsAttributes for array builders

Use `Illuminate\Http\Resources\ConditionallyLoadsAttributes` in array-building classes instead of hand-written conditionals. Pass a closure to `when()` for expensive values.
