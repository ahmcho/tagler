<?php

use App\Modules\Pages\Enums\PageStatus;
use App\Modules\Pages\Models\Page;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\Carbon;
use Tests\Support\PageFixtures;

test('a scheduled page whose publish time has passed becomes published', function (): void {
    $this->travelTo(Carbon::parse('2026-11-23 12:00:00'));

    $page = PageFixtures::create(['status' => PageStatus::Scheduled, 'published_at' => Carbon::parse('2026-11-23 11:00:00')]);

    $this->artisan('tagler:pages:publish-scheduled')->assertSuccessful();

    expect($page->fresh()->status)->toBe(PageStatus::Published);
});

test('a scheduled page with a future publish time stays scheduled', function (): void {
    $this->travelTo(Carbon::parse('2026-11-23 12:00:00'));

    $page = PageFixtures::create(['status' => PageStatus::Scheduled, 'published_at' => Carbon::parse('2026-11-23 13:00:00')]);

    $this->artisan('tagler:pages:publish-scheduled')->assertSuccessful();

    expect($page->fresh()->status)->toBe(PageStatus::Scheduled);
});

test('a draft with a past publish time stays a draft', function (): void {
    $this->travelTo(Carbon::parse('2026-11-23 12:00:00'));

    $page = PageFixtures::create(['status' => PageStatus::Draft, 'published_at' => Carbon::parse('2026-11-23 11:00:00')]);

    $this->artisan('tagler:pages:publish-scheduled')->assertSuccessful();

    expect($page->fresh()->status)->toBe(PageStatus::Draft);
});

test('a scheduled page with no publish time is published and gets one', function (): void {
    $this->travelTo(Carbon::parse('2026-11-23 12:00:00'));

    $page = PageFixtures::create(['status' => PageStatus::Scheduled, 'published_at' => null]);

    $this->artisan('tagler:pages:publish-scheduled')->assertSuccessful();

    $page->refresh();

    expect($page->status)->toBe(PageStatus::Published)
        ->and($page->published_at)->not->toBeNull();
});

test('the command reports how many pages it published', function (): void {
    $this->travelTo(Carbon::parse('2026-11-23 12:00:00'));

    PageFixtures::create(['status' => PageStatus::Scheduled, 'published_at' => Carbon::parse('2026-11-23 11:00:00')]);
    PageFixtures::create(['status' => PageStatus::Scheduled, 'published_at' => Carbon::parse('2026-11-23 11:30:00')]);
    PageFixtures::create(['status' => PageStatus::Scheduled, 'published_at' => Carbon::parse('2026-11-23 13:00:00')]);

    $this->artisan('tagler:pages:publish-scheduled')
        ->expectsOutputToContain('Published 2 scheduled page(s).')
        ->assertSuccessful();

    expect(Page::query()->where('status', PageStatus::Scheduled)->count())->toBe(1);
});

test('the publish command runs every minute without overlapping', function (): void {
    $events = collect(app(Schedule::class)->events())
        ->filter(fn ($event): bool => str_contains((string) $event->command, 'tagler:pages:publish-scheduled'));

    expect($events)->toHaveCount(1);

    $event = $events->first();

    expect($event->expression)->toBe('* * * * *')
        ->and($event->withoutOverlapping)->toBeTrue();
});
