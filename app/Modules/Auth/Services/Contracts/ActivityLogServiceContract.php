<?php

namespace App\Modules\Auth\Services\Contracts;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface ActivityLogServiceContract
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function getAllPaginated(array $filters, int $perPage): LengthAwarePaginator;
}
