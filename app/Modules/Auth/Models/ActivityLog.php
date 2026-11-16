<?php

namespace App\Modules\Auth\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Collection;
use MongoDB\Laravel\Eloquent\DocumentModel;
use Spatie\Activitylog\Models\Activity;

/**
 * Activity log entry stored in MongoDB. Spatie's Activity extends the SQL
 * Eloquent Model, so the MongoDB document trait is added on top of it.
 *
 * @property string|null $ip_address
 */
class ActivityLog extends Activity
{
    use DocumentModel;

    /**
     * @var string
     */
    protected $connection = 'mongodb';

    /**
     * Stored as a native MongoDB object, read back as a collection.
     */
    protected function properties(): Attribute
    {
        return Attribute::make(
            get: fn (mixed $value): Collection => collect(is_string($value) ? json_decode($value, true) : $value),
            set: fn (mixed $value): array => ['properties' => $value instanceof Collection ? $value->all() : (array) $value],
        );
    }

    protected static function booted(): void
    {
        static::creating(function (self $log): void {
            $log->ip_address ??= request()->ip();
        });
    }
}
