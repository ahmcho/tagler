<?php

namespace App\Modules\Auth\Policies;

use App\Models\User;
use App\Modules\Auth\Concerns\HasPermissionCheck;
use App\Modules\Auth\Concerns\HasTranslatedDenialResponse;
use App\Modules\Auth\Models\Role;
use Illuminate\Auth\Access\Response;

class RolePolicy
{
    use HasPermissionCheck, HasTranslatedDenialResponse;

    public function viewAny(User $user): Response
    {
        return $this->check(allowed: $this->holdsPermission($user, 'roles.index'));
    }

    public function view(User $user, Role $role): Response
    {
        return $this->check(allowed: $this->holdsPermission($user, 'roles.show'));
    }

    public function create(User $user): Response
    {
        return $this->check(allowed: $this->holdsPermission($user, 'roles.store'));
    }

    /**
     * The Admin role is fixed and cannot be changed.
     */
    public function update(User $user, Role $role): Response
    {
        if ($role->name === Role::ADMIN) {
            return $this->check(allowed: false);
        }

        return $this->check(allowed: $this->holdsPermission($user, 'roles.update'));
    }

    /**
     * The Admin role is fixed and cannot be deleted.
     */
    public function delete(User $user, Role $role): Response
    {
        if ($role->name === Role::ADMIN) {
            return $this->check(allowed: false);
        }

        return $this->check(allowed: $this->holdsPermission($user, 'roles.destroy'));
    }

    public function logs(User $user, Role $role): Response
    {
        return $this->check(allowed: $this->holdsPermission($user, 'activity-logs.index'));
    }

    public function restore(User $user, Role $role): Response
    {
        return $this->check(allowed: false);
    }

    public function forceDelete(User $user, Role $role): Response
    {
        return $this->check(allowed: false);
    }
}
