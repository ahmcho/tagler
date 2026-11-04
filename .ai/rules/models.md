---
paths:
  - 'app/Modules/*/Models/**'
  - 'app/Models/**'
---

# Models

## Models live in their module

Put a module's models in `app/Modules/{Module}/Models`. `App\Models\User` is the only model in `app/Models`.

## Models have no static methods that query the database

Put database access in the module's repository.

## Attributes use the Attribute class

Add new attributes with `Illuminate\Database\Eloquent\Casts\Attribute`, not `get{Name}Attribute()`.

## Traits are named Has{Feature}

Every trait a model uses reads as `Has{Feature}`. Alias vendor traits at the import, for example `use Illuminate\Database\Eloquent\SoftDeletes as HasSoftDeletes;`. Keep vendor names in prose comments.

## Attributes are declared with PHP attributes

Use `#[Fillable([...])]`, `#[Table(name: ...)]` and `#[ObservedBy(...)]` on the class. Do not register an observer in `booted()` when the model can use `#[ObservedBy]`.

Do not register the same observer twice. For example, if a provider calls `Model::observe(...)`, remove the `#[ObservedBy]` attribute.

## Enum casts

A status or flag column uses a PHP enum, cast in `casts()`. Use the same enum in controllers, queries, requests and services. Do not compare with raw strings.

Do not cast a column to an enum when rows may hold values the enum does not list. Keep it a string and convert in the resource layer, for example for the translation `group` column.
