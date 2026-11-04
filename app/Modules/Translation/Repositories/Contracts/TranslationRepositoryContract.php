<?php

namespace App\Modules\Translation\Repositories\Contracts;

use App\Modules\Translation\Models\Translation;
use Crud\Repositories\Contracts\EloquentRepositoryContract;
use Illuminate\Database\Eloquent\Collection;

interface TranslationRepositoryContract extends EloquentRepositoryContract
{
    /**
     * All locale rows for a single group+key pair.
     *
     * @return Collection<int, Translation>
     */
    public function findAllLocalesFor(string $group, string $key): Collection;

    /**
     * Distinct non-null `table` values for a locale, alphabetically.
     *
     * @return array<int, string>
     */
    public function findDistinctTables(string $lang): array;

    /**
     * The key's prefix, when it names an actual database table.
     */
    public function findTableFor(string $group, string $key): ?string;
}
