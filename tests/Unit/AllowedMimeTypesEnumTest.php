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
