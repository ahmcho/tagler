<?php

namespace App\Support\Database;

use Illuminate\Support\Facades\Cache;
use Illuminate\Translation\Translator as BaseTranslator;

class Translator extends BaseTranslator
{
    /**
     * Clear all translation cache entries and reset loaded translations.
     *
     * Note: Cache::forget() does not support wildcard patterns with standard
     * cache drivers. For proper wildcard cache clearing, use cache tags or
     * implement a custom cache clearing strategy.
     */
    public function clearCache(): void
    {
        // These specific cache keys must be cleared individually
        // or use cache tags if your driver supports them
        Cache::forget('translations.json');
        Cache::flush();

        $this->loaded = [];
    }

    /**
     * Clear translation cache for a specific locale.
     *
     * @param  string  $locale  The locale to clear (e.g., 'en', 'fr')
     */
    public function clearCacheForLocale(string $locale): void
    {
        Cache::forget("translations.json.{$locale}");

        // The $loaded array structure is: [$namespace][$group][$locale]
        // We need to unset the locale dimension for each namespace/group
        foreach ($this->loaded as $namespace => $groups) {
            foreach ($groups as $group => $locales) {
                unset($this->loaded[$namespace][$group][$locale]);
            }
        }
    }
}
