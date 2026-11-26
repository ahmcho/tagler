<?php

use App\Models\User;
use App\Modules\Auth\Database\Seeders\RolesAndPermissionsSeeder;
use App\Modules\Auth\Models\Role;
use App\Modules\Pages\Enums\LocaleEnum;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Tests\Support\PageFixtures;

beforeEach(function (): void {
    (new RolesAndPermissionsSeeder)->run();
});

function viewOnlineEditor(array $permissions): User
{
    $role = Role::create(['name' => 'View online '.Str::random(8), 'guard_name' => 'web']);
    $role->givePermissionTo($permissions);

    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

test('a live page redirects to its public address', function (): void {
    $locale = LocaleEnum::default();
    $page = PageFixtures::create(['status' => 'published', 'publish_date' => null, 'publish_time' => null], ['locale' => $locale, 'title' => 'Live', 'slug' => 'live-page', 'path' => 'live-page']);

    $this->actingAs(viewOnlineEditor(['pages.update']))
        ->get(route('pages.view-online', $page))
        ->assertRedirect("/{$locale}/live-page");
});

test('a live homepage redirects to the locale root', function (): void {
    $locale = LocaleEnum::default();
    $page = PageFixtures::create(['status' => 'published', 'publish_date' => null, 'publish_time' => null, 'is_homepage' => true], ['locale' => $locale, 'title' => 'Home', 'slug' => 'home', 'path' => '/']);

    $this->actingAs(viewOnlineEditor(['pages.update']))
        ->get(route('pages.view-online', $page))
        ->assertRedirect("/{$locale}");
});

test('a user without update permission cannot open a live page through view online', function (): void {
    $locale = LocaleEnum::default();
    $page = PageFixtures::create(['status' => 'published', 'publish_date' => null, 'publish_time' => null], ['locale' => $locale, 'title' => 'Read only', 'slug' => 'read-only', 'path' => 'read-only']);

    $this->actingAs(viewOnlineEditor(['pages.index']))
        ->get(route('pages.view-online', $page))
        ->assertForbidden();
});

test('a draft page redirects to a signed preview', function (): void {
    $locale = LocaleEnum::default();
    $page = PageFixtures::create(['status' => 'draft', 'publish_date' => null, 'publish_time' => null], ['locale' => $locale, 'title' => 'Draft', 'slug' => 'draft-view', 'path' => 'draft-view']);

    $response = $this->actingAs(viewOnlineEditor(['pages.update']))
        ->get(route('pages.view-online', $page))
        ->assertRedirect();

    $location = (string) $response->headers->get('Location');

    expect($location)->toContain('preview/pages/')->toContain('signature=');
});

test('a scheduled page that is not yet live redirects to a signed preview', function (): void {
    $locale = LocaleEnum::default();
    $page = PageFixtures::create(['status' => 'scheduled', 'publish_date' => Carbon::now()->addDay()->toDateString(), 'publish_time' => '09:00'], ['locale' => $locale, 'title' => 'Later', 'slug' => 'later-view', 'path' => 'later-view']);

    $response = $this->actingAs(viewOnlineEditor(['pages.update']))
        ->get(route('pages.view-online', $page))
        ->assertRedirect();

    expect((string) $response->headers->get('Location'))->toContain('signature=');
});

test('a draft page needs update permission to open its preview', function (): void {
    $locale = LocaleEnum::default();
    $page = PageFixtures::create(['status' => 'draft', 'publish_date' => null, 'publish_time' => null], ['locale' => $locale, 'title' => 'Denied draft', 'slug' => 'denied-draft-view', 'path' => 'denied-draft-view']);

    $this->actingAs(viewOnlineEditor(['pages.index']))
        ->get(route('pages.view-online', $page))
        ->assertForbidden();
});

test('a page without a default-locale translation is not found', function (): void {
    $page = PageFixtures::create(['status' => 'published', 'publish_date' => null, 'publish_time' => null], ['locale' => 'ru', 'title' => 'Only ru', 'slug' => 'only-ru-view', 'path' => 'only-ru-view']);

    $this->actingAs(viewOnlineEditor(['pages.update']))
        ->get(route('pages.view-online', $page))
        ->assertNotFound();
});
