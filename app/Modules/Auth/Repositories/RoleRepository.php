<?php

namespace App\Modules\Auth\Repositories;

use App\Modules\Auth\Models\Role;
use App\Modules\Auth\Repositories\Contracts\RoleRepositoryContract;
use Crud\Repositories\EloquentRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class RoleRepository extends EloquentRepository implements RoleRepositoryContract
{
    public function __construct(Role $model)
    {
        parent::__construct($model);
    }

    public function search(string $term): LengthAwarePaginator
    {
        return $this->model->newQuery()
            ->select(['id', 'name'])
            ->where('name', 'like', "%{$term}%")
            ->orderBy('name')
            ->paginate(20);
    }

    /**
     * Roles that hold the given permission.
     */
    protected function addPermissionCondition(Builder $query, mixed $permissionId): void
    {
        $query->whereHas('permissions', fn (Builder $permissions) => $permissions->where('permissions.id', (int) $permissionId));
    }
}
