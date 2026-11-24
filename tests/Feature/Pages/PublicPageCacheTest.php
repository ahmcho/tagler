<?php

use App\Models\User;
use App\Modules\Auth\Database\Seeders\RolesAndPermissionsSeeder;
use App\Modules\Auth\Models\Role;
use App\Modules\Pages\Services\Contracts\PageServiceContract;
use App\Modules\Pages\Services\PageRenderer;
use App\Modules\Pages\Support\PublicPageCache;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Mockery\MockInterface;
use Tests\Support\PageFixtures;

beforeEach(function (): void {
    (new RolesAndPermissionsSeeder)->run();
    $this->locale = config('app.locale');
});

function cacheEditor(): User
{
    $role = Role::create(['name' => 'Cache '.Str::random(8), 'guard_name' => 'web']);
    $role->givePermissionTo(['pages.update']);

    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

test('a second visit to a live page is served from the cache without rendering again', function (): void {
    PageFixtures::create(['status' => 'published'], ['locale' => $this->locale, 'title' => 'Cached', 'slug' => 'cached-page', 'path' => 'cached-page']);

    $this->get("/{$this->locale}/cached-page")->assertOk();

    $this->partialMock(PageRenderer::class)->shouldNotReceive('props');

    $this->get("/{$this->locale}/cached-page")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('page.title', 'Cached'));
});

test('a page change shows on the next visit', function (): void {
    $page = PageFixtures::create(['status' => 'published'], ['locale' => $this->locale, 'title' => 'Before', 'slug' => 'changed-page', 'path' => 'changed-page']);

    $this->get("/{$this->locale}/changed-page")->assertInertia(fn (Assert $inertia) => $inertia->where('page.title', 'Before'));

    $this->actingAs(cacheEditor())
        ->put(route('pages.update', $page), PageFixtures::payload(['status' => 'published'], [$this->locale => ['title' => 'After', 'slug' => 'changed-page']]))
        ->assertSessionHasNoErrors();

    $this->get("/{$this->locale}/changed-page")->assertInertia(fn (Assert $inertia) => $inertia->where('page.title', 'After'));
});

test('an unpublished page gives a 404 even when its props are cached', function (): void {
    $page = PageFixtures::create(['status' => 'published'], ['locale' => $this->locale, 'title' => 'Going offline', 'slug' => 'offline-page', 'path' => 'offline-page']);

    $this->get("/{$this->locale}/offline-page")->assertOk();

    app(PageServiceContract::class)->unpublish($page);

    $this->get("/{$this->locale}/offline-page")->assertNotFound();
});

test('a parent path change gives its child a new path on the next visit', function (): void {
    $parent = PageFixtures::create(['status' => 'published'], ['locale' => $this->locale, 'title' => 'Services', 'slug' => 'services', 'path' => 'services']);
    PageFixtures::create(['status' => 'published', 'parent_id' => $parent->id], ['locale' => $this->locale, 'title' => 'Web', 'slug' => 'web', 'path' => 'services/web']);

    $this->get("/{$this->locale}/services/web")->assertInertia(fn (Assert $inertia) => $inertia->where('page.path', 'services/web'));

    $this->actingAs(cacheEditor())
        ->put(route('pages.update', $parent), PageFixtures::payload(['status' => 'published'], [$this->locale => ['title' => 'Offers', 'slug' => 'offers']]))
        ->assertSessionHasNoErrors();

    $this->get("/{$this->locale}/services/web")->assertNotFound();
    $this->get("/{$this->locale}/offers/web")->assertInertia(fn (Assert $inertia) => $inertia->where('page.path', 'offers/web'));
});

test('flushing the cache renders every page again', function (): void {
    PageFixtures::create(['status' => 'published'], ['locale' => $this->locale, 'title' => 'Flushed', 'slug' => 'flushed-page', 'path' => 'flushed-page']);

    $this->get("/{$this->locale}/flushed-page")->assertOk();

    app(PublicPageCache::class)->flushAll();

    $this->partialMock(PageRenderer::class, function (MockInterface $mock): void {
        $mock->shouldReceive('props')->once()->andReturn(['page' => ['title' => 'Rendered again'], 'sections' => []]);
    });

    $this->get("/{$this->locale}/flushed-page")
        ->assertInertia(fn (Assert $page) => $page->where('page.title', 'Rendered again'));
});

test('the preview never reads the public cache', function (): void {
    $page = PageFixtures::create(['status' => 'published'], ['locale' => $this->locale, 'title' => 'Public', 'slug' => 'preview-cache', 'path' => 'preview-cache']);

    $this->get("/{$this->locale}/preview-cache")->assertOk();

    $this->partialMock(PageRenderer::class, function (MockInterface $mock): void {
        $mock->shouldReceive('props')->once()->andReturn(['page' => ['title' => 'From the preview'], 'sections' => []]);
    });

    $this->get(URL::temporarySignedRoute('pages.preview.show', now()->addMinutes(30), ['page' => $page, 'locale' => $this->locale]))
        ->assertOk();
});
