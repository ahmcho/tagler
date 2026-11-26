<?php

use App\Modules\Settings\Enums\AllowedMimeTypesEnum;
use App\Modules\Settings\Rules\FileUploadRule;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Validator;

function faviconRuleFails(UploadedFile $file): bool
{
    return Validator::make(
        ['favicon' => $file],
        ['favicon' => [new FileUploadRule([AllowedMimeTypesEnum::Png])]],
    )->fails();
}

test('a clean png passes the favicon rule', function (): void {
    expect(faviconRuleFails(UploadedFile::fake()->image('icon.png', 32, 32)))->toBeFalse();
});

test('a png with a php tag appended is rejected by the favicon rule', function (): void {
    $polyglot = UploadedFile::fake()->createWithContent('icon.png', UploadedFile::fake()->image('a.png', 32, 32)->getContent().'<?php echo 1; ?>');

    expect(faviconRuleFails($polyglot))->toBeTrue();
});

test('a php file named png is rejected by the favicon rule', function (): void {
    expect(faviconRuleFails(UploadedFile::fake()->createWithContent('shell.php.png', '<?php echo 1;')))->toBeTrue();
});
