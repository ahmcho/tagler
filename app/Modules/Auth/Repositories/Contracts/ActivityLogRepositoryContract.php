<?php

namespace App\Modules\Auth\Repositories\Contracts;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface ActivityLogRepositoryContract
{
    /**
     * @param  array<string, mixed>  $filters  Keys: event, subject_type, subject_id, causer_id, sort, direction
     */
    public function getAllPaginated(array $filters, int $perPage): LengthAwarePaginator;
}
