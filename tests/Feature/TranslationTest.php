<?php

use App\Models\Translation;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    Translation::query()->delete();
});

test('database translation overrides file translation', function () {
    Translation::create([
        'key' => 'test.key',
        'locale' => 'en',
        'translation' => 'Database Value',
        'group' => 'test',
    ]);

    expect(__('test.key'))->toBe('Database Value');
});

test('package translations use file system only', function () {
    $fortifyTranslation = __('fortify::auth.failed');
    expect($fortifyTranslation)->toBeString();
});

test('fallback to file when database missing', function () {
    $result = __('validation.required');
    expect($result)->toBeString();
});

test('trans_choice works with database translations', function () {
    Translation::create([
        'key' => 'test.items',
        'locale' => 'en',
        'translation' => '{0} No items|{1} One item|[2,*] Many items',
        'group' => 'test',
    ]);

    expect(trans_choice('test.items', 0))->toContain('No items');
    expect(trans_choice('test.items', 1))->toContain('One item');
    expect(trans_choice('test.items', 5))->toContain('Many items');
});

test('placeholder replacement works', function () {
    Translation::create([
        'key' => 'test.welcome',
        'locale' => 'en',
        'translation' => 'Welcome, :name!',
        'group' => 'test',
    ]);

    expect(__('test.welcome', ['name' => 'Ahmad']))->toBe('Welcome, Ahmad!');
});

test('missing key returns key itself', function () {
    expect(__('nonexistent.key'))->toBe('nonexistent.key');
});
