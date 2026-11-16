<?php

namespace App\Modules\Auth\Repositories\Contracts;

use Crud\Repositories\Contracts\EloquentRepositoryContract;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface PermissionRepositoryContract extends EloquentRepositoryContract
{
    /**
     * Permissions whose name contains the term, one page.
     */
    public function search(string $term): LengthAwarePaginator;
}
