<?php

namespace App\Modules\Settings\Rules;

use App\Modules\Settings\Enums\ForbiddenMimeTypesEnum;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use ZipArchive;

/**
 * Rejects uploads that could run on the server or the visitor's machine, whatever the file is called.
 * Checks the name, the file signature, PHP tags and the entries of ZIP-based files.
 */
class ExecutableUploadRule implements ValidationRule
{
    /**
     * Signatures of native binaries and scripts, checked at the start of the file.
     *
     * @var array<int, string>
     */
    protected const FORBIDDEN_PREFIXES = [
        'MZ',
        "\x7FELF",
        "\xFE\xED\xFA\xCE",
        "\xFE\xED\xFA\xCF",
        "\xCE\xFA\xED\xFE",
        "\xCF\xFA\xED\xFE",
        "\xCA\xFE\xBA\xBE",
        '#!',
    ];

    /**
     * ZIP local-file and end-of-central-directory signatures.
     *
     * @var array<int, string>
     */
    protected const ZIP_PREFIXES = ["PK\x03\x04", "PK\x05\x06"];

    /**
     * Bytes kept between chunks, so a PHP tag split across two chunks is still found.
     */
    protected const CHUNK_OVERLAP = 16;

    protected const CHUNK_BYTES = 65536;

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! ($value instanceof UploadedFile)) {
            return;
        }

        if (static::isExecutable($value)) {
            $fail(__('translations.common.validation.file_type', ['attribute' => Str::afterLast($attribute, '.')]));
        }
    }

    /**
     * Returns true when the upload is, or contains, something that must not be stored.
     */
    public static function isExecutable(UploadedFile $file): bool
    {
        if (static::hasForbiddenName($file->getClientOriginalName())) {
            return true;
        }

        $path = $file->getRealPath();

        if ($path === false) {
            return true;
        }

        $handle = fopen($path, 'rb');

        if ($handle === false) {
            return true;
        }

        $isText = str_starts_with((string) $file->getMimeType(), 'text/');
        $pattern = $isText ? '/<\?(php|=|\s)/i' : '/<\?php/i';
        $buffer = '';
        $head = null;
        $executable = false;

        while (! feof($handle)) {
            $chunk = fread($handle, self::CHUNK_BYTES);

            if ($chunk === false || $chunk === '') {
                break;
            }

            $head ??= $chunk;
            $buffer = substr($buffer, -self::CHUNK_OVERLAP).$chunk;

            if (preg_match($pattern, $buffer) === 1) {
                $executable = true;
                break;
            }
        }

        fclose($handle);

        if ($executable || static::startsWithAny((string) $head, self::FORBIDDEN_PREFIXES)) {
            return true;
        }

        return static::startsWithAny((string) $head, self::ZIP_PREFIXES) && static::zipHasForbiddenEntry($path);
    }

    /**
     * Checks every dot-separated segment after the base name, so `shell.php.png`, `shell.PHP`,
     * `shell.php.`, `shell.php ` and `shell.php::$DATA` are all caught.
     */
    protected static function hasForbiddenName(string $fileName): bool
    {
        $baseName = basename(str_replace('\\', '/', trim($fileName)));
        $segments = array_slice(explode('.', strtolower($baseName)), 1);

        return array_any($segments, function (string $segment): bool {
            $extension = trim(explode(':', $segment)[0], " .\t\r\n\0");

            return in_array(preg_replace('/\d+$/', '', $extension), ForbiddenMimeTypesEnum::extensions(), true);
        });
    }

    /**
     * Reads the entry names of a ZIP-based file (ZIP, DOCX, XLSX) without extracting anything.
     * Returns true when an entry has a forbidden name or the archive cannot be read.
     */
    protected static function zipHasForbiddenEntry(string $path): bool
    {
        $archive = new ZipArchive;

        if ($archive->open($path) !== true) {
            return true;
        }

        for ($index = 0; $index < $archive->numFiles; $index++) {
            $entryName = $archive->getNameIndex($index);

            if ($entryName === false || static::hasForbiddenName($entryName)) {
                $archive->close();

                return true;
            }
        }

        $archive->close();

        return false;
    }

    /**
     * @param  array<int, string>  $prefixes
     */
    protected static function startsWithAny(string $bytes, array $prefixes): bool
    {
        return array_any($prefixes, fn (string $prefix): bool => str_starts_with($bytes, $prefix));
    }
}
