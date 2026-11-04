<?php

namespace Crud\Repositories\Contracts;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Query\Expression;

interface EloquentRepositoryContract
{
    public function all(array $columns = ['*'], array $relations = []): Collection;

    public function getAllPaginated(
        array $columns = ['*'],
        array $conditions = [],
        array $relations = [],
        array $params = [],
        ?string $sorting = null,
        ?int $perPage = 20,
        ?array $customConditions = [],
        ?string $customSorting = null,
        ?array $customRelations = [],
    ): LengthAwarePaginator;

    public function allTrashed(): Collection;

    public function count(array $conditions = []): int;

    public function findById(
        int|Model $modelOrModelId,
        array $columns = ['*'],
        array $relations = [],
        array $customRelations = [],
        array $appends = []
    ): Model;

    public function findTrashedById(int $modelId): Model;

    public function findOnlyTrashedById(int $modelId): Model;

    public function pluck(
        string|Expression $column,
        ?string $key = null,
        array $conditions = []
    ): array;

    public function create(array $payload): Model;

    public function updateOrCreate(array $attributes, array $payload = []): Builder|Model;

    public function update(int|Model $modelOrModelId, array $payload): Model;

    public function deleteById(int|Model $modelOrModelId): bool;

    public function restoreById(int $modelId): bool;

    public function permanentlyDeleteById(int $modelId): bool;
}
