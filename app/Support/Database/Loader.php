<?php

declare(strict_types=1);

namespace App\Support\Database;

use App\Models\Translation;
use Illuminate\Contracts\Translation\Loader as LoaderInterface;
use Illuminate\Support\Facades\Cache;
use Illuminate\Translation\FileLoader;

class Loader implements LoaderInterface
{
    /**
     * Creates a new database translation loader instance.
     *
     * @param  FileLoader  $fileLoader  The fallback file loader
     * @param  bool  $cacheEnabled  Enable caching of translation queries
     * @param  int  $cacheTtl  Cache time-to-live in seconds (default 24 hours)
     */
    public function __construct(
        protected FileLoader $fileLoader,
        protected bool $cacheEnabled = true,
        protected int $cacheTtl = 86400, // 24 hours
    ) {}

    /**
     * Load translations for the given locale, group, and namespace.
     *
     * @param  string  $locale  The locale to load translations for
     * @param  string  $group  The translation group (or '*' for JSON)
     * @param  string|null  $namespace  The namespace (null for global)
     * @return array<string, mixed> The merged translations
     */
    public function load($locale, $group, $namespace = null): array
    {
        $fileLines = $this->fileLoader->load($locale, $group, $namespace);

        if ($namespace !== null && $namespace !== '*') {
            return $fileLines;
        }

        if ($group === '*' && $namespace === '*') {
            return $this->loadJsonFromDatabase($locale, $fileLines);
        }

        return $this->loadGroupFromDatabase($locale, $group, $fileLines);
    }

    /**
     * Load JSON translations from the database.
     *
     * @param  string  $locale  The locale to load translations for
     * @param  array<string, mixed>  $fileLines  The file-based translations to merge with
     * @return array<string, mixed> The merged translations
     */
    protected function loadJsonFromDatabase(string $locale, array $fileLines): array
    {
        $cacheKey = "translations.json.{$locale}";

        return $this->getCached(
            $cacheKey,
            fn () => $this->fetchTranslations($locale, $fileLines, $cacheKey),
        );
    }

    /**
     * Load group translations from the database.
     *
     * @param  string  $locale  The locale to load translations for
     * @param  string  $group  The translation group
     * @param  array<string, mixed>  $fileLines  The file-based translations to merge with
     * @return array<string, mixed> The merged translations
     */
    protected function loadGroupFromDatabase(string $locale, string $group, array $fileLines): array
    {
        $cacheKey = "translations.{$group}.{$locale}";

        return $this->getCached(
            $cacheKey,
            fn () => $this->fetchTranslations($locale, $fileLines, $cacheKey, $group),
        );
    }

    /**
     * Fetch translations from the database.
     *
     * @param  string  $locale  The locale to fetch translations for
     * @param  array<string, mixed>  $fileLines  The file-based translations to merge with
     * @param  string  $cacheKey  The cache key (unused, kept for compatibility)
     * @param  string|null  $group  The optional translation group filter
     * @return array<string, mixed> The merged translations
     */
    protected function fetchTranslations(
        string $locale,
        array $fileLines,
        string $cacheKey,
        ?string $group = null,
    ): array {
        $query = Translation::where('locale', $locale);

        if ($group !== null) {
            $query->where(function ($q) use ($group) {
                $q->where('group', $group)
                    ->orWhere('key', 'like', "{$group}.%");
            });
        }

        $dbTranslations = $query
            ->get()
            ->mapWithKeys(function ($translation) use ($group) {
                $key = $group !== null
                    ? str_replace("{$group}.", '', $translation->key)
                    : $translation->key;

                return [$key => $translation->translation];
            })
            ->toArray();

        return array_merge($fileLines, $dbTranslations);
    }

    /**
     * Get a cached value or compute and cache it.
     *
     * @param  string  $key  The cache key
     * @param  callable(): array<string, mixed>  $callback  The callback to compute the value
     * @return array<string, mixed> The cached or computed value
     */
    protected function getCached(string $key, callable $callback): array
    {
        if (! $this->cacheEnabled) {
            return $callback();
        }

        return Cache::remember($key, $this->cacheTtl, $callback);
    }

    /**
     * Add a new namespace to the loader.
     *
     * @param  string  $namespace  The namespace identifier
     * @param  string  $hint  The directory hint for the namespace
     */
    public function addNamespace($namespace, $hint): void
    {
        $this->fileLoader->addNamespace($namespace, $hint);
    }

    /**
     * Add a new JSON path to the loader.
     *
     * @param  string  $path  The path to add
     */
    public function addJsonPath($path): void
    {
        $this->fileLoader->addJsonPath($path);
    }

    /**
     * Get all registered namespaces.
     *
     * @return array<string, string> Map of namespace to directory hints
     */
    public function namespaces(): array
    {
        return $this->fileLoader->namespaces();
    }

    /**
     * Clear all translation cache entries.
     */
    public function clearCache(): void
    {
        Cache::flush();
    }

    /**
     * Clear translation cache for a specific locale.
     *
     * @param  string  $locale  The locale to clear cache for
     */
    public function clearCacheForLocale(string $locale): void
    {
        $this->clearJsonCacheForLocale($locale);
        $this->clearGroupCacheForLocale($locale);
    }

    /**
     * Clear JSON translation cache for a specific locale.
     *
     * @param  string  $locale  The locale to clear cache for
     */
    protected function clearJsonCacheForLocale(string $locale): void
    {
        Cache::forget("translations.json.{$locale}");
    }

    /**
     * Clear group translation cache for a specific locale.
     *
     * @param  string  $locale  The locale to clear cache for
     */
    protected function clearGroupCacheForLocale(string $locale): void
    {
        /** @var array<int, string> $groups */
        $groups = Translation::query()
            ->where('locale', $locale)
            ->distinct('group')
            ->pluck('group');

        foreach ($groups as $group) {
            Cache::forget("translations.{$group}.{$locale}");
        }
    }
}
