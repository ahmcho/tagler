<?php

use App\Modules\Pages\Models\PageTranslation;
use App\Modules\Pages\Support\PagePath;
use Tests\Support\PageFixtures;

/**
 * The canonical address is built from the configured site address, not from the request host.
 */
function siteUrlFor(string $path): string
{
    return rtrim((string) config('app.url'), '/').$path;
}

test('the default-locale address is the canonical URL in every locale', function (): void {
    $page = PageFixtures::create(['status' => 'published'], ['locale' => 'en', 'title' => 'About us', 'slug' => 'about', 'path' => 'about']);
    PageTranslation::factory()->create(['page_id' => $page->id, 'locale' => 'az', 'title' => 'Haqqımızda', 'slug' => 'haqqimizda', 'path' => 'haqqimizda']);

    $html = $this->get('/az/haqqimizda')->assertOk()->getContent();

    expect($html)
        ->toContain('<link rel="canonical" href="'.siteUrlFor('/en/about').'"')
        ->toContain('<meta property="og:url" content="'.siteUrlFor('/en/about').'"')
        ->toContain('<title data-inertia="">Haqqımızda</title>')
        ->toContain('<meta property="og:title" content="Haqqımızda"');
});

test('the homepage canonical URL is the root address', function (): void {
    PageFixtures::create(['is_homepage' => true, 'status' => 'published'], ['locale' => 'en', 'title' => 'Home', 'slug' => 'home', 'path' => PagePath::HOMEPAGE]);

    $html = $this->get('/en')->assertOk()->getContent();

    expect($html)->toContain('<link rel="canonical" href="'.rtrim(config('app.url'), '/').'/"');
});

test('a page without a default-locale translation has no canonical URL', function (): void {
    $page = PageFixtures::create(['status' => 'published'], ['locale' => 'az', 'title' => 'Yalnız', 'slug' => 'yalniz', 'path' => 'yalniz']);

    $html = $this->get('/az/yalniz')->assertOk()->getContent();

    expect($html)
        ->not->toContain('rel="canonical"')
        ->not->toContain('og:url')
        ->toContain('<title data-inertia="">Yalnız</title>');
});

test('the description and Open Graph description come from the SEO description', function (): void {
    PageFixtures::create(['status' => 'published'], ['locale' => 'en', 'title' => 'Services', 'slug' => 'services', 'path' => 'services', 'seo_description' => 'What we build']);

    $html = $this->get('/en/services')->assertOk()->getContent();

    expect($html)
        ->toContain('<meta name="description" content="What we build" data-inertia="description">')
        ->toContain('<meta property="og:description" content="What we build" data-inertia="og:description">');
});

test('the page props carry the canonical URL for the client', function (): void {
    PageFixtures::create(['status' => 'published'], ['locale' => 'en', 'title' => 'Contact', 'slug' => 'contact', 'path' => 'contact']);

    $this->get('/en/contact')->assertInertia(fn ($page) => $page->where('page.canonical_url', siteUrlFor('/en/contact')));
});

test('the Open Graph locale combines the language with the locale country', function (): void {
    PageFixtures::create(['status' => 'published'], ['locale' => 'en', 'title' => 'Locale', 'slug' => 'locale-page', 'path' => 'locale-page']);

    $html = $this->get('/en/locale-page')->assertOk()->getContent();

    expect($html)->toContain('<meta property="og:locale" content="en_GB" data-inertia="og:locale">');
});

test('a not-found page has a server-rendered title in the request language', function (): void {
    $html = $this->get('/en/no-such-page')->assertNotFound()->getContent();

    expect($html)->toContain('<title data-inertia="">Page not found</title>');
});

test('a not-found page under a locale prefix uses that locale for its title', function (): void {
    $html = $this->get('/az/no-such-page')->assertNotFound()->getContent();

    expect($html)->toContain('<title data-inertia="">Səhifə tapılmadı</title>');
});
