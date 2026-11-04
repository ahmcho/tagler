<?php

namespace Tests\Feature\Crud\Fixtures;

use Crud\Repositories\EloquentRepository;
use Illuminate\Database\Eloquent\Builder;

class CrudParentRepository extends EloquentRepository implements CrudParentRepositoryContract
{
    public function __construct(CrudParent $model)
    {
        parent::__construct($model);
    }

    protected function addPrefixCondition(Builder $query, string $prefix): void
    {
        $query->whereLike('crud_parents.name', $prefix.'%');
    }

    protected function addRecentSorting(Builder $query, string $direction): void
    {
        $query->orderBy('crud_parents.id', $direction);
    }

    protected function addCustomRelations(Builder $query, array $relations): Builder
    {
        return in_array('children_count', $relations, true)
            ? $query->withCount('children')
            : $query;
    }
}
