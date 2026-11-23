<?php

use App\Models\User;
use App\Modules\Auth\Database\Seeders\RolesAndPermissionsSeeder;
use App\Modules\Auth\Models\Role;
use App\Modules\Pages\Models\Page;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Support\PageFixtures;

beforeEach(function (): void {
    (new RolesAndPermissionsSeeder)->run();
    $this->locale = config('app.locale');
});

/**
 * @param  list<string>  $permissions
 */
function previewEditor(array $permissions): User
{
    $role = Role::create(['name' => 'Preview '.Str::random(8), 'guard_name' => 'web']);
    $role->givePermissionTo($permissions);

    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

function signedPreviewUrl(Page $page, string $locale, ?Carbon $expires = null): string
{
    return URL::temporarySignedRoute(
        'pages.preview.show',
        $expires ?? now()->addMinutes(30),
        ['page' => $page, 'locale' => $locale],
    );
}

test('a draft page shows in preview with a valid signed link', function (): void {
    $page = PageFixtures::create(['status' => 'draft', 'publish_date' => null, 'publish_time' => null], ['locale' => config('app.locale'), 'title' => 'Draft preview', 'slug' => 'draft-preview', 'path' => 'draft-preview']);

    $this->get(signedPreviewUrl($page, config('app.locale')))
        ->assertOk()
        ->assertInertia(fn (Assert $inertia) => $inertia
            ->component('pages/public/show')
            ->where('page.title', 'Draft preview'));
});

test('a preview response is never indexed and never cached', function (): void {
    $page = PageFixtures::create(['status' => 'draft', 'publish_date' => null, 'publish_time' => null], ['locale' => config('app.locale'), 'title' => 'Headers', 'slug' => 'headers-preview', 'path' => 'headers-preview']);

    $response = $this->get(signedPreviewUrl($page, config('app.locale')))->assertOk();

    expect($response->headers->get('X-Robots-Tag'))->toContain('noindex')
        ->and($response->headers->get('Cache-Control'))->toContain('no-store');
});

test('a link whose signature was changed is forbidden', function (): void {
    $page = PageFixtures::create(['status' => 'draft', 'publish_date' => null, 'publish_time' => null], ['locale' => config('app.locale'), 'title' => 'Tamper', 'slug' => 'tamper-preview', 'path' => 'tamper-preview']);

    $url = signedPreviewUrl($page, config('app.locale'));
    $tampered = substr($url, 0, -1).(substr($url, -1) === '0' ? '1' : '0');

    $this->get($tampered)->assertForbidden();
});

test('an expired link is forbidden', function (): void {
    $page = PageFixtures::create(['status' => 'draft', 'publish_date' => null, 'publish_time' => null], ['locale' => config('app.locale'), 'title' => 'Expired', 'slug' => 'expired-preview', 'path' => 'expired-preview']);

    $url = signedPreviewUrl($page, config('app.locale'));

    $this->travel(31)->minutes();

    $this->get($url)->assertForbidden();
});

test('a locale the page has no translation in gives a 404', function (): void {
    $page = PageFixtures::create(['status' => 'draft', 'publish_date' => null, 'publish_time' => null], ['locale' => config('app.locale'), 'title' => 'Only default', 'slug' => 'only-default-preview', 'path' => 'only-default-preview']);

    $this->get(signedPreviewUrl($page, 'az'))->assertNotFound();
});

test('the admin preview link redirects to a signed preview of that locale', function (): void {
    $page = PageFixtures::create(['status' => 'draft', 'publish_date' => null, 'publish_time' => null], ['locale' => config('app.locale'), 'title' => 'Via admin', 'slug' => 'via-admin-preview', 'path' => 'via-admin-preview']);

    $response = $this->actingAs(previewEditor(['pages.update']))
        ->get(route('pages.preview', [$page, config('app.locale')]))
        ->assertRedirect();

    $location = (string) $response->headers->get('Location');

    expect($location)->toContain('signature=')->toContain('expires=');

    $this->get($location)->assertOk();
});

test('a user without update permission cannot get a preview link', function (): void {
    $page = PageFixtures::create(['status' => 'draft', 'publish_date' => null, 'publish_time' => null], ['locale' => config('app.locale'), 'title' => 'Denied', 'slug' => 'denied-preview', 'path' => 'denied-preview']);

    $this->actingAs(previewEditor(['pages.index']))
        ->get(route('pages.preview', [$page, config('app.locale')]))
        ->assertForbidden();
});
