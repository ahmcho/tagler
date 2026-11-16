<?php

namespace App\Modules\Auth\Services\Contracts;

use Crud\Services\Contracts\BaseCrudServiceContract;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface PermissionServiceContract extends BaseCrudServiceContract
{
    /**
     * Permissions whose name contains the term, for the async search select.
     */
    public function search(string $term): LengthAwarePaginator;
}
