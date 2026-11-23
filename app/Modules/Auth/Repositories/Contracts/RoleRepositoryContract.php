<?php

namespace App\Modules\Auth\Repositories\Contracts;

use Crud\Repositories\Contracts\EloquentRepositoryContract;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;

interface RoleRepositoryContract extends EloquentRepositoryContract
{
    /**
     * Roles whose name contains the term, one page, with only id and name.
     *
     * @return LengthAwarePaginator<int, Model>
     */
    public function search(string $term): LengthAwarePaginator;
}
