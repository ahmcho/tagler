<?php

namespace App\Modules\Translation\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $lang
 * @property string $group
 * @property string|null $table
 * @property string $key
 * @property string|null $value
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
#[Fillable(['lang', 'group', 'table', 'key', 'value'])]
class Translation extends Model
{
    /**
     * The table-name candidate of a key: its first segment, for the
     * `translations` group only (`owners.title` -> `owners`). Whether it is
     * an actual table is checked by TranslationRepository::findTableFor().
     */
    public static function tableFromKey(string $group, string $key): ?string
    {
        if ($group !== 'translations' || ! str_contains($key, '.')) {
            return null;
        }

        return Str::before($key, '.');
    }
}
