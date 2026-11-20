<?php

namespace App\Modules\Settings\Concerns;

use App\Modules\Settings\Support\LocalDateFormatter;
use DateTimeInterface;

trait HasLocalDates
{
    /**
     * Only array and JSON output uses this method. Stored values are not changed.
     */
    protected function serializeDate(DateTimeInterface $date): string
    {
        return LocalDateFormatter::dateTime($date);
    }
}
