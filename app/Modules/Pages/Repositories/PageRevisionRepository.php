<?php

namespace App\Modules\Pages\Repositories;

use App\Modules\Pages\Models\Page;
use App\Modules\Pages\Models\PageRevision;
use App\Modules\Pages\Repositories\Contracts\PageRevisionRepositoryContract;
use Crud\Repositories\EloquentRepository;
use Illuminate\Database\Eloquent\Collection;

class PageRevisionRepository extends EloquentRepository implements PageRevisionRepositoryContract
{
    public function __construct(PageRevision $model)
    {
        parent::__construct($model);
    }

    /**
     * @return Collection<int, PageRevision>
     */
    public function latestForPage(Page $page, int $limit): Collection
    {
        return $this->model->newQuery()
            ->where('page_id', $page->id)
            ->with('user')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->limit($limit)
            ->get();
    }

    public function findForPage(Page $page, int $revisionId): ?PageRevision
    {
        return $this->model->newQuery()
            ->where('page_id', $page->id)
            ->whereKey($revisionId)
            ->first();
    }

    public function pruneForPage(Page $page, int $keep): void
    {
        $keptIds = $this->model->newQuery()
            ->where('page_id', $page->id)
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->limit($keep)
            ->pluck('id');

        $this->model->newQuery()
            ->where('page_id', $page->id)
            ->whereNotIn('id', $keptIds)
            ->delete();
    }
}
