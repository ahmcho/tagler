<?php

namespace App\Modules\Settings\Enums;

enum AllowedMimeTypes: string
{
    case Png = 'image/png';
    case Jpeg = 'image/jpeg';
    case Gif = 'image/gif';
    case Bmp = 'image/bmp';
    case Webp = 'image/webp';
    case Zip = 'application/zip';
    case Pdf = 'application/pdf';
}
