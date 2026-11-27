<?php

namespace App\Modules\Settings\Support;

use App\Modules\Settings\Enums\SettingKeyEnum;
use Carbon\CarbonImmutable;
use DateTimeInterface;

class LocalDateFormatter
{
    /**
     * Formats a date in the application timezone with the date format chosen in the settings.
     */
    public static function date(DateTimeInterface $date): string
    {
        return self::inTimezone($date)->format(setting()->string(SettingKeyEnum::DateFormat));
    }

    /**
     * Formats a datetime in the application timezone with the datetime format chosen in the settings.
     */
    public static function dateTime(DateTimeInterface $date): string
    {
        return self::inTimezone($date)->format(setting()->string(SettingKeyEnum::DateTimeFormat));
    }

    /**
     * The current moment in the application timezone. Use it wherever a wall-clock time is compared with a stored publish date and time.
     */
    public static function now(): CarbonImmutable
    {
        return CarbonImmutable::now(self::timezone());
    }

    /**
     * The timezone chosen in the settings, for example `Asia/Baku`.
     */
    public static function timezone(): string
    {
        return setting()->string(SettingKeyEnum::Timezone);
    }

    private static function inTimezone(DateTimeInterface $date): CarbonImmutable
    {
        return CarbonImmutable::instance($date)->setTimezone(self::timezone());
    }
}
