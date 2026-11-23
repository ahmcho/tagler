<?php

use App\Modules\Pages\Enums\LocaleEnum;

test('codes lists every case in declaration order', function (): void {
    expect(LocaleEnum::codes())->toBe(['az', 'en', 'ru']);
});

test('a supported locale is recognised', function (): void {
    expect(LocaleEnum::isSupported('ru'))->toBeTrue();
});

test('an unknown or differently cased locale is not supported', function (string $locale): void {
    expect(LocaleEnum::isSupported($locale))->toBeFalse();
})->with(['de', '', 'EN', 'en-US']);

test('the default is the configured default locale', function (): void {
    config(['app.default_locale' => 'ru']);

    expect(LocaleEnum::default())->toBe('ru');
});

test('the default does not change when the request locale changes', function (): void {
    config(['app.default_locale' => 'en']);

    app()->setLocale('az');

    expect(LocaleEnum::default())->toBe('en');
});

test('config supported_locales is built from the enum', function (): void {
    expect(config('app.supported_locales'))->toBe([
        ['code' => 'az', 'name' => 'Azərbaycan dili'],
        ['code' => 'en', 'name' => 'English'],
        ['code' => 'ru', 'name' => 'Русский'],
    ]);
});
