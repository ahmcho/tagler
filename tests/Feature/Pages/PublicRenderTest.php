<?php

use App\Modules\Pages\Models\PageTranslation;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Support\PageFixtures;

beforeEach(function (): void {
    $this->locale = config('app.locale');
});

function contentOf(array $sections): array
{
    return ['version' => 1, 'sections' => $sections];
}

test('the public page passes live sections and their elements to the view', function (): void {
    PageFixtures::create(['is_homepage' => true], [
        'locale' => $this->locale,
        'slug' => 'home',
        'path' => '/',
        'content' => contentOf([[
            'id' => '11111111-1111-4111-8111-111111111111',
            'layout' => 'centered',
            'settings' => ['background' => 'light'],
            'elements' => [
                ['id' => '22222222-2222-4222-8222-222222222222', 'type' => 'heading', 'version' => 1, 'data' => ['text' => 'Welcome', 'level' => 1]],
                ['id' => '33333333-3333-4333-8333-333333333333', 'type' => 'button', 'version' => 1, 'data' => ['label' => 'Contact', 'url' => '/contact', 'target' => '_self']],
            ],
        ]]),
    ]);

    $this->get('/')->assertInertia(fn (Assert $page) => $page
        ->component('pages/public/show')
        ->where('sections.0.layout', 'centered')
        ->where('sections.0.elements.0.type', 'heading')
        ->where('sections.0.elements.0.data.text', 'Welcome')
        ->where('sections.0.elements.1.data.url', '/contact'));
});

test('a disabled section is not shown', function (): void {
    PageFixtures::create(['is_homepage' => true], [
        'locale' => $this->locale,
        'slug' => 'home',
        'path' => '/',
        'content' => contentOf([
            ['id' => '11111111-1111-4111-8111-111111111111', 'layout' => 'full-width', 'enabled' => false, 'elements' => []],
            ['id' => '44444444-4444-4444-8444-444444444444', 'layout' => 'full-width', 'elements' => []],
        ]),
    ]);

    $this->get('/')->assertInertia(fn (Assert $page) => $page->has('sections', 1)
        ->where('sections.0.id', '44444444-4444-4444-8444-444444444444'));
});

test('a section whose layout is no longer available is skipped and the page still renders', function (): void {
    PageFixtures::create(['is_homepage' => true], [
        'locale' => $this->locale,
        'slug' => 'home',
        'path' => '/',
        'content' => contentOf([['id' => '11111111-1111-4111-8111-111111111111', 'layout' => 'retired-layout', 'elements' => []]]),
    ]);

    $this->get('/')->assertOk()->assertInertia(fn (Assert $page) => $page->has('sections', 0));
});

test('a skipped section for an unknown layout logs a warning with its layout', function (): void {
    Log::spy();

    PageFixtures::create(['is_homepage' => true], [
        'locale' => $this->locale,
        'slug' => 'home',
        'path' => '/',
        'content' => contentOf([['id' => '11111111-1111-4111-8111-111111111111', 'layout' => 'retired-layout', 'elements' => []]]),
    ]);

    $this->get('/')->assertOk();

    Log::shouldHaveReceived('warning')
        ->with('Page section skipped: unknown layout.', Mockery::on(fn (array $context): bool => $context['layout'] === 'retired-layout'))
        ->once();
});

test('an element type that is not registered is skipped', function (): void {
    PageFixtures::create(['is_homepage' => true], [
        'locale' => $this->locale,
        'slug' => 'home',
        'path' => '/',
        'content' => contentOf([[
            'id' => '11111111-1111-4111-8111-111111111111',
            'layout' => 'full-width',
            'elements' => [
                ['id' => '22222222-2222-4222-8222-222222222222', 'type' => 'video', 'version' => 1, 'data' => []],
                ['id' => '33333333-3333-4333-8333-333333333333', 'type' => 'divider', 'version' => 1, 'data' => []],
            ],
        ]]),
    ]);

    $this->get('/')->assertInertia(fn (Assert $page) => $page
        ->has('sections.0.elements', 1)
        ->where('sections.0.elements.0.type', 'divider'));
});

test('markdown is rendered to HTML with raw HTML escaped', function (): void {
    PageFixtures::create(['is_homepage' => true], [
        'locale' => $this->locale,
        'slug' => 'home',
        'path' => '/',
        'content' => contentOf([[
            'id' => '11111111-1111-4111-8111-111111111111',
            'layout' => 'full-width',
            'elements' => [[
                'id' => '22222222-2222-4222-8222-222222222222',
                'type' => 'markdown',
                'version' => 1,
                'data' => ['source' => "# Title\n\n<script>alert(1)</script>"],
            ]],
        ]]),
    ]);

    $html = $this->get('/')->inertiaProps('sections')[0]['elements'][0]['data']['html'];

    expect($html)->toContain('<h1>Title</h1>')
        ->and($html)->not->toContain('<script');
});

test('the stored translation keeps the content of its locale only', function (): void {
    $page = PageFixtures::create(['is_homepage' => true], ['locale' => $this->locale, 'slug' => 'home', 'path' => '/']);
    PageTranslation::factory()->create(['page_id' => $page->id, 'locale' => 'az', 'slug' => 'ana', 'path' => '/az-only']);

    expect(PageTranslation::query()->where('page_id', $page->id)->where('locale', 'az')->value('path'))->toBe('/az-only');
});
