<?php

namespace App\Modules\Auth\Concerns;

use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

/**
 * Logs created, updated and deleted events with only the changed fillable attributes.
 */
trait HasActivityLogs
{
    use LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logExcept(['password', 'remember_token'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}
