<?php

namespace App\Modules\Auth\Services\Contracts;

use App\Modules\Auth\Models\ActivityLog;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface ActivityLogServiceContract
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function getAllPaginated(array $filters, int $perPage): LengthAwarePaginator;

    public function findOrFail(string $id): ActivityLog;
}
