<?php

namespace App\Modules\Auth\Repositories;

use App\Modules\Auth\Models\Permission;
use App\Modules\Auth\Repositories\Contracts\PermissionRepositoryContract;
use Crud\Repositories\EloquentRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class PermissionRepository extends EloquentRepository implements PermissionRepositoryContract
{
    public function __construct(Permission $model)
    {
        parent::__construct($model);
    }

    public function search(string $term): LengthAwarePaginator
    {
        return $this->model->newQuery()
            ->select(['id', 'name', 'description'])
            ->where('name', 'like', "%{$term}%")
            ->orderBy('name')
            ->paginate(20);
    }
}
