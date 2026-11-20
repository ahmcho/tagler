<?php

namespace App\Modules\Settings\Enums;

use App\Modules\Settings\Rules\FileUploadRule;

enum SettingKeyEnum: string
{
    case AppName = 'app_name';
    case Favicon = 'favicon';

    /**
     * How this setting's stored value should be cast and validated.
     */
    public function type(): InputValueTypeEnum
    {
        return match ($this) {
            self::AppName => InputValueTypeEnum::String,
            self::Favicon => InputValueTypeEnum::File,
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
        return match ($this->type()) {
            InputValueTypeEnum::String => ['required', 'string', 'max:255'],
            InputValueTypeEnum::File => ['nullable', 'file', new FileUploadRule([AllowedMimeTypes::Png]), 'max:1024'],
            default => ['nullable'],
        };
    }
}
