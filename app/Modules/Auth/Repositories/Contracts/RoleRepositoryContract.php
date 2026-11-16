<?php

namespace App\Modules\Auth\Repositories\Contracts;

use Crud\Repositories\Contracts\EloquentRepositoryContract;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface RoleRepositoryContract extends EloquentRepositoryContract
{
    /**
     * Roles whose name contains the term, one page, with only id and name.
     */
    public function search(string $term): LengthAwarePaginator;
}
