<?php

namespace Crud\Repositories;

use Crud\Exceptions\ModelHasRelationsException;
use Crud\Repositories\Contracts\EloquentRepositoryContract;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Query\Expression;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

abstract class EloquentRepository implements EloquentRepositoryContract
{
    protected $model;

    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    public function all(array $columns = ['*'], array $relations = []): Collection
    {
        return $this->model->newQuery()
            ->with($relations)
            ->get($this->reformatColumns($columns));
    }

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
    ): LengthAwarePaginator {
        $query = $this->filteredQuery(
            conditions: $conditions,
            relations: $relations,
            params: $params,
            customConditions: $customConditions ?? [],
        )->addSelect($this->reformatColumns($columns));

        if ($customSorting) {
            $query = $this->applyCustomSorting($query, $customSorting);
        } elseif ($sorting) {
            $this->applySorting($query, $sorting);
        }

        if ($customRelations) {
            $query = $this->addCustomRelations($query, $customRelations);
        }

        return $query->paginate($perPage);
    }

    public function allTrashed(): Collection
    {
        return $this->model->onlyTrashed()->get();
    }

    public function count(array $conditions = []): int
    {
        $query = $this->model->newQuery();

        $this->customizeQuery($query, []);
        $this->applyConditions($query, $conditions);

        return $query->count();
    }

    public function findById(
        int|Model $modelOrModelId,
        array $columns = ['*'],
        array $relations = [],
        array $customRelations = [],
        array $appends = []
    ): Model {
        if (is_int($modelOrModelId)) {
            $query = $this->model->newQuery()
                ->select($this->reformatColumns($columns))
                ->with($relations);

            if ($customRelations) {
                $query = $this->addCustomRelations($query, $customRelations);
            }

            $model = $query->findOrFail($modelOrModelId);
        } else {
            $model = $modelOrModelId;
        }

        return $model->append($appends);
    }

    public function findTrashedById(int $modelId): Model
    {
        return $this->model->withTrashed()->findOrFail($modelId);
    }

    public function findOnlyTrashedById(int $modelId): Model
    {
        return $this->model->onlyTrashed()->findOrFail($modelId);
    }

    public function pluck(
        string|Expression $column,
        ?string $key = null,
        array $conditions = []
    ): array {
        $query = $this->model->newQuery();

        $this->applyConditions($query, $conditions);

        return $query->pluck($column, $key)->all();
    }

    public function create(array $payload): Model
    {
        return $this->model->create($payload)->refresh();
    }

    public function update(int|Model $modelOrModelId, array $payload): Model
    {
        $model = is_int($modelOrModelId) ? $this->findById($modelOrModelId) : $modelOrModelId;

        $model->update($payload);

        return $model;
    }

    public function updateOrCreate(array $attributes, array $payload = []): Builder|Model
    {
        return $this->model->newModelQuery()->updateOrCreate($attributes, $payload);
    }

    public function deleteById(int|Model $modelOrModelId): bool
    {
        $model = is_int($modelOrModelId) ? $this->findById($modelOrModelId) : $modelOrModelId;

        try {
            DB::transaction(fn () => $model->delete());
        } catch (QueryException $exception) {
            if (! $this->isForeignKeyViolation($exception)) {
                throw $exception;
            }

            throw new ModelHasRelationsException(previous: $exception);
        }

        return true;
    }

    /**
     * SQLSTATE class 23 (integrity constraint violation) covers MySQL/SQLite
     * '23000' and PostgreSQL '23503'. Other failures, such as a lost
     * connection, are real errors and must not be mapped.
     */
    private function isForeignKeyViolation(QueryException $exception): bool
    {
        return str_starts_with((string) $exception->getCode(), '23');
    }

    public function restoreById(int $modelId): bool
    {
        return $this->findOnlyTrashedById($modelId)->restore();
    }

    public function permanentlyDeleteById(int $modelId): bool
    {
        return $this->findTrashedById($modelId)->forceDelete();
    }

    /**
     * The filter half of the listing pipeline (query customization, custom
     * conditions, plain conditions) without columns, sorting or paging — so
     * an unpaginated consumer such as an export applies exactly the filters
     * the paginated index does.
     */
    protected function filteredQuery(
        array $conditions = [],
        array $relations = [],
        array $params = [],
        array $customConditions = [],
    ): Builder {
        $query = $this->model->newQuery()->with($relations);

        $this->customizeQuery($query, $params);

        $query = $this->applyCustomConditions($query, $customConditions);
        $this->applyConditions($query, $conditions);

        return $query;
    }

    protected function customizeQuery(Builder $query, array $params): void
    {
        // Override in a subclass to apply query customizations that don't
        // fit the automatic condition/sorting/relation pipeline.
    }

    protected function reformatColumns(array $columns, ?string $tableName = null): array
    {
        $tableName ??= $this->model->getTable();

        foreach ($columns as &$column) {
            if (! Str::contains($column, '.')) {
                $column = "{$tableName}.{$column}";
            }
        }

        return $columns;
    }

    protected function addCustomConditions(Builder $query, array $filters): Builder
    {
        return $query;
    }

    protected function addCustomSorting(Builder $query, string $attr, string $direction): Builder
    {
        return $query;
    }

    protected function addCustomRelations(Builder $query, array $relations): Builder
    {
        return $query;
    }

    protected function applyConditions(Builder $query, array $conditions): void
    {
        $tableName = $this->model->getTable();

        foreach ($conditions as $condition) {
            $column = "{$tableName}.{$condition[0]}";

            match (strtolower($condition[1])) {
                'like' => $query->whereLike($column, $condition[2]),
                'not like' => $query->whereNotLike($column, $condition[2]),
                default => $query->where($column, $condition[1], $condition[2]),
            };
        }
    }

    protected function applyCustomConditions(Builder $query, array $customConditions): Builder
    {
        foreach ($customConditions as $key => $condition) {
            $method = $this->dynamicMethodFor('Condition', $key);

            if (method_exists($this, $method)) {
                $this->{$method}($query, $condition);
            } else {
                $query = $this->addCustomConditions($query, $customConditions);
            }
        }

        return $query;
    }

    protected function applyCustomSorting(Builder $query, string $customSorting): Builder
    {
        [$attr, $direction] = $this->splitSortingDirective($customSorting);

        $method = $this->dynamicMethodFor('Sorting', $attr);

        if (method_exists($this, $method)) {
            $this->{$method}($query, $direction);

            return $query;
        }

        return $this->addCustomSorting($query, $attr, $direction);
    }

    protected function applySorting(Builder $query, string $sorting): void
    {
        [$attr, $direction] = $this->splitSortingDirective($sorting);

        $query->orderBy($this->model->getTable().".{$attr}", $direction);
    }

    /**
     * @return array{0: string, 1: 'ASC'|'DESC'}
     */
    private function splitSortingDirective(string $directive): array
    {
        $attr = ltrim($directive, '-');

        return [$attr, $directive === $attr ? 'ASC' : 'DESC'];
    }

    private function dynamicMethodFor(string $suffix, string $key): string
    {
        return 'add'.Str::studly($key).$suffix;
    }
}
