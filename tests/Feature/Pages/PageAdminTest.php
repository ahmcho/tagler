<?php

use App\Models\User;
use App\Modules\Auth\Database\Seeders\RolesAndPermissionsSeeder;
use App\Modules\Auth\Models\Role;
use App\Modules\Pages\Enums\PageStatus;
use App\Modules\Pages\Models\Page;
use App\Modules\Pages\Models\PageTranslation;
use Illuminate\Database\QueryException;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Support\PageFixtures;

beforeEach(function (): void {
    (new RolesAndPermissionsSeeder)->run();
});

function pageAdmin(): User
{
    $user = User::factory()->create();
    $user->assignRole('Admin');

    return $user;
}

function pageViewer(): User
{
    Role::create(['name' => 'Page viewer', 'guard_name' => 'web'])->givePermissionTo('pages.index');

    $user = User::factory()->create();
    $user->assignRole('Page viewer');

    return $user;
}

/**
 * A valid store or update payload. Each locale starts blank, and the default locale gets the given fields.
 *
 * @param  array<string, mixed>  $fields  Page columns
 * @param  array<string, array<string, mixed>>  $translations  Locale => translation fields
 * @return array<string, mixed>
 */
function pagePayload(array $fields = [], array $translations = []): array
{
    return PageFixtures::payload($fields, $translations);
}

test('guests are redirected to the admin login page', function (): void {
    $this->get(route('pages.index'))->assertRedirect(route('login'));
});

test('a user without the page permissions is forbidden', function (): void {
    $this->actingAs(User::factory()->create())
        ->get(route('pages.index'))
        ->assertForbidden();
});

test('an admin creates a top-level page with a translation in the default locale', function (): void {
    $this->actingAs(pageAdmin())
        ->post(route('pages.store'), pagePayload())
        ->assertRedirect(route('pages.index'))
        ->assertSessionHasNoErrors();

    $translation = PageTranslation::query()->where('locale', config('app.locale'))->first();

    expect($translation?->path)->toBe('about')
        ->and($translation?->body)->toBeNull();
});

test('a child page path combines its parent path and its slug in the same locale', function (): void {
    $parent = PageFixtures::create(['status' => PageStatus::Published], ['slug' => 'services', 'path' => 'services']);

    $this->actingAs(pageAdmin())
        ->post(route('pages.store'), pagePayload(['parent_id' => $parent->id], [
            config('app.locale') => ['title' => 'Web', 'slug' => 'web'],
        ]))
        ->assertSessionHasNoErrors();

    expect(PageTranslation::query()->where('path', 'services/web')->where('locale', config('app.locale'))->exists())->toBeTrue();
});

test('the same slug is allowed in a different locale', function (): void {
    PageFixtures::create([], ['locale' => config('app.locale'), 'slug' => 'about', 'path' => 'about']);

    $this->actingAs(pageAdmin())
        ->post(route('pages.store'), pagePayload([], [
            config('app.locale') => ['title' => 'News', 'slug' => 'news'],
            'az' => ['title' => 'Haqqımızda', 'slug' => 'about'],
        ]))
        ->assertSessionHasNoErrors();

    expect(PageTranslation::query()->where('locale', 'az')->where('path', 'about')->exists())->toBeTrue();
});

test('a path that is already used in the same locale is rejected', function (): void {
    PageFixtures::create([], ['slug' => 'about', 'path' => 'about']);

    $this->actingAs(pageAdmin())
        ->post(route('pages.store'), pagePayload())
        ->assertSessionHasErrors('translations.'.config('app.locale').'.slug');

    expect(PageTranslation::query()->where('path', 'about')->count())->toBe(1);
});

test('a slug that uses a reserved system path is rejected', function (): void {
    $this->actingAs(pageAdmin())
        ->post(route('pages.store'), pagePayload([], [config('app.locale') => ['title' => 'Admin', 'slug' => 'admin']]))
        ->assertSessionHasErrors('translations.'.config('app.locale').'.slug');
});

test('a slug that is a locale code is rejected because it would clash with the locale homepage', function (): void {
    $this->actingAs(pageAdmin())
        ->post(route('pages.store'), pagePayload([], [config('app.locale') => ['title' => 'Az', 'slug' => 'az']]))
        ->assertSessionHasErrors('translations.'.config('app.locale').'.slug');
});

test('a slug with uppercase letters or spaces is rejected', function (string $slug): void {
    $this->actingAs(pageAdmin())
        ->post(route('pages.store'), pagePayload([], [config('app.locale') => ['title' => 'Bad', 'slug' => $slug]]))
        ->assertSessionHasErrors('translations.'.config('app.locale').'.slug');
})->with(['About', 'has space', 'under_score']);

test('a scheduled page needs a publish date', function (): void {
    $this->actingAs(pageAdmin())
        ->post(route('pages.store'), pagePayload(['status' => 'scheduled']))
        ->assertSessionHasErrors('publish_date');
});

test('a scheduled page needs a publish time', function (): void {
    $this->actingAs(pageAdmin())
        ->post(route('pages.store'), pagePayload(['status' => 'scheduled', 'publish_date' => '2026-12-01']))
        ->assertSessionHasErrors('publish_time');
});

test('a publish time must use the 24-hour HH:MM format', function (string $time): void {
    $this->actingAs(pageAdmin())
        ->post(route('pages.store'), pagePayload(['publish_date' => '2026-12-01', 'publish_time' => $time]))
        ->assertSessionHasErrors('publish_time');
})->with(['9:30 PM', '09:30:00', '25:00']);

test('a scheduled page must publish in the future', function (string $date, string $time): void {
    $this->travelTo(Carbon::parse('2026-11-23 12:00:00'));

    $this->actingAs(pageAdmin())
        ->post(route('pages.store'), pagePayload(['status' => 'scheduled', 'publish_date' => $date, 'publish_time' => $time]))
        ->assertSessionHasErrors('publish_time');
})->with([
    'an earlier day' => ['2026-11-22', '23:59'],
    'an earlier time today' => ['2026-11-23', '11:59'],
    'the current minute' => ['2026-11-23', '12:00'],
]);

test('a scheduled page with a time later today is accepted', function (): void {
    $this->travelTo(Carbon::parse('2026-11-23 12:00:00'));

    $this->actingAs(pageAdmin())
        ->post(route('pages.store'), pagePayload(
            ['status' => 'scheduled', 'publish_date' => '2026-11-23', 'publish_time' => '12:01'],
            [config('app.locale') => ['title' => 'Soon', 'slug' => 'soon']],
        ))
        ->assertSessionHasNoErrors();
});

test('a draft may keep a past publish date', function (): void {
    $this->travelTo(Carbon::parse('2026-11-23 12:00:00'));

    $this->actingAs(pageAdmin())
        ->post(route('pages.store'), pagePayload(['status' => 'draft', 'publish_date' => '2026-11-01', 'publish_time' => '08:00']))
        ->assertSessionHasNoErrors();
});

test('the publish date and time are saved in their own columns', function (): void {
    $this->actingAs(pageAdmin())
        ->post(route('pages.store'), pagePayload(
            ['status' => 'scheduled', 'publish_date' => '2026-12-01', 'publish_time' => '09:30'],
            [config('app.locale') => ['title' => 'Launch', 'slug' => 'launch']],
        ))
        ->assertSessionHasNoErrors();

    $page = Page::query()->latest('id')->firstOrFail();

    expect($page->publish_date?->toDateString())->toBe('2026-12-01')
        ->and($page->publish_time)->toBe('09:30');
});

test('a locale with a title but no slug is rejected', function (): void {
    $this->actingAs(pageAdmin())
        ->post(route('pages.store'), pagePayload([], ['az' => ['title' => 'Haqqımızda']]))
        ->assertSessionHasErrors('translations.az.slug');
});

test('a locale that is not supported is rejected', function (): void {
    $payload = pagePayload();
    $payload['translations']['fr'] = ['title' => 'À propos', 'slug' => 'a-propos'];

    $this->actingAs(pageAdmin())
        ->post(route('pages.store'), $payload)
        ->assertSessionHasErrors('translations');
});

test('a child cannot be created in a locale its parent does not have', function (): void {
    $parent = PageFixtures::create([], ['locale' => config('app.locale'), 'slug' => 'services', 'path' => 'services']);

    $this->actingAs(pageAdmin())
        ->post(route('pages.store'), pagePayload(['parent_id' => $parent->id], [
            'az' => ['title' => 'Xidmətlər', 'slug' => 'xidmetler'],
        ]))
        ->assertSessionHasErrors('translations.az.slug');
});

test('renaming a parent updates the paths of its descendants in every locale', function (): void {
    $parent = PageFixtures::create([], ['slug' => 'services', 'path' => 'services']);
    $child = PageFixtures::create(['parent_id' => $parent->id], ['slug' => 'web', 'path' => 'services/web']);
    $grandchild = PageFixtures::create(['parent_id' => $child->id], ['slug' => 'design', 'path' => 'services/web/design']);

    $this->actingAs(pageAdmin())
        ->put(route('pages.update', $parent), pagePayload(['status' => 'published'], [config('app.locale') => ['title' => 'Offers', 'slug' => 'offers']]))
        ->assertSessionHasNoErrors();

    expect(PageTranslation::query()->where('page_id', $child->id)->value('path'))->toBe('offers/web')
        ->and(PageTranslation::query()->where('page_id', $grandchild->id)->value('path'))->toBe('offers/web/design');
});

test('a page cannot be moved under its own child', function (): void {
    $parent = PageFixtures::create([], ['slug' => 'a', 'path' => 'a']);
    $child = PageFixtures::create(['parent_id' => $parent->id], ['slug' => 'b', 'path' => 'a/b']);

    $this->actingAs(pageAdmin())
        ->put(route('pages.update', $parent), pagePayload(['parent_id' => $child->id], [config('app.locale') => ['title' => 'A', 'slug' => 'a']]))
        ->assertSessionHasErrors('parent_id');

    expect($parent->refresh()->parent_id)->toBeNull();
});

test('a locale cannot be removed while a child page still uses it', function (): void {
    $parent = PageFixtures::create([], ['locale' => config('app.locale'), 'slug' => 'services', 'path' => 'services']);
    PageFixtures::create(['parent_id' => $parent->id], ['locale' => config('app.locale'), 'slug' => 'web', 'path' => 'services/web']);
    PageTranslation::factory()->create(['page_id' => $parent->id, 'locale' => 'az', 'slug' => 'xidmet', 'path' => 'xidmet']);
    PageTranslation::factory()->create(['page_id' => Page::query()->where('parent_id', $parent->id)->value('id'), 'locale' => 'az', 'slug' => 'veb', 'path' => 'xidmet/veb']);

    $this->actingAs(pageAdmin())
        ->put(route('pages.update', $parent), pagePayload([], [config('app.locale') => ['title' => 'Services', 'slug' => 'services']]))
        ->assertSessionHasErrors('translations.az.slug');

    expect(PageTranslation::query()->where('page_id', $parent->id)->where('locale', 'az')->exists())->toBeTrue();
});

test('a locale can be removed when no child uses it', function (): void {
    $page = PageFixtures::create([], ['locale' => config('app.locale'), 'slug' => 'news', 'path' => 'news']);
    PageTranslation::factory()->create(['page_id' => $page->id, 'locale' => 'az', 'slug' => 'xeberler', 'path' => 'xeberler']);

    $this->actingAs(pageAdmin())
        ->put(route('pages.update', $page), pagePayload([], [config('app.locale') => ['title' => 'News', 'slug' => 'news']]))
        ->assertSessionHasNoErrors();

    expect(PageTranslation::query()->where('page_id', $page->id)->where('locale', 'az')->exists())->toBeFalse();
});

test('a page with children cannot be deleted and the error reaches the list page', function (): void {
    $parent = PageFixtures::create([], ['slug' => 'a', 'path' => 'a']);
    PageFixtures::create(['parent_id' => $parent->id], ['slug' => 'b', 'path' => 'a/b']);

    $this->actingAs(pageAdmin())
        ->delete(route('pages.destroy', $parent))
        ->assertSessionHasErrors('delete');

    expect(Page::query()->whereKey($parent->id)->exists())->toBeTrue();
});

test('a draft page cannot become the homepage', function (): void {
    $page = PageFixtures::create(['status' => PageStatus::Draft, 'publish_date' => null, 'publish_time' => null], ['slug' => 'about', 'path' => 'about']);

    $this->actingAs(pageAdmin())
        ->post(route('pages.homepage', $page))
        ->assertSessionHasErrors('is_homepage');

    expect($page->refresh()->is_homepage)->toBeFalse();
});

test('assigning a new homepage moves the flag, keeps one homepage and gives the homepage path in each locale', function (): void {
    $first = PageFixtures::create(['is_homepage' => true], ['slug' => 'first', 'path' => '/']);
    $second = PageFixtures::create([], ['slug' => 'second', 'path' => 'second']);

    $this->actingAs(pageAdmin())->post(route('pages.homepage', $second))->assertSessionHasNoErrors();

    expect($first->refresh()->is_homepage)->toBeFalse()
        ->and($second->refresh()->is_homepage)->toBeTrue()
        ->and(Page::query()->where('is_homepage', true)->count())->toBe(1)
        ->and(PageTranslation::query()->where('page_id', $second->id)->value('path'))->toBe('/');
});

test('the database rejects a second homepage', function (): void {
    PageFixtures::create(['is_homepage' => true], ['slug' => 'one', 'path' => '/']);

    expect(fn () => PageFixtures::create(['is_homepage' => true], ['slug' => 'two', 'path' => '/two']))
        ->toThrow(QueryException::class);
});

test('unpublishing the homepage keeps the homepage flag', function (): void {
    $page = PageFixtures::create(['is_homepage' => true], ['slug' => 'home', 'path' => '/']);

    $this->actingAs(pageAdmin())->post(route('pages.unpublish', $page))->assertSessionHasNoErrors();

    expect($page->refresh()->status)->toBe(PageStatus::Draft)
        ->and($page->is_homepage)->toBeTrue();
});

test('publishing sets the publish date when none was set', function (): void {
    $page = PageFixtures::create(['status' => PageStatus::Draft, 'publish_date' => null, 'publish_time' => null], ['slug' => 'news', 'path' => 'news']);

    $this->actingAs(pageAdmin())->post(route('pages.publish', $page))->assertSessionHasNoErrors();

    expect($page->refresh()->status)->toBe(PageStatus::Published)
        ->and($page->publish_date)->not->toBeNull()
        ->and($page->publish_time)->not->toBeNull();
});

test('a user who cannot publish is forbidden from publishing', function (): void {
    $page = PageFixtures::create(['status' => PageStatus::Draft, 'publish_date' => null, 'publish_time' => null], ['slug' => 'news', 'path' => 'news']);

    $this->actingAs(pageViewer())
        ->post(route('pages.publish', $page))
        ->assertForbidden();

    expect($page->refresh()->status)->toBe(PageStatus::Draft);
});

test('a user who cannot assign the homepage is forbidden from doing so', function (): void {
    $page = PageFixtures::create([], ['slug' => 'about', 'path' => 'about']);

    $this->actingAs(pageViewer())
        ->post(route('pages.homepage', $page))
        ->assertForbidden();
});

test('the list page renders the pages with their locales and row permissions', function (): void {
    PageFixtures::create([], ['slug' => 'about', 'path' => 'about', 'title' => 'About us']);

    $this->actingAs(pageAdmin())
        ->get(route('pages.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('pages/index')
            ->where('pages.data.0.title', 'About us')
            ->where('pages.data.0.locales.0', config('app.locale'))
            ->where('pages.data.0.public_url', '/'.config('app.locale').'/about')
            ->where('pages.data.0.can.delete', true));
});

test('the list page can be sorted by title in the default locale', function (): void {
    PageFixtures::create([], ['slug' => 'zeta', 'path' => 'zeta', 'title' => 'Zeta']);
    PageFixtures::create([], ['slug' => 'alpha', 'path' => 'alpha', 'title' => 'Alpha']);

    $this->actingAs(pageAdmin())
        ->get(route('pages.index', ['sort' => 'title']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('pages.data.0.title', 'Alpha')
            ->where('pages.data.1.title', 'Zeta'));
});

test('the edit page gets every locale, blank where the page has no translation, and the parent options', function (): void {
    $page = PageFixtures::create([], ['slug' => 'about', 'path' => 'about']);
    $other = PageFixtures::create([], ['slug' => 'news', 'path' => 'news']);

    $this->actingAs(pageAdmin())
        ->get(route('pages.edit', $page))
        ->assertInertia(fn (Assert $inertia) => $inertia
            ->component('pages/edit')
            ->where('model.translations.'.config('app.locale').'.slug', 'about')
            ->where('model.translations.az.slug', '')
            ->has('parents', 1)
            ->where('parents.0.id', $other->id));
});

test('the body is sanitised before it is stored', function (): void {
    $payload = pagePayload([], [config('app.locale') => ['title' => 'Safe', 'slug' => 'safe', 'body' => '<p>Hi</p><script>alert(1)</script>']]);

    $this->actingAs(pageAdmin())
        ->post(route('pages.store'), $payload)
        ->assertSessionHasNoErrors();

    $body = PageTranslation::query()->where('slug', 'safe')->value('body');

    expect($body)->toContain('<p>Hi</p>')
        ->and($body)->not->toContain('script');
});

test('a new homepage takes the root path and the old homepage keeps its slug path', function (): void {
    $old = PageFixtures::create(['is_homepage' => true], ['slug' => 'home', 'path' => '/']);
    $child = PageFixtures::create(['parent_id' => $old->id], ['slug' => 'contact', 'path' => 'contact']);
    $new = PageFixtures::create([], ['slug' => 'landing', 'path' => 'landing']);

    $this->actingAs(pageAdmin())
        ->post(route('pages.homepage', $new))
        ->assertSessionHasNoErrors();

    expect(PageTranslation::query()->where('page_id', $old->id)->value('path'))->toBe('home')
        ->and(PageTranslation::query()->where('page_id', $new->id)->value('path'))->toBe('/')
        ->and(PageTranslation::query()->where('page_id', $child->id)->value('path'))->toBe('home/contact');
});

test('the homepage assignment is rejected with a validation error when the old slug is taken', function (): void {
    $old = PageFixtures::create(['is_homepage' => true], ['slug' => 'home', 'path' => '/']);
    PageFixtures::create([], ['slug' => 'home-2', 'path' => 'home-2']);
    PageTranslation::query()->where('page_id', $old->id)->update(['slug' => 'home-2']);
    $new = PageFixtures::create([], ['slug' => 'landing', 'path' => 'landing']);

    $this->actingAs(pageAdmin())
        ->post(route('pages.homepage', $new))
        ->assertSessionHasErrors('is_homepage');

    expect($old->refresh()->is_homepage)->toBeTrue();
});

test('a blank locale is skipped even when its body is empty', function (): void {
    $this->actingAs(pageAdmin())
        ->post(route('pages.store'), pagePayload([], [
            'ru' => ['body' => ''],
        ]))
        ->assertSessionHasNoErrors();

    expect(PageTranslation::query()->where('locale', 'ru')->exists())->toBeFalse();
});

test('the list page passes the sort state back so the header can toggle the direction', function (): void {
    $this->actingAs(pageAdmin())
        ->get(route('pages.index', ['sort' => 'title', 'direction' => 'desc']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.sort', 'title')
            ->where('filters.direction', 'desc'));
});

test('the list page gives each locale its name and flag country', function (): void {
    PageFixtures::create([], ['slug' => 'about', 'path' => 'about']);

    $this->actingAs(pageAdmin())
        ->get(route('pages.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('locales.0.code', 'az')
            ->where('locales.0.country', 'AZ')
            ->where('locales.1.code', 'en')
            ->where('locales.1.country', 'GB'));
});
