<?php

namespace App\Modules\Auth\Services\Contracts;

use Crud\Services\Contracts\BaseCrudServiceContract;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;

interface PermissionServiceContract extends BaseCrudServiceContract
{
    /**
     * Permissions whose name contains the term, for the async search select.
     *
     * @return LengthAwarePaginator<int, Model>
     */
    public function search(string $term): LengthAwarePaginator;
}
