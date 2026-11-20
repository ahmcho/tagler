<?php

namespace App\Modules\Settings\Enums;

use Carbon\CarbonImmutable;

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
     * The label is a fixed sample datetime rendered in this format, so every option shows the same datetime.
     */
    public function label(): string
    {
        return CarbonImmutable::create(2026, 11, 20, 13, 45, 30)->format($this->value);
    }
}
