<?php

namespace App\Modules\Auth\Repositories\Contracts;

use App\Models\User;
use Crud\Repositories\Contracts\EloquentRepositoryContract;

interface UserRepositoryContract extends EloquentRepositoryContract
{
    /**
     * Number of users that hold the given role.
     */
    public function countWithRole(string $roleName): int;

    /**
     * The user with the given email, or null when none exists.
     */
    public function findByEmail(string $email): ?User;
}
