<?php

namespace App\Modules\Settings\Enums;

use App\Modules\Settings\Support\LocalDateFormatter;

/**
 * The datetime formats an admin can choose. The value is the PHP date() format string.
 */
enum DateTimeFormatVariantEnum: string
{
    case DayMonthYearDotTimeWithSeconds = 'd.m.Y H:i:s';
    case DayMonthYearDotTime = 'd.m.Y H:i';
    case YearMonthDayDashTimeWithSeconds = 'Y-m-d H:i:s';
    case DayMonthYearSlashTime = 'd/m/Y H:i';

    /**
     * The label is the current datetime in the application timezone, rendered in this format, so every option shows the same datetime.
     */
    public function label(): string
    {
        return LocalDateFormatter::now()->format($this->value);
    }
}
