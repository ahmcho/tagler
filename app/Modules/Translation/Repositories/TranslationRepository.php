<?php

namespace App\Modules\Translation\Repositories;

use App\Modules\Translation\Models\Translation;
use App\Modules\Translation\Repositories\Contracts\TranslationRepositoryContract;
use Crud\Repositories\EloquentRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Schema;

class TranslationRepository extends EloquentRepository implements TranslationRepositoryContract
{
    /**
     * @var array<string, bool>
     */
    private static array $tableExists = [];

    public function __construct(Translation $model)
    {
        parent::__construct($model);
    }

    public function findAllLocalesFor(string $group, string $key): Collection
    {
        return $this->model->newQuery()
            ->where('group', $group)
            ->where('key', $key)
            ->get();
    }

    public function findDistinctTables(string $lang): array
    {
        return $this->model->newQuery()
            ->where('lang', $lang)
            ->whereNotNull('table')
            ->distinct()
            ->orderBy('table')
            ->pluck('table')
            ->all();
    }

    public function findTableFor(string $group, string $key): ?string
    {
        $prefix = Translation::tableFromKey(group: $group, key: $key);

        if ($prefix === null) {
            return null;
        }

        self::$tableExists[$prefix] ??= Schema::hasTable($prefix);

        return self::$tableExists[$prefix] ? $prefix : null;
    }
}
