<?php

use App\Models\User;
use App\Modules\Auth\Database\Seeders\RolesAndPermissionsSeeder;
use App\Modules\Pages\Enums\LocaleEnum;
use App\Modules\Pages\Enums\PageStatus;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Support\PageFixtures;

beforeEach(function (): void {
    (new RolesAndPermissionsSeeder)->run();
});

function filterAdmin(): User
{
    $user = User::factory()->create();
    $user->assignRole('Admin');

    return $user;
}

test('the status filter keeps only pages with that status', function (): void {
    PageFixtures::create(['status' => PageStatus::Draft, 'publish_date' => null, 'publish_time' => null], ['slug' => 'draft-page', 'path' => 'draft-page', 'title' => 'Draft page']);
    PageFixtures::create(['status' => PageStatus::Published], ['slug' => 'live-page', 'path' => 'live-page', 'title' => 'Live page']);

    $this->actingAs(filterAdmin())
        ->get(route('pages.index', ['status' => 'draft']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('pages.total', 1)
            ->where('pages.data.0.title', 'Draft page')
            ->where('filters.status', 'draft'));
});

test('the live filter matches pages that visitors can see, and its opposite matches the rest', function (): void {
    PageFixtures::create(['status' => PageStatus::Published], ['slug' => 'live-page', 'path' => 'live-page', 'title' => 'Live page']);
    PageFixtures::create(['status' => PageStatus::Scheduled, 'publish_date' => now()->addDay()->toDateString(), 'publish_time' => '09:00'], ['slug' => 'later', 'path' => 'later', 'title' => 'Later']);
    PageFixtures::create(['status' => PageStatus::Draft, 'publish_date' => null, 'publish_time' => null], ['slug' => 'draft-page', 'path' => 'draft-page', 'title' => 'Draft page']);

    $this->actingAs(filterAdmin())
        ->get(route('pages.index', ['live' => '1']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('pages.total', 1)
            ->where('pages.data.0.title', 'Live page'));

    $this->actingAs(filterAdmin())
        ->get(route('pages.index', ['live' => '0']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('pages.total', 2)
            ->has('pages.data', 2));
});

test('an empty live value does not filter the list', function (): void {
    PageFixtures::create(['status' => PageStatus::Published], ['slug' => 'live-page', 'path' => 'live-page', 'title' => 'Live page']);
    PageFixtures::create(['status' => PageStatus::Draft, 'publish_date' => null, 'publish_time' => null], ['slug' => 'draft-page', 'path' => 'draft-page', 'title' => 'Draft page']);

    $this->actingAs(filterAdmin())
        ->get(route('pages.index', ['live' => '']))
        ->assertInertia(fn (Assert $page) => $page->where('pages.total', 2));
});

test('the homepage filter separates the homepage from the other pages', function (): void {
    PageFixtures::create(['status' => PageStatus::Published, 'is_homepage' => true], ['slug' => 'home', 'path' => '/', 'title' => 'Home']);
    PageFixtures::create(['status' => PageStatus::Published], ['slug' => 'about', 'path' => 'about', 'title' => 'About']);

    $this->actingAs(filterAdmin())
        ->get(route('pages.index', ['homepage' => '1']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('pages.total', 1)
            ->where('pages.data.0.title', 'Home'));

    $this->actingAs(filterAdmin())
        ->get(route('pages.index', ['homepage' => '0']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('pages.total', 1)
            ->where('pages.data.0.title', 'About'));
});

test('the publish date range is inclusive and drops pages without a publish date', function (): void {
    PageFixtures::create(['publish_date' => '2026-01-01'], ['slug' => 'early', 'path' => 'early', 'title' => 'Early']);
    PageFixtures::create(['publish_date' => '2026-01-10'], ['slug' => 'middle', 'path' => 'middle', 'title' => 'Middle']);
    PageFixtures::create(['status' => PageStatus::Draft, 'publish_date' => null, 'publish_time' => null], ['slug' => 'undated', 'path' => 'undated', 'title' => 'Undated']);

    $this->actingAs(filterAdmin())
        ->get(route('pages.index', ['publish_date' => '2026-01-05,2026-01-10']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('pages.total', 1)
            ->where('pages.data.0.title', 'Middle'));

    $this->actingAs(filterAdmin())
        ->get(route('pages.index', ['publish_date' => '2026-01-01,2026-01-01']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('pages.total', 1)
            ->where('pages.data.0.title', 'Early'));
});

test('a publish date range with a bad format or reversed bounds is rejected', function (string $range): void {
    PageFixtures::create(['publish_date' => '2026-01-01'], ['slug' => 'early', 'path' => 'early', 'title' => 'Early']);

    $this->actingAs(filterAdmin())
        ->get(route('pages.index', ['publish_date' => $range]))
        ->assertSessionHasErrors('publish_date');
})->with([
    'single date' => ['2026-01-05'],
    'reversed bounds' => ['2026-01-10,2026-01-05'],
    'impossible date' => ['2026-02-30,2026-03-01'],
    'not a date' => ['abc,def'],
]);

test('the title filter ignores case and searches the default locale only', function (): void {
    PageFixtures::create([], ['slug' => 'about', 'path' => 'about', 'title' => 'About Us']);
    PageFixtures::create([], ['slug' => 'contact', 'path' => 'contact', 'title' => 'Contact']);

    $otherLocale = collect(LocaleEnum::codes())->first(fn (string $code): bool => $code !== LocaleEnum::default());
    PageFixtures::create([], ['locale' => $otherLocale, 'slug' => 'hidden', 'path' => 'hidden', 'title' => 'Secret title']);

    $this->actingAs(filterAdmin())
        ->get(route('pages.index', ['title' => 'about us']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('pages.total', 1)
            ->where('pages.data.0.title', 'About Us'));

    $this->actingAs(filterAdmin())
        ->get(route('pages.index', ['title' => 'Secret']))
        ->assertInertia(fn (Assert $page) => $page->where('pages.total', 0));
});

test('the subtitle and slug filters match part of the value', function (): void {
    PageFixtures::create([], ['slug' => 'about-team', 'path' => 'about-team', 'title' => 'Team', 'subtitle' => 'Meet our people']);
    PageFixtures::create([], ['slug' => 'contact', 'path' => 'contact', 'title' => 'Contact', 'subtitle' => 'Write to us']);

    $this->actingAs(filterAdmin())
        ->get(route('pages.index', ['subtitle' => 'people']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('pages.total', 1)
            ->where('pages.data.0.title', 'Team'));

    $this->actingAs(filterAdmin())
        ->get(route('pages.index', ['slug' => 'contact']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('pages.total', 1)
            ->where('pages.data.0.title', 'Contact'));
});

test('the path filter ignores a leading slash', function (): void {
    PageFixtures::create([], ['slug' => 'services', 'path' => 'services', 'title' => 'Services']);
    PageFixtures::create([], ['slug' => 'about', 'path' => 'about', 'title' => 'About']);

    $this->actingAs(filterAdmin())
        ->get(route('pages.index', ['path' => '/services']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('pages.total', 1)
            ->where('pages.data.0.title', 'Services'));
});

test('an unknown status is rejected by validation', function (): void {
    $this->actingAs(filterAdmin())
        ->get(route('pages.index', ['status' => 'archived']))
        ->assertSessionHasErrors('status');
});
