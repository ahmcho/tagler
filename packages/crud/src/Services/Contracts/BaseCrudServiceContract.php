<?php

namespace Crud\Services\Contracts;

use Crud\Requests\RequestParser;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Query\Expression;
use Illuminate\Support\Collection;

interface BaseCrudServiceContract
{
    public function getAll(array $columns = ['*'], array $relations = []): Collection;

    public function getAllPaginated(
        RequestParser $requestParser,
        array $columns = ['*'],
        array $conditions = [],
        array $relations = [],
        array $params = [],
    ): LengthAwarePaginator;

    public function pluck(
        string|Expression $column,
        ?string $key = null,
        array $conditions = []
    ): array;

    public function create(array $payload): Model;

    public function findById(
        int|Model $modelOrModelId,
        ?RequestParser $requestParser = null,
        ?array $columns = ['*'],
        ?array $relations = [],
        ?array $appends = []
    ): Model;

    public function update(int|Model $modelOrModelId, array $payload): Model;

    public function delete(int|Model $modelOrModelId): bool;
}
