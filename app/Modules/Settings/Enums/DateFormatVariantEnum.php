<?php

namespace App\Modules\Settings\Enums;

use Carbon\CarbonImmutable;

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
     * The label is a fixed sample date rendered in this format, so every option shows the same date.
     */
    public function label(): string
    {
        return CarbonImmutable::parse('2026-11-20 13:45:30')->format($this->value);
    }
}
