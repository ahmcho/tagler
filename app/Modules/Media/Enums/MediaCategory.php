<?php

namespace App\Modules\Media\Enums;

enum MediaCategory: string
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
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
        ];
    }
}
