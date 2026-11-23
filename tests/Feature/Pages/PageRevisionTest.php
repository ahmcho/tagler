<?php

use App\Models\User;
use App\Modules\Auth\Database\Seeders\RolesAndPermissionsSeeder;
use App\Modules\Auth\Models\Role;
use App\Modules\Pages\Models\Page;
use App\Modules\Pages\Models\PageRevision;
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
function revisionEditor(array $permissions): User
{
    $role = Role::create(['name' => 'Revision '.Str::random(8), 'guard_name' => 'web']);
    $role->givePermissionTo($permissions);

    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

function titlePayload(string $locale, string $title, string $slug): array
{
    return PageFixtures::payload(['status' => 'published'], [$locale => ['title' => $title, 'slug' => $slug]]);
}

test('creating a page saves one revision that holds the page and its translations', function (): void {
    $this->actingAs(revisionEditor(['pages.store']))
        ->post(route('pages.store'), titlePayload($this->locale, 'Offers', 'offers-revision'))
        ->assertSessionHasNoErrors();

    $page = Page::query()->latest('id')->firstOrFail();
    $revisions = PageRevision::query()->where('page_id', $page->id)->get();

    expect($revisions)->toHaveCount(1)
        ->and($revisions->first()->snapshot['translations'][$this->locale]['title'])->toBe('Offers')
        ->and($revisions->first()->snapshot)->not->toHaveKey('is_homepage');
});

test('updating a page saves one more revision and records the saving user', function (): void {
    $editor = revisionEditor(['pages.update']);
    $page = PageFixtures::create(['status' => 'published'], ['locale' => $this->locale, 'title' => 'Before', 'slug' => 'before-revision', 'path' => 'before-revision']);

    $this->actingAs($editor)
        ->put(route('pages.update', $page), titlePayload($this->locale, 'After', 'before-revision'))
        ->assertSessionHasNoErrors();

    $revision = PageRevision::query()->where('page_id', $page->id)->sole();

    expect($revision->snapshot['translations'][$this->locale]['title'])->toBe('After')
        ->and($revision->user_id)->toBe($editor->id);
});

test('publishing a page saves no revision', function (): void {
    $page = PageFixtures::create(['status' => 'draft', 'publish_date' => null, 'publish_time' => null], ['locale' => $this->locale, 'title' => 'Draft', 'slug' => 'draft-revision', 'path' => 'draft-revision']);

    $this->actingAs(revisionEditor(['pages.index', 'pages.publish']))
        ->post(route('pages.publish', $page))
        ->assertRedirect();

    expect(PageRevision::query()->where('page_id', $page->id)->count())->toBe(0);
});

test('only the newest revisions up to the configured number are kept', function (): void {
    config(['modules.pages.revisions.keep' => 2]);

    $editor = revisionEditor(['pages.update']);
    $page = PageFixtures::create(['status' => 'published'], ['locale' => $this->locale, 'title' => 'Start', 'slug' => 'prune-revision', 'path' => 'prune-revision']);

    foreach (['First', 'Second', 'Third'] as $title) {
        $this->actingAs($editor)
            ->put(route('pages.update', $page), titlePayload($this->locale, $title, 'prune-revision'))
            ->assertSessionHasNoErrors();
    }

    $titles = PageRevision::query()->where('page_id', $page->id)->get()
        ->map(fn (PageRevision $revision): string => $revision->snapshot['translations'][$this->locale]['title'])
        ->sort()
        ->values()
        ->all();

    expect($titles)->toBe(['Second', 'Third']);
});

test('the edit page opens from a revision with its values and changes nothing until saved', function (): void {
    $editor = revisionEditor(['pages.update']);
    $page = PageFixtures::create(['status' => 'published'], ['locale' => $this->locale, 'title' => 'Start', 'slug' => 'restore-revision', 'path' => 'restore-revision']);

    $this->actingAs($editor)->put(route('pages.update', $page), titlePayload($this->locale, 'Old title', 'restore-revision'));
    $this->actingAs($editor)->put(route('pages.update', $page), titlePayload($this->locale, 'New title', 'restore-revision'));

    $old = PageRevision::query()->where('page_id', $page->id)->orderBy('id')->firstOrFail();

    $this->actingAs($editor)
        ->get(route('pages.edit', [$page, 'revision' => $old->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $inertia) => $inertia
            ->component('pages/edit')
            ->where('model.translations.'.$this->locale.'.title', 'Old title')
            ->where('loadedRevision.id', $old->id)
            ->has('revisions', 2));

    expect($page->fresh()->translationFor($this->locale)->title)->toBe('New title');
});

test('saving a revision that was opened in the form creates a new revision', function (): void {
    $editor = revisionEditor(['pages.update']);
    $page = PageFixtures::create(['status' => 'published'], ['locale' => $this->locale, 'title' => 'Start', 'slug' => 'reopen-revision', 'path' => 'reopen-revision']);

    $this->actingAs($editor)->put(route('pages.update', $page), titlePayload($this->locale, 'Old title', 'reopen-revision'));
    $this->actingAs($editor)->put(route('pages.update', $page), titlePayload($this->locale, 'New title', 'reopen-revision'));

    $old = PageRevision::query()->where('page_id', $page->id)->orderBy('id')->firstOrFail();

    $this->actingAs($editor)
        ->put(route('pages.update', $page), titlePayload($this->locale, (string) $old->snapshot['translations'][$this->locale]['title'], 'reopen-revision'))
        ->assertSessionHasNoErrors();

    expect(PageRevision::query()->where('page_id', $page->id)->count())->toBe(3)
        ->and($page->fresh()->translationFor($this->locale)->title)->toBe('Old title');
});

test('a revision of another page gives a 404', function (): void {
    $editor = revisionEditor(['pages.update']);
    $page = PageFixtures::create(['status' => 'published'], ['locale' => $this->locale, 'title' => 'Mine', 'slug' => 'mine-revision', 'path' => 'mine-revision']);
    $other = PageFixtures::create(['status' => 'published'], ['locale' => $this->locale, 'title' => 'Theirs', 'slug' => 'theirs-revision', 'path' => 'theirs-revision']);

    $this->actingAs($editor)->put(route('pages.update', $other), titlePayload($this->locale, 'Theirs v2', 'theirs-revision'));
    $foreign = PageRevision::query()->where('page_id', $other->id)->firstOrFail();

    $this->actingAs($editor)
        ->get(route('pages.edit', [$page, 'revision' => $foreign->id]))
        ->assertNotFound();
});

test('a user without update permission is forbidden from opening a revision', function (): void {
    $editor = revisionEditor(['pages.update']);
    $page = PageFixtures::create(['status' => 'published'], ['locale' => $this->locale, 'title' => 'Start', 'slug' => 'viewer-revision', 'path' => 'viewer-revision']);

    $this->actingAs($editor)->put(route('pages.update', $page), titlePayload($this->locale, 'Changed', 'viewer-revision'));
    $revision = PageRevision::query()->where('page_id', $page->id)->firstOrFail();

    $this->actingAs(revisionEditor(['pages.index']))
        ->get(route('pages.edit', [$page, 'revision' => $revision->id]))
        ->assertForbidden();
});

test('a revision saved before the date and time split shows its old publish time in the form', function (): void {
    $editor = revisionEditor(['pages.update']);
    $page = PageFixtures::create(['status' => 'published'], ['locale' => $this->locale, 'title' => 'Start', 'slug' => 'legacy-revision', 'path' => 'legacy-revision']);

    $this->actingAs($editor)->put(route('pages.update', $page), titlePayload($this->locale, 'Legacy title', 'legacy-revision'));

    $revision = PageRevision::query()->where('page_id', $page->id)->firstOrFail();
    $snapshot = $revision->snapshot;
    unset($snapshot['publish_date'], $snapshot['publish_time']);
    $snapshot['published_at'] = '2026-11-19T10:30:00+00:00';
    $revision->update(['snapshot' => $snapshot]);

    $this->actingAs($editor)
        ->get(route('pages.edit', [$page, 'revision' => $revision->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $inertia) => $inertia
            ->where('model.publish_date', '2026-11-19')
            ->where('model.publish_time', '10:30'));
});
