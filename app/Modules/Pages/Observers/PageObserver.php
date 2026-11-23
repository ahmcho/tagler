<?php

namespace App\Modules\Pages\Observers;

use App\Modules\Pages\Models\Page;
use App\Modules\Pages\Support\PublicPageCache;

/**
 * Drops the cached public props of a page whenever the page row changes or is deleted.
 */
class PageObserver
{
    public function __construct(private readonly PublicPageCache $cache) {}

    public function saved(Page $page): void
    {
        $this->cache->forgetPage($page->id);
    }

    public function deleted(Page $page): void
    {
        $this->cache->forgetPage($page->id);
    }
}
