<?php

declare(strict_types=1);

namespace App\Modules\Translation\Console\Commands;

use App\Modules\Translation\Models\Translation;
use App\Modules\Translation\Support\CachingTranslationLoader;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Throwable;

class SyncFileTranslationsToDatabase extends Command
{
    protected $signature = 'tagler:translations:sync
                            {--locale= : Sync only this locale folder (default: every supported locale)}
                            {--force : Overwrite translations that already exist in the database}';

    protected $description = 'Sync the lang/{locale} files into the translations table';

    /**
     * Sync every supported locale folder, or only the one given by --locale.
     */
    public function handle(): int
    {
        $locales = $this->localesToSync();

        if ($locales === []) {
            $this->error('No supported locale folders found in '.lang_path().'.');

            return Command::FAILURE;
        }

        foreach ($locales as $locale) {
            $this->components->info("Syncing translations for locale: {$locale}");

            $counts = $this->syncLocale($locale, (bool) $this->option('force'));

            $this->table(
                ['Status', 'Count'],
                [
                    ['Synced', $counts['synced']],
                    ['Skipped (already in database)', $counts['skipped']],
                    ['Failed', $counts['failed']],
                ],
                'box'
            );
        }

        $this->flushLoaderCache();

        $this->components->info('Sync complete!');

        return Command::SUCCESS;
    }

    /**
     * The locale folders to sync: the --locale option, or every supported locale that has a folder.
     *
     * @return array<int, string>
     */
    protected function localesToSync(): array
    {
        $supported = array_column(config('app.supported_locales'), 'code');

        if ($this->option('locale') !== null) {
            $locale = (string) $this->option('locale');

            return File::isDirectory(lang_path($locale)) ? [$locale] : [];
        }

        return array_values(array_filter(
            $supported,
            fn (string $locale): bool => File::isDirectory(lang_path($locale)),
        ));
    }

    /**
     * Sync every group file in one locale folder.
     *
     * @return array{synced: int, skipped: int, failed: int}
     */
    protected function syncLocale(string $locale, bool $force): array
    {
        $counts = ['synced' => 0, 'skipped' => 0, 'failed' => 0];

        foreach (File::files(lang_path($locale)) as $file) {
            $fileCounts = $this->processFile($file, $locale, $force);

            $counts['synced'] += $fileCounts['synced'];
            $counts['skipped'] += $fileCounts['skipped'];
            $counts['failed'] += $fileCounts['failed'];
        }

        return $counts;
    }

    /**
     * Process a single translation file. The file name is the group.
     *
     * @return array{synced: int, skipped: int, failed: int}
     */
    protected function processFile(\SplFileInfo $file, string $locale, bool $force): array
    {
        $counts = ['synced' => 0, 'skipped' => 0, 'failed' => 0];

        $group = $file->getFilenameWithoutExtension();

        try {
            $translations = include $file->getPathname();
        } catch (Throwable $e) {
            $this->components->warn("Skipping invalid file: {$file->getFilename()} - {$e->getMessage()}");
            $counts['failed']++;

            return $counts;
        }

        if (! is_array($translations)) {
            $this->components->warn("Skipping invalid file: {$file->getFilename()}");
            $counts['failed']++;

            return $counts;
        }

        foreach ($this->flattenTranslations($translations) as $key => $value) {
            try {
                if ($this->syncTranslation($key, $value, $locale, $group, $force)) {
                    $counts['synced']++;
                } else {
                    $counts['skipped']++;
                }
            } catch (Throwable $e) {
                $this->components->warn("Failed to sync translation: {$group}.{$key} - {$e->getMessage()}");
                $counts['failed']++;
            }
        }

        return $counts;
    }

    /**
     * Writes one translation row. Returns false when the row exists and --force is not set.
     *
     * @param  string  $key  The translation key, without the group prefix
     * @param  string  $value  The translation value
     * @param  string  $locale  The locale
     * @param  string  $group  The translation group
     * @param  bool  $force  Whether to overwrite an existing row
     */
    protected function syncTranslation(string $key, string $value, string $locale, string $group, bool $force): bool
    {
        $exists = Translation::query()
            ->where('lang', $locale)
            ->where('group', $group)
            ->where('key', $key)
            ->exists();

        if ($exists && ! $force) {
            return false;
        }

        Translation::query()->updateOrCreate(
            [
                'lang' => $locale,
                'group' => $group,
                'key' => $key,
            ],
            [
                'value' => $value,
            ]
        );

        return true;
    }

    /**
     * Flatten nested translation arrays into dot-notation keys.
     *
     * @param  array<string, mixed>  $translations  The nested translations array
     * @param  string  $prefix  The current key prefix
     * @return array<string, string> Flattened translations with dot-notation keys
     */
    protected function flattenTranslations(array $translations, string $prefix = ''): array
    {
        $flattened = [];

        foreach ($translations as $key => $value) {
            $fullKey = $prefix !== '' ? "{$prefix}.{$key}" : (string) $key;

            if (is_array($value)) {
                $flattened += $this->flattenTranslations($value, $fullKey);
            } else {
                $flattened[$fullKey] = (string) $value;
            }
        }

        return $flattened;
    }

    /**
     * Forget cached group arrays so the next request reads the synced rows.
     */
    protected function flushLoaderCache(): void
    {
        $loader = app('translation.loader');

        if ($loader instanceof CachingTranslationLoader) {
            $loader->forgetAll();
        }
    }
}
