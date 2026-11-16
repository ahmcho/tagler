<?php

namespace App\Modules\Auth\Repositories\Contracts;

use Crud\Repositories\Contracts\EloquentRepositoryContract;

interface UserRepositoryContract extends EloquentRepositoryContract
{
    /**
     * Number of users that hold the given role.
     */
    public function countWithRole(string $roleName): int;
}
