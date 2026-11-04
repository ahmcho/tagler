<?php

namespace App\Modules\Translation\Support;

use App\Modules\Translation\Enums\TranslationGroupEnum;
use Illuminate\Contracts\Translation\Loader;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Cache;

/**
 * Decorator around another Loader that caches load() results forever,
 * keyed by locale/group/namespace. Invalidation is precise (one lang+group
 * at a time) rather than a blanket flush. See TranslationObserver.
 */
class CachingTranslationLoader implements Loader
{
    public function __construct(
        private readonly Loader $inner,
        private readonly Application $app,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function load($locale, $group, $namespace = null): array
    {
        return Cache::rememberForever(
            $this->cacheKey(locale: $locale, group: $group, namespace: $namespace),
            fn () => $this->inner->load($locale, $group, $namespace),
        );
    }

    /**
     * Invalidates the cached array for one locale+group, and resets the
     * resolved Translator so it re-reads on next use.
     */
    public function forgetGroup(string $locale, string $group, ?string $namespace = null): void
    {
        Cache::forget($this->cacheKey(locale: $locale, group: $group, namespace: $namespace));
        $this->app->forgetInstance('translator');
    }

    /**
     * Invalidates every configured locale+group pair. For bulk writes (for
     * example an upsert) that bypass Eloquent events.
     */
    public function forgetAll(): void
    {
        foreach (config('app.supported_locales') as $locale) {
            foreach (TranslationGroupEnum::cases() as $group) {
                $this->forgetGroup(locale: $locale['code'], group: $group->value);
            }
        }
    }

    public function addNamespace($namespace, $hint): void
    {
        $this->inner->addNamespace($namespace, $hint);
    }

    public function addJsonPath($path): void
    {
        $this->inner->addJsonPath($path);
    }

    /**
     * @return array<string, string>
     */
    public function namespaces(): array
    {
        return $this->inner->namespaces();
    }

    /**
     * Laravel's Translator calls the loader with namespace '*' for the
     * default group, so match that here.
     */
    private function cacheKey(string $locale, string $group, ?string $namespace): string
    {
        return "translations:loaded:{$locale}:{$group}:".($namespace ?? '*');
    }
}
