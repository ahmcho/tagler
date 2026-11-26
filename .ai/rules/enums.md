---
paths:
  - 'app/**'
---

# Backed enums

## Naming

Every enum class name ends with `Enum`, in every module, for example `PageStatusEnum` or `MediaVisibilityEnum`. The suffix makes enums easy to spot when you scan the code.

## Pass the enum case to queries

Laravel converts a backed enum to its value in query bindings. Pass the case itself to `where`, `whereIn`, `orWhere` and similar methods:

```php
->whereIn('status', [PageStatusEnum::Published, PageStatusEnum::Scheduled])
```

Do not write `->value` in those calls. The conversion happens in `Query\Builder::castBinding()`, which calls `enum_value()`.

## Use ->value only for plain strings

Call `->value` only where PHP needs a string, for example:

- validation rule strings, such as `'required_if:status,'.PageStatusEnum::Scheduled->value`
- string concatenation or interpolation
- arrays that are compared with plain strings

## Check before you change

If you are not sure whether a context converts enums, read the framework source in `vendor/laravel/framework` before you add or remove `->value`.
