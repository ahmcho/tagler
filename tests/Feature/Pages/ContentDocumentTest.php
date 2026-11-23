<?php

use App\Models\User;
use App\Modules\Auth\Database\Seeders\RolesAndPermissionsSeeder;
use App\Modules\Auth\Models\Role;
use App\Modules\Pages\Models\PageTranslation;
use Illuminate\Support\Str;
use Tests\Support\PageFixtures;

beforeEach(function (): void {
    (new RolesAndPermissionsSeeder)->run();
    $this->locale = config('app.locale');
});

function editor(bool $withHtml = false): User
{
    $role = Role::create(['name' => 'Editor '.Str::random(6), 'guard_name' => 'web']);
    $permissions = ['pages.index', 'pages.store', 'pages.update'];

    if ($withHtml) {
        $permissions[] = 'pages.html';
    }

    $role->givePermissionTo($permissions);

    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

/**
 * @param  list<array<string, mixed>>  $sections
 * @return array<string, mixed>
 */
function document(array $sections): array
{
    return ['version' => 1, 'sections' => $sections];
}

function section(array $elements, array $overrides = []): array
{
    return array_merge(['layout' => 'full-width', 'elements' => $elements], $overrides);
}

/**
 * @return array<string, mixed>
 */
function contentPayload(array $content): array
{
    return PageFixtures::payload([], [config('app.locale') => ['title' => 'Doc', 'slug' => 'doc-'.Str::lower(Str::random(5)), 'content' => $content]]);
}

test('a valid document is saved with generated ids where none were given', function (): void {
    $this->actingAs(editor())
        ->post(route('pages.store'), contentPayload(document([
            section([['type' => 'heading', 'version' => 1, 'data' => ['text' => 'Welcome', 'level' => 1]]]),
        ])))
        ->assertSessionHasNoErrors();

    $content = PageTranslation::query()->where('locale', $this->locale)->latest('id')->first()->content;

    expect(Str::isUuid($content['sections'][0]['id']))->toBeTrue()
        ->and(Str::isUuid($content['sections'][0]['elements'][0]['id']))->toBeTrue()
        ->and($content['sections'][0]['elements'][0]['data'])->toBe(['text' => 'Welcome', 'level' => 1]);
});

test('an element type that is not registered is kept and does not block the save', function (): void {
    $this->actingAs(editor())
        ->post(route('pages.store'), contentPayload(document([
            section([['id' => (string) Str::uuid(), 'type' => 'video', 'version' => 1, 'data' => ['src' => 'x'], 'vendor_key' => 'kept']]),
        ])))
        ->assertSessionHasNoErrors();

    $element = PageTranslation::query()->where('locale', $this->locale)->latest('id')->first()->content['sections'][0]['elements'][0];

    expect($element['type'])->toBe('video')
        ->and($element['vendor_key'])->toBe('kept');
});

test('unknown top-level and section keys are preserved', function (): void {
    $this->actingAs(editor())
        ->post(route('pages.store'), contentPayload([
            'version' => 1,
            'sections' => [section([], ['future_option' => 'yes'])],
            'meta' => ['origin' => 'import'],
        ]))
        ->assertSessionHasNoErrors();

    $content = PageTranslation::query()->where('locale', $this->locale)->latest('id')->first()->content;

    expect($content['meta'])->toBe(['origin' => 'import'])
        ->and($content['sections'][0]['future_option'])->toBe('yes');
});

test('a section with a layout that is not configured is rejected', function (): void {
    $this->actingAs(editor())
        ->post(route('pages.store'), contentPayload(document([section([], ['layout' => 'hero-banner'])])))
        ->assertSessionHasErrors('translations.'.$this->locale.'.content.sections.0.layout');
});

test('a document with an unsupported version is rejected', function (): void {
    $this->actingAs(editor())
        ->post(route('pages.store'), contentPayload(['version' => 9, 'sections' => []]))
        ->assertSessionHasErrors('translations.'.$this->locale.'.content.version');
});

test('a heading with a level outside 1 to 6 is rejected with the field path', function (): void {
    $this->actingAs(editor())
        ->post(route('pages.store'), contentPayload(document([
            section([['type' => 'heading', 'version' => 1, 'data' => ['text' => 'Hi', 'level' => 9]]]),
        ])))
        ->assertSessionHasErrors('translations.'.$this->locale.'.content.sections.0.elements.0.data.level');
});

test('duplicate ids inside one document are rejected', function (): void {
    $id = (string) Str::uuid();

    $this->actingAs(editor())
        ->post(route('pages.store'), contentPayload(document([
            section([['id' => $id, 'type' => 'divider', 'version' => 1, 'data' => []]]),
            section([], ['id' => $id]),
        ])))
        ->assertSessionHasErrors('translations.'.$this->locale.'.content.sections.1.id');
});

test('a malformed id is rejected', function (): void {
    $this->actingAs(editor())
        ->post(route('pages.store'), contentPayload(document([section([], ['id' => 'not-a-uuid'])])))
        ->assertSessionHasErrors('translations.'.$this->locale.'.content.sections.0.id');
});

test('a button with a javascript link is rejected', function (): void {
    $this->actingAs(editor())
        ->post(route('pages.store'), contentPayload(document([
            section([['type' => 'button', 'version' => 1, 'data' => ['label' => 'Go', 'url' => 'javascript:alert(1)']]]),
        ])))
        ->assertSessionHasErrors('translations.'.$this->locale.'.content.sections.0.elements.0.data.url');
});

test('an html block needs the html permission', function (): void {
    $this->actingAs(editor())
        ->post(route('pages.store'), contentPayload(document([
            section([['type' => 'html', 'version' => 1, 'data' => ['source' => '<p>Hi</p>']]]),
        ])))
        ->assertSessionHasErrors('translations.'.$this->locale.'.content.sections.0.elements.0.type');
});

test('an editor with the html permission saves an html block sanitised', function (): void {
    $this->actingAs(editor(withHtml: true))
        ->post(route('pages.store'), contentPayload(document([
            section([['type' => 'html', 'version' => 1, 'data' => ['source' => '<p>Hi</p><script>alert(1)</script>']]]),
        ])))
        ->assertSessionHasNoErrors();

    $source = PageTranslation::query()->where('locale', $this->locale)->latest('id')->first()->content['sections'][0]['elements'][0]['data']['source'];

    expect($source)->toContain('<p>Hi</p>')
        ->and($source)->not->toContain('<script');
});

test('a document above the section limit is rejected', function (): void {
    $sections = array_fill(0, 201, section([]));

    $this->actingAs(editor())
        ->post(route('pages.store'), contentPayload(document($sections)))
        ->assertSessionHasErrors('translations.'.$this->locale.'.content.sections');
});

test('an element with missing data is rejected with the field path', function (): void {
    $this->actingAs(editor())
        ->post(route('pages.store'), contentPayload(document([
            section([['type' => 'paragraph', 'version' => 1, 'data' => []]]),
        ])))
        ->assertSessionHasErrors('translations.'.$this->locale.'.content.sections.0.elements.0.data.html');
});

test('a heading level outside the range gets a readable message', function (): void {
    $this->actingAs(editor())
        ->post(route('pages.store'), contentPayload(document([
            section([['type' => 'heading', 'version' => 1, 'data' => ['text' => 'Hi', 'level' => 9]]]),
        ])))
        ->assertSessionHasErrors([
            'translations.'.$this->locale.'.content.sections.0.elements.0.data.level' => 'The heading level must be from 1 to 6.',
        ]);
});

test('a section with a configured background is saved with its settings', function (): void {
    $this->actingAs(editor())
        ->post(route('pages.store'), contentPayload(document([
            section([], ['settings' => ['background' => 'dark']]),
        ])))
        ->assertSessionHasNoErrors();

    $content = PageTranslation::query()->where('locale', $this->locale)->latest('id')->first()->content;

    expect($content['sections'][0]['settings'])->toBe(['background' => 'dark']);
});

test('a section with a background that is not configured is rejected with the field path', function (): void {
    $this->actingAs(editor())
        ->post(route('pages.store'), contentPayload(document([
            section([], ['settings' => ['background' => 'neon']]),
        ])))
        ->assertSessionHasErrors('translations.'.$this->locale.'.content.sections.0.settings.background');
});

test('section settings that are not an object are rejected', function (): void {
    $this->actingAs(editor())
        ->post(route('pages.store'), contentPayload(document([
            section([], ['settings' => 'dark']),
        ])))
        ->assertSessionHasErrors('translations.'.$this->locale.'.content.sections.0.settings');
});

test('section settings that are a non-empty list are rejected', function (): void {
    $this->actingAs(editor())
        ->post(route('pages.store'), contentPayload(document([
            section([], ['settings' => ['dark', 'light']]),
        ])))
        ->assertSessionHasErrors('translations.'.$this->locale.'.content.sections.0.settings');
});

test('a section without settings or with empty settings is valid', function (): void {
    $this->actingAs(editor())
        ->post(route('pages.store'), contentPayload(document([
            section([]),
            section([], ['settings' => []]),
        ])))
        ->assertSessionHasNoErrors();
});

test('unknown section settings keys are kept', function (): void {
    $this->actingAs(editor())
        ->post(route('pages.store'), contentPayload(document([
            section([], ['settings' => ['background' => 'light', 'padding' => 'lg']]),
        ])))
        ->assertSessionHasNoErrors();

    $content = PageTranslation::query()->where('locale', $this->locale)->latest('id')->first()->content;

    expect($content['sections'][0]['settings'])->toEqualCanonicalizing(['background' => 'light', 'padding' => 'lg']);
});
