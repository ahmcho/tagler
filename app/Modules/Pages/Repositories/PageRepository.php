<?php

namespace App\Modules\Pages\Repositories;

use App\Modules\Pages\Enums\LocaleEnum;
use App\Modules\Pages\Enums\PageStatus;
use App\Modules\Pages\Models\Page;
use App\Modules\Pages\Repositories\Contracts\PageRepositoryContract;
use App\Modules\Pages\Support\PagePath;
use Carbon\CarbonInterface;
use Crud\Repositories\EloquentRepository;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;

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
            ->tap(fn (Builder $query) => $this->whereLiveAt($query, $now))
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
     * @return Collection<int, Page>
     */
    public function dueScheduledPages(CarbonInterface $now): Collection
    {
        return $this->model->newQuery()
            ->where('status', PageStatus::Scheduled)
            ->tap(fn (Builder $query) => $this->whereLiveAt($query, $now))
            ->get();
    }

    /**
     * A page with no publish date is live at once. Otherwise its date and time
     * (time defaults to midnight) must not be after `$now`, the same rule as `Page::publishAt()`.
     *
     * @param  Builder<Page>  $query
     */
    private function whereLiveAt(Builder $query, CarbonInterface $now): void
    {
        $query->where(fn (Builder $live) => $live
            ->whereNull('publish_date')
            ->orWhereRaw("(publish_date + COALESCE(publish_time, time '00:00')) <= ?", [$now->format('Y-m-d H:i:s')]));
    }

    /**
     * @param  Builder<Page>  $query
     */
    protected function addStatusCondition(Builder $query, mixed $status): void
    {
        if (! filled($status)) {
            return;
        }

        $query->where('pages.status', $status);
    }

    /**
     * Live means the same as `Page::isLive()`: a published or scheduled page whose publish time has passed.
     *
     * @param  Builder<Page>  $query
     */
    protected function addLiveCondition(Builder $query, mixed $live): void
    {
        if (! in_array($live, ['1', '0'], true)) {
            return;
        }

        $now = Carbon::now();
        $isLive = fn (Builder $pages) => $this->whereStatusIsLive($pages, $now);

        if ($live === '1') {
            $query->where($isLive);

            return;
        }

        $query->whereNot($isLive);
    }

    /**
     * @param  Builder<Page>  $query
     */
    private function whereStatusIsLive(Builder $query, CarbonInterface $now): void
    {
        $query->whereIn('pages.status', [PageStatus::Published, PageStatus::Scheduled])
            ->tap(fn (Builder $live) => $this->whereLiveAt($live, $now));
    }

    /**
     * @param  Builder<Page>  $query
     */
    protected function addHomepageCondition(Builder $query, mixed $homepage): void
    {
        if (! in_array($homepage, ['1', '0'], true)) {
            return;
        }

        $query->where('pages.is_homepage', $homepage === '1');
    }

    /**
     * Pages without a publish date have no date to match, so they drop out when either bound is set.
     *
     * @param  Builder<Page>  $query
     */
    protected function addPublishFromCondition(Builder $query, mixed $date): void
    {
        if (! filled($date)) {
            return;
        }

        $query->whereDate('pages.publish_date', '>=', $date);
    }

    /**
     * @param  Builder<Page>  $query
     */
    protected function addPublishToCondition(Builder $query, mixed $date): void
    {
        if (! filled($date)) {
            return;
        }

        $query->whereDate('pages.publish_date', '<=', $date);
    }

    /**
     * @param  Builder<Page>  $query
     */
    protected function addTitleCondition(Builder $query, mixed $title): void
    {
        $this->whereDefaultLocaleTranslationLike($query, 'title', $title);
    }

    /**
     * @param  Builder<Page>  $query
     */
    protected function addSubtitleCondition(Builder $query, mixed $subtitle): void
    {
        $this->whereDefaultLocaleTranslationLike($query, 'subtitle', $subtitle);
    }

    /**
     * @param  Builder<Page>  $query
     */
    protected function addSlugCondition(Builder $query, mixed $slug): void
    {
        $this->whereDefaultLocaleTranslationLike($query, 'slug', $slug);
    }

    /**
     * Stored paths have no leading slash, so `/about` and `about` match the same page.
     *
     * @param  Builder<Page>  $query
     */
    protected function addPathCondition(Builder $query, mixed $path): void
    {
        $this->whereDefaultLocaleTranslationLike($query, 'path', ltrim(trim((string) $path), '/'));
    }

    /**
     * Matches the default locale only, the locale the list shows. Case-insensitive.
     *
     * @param  Builder<Page>  $query
     */
    private function whereDefaultLocaleTranslationLike(Builder $query, string $column, mixed $term): void
    {
        $term = trim((string) $term);

        if ($term === '') {
            return;
        }

        $query->whereHas('translations', fn (Builder $translations) => $translations
            ->where('locale', LocaleEnum::default())
            ->whereLike($column, "%{$term}%"));
    }

    /**
     * Sorts by the title in the default locale. Pages with no title in that locale sort first.
     *
     * @param  Builder<Page>  $query
     */
    protected function addTitleSorting(Builder $query, string $direction): void
    {
        $direction = strtolower($direction) === 'desc' ? 'desc' : 'asc';

        $query->orderByRaw(
            '(select title from page_translations where page_translations.page_id = pages.id and page_translations.locale = ? limit 1) '.$direction,
            [LocaleEnum::default()],
        );
    }
}
