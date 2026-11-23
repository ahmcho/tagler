<?php

namespace App\Modules\Pages\Observers;

use App\Modules\Pages\Models\PageTranslation;
use App\Modules\Pages\Support\PublicPageCache;

/**
 * Drops the cached public props of the page a translation belongs to. A path change in a parent saves its
 * descendants' translations, so each child is invalidated too.
 */
class PageTranslationObserver
{
    public function __construct(private readonly PublicPageCache $cache) {}

    public function saved(PageTranslation $translation): void
    {
        $this->cache->forgetPage($translation->page_id);
    }

    public function deleted(PageTranslation $translation): void
    {
        $this->cache->forgetPage($translation->page_id);
    }
}
