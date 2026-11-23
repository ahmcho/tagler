<?php

use App\Models\User;
use App\Modules\Auth\Database\Seeders\RolesAndPermissionsSeeder;
use App\Modules\Auth\Models\Role;
use App\Modules\Pages\Models\Page;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Support\PageFixtures;

beforeEach(function (): void {
    (new RolesAndPermissionsSeeder)->run();
    $this->locale = config('app.locale');
});

function themeLayoutEditor(): User
{
    $role = Role::create(['name' => 'Theme layout '.Str::random(8), 'guard_name' => 'web']);
    $role->givePermissionTo(['pages.store', 'pages.update', 'pages.index']);

    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

test('a new page uses the theme layout by default', function (): void {
    $this->actingAs(themeLayoutEditor())
        ->post(route('pages.store'), PageFixtures::payload(['status' => 'published'], [config('app.locale') => ['title' => 'Default layout', 'slug' => 'default-layout']]))
        ->assertSessionHasNoErrors();

    expect(Page::query()->latest('id')->firstOrFail()->theme_layout)->toBeTrue();
});

test('saving a page with the theme layout turned off keeps it off', function (): void {
    $editor = themeLayoutEditor();

    $this->actingAs($editor)
        ->post(route('pages.store'), PageFixtures::payload(['status' => 'published', 'theme_layout' => false], [config('app.locale') => ['title' => 'Plain', 'slug' => 'plain-layout']]))
        ->assertSessionHasNoErrors();

    expect(Page::query()->latest('id')->firstOrFail()->theme_layout)->toBeFalse();
});

test('the edit page gives the form the current theme layout setting', function (): void {
    $page = PageFixtures::create(['status' => 'published', 'theme_layout' => false], ['locale' => $this->locale, 'title' => 'Off', 'slug' => 'off-layout', 'path' => 'off-layout']);

    $this->actingAs(themeLayoutEditor())
        ->get(route('pages.edit', $page))
        ->assertInertia(fn (Assert $inertia) => $inertia->where('model.theme_layout', false));
});
