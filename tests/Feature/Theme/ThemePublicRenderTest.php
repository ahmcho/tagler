<?php

use App\Modules\Pages\Support\PagePath;
use App\Modules\Settings\Services\Contracts\SettingServiceContract;
use App\Modules\Theme\Contracts\ThemeRegistryContract;
use App\Modules\Theme\Contracts\ThemeServiceContract;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Support\PageFixtures;
use Tests\Support\ThemeFixtures;

beforeEach(function (): void {
    // Theme components live in app/Modules/Theme/themes and load in the browser, not from the Inertia pages folder.
    config(['inertia.testing.ensure_pages_exist' => false]);

    $this->locale = config('app.locale');
    app(ThemeServiceContract::class)->activate('default');
});

afterEach(function (): void {
    if (isset($this->themeRoot)) {
        ThemeFixtures::remove($this->themeRoot);
    }
});

function homepage(string $locale): void
{
    PageFixtures::create(['is_homepage' => true, 'status' => 'published'], [
        'locale' => $locale,
        'title' => 'Welcome',
        'slug' => 'home',
        'path' => PagePath::HOMEPAGE,
    ]);
}

test('the homepage at the root uses the theme home template', function (): void {
    homepage($this->locale);

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('theme/default/home')
            ->where('page.title', 'Welcome'));
});

test('the locale homepage uses the theme home template too', function (): void {
    homepage($this->locale);

    $this->get("/{$this->locale}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('theme/default/home'));
});

test('a page that is not the homepage uses the theme page template', function (): void {
    PageFixtures::create(['status' => 'published'], ['locale' => $this->locale, 'title' => 'About', 'slug' => 'about', 'path' => 'about']);

    $this->get("/{$this->locale}/about")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('theme/default/page'));
});

test('a page with the theme layout turned off uses the plain view', function (): void {
    PageFixtures::create(['status' => 'published', 'theme_layout' => false], ['locale' => $this->locale, 'title' => 'Plain', 'slug' => 'plain', 'path' => 'plain']);

    $this->get("/{$this->locale}/plain")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('pages/public/show'));
});

test('a homepage with the theme layout turned off uses the plain view', function (): void {
    PageFixtures::create(['is_homepage' => true, 'status' => 'published', 'theme_layout' => false], [
        'locale' => $this->locale,
        'title' => 'Plain home',
        'slug' => 'home',
        'path' => PagePath::HOMEPAGE,
    ]);

    $this->get('/')->assertInertia(fn (Assert $page) => $page->component('pages/public/show'));
});

test('a preview of the homepage is themed too', function (): void {
    $page = PageFixtures::create(['is_homepage' => true, 'status' => 'draft', 'publish_date' => null, 'publish_time' => null], [
        'locale' => $this->locale,
        'title' => 'Draft home',
        'slug' => 'home',
        'path' => PagePath::HOMEPAGE,
    ]);

    $this->get(URL::temporarySignedRoute('pages.preview.show', now()->addMinutes(30), ['page' => $page, 'locale' => $this->locale]))
        ->assertOk()
        ->assertInertia(fn (Assert $inertia) => $inertia->component('theme/default/home'));
});

test('the not-found page uses the theme not-found template', function (): void {
    $this->get("/{$this->locale}/no-such-page")
        ->assertNotFound()
        ->assertInertia(fn (Assert $page) => $page
            ->component('theme/default/not-found')
            ->where('page.title', 'Page not found'));
});

test('the not-found page falls back to the plain view when the theme is missing', function (): void {
    app(SettingServiceContract::class)->setString('active_theme', 'ghost');

    $this->get("/{$this->locale}/no-such-page")
        ->assertNotFound()
        ->assertInertia(fn (Assert $page) => $page->component('pages/public/not-found'));
});

test('switching the theme changes the homepage on the next request', function (): void {
    $root = $this->themeRoot = ThemeFixtures::root();

    ThemeFixtures::copyDefault($root);
    ThemeFixtures::write($root, 'other', ThemeFixtures::manifest('other'));

    config(['modules.theme.path' => $root]);
    app(ThemeRegistryContract::class)->forget();
    homepage($this->locale);

    $this->get('/')->assertInertia(fn (Assert $page) => $page->component('theme/default/home'));

    app(ThemeServiceContract::class)->activate('other');

    $this->get('/')->assertInertia(fn (Assert $page) => $page->component('theme/other/home'));
});

test('a missing active theme falls back to the plain view and logs a warning', function (): void {
    homepage($this->locale);

    app(SettingServiceContract::class)->setString('active_theme', 'ghost');

    Log::spy();

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('pages/public/show'));

    Log::shouldHaveReceived('warning')->with('The active theme is missing or invalid. The plain views are used.', ['slug' => 'ghost']);
});

test('with no active theme the homepage uses the plain view', function (): void {
    app(SettingServiceContract::class)->setString('active_theme', '');

    homepage($this->locale);

    $this->get('/')->assertInertia(fn (Assert $page) => $page->component('pages/public/show'));
});
