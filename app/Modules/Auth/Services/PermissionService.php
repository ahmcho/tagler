<?php

namespace App\Modules\Auth\Services;

use App\Modules\Auth\Repositories\Contracts\PermissionRepositoryContract;
use App\Modules\Auth\Services\Contracts\PermissionServiceContract;
use Crud\Services\BaseCrudService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class PermissionService extends BaseCrudService implements PermissionServiceContract
{
    public function __construct(PermissionRepositoryContract $repository)
    {
        parent::__construct($repository);
    }

    public function search(string $term): LengthAwarePaginator
    {
        return $this->repository->search(term: $term);
    }
}
