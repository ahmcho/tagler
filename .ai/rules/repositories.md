---
paths:
  - 'app/Modules/*/Repositories/**'
---

# Repositories

## Extend the crud base repository

Every repository extends `Crud\Repositories\EloquentRepository` and implements a contract. The contract extends `Crud\Repositories\Contracts\EloquentRepositoryContract` and lives in the module's `Repositories/Contracts/` folder, named `{Name}RepositoryContract`. All database logic stays in repositories.

The base class already provides `all()`, `getAllPaginated()`, `findById()`, `create()`, `update()` and `deleteById()`. Add a method only when the base class cannot express the query.

```php
class UserRepository extends EloquentRepository implements UserRepositoryContract
{
    public function __construct(User $model)
    {
        parent::__construct($model);
    }
}
```

## Bind each contract in the module provider

Do not call `bind()` for a repository in a service provider. List each pair in the module's provider `$repositories` array, for example `UserRepositoryContract::class => UserRepository::class`. The `Crud\Providers\ModuleServiceProvider` base class checks that the implementation implements the contract, then binds it.

A missing pair does not fail when you write the code. It fails when the contract is first resolved.

## Query through `$this->model->newQuery()`

Inside a repository, build queries from the injected `$this->model`, not from a static call such as `SomeModel::query()`. The base class does the same.

## Filter on a non-column with `add{Key}Condition()`

A filter key that is not a column, such as a relation filter, is routed by `applyCustomConditions()` to a protected method named `add{Key}Condition(Builder $query, mixed $value): void` on the repository, when that method exists. The method changes the query it receives. It does not return a new one. See `UserRepository::addRoleCondition()`.

## Trashed-only listing uses `customizeQuery()`

A `deleted_at` condition cannot list trashed rows. The SoftDeletes global scope still removes them. Override `customizeQuery(Builder $query, array $params)` and call `onlyTrashed()` when `$params['trashed'] ?? false` is true. The controller passes `params: ['trashed' => $trashed]` to `getAllPaginated()`.
