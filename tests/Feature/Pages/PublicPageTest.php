<?php

use App\Modules\Pages\Enums\PageStatusEnum;
use App\Modules\Pages\Models\Page;
use App\Modules\Pages\Models\PageTranslation;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Support\PageFixtures;

beforeEach(function (): void {
    $this->locale = config('app.locale');
});

test('the root path serves the default-locale homepage when it is live', function (): void {
    PageFixtures::create(['is_homepage' => true], ['locale' => $this->locale, 'slug' => 'home', 'path' => '/', 'title' => 'Welcome']);

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('pages/public/show')
            ->where('page.title', 'Welcome')
            ->where('page.locale', $this->locale));
});

test('the locale homepage is served at /{locale}', function (): void {
    PageFixtures::create(['is_homepage' => true], ['locale' => $this->locale, 'slug' => 'home', 'path' => '/', 'title' => 'Welcome']);

    $this->get("/{$this->locale}")->assertOk();
});

test('the root path is a 404 when no homepage is assigned', function (): void {
    PageFixtures::create([], ['slug' => 'about', 'path' => 'about']);

    $this->get('/')->assertNotFound();
});

test('an unpublished homepage gives a 404 and returns when published again', function (): void {
    $home = PageFixtures::create(['is_homepage' => true], ['slug' => 'home', 'path' => '/']);

    $home->update(['status' => PageStatusEnum::Draft, 'publish_date' => null, 'publish_time' => null]);
    $this->get('/')->assertNotFound();

    $home->update(['status' => PageStatusEnum::Published, 'publish_date' => now()->subDay()->toDateString(), 'publish_time' => now()->subDay()->format('H:i')]);
    $this->get('/')->assertOk();
});

test('a nested page is served at its full path in its locale', function (): void {
    $parent = PageFixtures::create([], ['slug' => 'services', 'path' => 'services']);
    PageFixtures::create(['parent_id' => $parent->id], ['slug' => 'web', 'path' => 'services/web', 'title' => 'Web']);

    $this->get("/{$this->locale}/services/web")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('page.title', 'Web'));
});

test('a nested page is a 404 while its parent is not live', function (): void {
    $parent = PageFixtures::create(['status' => PageStatusEnum::Draft, 'publish_date' => null, 'publish_time' => null], ['slug' => 'services', 'path' => 'services']);
    PageFixtures::create(['parent_id' => $parent->id], ['slug' => 'web', 'path' => 'services/web']);

    $this->get("/{$this->locale}/services/web")->assertNotFound();
});

test('a page is served only under the locale that has its translation', function (): void {
    PageFixtures::create([], ['locale' => 'az', 'slug' => 'haqqimizda', 'path' => 'haqqimizda', 'title' => 'Haqqımızda']);

    $this->get('/az/haqqimizda')->assertOk();
    $this->get("/{$this->locale}/haqqimizda")->assertNotFound();
});

test('each locale has its own slug and path for the same page', function (): void {
    $page = PageFixtures::create([], ['locale' => $this->locale, 'slug' => 'about', 'path' => 'about', 'title' => 'About']);
    PageTranslation::factory()->create(['page_id' => $page->id, 'locale' => 'az', 'slug' => 'haqqimizda', 'path' => 'haqqimizda', 'title' => 'Haqqımızda']);

    $this->get("/{$this->locale}/about")->assertInertia(fn (Assert $inertia) => $inertia->where('page.title', 'About'));
    $this->get('/az/haqqimizda')->assertInertia(fn (Assert $inertia) => $inertia->where('page.title', 'Haqqımızda'));
    $this->get("/{$this->locale}/haqqimizda")->assertNotFound();
});

test('a child is served in a locale only when its parent is live in that locale', function (): void {
    $parent = PageFixtures::create([], ['locale' => $this->locale, 'slug' => 'services', 'path' => 'services']);
    PageFixtures::create(['parent_id' => $parent->id], ['locale' => $this->locale, 'slug' => 'web', 'path' => 'services/web']);
    PageTranslation::factory()->create(['page_id' => $parent->id, 'locale' => 'az', 'slug' => 'xidmet', 'path' => 'xidmet']);

    $this->get("/{$this->locale}/services/web")->assertOk();
    $this->get('/az/xidmet/veb')->assertNotFound();
});

test('a draft page is never served', function (): void {
    PageFixtures::create(['status' => PageStatusEnum::Draft, 'publish_date' => null, 'publish_time' => null], ['slug' => 'secret', 'path' => 'secret']);

    $this->get("/{$this->locale}/secret")->assertNotFound();
});

test('a scheduled page is a 404 until its date and served after it', function (): void {
    $page = PageFixtures::create(['status' => PageStatusEnum::Scheduled, 'publish_date' => now()->addDay()->toDateString(), 'publish_time' => now()->addDay()->format('H:i')], ['slug' => 'launch', 'path' => 'launch']);

    $this->get("/{$this->locale}/launch")->assertNotFound();

    $page->update(['publish_date' => now()->subMinute()->toDateString(), 'publish_time' => now()->subMinute()->format('H:i')]);

    $this->get("/{$this->locale}/launch")->assertOk();
});

test('a trailing slash and a different letter case reach the same page', function (): void {
    PageFixtures::create([], ['slug' => 'about', 'path' => 'about', 'title' => 'About']);

    $this->get("/{$this->locale}/about/")->assertOk();
    $this->get("/{$this->locale}/About")->assertOk();
});

test('an unsupported locale is a 404', function (): void {
    PageFixtures::create([], ['locale' => $this->locale, 'slug' => 'about', 'path' => 'about']);

    $this->get('/fr/about')->assertNotFound();
});

test('an unknown path is a 404', function (): void {
    $this->get("/{$this->locale}/does-not-exist")->assertNotFound();
});

test('reserved system paths are never served as pages', function (): void {
    PageFixtures::create([], ['locale' => $this->locale, 'slug' => 'api', 'path' => 'api']);

    $this->get("/{$this->locale}/api")->assertNotFound();
});

test('an admin path with no matching route is a 404 for guests', function (): void {
    $this->get('/admin/does-not-exist')->assertNotFound();
});

test('a path that is not a valid page path is a 404', function (): void {
    $this->get("/{$this->locale}/bad_slug")->assertNotFound();
});

test('the public page exposes only the visible fields of its translation', function (): void {
    PageFixtures::create(['is_homepage' => true], [
        'locale' => $this->locale,
        'slug' => 'home',
        'path' => '/',
        'title' => 'Welcome',
        'subtitle' => 'Hello',
        'seo_title' => 'SEO',
    ]);

    $this->get('/')->assertInertia(fn (Assert $page) => $page
        ->where('page.subtitle', 'Hello')
        ->where('page.seo_title', 'SEO')
        ->missing('page.status')
        ->missing('page.is_homepage')
        ->missing('page.slug'));
});

test('an unpublished page is not visible through its locale URL even when the translation exists', function (): void {
    $page = PageFixtures::create([], ['locale' => $this->locale, 'slug' => 'about', 'path' => 'about']);
    Page::query()->whereKey($page->id)->update(['status' => PageStatusEnum::Draft]);

    $this->get("/{$this->locale}/about")->assertNotFound();
});

test('public pages use the plain public root view, not the admin one', function (): void {
    PageFixtures::create(['is_homepage' => true], ['locale' => $this->locale, 'slug' => 'home', 'path' => '/']);

    $this->get('/')->assertOk()->assertViewIs('public');
});

test('a missing public page is a plain 404 with the public root view', function (): void {
    $this->get('/does-not-exist')->assertNotFound()->assertViewIs('public');
});
