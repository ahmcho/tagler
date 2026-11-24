---
paths:
  - 'app/Modules/*/Services/**'
---

# Services

## Business logic in services, database logic in repositories

A service holds the business logic and calls a repository for every database operation. The controller injects the service contract, never a repository.

## Extend BaseCrudService for one model

A service that fronts one Eloquent model extends `Crud\Services\BaseCrudService` and implements a contract. The contract extends `Crud\Services\Contracts\BaseCrudServiceContract`, and lives in `Services/Contracts/` as `{Name}ServiceContract`.

The base class already provides `getAll()`, `getAllPaginated()`, `create()`, `findById()`, `update()` and `delete()`. Add only the extra methods the resource needs, for example `UserService::createWithRole()`.

A service that does not manage one model's CRUD, for example one that only aggregates counts, implements its own contract instead.

## Bind each contract in the module provider

As with repositories, list each contract and implementation pair in the module provider's `$services` array. Do not call `bind()` in a service provider.

## Do not promote the repository constructor parameter

`BaseCrudService` declares `protected $repository` and assigns it in its constructor. A constructor parameter such as `private readonly UserRepositoryContract $repository` redeclares that property, and PHP fails at class load with "Cannot redeclare non-readonly property".

Accept the repository as a plain parameter and pass it to the parent, as `UserService` does:

```php
public function __construct(UserRepositoryContract $repository)
{
    parent::__construct($repository);
}
```

## Inject repositories across modules, not services

When a service needs another model's data, inject that model's repository contract. Ask the user before you inject another service contract.
