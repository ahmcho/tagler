<?php

namespace App\Modules\Pages\Enums;

/**
 * The locales pages can be written in. `config/app.php` builds `supported_locales` from these cases.
 * The default locale is `app.locale`, used for the root URL `/`.
 */
enum LocaleEnum: string
{
    case Az = 'az';
    case En = 'en';
    case Ru = 'ru';

    /**
     * @return list<string>
     */
    public static function codes(): array
    {
        return array_map(fn (self $locale): string => $locale->value, self::cases());
    }

    public static function default(): string
    {
        return (string) config('app.locale');
    }

    public static function isSupported(string $locale): bool
    {
        return self::tryFrom($locale) !== null;
    }

    /**
     * The name of the language, written in that language.
     */
    public function label(): string
    {
        return match ($this) {
            self::Az => 'Azərbaycan dili',
            self::En => 'English',
            self::Ru => 'Русский',
        };
    }
}
