<?php

namespace App\Modules\Theme\Support;

use App\Modules\Theme\Contracts\ThemeRegistryContract;
use App\Modules\Theme\Exceptions\InvalidThemeException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Finds the theme packages on disk. The scan result is cached, so a request never walks the theme folder.
 */
final class ThemeRegistry implements ThemeRegistryContract
{
    /** Versioned, so a cache written by an older class shape is never read. */
    private const string CACHE_KEY = 'theme.registry.v2';

    private const string LEGACY_CACHE_KEY = 'theme.registry';

    public function __construct(private readonly ThemeManifestParser $parser) {}

    /**
     * The cache holds plain arrays, not objects, so it survives class changes and deploys.
     */
    public function all(): array
    {
        $cached = Cache::rememberForever(
            self::CACHE_KEY,
            fn (): array => array_map(fn (ThemeManifest $theme): array => $theme->toArray(), $this->scan()),
        );

        return array_map(fn (array $theme): ThemeManifest => ThemeManifest::fromArray($theme), $cached);
    }

    public function find(string $slug): ?ThemeManifest
    {
        return $this->all()[$slug] ?? null;
    }

    public function forget(): void
    {
        Cache::forget(self::CACHE_KEY);
        Cache::forget(self::LEGACY_CACHE_KEY);
    }

    /**
     * @return array<string, ThemeManifest>
     */
    private function scan(): array
    {
        $root = (string) config('modules.theme.path');

        if (! is_dir($root)) {
            return [];
        }

        $themes = [];

        foreach (glob($root.'/*', GLOB_ONLYDIR) ?: [] as $folder) {
            try {
                $manifest = $this->parser->parse($folder);
            } catch (InvalidThemeException $exception) {
                Log::warning('Theme skipped: invalid package.', ['folder' => basename($folder), 'reason' => $exception->getMessage()]);

                continue;
            }

            if (isset($themes[$manifest->slug])) {
                Log::warning('Theme skipped: duplicate slug.', ['slug' => $manifest->slug]);

                continue;
            }

            $themes[$manifest->slug] = $manifest;
        }

        ksort($themes);

        return $themes;
    }
}
