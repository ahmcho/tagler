<?php

namespace App\Modules\Auth\Concerns;

use App\Models\User;

/**
 * Checks a permission name without throwing when the permission does not exist.
 */
trait HasPermissionCheck
{
    private function holdsPermission(User $user, string $permissionName): bool
    {
        return $user->getAllPermissions()->contains('name', $permissionName);
    }
}
