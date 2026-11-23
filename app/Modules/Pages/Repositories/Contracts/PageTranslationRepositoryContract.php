<?php

namespace App\Modules\Pages\Repositories\Contracts;

use App\Modules\Pages\Models\Page;
use App\Modules\Pages\Models\PageTranslation;
use Crud\Repositories\Contracts\EloquentRepositoryContract;
use Illuminate\Database\Eloquent\Collection;

interface PageTranslationRepositoryContract extends EloquentRepositoryContract
{
    /**
     * @return Collection<int, PageTranslation>
     */
    public function forPage(Page $page): Collection;

    public function find(Page $page, string $locale): ?PageTranslation;

    public function pathIsTaken(string $locale, string $path, ?int $ignorePageId = null): bool;

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function save(Page $page, string $locale, array $attributes): PageTranslation;

    public function deleteForLocale(Page $page, string $locale): void;
}
