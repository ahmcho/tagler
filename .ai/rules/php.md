---
paths:
  - '**/*.php'
---

# PHP

## Imports added in separate edits

Pint removes a `use` import that has no usage when it runs. If you add the import in one edit and the code that uses it in a later edit, Pint can remove the import in between. Add the import and its first use in the same edit, or re-read the file to check the import survived.

## Braces and types

Always use curly braces for control structures. Declare return types and parameter types on every method.

## Constructor promotion

Use constructor property promotion. Do not leave an empty `__construct()` unless it is private.

## HTTP status codes

Use `Symfony\Component\HttpFoundation\Response::HTTP_*` constants, not numbers. Controllers that already import `Inertia\Response` alias it: `use Symfony\Component\HttpFoundation\Response as HttpResponse;`.

## Named arguments

Use named arguments when they make intent clear, such as calls with several parameters of the same type. Do not convert existing calls in bulk.

## Comments

Prefer PHPDoc blocks. Use inline comments only for complex logic.

## Format

Run `vendor/bin/pint --dirty --format agent` on the host after editing PHP. Do not run `--test`.
