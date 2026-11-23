<?php

namespace App\Modules\Pages\Services;

use App\Modules\Pages\Models\Page;
use App\Modules\Theme\Contracts\ThemeServiceContract;

/**
 * Picks the frontend component that shows a public page. The homepage uses the theme's `home` template when the
 * active theme provides one. Every other page uses the plain view. The choice is made per request, after the cache read.
 */
class PageComponentResolver
{
    public const string PAGE_VIEW = 'pages/public/show';

    public const string NOT_FOUND_VIEW = 'pages/public/not-found';

    public function __construct(private readonly ThemeServiceContract $themes) {}

    public function forPage(Page $page): string
    {
        return $page->is_homepage
            ? $this->themes->componentFor('home', self::PAGE_VIEW)
            : self::PAGE_VIEW;
    }

    public function notFound(): string
    {
        return $this->themes->componentFor('not-found', self::NOT_FOUND_VIEW);
    }
}
