<?php

namespace App\Modules\Auth\Support;

use App\Models\User;
use App\Modules\Auth\Models\Role;
use App\Modules\Auth\Repositories\Contracts\UserRepositoryContract;

/**
 * Keeps at least one user with the Admin role. The check runs before a user is deleted,
 * loses the Admin role, or deletes their own account.
 */
class LastAdminGuard
{
    public function __construct(private readonly UserRepositoryContract $repository) {}

    public function isLastAdmin(User $user): bool
    {
        return $user->hasRole(config('modules.auth.admin_role_name'))
            && $this->repository->countWithRole(config('modules.auth.admin_role_name')) <= 1;
    }
}
