<?php

use App\Modules\Theme\Contracts\ThemeRegistryContract;
use Tests\Support\ThemeFixtures;

afterEach(function (): void {
    if (isset($this->themeRoot)) {
        ThemeFixtures::remove($this->themeRoot);
    }
});

test('the registry finds the bundled default theme with its home template', function (): void {
    $theme = app(ThemeRegistryContract::class)->find('default');

    expect($theme)->not->toBeNull()
        ->and($theme->name)->toBe('Default Theme')
        ->and($theme->provides('home'))->toBeTrue()
        ->and($theme->provides('blog.index'))->toBeFalse();
});

test('the registry skips invalid themes and keeps the valid ones', function (): void {
    $root = $this->themeRoot = ThemeFixtures::root();

    ThemeFixtures::write($root, 'good', ThemeFixtures::manifest('good'));
    ThemeFixtures::write($root, 'no-name', ThemeFixtures::manifest('no-name', ['name' => '']));
    ThemeFixtures::write($root, 'wrong-folder', ThemeFixtures::manifest('other-slug'));
    ThemeFixtures::write($root, 'no-entry', ThemeFixtures::manifest('no-entry'), entry: false);
    ThemeFixtures::write($root, 'no-template', ThemeFixtures::manifest('no-template'), templates: false);
    ThemeFixtures::write($root, 'newer-tagler', ThemeFixtures::manifest('newer-tagler', ['requires' => ['tagler' => '^2.0', 'php' => '^8.4']]));
    ThemeFixtures::write($root, 'newer-php', ThemeFixtures::manifest('newer-php', ['requires' => ['tagler' => '^1.0', 'php' => '^9.0']]));
    ThemeFixtures::write($root, 'extra-key', ThemeFixtures::manifest('extra-key', ['settings' => []]));
    ThemeFixtures::write($root, 'no-manifest', null);

    config(['modules.theme.path' => $root]);
    app(ThemeRegistryContract::class)->forget();

    expect(array_keys(app(ThemeRegistryContract::class)->all()))->toBe(['good']);
});

test('the registry reads theme.json only and never runs code from a theme folder', function (): void {
    $root = $this->themeRoot = ThemeFixtures::root();
    $marker = storage_path('framework/testing/theme-executed-'.uniqid().'.txt');

    ThemeFixtures::write($root, 'untrusted', ThemeFixtures::manifest('untrusted'));
    file_put_contents($root.'/untrusted/hook.php', "<?php file_put_contents('{$marker}', 'ran');");

    config(['modules.theme.path' => $root]);
    app(ThemeRegistryContract::class)->forget();

    app(ThemeRegistryContract::class)->all();

    expect(file_exists($marker))->toBeFalse();
});

test('a missing theme root gives an empty registry', function (): void {
    config(['modules.theme.path' => storage_path('framework/testing/does-not-exist')]);
    app(ThemeRegistryContract::class)->forget();

    expect(app(ThemeRegistryContract::class)->all())->toBe([]);
});
