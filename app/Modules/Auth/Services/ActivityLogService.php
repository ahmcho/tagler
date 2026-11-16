<?php

namespace App\Modules\Auth\Services;

use App\Modules\Auth\Repositories\Contracts\ActivityLogRepositoryContract;
use App\Modules\Auth\Services\Contracts\ActivityLogServiceContract;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ActivityLogService implements ActivityLogServiceContract
{
    public function __construct(private readonly ActivityLogRepositoryContract $repository) {}

    public function getAllPaginated(array $filters, int $perPage): LengthAwarePaginator
    {
        return $this->repository->getAllPaginated(filters: $filters, perPage: $perPage);
    }
}
