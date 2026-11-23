<?php

namespace App\Modules\Pages\Support;

use App\Modules\Pages\Enums\LocaleEnum;
use Closure;
use Illuminate\Support\Facades\Cache;

/**
 * Caches the render props of a public page, one entry per page and locale. Entries are removed when the page
 * changes, and every entry is renewed when the global version changes (for example on a theme change).
 * The cache holds props only. The live check runs on every request, before the cache is read.
 */
final class PublicPageCache
{
    private const string VERSION_KEY = 'pages.public.version';

    /**
     * @param  Closure(): array<string, mixed>  $callback
     * @return array<string, mixed>
     */
    public function remember(int $pageId, string $locale, Closure $callback): array
    {
        /** @var array<string, mixed> $props */
        $props = Cache::remember(
            $this->key($pageId, $locale),
            now()->addSeconds((int) config('modules.pages.cache.ttl')),
            $callback,
        );

        return $props;
    }

    /**
     * Removes the cached props of a page in every supported locale.
     */
    public function forgetPage(int $pageId): void
    {
        foreach (LocaleEnum::codes() as $locale) {
            Cache::forget($this->key($pageId, $locale));
        }
    }

    /**
     * Invalidates every page at once, for example after a theme change.
     */
    public function flushAll(): void
    {
        Cache::forever(self::VERSION_KEY, $this->version() + 1);
    }

    private function key(int $pageId, string $locale): string
    {
        return "pages.public.{$this->version()}.{$pageId}.{$locale}";
    }

    private function version(): int
    {
        return (int) Cache::rememberForever(self::VERSION_KEY, fn (): int => 1);
    }
}
