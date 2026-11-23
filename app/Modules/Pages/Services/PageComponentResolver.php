<?php

namespace App\Modules\Pages\Services;

use App\Modules\Pages\Models\Page;
use App\Modules\Theme\Contracts\ThemeServiceContract;

/**
 * Picks the frontend component that shows a public page. Every page uses the active theme: the homepage uses the
 * theme's `home` template and every other page uses its `page` template. A page with `theme_layout` off uses the
 * plain view. A missing theme or template also falls back to the plain view. The choice is made per request, after the cache read.
 */
class PageComponentResolver
{
    public const string PAGE_VIEW = 'pages/public/show';

    public const string NOT_FOUND_VIEW = 'pages/public/not-found';

    public function __construct(private readonly ThemeServiceContract $themes) {}

    public function forPage(Page $page): string
    {
        if (! $page->theme_layout) {
            return self::PAGE_VIEW;
        }

        return $this->themes->componentFor($page->is_homepage ? 'home' : 'page', self::PAGE_VIEW);
    }

    public function notFound(): string
    {
        return $this->themes->componentFor('not-found', self::NOT_FOUND_VIEW);
    }
}
