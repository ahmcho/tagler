<?php

namespace App\Modules\Pages\Models;

use App\Modules\Auth\Concerns\HasActivityLogs;
use App\Modules\Pages\Database\Factories\PageFactory;
use App\Modules\Pages\Enums\PageStatus;
use App\Modules\Pages\Observers\PageObserver;
use App\Modules\Settings\Concerns\HasLocalDates;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * Locale-independent page data. Titles, slugs, paths and content live in
 * PageTranslation, one row per locale.
 *
 * @property int $id
 * @property int|null $parent_id
 * @property PageStatus $status
 * @property bool $is_homepage
 * @property string|null $layout
 * @property bool $theme_layout Whether the active theme's template shows this page
 * @property CarbonInterface|null $publish_date
 * @property string|null $publish_time Time of day as `HH:MM`
 * @property CarbonInterface|null $created_at
 * @property CarbonInterface|null $updated_at
 * @property-read Collection<int, PageTranslation> $translations
 */
#[Table(name: 'pages')]
#[UseFactory(PageFactory::class)]
#[Fillable(['parent_id', 'status', 'layout', 'theme_layout', 'publish_date', 'publish_time'])]
#[ObservedBy([PageObserver::class])]
class Page extends Model
{
    /** @use HasFactory<PageFactory> */
    use HasActivityLogs, HasFactory, HasLocalDates;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => PageStatus::class,
            'is_homepage' => 'boolean',
            'theme_layout' => 'boolean',
            'publish_date' => 'date',
        ];
    }

    /**
     * The time is stored as `HH:MM:SS`. The form and the snapshots use `HH:MM`.
     *
     * @return Attribute<string|null, string|null>
     */
    protected function publishTime(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value): ?string => $value === null ? null : substr($value, 0, 5),
        );
    }

    /**
     * The moment the page goes live, from its date and time. Null when the page
     * has no publish date, which means it is live as soon as its status allows.
     */
    public function publishAt(): ?CarbonInterface
    {
        if ($this->publish_date === null) {
            return null;
        }

        return Carbon::parse($this->publish_date->toDateString().' '.($this->publish_time ?? '00:00'));
    }

    /**
     * Whether visitors may see the page at the given moment. Pure check, no
     * query. The repository applies the same rule in SQL.
     */
    public function isLive(CarbonInterface $now): bool
    {
        if (! in_array($this->status, [PageStatus::Published, PageStatus::Scheduled], true)) {
            return false;
        }

        $publishAt = $this->publishAt();

        return $publishAt === null || $publishAt->lessThanOrEqualTo($now);
    }

    /**
     * The translation for one locale. Needs the `translations` relation loaded.
     * Never falls back to another locale: a missing translation means the page
     * does not exist in that locale.
     */
    public function translationFor(string $locale): ?PageTranslation
    {
        return $this->translations->firstWhere('locale', $locale);
    }

    /**
     * @return BelongsTo<self, $this>
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    /**
     * @return HasMany<self, $this>
     */
    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    /**
     * @return HasMany<PageTranslation, $this>
     */
    public function translations(): HasMany
    {
        return $this->hasMany(PageTranslation::class);
    }
}
