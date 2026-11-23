<?php

namespace App\Modules\Settings\Enums;

use Carbon\CarbonImmutable;

/**
 * The time formats an admin can choose. The value is the PHP date() format string.
 */
enum TimeFormatVariantEnum: string
{
    case TwelveHour = 'h:i A';
    case TwentyFourHour = 'H:i';

    /**
     * The label is a fixed sample time rendered in this format, so every option shows the same time.
     */
    public function label(): string
    {
        return CarbonImmutable::parse('2026-11-20 13:45:30')->format($this->value);
    }

    /**
     * The hour cycle the time picker uses for this format.
     */
    public function hourCycle(): int
    {
        return match ($this) {
            self::TwelveHour => 12,
            self::TwentyFourHour => 24,
        };
    }
}
