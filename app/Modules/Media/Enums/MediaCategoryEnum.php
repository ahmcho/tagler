<?php

namespace App\Modules\Media\Enums;

use App\Modules\Settings\Enums\AllowedMimeTypesEnum;

enum MediaCategoryEnum: string
{
    case Pictures = 'pictures';
    case Videos = 'videos';
    case Audio = 'audio';
    case Documents = 'documents';
    case Other = 'other';

    /**
     * Derives the category from a verified MIME type.
     */
    public static function fromMimeType(string $mimeType): self
    {
        return match (true) {
            str_starts_with($mimeType, 'image/') => self::Pictures,
            str_starts_with($mimeType, 'video/') => self::Videos,
            str_starts_with($mimeType, 'audio/') => self::Audio,
            in_array($mimeType, self::documentMimeTypes(), true) => self::Documents,
            default => self::Other,
        };
    }

    /**
     * @return list<string>
     */
    public static function documentMimeTypes(): array
    {
        return [
            AllowedMimeTypesEnum::Pdf->value,
            AllowedMimeTypesEnum::PlainText->value,
        ];
    }
}
