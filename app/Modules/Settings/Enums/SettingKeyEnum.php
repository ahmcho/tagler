<?php

namespace App\Modules\Settings\Enums;

use App\Modules\Settings\Rules\FileUploadRule;
use Illuminate\Validation\Rule;

enum SettingKeyEnum: string
{
    case AppName = 'app_name';
    case Favicon = 'favicon';
    case DateFormat = 'date_format';
    case DateTimeFormat = 'datetime_format';
    case TimeFormat = 'time_format';
    case MediaLinkTtlMinutes = 'media_link_ttl_minutes';

    /**
     * How this setting's stored value should be cast and validated.
     */
    public function type(): InputValueTypeEnum
    {
        return match ($this) {
            self::AppName => InputValueTypeEnum::String,
            self::Favicon => InputValueTypeEnum::File,
            self::DateFormat, self::DateTimeFormat, self::TimeFormat => InputValueTypeEnum::String,
            self::MediaLinkTtlMinutes => InputValueTypeEnum::Integer,
        };
    }

    /**
     * Which control edits this setting.
     */
    public function input(): SettingInputEnum
    {
        return match ($this) {
            self::AppName => SettingInputEnum::Text,
            self::Favicon => SettingInputEnum::File,
            self::DateFormat, self::DateTimeFormat, self::TimeFormat => SettingInputEnum::Select,
            self::MediaLinkTtlMinutes => SettingInputEnum::Number,
        };
    }

    /**
     * The tab this setting is shown under on the application settings page.
     */
    public function tab(): string
    {
        return match ($this) {
            self::AppName => 'general',
            self::Favicon => 'general',
            self::DateFormat, self::DateTimeFormat, self::TimeFormat => 'general',
            self::MediaLinkTtlMinutes => 'security',
        };
    }

    /**
     * The lucide-react icon name of the tab this setting belongs to. Keys in one tab share the same icon.
     */
    public function tabIcon(): string
    {
        return match ($this) {
            self::AppName => 'settings',
            self::Favicon => 'settings',
            self::DateFormat, self::DateTimeFormat, self::TimeFormat => 'settings',
            self::MediaLinkTtlMinutes => 'shield-check',
        };
    }

    /**
     * The value used when nothing is stored. A leading "/" means a public asset path, not a file on the public disk.
     */
    public function defaultValue(): ?string
    {
        return match ($this) {
            self::AppName => config('app.name'),
            self::Favicon => '/favicon.ico',
            self::DateFormat => DateFormatVariantEnum::DayMonthYearDot->value,
            self::DateTimeFormat => DateTimeFormatVariantEnum::DayMonthYearDotTimeWithSeconds->value,
            self::TimeFormat => TimeFormatVariantEnum::TwelveHour->value,
            self::MediaLinkTtlMinutes => '15',
        };
    }

    /**
     * The choices of a Select input, as value and label pairs. Empty for keys that are not selects.
     *
     * @return array<int, array{value: string, label: string}>
     */
    public function options(): array
    {
        return match ($this) {
            self::DateFormat => $this->optionsFrom(DateFormatVariantEnum::cases()),
            self::DateTimeFormat => $this->optionsFrom(DateTimeFormatVariantEnum::cases()),
            self::TimeFormat => $this->optionsFrom(TimeFormatVariantEnum::cases()),
            default => [],
        };
    }

    /**
     * Translation keys follow the key name by convention.
     */
    public function label(): string
    {
        return __("translations.settings.{$this->value}");
    }

    public function description(): string
    {
        return __("translations.settings.{$this->value}_description");
    }

    /**
     * A File input is never required: an empty input keeps the current file.
     */
    public function isRequired(): bool
    {
        return $this->type() !== InputValueTypeEnum::File;
    }

    /**
     * Validation rules for this key, derived from its type so the request needs no per-key arm.
     *
     * @return array<int, mixed>
     */
    public function rules(): array
    {
        if ($this->input() === SettingInputEnum::Select) {
            return ['required', Rule::in(array_column($this->options(), 'value'))];
        }

        return match ($this->type()) {
            InputValueTypeEnum::String => ['required', 'string', 'max:255'],
            InputValueTypeEnum::File => ['nullable', 'file', new FileUploadRule([AllowedMimeTypesEnum::Png]), 'max:1024'],
            InputValueTypeEnum::Integer => ['required', 'integer', 'min:1'],
            default => ['nullable'],
        };
    }

    /**
     * @param  array<int, DateFormatVariantEnum|DateTimeFormatVariantEnum|TimeFormatVariantEnum>  $cases
     * @return array<int, array{value: string, label: string}>
     */
    private function optionsFrom(array $cases): array
    {
        return array_map(
            fn (DateFormatVariantEnum|DateTimeFormatVariantEnum|TimeFormatVariantEnum $case): array => [
                'value' => $case->value,
                'label' => $case->label(),
            ],
            $cases,
        );
    }
}
