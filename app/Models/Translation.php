<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

/**
 * @property int $id
 * @property string $key
 * @property string $locale
 * @property string $translation
 * @property string|null $group
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read string $value
 *
 * @method static Builder<static>|Translation forKeyAndLocale(string $key, string $locale)
 * @method static Builder<static>|Translation inGroup(string $group)
 * @method static Builder<static>|Translation newModelQuery()
 * @method static Builder<static>|Translation newQuery()
 * @method static Builder<static>|Translation query()
 * @method static Builder<static>|Translation whereCreatedAt($value)
 * @method static Builder<static>|Translation whereGroup($value)
 * @method static Builder<static>|Translation whereId($value)
 * @method static Builder<static>|Translation whereKey($value)
 * @method static Builder<static>|Translation whereLocale($value)
 * @method static Builder<static>|Translation whereTranslation($value)
 * @method static Builder<static>|Translation whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
#[Table(name: 'translations')]
#[Fillable(['key', 'locale', 'translation', 'group'])]
class Translation extends Model
{
    protected static function booted(): void
    {
        static::saved(function ($translation) {
            $translation->clearCacheForLocale();
            app('translator')?->clearCacheForLocale($translation->locale);
        });

        static::deleted(function ($translation) {
            $translation->clearCacheForLocale();
            app('translator')?->clearCacheForLocale($translation->locale);
        });
    }

    public function scopeForKeyAndLocale(Builder $query, string $key, string $locale): Builder
    {
        return $query->where('key', $key)->where('locale', $locale);
    }

    public function scopeInGroup(Builder $query, string $group): Builder
    {
        return $query->where('group', $group);
    }

    public function getValueAttribute(): string
    {
        return $this->translation;
    }

    public function clearCacheForLocale(): void
    {
        foreach ($this->cacheKeys() as $key) {
            Cache::forget($key);
        }
    }

    /**
     * Get all cache keys for this translation.
     *
     * @return array<int, string>
     */
    private function cacheKeys(): array
    {
        $keys = ["translations.json.{$this->locale}"];

        if ($this->group) {
            $keys[] = "translations.{$this->group}.{$this->locale}";
        }

        return $keys;
    }
}
