<?php

use App\Modules\Pages\Events\PageRendered;
use App\Modules\Pages\Events\PageRendering;
use App\Modules\Pages\Events\PageResolving;
use App\Modules\Pages\Models\Page;
use App\Modules\Pages\Models\PageTranslation;
use App\Modules\Pages\Services\PageContentValidator;
use App\Modules\Pages\Services\PageRenderer;
use App\Modules\Pages\Support\ContentElementRegistry;
use App\Modules\Pages\Support\ContentElements\ChildPagesElement;
use App\Modules\Pages\Support\ContentElements\DynamicContentElement;
use App\Modules\Pages\Support\PageRenderContext;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Support\PageFixtures;

const PARENT_ELEMENT_ID = '22222222-2222-4222-8222-222222222222';

beforeEach(function (): void {
    $this->locale = config('app.locale');
});

/**
 * A live parent page at `services` with one child-pages element in its content.
 *
 * @param  array<string, mixed>  $config
 */
function parentWithChildPages(string $locale, array $config = []): Page
{
    return PageFixtures::create(['is_homepage' => false, 'status' => 'published', 'publish_date' => null, 'publish_time' => null], [
        'locale' => $locale,
        'title' => 'Services',
        'slug' => 'services',
        'path' => 'services',
        'content' => ['version' => 1, 'sections' => [[
            'id' => '11111111-1111-4111-8111-111111111111',
            'layout' => 'full-width',
            'elements' => [[
                'id' => PARENT_ELEMENT_ID,
                'type' => 'child-pages',
                'version' => 1,
                'data' => [...['title' => 'Our services', 'limit' => 10, 'order' => 'title'], ...$config],
            ]],
        ]]],
    ]);
}

function addChild(Page $parent, string $locale, string $title, string $slug, array $attributes = []): Page
{
    return PageFixtures::create([
        'parent_id' => $parent->id,
        'status' => 'published',
        'publish_date' => null,
        'publish_time' => null,
        ...$attributes,
    ], [
        'locale' => $locale,
        'title' => $title,
        'slug' => $slug,
        'path' => 'services/'.$slug,
    ]);
}

test('the child-pages component is registered as a dynamic content element', function (): void {
    $element = app(ContentElementRegistry::class)->resolve('child-pages');

    expect($element)->toBeInstanceOf(ChildPagesElement::class)
        ->and($element)->toBeInstanceOf(DynamicContentElement::class);
});

test('invalid component config is rejected with the field path', function (): void {
    $document = ['version' => 1, 'sections' => [[
        'id' => '11111111-1111-4111-8111-111111111111',
        'layout' => 'full-width',
        'elements' => [[
            'id' => PARENT_ELEMENT_ID,
            'type' => 'child-pages',
            'version' => 1,
            'data' => ['title' => 'Services', 'limit' => 7, 'order' => 'random'],
        ]],
    ]]];

    $result = app(PageContentValidator::class)->validate($document, fn (): bool => true);

    expect($result['errors'])->toHaveKeys([
        'content.sections.0.elements.0.data.limit',
        'content.sections.0.elements.0.data.order',
    ]);
});

test('valid component config is cleaned and stored with a numeric limit', function (): void {
    $document = ['version' => 1, 'sections' => [[
        'id' => '11111111-1111-4111-8111-111111111111',
        'layout' => 'full-width',
        'elements' => [[
            'id' => PARENT_ELEMENT_ID,
            'type' => 'child-pages',
            'version' => 1,
            'data' => ['title' => '  Services  ', 'limit' => '20', 'order' => 'updated'],
        ]],
    ]]];

    $result = app(PageContentValidator::class)->validate($document, fn (): bool => true);

    expect($result['errors'])->toBe([])
        ->and($result['document']['sections'][0]['elements'][0]['data'])
        ->toBe(['title' => 'Services', 'limit' => 20, 'order' => 'updated']);
});

test('the cached part of a component holds its config only, never live children', function (): void {
    $element = app(ChildPagesElement::class);

    expect($element->present(['title' => 'Services', 'limit' => 5, 'order' => 'title']))
        ->toBe(['title' => 'Services', 'limit' => 5, 'order' => 'title'])
        ->and($element->present([]))->not->toHaveKey('items');
});

test('the public page lists only live children in the current locale', function (): void {
    $parent = parentWithChildPages($this->locale);
    addChild($parent, $this->locale, 'Web', 'web');
    addChild($parent, $this->locale, 'Design', 'design');
    addChild($parent, $this->locale, 'Draft', 'draft', ['status' => 'draft']);
    addChild($parent, $this->locale, 'Future', 'future', ['status' => 'scheduled', 'publish_date' => now()->addDays(3)->toDateString(), 'publish_time' => '09:00']);

    $this->get("/{$this->locale}/services")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('sections.0.elements.0.type', 'child-pages')
            ->where('sections.0.elements.0.data.title', 'Our services')
            ->has('sections.0.elements.0.data.items', 2)
            ->where('sections.0.elements.0.data.items.0.title', 'Design')
            ->where('sections.0.elements.0.data.items.0.url', "/{$this->locale}/services/design")
            ->where('sections.0.elements.0.data.items.1.title', 'Web'));
});

test('children without a translation in the locale are left out', function (): void {
    $parent = parentWithChildPages($this->locale);
    addChild($parent, $this->locale, 'Web', 'web');
    PageFixtures::create(['parent_id' => $parent->id, 'status' => 'published', 'publish_date' => null, 'publish_time' => null], [
        'locale' => 'ru',
        'title' => 'Только русский',
        'slug' => 'russian-only',
        'path' => 'services/russian-only',
    ]);

    $this->get("/{$this->locale}/services")
        ->assertInertia(fn (Assert $page) => $page->has('sections.0.elements.0.data.items', 1));
});

test('limit and order are applied to the child list', function (): void {
    $parent = parentWithChildPages($this->locale, ['limit' => 5, 'order' => 'title']);

    foreach (['Echo', 'Alpha', 'Delta', 'Bravo', 'Charlie', 'Foxtrot'] as $title) {
        addChild($parent, $this->locale, $title, strtolower($title));
    }

    $this->get("/{$this->locale}/services")
        ->assertInertia(fn (Assert $page) => $page
            ->has('sections.0.elements.0.data.items', 5)
            ->where('sections.0.elements.0.data.items.0.title', 'Alpha')
            ->where('sections.0.elements.0.data.items.4.title', 'Echo'));
});

test('a new child shows up on the next request while the page cache is warm', function (): void {
    $parent = parentWithChildPages($this->locale);
    addChild($parent, $this->locale, 'Web', 'web');

    $this->get("/{$this->locale}/services")->assertInertia(fn (Assert $page) => $page->has('sections.0.elements.0.data.items', 1));

    addChild($parent, $this->locale, 'Design', 'design');

    $this->get("/{$this->locale}/services")->assertInertia(fn (Assert $page) => $page->has('sections.0.elements.0.data.items', 2));
});

test('the lifecycle events fire on a public request', function (): void {
    Event::fake([PageResolving::class, PageRendering::class, PageRendered::class]);

    $parent = parentWithChildPages($this->locale);
    addChild($parent, $this->locale, 'Web', 'web');

    $this->get("/{$this->locale}/services")->assertOk();

    Event::assertDispatched(PageResolving::class, fn (PageResolving $event): bool => $event->locale === $this->locale && $event->path === 'services');
    Event::assertDispatched(PageRendering::class, fn (PageRendering $event): bool => $event->isPreview === false && $event->translation->path === 'services');
    Event::assertDispatched(PageRendered::class, fn (PageRendered $event): bool => $event->isPreview === false
        && $event->props['sections'][0]['elements'][0]['data']['items'][0]['title'] === 'Web');
});

test('the lifecycle events fire on a preview with the preview flag set', function (): void {
    Event::fake([PageResolving::class, PageRendering::class, PageRendered::class]);

    $parent = parentWithChildPages($this->locale);
    addChild($parent, $this->locale, 'Web', 'web');

    $url = URL::temporarySignedRoute('pages.preview.show', now()->addMinutes(30), ['page' => $parent, 'locale' => $this->locale]);

    $this->get($url)->assertOk();

    Event::assertNotDispatched(PageResolving::class);
    Event::assertDispatched(PageRendering::class, fn (PageRendering $event): bool => $event->isPreview === true);
    Event::assertDispatched(PageRendered::class, fn (PageRendered $event): bool => $event->isPreview === true);
});

test('a component that throws is logged and the rest of the page still renders', function (): void {
    Log::spy();

    app(ContentElementRegistry::class)->register(new class implements DynamicContentElement
    {
        public function key(): string
        {
            return 'broken-component';
        }

        public function label(): string
        {
            return 'Broken';
        }

        public function rules(): array
        {
            return [];
        }

        public function schema(): array
        {
            return ['defaults' => [], 'fields' => []];
        }

        public function messages(): array
        {
            return [];
        }

        public function requiresPermission(): ?string
        {
            return null;
        }

        public function normalize(array $data): array
        {
            return $data;
        }

        public function present(array $data): array
        {
            return $data;
        }

        public function resolve(array $data, PageRenderContext $context): array
        {
            throw new RuntimeException('Database unavailable');
        }
    });

    $translation = PageTranslation::factory()->make(['id' => 7, 'locale' => $this->locale, 'path' => 'services']);
    $translation->setRelation('page', new Page);

    $props = [
        'page' => ['title' => 'Services'],
        'sections' => [[
            'id' => 's1',
            'layout' => 'full-width',
            'settings' => [],
            'elements' => [
                ['id' => 'e1', 'type' => 'broken-component', 'data' => ['title' => 'Kept']],
                ['id' => 'e2', 'type' => 'divider', 'data' => []],
            ],
        ]],
    ];

    $result = app(PageRenderer::class)->finalize($translation, $props, false);

    expect($result['sections'][0]['elements'])->toHaveCount(2)
        ->and($result['sections'][0]['elements'][0]['data'])->toBe(['title' => 'Kept'])
        ->and($result['sections'][0]['elements'][1]['type'])->toBe('divider');

    Log::shouldHaveReceived('error')->with('Page component failed to resolve.', Mockery::type('array'))->once();
});
