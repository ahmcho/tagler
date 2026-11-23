<?php

namespace App\Modules\Auth\Services;

use App\Modules\Auth\Repositories\Contracts\PermissionRepositoryContract;
use App\Modules\Auth\Services\Contracts\PermissionServiceContract;
use Crud\Services\BaseCrudService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;

class PermissionService extends BaseCrudService implements PermissionServiceContract
{
    public function __construct(PermissionRepositoryContract $repository)
    {
        parent::__construct($repository);
    }

    /**
     * @return LengthAwarePaginator<int, Model>
     */
    public function search(string $term): LengthAwarePaginator
    {
        return $this->repository->search(term: $term);
    }
}
