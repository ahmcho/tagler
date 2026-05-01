<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Translation;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Throwable;

class SyncFileTranslationsToDatabase extends Command
{
    protected $signature = 'tagler:translations:sync
                            {--locale=en : The locale to sync}
                            {--force : Override existing database translations}';

    protected $description = 'Sync file-based translations to database';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $locale = $this->option('locale');
        $force = $this->option('force');

        $langPath = lang_path($locale);

        if (! File::exists($langPath)) {
            $this->error("Language directory not found: {$langPath}");

            return Command::FAILURE;
        }

        $files = File::files($langPath);
        $synced = 0;
        $skipped = 0;
        $failed = 0;

        $this->components->info("Syncing translations for locale: {$locale}");
        $this->newLine();

        $this->output->progressStart(count($files));

        foreach ($files as $file) {
            $result = $this->processFile($file, $locale, $force);

            $synced += $result['synced'];
            $skipped += $result['skipped'];
            $failed += $result['failed'];

            $this->output->progressAdvance();
        }

        $this->output->progressFinish();

        $this->newLine();
        $this->components->info('Sync complete!');
        $this->table(
            ['Status', 'Count'],
            [
                ['Synced', $synced],
                ['Skipped', $skipped],
                ['Failed', $failed],
            ],
            'box'
        );

        return Command::SUCCESS;
    }

    /**
     * Process a single translation file.
     *
     * @param  \SplFileInfo  $file  The file to process
     * @param  string  $locale  The locale being synced
     * @param  bool  $force  Whether to override existing translations
     * @return array{synced: int, skipped: int, failed: int}
     */
    protected function processFile(\SplFileInfo $file, string $locale, bool $force): array
    {
        $synced = 0;
        $skipped = 0;
        $failed = 0;

        $group = $file->getFilenameWithoutExtension();

        $path = $file->getPathname();

        if (! File::exists($path)) {
            $this->components->warn("Skipping missing file: {$file->getFilename()}");
            $failed++;

            return ['synced' => $synced, 'skipped' => $skipped, 'failed' => $failed];
        }

        try {
            $translations = include $path;
        } catch (Throwable $e) {
            $this->components->warn("Skipping invalid file: {$file->getFilename()} - {$e->getMessage()}");
            $failed++;

            return ['synced' => $synced, 'skipped' => $skipped, 'failed' => $failed];
        }

        if (! is_array($translations)) {
            $this->components->warn("Skipping invalid file: {$file->getFilename()}");

            return ['synced' => $synced, 'skipped' => $skipped, 'failed' => ++$failed];
        }

        foreach ($this->flattenTranslations($translations, $group) as $key => $value) {
            try {
                $this->syncTranslation($key, $value, $locale, $group, $force);
                $synced++;
            } catch (Throwable $e) {
                $this->components->warn("Failed to sync translation: {$key} - {$e->getMessage()}");
                $failed++;
            }
        }

        return ['synced' => $synced, 'skipped' => $skipped, 'failed' => $failed];
    }

    /**
     * Sync a single translation to the database.
     *
     * @param  string  $key  The translation key
     * @param  string  $value  The translation value
     * @param  string  $locale  The locale
     * @param  string  $group  The translation group
     * @param  bool  $force  Whether to override existing translations
     */
    protected function syncTranslation(string $key, string $value, string $locale, string $group, bool $force): void
    {
        $existing = Translation::where('key', $key)
            ->where('locale', $locale)
            ->first();

        if ($existing && ! $force) {
            return;
        }

        Translation::updateOrCreate(
            [
                'key' => $key,
                'locale' => $locale,
            ],
            [
                'translation' => $value,
                'group' => $group,
            ]
        );
    }

    /**
     * Flatten nested translation arrays into dot-notation keys.
     *
     * @param  array<int, mixed>  $translations  The nested translations array
     * @param  string  $group  The translation group
     * @param  string  $prefix  The current key prefix
     * @return array<string, string> Flattened translations with dot-notation keys
     */
    protected function flattenTranslations(array $translations, string $group, string $prefix = ''): array
    {
        $flattened = [];

        foreach ($translations as $key => $value) {
            $fullKey = $prefix !== '' ? "{$prefix}.{$key}" : "{$group}.{$key}";

            if (is_array($value)) {
                $flattened += $this->flattenTranslations($value, $group, $fullKey);
            } else {
                $flattened[$fullKey] = $value;
            }
        }

        return $flattened;
    }
}
