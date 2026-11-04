<?php

namespace Crud\Services;

use Crud\Repositories\Contracts\EloquentRepositoryContract;
use Crud\Requests\RequestParser;
use Crud\Services\Contracts\BaseCrudServiceContract;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Query\Expression;
use Illuminate\Support\Collection;

abstract class BaseCrudService implements BaseCrudServiceContract
{
    protected $repository;

    public function __construct(EloquentRepositoryContract $repository)
    {
        $this->repository = $repository;
    }

    public function getAll(array $columns = ['*'], array $relations = []): Collection
    {
        return $this->repository->all($columns, $relations);
    }

    public function getAllPaginated(
        RequestParser $requestParser,
        array $columns = ['*'],
        array $conditions = [],
        array $relations = [],
        array $params = [],
    ): LengthAwarePaginator {
        $options = $this->getQueryOptions($requestParser);

        return $this->repository->getAllPaginated(
            columns: $columns,
            conditions: array_merge($options['conditions'], $conditions),
            relations: array_merge($options['autoRelations'], $relations),
            params: $params,
            sorting: $options['sorting'],
            perPage: $options['perPage'],
            customConditions: $options['customConditions'],
            customSorting: $options['customSorting'],
            customRelations: $options['customRelations'],
        );
    }

    public function pluck(
        string|Expression $column,
        ?string $key = null,
        array $conditions = []
    ): array {
        return $this->repository->pluck($column, $key, $conditions);
    }

    public function create(array $payload): Model
    {
        return $this->repository->create($payload);
    }

    public function findById(
        int|Model $modelOrModelId,
        ?RequestParser $requestParser = null,
        ?array $columns = ['*'],
        ?array $relations = [],
        ?array $appends = []
    ): Model {
        if ($requestParser) {
            $options = $this->getQueryOptions($requestParser);

            $relations = array_merge($options['autoRelations'], $relations);
        }

        return $this->repository->findById(
            $modelOrModelId,
            $columns,
            $relations,
            $options['customRelations'] ?? [],
            $appends
        );
    }

    public function update(int|Model $modelOrModelId, array $payload): Model
    {
        return $this->repository->update($modelOrModelId, $payload);
    }

    public function delete(int|Model $modelOrModelId): bool
    {
        return $this->repository->deleteById($modelOrModelId);
    }

    protected function getQueryOptions(RequestParser $requestParser): array
    {
        return [
            'conditions' => $requestParser->getAutoFilters(),
            'customConditions' => $requestParser->getCustomFilters(),
            'sorting' => $requestParser->getAutoSorting(),
            'customSorting' => $requestParser->getCustomSorting(),
            'autoRelations' => $requestParser->getExpandable(),
            'customRelations' => $requestParser->getCustomExpandable(),
            'perPage' => $requestParser->getPerPage(),
        ];
    }
}
