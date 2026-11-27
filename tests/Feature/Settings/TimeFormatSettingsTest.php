<?php

use App\Models\User;
use App\Modules\Auth\Database\Seeders\RolesAndPermissionsSeeder;
use App\Modules\Settings\Enums\SettingKeyEnum;
use App\Modules\Settings\Enums\TimeFormatVariantEnum;
use App\Modules\Settings\Services\Contracts\SettingServiceContract;

beforeEach(function (): void {
    $this->seed(RolesAndPermissionsSeeder::class);

    $this->admin = User::factory()->create();
    $this->admin->assignRole('Admin');
});

test('the time format setting offers one select option per enum case', function (): void {
    $field = collect(app(SettingServiceContract::class)->fields())->keyBy('key')['time_format'];

    expect($field['options'])->toHaveCount(count(TimeFormatVariantEnum::cases()))
        ->and(collect($field['options'])->pluck('value')->all())
        ->toBe(array_map(fn (TimeFormatVariantEnum $case) => $case->value, TimeFormatVariantEnum::cases()));
});

test('a time format option label is a fixed sample time in that format', function (): void {
    expect(TimeFormatVariantEnum::TwelveHour->label())->toBe('01:45 PM')
        ->and(TimeFormatVariantEnum::TwentyFourHour->label())->toBe('13:45');
});

test('a time format maps to its hour cycle', function (): void {
    expect(TimeFormatVariantEnum::TwelveHour->hourCycle())->toBe(12)
        ->and(TimeFormatVariantEnum::TwentyFourHour->hourCycle())->toBe(24);
});

test('the default time format is the 12-hour cycle when nothing is saved', function (): void {
    expect(app(SettingServiceContract::class)->string(SettingKeyEnum::TimeFormat))->toBe('h:i A');
});

test('an Admin can save the 24-hour time format', function (): void {
    $this->actingAs($this->admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->put(route('settings.update'), [
            'settings' => [
                'app_name' => 'Tagler',
                'date_format' => 'd.m.Y',
                'datetime_format' => 'd.m.Y H:i:s',
                'time_format' => TimeFormatVariantEnum::TwentyFourHour->value,
                'timezone' => config('app.timezone'),
                'media_link_ttl_minutes' => '15',
            ],
        ])
        ->assertSessionHasNoErrors();

    expect(app(SettingServiceContract::class)->string(SettingKeyEnum::TimeFormat))->toBe('H:i');
});

test('a time format outside the enum list is rejected', function (): void {
    $this->actingAs($this->admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->put(route('settings.update'), [
            'settings' => [
                'app_name' => 'Tagler',
                'date_format' => 'd.m.Y',
                'datetime_format' => 'd.m.Y H:i:s',
                'time_format' => 'Y.m.d',
                'media_link_ttl_minutes' => '15',
            ],
        ])
        ->assertSessionHasErrors('settings.time_format');
});

test('the shared hour cycle is 12 by default and follows the saved time format', function (): void {
    expect($this->get(route('login'))->viewData('page')['props']['timeHourCycle'])->toBe(12);

    app(SettingServiceContract::class)->setMany([
        'time_format' => TimeFormatVariantEnum::TwentyFourHour->value,
    ]);

    expect($this->get(route('login'))->viewData('page')['props']['timeHourCycle'])->toBe(24);
});
