<?php

use App\Models\User;
use App\Modules\Auth\Database\Seeders\RolesAndPermissionsSeeder;
use App\Modules\Auth\Models\Role;
use App\Modules\Settings\Enums\DateFormatVariantEnum;
use App\Modules\Settings\Enums\DateTimeFormatVariantEnum;
use App\Modules\Settings\Enums\SettingKeyEnum;
use App\Modules\Settings\Enums\TimeFormatVariantEnum;
use App\Modules\Settings\Services\Contracts\SettingServiceContract;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;

beforeEach(function (): void {
    $this->seed(RolesAndPermissionsSeeder::class);

    $this->admin = User::factory()->create();
    $this->admin->assignRole('Admin');
});

test('date and datetime format settings offer one select option per enum case', function (): void {
    $fields = collect(app(SettingServiceContract::class)->fields())->keyBy('key');

    expect($fields['date_format']['options'])->toHaveCount(count(DateFormatVariantEnum::cases()))
        ->and($fields['datetime_format']['options'])->toHaveCount(count(DateTimeFormatVariantEnum::cases()))
        ->and(collect($fields['date_format']['options'])->pluck('value')->all())
        ->toBe(array_map(fn (DateFormatVariantEnum $case) => $case->value, DateFormatVariantEnum::cases()));
});

test('an enum option label is the current date in that format', function (): void {
    $this->travelTo(CarbonImmutable::parse('2026-11-20 13:45:30'));

    expect(DateFormatVariantEnum::DayMonthYearDot->label())->toBe('20.11.2026')
        ->and(DateFormatVariantEnum::MonthDayYearSlash->label())->toBe('11/20/2026')
        ->and(DateTimeFormatVariantEnum::DayMonthYearDotTimeWithSeconds->label())->toBe('20.11.2026 13:45:30')
        ->and(DateTimeFormatVariantEnum::DayMonthYearSlashTime->label())->toBe('20/11/2026 13:45');
});

test('an Admin can save a date and datetime format from the list', function (): void {
    $this->actingAs($this->admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->put(route('settings.update'), [
            'settings' => [
                'app_name' => 'Tagler',
                'date_format' => DateFormatVariantEnum::YearMonthDayDash->value,
                'datetime_format' => DateTimeFormatVariantEnum::DayMonthYearSlashTime->value,
                'time_format' => TimeFormatVariantEnum::TwelveHour->value,
                'timezone' => config('app.timezone'),
                'media_link_ttl_minutes' => '15',
            ],
        ])
        ->assertSessionHasNoErrors();

    expect(app(SettingServiceContract::class)->string(SettingKeyEnum::DateFormat))->toBe('Y-m-d')
        ->and(app(SettingServiceContract::class)->string(SettingKeyEnum::DateTimeFormat))->toBe('d/m/Y H:i');
});

test('a format outside the enum list is rejected', function (string $key): void {
    $this->actingAs($this->admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->put(route('settings.update'), [
            'settings' => [
                'app_name' => 'Tagler',
                'date_format' => 'd.m.Y',
                'datetime_format' => 'd.m.Y H:i:s',
                'time_format' => 'h:i A',
                $key => 'Y.m.d',
            ],
        ])
        ->assertSessionHasErrors("settings.{$key}");
})->with(['date_format', 'datetime_format']);

test('a user shows created_at in the configured datetime format', function (): void {
    $user = User::factory()->create(['created_at' => '2026-11-20 13:45:30']);

    app(SettingServiceContract::class)->setMany([
        'date_format' => DateFormatVariantEnum::YearMonthDayDash->value,
        'datetime_format' => DateTimeFormatVariantEnum::DayMonthYearSlashTime->value,
    ]);

    expect($user->toArray()['created_at'])->toBe('20/11/2026 13:45');
});

test('the default datetime format is used when no format is saved', function (): void {
    $user = User::factory()->create(['created_at' => '2026-11-20 13:45:30']);

    expect($user->toArray()['created_at'])->toBe('20.11.2026 13:45:30');
});

test('changing the format does not change the stored value or the model attribute type', function (): void {
    $user = User::factory()->create(['created_at' => '2026-11-20 13:45:30']);
    $storedBefore = DB::table('users')->where('id', $user->id)->value('created_at');

    app(SettingServiceContract::class)->setMany([
        'datetime_format' => DateTimeFormatVariantEnum::YearMonthDayDashTimeWithSeconds->value,
    ]);
    $user->refresh()->toArray();

    expect(DB::table('users')->where('id', $user->id)->value('created_at'))->toBe($storedBefore)
        ->and($user->created_at)->toBeInstanceOf(CarbonInterface::class);
});

test('a role shows created_at in the configured datetime format', function (): void {
    $role = Role::create(['name' => 'Reviewer', 'guard_name' => 'web']);
    DB::table('roles')->where('id', $role->id)->update(['created_at' => '2026-11-20 13:45:30']);
    $role->refresh();

    app(SettingServiceContract::class)->setMany([
        'datetime_format' => DateTimeFormatVariantEnum::DayMonthYearDotTime->value,
    ]);

    expect($role->toArray()['created_at'])->toBe('20.11.2026 13:45');
});
