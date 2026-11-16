<?php

namespace App\Modules\Auth\Policies;

use App\Models\User;
use App\Modules\Auth\Concerns\HasPermissionCheck;
use App\Modules\Auth\Concerns\HasTranslatedDenialResponse;
use App\Modules\Auth\Models\Permission;
use Illuminate\Auth\Access\Response;

/**
 * Permissions are defined by the modules, so they are read-only here.
 */
class PermissionPolicy
{
    use HasPermissionCheck, HasTranslatedDenialResponse;

    public function viewAny(User $user): Response
    {
        return $this->check(allowed: $this->holdsPermission($user, 'permissions.index'));
    }

    public function view(User $user, Permission $permission): Response
    {
        return $this->check(allowed: $this->holdsPermission($user, 'permissions.show'));
    }
}
