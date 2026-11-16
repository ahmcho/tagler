<?php

namespace App\Modules\Auth\Services;

use App\Modules\Auth\Repositories\Contracts\RoleRepositoryContract;
use App\Modules\Auth\Services\Contracts\RoleServiceContract;
use Crud\Services\BaseCrudService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\PermissionRegistrar;

class RoleService extends BaseCrudService implements RoleServiceContract
{
    public function __construct(RoleRepositoryContract $repository)
    {
        parent::__construct($repository);
    }

    public function create(array $payload): Model
    {
        return DB::transaction(function () use ($payload): Model {
            $role = $this->repository->create(['name' => $payload['name'], 'guard_name' => 'web']);

            $role->syncPermissions($payload['permissions'] ?? []);
            $this->forgetPermissionCache();

            return $role;
        });
    }

    public function update(int|Model $modelOrModelId, array $payload): Model
    {
        return DB::transaction(function () use ($modelOrModelId, $payload): Model {
            $role = $this->repository->update($modelOrModelId, ['name' => $payload['name']]);

            $role->syncPermissions($payload['permissions'] ?? []);
            $this->forgetPermissionCache();

            return $role;
        });
    }

    public function search(string $term): LengthAwarePaginator
    {
        return $this->repository->search(term: $term);
    }

    private function forgetPermissionCache(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
