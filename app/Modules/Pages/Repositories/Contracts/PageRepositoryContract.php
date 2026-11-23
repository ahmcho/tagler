<?php

namespace App\Modules\Pages\Repositories\Contracts;

use App\Modules\Pages\Models\Page;
use App\Modules\Pages\Support\PagePath;
use Carbon\CarbonInterface;
use Crud\Repositories\Contracts\EloquentRepositoryContract;
use Illuminate\Database\Eloquent\Collection;

interface PageRepositoryContract extends EloquentRepositoryContract
{
    public function findOptional(int $id): ?Page;

    public function findHomepage(): ?Page;

    /**
     * The page that has this path in this locale, with its translations loaded.
     */
    public function findByLocalizedPath(string $locale, PagePath $path): ?Page;

    /**
     * How many of the given paths, in this locale, belong to a page that is live at the given moment.
     *
     * @param  list<string>  $paths
     */
    public function countLiveByLocalizedPaths(string $locale, array $paths, CarbonInterface $now): int;

    /**
     * @return Collection<int, Page>
     */
    public function childrenOf(Page $page): Collection;

    /**
     * Scheduled pages whose publish time has passed, or that have no publish time.
     *
     * @return Collection<int, Page>
     */
    public function dueScheduledPages(CarbonInterface $now): Collection;
}
