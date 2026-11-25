<?php

use App\Models\User;
use App\Modules\Auth\Database\Seeders\RolesAndPermissionsSeeder;
use App\Modules\Auth\Models\Role;
use App\Modules\Settings\Services\Contracts\SettingServiceContract;
use App\Modules\Theme\Contracts\ThemeRegistryContract;
use App\Modules\Theme\Contracts\ThemeServiceContract;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Support\ThemeFixtures;

beforeEach(function (): void {
    (new RolesAndPermissionsSeeder)->run();
});

afterEach(function (): void {
    if (isset($this->themeRoot)) {
        ThemeFixtures::remove($this->themeRoot);
    }
});

/**
 * @param  list<string>  $permissions
 */
function themeUser(array $permissions): User
{
    $role = Role::create(['name' => 'Theme '.Str::random(8), 'guard_name' => 'web']);
    $role->givePermissionTo($permissions);

    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

test('the theme list needs the themes.index permission', function (): void {
    $this->actingAs(themeUser(['pages.index']))
        ->get(route('themes.index'))
        ->assertForbidden();
});

test('the theme list shows every valid theme and marks the active one', function (): void {
    $this->actingAs(themeUser(['themes.index']))
        ->get(route('themes.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('themes/index')
            ->where('themes.0.slug', 'default')
            ->where('themes.0.active', false));
});

test('the shared abilities tell the theme list which actions the user may use', function (): void {
    $response = $this->actingAs(themeUser(['themes.index', 'themes.activate']))
        ->get(route('themes.index'))
        ->assertOk();

    expect($response->viewData('page')['props']['can'])
        ->toMatchArray(['themes.index' => true, 'themes.activate' => true]);
});

test('activation needs the themes.activate permission', function (): void {
    $this->actingAs(themeUser(['themes.index']))
        ->post(route('themes.activate', 'default'))
        ->assertForbidden();

    expect(app(ThemeServiceContract::class)->activeTheme())->toBeNull();
});

test('an unknown slug gives a validation error and changes nothing', function (): void {
    $this->actingAs(themeUser(['themes.activate']))
        ->post(route('themes.activate', 'no-such-theme'))
        ->assertSessionHasErrors('slug');

    expect(app(ThemeServiceContract::class)->activeTheme())->toBeNull();
});

test('activating a valid theme stores it', function (): void {
    $this->actingAs(themeUser(['themes.activate']))
        ->post(route('themes.activate', 'default'))
        ->assertRedirect(route('themes.index'))
        ->assertSessionHas('status');

    expect(app(SettingServiceContract::class)->string('active_theme'))->toBe('default')
        ->and(app(ThemeServiceContract::class)->activeTheme()?->slug)->toBe('default');
});

test('the active theme can be changed to another installed theme', function (): void {
    $root = $this->themeRoot = ThemeFixtures::root();

    ThemeFixtures::copyDefault($root);
    ThemeFixtures::write($root, 'other', ThemeFixtures::manifest('other'));

    config(['modules.theme.path' => $root]);
    app(ThemeRegistryContract::class)->forget();

    $editor = themeUser(['themes.activate']);

    $this->actingAs($editor)->post(route('themes.activate', 'default'));
    $this->actingAs($editor)->post(route('themes.activate', 'other'));

    expect(app(ThemeServiceContract::class)->activeTheme()?->slug)->toBe('other');
});
