---
paths:
  - 'composer.json'
  - 'composer.lock'
  - 'package.json'
  - 'package-lock.json'
---

# Dependencies

Do not add, remove or upgrade a package without the user's approval.

## Installing the locked set is setup, not a change

`composer install` from the existing `composer.lock` is allowed. It installs the local `tagler/crud` path package (`vendor/tagler/crud` symlink). Run it on the host or in the container.

## npm

Use the existing `package-lock.json`. Do not run `npm install <pkg>` without approval.
