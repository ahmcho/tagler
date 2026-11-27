<?php

namespace App\Modules\Settings\Enums;

use App\Modules\Settings\Support\LocalDateFormatter;

/**
 * The date formats an admin can choose. The value is the PHP date() format string.
 */
enum DateFormatVariantEnum: string
{
    case DayMonthYearDot = 'd.m.Y';
    case YearMonthDayDash = 'Y-m-d';
    case DayMonthYearSlash = 'd/m/Y';
    case MonthDayYearSlash = 'm/d/Y';

    /**
     * The label is the current date in the application timezone, rendered in this format, so every option shows the same date.
     */
    public function label(): string
    {
        return LocalDateFormatter::now()->format($this->value);
    }
}
