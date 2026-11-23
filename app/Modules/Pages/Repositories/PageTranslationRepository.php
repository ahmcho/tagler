<?php

namespace App\Modules\Pages\Repositories;

use App\Modules\Pages\Models\Page;
use App\Modules\Pages\Models\PageTranslation;
use App\Modules\Pages\Repositories\Contracts\PageTranslationRepositoryContract;
use Crud\Repositories\EloquentRepository;
use Illuminate\Database\Eloquent\Collection;

class PageTranslationRepository extends EloquentRepository implements PageTranslationRepositoryContract
{
    public function __construct(PageTranslation $model)
    {
        parent::__construct($model);
    }

    /**
     * @return Collection<int, PageTranslation>
     */
    public function forPage(Page $page): Collection
    {
        return $this->model->newQuery()->where('page_id', $page->id)->get();
    }

    public function find(Page $page, string $locale): ?PageTranslation
    {
        return $this->model->newQuery()->where('page_id', $page->id)->where('locale', $locale)->first();
    }

    public function pathIsTaken(string $locale, string $path, ?int $ignorePageId = null): bool
    {
        return $this->model->newQuery()
            ->where('locale', $locale)
            ->where('path', $path)
            ->when($ignorePageId !== null, fn ($query) => $query->where('page_id', '!=', $ignorePageId))
            ->exists();
    }

    public function save(Page $page, string $locale, array $attributes): PageTranslation
    {
        return $this->model->newQuery()->updateOrCreate(
            ['page_id' => $page->id, 'locale' => $locale],
            $attributes,
        );
    }

    public function deleteForLocale(Page $page, string $locale): void
    {
        $this->model->newQuery()->where('page_id', $page->id)->where('locale', $locale)->delete();
    }
}
