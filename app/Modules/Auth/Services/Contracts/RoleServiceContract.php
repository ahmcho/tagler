<?php

namespace App\Modules\Auth\Services\Contracts;

use Crud\Services\Contracts\BaseCrudServiceContract;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;

interface RoleServiceContract extends BaseCrudServiceContract
{
    /**
     * Roles whose name contains the term, for the async search select.
     *
     * @return LengthAwarePaginator<int, Model>
     */
    public function search(string $term): LengthAwarePaginator;

    /**
     * @param  array{name: string, permissions: array<int, int>}  $payload
     */
    public function create(array $payload): Model;

    /**
     * @param  array{name: string, permissions: array<int, int>}  $payload
     */
    public function update(int|Model $modelOrModelId, array $payload): Model;
}
