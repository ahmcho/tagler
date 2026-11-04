<?php

namespace App\Modules\Translation\Support;

use Illuminate\Contracts\Translation\Loader;
use Illuminate\Database\ConnectionResolverInterface;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

/**
 * Wraps Laravel's default file loader and overlays translations stored in
 * the `translations` table on top of it. Database rows win over file
 * entries when both exist for the same lang/group/key.
 */
class DatabaseTranslationLoader implements Loader
{
    public function __construct(
        private readonly Loader $fileLoader,
        private readonly ConnectionResolverInterface $resolver,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function load($locale, $group, $namespace = null): array
    {
        $fileTranslations = $this->fileLoader->load($locale, $group, $namespace);

        if (($namespace !== null && $namespace !== '*') || $group === '*') {
            return $fileTranslations;
        }

        $dbTranslations = $this->loadFromDatabase(locale: $locale, group: $group);

        if ($dbTranslations === []) {
            return $fileTranslations;
        }

        return array_replace_recursive($fileTranslations, $dbTranslations);
    }

    /**
     * @return array<string, mixed>
     */
    private function loadFromDatabase(string $locale, string $group): array
    {
        try {
            $rows = $this->resolver->connection()
                ->table('translations')
                ->where('lang', $locale)
                ->where('group', $group)
                ->get(['key', 'value']);
        } catch (Throwable $exception) {
            Log::channel('translations')->error('DatabaseTranslationLoader: could not read translations', [
                'locale' => $locale,
                'group' => $group,
                'exception' => $exception,
            ]);

            return [];
        }

        if ($rows->isEmpty()) {
            return [];
        }

        return $this->buildTranslationArray($rows->pluck('value', 'key')->all());
    }

    /**
     * Rebuilds a flat dot-notation key => value map into the nested array
     * shape Laravel's translator expects.
     *
     * @param  array<string, string|null>  $flat
     * @return array<string, mixed>
     */
    private function buildTranslationArray(array $flat): array
    {
        $translations = [];

        foreach ($flat as $key => $value) {
            if (! Str::contains($key, '.')) {
                $translations[$key] = $value;

                continue;
            }

            data_set($translations, $key, $value);
        }

        return $translations;
    }

    public function addNamespace($namespace, $hint): void
    {
        $this->fileLoader->addNamespace($namespace, $hint);
    }

    public function addJsonPath($path): void
    {
        $this->fileLoader->addJsonPath($path);
    }

    /**
     * @return array<string, string>
     */
    public function namespaces(): array
    {
        return $this->fileLoader->namespaces();
    }
}
