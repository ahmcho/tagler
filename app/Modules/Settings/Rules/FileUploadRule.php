<?php

namespace App\Modules\Settings\Rules;

use App\Modules\Settings\Enums\AllowedMimeTypesEnum;
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
     * @param  array<int, AllowedMimeTypesEnum>  $mimeTypes
     */
    public function __construct(
        protected array $mimeTypes = [
            AllowedMimeTypesEnum::Png,
            AllowedMimeTypesEnum::Jpeg,
            AllowedMimeTypesEnum::Webp,
            AllowedMimeTypesEnum::Gif,
            AllowedMimeTypesEnum::Bmp,
        ],
    ) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! ($value instanceof UploadedFile)) {
            $fail(__('translations.common.validation.file_invalid'));

            return;
        }

        if (ExecutableUploadRule::isExecutable($value)) {
            $fail(__('translations.common.validation.file_type', ['attribute' => Str::afterLast($attribute, '.')]));

            return;
        }

        if (! in_array(AllowedMimeTypesEnum::tryFrom((string) $value->getMimeType()), $this->mimeTypes, true)) {
            $fail(__('translations.common.validation.file_type', ['attribute' => Str::afterLast($attribute, '.')]));
        }
    }
}
