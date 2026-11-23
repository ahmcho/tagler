<?php

namespace App\Modules\Pages\Repositories\Contracts;

use App\Modules\Pages\Models\Page;
use App\Modules\Pages\Models\PageRevision;
use Crud\Repositories\Contracts\EloquentRepositoryContract;
use Illuminate\Database\Eloquent\Collection;

interface PageRevisionRepositoryContract extends EloquentRepositoryContract
{
    /**
     * The newest revisions of a page, newest first, with the saving user loaded.
     *
     * @return Collection<int, PageRevision>
     */
    public function latestForPage(Page $page, int $limit): Collection;

    /**
     * The revision only when it belongs to the page. Other pages' revisions give null.
     */
    public function findForPage(Page $page, int $revisionId): ?PageRevision;

    /**
     * Deletes every revision of the page except the newest `$keep`.
     */
    public function pruneForPage(Page $page, int $keep): void;
}
