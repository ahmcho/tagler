<?php

namespace App\Modules\Settings\Support;

use App\Modules\Settings\Enums\SettingKeyEnum;
use DateTimeInterface;

class LocalDateFormatter
{
    /**
     * Formats a date with the date format chosen in the application settings.
     */
    public static function date(DateTimeInterface $date): string
    {
        return $date->format(setting()->string(SettingKeyEnum::DateFormat));
    }

    /**
     * Formats a datetime with the datetime format chosen in the application settings.
     */
    public static function dateTime(DateTimeInterface $date): string
    {
        return $date->format(setting()->string(SettingKeyEnum::DateTimeFormat));
    }
}
