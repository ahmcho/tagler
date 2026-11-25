<?php

namespace App\Modules\Pages\Services;

use App\Modules\Pages\Models\Page;
use App\Modules\Pages\Models\PageTranslation;
use App\Modules\Pages\Repositories\Contracts\PageRepositoryContract;
use Illuminate\Support\Carbon;

/**
 * Lists the live child pages of a page in one locale, sorted by title. Children
 * without a translation in that locale are left out, as the public site does.
 */
class PageChildrenResolver
{
    public function __construct(private readonly PageRepositoryContract $pages) {}

    /**
     * @return array<int, array{title: string, url: string}>
     */
    public function forTranslation(PageTranslation $translation): array
    {
        $page = $translation->page;

        if (! $page instanceof Page) {
            return [];
        }

        $locale = $translation->locale;

        return $this->pages->liveChildrenOf($page, $locale, Carbon::now())
            ->sortBy(fn (Page $child): string => (string) $child->translationFor($locale)?->title, SORT_NATURAL | SORT_FLAG_CASE)
            ->take((int) config('modules.pages.children.limit'))
            ->map(fn (Page $child): array => [
                'title' => (string) $child->translationFor($locale)?->title,
                'url' => '/'.$locale.'/'.$child->translationFor($locale)?->path,
            ])
            ->values()
            ->all();
    }
}
