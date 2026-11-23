<?php

namespace App\Modules\Pages\Services;

use App\Modules\Pages\Enums\LocaleEnum;
use App\Modules\Pages\Models\Page;
use App\Modules\Pages\Repositories\Contracts\PageRepositoryContract;
use App\Modules\Pages\Support\PagePath;
use Illuminate\Support\Carbon;

/**
 * Maps a public URL (locale and path) to the page that serves it. The page
 * must be live, and so must every ancestor in that locale. Nothing falls back
 * to another locale: a missing translation gives null, and the controller answers 404.
 */
class PageResolver
{
    public function __construct(
        private readonly PageRepositoryContract $pageRepository,
    ) {}

    public function resolve(string $locale, string $rawPath): ?Page
    {
        if (! LocaleEnum::isSupported($locale)) {
            return null;
        }

        $path = PagePath::parse($rawPath, (int) config('modules.pages.max_depth'));

        if ($path === null || $this->isReserved($path)) {
            return null;
        }

        $now = Carbon::now();
        $page = $this->pageRepository->findByLocalizedPath($locale, $path);

        if ($page === null || ! $page->isLive($now)) {
            return null;
        }

        $ancestors = $path->ancestors();

        if ($this->pageRepository->countLiveByLocalizedPaths($locale, $ancestors, $now) !== count($ancestors)) {
            return null;
        }

        return $page;
    }

    /**
     * Reserved names are not allowed as the first path segment. Locale codes are
     * reserved too, because `/{locale}` is the locale homepage.
     */
    private function isReserved(PagePath $path): bool
    {
        $firstSegment = $path->firstSegment();

        if ($firstSegment === null) {
            return false;
        }

        return in_array($firstSegment, array_merge(
            config('modules.pages.reserved_paths', []),
            LocaleEnum::codes(),
        ), true);
    }
}
