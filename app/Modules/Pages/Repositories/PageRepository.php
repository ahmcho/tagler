<?php

namespace App\Modules\Pages\Repositories;

use App\Modules\Pages\Enums\PageStatus;
use App\Modules\Pages\Models\Page;
use App\Modules\Pages\Repositories\Contracts\PageRepositoryContract;
use App\Modules\Pages\Support\PagePath;
use Carbon\CarbonInterface;
use Crud\Repositories\EloquentRepository;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class PageRepository extends EloquentRepository implements PageRepositoryContract
{
    public function __construct(Page $model)
    {
        parent::__construct($model);
    }

    public function findOptional(int $id): ?Page
    {
        return $this->model->newQuery()->find($id);
    }

    public function findHomepage(): ?Page
    {
        return $this->model->newQuery()->where('is_homepage', true)->with('translations')->first();
    }

    public function findByLocalizedPath(string $locale, PagePath $path): ?Page
    {
        return $this->model->newQuery()
            ->whereHas('translations', fn (Builder $translations) => $translations
                ->where('locale', $locale)
                ->where('path', $path->value))
            ->with('translations')
            ->first();
    }

    public function countLiveByLocalizedPaths(string $locale, array $paths, CarbonInterface $now): int
    {
        if ($paths === []) {
            return 0;
        }

        return $this->model->newQuery()
            ->whereHas('translations', fn (Builder $translations) => $translations
                ->where('locale', $locale)
                ->whereIn('path', $paths))
            ->whereIn('status', [PageStatus::Published, PageStatus::Scheduled])
            ->where(fn (Builder $query) => $query->whereNull('published_at')->orWhere('published_at', '<=', $now))
            ->count();
    }

    /**
     * @return Collection<int, Page>
     */
    public function childrenOf(Page $page): Collection
    {
        return $this->model->newQuery()->where('parent_id', $page->id)->get();
    }

    /**
     * Sorts by the title in the default locale. Pages with no title in that locale sort first.
     */
    protected function addTitleSorting(Builder $query, string $direction): void
    {
        $direction = strtolower($direction) === 'desc' ? 'desc' : 'asc';

        $query->orderByRaw(
            '(select title from page_translations where page_translations.page_id = pages.id and page_translations.locale = ? limit 1) '.$direction,
            [config('app.locale')],
        );
    }
}
