<?php

namespace App\Modules\Settings\Rules;

use App\Modules\Settings\Enums\AllowedMimeTypes;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

/**
 * Validates an uploaded file's real MIME type (via UploadedFile::getMimeType(),
 * content-sniffed) against a whitelist. Pair with 'required'/'nullable' in the same rules array.
 * Presence is their job, not this rule's.
 */
class FileUploadRule implements ValidationRule
{
    /**
     * @param  array<int, AllowedMimeTypes>  $mimeTypes
     */
    public function __construct(
        protected array $mimeTypes = [
            AllowedMimeTypes::Png,
            AllowedMimeTypes::Jpeg,
            AllowedMimeTypes::Webp,
            AllowedMimeTypes::Gif,
            AllowedMimeTypes::Bmp,
        ],
    ) {}

    /**
     * Server-side script extensions that must never appear in an uploaded file name.
     *
     * @var array<int, string>
     */
    protected const FORBIDDEN_EXTENSIONS = ['php', 'phtml', 'phar', 'pht', 'phps', 'pgif', 'shtml', 'inc'];

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! ($value instanceof UploadedFile)) {
            $fail(__('translations.common.validation.file_invalid'));

            return;
        }

        if ($this->hasForbiddenExtension($value->getClientOriginalName())) {
            $fail(__('translations.common.validation.file_type', ['attribute' => Str::afterLast($attribute, '.')]));

            return;
        }

        if (! in_array(AllowedMimeTypes::tryFrom((string) $value->getMimeType()), $this->mimeTypes, true)) {
            $fail(__('translations.common.validation.file_type', ['attribute' => Str::afterLast($attribute, '.')]));
        }
    }

    /**
     * Checks every dot-separated segment after the base name, so `shell.php.png` and `shell.PHP` are both caught.
     */
    protected function hasForbiddenExtension(string $fileName): bool
    {
        $segments = array_slice(explode('.', strtolower(trim($fileName))), 1);

        foreach ($segments as $segment) {
            if (in_array(preg_replace('/\d+$/', '', $segment), self::FORBIDDEN_EXTENSIONS, true)) {
                return true;
            }
        }

        return false;
    }
}
