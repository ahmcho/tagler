<?php

use App\Modules\Translation\Models\Translation;

beforeEach(function () {
    Translation::query()->delete();
    $this->app->useLangPath(base_path('tests/Fixtures/lang'));
});

test('the sync command writes every locale folder into the translations table', function () {
    $this->artisan('tagler:translations:sync')->assertSuccessful();

    expect(Translation::where('lang', 'en')->where('group', 'auth')->where('key', 'failed')->value('value'))
        ->toBe('These credentials do not match our records.')
        ->and(Translation::where('lang', 'az')->where('group', 'auth')->where('key', 'failed')->value('value'))
        ->toBe('Bu məlumatlar qeydlərimizlə uyğun gəlmir.')
        ->and(Translation::where('lang', 'en')->where('group', 'auth')->where('key', 'messages.welcome')->value('value'))
        ->toBe('Welcome');
});

test('the sync command leaves existing rows alone unless --force is given', function () {
    Translation::create(['lang' => 'en', 'group' => 'auth', 'key' => 'failed', 'value' => 'Edited in admin']);

    $this->artisan('tagler:translations:sync')->assertSuccessful();

    expect(Translation::where('lang', 'en')->where('group', 'auth')->where('key', 'failed')->value('value'))
        ->toBe('Edited in admin');

    $this->artisan('tagler:translations:sync --force')->assertSuccessful();

    expect(Translation::where('lang', 'en')->where('group', 'auth')->where('key', 'failed')->value('value'))
        ->toBe('These credentials do not match our records.');
});

test('the --locale option limits the sync to one locale', function () {
    $this->artisan('tagler:translations:sync --locale=az')->assertSuccessful();

    expect(Translation::where('lang', 'az')->count())->toBe(2)
        ->and(Translation::where('lang', 'en')->count())->toBe(0);
});

test('the sync command fails when no locale folder exists', function () {
    $this->app->useLangPath(base_path('tests/Fixtures/missing'));

    $this->artisan('tagler:translations:sync')->assertFailed();
});
