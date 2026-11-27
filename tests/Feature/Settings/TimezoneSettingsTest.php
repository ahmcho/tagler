<?php

use App\Models\User;
use App\Modules\Auth\Database\Seeders\RolesAndPermissionsSeeder;
use App\Modules\Pages\Enums\PageStatusEnum;
use App\Modules\Pages\Models\Page;
use App\Modules\Pages\Repositories\Contracts\PageRepositoryContract;
use App\Modules\Settings\Enums\DateTimeFormatVariantEnum;
use App\Modules\Settings\Enums\SettingKeyEnum;
use App\Modules\Settings\Services\Contracts\SettingServiceContract;
use App\Modules\Settings\Support\LocalDateFormatter;
use Carbon\CarbonImmutable;

beforeEach(function (): void {
    $this->seed(RolesAndPermissionsSeeder::class);

    $this->admin = User::factory()->create();
    $this->admin->assignRole('Admin');
});

test('the timezone setting offers every PHP timezone identifier', function (): void {
    $field = collect(app(SettingServiceContract::class)->fields())->firstWhere('key', 'timezone');

    expect(collect($field['options'])->pluck('value')->all())
        ->toBe(DateTimeZone::listIdentifiers());
});

test('a date is shown in the timezone chosen in the settings', function (): void {
    app(SettingServiceContract::class)->setMany([
        'timezone' => 'Asia/Baku',
        'datetime_format' => DateTimeFormatVariantEnum::DayMonthYearDotTimeWithSeconds->value,
    ]);

    expect(LocalDateFormatter::dateTime(CarbonImmutable::parse('2026-11-20 13:45:30', 'UTC')))
        ->toBe('20.11.2026 17:45:30');
});

test('the timezone is the configured application timezone when nothing is saved', function (): void {
    expect(LocalDateFormatter::timezone())->toBe(config('app.timezone'));
});

test('an Admin can save a timezone from the settings page', function (): void {
    $this->actingAs($this->admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->put(route('settings.update'), [
            'settings' => [
                'app_name' => 'Tagler',
                'date_format' => 'd.m.Y',
                'datetime_format' => 'd.m.Y H:i:s',
                'time_format' => 'h:i A',
                'timezone' => 'Asia/Baku',
                'media_link_ttl_minutes' => '15',
            ],
        ])
        ->assertSessionHasNoErrors();

    expect(app(SettingServiceContract::class)->string(SettingKeyEnum::Timezone))->toBe('Asia/Baku');
});

test('a timezone that PHP does not know is rejected', function (): void {
    $this->actingAs($this->admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->put(route('settings.update'), [
            'settings' => [
                'app_name' => 'Tagler',
                'date_format' => 'd.m.Y',
                'datetime_format' => 'd.m.Y H:i:s',
                'time_format' => 'h:i A',
                'timezone' => 'Mars/Olympus',
                'media_link_ttl_minutes' => '15',
            ],
        ])
        ->assertSessionHasErrors('settings.timezone');
});

test('a scheduled page is due at its wall-clock time in the chosen timezone', function (): void {
    app(SettingServiceContract::class)->setMany(['timezone' => 'Asia/Baku']);

    $page = Page::factory()->create([
        'status' => PageStatusEnum::Scheduled,
        'publish_date' => '2026-11-20',
        'publish_time' => '17:45',
    ]);

    $repository = app(PageRepositoryContract::class);

    // The same instants as LocalDateFormatter::now() gives: 13:44 UTC is 17:44 in Baku, one minute before the publish time.
    $beforePublish = CarbonImmutable::parse('2026-11-20 13:44:00', 'UTC')->setTimezone(LocalDateFormatter::timezone());
    $atPublish = CarbonImmutable::parse('2026-11-20 13:45:00', 'UTC')->setTimezone(LocalDateFormatter::timezone());

    expect($repository->dueScheduledPages($beforePublish)->pluck('id'))->not->toContain($page->id)
        ->and($repository->dueScheduledPages($atPublish)->pluck('id'))->toContain($page->id);
});
