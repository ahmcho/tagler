<?php

namespace App\Modules\Settings\Enums;

enum AllowedMimeTypesEnum: string
{
    case Jpeg = 'image/jpeg';
    case Png = 'image/png';
    case Webp = 'image/webp';
    case Gif = 'image/gif';
    case Mpeg4 = 'video/mp4';
    case Webm = 'video/webm';
    case Mov = 'video/quicktime';
    case Mp3 = 'audio/mpeg';
    case Wav = 'audio/wav';
    case Ogg = 'audio/ogg';
    case Bmp = 'image/bmp';
    case Zip = 'application/zip';
    case Pdf = 'application/pdf';
    case PlainText = 'text/plain';

    /**
     * Returns the file extension (without the dot) used for this MIME type.
     */
    public function extension(): string
    {
        return match ($this) {
            self::Jpeg => 'jpg',
            self::Png => 'png',
            self::Webp => 'webp',
            self::Gif => 'gif',
            self::Mpeg4 => 'mp4',
            self::Webm => 'webm',
            self::Mov => 'mov',
            self::Mp3 => 'mp3',
            self::Wav => 'wav',
            self::Ogg => 'ogg',
            self::Bmp => 'bmp',
            self::Zip => 'zip',
            self::Pdf => 'pdf',
            self::PlainText => 'txt',
        };
    }
}
