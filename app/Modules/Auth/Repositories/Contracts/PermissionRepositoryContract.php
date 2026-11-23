<?php

namespace App\Modules\Auth\Repositories\Contracts;

use Crud\Repositories\Contracts\EloquentRepositoryContract;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;

interface PermissionRepositoryContract extends EloquentRepositoryContract
{
    /**
     * Permissions whose name contains the term, one page.
     *
     * @return LengthAwarePaginator<int, Model>
     */
    public function search(string $term): LengthAwarePaginator;
}
