<?php

use App\Modules\Settings\Enums\ForbiddenMimeTypesEnum;

test('each forbidden mime type maps to its main extension', function (ForbiddenMimeTypesEnum $case, string $extension): void {
    expect($case->extension())->toBe($extension);
})->with([
    [ForbiddenMimeTypesEnum::Php, 'php'],
    [ForbiddenMimeTypesEnum::WindowsExecutable, 'exe'],
    [ForbiddenMimeTypesEnum::BatchScript, 'bat'],
    [ForbiddenMimeTypesEnum::ShellScript, 'sh'],
    [ForbiddenMimeTypesEnum::JavaArchive, 'jar'],
]);

test('forbidden extensions include the aliases of every case', function (): void {
    expect(ForbiddenMimeTypesEnum::extensions())
        ->toContain('phtml', 'dll', 'cmd', 'htpasswd', 'aspx');
});

test('no extension belongs to two forbidden mime types', function (): void {
    $extensions = ForbiddenMimeTypesEnum::extensions();

    expect(array_unique($extensions))->toHaveCount(count($extensions));
});
