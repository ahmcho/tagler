<?php

use App\Modules\Settings\Enums\AllowedMimeTypesEnum;

test('each mime type maps to its file extension', function (AllowedMimeTypesEnum $case, string $extension): void {
    expect($case->extension())->toBe($extension);
})->with([
    [AllowedMimeTypesEnum::Jpeg, 'jpg'],
    [AllowedMimeTypesEnum::Png, 'png'],
    [AllowedMimeTypesEnum::Webp, 'webp'],
    [AllowedMimeTypesEnum::Gif, 'gif'],
    [AllowedMimeTypesEnum::Mpeg4, 'mp4'],
    [AllowedMimeTypesEnum::Webm, 'webm'],
    [AllowedMimeTypesEnum::Mov, 'mov'],
    [AllowedMimeTypesEnum::Mp3, 'mp3'],
    [AllowedMimeTypesEnum::Wav, 'wav'],
    [AllowedMimeTypesEnum::Ogg, 'ogg'],
    [AllowedMimeTypesEnum::Bmp, 'bmp'],
    [AllowedMimeTypesEnum::Zip, 'zip'],
    [AllowedMimeTypesEnum::Pdf, 'pdf'],
    [AllowedMimeTypesEnum::PlainText, 'txt'],
]);

test('each mime type maps to its lucide icon name', function (AllowedMimeTypesEnum $case, string $icon): void {
    expect($case->icon())->toBe($icon);
})->with([
    [AllowedMimeTypesEnum::Jpeg, 'file-image'],
    [AllowedMimeTypesEnum::Bmp, 'file-image'],
    [AllowedMimeTypesEnum::Mov, 'file-video'],
    [AllowedMimeTypesEnum::Wav, 'file-audio'],
    [AllowedMimeTypesEnum::Zip, 'file-archive'],
    [AllowedMimeTypesEnum::Pdf, 'file-text'],
    [AllowedMimeTypesEnum::PlainText, 'file-type'],
]);
