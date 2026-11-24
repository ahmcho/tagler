---
paths:
  - 'app/Modules/*/Policies/**'
---

# Policies

## Return Response::allow() or Response::deny() with a translated message

Policy methods return `Illuminate\Auth\Access\Response`. Use the `check()` helper from `App\Modules\Auth\Concerns\HasTranslatedDenialResponse`. It returns `Response::allow()`, or `Response::deny()` with `translations.common.forbidden`. Do not return a bare `$user->can(...)` result from a policy.

The trait lives in the Auth module. Other modules import it from there. Do not copy it.
