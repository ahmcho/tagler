<?php

namespace App\Modules\Translation\Support;

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\File;

/**
 * Reads the default strings from `lang/{locale}/{group}.php`, the same files
 * that `tagler:translations:sync` copies into the translations table.
 */
class FileTranslations
{
    /**
     * @var array<string, array<string, mixed>>
     */
    private array $loaded = [];

    /**
     * The file value of a group + key pair for one locale, or null when the
     * file has no scalar value for it.
     */
    public function defaultFor(string $locale, string $group, string $key): ?string
    {
        $path = lang_path("{$locale}/{$group}.php");

        if (! File::isFile($path)) {
            return null;
        }

        $this->loaded[$path] ??= (array) include $path;

        $value = Arr::get($this->loaded[$path], $key);

        return is_scalar($value) ? (string) $value : null;
    }
}
