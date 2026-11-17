<?php

namespace App\Modules\Auth\Policies;

use App\Models\User;
use App\Modules\Auth\Concerns\HasTranslatedDenialResponse;
use App\Modules\Auth\Models\Role;
use Illuminate\Auth\Access\Response;

class RolePolicy
{
    use HasTranslatedDenialResponse;

    public function viewAny(User $user): Response
    {
        return $this->check(allowed: $user->can('roles.index'));
    }

    public function view(User $user, Role $role): Response
    {
        return $this->check(allowed: $user->can('roles.show'));
    }

    public function create(User $user): Response
    {
        return $this->check(allowed: $user->can('roles.store'));
    }

    /**
     * The permission picker on the role form: users who can list or create roles.
     */
    public function searchPermissions(User $user): Response
    {
        return $this->check(allowed: $user->can('roles.index') || $user->can('roles.store'));
    }

    /**
     * The Admin role is fixed and cannot be changed.
     */
    public function update(User $user, Role $role): Response
    {
        if ($role->name === config('modules.auth.admin_role_name')) {
            return $this->check(allowed: false);
        }

        return $this->check(allowed: $user->can('roles.update'));
    }

    /**
     * The Admin role is fixed and cannot be deleted.
     */
    public function delete(User $user, Role $role): Response
    {
        if ($role->name === config('modules.auth.admin_role_name')) {
            return $this->check(allowed: false);
        }

        return $this->check(allowed: $user->can('roles.destroy'));
    }

    public function logs(User $user, Role $role): Response
    {
        return $this->check(allowed: $user->can('activity-logs.index'));
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
